import React from 'react'
import {
    View,
    Pressable,
    ActivityIndicator,
    Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import {
    DownloadIconCell,
    type DownloadIconVariant,
} from '@/components/chakras/DownloadIconCell'
import { VaultDownloadLine } from '@/components/chakras/VaultDownloadLine'
import { useSanctuaryTrackReady } from "@/hooks/useSanctuaryTrackReady"
import { useVaultTrackDownloadUi } from "@/hooks/useVaultTrackDownloadUi"
import {
    AUDIO_READY_RIM,
    SANCTUARY_READY_BORDER,
    SANCTUARY_IDLE_BORDER,
    SANCTUARY_READY_GLOW,
    SANCTUARY_IDLE_GLOW,
} from "@/constants/audioUi"
import type { MusicRoomTrackDef } from '@/constants/musicRoomLibrary'
import { getTuningForkHertz } from '@/hooks/useTuningForkAudio'
import { getMinutesString } from '@/utils/format'

export type MusicRoomTrackButtonProps = {
    def: MusicRoomTrackDef
    accentColor: string
    isLoading: boolean
    isConnected: boolean
    isActiveTrack: boolean
    isPlaying: boolean
    downloadedIds: Set<string>
    downloadingId: string | null
    isQueued: boolean
    localUri?: string | null
    url?: string | null
    hideDownload: boolean
    onPlay: () => void
    onDownload: () => void
}

function trackSubtitle(def: MusicRoomTrackDef): string {
    switch (def.trackKind) {
        case 'embodiment':
            return `with ${def.author} · ${getMinutesString(def.durationMs)}`
        case 'tuning_fork':
            return 'Pure frequency · Sound Healing'
        case 'head_to_heart':
            return `with ${def.author} · ${getMinutesString(def.durationMs)}`
        case 'crystal_bowl':
            return `${def.author} · ${getMinutesString(def.durationMs)}`
        default:
            return def.author
    }
}

function sectionLabel(def: MusicRoomTrackDef): string | null {
    switch (def.trackKind) {
        case 'embodiment':
            return 'Master Meditation'
        case 'tuning_fork':
            return 'Tuning Fork'
        case 'head_to_heart':
            return 'Asha Speaks'
        case 'crystal_bowl':
            return 'Crystal Bowl Sound Bath'
        default:
            return null
    }
}

/** Wide rounded 3D pill — entire row is one tap target. */
export function MusicRoomTrackButton({
    def,
    accentColor,
    isLoading,
    isConnected,
    isActiveTrack,
    isPlaying,
    downloadedIds,
    downloadingId,
    isQueued,
    localUri,
    url,
    hideDownload,
    onPlay,
    onDownload,
}: MusicRoomTrackButtonProps) {
    const label = sectionLabel(def)
    const subtitle = trackSubtitle(def)
    const hertz =
        def.trackKind === 'tuning_fork'
            ? getTuningForkHertz(def.chakra)
            : undefined
    const { vaultReady, isDownloading, percent } = useVaultTrackDownloadUi(
        def.audioId,
    )
    const isDownloaded = vaultReady || !!localUri || downloadedIds.has(def.audioId)
    const showReadyRim = vaultReady || !!isDownloaded
    const isQueuedForRow =
        !vaultReady && isQueued && !isDownloading
    const downloadVariant: DownloadIconVariant = isDownloading
        ? 'downloading'
        : isQueuedForRow
          ? 'queued'
          : isDownloaded
            ? 'downloaded'
            : 'cloud'
    const showPause = isActiveTrack && isPlaying
    const downloadDisabled =
        hideDownload ||
        isDownloading ||
        vaultReady ||
        !!localUri ||
        isQueued ||
        (!url && !hideDownload)

    return (
        <View style={{ marginBottom: 14 }}>
            {label ? (
                <AppText
                    font="cormorant-regular"
                    style={{
                        color: 'rgba(232, 201, 140, 0.72)',
                        fontSize: 12,
                        letterSpacing: 2.2,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                        marginLeft: 6,
                    }}
                >
                    {label}
                </AppText>
            ) : null}

            <Pressable
                onPress={onPlay}
                disabled={isLoading}
                style={({ pressed }) => ({
                    opacity: !isConnected ? 0.82 : pressed ? 0.94 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                })}
                accessibilityRole="button"
                accessibilityLabel={`Play ${def.title}`}
            >
                <LinearGradient
                    colors={
                        vaultReady
                            ? [
                                  'rgba(197, 224, 180, 0.14)',
                                  'rgba(255,255,255,0.08)',
                                  'rgba(0,0,0,0.18)',
                              ]
                            : [
                                  'rgba(255,255,255,0.11)',
                                  'rgba(255,255,255,0.05)',
                                  'rgba(0,0,0,0.22)',
                              ]
                    }
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                        borderRadius: 22,
                        borderWidth: vaultReady ? 2.5 : 1,
                        borderTopColor: vaultReady
                            ? SANCTUARY_READY_BORDER
                            : 'rgba(255,255,255,0.16)',
                        borderBottomColor: vaultReady
                            ? 'rgba(60,90,55,0.9)'
                            : 'rgba(0,0,0,0.35)',
                        borderLeftColor: vaultReady
                            ? SANCTUARY_READY_BORDER
                            : `${accentColor}55`,
                        borderRightColor: 'rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        shadowColor: vaultReady
                            ? SANCTUARY_READY_GLOW
                            : '#000',
                        shadowOpacity: vaultReady ? 0.35 : 0.38,
                        shadowRadius: vaultReady ? 10 : 10,
                        shadowOffset: { width: 0, height: 5 },
                        ...Platform.select({
                            ios: {},
                            android: { elevation: vaultReady ? 6 : 6 },
                        }),
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            minHeight: 78,
                        }}
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                marginRight: 14,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0,0,0,0.28)',
                                borderWidth: showReadyRim ? 2 : 1,
                                borderTopColor: showReadyRim
                                    ? AUDIO_READY_RIM
                                    : 'rgba(255,255,255,0.22)',
                                borderBottomColor: showReadyRim
                                    ? 'rgba(60,90,55,0.9)'
                                    : 'rgba(0,0,0,0.35)',
                                borderLeftColor: showReadyRim
                                    ? AUDIO_READY_RIM
                                    : 'rgba(255,255,255,0.14)',
                                borderRightColor: 'rgba(0,0,0,0.3)',
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons
                                    name={showPause ? 'pause' : 'play'}
                                    size={22}
                                    color="#fff"
                                    style={!showPause ? { marginLeft: 2 } : undefined}
                                />
                            )}
                        </View>

                        <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 4,
                                }}
                            >
                                <AppText
                                    font="cormorant-regular"
                                    numberOfLines={2}
                                    style={{
                                        color: '#ffffff',
                                        fontSize: 16,
                                        lineHeight: 21,
                                        flexShrink: 1,
                                    }}
                                >
                                    {def.title}
                                </AppText>
                                {hertz ? (
                                    <View
                                        style={{
                                            backgroundColor: `${accentColor}33`,
                                            paddingHorizontal: 8,
                                            paddingVertical: 3,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            borderColor: `${accentColor}44`,
                                        }}
                                    >
                                        <AppText
                                            font="cormorant-italic"
                                            style={{
                                                color: 'rgba(255,248,236,0.95)',
                                                fontSize: 12,
                                            }}
                                        >
                                            {hertz} Hz
                                        </AppText>
                                    </View>
                                ) : null}
                            </View>
                            <AppText
                                font="cormorant-italic"
                                numberOfLines={1}
                                style={{
                                    color: 'rgba(255,255,255,0.72)',
                                    fontSize: 13,
                                }}
                            >
                                {subtitle}
                            </AppText>
                            <VaultDownloadLine audioId={def.audioId} />
                        </View>

                        {!hideDownload ? (
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation?.()
                                    onDownload()
                                }}
                                disabled={downloadDisabled}
                                hitSlop={8}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.85 : 1,
                                })}
                            >
                                <DownloadIconCell
                                    variant={downloadVariant}
                                    downloadPercent={
                                        isDownloading ? percent : null
                                    }
                                    onPress={downloadDisabled ? undefined : onDownload}
                                    disabled={downloadDisabled}
                                />
                            </Pressable>
                        ) : null}
                    </View>
                </LinearGradient>
            </Pressable>
        </View>
    )
}
