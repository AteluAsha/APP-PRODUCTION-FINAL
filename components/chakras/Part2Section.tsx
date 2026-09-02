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
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'

const Part2Section = ({ chakra }: { chakra: Chakra }) => {
    const router = useRouter()
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
                        'rgba(232, 201, 140, 0.12)',
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
                        title="Going Within"
                    />

                    {hasSanctuaryCrystalBowl(chakra) ||
                    hasSanctuaryTuningFork(chakra) ? (
                        <TextButtonSection
                            tone="frequency"
                            heading="Sound Healing"
                            description="Specific frequencies vibrate the chakras into alignment for energetic equilibrium, well-being, and emotional healing."
                            buttonText="Path 1"
                            buttonSubText="Frequency"
                            onPress={() => {
                                addHapticFeedback(HapticStrength.Medium)
                                router.push(`/(chakras)/SoundBath?chakra=${chakra}`)
                            }}
                        />
                    ) : null}

                    <TextButtonSection
                        tone="ancestral"
                        heading="Head to Heart"
                        description="Each chakra holds one of the 7 Divine Laws of the Universe. This ancestral knowledge acts as a roadmap for identifying your authentic self."
                        buttonText="Path 2"
                        buttonSubText="Ancestral Gnosis"
                        onPress={() => {
                            addHapticFeedback(HapticStrength.Medium)
                            router.push(`/(chakras)/HeadToHeart?chakra=${chakra}`)
                        }}
                    />
                </View>
            </ImageBackground>
        </View>
    )
}

export default Part2Section
