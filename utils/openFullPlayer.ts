import { router } from 'expo-router'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'
import { saveAudioBookmark } from '@/utils/audioBookmark'
import { bookmarkPositionToPersist } from '@/src/utils/playerControls'
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
    if (Number.isFinite(positionMs) && positionMs > 0) {
        latestFullPlayerPositionMs = positionMs
    }
}

/**
 * Persist the last place, stop every healing player, then leave.
 * Overlapping close calls wait for the same stop — they must not skip it.
 */
export async function closeFullPlayerAndLeave(opts?: {
    positionMs?: number
    seekTargetMs?: number
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
        await saveAudioBookmark(trackId, pos)
        queueBridgeCueIfNeeded({
            isIntroAudio: store.prefs?.isIntroAudio === true,
            audioId: trackId,
            positionMs: pos,
            durationMs: store.metadata?.durationMs ?? 0,
            returnPath,
        })
        latestFullPlayerPositionMs = 0
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
