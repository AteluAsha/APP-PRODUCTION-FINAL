import React, { useEffect } from 'react'
import { Pressable, StyleSheet, View, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { ANDROID_PRESS_DELAY_MS, TOUCH } from '@/constants/layout'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'

/** Warm ivory — readable on dark fields, not mint-app green. */
export const NOTES_LEAF_IVORY = '#F4EDE0'

const NOTES_LEAF_WHISPER =
    'You can keep your intimate thoughts and inspirations right here.'

type NotesLeafButtonProps = {
    onPress: () => void
    accessibilityHint?: string
    /** First Audio Player open only: one line, then never again. */
    whisperOnFirstOpen?: boolean
    whisperPlacement?: 'below' | 'above'
}

/**
 * Shared notes door. Ivory leaf, ephemeral halo, a few pulses each open.
 */
export function NotesLeafButton({
    onPress,
    accessibilityHint = 'Opens Notes Along the Way. Playback continues.',
    whisperOnFirstOpen = false,
    whisperPlacement = 'below',
}: NotesLeafButtonProps) {
    const hasSeenWhisper = useFirstLaunchStore((s) => s.hasSeenNotesLeafWhisper)
    const markWhisperSeen = useFirstLaunchStore((s) => s.markNotesLeafWhisperSeen)
    const showWhisper = whisperOnFirstOpen && !hasSeenWhisper

    const scale = useSharedValue(1)
    const halo = useSharedValue(0.22)
    const whisperOpacity = useSharedValue(showWhisper ? 0 : 0)

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.12, {
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                }),
                withTiming(1, {
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                }),
            ),
            3,
            false,
        )
        halo.value = withRepeat(
            withSequence(
                withTiming(0.42, { duration: 900, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.16, { duration: 900, easing: Easing.inOut(Easing.ease) }),
            ),
            3,
            false,
        )
    }, [halo, scale])

    useEffect(() => {
        if (!showWhisper) return
        whisperOpacity.value = withDelay(
            400,
            withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) }),
        )
        const hide = setTimeout(() => {
            whisperOpacity.value = withTiming(0, { duration: 900 })
            markWhisperSeen()
        }, 7200)
        return () => clearTimeout(hide)
    }, [markWhisperSeen, showWhisper, whisperOpacity])

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))
    const haloStyle = useAnimatedStyle(() => ({
        opacity: halo.value,
        transform: [{ scale: 1.35 + (scale.value - 1) * 0.8 }],
    }))
    const whisperStyle = useAnimatedStyle(() => ({
        opacity: whisperOpacity.value,
    }))

    const open = () => {
        addHapticFeedback(HapticStrength.Light)
        if (showWhisper) markWhisperSeen()
        onPress()
    }

    return (
        <View style={styles.wrap} pointerEvents="box-none">
            <Animated.View
                pointerEvents="none"
                style={[styles.halo, haloStyle]}
            />
            <Animated.View style={pulseStyle}>
                <Pressable
                    onPress={open}
                    delayPressIn={
                        Platform.OS === 'android'
                            ? ANDROID_PRESS_DELAY_MS
                            : undefined
                    }
                    hitSlop={TOUCH.hitSlop}
                    style={styles.button}
                    accessibilityLabel="Notes Along the Way"
                    accessibilityHint={accessibilityHint}
                >
                    <LinearGradient
                        colors={[
                            'rgba(244, 237, 224, 0.16)',
                            'rgba(196, 168, 126, 0.08)',
                            'rgba(0, 0, 0, 0.12)',
                        ]}
                        style={StyleSheet.absoluteFill}
                    />
                    <Ionicons name="leaf" size={24} color={NOTES_LEAF_IVORY} />
                </Pressable>
            </Animated.View>
            {showWhisper ? (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.whisper,
                        whisperPlacement === 'above'
                            ? styles.whisperAbove
                            : styles.whisperBelow,
                        whisperStyle,
                    ]}
                >
                    <AppText font="cormorant-italic" style={styles.whisperText}>
                        {NOTES_LEAF_WHISPER}
                    </AppText>
                </Animated.View>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    halo: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(244, 237, 224, 0.22)',
    },
    button: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(244, 237, 224, 0.28)',
    },
    whisper: {
        position: 'absolute',
        width: 196,
        paddingHorizontal: 10,
    },
    whisperBelow: {
        top: 56,
        right: 0,
    },
    whisperAbove: {
        bottom: 56,
        left: 0,
        width: 220,
    },
    whisperText: {
        color: 'rgba(244, 237, 224, 0.92)',
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'left',
        textShadowColor: 'rgba(0, 0, 0, 0.65)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
})
