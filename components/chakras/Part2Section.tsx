import React from 'react'
import { ImageBackground, View, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import SectionHeader from './SectionHeader'
import TextButtonSection from './TextButtonSection'
import { Chakra } from '@/types/chakras/Chakra'
import {
    hasSanctuaryCrystalBowl,
    hasSanctuaryTuningFork,
} from '@/constants/sanctuaryAudioManifest'
import { FREQUENCY_HEALING_COPY } from '@/constants/chakras/ancestralBridgeContent'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'

const Part2Section = ({ chakra }: { chakra: Chakra }) => {
    const router = useRouter()
    const copy = FREQUENCY_HEALING_COPY[chakra]

    return (
        <View
            style={{
                marginTop: 32,
                borderRadius: 24,
                overflow: 'hidden',
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 16,
                    },
                    android: { elevation: 6 },
                }),
            }}
        >
            <ImageBackground
                source={require('@/assets/images/part2bg.png')}
                resizeMode="cover"
                style={{
                    paddingBottom: 28,
                    paddingTop: 28,
                    alignItems: 'center',
                }}
            >
                <LinearGradient
                    colors={[
                        'rgba(12, 10, 9, 0.55)',
                        'rgba(18, 16, 14, 0.72)',
                        'rgba(8, 6, 5, 0.82)',
                    ]}
                    locations={[0, 0.45, 1]}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
                <LinearGradient
                    colors={[
                        'rgba(168, 201, 154, 0.14)',
                        'transparent',
                        'rgba(168, 201, 154, 0.08)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />

                <View
                    style={{
                        width: '100%',
                        paddingHorizontal: 24,
                        paddingTop: 8,
                    }}
                >
                    <SectionHeader
                        variant="healing"
                        subtitle="— PART II —"
                        title="Frequency Healing"
                    />

                    {hasSanctuaryCrystalBowl(chakra) ||
                    hasSanctuaryTuningFork(chakra) ? (
                        <TextButtonSection
                            tone="frequency"
                            heading={copy.heading}
                            description={copy.description}
                            buttonText="Enter"
                            buttonSubText="Sound Bath"
                            onPress={() => {
                                addHapticFeedback(HapticStrength.Medium)
                                router.push(
                                    `/(chakras)/SoundBath?chakra=${chakra}`,
                                )
                            }}
                        />
                    ) : null}
                </View>
            </ImageBackground>
        </View>
    )
}

export default Part2Section
