/**
 * Permanent on-device vault for sanctuary AAC.
 *
 * ONLY FileSystem.documentDirectory. Never cacheDirectory — the OS
 * deletes cache when storage is low.
 *
 * A few kilobytes is never a finished meditation. Playing a partial
 * file lasts a few seconds, then the slider snaps to 0 and other
 * tracks can start. Completeness is kind + optional remote size.
 */

import * as FileSystem from 'expo-file-system'
import {
    getSanctuaryVaultTrack,
    getSanctuaryVaultTrackByFilename,
    type SanctuaryVaultKind,
} from '@/constants/sanctuaryVaultTracks'
import { isPartFilePlayable } from '@/src/utils/vaultPlayableThreshold'

const VAULT_FOLDER = 'sanctuary-audio'
const MIN_ANY_VAULT_BYTES = 32_768
const MIN_LONG_TRACK_BYTES = 1_048_576

export function getSanctuaryVaultDirectory(): string {
    const root = FileSystem.documentDirectory
    if (!root) {
        throw new Error('documentDirectory is not available')
    }
    if (root.includes('cache')) {
        throw new Error('Sanctuary vault refused a cache path')
    }
    return root.endsWith('/')
        ? `${root}${VAULT_FOLDER}/`
        : `${root}/${VAULT_FOLDER}/`
}

export function getSanctuaryVaultFileUri(filename: string): string {
    const safe = filename.replace(/^.*[/\\]/, '')
    if (!safe || safe === '.' || safe === '..') {
        throw new Error('Invalid sanctuary vault filename')
    }
    const uri = `${getSanctuaryVaultDirectory()}${safe}`
    const docs = FileSystem.documentDirectory ?? ''
    if (!uri.startsWith(docs) || uri.includes('cache')) {
        throw new Error('Sanctuary vault path escaped documentDirectory')
    }
    return uri
}

export async function ensureSanctuaryVaultDirectory(): Promise<string> {
    const dir = getSanctuaryVaultDirectory()
    const info = await FileSystem.getInfoAsync(dir)
    if (!info.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
    }
    return dir
}

export function expectedBytesSidecarUri(fileUri: string): string {
    return `${fileUri}.expected-bytes`
}

export async function writeExpectedVaultBytes(
    fileUri: string,
    bytes: number,
): Promise<void> {
    if (!(bytes > 0)) return
    try {
        const existing = await readExpectedVaultBytes(fileUri)
        const next =
            existing > 0 ? Math.min(existing, Math.floor(bytes)) : Math.floor(bytes)
        await FileSystem.writeAsStringAsync(
            expectedBytesSidecarUri(fileUri),
            String(next),
        )
    } catch {
        // sidecar is best-effort
    }
}

export async function readExpectedVaultBytes(
    fileUri: string,
): Promise<number> {
    try {
        const uri = expectedBytesSidecarUri(fileUri)
        const info = await FileSystem.getInfoAsync(uri)
        if (!info.exists) return 0
        const raw = await FileSystem.readAsStringAsync(uri)
        const n = Number(raw)
        return Number.isFinite(n) && n > 0 ? n : 0
    } catch {
        return 0
    }
}

export function minCompleteVaultBytes(kind?: SanctuaryVaultKind): number {
    if (
        kind === 'embodiment' ||
        kind === 'crystal_bowl' ||
        kind === 'head_to_heart'
    ) {
        return MIN_LONG_TRACK_BYTES
    }
    return MIN_ANY_VAULT_BYTES
}

export function isCompleteVaultFile(
    bytes: number,
    opts?: { kind?: SanctuaryVaultKind; expectedBytes?: number },
): boolean {
    if (!Number.isFinite(bytes) || bytes < minCompleteVaultBytes(opts?.kind)) {
        return false
    }
    const expected = opts?.expectedBytes ?? 0
    if (expected > 0) {
        return bytes >= Math.floor(expected * 0.97)
    }
    return true
}

export function isUsableVaultFileSize(
    bytes: number,
    kind?: SanctuaryVaultKind,
    expectedBytes?: number,
): boolean {
    return isCompleteVaultFile(bytes, { kind, expectedBytes })
}

function toPlayableFileUri(uri: string): string {
    const trimmed = uri.trim()
    if (trimmed.startsWith('file:///')) return trimmed
    if (trimmed.startsWith('file:/')) {
        const path = trimmed.slice('file:'.length).replace(/^\/+/, '/')
        return `file://${path}`
    }
    if (trimmed.startsWith('/')) return `file://${trimmed}`
    return trimmed
}

/**
 * Completed vault file, or a growing `.part` once enough bytes exist to listen
 * safely while the resumable download continues.
 */
export async function peekPlayableVaultUri(
    audioIdOrFilename: string,
    opts?: {
        downloadSpeedBps?: number
        durationMs?: number
        userRushed?: boolean
    },
): Promise<string | null> {
    const track =
        getSanctuaryVaultTrack(audioIdOrFilename) ??
        getSanctuaryVaultTrackByFilename(audioIdOrFilename)
    if (!track) return null
    try {
        const dest = getSanctuaryVaultFileUri(track.filename)
        const complete = await getVaultedFileUri(track.audioId)
        if (complete) return toPlayableFileUri(complete)

        const part = `${dest}.part`
        const info = await FileSystem.getInfoAsync(part, { size: true })
        const size = info.exists ? ((info as { size?: number }).size ?? 0) : 0
        const expected = await readExpectedVaultBytes(dest)
        if (
            size > 0 &&
            isPartFilePlayable(
                size,
                expected,
                track.kind,
                opts?.downloadSpeedBps,
                opts?.durationMs,
                { userRushed: opts?.userRushed },
            )
        ) {
            return toPlayableFileUri(part)
        }
        return null
    } catch {
        return null
    }
}

export async function getVaultedFileUri(
    audioIdOrFilename: string,
): Promise<string | null> {
    const track =
        getSanctuaryVaultTrack(audioIdOrFilename) ??
        getSanctuaryVaultTrackByFilename(audioIdOrFilename)
    if (!track) return null
    try {
        const uri = getSanctuaryVaultFileUri(track.filename)
        const info = await FileSystem.getInfoAsync(uri, { size: true })
        const size = (info as { size?: number }).size ?? 0
        const expected = await readExpectedVaultBytes(uri)
        if (
            info.exists &&
            isCompleteVaultFile(size, { kind: track.kind, expectedBytes: expected })
        ) {
            return uri
        }
        if (
            info.exists &&
            size > 0 &&
            !isCompleteVaultFile(size, { kind: track.kind, expectedBytes: expected })
        ) {
            await FileSystem.deleteAsync(uri, { idempotent: true })
        }
        return null
    } catch {
        return null
    }
}

/** True for any path inside the permanent sanctuary vault. Cache code must never delete these. */
export function isSanctuaryVaultFsPath(path: string): boolean {
    return /sanctuary-audio/i.test(path)
}

function catalogBasename(name: string): string {
    return name
        .replace(/\.resume\.json$/, '')
        .replace(/\.expected-bytes$/, '')
        .replace(/\.part$/, '')
}

/**
 * Delete vault files that are no longer in the catalog (replaced remasters).
 * Sidecars (.part, .expected-bytes, .resume.json) stay if the live filename matches.
 */
export async function sweepOrphanVaultFiles(): Promise<number> {
    const dir = await ensureSanctuaryVaultDirectory()
    let names: string[] = []
    try {
        names = await FileSystem.readDirectoryAsync(dir)
    } catch {
        return 0
    }
    let removed = 0
    for (const name of names) {
        if (getSanctuaryVaultTrackByFilename(catalogBasename(name))) {
            continue
        }
        try {
            await FileSystem.deleteAsync(`${dir}${name}`, { idempotent: true })
            removed += 1
        } catch {
            // best-effort
        }
    }
    return removed
}
