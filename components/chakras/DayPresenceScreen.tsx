import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { SanctuaryFieldLayer } from '@/components/chakras/SanctuaryFieldLayer'
import {
    getDayPresenceBeats,
    I_AM_PRESENT_LABEL,
} from '@/constants/dayPresenceCopy'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

export function DayPresenceScreen({
    dayIndex,
    onPresent,
}: {
    dayIndex: number
    onPresent: () => void
}) {
    const beats = getDayPresenceBeats(dayIndex)
    const lastIndex = beats.length - 1
    const insets = useSafeAreaInsets()
    const [phase, setPhase] = useState(0)
    const [buttonReady, setButtonReady] = useState(false)
    const opacity = useSharedValue(0)
    const buttonOpacity = useSharedValue(0)
    const screenOpacity = useSharedValue(1)
    const leavingRef = useRef(false)
    const presentedRef = useRef(false)
    const phaseRef = useRef(0)
    phaseRef.current = phase
    const advancingRef = useRef(false)
    const onPresentRef = useRef(onPresent)
    onPresentRef.current = onPresent

    const showButton = useCallback(() => {
        setButtonReady(true)
        buttonOpacity.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.ease),
        })
    }, [buttonOpacity])

    const goToPhase = useCallback(
        (next: number) => {
            advancingRef.current = false
            setPhase(next)
            if (next >= lastIndex) {
                showButton()
            }
        },
        [lastIndex, showButton],
    )

    const releaseAdvance = useCallback(() => {
        advancingRef.current = false
    }, [])

    const advance = useCallback(() => {
        if (leavingRef.current || advancingRef.current) return
        const current = phaseRef.current
        if (current >= lastIndex) {
            if (!buttonReady) showButton()
            return
        }
        advancingRef.current = true
        opacity.value = withTiming(
            0,
            { duration: 780, easing: Easing.in(Easing.ease) },
            (finished) => {
                if (finished) {
                    runOnJS(goToPhase)(current + 1)
                } else {
                    runOnJS(releaseAdvance)()
                }
            },
        )
        setTimeout(() => {
            if (phaseRef.current === current && !leavingRef.current) {
                goToPhase(current + 1)
            }
        }, 1000)
    }, [buttonReady, goToPhase, lastIndex, opacity, releaseAdvance, showButton])

    useEffect(() => {
        opacity.value = 0
        opacity.value = withTiming(1, {
            duration: 1100,
            easing: Easing.out(Easing.ease),
        })
        const beat = beats[phase] ?? beats[0]
        if (!beat || phase >= lastIndex) {
            const t = setTimeout(showButton, 1100)
            return () => clearTimeout(t)
        }
        const t = setTimeout(advance, beat.holdMs)
        return () => clearTimeout(t)
    }, [advance, beats, lastIndex, opacity, phase, showButton])

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))
    const buttonStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
    }))
    const screenStyle = useAnimatedStyle(() => ({
        opacity: screenOpacity.value,
    }))

    const present = useCallback(() => {
        if (presentedRef.current) return
        presentedRef.current = true
        leavingRef.current = true
        onPresentRef.current()
    }, [])

    const leaveToCourse = useCallback(() => {
        if (leavingRef.current) return
        leavingRef.current = true
        addHapticFeedback(HapticStrength.Medium)
        screenOpacity.value = withTiming(0, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
        })
        // Navigate from the JS timer only — runOnJS from the animation
        // completion runs on the UI thread and can crash the course-day
        // mount on Android (same overlay as a hub-ball open).
        setTimeout(() => present(), 920)
    }, [present, screenOpacity])

    const beat = beats[phase] ?? beats[0]

    return (
        <Animated.View style={[styles.root, screenStyle]}>
            <SanctuaryFieldLayer dayIndex={dayIndex} />
            <Pressable
                onPress={advance}
                style={[
                    styles.copyWrap,
                    {
                        paddingTop: insets.top,
                        paddingBottom: Math.max(insets.bottom, 16) + 108,
                    },
                ]}
                accessibilityLabel="Continue when you are ready"
            >
                <Animated.View style={[styles.copy, fadeStyle]}>
                    <AppText
                        font="cormorant-italic"
                        style={beat.hero ? styles.hero : styles.line}
                    >
                        {beat.text}
                    </AppText>
                </Animated.View>
            </Pressable>
            <Animated.View
                style={[
                    styles.buttonWrap,
                    buttonStyle,
                    { bottom: Math.max(insets.bottom, 16) + 36 },
                ]}
                pointerEvents={buttonReady ? 'auto' : 'none'}
            >
                <Pressable
                    onPress={leaveToCourse}
                    style={({ pressed }) => [pressed && { opacity: 0.9 }]}
                    accessibilityLabel={I_AM_PRESENT_LABEL}
                    accessibilityRole="button"
                >
                    <LinearGradient
                        colors={[
                            'rgba(168, 201, 154, 0.9)',
                            'rgba(107, 142, 90, 0.94)',
                            'rgba(212, 165, 116, 0.55)',
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
                            {I_AM_PRESENT_LABEL}
                        </AppText>
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000000',
    },
    copyWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    copy: {
        minHeight: 160,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    line: {
        color: 'rgba(255, 248, 236, 0.88)',
        fontSize: 24,
        lineHeight: 34,
        textAlign: 'center',
        fontWeight: '400',
    },
    hero: {
        color: 'rgba(255, 248, 236, 0.92)',
        fontSize: 28,
        lineHeight: 36,
        textAlign: 'center',
        fontWeight: '400',
    },
    buttonWrap: {
        position: 'absolute',
        alignSelf: 'center',
    },
    button: {
        paddingVertical: Platform.OS === 'ios' ? 16 : 15,
        paddingHorizontal: 36,
        borderRadius: 16,
        minHeight: 52,
        minWidth: 220,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLabel: {
        color: '#ffffff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
})
