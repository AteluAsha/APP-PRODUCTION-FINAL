import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { SoftChakraBall } from '@/components/chakras/SoftChakraBall'
import { AppText } from '@/components/AppText'
import { SanctuaryFieldLayer } from '@/components/chakras/SanctuaryFieldLayer'
import { getEndOfDayBeats } from '@/constants/endOfDayPresenceCopy'
import { chakraContent } from '@/constants/chakras/content'
import { getChakraFromDay } from '@/utils/chakraMapping'
import {
    HERO_AFFIRMATION_MAX_LINES,
} from '@/constants/heroAffirmation'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

/**
 * End-of-day words-on-a-screen, same flow as the Root intro (DayPresence).
 * Completes via JS even if Reanimated's finish callback never fires (Pixel).
 */
export function BreathIntegrationScreen({
    chakraDay,
    onComplete,
}: {
    chakraDay?: number
    onComplete: () => void
}) {
    const dayIndex = chakraDay ?? 0
    const beats = useMemo(() => getEndOfDayBeats(dayIndex), [dayIndex])
    const lastIndex = beats.length - 1
    const content = chakraContent[getChakraFromDay(dayIndex)]
    const { width } = useWindowDimensions()
    const [phase, setPhase] = useState(0)
    const opacity = useSharedValue(0)
    const screenOpacity = useSharedValue(1)
    const leavingRef = useRef(false)
    const completedRef = useRef(false)
    const mountedRef = useRef(true)
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
    const phaseRef = useRef(0)
    phaseRef.current = phase
    const advancingRef = useRef(false)
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete

    const schedule = (fn: () => void, ms: number) => {
        const id = setTimeout(fn, ms)
        timeoutsRef.current.push(id)
        return id
    }

    const finish = useCallback(() => {
        if (!mountedRef.current || completedRef.current) return
        completedRef.current = true
        leavingRef.current = true
        onCompleteRef.current()
    }, [])

    const fadeOutAndComplete = useCallback(() => {
        if (leavingRef.current) return
        leavingRef.current = true
        screenOpacity.value = withTiming(
            0,
            { duration: 900, easing: Easing.inOut(Easing.ease) },
            (finished) => {
                if (finished) runOnJS(finish)()
            },
        )
        schedule(finish, 1100)
    }, [finish, screenOpacity])

    const goToPhase = useCallback((next: number) => {
        advancingRef.current = false
        setPhase(next)
    }, [])

    const releaseAdvance = useCallback(() => {
        advancingRef.current = false
    }, [])

    const advance = useCallback(() => {
        if (leavingRef.current || advancingRef.current) return
        const current = phaseRef.current
        if (current >= lastIndex) {
            fadeOutAndComplete()
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
        schedule(() => {
            if (phaseRef.current === current && !leavingRef.current) {
                goToPhase(current + 1)
            }
        }, 1000)
    }, [
        fadeOutAndComplete,
        goToPhase,
        lastIndex,
        opacity,
        releaseAdvance,
    ])

    const advanceRef = useRef(advance)
    advanceRef.current = advance

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
            leavingRef.current = true
            timeoutsRef.current.forEach(clearTimeout)
            timeoutsRef.current = []
        }
    }, [])

    useEffect(() => {
        opacity.value = 0
        opacity.value = withTiming(1, {
            duration: 1100,
            easing: Easing.out(Easing.ease),
        })
        const beat = beats[phase]
        if (!beat) return
        const t = setTimeout(() => advanceRef.current(), beat.holdMs)
        return () => clearTimeout(t)
    }, [beats, opacity, phase])

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))
    const screenStyle = useAnimatedStyle(() => ({
        opacity: screenOpacity.value,
    }))

    const beat = beats[phase]
    const ballSize = Math.min(width * 0.42, 168)

    if (!beat) return null

    return (
        <Animated.View style={[styles.root, screenStyle]} pointerEvents="box-none">
            <SanctuaryFieldLayer dayIndex={dayIndex} />
            <Pressable
                onPress={() => advanceRef.current()}
                style={styles.copyWrap}
                accessibilityLabel="Continue when you are ready"
            >
                <Animated.View style={[styles.copy, fadeStyle]}>
                    {beat.showChakra && content?.goodbye?.chakraImage ? (
                        <SoftChakraBall
                            source={content.goodbye.chakraImage}
                            size={ballSize}
                            style={{ marginBottom: 28 }}
                        />
                    ) : null}
                    <AppText
                        font="cormorant-italic"
                        numberOfLines={beat.hero ? HERO_AFFIRMATION_MAX_LINES : undefined}
                        style={beat.hero ? styles.hero : styles.line}
                    >
                        {beat.text}
                    </AppText>
                </Animated.View>
            </Pressable>
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
})
