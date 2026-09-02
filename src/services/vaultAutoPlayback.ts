import { loadBookmarkPositionMs } from '@/utils/audioBookmark'
import {
    resolvePlaybackDurationMs,
    resumePositionMs,
} from '@/src/utils/playerControls'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'
import { toAbsoluteFileUri } from '@/src/utils/crystalBowlPlayback'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import { useEmbodimentDurationCacheStore } from '@/hooks/useEmbodimentDurationCacheStore'

export type VaultPlaybackRequest = {
    audioId: string
    title: string
    author: string
    durationMs: number
    chakraColor?: string
    shouldLoop?: boolean
    isIntroAudio?: boolean
}

type PendingVaultPlayback = VaultPlaybackRequest & { registeredAt: number }

let pendingAutoPlayback: PendingVaultPlayback | null = null

export function clearVaultAutoPlayback(audioId?: string): void {
    if (!audioId || pendingAutoPlayback?.audioId === audioId) {
        pendingAutoPlayback = null
    }
}

export function registerVaultAutoPlayback(opts: VaultPlaybackRequest): void {
    pendingAutoPlayback = { ...opts, registeredAt: Date.now() }
}

export function hasPendingVaultAutoPlayback(audioId: string): boolean {
    return pendingAutoPlayback?.audioId === audioId
}

function severMusicRoomSession(): void {
    const store = useCurrentAudioStore.getState()
    if (
        store.audioOrigin === 'music-room' ||
        (store.musicRoomPlaylist != null && store.musicRoomPlaylist.length > 0)
    ) {
        store.reset()
    }
}

/** Metadata + track id only. Navigation is always playSanctuaryTrack(). */
export function applySanctuaryMetadata(opts: VaultPlaybackRequest): void {
    severMusicRoomSession()
    const store = useCurrentAudioStore.getState()
    store.setMetadata({
        durationMs: opts.durationMs,
        title: opts.title,
        author: opts.author,
    })
    store.setPrefs({
        shouldLoop: opts.shouldLoop === true,
        isIntroAudio: opts.isIntroAudio === true,
    })
    if (opts.chakraColor) store.setChakraColor(opts.chakraColor)
    store.setFullPlayerTrackId(opts.audioId)
}

export async function applySanctuarySource(
    uri: string,
    opts: VaultPlaybackRequest,
): Promise<void> {
    const bookmark = await loadBookmarkPositionMs(opts.audioId)
    const cached = useEmbodimentDurationCacheStore.getState().getDuration(
        opts.audioId,
    )
    const durationForResume = resolvePlaybackDurationMs({
        catalogDurationMs: opts.durationMs,
        fileDurationMs: cached,
        bookmarkMs: bookmark,
    })
    useCurrentAudioStore.getState().setSource(
        { uri: toAbsoluteFileUri(uri) },
        'full-player',
        {
            resumePositionMs: resumePositionMs(bookmark, durationForResume),
            fullPlayerTrackId: opts.audioId,
        },
    )
}

/**
 * Downloader crossed playable threshold — attach local uri only.
 * playSanctuaryTrack() owns navigation; never router.push from here.
 */
export function tryFulfillVaultAutoPlayback(
    audioId: string,
    uri: string,
): boolean {
    if (!pendingAutoPlayback || pendingAutoPlayback.audioId !== audioId) {
        return false
    }
    const opts = pendingAutoPlayback
    void (async () => {
        const store = useCurrentAudioStore.getState()
        if (store.fullPlayerTrackId !== audioId || !store.metadata) {
            applySanctuaryMetadata(opts)
        }
        await applySanctuarySource(uri, opts)
    })()
    return true
}

export function getPendingVaultAutoPlayback(): PendingVaultPlayback | null {
    return pendingAutoPlayback
}

/** @deprecated unused — navigation lives in playSanctuaryTrack */
export async function openReadyVaultPlayer(
    uri: string,
    opts: VaultPlaybackRequest,
): Promise<void> {
    await silenceAllAudio()
    applySanctuaryMetadata(opts)
    await applySanctuarySource(uri, opts)
}

export async function openReadyCourseEmbodimentPlayer(
    uri: string,
    opts: VaultPlaybackRequest,
): Promise<void> {
    await openReadyVaultPlayer(uri, opts)
}
