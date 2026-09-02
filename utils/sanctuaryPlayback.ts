/**
 * Unified sanctuary playback — all 28 vault tracks (course + Sound Bath rows).
 *
 * Tap → rush download → open AudioPlayer → attach source when bytes are local.
 * Audio Library (music-room) stays in musicRoomPlayback.ts.
 */

import { router } from 'expo-router'
import {
    AUDIO_READY_DELAY_MS,
    useCurrentAudioStore,
} from '@/hooks/useCurrentAudioStore'
import {
    getVaultDownloadSpeedBps,
    peekSanctuaryTrack,
    rushSanctuaryTrack,
} from '@/src/services/sanctuaryVaultDownloader'
import { peekPlayableVaultUri } from '@/src/utils/sanctuaryAudioVault'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'
import {
    applySanctuaryMetadata,
    applySanctuarySource,
    clearMusicRoomSession,
    clearVaultAutoPlayback,
    registerVaultAutoPlayback,
} from '@/src/services/vaultAutoPlayback'

export type SanctuaryPlaybackRequest =
    import('@/src/services/vaultAutoPlayback').VaultPlaybackRequest & {
        /** Course day route to return to on back (e.g. /(chakras)/root). */
        returnPath?: string
    }

async function resolvePlayableUri(
    audioId: string,
    durationMs: number,
): Promise<string | null> {
    const complete = await peekSanctuaryTrack(audioId)
    if (complete) return complete
    const speed = getVaultDownloadSpeedBps()
    return peekPlayableVaultUri(audioId, {
        downloadSpeedBps: speed,
        durationMs,
        userRushed: true,
    })
}

/** Rush + register (welcome modal — player opens on "I am ready"). */
export function prepareSanctuaryTrack(opts: SanctuaryPlaybackRequest): void {
    const { returnPath, ...vaultOpts } = opts
    if (returnPath) {
        useCurrentAudioStore.getState().setPlayerReturnPath(returnPath)
    }
    clearMusicRoomSession()
    registerVaultAutoPlayback(vaultOpts)
    rushSanctuaryTrack(vaultOpts.audioId)
}

/** Single entry: always opens AudioPlayer; source attaches when ready. */
export async function playSanctuaryTrack(
    opts: SanctuaryPlaybackRequest,
): Promise<void> {
    const { returnPath, ...vaultOpts } = opts
    if (returnPath) {
        useCurrentAudioStore.getState().setPlayerReturnPath(returnPath)
    }
    const alreadyOpen = useCurrentAudioStore.getState().isFullScreenPlayerMounted
    clearMusicRoomSession()
    registerVaultAutoPlayback(vaultOpts)
    rushSanctuaryTrack(vaultOpts.audioId)
    await silenceAllAudio()
    useCurrentAudioStore.getState().setFullScreenPlayerMounted(true)

    applySanctuaryMetadata(vaultOpts)
    const uri = await resolvePlayableUri(vaultOpts.audioId, vaultOpts.durationMs)
    if (uri) {
        clearVaultAutoPlayback(vaultOpts.audioId)
        await applySanctuarySource(uri, vaultOpts)
    }

    await new Promise<void>((resolve) => {
        setTimeout(resolve, AUDIO_READY_DELAY_MS)
    })

    if (!alreadyOpen) {
        router.push('/AudioPlayer')
    }
}
