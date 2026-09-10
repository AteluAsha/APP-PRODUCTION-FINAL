import { ActivityIndicator, View } from 'react-native'
import { AppText } from '@/components/AppText'
import { usePlayerDownloadGlitch } from '@/hooks/usePlayerDownloadGlitch'
import { useSanctuaryVaultStore } from '@/src/services/sanctuaryVaultDownloader'
import {
    formatDownloadingHeadline,
    formatVaultDownloadLine,
    stableVaultDownloadPercent,
} from '@/src/utils/vaultDownloadProgress'

export function VaultFirstLoadPanel({
    title,
    audioId,
}: {
    title?: string | null
    audioId?: string | null
    durationMs?: number
}) {
    const { showGlitch } = usePlayerDownloadGlitch(audioId, { isLoading: true })
    const downloadingAudioId = useSanctuaryVaultStore((s) => s.downloadingAudioId)
    const rushedAudioId = useSanctuaryVaultStore((s) => s.rushedAudioId)
    const trackProgress = useSanctuaryVaultStore((s) =>
        audioId ? s.progressByAudioId[audioId] : undefined,
    )
    const status = useSanctuaryVaultStore((s) => s.status)

    if (!showGlitch) {
        return null
    }

    const isThisTrack =
        !audioId ||
        downloadingAudioId === audioId ||
        rushedAudioId === audioId

    const bytesWritten = isThisTrack ? (trackProgress?.bytesWritten ?? 0) : 0
    const bytesTotal = isThisTrack ? (trackProgress?.bytesTotal ?? 0) : 0

    const percent =
        isThisTrack && audioId
            ? stableVaultDownloadPercent(audioId, bytesWritten, bytesTotal)
            : isThisTrack
              ? stableVaultDownloadPercent('__panel__', bytesWritten, bytesTotal)
              : null

    const headline = !isThisTrack
        ? 'Starting download…'
        : status === 'paused'
          ? 'Paused — resuming…'
          : formatDownloadingHeadline(
                bytesWritten,
                bytesTotal,
                audioId ?? undefined,
            )
    const line = !isThisTrack
        ? 'Preparing this track…'
        : status === 'paused'
          ? 'Keep the app open while this track finishes saving.'
          : formatVaultDownloadLine(
                bytesWritten,
                bytesTotal,
                audioId ?? undefined,
            )

    return (
        <View style={{ width: '100%', maxWidth: 340, alignItems: 'center', paddingHorizontal: 8 }}>
            {title ? (
                <AppText
                    font="instrument-regular"
                    size="lg"
                    style={{
                        marginBottom: 18,
                        color: '#ffffff',
                        textAlign: 'center',
                    }}
                >
                    {title}
                </AppText>
            ) : null}
            <AppText
                font="instrument-regular"
                size="lg"
                style={{
                    color: 'rgba(255,255,255,0.92)',
                    textAlign: 'center',
                }}
            >
                {headline}
            </AppText>
            <AppText
                font="instrument-regular"
                size="base"
                style={{
                    marginTop: 8,
                    color: 'rgba(255,248,236,0.78)',
                    textAlign: 'center',
                }}
            >
                {line}
            </AppText>
            <View
                style={{
                    marginTop: 22,
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    overflow: 'hidden',
                }}
            >
                <View
                    style={{
                        width:
                            percent != null
                                ? `${percent}%`
                                : bytesWritten > 0
                                  ? '8%'
                                  : '3%',
                        height: '100%',
                        backgroundColor: '#ffffff',
                    }}
                />
            </View>
            <ActivityIndicator
                size="small"
                color="rgba(255,255,255,0.7)"
                style={{ marginTop: 18 }}
            />
        </View>
    )
}
