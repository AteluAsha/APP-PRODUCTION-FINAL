/**
 * Soft headset reminder on the full player. Not wired to any track.
 *
 * Phone / Bluetooth route detection is not used: Expo has no reliable
 * cross-platform "headphones connected" signal, and car / watch / A2DP
 * false reads would hide or flash the icon. Show once per player open,
 * then fade.
 */

import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

const SHOW_MS = 60_000
const FADE_IN_MS = 700
const FADE_OUT_MS = 1200

export function HeadsetListenReminder() {
    const opacity = useSharedValue(0)

    useEffect(() => {
        opacity.value = withTiming(0.55, { duration: FADE_IN_MS })
        const hide = setTimeout(() => {
            opacity.value = withTiming(0, { duration: FADE_OUT_MS })
        }, SHOW_MS)
        return () => {
            clearTimeout(hide)
        }
    }, [opacity])

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))

    return (
        <Animated.View
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={[styles.wrap, style]}
        >
            <Ionicons name="headset" size={30} color="#FFFFFF" />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        top: '18%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 4,
    },
})
