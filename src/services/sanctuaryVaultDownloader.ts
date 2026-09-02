/**
 * Silent Background Vault downloader
 *
 * Permanent sanctuary audio in FileSystem.documentDirectory only.
 * Completed files are never deleted. cacheDirectory is forbidden.
 *
 * Overnight / bulk sync:
 *   - Day 1 → Day 7 queue runs whenever the app is active
 *   - While tracks remain, keep-awake prevents screen sleep so downloads continue
 *     when the seeker leaves the app open (screen lock otherwise pauses JS)
 *   - Switching away saves resume data; returning to the app resumes immediately
 *
 * Tap-to-rush:
 *   - Any tap on an incomplete track pauses the Day 1 → Day 7 queue
 *   - That track is moved to the absolute front
 *   - Once enough of the `.part` file is local, the full player auto-opens
 *   - Download continues quietly while the seeker listens
 */

import { AppState, type AppStateStatus } from 'react-native'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import * as FileSystem from 'expo-file-system'
import { create } from 'zustand'
import {
    SANCTUARY_VAULT_TRACKS,
    getSanctuaryVaultTrack,
    getSanctuaryVaultTrackByFilename,
    type SanctuaryVaultKind,
    type SanctuaryVaultTrack,
} from '@/constants/sanctuaryVaultTracks'
import {
    ensureSanctuaryVaultDirectory,
    getSanctuaryVaultFileUri,
    getVaultedFileUri,
    isUsableVaultFileSize,
    peekPlayableVaultUri,
    readExpectedVaultBytes,
    writeExpectedVaultBytes,
} from '@/src/utils/sanctuaryAudioVault'
import { tryFulfillVaultAutoPlayback, getPendingVaultAutoPlayback } from '@/src/services/vaultAutoPlayback'
import {
    buildVaultTrackProgress,
    resetStableVaultDownloadPercent,
} from '@/src/utils/vaultDownloadProgress'

const RETRY_PAUSE_MS = 8_000
const MAX_RETRY_PAUSE_MS = 60_000
const PAUSE_BUDGET_MS = 1_200
const HEAD_BUDGET_MS = 4_000
const VAULT_HEARTBEAT_MS = 20_000
const VAULT_WATCHDOG_MS = 15_000
const STALE_RUSH_LOCK_MS = 3 * 60 * 1000
const KEEP_AWAKE_TAG = 'sanctuary-vault-sync'
const DOWNLOAD_PAUSED_MESSAGE = 'Download paused — will resume'

/** Known Content-Length values so Day 1 can show 0% of 117 MB on first paint. */
const SEEDED_EXPECTED_BYTES: Record<string, number> = {
    'Day1_RootDay_MasterEmbodiment_refined_AwkeningSoul.mp3': 122_235_907,
    'Day2_SacralChakraEmbodiment_SoulSchool.mp3': 68_271_255,
    'Day4_HeartChakraEmbodiment_SoulSchool_Remastered.mp3': 67_704_671,
    'Day1_7thDivineLaw_AshaSpeaks.mp3': 13_627_168,
    'Day2_6thDivineLaw_AshaSpeaks.mp3': 11_465_466,
    'Day3_5thDivineLaw_AshaSpeaks.mp3': 17_515_216,
    'Day4_4thDivineLaw_AshaSpeaks.mp3': 16_207_096,
    'Day5_3rdDivineLaw_AshaSpeaks.mp3': 17_102_782,
    'Day6_2ndDivineLaw_AshaSpeaks.mp3': 17_809_539,
    'Day7_1stDivineLaw_AshaSpeaks.mp3': 11_307_068,
}

/** Conservative estimates until HEAD / resumable reports the real size. */
const KIND_FALLBACK_BYTES: Record<SanctuaryVaultKind, number> = {
    embodiment: 125 * 1024 * 1024,
    crystal_bowl: 130 * 1024 * 1024,
    head_to_heart: 35 * 1024 * 1024,
    tuning_fork: 12 * 1024 * 1024,
}

function expectedBytesForTrack(track: SanctuaryVaultTrack): number {
    return (
        SEEDED_EXPECTED_BYTES[track.filename] ||
        KIND_FALLBACK_BYTES[track.kind] ||
        0
    )
}

type ResumeSnapshot = {
    url: string
    fileUri: string
    resumeData?: string | null
}

type VaultDownloadStatus = 'idle' | 'downloading' | 'paused' | 'error'

type VaultStore = {
    generation: number
    downloadingAudioId: string | null
    missingCount: number
    bytesWritten: number
    bytesTotal: number
    progressByAudioId: Record<string, { bytesWritten: number; bytesTotal: number }>
    status: VaultDownloadStatus
    rushedAudioId: string | null
    showFirstLoadNotice: boolean
    notifyWhenReady: boolean
    readyIds: Record<string, boolean>
}

export const useSanctuaryVaultStore = create<VaultStore>(() => ({
    generation: 0,
    downloadingAudioId: null,
    missingCount: SANCTUARY_VAULT_TRACKS.length,
    bytesWritten: 0,
    bytesTotal: 0,
    progressByAudioId: {},
    status: 'idle',
    rushedAudioId: null,
    showFirstLoadNotice: false,
    notifyWhenReady: false,
    readyIds: {},
}))

type ResumableDownload = ReturnType<typeof FileSystem.createDownloadResumable>

const inFlight = new Map<string, Promise<string>>()
let queueRunning = false
let appStateSub: { remove: () => void } | null = null
const priorityIds: string[] = []
let rushedAudioId: string | null = null
let rushedAtMs = 0
let backgroundQueueSuspended = false
let rushPlaybackStarted = false
let activeDownload: {
    track: SanctuaryVaultTrack
    resumable: ResumableDownload
} | null = null
let lastSpeedSample = { at: 0, bytes: 0 }
let smoothedDownloadSpeedBps = 0
let networkBackoffMs = RETRY_PAUSE_MS
let isAppActive = AppState.currentState === 'active'
let vaultWatchdog: ReturnType<typeof setInterval> | null = null

async function updateVaultKeepAwake(): Promise<void> {
    const missing = useSanctuaryVaultStore.getState().missingCount
    const shouldStayAwake = missing > 0 && isAppActive
    try {
        if (shouldStayAwake) {
            await activateKeepAwakeAsync(KEEP_AWAKE_TAG)
        } else {
            deactivateKeepAwake(KEEP_AWAKE_TAG)
        }
    } catch {
        // keep-awake is best-effort (simulator / unsupported builds)
    }
}

function recoverStaleRushLock(): void {
    if (!backgroundQueueSuspended || !rushedAudioId) return
    if (rushPlaybackStarted) return
    if (rushedAtMs > 0 && Date.now() - rushedAtMs < STALE_RUSH_LOCK_MS) return
    releaseRushLock()
}

function startVaultWatchdog(): void {
    if (vaultWatchdog) return
    vaultWatchdog = setInterval(() => {
        if (!isAppActive) return
        recoverStaleRushLock()
        const { missingCount } = useSanctuaryVaultStore.getState()
        if (missingCount > 0 && !queueRunning) {
            startSanctuaryVaultSync()
        }
    }, VAULT_WATCHDOG_MS)
}

function stopVaultWatchdog(): void {
    if (!vaultWatchdog) return
    clearInterval(vaultWatchdog)
    vaultWatchdog = null
}

function resetDownloadSpeedSample(): void {
    lastSpeedSample = { at: 0, bytes: 0 }
    smoothedDownloadSpeedBps = 0
}

function updateDownloadSpeed(bytesWritten: number): number {
    const now = Date.now()
    if (lastSpeedSample.at > 0) {
        const dtSec = (now - lastSpeedSample.at) / 1000
        const deltaBytes = bytesWritten - lastSpeedSample.bytes
        if (dtSec >= 0.5 && deltaBytes > 0) {
            const instant = deltaBytes / dtSec
            smoothedDownloadSpeedBps =
                smoothedDownloadSpeedBps > 0
                    ? smoothedDownloadSpeedBps * 0.65 + instant * 0.35
                    : instant
        }
    }
    lastSpeedSample = { at: now, bytes: bytesWritten }
    return smoothedDownloadSpeedBps
}

export function getVaultDownloadSpeedBps(): number {
    return smoothedDownloadSpeedBps
}

async function maybeAutoOpenPartialPlayback(
    audioId: string,
    bytesWritten: number,
    bytesTotal: number,
): Promise<void> {
    if (rushedAudioId !== audioId) return
    const speed = updateDownloadSpeed(bytesWritten)
    const pending = getPendingVaultAutoPlayback()
    const uri = await peekPlayableVaultUri(audioId, {
        downloadSpeedBps: speed,
        durationMs: pending?.audioId === audioId ? pending.durationMs : undefined,
        userRushed: true,
    })
    if (!uri) return
    tryFulfillVaultAutoPlayback(audioId, uri)
}

function bumpToFront(audioId: string): void {
    const idx = priorityIds.indexOf(audioId)
    if (idx >= 0) priorityIds.splice(idx, 1)
    priorityIds.unshift(audioId)
}

function releaseRushLock(): void {
    rushedAudioId = null
    rushedAtMs = 0
    backgroundQueueSuspended = false
    rushPlaybackStarted = false
    useSanctuaryVaultStore.setState({
        rushedAudioId: null,
        showFirstLoadNotice: false,
        notifyWhenReady: false,
    })
}

function toFileUri(uri: string): string {
    const trimmed = uri.trim()
    if (trimmed.startsWith('file:///')) return trimmed
    if (trimmed.startsWith('file:/')) {
        const path = trimmed.slice('file:'.length).replace(/^\/+/, '/')
        return `file://${path}`
    }
    if (trimmed.startsWith('/')) return `file://${trimmed}`
    return trimmed
}

function assertDocumentDestination(uri: string): void {
    const docs = FileSystem.documentDirectory
    if (!docs) {
        throw new Error('documentDirectory is not available')
    }
    if (uri.includes('cache') || uri.includes('Caches')) {
        throw new Error('Sanctuary vault refused cacheDirectory')
    }
    if (!uri.startsWith(docs)) {
        throw new Error('Sanctuary vault destination is not documentDirectory')
    }
}

function isNetworkDisruption(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error)
    return /connection abort|software caused|ECONNRESET|ECONNABORTED|network|ETIMEDOUT|ENOTFOUND|resolve host|offline|socket|failed to connect|paused|timed out|NSURLError|unknown error/i.test(
        msg,
    )
}

function isPausedForLater(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error)
    return msg.includes(DOWNLOAD_PAUSED_MESSAGE)
}

function isTransientDownloadError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error)
    return /status=5\d\d|status=429|incomplete/i.test(msg)
}

function resolveTrack(audioIdOrFilename: string): SanctuaryVaultTrack {
    const track =
        getSanctuaryVaultTrack(audioIdOrFilename) ??
        getSanctuaryVaultTrackByFilename(audioIdOrFilename)
    if (!track) {
        throw new Error(`Unknown sanctuary track: ${audioIdOrFilename}`)
    }
    return track
}

function snapshotUriFor(partUri: string): string {
    return `${partUri}.resume.json`
}

async function readSnapshot(partUri: string): Promise<string | undefined> {
    try {
        const uri = snapshotUriFor(partUri)
        const info = await FileSystem.getInfoAsync(uri)
        if (!info.exists) return undefined
        const raw = await FileSystem.readAsStringAsync(uri)
        const parsed = JSON.parse(raw) as ResumeSnapshot
        if (parsed?.resumeData && typeof parsed.resumeData === 'string') {
            return parsed.resumeData
        }
        return undefined
    } catch {
        return undefined
    }
}

async function writeSnapshot(
    partUri: string,
    snapshot: ResumeSnapshot,
): Promise<void> {
    try {
        const uri = snapshotUriFor(partUri)
        assertDocumentDestination(uri)
        await FileSystem.writeAsStringAsync(uri, JSON.stringify(snapshot))
    } catch {
        // Snapshot is best-effort; the .part bytes are the source of truth.
    }
}

async function clearSnapshot(partUri: string): Promise<void> {
    try {
        await FileSystem.deleteAsync(snapshotUriFor(partUri), {
            idempotent: true,
        })
    } catch {
        // ignore
    }
}

function markDownloading(audioId: string | null): void {
    useSanctuaryVaultStore.setState({
        generation: useSanctuaryVaultStore.getState().generation + 1,
        downloadingAudioId: audioId,
        status: audioId ? 'downloading' : 'idle',
    })
}

function clearTrackDownloadProgress(audioId: string): void {
    resetStableVaultDownloadPercent(audioId)
    useSanctuaryVaultStore.setState((s) => {
        const { [audioId]: _removed, ...progressByAudioId } = s.progressByAudioId
        const nextDownloading =
            s.downloadingAudioId === audioId ? null : s.downloadingAudioId
        const nextRushed = s.rushedAudioId === audioId ? null : s.rushedAudioId
        return {
            progressByAudioId,
            downloadingAudioId: nextDownloading,
            rushedAudioId: nextRushed,
            ...(s.rushedAudioId === audioId
                ? { bytesWritten: 0, bytesTotal: 0 }
                : {}),
        }
    })
}

function reportDownloadProgress(
    audioId: string,
    bytesWritten: number,
    bytesTotal: number,
): void {
    const state = useSanctuaryVaultStore.getState()
    const activeRush = state.rushedAudioId ?? rushedAudioId
    const trackProgress = buildVaultTrackProgress(
        audioId,
        bytesWritten,
        bytesTotal,
        state.progressByAudioId,
    )
    const isActiveUiTrack = audioId === activeRush
    const nextDownloadingId =
        activeRush != null && audioId !== activeRush
            ? (state.downloadingAudioId ?? activeRush)
            : audioId
    useSanctuaryVaultStore.setState({
        downloadingAudioId: nextDownloadingId,
        ...(isActiveUiTrack
            ? {
                  bytesWritten: trackProgress.bytesWritten,
                  bytesTotal: trackProgress.bytesTotal,
              }
            : {}),
        progressByAudioId: {
            ...state.progressByAudioId,
            [audioId]: trackProgress,
        },
        status: 'downloading',
    })
    void maybeAutoOpenPartialPlayback(
        audioId,
        trackProgress.bytesWritten,
        trackProgress.bytesTotal,
    )
}

async function probeRemoteByteLength(url: string): Promise<number> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), HEAD_BUDGET_MS)
    try {
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
        const cl = res.headers.get('Content-Length')
        if (cl && /^\d+$/.test(cl.trim())) {
            const n = parseInt(cl, 10)
            if (n > 0) return n
        }
    } catch {
        // Progress can still use the resumable callback total.
    } finally {
        clearTimeout(timer)
    }
    return 0
}

async function refreshMissingCount(): Promise<number> {
    let missing = 0
    const readyIds: Record<string, boolean> = {}
    const newlyReady: string[] = []
    for (const track of SANCTUARY_VAULT_TRACKS) {
        const uri = await getVaultedFileUri(track.audioId)
        if (!uri) missing += 1
        else {
            readyIds[track.audioId] = true
            newlyReady.push(track.audioId)
        }
    }
    for (const id of newlyReady) {
        resetStableVaultDownloadPercent(id)
    }
    useSanctuaryVaultStore.setState((s) => {
        const progressByAudioId = { ...s.progressByAudioId }
        for (const id of newlyReady) {
            delete progressByAudioId[id]
        }
        return {
            missingCount: missing,
            readyIds,
            progressByAudioId,
            downloadingAudioId:
                s.downloadingAudioId && readyIds[s.downloadingAudioId]
                    ? null
                    : s.downloadingAudioId,
            rushedAudioId:
                s.rushedAudioId && readyIds[s.rushedAudioId]
                    ? null
                    : s.rushedAudioId,
        }
    })
    void updateVaultKeepAwake()
    return missing
}

async function persistResumableState(
    partUri: string,
    resumable: ResumableDownload,
): Promise<void> {
    try {
        const savable = resumable.savable()
        await writeSnapshot(partUri, {
            url: savable.url,
            fileUri: savable.fileUri,
            resumeData: savable.resumeData ?? null,
        })
    } catch {
        // Snapshot is best-effort; the .part bytes are the source of truth.
    }
}

async function pauseAndSaveActiveDownload(): Promise<void> {
    const active = activeDownload
    if (!active) return
    const part = `${getSanctuaryVaultFileUri(active.track.filename)}.part`
    useSanctuaryVaultStore.setState({ status: 'paused' })
    const pauseWork = (async () => {
        try {
            const savable = await active.resumable.pauseAsync()
            await writeSnapshot(part, {
                url: savable.url,
                fileUri: savable.fileUri,
                resumeData: savable.resumeData ?? null,
            })
        } catch {
            await persistResumableState(part, active.resumable)
        }
    })()
    await Promise.race([pauseWork, sleep(PAUSE_BUDGET_MS)])
}

async function commitPartToVault(
    track: SanctuaryVaultTrack,
    dest: string,
    part: string,
): Promise<string> {
    const alreadyGood = await getVaultedFileUri(track.audioId)
    if (alreadyGood) {
        return toFileUri(alreadyGood)
    }

    const destInfo = await FileSystem.getInfoAsync(dest, { size: true })
    if (destInfo.exists) {
        const destSize = (destInfo as { size?: number }).size ?? 0
        const expected = await readExpectedVaultBytes(dest)
        if (isUsableVaultFileSize(destSize, track.kind, expected)) {
            await FileSystem.deleteAsync(part, { idempotent: true })
            await clearSnapshot(part)
            return toFileUri(dest)
        }
        await FileSystem.deleteAsync(dest, { idempotent: true })
    }

    await FileSystem.moveAsync({ from: part, to: dest })
    await clearSnapshot(part)
    markDownloading(null)
    clearTrackDownloadProgress(track.audioId)
    useSanctuaryVaultStore.setState((s) => ({
        readyIds: { ...s.readyIds, [track.audioId]: true },
        generation: s.generation + 1,
    }))
    await refreshMissingCount()
    networkBackoffMs = RETRY_PAUSE_MS
    if (rushedAudioId === track.audioId) {
        useSanctuaryVaultStore.setState({ showFirstLoadNotice: false })
        if (rushPlaybackStarted) {
            releaseRushLock()
            if (!queueRunning) startSanctuaryVaultSync()
        } else {
            void sleep(8_000).then(() => {
                if (rushedAudioId === track.audioId) {
                    releaseRushLock()
                    if (!queueRunning) startSanctuaryVaultSync()
                }
            })
        }
    }
    return toFileUri(dest)
}

/**
 * Completed vault files are permanent. Partial .part files are kept across
 * Wi-Fi drops so the next attempt resumes instead of restarting.
 */
async function downloadTrackToVault(track: SanctuaryVaultTrack): Promise<string> {
    const existing = await getVaultedFileUri(track.audioId)
    if (existing) return toFileUri(existing)

    await ensureSanctuaryVaultDirectory()
    const dest = getSanctuaryVaultFileUri(track.filename)
    const part = `${dest}.part`
    assertDocumentDestination(dest)
    assertDocumentDestination(part)

    markDownloading(track.audioId)
    if (rushedAudioId === track.audioId) {
        resetDownloadSpeedSample()
    }

    const partInfo = await FileSystem.getInfoAsync(part, { size: true })
    const alreadyWritten = partInfo.exists
        ? ((partInfo as { size?: number }).size ?? 0)
        : 0
    const fallbackTotal = expectedBytesForTrack(track)
    if (fallbackTotal > 0) {
        reportDownloadProgress(track.audioId, alreadyWritten, fallbackTotal)
    } else if (alreadyWritten > 0) {
        reportDownloadProgress(track.audioId, alreadyWritten, 0)
    }
    void probeRemoteByteLength(track.url).then((probedTotal) => {
        if (probedTotal <= 0) return
        const progress =
            useSanctuaryVaultStore.getState().progressByAudioId[track.audioId]
        reportDownloadProgress(
            track.audioId,
            progress?.bytesWritten ?? alreadyWritten,
            probedTotal,
        )
    })

    const resumeData = await readSnapshot(part)
    let resumable: ResumableDownload
    resumable = FileSystem.createDownloadResumable(
        track.url,
        part,
        {},
        (progress) => {
            const state = useSanctuaryVaultStore.getState()
            if (
                state.downloadingAudioId !== track.audioId &&
                rushedAudioId !== track.audioId
            ) {
                return
            }
            reportDownloadProgress(
                track.audioId,
                progress.totalBytesWritten,
                progress.totalBytesExpectedToWrite,
            )
            if (progress.totalBytesExpectedToWrite > 0) {
                void writeExpectedVaultBytes(
                    dest,
                    progress.totalBytesExpectedToWrite,
                )
            }
        },
        resumeData,
    )
    activeDownload = { track, resumable }

    try {
        const result = await resumable.downloadAsync()
        if (!result) {
            await persistResumableState(part, resumable)
            throw new Error(DOWNLOAD_PAUSED_MESSAGE)
        }

        const status = result.status ?? 0
        if (status !== 0 && status !== 200 && status !== 206) {
            if (status === 404 || status === 403) {
                await FileSystem.deleteAsync(part, { idempotent: true })
                await clearSnapshot(part)
            } else {
                await persistResumableState(part, resumable)
            }
            throw new Error(
                `Sanctuary download failed ${track.filename} status=${status}`,
            )
        }

        const mime = (
            result.headers?.['Content-Type'] ??
            result.headers?.['content-type'] ??
            ''
        ).toLowerCase()
        if (mime.includes('text/html') || mime.includes('application/json')) {
            await FileSystem.deleteAsync(part, { idempotent: true })
            await clearSnapshot(part)
            throw new Error(`Sanctuary download was not audio: ${mime}`)
        }

        const info = await FileSystem.getInfoAsync(part, { size: true })
        const size = (info as { size?: number }).size ?? 0
        const headerLen = Number(
            result.headers?.['Content-Length'] ??
                result.headers?.['content-length'] ??
                0,
        )
        const expected =
            (Number.isFinite(headerLen) && headerLen > 0 ? headerLen : 0) ||
            (await readExpectedVaultBytes(dest))
        if (expected > 0) {
            await writeExpectedVaultBytes(dest, expected)
        }
        if (!info.exists || !isUsableVaultFileSize(size, track.kind, expected)) {
            await persistResumableState(part, resumable)
            throw new Error(
                `Sanctuary download incomplete: ${track.filename} (${size})`,
            )
        }

        return await commitPartToVault(track, dest, part)
    } catch (error) {
        if (!isPausedForLater(error)) {
            try {
                const savable = await resumable.pauseAsync()
                await writeSnapshot(part, {
                    url: savable.url,
                    fileUri: savable.fileUri,
                    resumeData: savable.resumeData ?? null,
                })
            } catch {
                await persistResumableState(part, resumable)
            }
        }
        throw error
    } finally {
        if (activeDownload?.resumable === resumable) {
            activeDownload = null
        }
    }
}

function enqueueDownload(track: SanctuaryVaultTrack): Promise<string> {
    const existing = inFlight.get(track.audioId)
    if (existing) return existing
    const promise = downloadTrackToVault(track).finally(() => {
        inFlight.delete(track.audioId)
        const s = useSanctuaryVaultStore.getState()
        if (
            s.downloadingAudioId === track.audioId &&
            s.rushedAudioId !== track.audioId
        ) {
            useSanctuaryVaultStore.setState({ downloadingAudioId: null })
        }
    })
    inFlight.set(track.audioId, promise)
    return promise
}

async function findNextMissingTrack(
    skipIds: Set<string>,
): Promise<SanctuaryVaultTrack | null> {
    for (const track of SANCTUARY_VAULT_TRACKS) {
        if (skipIds.has(track.audioId)) continue
        const uri = await getVaultedFileUri(track.audioId)
        if (!uri) return track
    }
    return null
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runSilentQueue(): Promise<void> {
    if (queueRunning) return
    queueRunning = true
    try {
        await ensureSanctuaryVaultDirectory()
        const failedThisPass = new Set<string>()
        recoverStaleRushLock()
        void updateVaultKeepAwake()
        while (true) {
            if (!isAppActive) {
                break
            }
            let next: SanctuaryVaultTrack | null = null
            if (backgroundQueueSuspended && rushedAudioId) {
                const rushedReady = await getVaultedFileUri(rushedAudioId)
                if (rushedReady) {
                    if (rushPlaybackStarted) {
                        releaseRushLock()
                        continue
                    }
                    recoverStaleRushLock()
                    if (!backgroundQueueSuspended) {
                        continue
                    }
                    await sleep(400)
                    continue
                }
                next =
                    SANCTUARY_VAULT_TRACKS.find(
                        (t) => t.audioId === rushedAudioId,
                    ) ?? null
            } else {
                const priorityId = priorityIds.shift()
                if (priorityId) {
                    next =
                        SANCTUARY_VAULT_TRACKS.find(
                            (t) => t.audioId === priorityId,
                        ) ?? null
                }
                if (!next) {
                    next = await findNextMissingTrack(failedThisPass)
                }
            }
            if (!next) {
                const missing = await refreshMissingCount()
                if (missing === 0) {
                    if (__DEV__) {
                        console.log('[sanctuaryVault] all 28 tracks stored — rechecking')
                    }
                    networkBackoffMs = RETRY_PAUSE_MS
                    // Always keep confirming while the app is open. Nothing may
                    // turn this off. Catch erased files and redownload immediately.
                    await sleep(VAULT_HEARTBEAT_MS)
                    continue
                }
                await sleep(networkBackoffMs)
                networkBackoffMs = Math.min(
                    networkBackoffMs * 2,
                    MAX_RETRY_PAUSE_MS,
                )
                failedThisPass.clear()
                continue
            }
            try {
                await enqueueDownload(next)
                failedThisPass.delete(next.audioId)
                networkBackoffMs = RETRY_PAUSE_MS
            } catch (error) {
                console.warn(
                    `[sanctuaryVault] resume later ${next.filename}:`,
                    error instanceof Error ? error.message : error,
                )
                if (!isAppActive) {
                    break
                }
                if (isPausedForLater(error)) {
                    continue
                }
                if (isNetworkDisruption(error) || isTransientDownloadError(error)) {
                    await sleep(networkBackoffMs)
                    networkBackoffMs = Math.min(
                        networkBackoffMs * 2,
                        MAX_RETRY_PAUSE_MS,
                    )
                    continue
                }
                failedThisPass.add(next.audioId)
            }
        }
    } finally {
        queueRunning = false
        const missing = useSanctuaryVaultStore.getState().missingCount
        void updateVaultKeepAwake()
        if (isAppActive && (missing > 0 || priorityIds.length > 0)) {
            void sleep(RETRY_PAUSE_MS).then(() => {
                if (isAppActive) startSanctuaryVaultSync()
            })
        }
    }
}

/** Start/resume the Day 1 → Day 7 vault. Safe to call on every open. */
export function startSanctuaryVaultSync(): void {
    void runSilentQueue().catch((error) => {
        queueRunning = false
        console.warn(
            '[sanctuaryVault] queue error, will retry:',
            error instanceof Error ? error.message : error,
        )
        void sleep(networkBackoffMs).then(() => {
            if (isAppActive) startSanctuaryVaultSync()
        })
    })
}

/**
 * Starts the vault immediately, then again whenever the app returns
 * to the foreground. Screen lock pauses JS — keep-awake runs while
 * tracks remain so leaving the app open overnight can finish the vault.
 */
export function subscribeSanctuaryVaultSync(): () => void {
    isAppActive = AppState.currentState === 'active'
    recoverStaleRushLock()
    startVaultWatchdog()
    startSanctuaryVaultSync()
    void refreshMissingCount().then((missing) => {
        if (missing > 0 && isAppActive) {
            startSanctuaryVaultSync()
        }
    })
    if (appStateSub) {
        return () => {
            stopVaultWatchdog()
            void updateVaultKeepAwake()
            appStateSub?.remove()
            appStateSub = null
        }
    }
    const sub = AppState.addEventListener(
        'change',
        (next: AppStateStatus) => {
            if (next === 'background') {
                isAppActive = false
                useSanctuaryVaultStore.setState({ status: 'paused' })
                void pauseAndSaveActiveDownload()
                void updateVaultKeepAwake()
                return
            }
            if (next === 'inactive') {
                return
            }
            if (next === 'active') {
                isAppActive = true
                recoverStaleRushLock()
                void refreshMissingCount().then(() => {
                    startSanctuaryVaultSync()
                })
            }
        },
    )
    appStateSub = sub
    return () => {
        stopVaultWatchdog()
        void updateVaultKeepAwake()
        sub.remove()
        if (appStateSub === sub) appStateSub = null
    }
}

/**
 * TAP-TO-RUSH: pause the Day 1 → Day 7 queue, bump this track to the
 * front, and give it all bandwidth. Does not wait for the file.
 */
export function rushSanctuaryTrack(audioIdOrFilename: string): void {
    let track: SanctuaryVaultTrack
    try {
        track = resolveTrack(audioIdOrFilename)
    } catch {
        return
    }
    bumpToFront(track.audioId)
    resetStableVaultDownloadPercent(track.audioId)

    // Claim rush synchronously — background queue progress must not steal UI state.
    rushedAudioId = track.audioId
    rushedAtMs = Date.now()
    rushPlaybackStarted = false
    backgroundQueueSuspended = true
    useSanctuaryVaultStore.setState({
        downloadingAudioId: track.audioId,
        rushedAudioId: track.audioId,
        showFirstLoadNotice: false,
        status: 'downloading',
    })

    void (async () => {
        const existing = await getVaultedFileUri(track.audioId)
        if (existing) {
            releaseRushLock()
            return
        }

        bumpToFront(track.audioId)
        const dest = getSanctuaryVaultFileUri(track.filename)
        const part = `${dest}.part`
        const partInfo = await FileSystem.getInfoAsync(part, { size: true })
        const partWritten = partInfo.exists
            ? ((partInfo as { size?: number }).size ?? 0)
            : 0
        const sidecar = await readExpectedVaultBytes(dest)
        const seeded = sidecar || expectedBytesForTrack(track)
        const progressWritten =
            useSanctuaryVaultStore.getState().progressByAudioId[track.audioId]
                ?.bytesWritten ?? 0
        const written = Math.max(partWritten, progressWritten)
        reportDownloadProgress(track.audioId, written, seeded)
        void probeRemoteByteLength(track.url).then((probedTotal) => {
            if (probedTotal <= 0) return
            const progress =
                useSanctuaryVaultStore.getState().progressByAudioId[
                    track.audioId
                ]
            if (!progress) return
            reportDownloadProgress(
                track.audioId,
                progress.bytesWritten,
                probedTotal,
            )
            void writeExpectedVaultBytes(dest, probedTotal)
        })
        if (activeDownload && activeDownload.track.audioId !== track.audioId) {
            await pauseAndSaveActiveDownload()
        }
        startSanctuaryVaultSync()
        void enqueueDownload(track).catch(() => {})
    })()
}

/** @deprecated use rushSanctuaryTrack */
export const requestSanctuaryTrack = rushSanctuaryTrack

/**
 * Call when the rushed track starts playing (or the player is closed
 * after it finished). Quietly resumes Day 1 → Day 7.
 */
export function notifyRushedTrackPlaying(audioId?: string | null): void {
    if (rushedAudioId && audioId && audioId !== rushedAudioId) return
    rushPlaybackStarted = true
    void (async () => {
        if (rushedAudioId) {
            const uri = await getVaultedFileUri(rushedAudioId)
            if (!uri && rushedAudioId === audioId) {
                return
            }
        }
        releaseRushLock()
        if (!queueRunning) startSanctuaryVaultSync()
    })()
}

export function resumeBackgroundVaultSync(): void {
    notifyRushedTrackPlaying(rushedAudioId)
}

/**
 * Local file:/// if already vaulted. If missing, this track jumps the
 * queue and we wait until it is stored. Network drops retry until the
 * file is complete. Never returns a remote HTTP URL.
 */
export async function ensureSanctuaryTrack(
    audioIdOrFilename: string,
): Promise<string> {
    const track = resolveTrack(audioIdOrFilename)
    for (;;) {
        const existing = await getVaultedFileUri(track.audioId)
        if (existing) return toFileUri(existing)

        rushSanctuaryTrack(track.audioId)
        try {
            return await enqueueDownload(track)
        } catch (error) {
            console.warn(
                `[sanctuaryVault] waiting to resume ${track.filename}:`,
                error instanceof Error ? error.message : error,
            )
            await sleep(networkBackoffMs)
            networkBackoffMs = Math.min(
                networkBackoffMs * 2,
                MAX_RETRY_PAUSE_MS,
            )
        }
    }
}

export async function peekSanctuaryTrack(
    audioIdOrFilename: string,
): Promise<string | null> {
    try {
        const uri = await getVaultedFileUri(audioIdOrFilename)
        return uri ? toFileUri(uri) : null
    } catch {
        return null
    }
}
