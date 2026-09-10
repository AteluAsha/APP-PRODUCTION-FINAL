/**
 * Full-player save cue while a sanctuary `.part` is still arriving.
 * Native playback can stall on the first snapshot; this tells the listener why.
 */

import { View } from 'react-native'
import { AppText } from '@/components/AppText'
import { getSanctuaryVaultTrack } from '@/constants/sanctuaryVaultTracks'
import { useSanctuaryVaultStore } from '@/src/services/sanctuaryVaultDownloader'
import {
    formatDownloadingHeadline,
    formatVaultDownloadLine,
    stableVaultDownloadPercent,
} from '@/src/utils/vaultDownloadProgress'

export function PlayerVaultSaveCue({
    audioId,
    visible,
}: {
    audioId?: string | null
    visible: boolean
}) {
    const fullyStored = useSanctuaryVaultStore((s) =>
        audioId ? s.readyIds[audioId] === true : false,
    )
    const downloadingAudioId = useSanctuaryVaultStore((s) => s.downloadingAudioId)
    const rushedAudioId = useSanctuaryVaultStore((s) => s.rushedAudioId)
    const vaultStatus = useSanctuaryVaultStore((s) => s.status)
    const trackProgress = useSanctuaryVaultStore((s) =>
        audioId ? s.progressByAudioId[audioId] : undefined,
    )

    if (
        !visible ||
        !audioId ||
        fullyStored ||
        !getSanctuaryVaultTrack(audioId)
    ) {
        return null
    }

    const bytesWritten = trackProgress?.bytesWritten ?? 0
    const bytesTotal = trackProgress?.bytesTotal ?? 0
    const isThisTrack =
        downloadingAudioId === audioId || rushedAudioId === audioId
    const barPercent = stableVaultDownloadPercent(
        audioId,
        bytesWritten,
        bytesTotal,
    )
    const line = formatVaultDownloadLine(bytesWritten, bytesTotal, audioId)
    const headline =
        vaultStatus === 'paused'
            ? 'Download paused. Keep the app open to save the rest.'
            : vaultStatus === 'error'
              ? "Can't reach the download. Check your connection."
              : isThisTrack
                ? formatDownloadingHeadline(bytesWritten, bytesTotal, audioId).replace(
                      'Downloading…',
                      'Saving the rest of this track…',
                  )
                : 'Not downloading right now. Check your connection, then stay on this page.'

    return (
        <View
            style={{
                width: '100%',
                maxWidth: 320,
                marginTop: 16,
                alignItems: 'center',
            }}
        >
            <AppText
                font="instrument-regular"
                size="base"
                style={{
                    color: 'rgba(255,255,255,0.88)',
                    textAlign: 'center',
                }}
            >
                {headline}
            </AppText>
            <AppText
                font="instrument-regular"
                size="sm"
                style={{
                    marginTop: 6,
                    color: 'rgba(255,248,236,0.72)',
                    textAlign: 'center',
                }}
            >
                {line}
            </AppText>
            <View
                style={{
                    marginTop: 12,
                    width: '100%',
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    overflow: 'hidden',
                }}
            >
                <View
                    style={{
                        width:
                            barPercent != null
                                ? `${barPercent}%`
                                : bytesWritten > 0
                                  ? '8%'
                                  : '3%',
                        height: '100%',
                        backgroundColor: 'rgba(255,248,236,0.92)',
                    }}
                />
            </View>
        </View>
    )
}
