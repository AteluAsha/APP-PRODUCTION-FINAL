import { router } from 'expo-router'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import { useEmbodimentDurationCacheStore } from '@/hooks/useEmbodimentDurationCacheStore'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'
import { persistResumeBookmark } from '@/utils/audioBookmark'
import {
    bookmarkPositionToPersist,
    sliderDurationMs,
} from '@/src/utils/playerControls'
import { clearVaultAutoPlayback } from '@/src/services/vaultAutoPlayback'
import { queueBridgeCueIfNeeded } from '@/utils/bridgeCue'

export type { VaultPlaybackRequest } from '@/src/services/vaultAutoPlayback'

export {
    registerVaultAutoPlayback,
    hasPendingVaultAutoPlayback,
    tryFulfillVaultAutoPlayback,
} from '@/src/services/vaultAutoPlayback'
export { clearVaultAutoPlayback }

export function isAudioPlayerPath(pathname?: string | null): boolean {
    return Boolean(pathname && pathname.includes('AudioPlayer'))
}

let fullPlayerClosing = false
let closeInFlight: Promise<void> | null = null
let latestFullPlayerPositionMs = 0
let latestFullPlayerListenCompleted = false

export function isClosingFullPlayer(): boolean {
    return fullPlayerClosing || closeInFlight != null
}

function leavePlayerScreen(returnPath: string | null): void {
    if (router.canGoBack()) {
        router.back()
        return
    }
    if (returnPath) {
        router.replace(returnPath as never)
        return
    }
    router.replace('/(chakras)/ChakraHub')
}

export function reportFullPlayerPosition(positionMs: number): void {
    if (!Number.isFinite(positionMs) || positionMs < 0) return
    latestFullPlayerPositionMs = positionMs
}

export function reportFullPlayerListenCompleted(completed: boolean): void {
    latestFullPlayerListenCompleted = completed
}

/**
 * Persist the last place, stop every healing player, then leave.
 * Overlapping close calls wait for the same stop — they must not skip it.
 */
export async function closeFullPlayerAndLeave(opts?: {
    positionMs?: number
    seekTargetMs?: number
    durationMs?: number
    listenCompleted?: boolean
    navigate?: boolean
}): Promise<void> {
    if (closeInFlight) {
        await closeInFlight
        return
    }
    fullPlayerClosing = true
    closeInFlight = (async () => {
        const store = useCurrentAudioStore.getState()
        const returnPath = store.playerReturnPath
        const pos = bookmarkPositionToPersist({
            lastPlaybackMs: Math.max(
                opts?.positionMs ?? 0,
                latestFullPlayerPositionMs,
            ),
            storeMs: store.positionMs,
            seekTargetMs: opts?.seekTargetMs,
        })
        const trackId =
            store.fullPlayerTrackId ??
            store.musicRoomPlaylist?.[store.musicRoomIndex]?.audioId
        const cached =
            trackId != null
                ? (useEmbodimentDurationCacheStore.getState().getDuration(
                      trackId,
                  ) ?? 0)
                : 0
        const catalog = store.metadata?.durationMs ?? 0
        const duration = sliderDurationMs(
            Math.max(opts?.durationMs ?? 0, cached),
            catalog,
        )
        const listenCompleted =
            opts?.listenCompleted === true || latestFullPlayerListenCompleted
        await persistResumeBookmark(trackId, pos, duration, {
            listenCompleted,
        })
        queueBridgeCueIfNeeded({
            isIntroAudio: store.prefs?.isIntroAudio === true,
            audioId: trackId,
            positionMs:
                listenCompleted && duration > 0 ? duration : pos,
            durationMs: duration > 0 ? duration : catalog,
            returnPath,
        })
        latestFullPlayerPositionMs = 0
        latestFullPlayerListenCompleted = false
        clearVaultAutoPlayback(trackId ?? undefined)
        await silenceAllAudio()
        useCurrentAudioStore.getState().reset()
        useCurrentAudioStore.getState().setFullScreenPlayerMounted(false)
        if (opts?.navigate === false) return
        leavePlayerScreen(returnPath)
    })().finally(() => {
        closeInFlight = null
        fullPlayerClosing = false
    })
    await closeInFlight
}
