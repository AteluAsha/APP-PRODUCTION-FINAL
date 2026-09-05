/**
 * Post-splash sanctuary gate.
 * First screen: a healing invitation into Awakening, Divine Gnosis,
 * Master Reiki Embodiment, and ancestral wisdom.
 *
 * Single-screen composition (all Apple sizes): splash already showed the
 * Soul School hero, so this gate is invitation + enter CTA only. The CTA
 * is pinned in the footer so it cannot fall below the fold. Content above
 * the footer is sized to fit SE through Pro Max without scrolling; ScrollView
 * stays enabled only as a fallback for Dynamic Type / odd viewports.
 */

import React from 'react'
import {
    View,
    ScrollView,
    Pressable,
    Image,
    StyleSheet,
    Platform,
    useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { WELLNESS_GATE_FIELD } from '@/constants/sanctuaryFields'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { requestChakraHubRevealBreath } from '@/utils/homeSessionEntrance'

/** Portrait point-heights: SE 667, mini 812, standard 844–874, Plus/Max 926–956, iPad 1024+. */
function gateMetrics(windowHeight: number, windowWidth: number) {
    const isCompact = windowHeight < 720
    const isShort = windowHeight < 860
    const isTablet = windowWidth >= 768
    return {
        isCompact,
        isShort,
        isTablet,
        veilPadV: isCompact ? 18 : isShort ? 24 : 28,
        veilPadH: isCompact ? 16 : 22,
        titleSize: isCompact ? 24 : 26,
        titleLine: isCompact ? 30 : 34,
        courseSize: isCompact ? 22 : 24,
        courseLine: isCompact ? 28 : 32,
        mapSize: isCompact ? 18 : 20,
        mapLine: isCompact ? 24 : 28,
        bodySize: isCompact ? 14 : 15,
        bodyLine: isCompact ? 22 : 26,
        closingSize: isCompact ? 16 : 18,
        closingLine: isCompact ? 24 : 28,
        blockGap: isCompact ? 12 : 16,
    }
}

export default function WellnessGate() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { height: windowHeight, width: windowWidth } = useWindowDimensions()
    const startMasterTeachings = useFirstLaunchStore((s) => s.startMasterTeachings)
    const metrics = gateMetrics(windowHeight, windowWidth)

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
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scroll,
                    {
                        paddingTop: Math.max(insets.top, 12) + (metrics.isCompact ? 8 : 16),
                        paddingBottom: 12,
                        justifyContent: 'center',
                    },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                alwaysBounceVertical={false}
            >
                <View
                    style={[
                        styles.veil,
                        {
                            paddingVertical: metrics.veilPadV,
                            paddingHorizontal: metrics.veilPadH,
                            maxWidth: metrics.isTablet ? 440 : 400,
                        },
                    ]}
                    pointerEvents="box-none"
                >
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
                    <AppText
                        font="cormorant-italic"
                        style={styles.kicker}
                        maxFontSizeMultiplier={1.15}
                    >
                        Welcome to
                    </AppText>
                    <AppText
                        font="cormorant-italic"
                        maxFontSizeMultiplier={1.15}
                        style={[
                            styles.title,
                            {
                                fontSize: metrics.titleSize,
                                lineHeight: metrics.titleLine,
                                marginBottom: metrics.isCompact ? 12 : 16,
                            },
                        ]}
                    >
                        the Sanctuary of Soul
                    </AppText>
                    <View
                        style={[
                            styles.goldLine,
                            { marginBottom: metrics.isCompact ? 14 : 20 },
                        ]}
                    />
                    <View
                        style={[
                            styles.courseRow,
                            { marginBottom: metrics.isCompact ? 6 : 10 },
                        ]}
                    >
                        <AppText
                            font="instrument-regular"
                            style={styles.courseLabel}
                            maxFontSizeMultiplier={1.15}
                        >
                            Course:{' '}
                        </AppText>
                        <AppText
                            font="cormorant-italic"
                            maxFontSizeMultiplier={1.15}
                            style={[
                                styles.courseHero,
                                {
                                    fontSize: metrics.courseSize,
                                    lineHeight: metrics.courseLine,
                                },
                            ]}
                        >
                            7 Divine Chakras.
                        </AppText>
                    </View>
                    <AppText
                        font="cormorant-italic"
                        maxFontSizeMultiplier={1.15}
                        style={[
                            styles.mapHero,
                            {
                                fontSize: metrics.mapSize,
                                lineHeight: metrics.mapLine,
                                marginBottom: metrics.isCompact ? 14 : 18,
                            },
                        ]}
                    >
                        A Sacred map from Self to Soul.
                    </AppText>
                    <AppText
                        font="instrument-regular"
                        maxFontSizeMultiplier={1.15}
                        style={[
                            styles.lineage,
                            { marginBottom: metrics.isCompact ? 6 : 8 },
                        ]}
                    >
                        Reiki Level: Master Teacher Embodiment
                    </AppText>
                    <AppText
                        font="cormorant-italic"
                        maxFontSizeMultiplier={1.15}
                        style={[
                            styles.wisdom,
                            { marginBottom: metrics.isCompact ? 14 : 18 },
                        ]}
                    >
                        (5,000+ years of Ancestral Wisdom and Cosmic Truths)
                    </AppText>
                    <AppText
                        font="instrument-regular"
                        maxFontSizeMultiplier={1.15}
                        style={[
                            styles.body,
                            {
                                fontSize: metrics.bodySize,
                                lineHeight: metrics.bodyLine,
                                marginBottom: metrics.blockGap,
                            },
                        ]}
                    >
                        Your Seven Chakras open a profound healing journey to
                        Divine Gnosis and Higher Awareness. This is high level
                        work: deeply healing, and wisely transformational.
                    </AppText>
                    <AppText
                        font="cormorant-italic"
                        maxFontSizeMultiplier={1.15}
                        style={[
                            styles.gentle,
                            { marginBottom: metrics.isCompact ? 10 : 14 },
                        ]}
                    >
                        All held in gentleness.
                    </AppText>
                    <AppText
                        font="cormorant-italic"
                        maxFontSizeMultiplier={1.15}
                        style={[
                            styles.closing,
                            {
                                fontSize: metrics.closingSize,
                                lineHeight: metrics.closingLine,
                            },
                        ]}
                    >
                        Awakening the Soul begins from within. We love you all.
                    </AppText>
                </View>
            </ScrollView>

            <View
                style={[
                    styles.footer,
                    { paddingBottom: Math.max(insets.bottom, 10) + 10 },
                ]}
            >
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
                            maxFontSizeMultiplier={1.15}
                        >
                            Enter the Sanctuary
                        </AppText>
                    </LinearGradient>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 28,
        alignItems: 'center',
    },
    veil: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.16)',
        backgroundColor: 'rgba(10, 8, 12, 0.18)',
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
    footer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingTop: 8,
        backgroundColor: 'transparent',
    },
    button: {
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
