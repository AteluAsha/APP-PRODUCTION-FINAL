import React, { useEffect } from 'react'
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated'

/**
 * One shared master period so every element loops in phase-harmonics.
 * 240s = unnoticeable seam when opacity fades at the wrap.
 */
const MASTER_LOOP_MS = 240000
const STREAM_LOOP_MS = 120000
const SHIMMER_LOOP_MS = 28000

type StarSpec = {
    startX: number
    startY: number
    size: number
    phase: number
    driftX: number
    driftY: number
    wobble: number
    glow: string
}

/**
 * Natural scatter — can drift across the full screen (over the balls).
 * Varied phases / drifts so the sky never looks grid-like.
 */
const STARS: readonly StarSpec[] = [
    { startX: 0.08, startY: 0.92, size: 1.3, phase: 0.0, driftX: 0.12, driftY: -1.05, wobble: 9, glow: 'rgba(255,255,255,0.32)' },
    { startX: 0.22, startY: 0.78, size: 0.9, phase: 0.07, driftX: -0.08, driftY: -0.95, wobble: 14, glow: 'rgba(232,201,140,0.2)' },
    { startX: 0.41, startY: 0.88, size: 1.1, phase: 0.13, driftX: 0.18, driftY: -1.1, wobble: 7, glow: 'rgba(255,255,255,0.26)' },
    { startX: 0.63, startY: 0.95, size: 0.8, phase: 0.19, driftX: -0.14, driftY: -0.88, wobble: 11, glow: 'rgba(196,168,210,0.18)' },
    { startX: 0.81, startY: 0.84, size: 1.2, phase: 0.24, driftX: 0.06, driftY: -1.02, wobble: 8, glow: 'rgba(255,248,236,0.28)' },
    { startX: 0.15, startY: 0.55, size: 1.0, phase: 0.31, driftX: 0.22, driftY: -0.92, wobble: 16, glow: 'rgba(255,255,255,0.22)' },
    { startX: 0.52, startY: 0.62, size: 0.9, phase: 0.38, driftX: -0.2, driftY: -1.08, wobble: 10, glow: 'rgba(232,201,140,0.16)' },
    { startX: 0.88, startY: 0.48, size: 1.1, phase: 0.44, driftX: -0.1, driftY: -0.98, wobble: 13, glow: 'rgba(255,255,255,0.24)' },
    { startX: 0.05, startY: 0.3, size: 0.8, phase: 0.52, driftX: 0.16, driftY: -0.9, wobble: 6, glow: 'rgba(196,168,210,0.16)' },
    { startX: 0.34, startY: 0.22, size: 1.0, phase: 0.59, driftX: -0.18, driftY: -1.0, wobble: 12, glow: 'rgba(255,248,236,0.2)' },
    { startX: 0.71, startY: 0.18, size: 0.9, phase: 0.66, driftX: 0.09, driftY: -0.94, wobble: 15, glow: 'rgba(255,255,255,0.22)' },
    { startX: 0.93, startY: 0.12, size: 1.2, phase: 0.72, driftX: -0.12, driftY: -1.06, wobble: 9, glow: 'rgba(232,201,140,0.18)' },
    { startX: 0.28, startY: 0.05, size: 0.8, phase: 0.79, driftX: 0.14, driftY: -0.86, wobble: 11, glow: 'rgba(255,255,255,0.2)' },
    { startX: 0.58, startY: 0.98, size: 1.0, phase: 0.86, driftX: -0.06, driftY: -1.12, wobble: 8, glow: 'rgba(212,165,116,0.18)' },
    { startX: 0.76, startY: 0.7, size: 0.9, phase: 0.93, driftX: 0.2, driftY: -0.96, wobble: 17, glow: 'rgba(255,255,255,0.18)' },
]

function wrap01(v: number) {
    'worklet'
    return ((v % 1) + 1) % 1
}

function SlowStar({
    loop,
    width,
    height,
    startX,
    startY,
    size,
    phase,
    driftX,
    driftY,
    wobble,
    glow,
}: {
    loop: SharedValue<number>
    width: number
    height: number
} & StarSpec) {
    const style = useAnimatedStyle(() => {
        const t = wrap01(loop.value + phase)
        // Fade at loop seam so wrap is invisible
        const seam =
            t < 0.08
                ? interpolate(t, [0, 0.08], [0, 1])
                : t > 0.92
                  ? interpolate(t, [0.92, 1], [1, 0])
                  : 1
        const twinkle =
            0.55 +
            0.45 *
                Math.pow(
                    Math.max(0, Math.sin(t * Math.PI * 2 * 1.7 + phase * 6)),
                    4,
                )
        const x =
            wrap01(startX + driftX * t + Math.sin(t * Math.PI * 2) * 0.012) *
            width
        const y =
            wrap01(startY + driftY * t) * height +
            Math.sin(t * Math.PI * 2 * 1.3) * wobble
        return {
            opacity: seam * twinkle * 0.55,
            transform: [{ translateX: x }, { translateY: y }],
        }
    })

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: size,
                    height: size,
                    borderRadius: size,
                    backgroundColor: glow,
                },
                style,
            ]}
        />
    )
}

/**
 * Soft side ribbon. Occasional shimmer pulse — never enters the center spine.
 * Opacity fades at loop ends for a seamless wrap.
 */
function SideSwirl({
    spin,
    shimmer,
    width,
    height,
    side,
    delay,
    color,
    lean,
    curve,
}: {
    spin: SharedValue<number>
    shimmer: SharedValue<number>
    width: number
    height: number
    side: 'left' | 'right'
    delay: number
    color: string
    lean: number
    curve: number
}) {
    const streamW = Math.min(width * 0.13, 52)
    const edgeInset = side === 'left' ? width * 0.015 : width * 0.985 - streamW

    const style = useAnimatedStyle(() => {
        const t = wrap01(spin.value + delay)
        const seam =
            t < 0.1
                ? interpolate(t, [0, 0.1], [0, 1])
                : t > 0.9
                  ? interpolate(t, [0.9, 1], [1, 0])
                  : 1
        // Brief soft shimmer — rare peak, not a strobe
        const shimmerPeak = Math.pow(
            Math.max(0, Math.sin(shimmer.value * Math.PI * 2 + delay * 5)),
            10,
        )
        const base = interpolate(t, [0, 0.2, 0.5, 0.8, 1], [0, 0.16, 0.2, 0.14, 0])
        const y = interpolate(t, [0, 1], [height * 1.05, -height * 0.25])
        const sway =
            Math.sin(t * Math.PI * curve) * (side === 'left' ? 16 : -16) +
            Math.sin(t * Math.PI * 3.7 + delay) * 5
        return {
            opacity: seam * (base + shimmerPeak * 0.14),
            transform: [
                { translateY: y },
                { translateX: sway },
                { rotate: `${lean}deg` },
                {
                    scaleX: interpolate(t, [0, 0.5, 1], [0.75, 1.02, 0.78]),
                },
            ],
        }
    })

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: 'absolute',
                    left: edgeInset,
                    top: 0,
                    width: streamW,
                    height: height * 0.26,
                },
                style,
            ]}
        >
            <LinearGradient
                colors={['transparent', color, 'transparent']}
                locations={[0.12, 0.5, 0.88]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
        </Animated.View>
    )
}

/** Solid black only — sits under the chakra stack. */
export function HubCosmicField() {
    return (
        <View
            pointerEvents="none"
            collapsable={false}
            style={[StyleSheet.absoluteFillObject, styles.backdrop]}
        >
            <View
                style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: '#000000' },
                ]}
            />
        </View>
    )
}

/**
 * Stars + side swirls — always BEHIND the chakra stack so presses are never blocked.
 * pointerEvents none as a second safeguard.
 */
export function HubCosmicLights() {
    const { width, height } = useWindowDimensions()
    const loop = useSharedValue(0)
    const spin = useSharedValue(0)
    const shimmer = useSharedValue(0)

    useEffect(() => {
        // Linear + long period = seamless when seam-faded at 0/1
        loop.value = withRepeat(
            withTiming(1, {
                duration: MASTER_LOOP_MS,
                easing: Easing.linear,
            }),
            -1,
            false,
        )
        spin.value = withRepeat(
            withTiming(1, {
                duration: STREAM_LOOP_MS,
                easing: Easing.linear,
            }),
            -1,
            false,
        )
        shimmer.value = withRepeat(
            withTiming(1, {
                duration: SHIMMER_LOOP_MS,
                easing: Easing.linear,
            }),
            -1,
            false,
        )
    }, [loop, shimmer, spin])

    return (
        <View
            pointerEvents="none"
            collapsable={false}
            style={[StyleSheet.absoluteFillObject, styles.lights]}
        >
            {STARS.map((star, i) => (
                <SlowStar
                    key={`star-${i}`}
                    loop={loop}
                    width={width}
                    height={height}
                    {...star}
                />
            ))}

            <SideSwirl
                spin={spin}
                shimmer={shimmer}
                width={width}
                height={height}
                side="left"
                delay={0.05}
                color="rgba(232, 201, 140, 0.14)"
                lean={-16}
                curve={1.6}
            />
            <SideSwirl
                spin={spin}
                shimmer={shimmer}
                width={width}
                height={height}
                side="right"
                delay={0.28}
                color="rgba(196, 168, 210, 0.12)"
                lean={13}
                curve={2.2}
            />
            <SideSwirl
                spin={spin}
                shimmer={shimmer}
                width={width}
                height={height}
                side="left"
                delay={0.54}
                color="rgba(255, 255, 255, 0.08)"
                lean={-8}
                curve={2.7}
            />
            <SideSwirl
                spin={spin}
                shimmer={shimmer}
                width={width}
                height={height}
                side="right"
                delay={0.77}
                color="rgba(232, 201, 140, 0.1)"
                lean={19}
                curve={1.35}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        zIndex: 0,
        ...Platform.select({
            android: { elevation: 0 },
        }),
    },
    lights: {
        zIndex: 0,
        ...Platform.select({
            android: { elevation: 0 },
        }),
    },
})
