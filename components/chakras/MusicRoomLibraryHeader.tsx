import React from 'react'
import { View, Pressable, Platform } from 'react-native'
import { AppText } from '@/components/AppText'
import { DownloadIconCell } from '@/components/chakras/DownloadIconCell'
import { SANCTUARY_TRACK_COUNT } from '@/constants/sanctuaryAudioManifest'

type Props = {
    offlineCount: number
    isDownloadingAll: boolean
    downloadProgress: { current: number; total: number } | null
    downloadError: string | null
    hideDownloads: boolean
    onDownloadAll: () => void
}

export function MusicRoomLibraryHeader({
    offlineCount,
    isDownloadingAll,
    downloadProgress,
    downloadError,
    hideDownloads,
    onDownloadAll,
}: Props) {
    const isFull = offlineCount >= SANCTUARY_TRACK_COUNT
    const counterLabel = isFull
        ? `${SANCTUARY_TRACK_COUNT}/${SANCTUARY_TRACK_COUNT} Available`
        : `${offlineCount}/${SANCTUARY_TRACK_COUNT} available for offline healing`

    return (
        <View
            style={{
                paddingTop: Platform.OS === 'android' ? 52 : 48,
                paddingBottom: 20,
                paddingHorizontal: 20,
            }}
        >
            <AppText
                font="cormorant-italic"
                style={{
                    color: 'rgba(255,248,236,0.55)',
                    textAlign: 'center',
                    fontSize: 14,
                    letterSpacing: 3.2,
                    marginBottom: 10,
                }}
            >
                SANCTUARY LIBRARY
            </AppText>
            <AppText
                font="cormorant-regular"
                style={{
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: Platform.OS === 'android' ? 26 : 24,
                    letterSpacing: 1.2,
                    lineHeight: 32,
                }}
            >
                Frequency of Gnosis
            </AppText>
            <AppText
                font="cormorant-italic"
                style={{
                    color: 'rgba(255,255,255,0.72)',
                    textAlign: 'center',
                    marginTop: 10,
                    fontSize: 16,
                    lineHeight: 22,
                }}
            >
                Where sound meets soul.
            </AppText>

            {!hideDownloads ? (
                <View
                    style={{
                        marginTop: 22,
                        paddingVertical: 16,
                        paddingHorizontal: 18,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: isFull
                            ? 'rgba(122, 154, 114, 0.45)'
                            : 'rgba(232, 201, 140, 0.22)',
                        backgroundColor: isFull
                            ? 'rgba(122, 154, 114, 0.1)'
                            : 'rgba(255,255,255,0.04)',
                    }}
                >
                    <AppText
                        font="instrument-medium"
                        style={{
                            textAlign: 'center',
                            color: isFull
                                ? 'rgba(197, 224, 180, 0.95)'
                                : 'rgba(255,248,236,0.88)',
                            fontSize: 14,
                            letterSpacing: 0.3,
                            marginBottom: 12,
                        }}
                    >
                        {counterLabel}
                    </AppText>
                    {!isFull ? (
                        <Pressable
                            onPress={onDownloadAll}
                            disabled={isDownloadingAll}
                            style={({ pressed }) => ({
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                opacity: pressed ? 0.88 : 1,
                            })}
                        >
                            <DownloadIconCell
                                variant="cloud"
                                disabled={isDownloadingAll}
                                compact
                            />
                            <AppText
                                font="cormorant-italic"
                                style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: 15,
                                }}
                            >
                                {isDownloadingAll && downloadProgress
                                    ? `Downloading ${downloadProgress.current} of ${downloadProgress.total}…`
                                    : 'Download all missing tracks'}
                            </AppText>
                        </Pressable>
                    ) : (
                        <AppText
                            font="cormorant-italic"
                            style={{
                                textAlign: 'center',
                                color: 'rgba(197, 224, 180, 0.85)',
                                fontSize: 14,
                            }}
                        >
                            All healing audio is on your device.
                        </AppText>
                    )}
                    {downloadError && !isDownloadingAll ? (
                        <AppText
                            font="instrument-regular"
                            size="xs"
                            style={{
                                color: 'rgba(255,200,150,0.9)',
                                textAlign: 'center',
                                marginTop: 10,
                            }}
                        >
                            {downloadError}
                        </AppText>
                    ) : null}
                </View>
            ) : null}
        </View>
    )
}
