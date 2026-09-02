/**
 * Post-splash sanctuary gate.
 * First screen: a healing invitation into Awakening, Divine Gnosis,
 * Master Reiki Embodiment, and ancestral wisdom.
 */

import React from 'react'
import {
    View,
    ScrollView,
    Pressable,
    Image,
    StyleSheet,
    Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { SCROLL_BREATHING_BOTTOM_PADDING } from '@/constants/layout'
import { WELLNESS_GATE_FIELD } from '@/constants/sanctuaryFields'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { requestChakraHubRevealBreath } from '@/utils/homeSessionEntrance'

export default function WellnessGate() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const startMasterTeachings = useFirstLaunchStore((s) => s.startMasterTeachings)

    const handleBegin = () => {
        addHapticFeedback(HapticStrength.Medium)
        startMasterTeachings()
        requestChakraHubRevealBreath()
        router.replace('/(chakras)/ChakraHub')
    }

    return (
        <View style={styles.safe}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <Image
                    source={WELLNESS_GATE_FIELD}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={[
                        'rgba(0,0,0,0.28)',
                        'rgba(12, 8, 14, 0.42)',
                        'rgba(0,0,0,0.62)',
                    ]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>
            <ScrollView
                contentContainerStyle={[
                    styles.scroll,
                    {
                        paddingTop: Math.max(insets.top, 16) + 8,
                        paddingBottom:
                            Math.max(insets.bottom, 24) +
                            SCROLL_BREATHING_BOTTOM_PADDING,
                    },
                ]}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    source={require('@/assets/images/SoulSchool_HERO_Logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.veil} pointerEvents="box-none">
                    <LinearGradient
                        colors={[
                            'rgba(255, 248, 236, 0.06)',
                            'rgba(168, 201, 154, 0.04)',
                            'rgba(196, 168, 210, 0.05)',
                            'rgba(6, 5, 8, 0.22)',
                        ]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <AppText font="cormorant-italic" style={styles.kicker}>
                        Welcome to
                    </AppText>
                    <AppText font="cormorant-italic" style={styles.title}>
                        the Sanctuary of Soul
                    </AppText>
                    <View style={styles.goldLine} />
                    <View style={styles.courseRow}>
                        <AppText font="instrument-regular" style={styles.courseLabel}>
                            Course:{' '}
                        </AppText>
                        <AppText font="cormorant-italic" style={styles.courseHero}>
                            7 Divine Chakras.
                        </AppText>
                    </View>
                    <AppText font="cormorant-italic" style={styles.mapHero}>
                        A Sacred map from Self to Soul.
                    </AppText>
                    <AppText font="instrument-regular" style={styles.lineage}>
                        Reiki Level: Master Teacher Embodiment
                    </AppText>
                    <AppText font="cormorant-italic" style={styles.wisdom}>
                        (5,000+ years of Ancestral Wisdom and Cosmic Truths)
                    </AppText>
                    <AppText font="instrument-regular" style={styles.body}>
                        Your Seven Chakras open a profound healing journey to
                        Divine Gnosis and Higher Awareness. This is high level
                        work: deeply healing, and wisely transformational.
                    </AppText>
                    <AppText font="cormorant-italic" style={styles.gentle}>
                        All held in gentleness.
                    </AppText>
                    <AppText font="cormorant-italic" style={styles.closing}>
                        Awakening the Soul begins from within. We love you all.
                    </AppText>
                </View>

                <Pressable
                    onPress={handleBegin}
                    style={({ pressed }) => [pressed && { opacity: 0.9 }]}
                    accessibilityLabel="Enter the Sanctuary"
                    accessibilityRole="button"
                    accessibilityHint="Enter the sanctuary and begin at the Root"
                >
                    <LinearGradient
                        colors={[
                            'rgba(186, 210, 176, 0.72)',
                            'rgba(130, 158, 120, 0.78)',
                            'rgba(212, 180, 140, 0.42)',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.button}
                    >
                        <AppText
                            font="instrument-semibold"
                            size="sm"
                            style={styles.buttonLabel}
                        >
                            Enter the Sanctuary
                        </AppText>
                    </LinearGradient>
                </Pressable>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 168,
        height: 84,
        marginBottom: 24,
    },
    veil: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.16)',
        backgroundColor: 'rgba(10, 8, 12, 0.18)',
        marginBottom: 8,
        overflow: 'hidden',
    },
    kicker: {
        color: 'rgba(232, 201, 140, 0.72)',
        fontSize: 12,
        letterSpacing: 2.8,
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    title: {
        color: 'rgba(255, 248, 236, 0.9)',
        fontSize: 26,
        lineHeight: 34,
        textAlign: 'center',
        marginBottom: 18,
    },
    goldLine: {
        width: 36,
        height: 1,
        backgroundColor: 'rgba(232, 201, 140, 0.32)',
        marginBottom: 22,
    },
    courseRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    courseLabel: {
        color: 'rgba(212, 180, 150, 0.78)',
        fontSize: 12,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
    },
    courseHero: {
        color: 'rgba(186, 210, 176, 0.92)',
        fontSize: 24,
        lineHeight: 32,
        textAlign: 'center',
        textShadowColor: 'rgba(168, 201, 154, 0.22)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    mapHero: {
        color: 'rgba(232, 201, 140, 0.88)',
        fontSize: 20,
        lineHeight: 28,
        textAlign: 'center',
        marginBottom: 22,
        textShadowColor: 'rgba(212, 165, 116, 0.18)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    lineage: {
        color: 'rgba(255, 248, 236, 0.78)',
        fontSize: 15,
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 8,
    },
    wisdom: {
        color: 'rgba(212, 180, 150, 0.72)',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 22,
    },
    body: {
        color: 'rgba(255, 248, 236, 0.72)',
        fontSize: 15,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 16,
    },
    gentle: {
        color: 'rgba(196, 168, 210, 0.78)',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 18,
    },
    closing: {
        color: 'rgba(255, 248, 236, 0.88)',
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
    },
    button: {
        marginTop: 24,
        paddingVertical: Platform.OS === 'ios' ? 16 : 15,
        paddingHorizontal: 28,
        borderRadius: 20,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 240,
        borderWidth: 1,
        borderColor: 'rgba(255, 248, 236, 0.12)',
    },
    buttonLabel: {
        color: 'rgba(255, 255, 255, 0.94)',
        textAlign: 'center',
        letterSpacing: 0.4,
        textShadowColor: 'rgba(0, 0, 0, 0.28)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
})
