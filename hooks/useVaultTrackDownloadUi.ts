import { useSanctuaryVaultStore } from '@/src/services/sanctuaryVaultDownloader'
import {
    formatDownloadingHeadline,
    formatVaultCueLabel,
    stableVaultDownloadPercent,
} from '@/src/utils/vaultDownloadProgress'
import { useSanctuaryTrackReady } from '@/hooks/useSanctuaryTrackReady'

export type VaultDownloadLabelMode = 'row' | 'cue'

/**
 * Single source for sanctuary vault download UI — course days, Drop In,
 * Audio Library rows, and download rings all read the same live state.
 */
export function useVaultTrackDownloadUi(
    audioId?: string | null,
    opts?: {
        /** row = "Downloading… N%" (AudioRow / library). cue = "Queuing… N%" (Drop In). */
        labelMode?: VaultDownloadLabelMode
        idleLabel?: string
        /** When true, show progress for this track even if not the active downloader (library queue). */
        showWhenQueued?: boolean
    },
) {
    const labelMode = opts?.labelMode ?? 'row'
    const idleLabel = opts?.idleLabel ?? ''
    const vaultReady = useSanctuaryTrackReady(audioId)
    const downloadingAudioId = useSanctuaryVaultStore((s) => s.downloadingAudioId)
    const rushedAudioId = useSanctuaryVaultStore((s) => s.rushedAudioId)
    const trackProgress = useSanctuaryVaultStore((s) =>
        audioId ? s.progressByAudioId[audioId] : undefined,
    )
    const vaultStatus = useSanctuaryVaultStore((s) => s.status)

    const isActiveTrack =
        !!audioId &&
        (downloadingAudioId === audioId || rushedAudioId === audioId)

    const bytesWritten = trackProgress?.bytesWritten ?? 0
    const bytesTotal = trackProgress?.bytesTotal ?? 0

    const percent =
        audioId && (isActiveTrack || vaultReady)
            ? stableVaultDownloadPercent(audioId, bytesWritten, bytesTotal)
            : null

    const progressLabel =
        vaultReady || !audioId
            ? null
            : isActiveTrack
              ? labelMode === 'cue'
                  ? formatVaultCueLabel({
                        isThisTrack: true,
                        status: vaultStatus,
                        bytesWritten,
                        bytesTotal,
                        idle: idleLabel,
                        audioId,
                    })
                  : vaultStatus === 'paused'
                    ? 'Paused — resuming…'
                    : formatDownloadingHeadline(bytesWritten, bytesTotal, audioId)
              : null

    const showProgressLine =
        !vaultReady && !!progressLabel && (isActiveTrack || opts?.showWhenQueued)

    return {
        vaultReady,
        isActiveTrack,
        isDownloading: isActiveTrack && !vaultReady,
        bytesWritten,
        bytesTotal,
        percent: vaultReady ? 100 : percent,
        progressLabel,
        showProgressLine,
        vaultStatus,
    }
}
