import React from 'react'
import { View, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { Chakra } from '@/types/chakras/Chakra'
import {
    MusicRoomTrackButton,
    type MusicRoomTrackButtonProps,
} from '@/components/chakras/MusicRoomTrackButton'
import { getTuningForkHertz } from '@/hooks/useTuningForkAudio'

export type MusicRoomRowProps = Omit<
    MusicRoomTrackButtonProps,
    'accentColor'
>

type DaySectionProps = {
    chakra: Chakra
    chakraName: string
    dayIndex: number
    accentColor: string
    heroLine: string
    keywords: string
    clears: string
    brings: string
    trackRows: MusicRoomRowProps[]
}

export function MusicRoomDaySection({
    chakra,
    chakraName,
    dayIndex,
    accentColor,
    heroLine,
    keywords,
    clears,
    brings,
    trackRows,
}: DaySectionProps) {
    const hz = getTuningForkHertz(chakra)

    return (
        <View
            style={{
                marginBottom: 40,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(232, 201, 140, 0.18)',
                backgroundColor: 'rgba(8, 6, 5, 0.55)',
                overflow: 'hidden',
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.32,
                        shadowRadius: 14,
                    },
                    android: { elevation: 5 },
                }),
            }}
        >
            <LinearGradient
                colors={[
                    `${accentColor}55`,
                    `${accentColor}22`,
                    'rgba(0,0,0,0)',
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(232, 201, 140, 0.12)',
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                    }}
                >
                    <AppText
                        font="cormorant-regular"
                        style={{
                            color: 'rgba(255,248,236,0.95)',
                            fontSize: Platform.OS === 'android' ? 20 : 19,
                            letterSpacing: 0.5,
                        }}
                    >
                        Day {dayIndex + 1} · {chakraName}
                    </AppText>
                    <AppText
                        font="cormorant-italic"
                        style={{
                            color: 'rgba(232, 201, 140, 0.92)',
                            fontSize: Platform.OS === 'android' ? 30 : 28,
                            letterSpacing: 1,
                        }}
                    >
                        {hz} Hz
                    </AppText>
                </View>
            </LinearGradient>

            <View
                style={{
                    paddingHorizontal: 18,
                    paddingTop: 20,
                    paddingBottom: 8,
                }}
            >
                <AppText
                    font="cormorant-italic"
                    style={{
                        fontSize: Platform.OS === 'android' ? 22 : 21,
                        color: 'rgba(255,248,236,0.96)',
                        textAlign: 'center',
                        lineHeight: 30,
                        marginBottom: 12,
                        letterSpacing: 0.4,
                    }}
                >
                    {heroLine}
                </AppText>
                <AppText
                    font="instrument-medium"
                    style={{
                        fontSize: Platform.OS === 'android' ? 16 : 15,
                        color: 'rgba(232, 201, 140, 0.9)',
                        textAlign: 'center',
                        lineHeight: 24,
                        marginBottom: 14,
                        letterSpacing: 0.6,
                    }}
                >
                    {keywords}
                </AppText>
                <AppText
                    font="cormorant-italic"
                    style={{
                        fontSize: Platform.OS === 'android' ? 14 : 13,
                        color: 'rgba(255,248,236,0.72)',
                        textAlign: 'center',
                        lineHeight: Platform.OS === 'android' ? 22 : 20,
                        marginBottom: 22,
                    }}
                >
                    Clears: {clears}
                    {'\n'}
                    Brings in: {brings}
                </AppText>
                {trackRows.map((row) => (
                    <MusicRoomTrackButton
                        key={row.def.audioId}
                        accentColor={accentColor}
                        {...row}
                    />
                ))}
            </View>
        </View>
    )
}
