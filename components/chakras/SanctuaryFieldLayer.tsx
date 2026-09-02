import { Image, StyleSheet, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getChakraColor } from '@/constants/chakras/chakraConstants'
import { getGoodbyeField } from '@/constants/sanctuaryFields'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'
import React, { useEffect } from 'react'

function hexToRgba(hex: string, alpha: number): string {
    const raw = hex.replace('#', '')
    const n = parseInt(raw, 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function LightSwirl({
    color,
    size,
    duration,
    reverse,
    offsetX,
    offsetY,
}: {
    color: string
    size: number
    duration: number
    reverse?: boolean
    offsetX: number
    offsetY: number
}) {
    const spin = useSharedValue(0)
    const pulse = useSharedValue(0.94)

    useEffect(() => {
        spin.value = withRepeat(
            withTiming(1, { duration, easing: Easing.linear }),
            -1,
            false,
        )
        pulse.value = withRepeat(
            withTiming(1.08, {
                duration: duration * 0.22,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true,
        )
    }, [duration, pulse, spin])

    const style = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${(reverse ? -1 : 1) * spin.value * 360}deg` },
            { scale: pulse.value },
        ],
    }))

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size * 0.58,
                    borderRadius: size,
                    borderWidth: 1.1,
                    borderColor: hexToRgba(color, 0.36),
                    backgroundColor: hexToRgba(color, 0.06),
                    left: offsetX,
                    top: offsetY,
                },
                style,
            ]}
        />
    )
}

/** Full-bleed sanctuary field with a slow living motion. */
export function SanctuaryFieldLayer({ dayIndex }: { dayIndex: number }) {
    const { width, height } = useWindowDimensions()
    const color = getChakraColor(dayIndex)
    const drift = useSharedValue(1)
    const swirlSize = Math.min(width * 0.96, 380)

    useEffect(() => {
        drift.value = withRepeat(
            withTiming(1.055, {
                duration: 32000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true,
        )
    }, [drift])

    const driftStyle = useAnimatedStyle(() => ({
        transform: [{ scale: drift.value }],
    }))

    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, driftStyle]}>
                <Image
                    source={getGoodbyeField(dayIndex)}
                    style={{ width, height }}
                    resizeMode="cover"
                />
            </Animated.View>
            <LinearGradient
                colors={[
                    'rgba(0,0,0,0.42)',
                    'rgba(0,0,0,0.52)',
                    'rgba(0,0,0,0.74)',
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <View
                style={{
                    position: 'absolute',
                    width: swirlSize * 1.5,
                    height: swirlSize * 1.5,
                    alignSelf: 'center',
                    top: height * 0.18,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <LightSwirl
                    color={color}
                    size={swirlSize}
                    duration={24000}
                    offsetX={-swirlSize * 0.18}
                    offsetY={-swirlSize * 0.12}
                />
                <LightSwirl
                    color={color}
                    size={swirlSize * 0.78}
                    duration={17000}
                    reverse
                    offsetX={swirlSize * 0.08}
                    offsetY={swirlSize * 0.04}
                />
                <LightSwirl
                    color="#E8C98C"
                    size={swirlSize * 0.5}
                    duration={28000}
                    offsetX={-swirlSize * 0.02}
                    offsetY={swirlSize * 0.16}
                />
            </View>
        </View>
    )
}
