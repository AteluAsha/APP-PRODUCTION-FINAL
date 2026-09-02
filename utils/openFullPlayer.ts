import { router } from 'expo-router'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'
import { saveAudioBookmark } from '@/utils/audioBookmark'
import { bookmarkPositionToPersist } from '@/src/utils/playerControls'
import { clearVaultAutoPlayback } from '@/src/services/vaultAutoPlayback'

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
let latestFullPlayerPositionMs = 0

export function isClosingFullPlayer(): boolean {
    return fullPlayerClosing
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
 * Stop healing audio, keep the last place, then leave the player.
 * Android hardware back must use this — popping the screen alone
 * leaves expo-audio running under the course day.
 */
export async function closeFullPlayerAndLeave(opts?: {
    positionMs?: number
    seekTargetMs?: number
    navigate?: boolean
}): Promise<void> {
    if (fullPlayerClosing) return
    fullPlayerClosing = true
    try {
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
        await saveAudioBookmark(store.fullPlayerTrackId, pos)
        latestFullPlayerPositionMs = 0
        clearVaultAutoPlayback(store.fullPlayerTrackId ?? undefined)
        await silenceAllAudio()
        store.reset()
        if (opts?.navigate === false) return
        leavePlayerScreen(returnPath)
    } finally {
        setTimeout(() => {
            fullPlayerClosing = false
        }, 800)
    }
}
