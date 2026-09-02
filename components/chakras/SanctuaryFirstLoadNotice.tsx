import { View, Platform } from 'react-native'
import { AppText } from '@/components/AppText'
import { useSanctuaryVaultStore } from '@/src/services/sanctuaryVaultDownloader'
import {
    FIRST_LOAD_NOTICE_COPY,
    FIRST_TRACK_WAIT_COPY,
    formatVaultDownloadLine,
    stableVaultDownloadPercent,
} from '@/src/utils/vaultDownloadProgress'

/** Elegant first-load note shown only while a tap-to-rush download is in flight. */
export function SanctuaryFirstLoadNotice() {
    const visible = useSanctuaryVaultStore((s) => s.showFirstLoadNotice)
    const rushedAudioId = useSanctuaryVaultStore((s) => s.rushedAudioId)
    const trackProgress = useSanctuaryVaultStore((s) =>
        rushedAudioId ? s.progressByAudioId[rushedAudioId] : undefined,
    )
    const status = useSanctuaryVaultStore((s) => s.status)
    if (!visible || !rushedAudioId) return null

    const bytesWritten = trackProgress?.bytesWritten ?? 0
    const bytesTotal = trackProgress?.bytesTotal ?? 0
    const percent = stableVaultDownloadPercent(
        rushedAudioId,
        bytesWritten,
        bytesTotal,
    )
    const line =
        status === 'paused'
            ? 'Paused — resuming…'
            : formatVaultDownloadLine(bytesWritten, bytesTotal, rushedAudioId)

    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: Platform.OS === 'android' ? 96 : 88,
                zIndex: 200,
                ...(Platform.OS === 'android' && { elevation: 200 }),
            }}
        >
            <View
                style={{
                    marginHorizontal: 20,
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(212, 197, 169, 0.35)',
                    backgroundColor: 'rgba(18, 16, 14, 0.88)',
                }}
            >
                <AppText
                    font="cormorant-italic"
                    size="base"
                    style={{
                        color: 'rgba(255, 248, 236, 0.92)',
                        textAlign: 'center',
                        lineHeight: 24,
                    }}
                >
                    {FIRST_LOAD_NOTICE_COPY}
                </AppText>
                <AppText
                    font="instrument-regular"
                    size="xs"
                    style={{
                        marginTop: 10,
                        color: 'rgba(232, 201, 140, 0.88)',
                        textAlign: 'center',
                        letterSpacing: 0.3,
                    }}
                >
                    {FIRST_TRACK_WAIT_COPY}
                </AppText>
                <View
                    style={{
                        marginTop: 14,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.16)',
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
                                      : '4%',
                            height: '100%',
                            backgroundColor: 'rgba(212, 197, 169, 0.95)',
                        }}
                    />
                </View>
                <AppText
                    font="instrument-regular"
                    size="xs"
                    style={{
                        marginTop: 10,
                        color: 'rgba(255,255,255,0.78)',
                        textAlign: 'center',
                        letterSpacing: 0.4,
                    }}
                >
                    {line}
                </AppText>
            </View>
        </View>
    )
}
