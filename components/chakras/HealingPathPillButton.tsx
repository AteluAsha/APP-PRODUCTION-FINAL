import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { VaultDownloadLine } from '@/components/chakras/VaultDownloadLine'
import { HealingPillTouchable } from '@/components/chakras/HealingPillTouchable'

const TONE = {
    frequency: {
        pillTop: 'rgba(255,255,255,0.14)',
        pillBottom: 'rgba(0,0,0,0.32)',
        pillLeft: 'rgba(168, 201, 154, 0.35)',
        pillColors: [
            'rgba(168, 201, 154, 0.16)',
            'rgba(255,255,255,0.06)',
            'rgba(0,0,0,0.22)',
        ] as const,
        pathColor: 'rgba(197, 224, 180, 0.92)',
    },
    ancestral: {
        pillTop: 'rgba(255,255,255,0.14)',
        pillBottom: 'rgba(0,0,0,0.32)',
        pillLeft: 'rgba(232, 201, 140, 0.38)',
        pillColors: [
            'rgba(232, 201, 140, 0.14)',
            'rgba(255,255,255,0.05)',
            'rgba(0,0,0,0.24)',
        ] as const,
        pathColor: 'rgba(232, 201, 140, 0.92)',
    },
}

export type HealingPathPillTone = keyof typeof TONE

/** Matches Part II TextButtonSection pill — used on Sound Bath frequency controls. */
export function HealingPathPillButton({
    pathLabel,
    title,
    subtitle,
    tone = 'frequency',
    onPress,
    disabled = false,
    isLoading = false,
    isPlaying = false,
    audioId,
}: {
    pathLabel: string
    title: string
    subtitle: string
    tone?: HealingPathPillTone
    onPress: () => void
    disabled?: boolean
    isLoading?: boolean
    isPlaying?: boolean
    audioId?: string
}) {
    const accent = TONE[tone]

    return (
        <HealingPillTouchable
            accent={accent}
            onPress={onPress}
            disabled={disabled || isLoading}
            accessibilityLabel={`${pathLabel}, ${title}`}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.82)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                    }}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={16}
                            color="#fff"
                            style={!isPlaying ? { marginLeft: 2 } : undefined}
                        />
                    )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText
                        font="cormorant-regular"
                        style={{
                            fontSize: 13,
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            color: accent.pathColor,
                            marginBottom: 2,
                        }}
                    >
                        {pathLabel}
                    </AppText>
                    <AppText
                        font="cormorant-italic"
                        style={{
                            fontSize: 22,
                            lineHeight: 28,
                            color: 'rgba(255, 248, 236, 0.96)',
                        }}
                    >
                        {title}
                    </AppText>
                    <AppText
                        font="instrument-italic"
                        style={{
                            marginTop: 4,
                            fontSize: 13,
                            color: 'rgba(255,255,255,0.82)',
                        }}
                        numberOfLines={2}
                    >
                        {subtitle}
                    </AppText>
                    {audioId ? (
                        <VaultDownloadLine audioId={audioId} />
                    ) : null}
                </View>
            </View>
        </HealingPillTouchable>
    )
}
