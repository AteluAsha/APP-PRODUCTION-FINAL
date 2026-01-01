/**
 * Hero Logo Splash Screen
 *
 * Beautiful, healing reveal of the Soul School Hero Logo on first app open.
 * Creates a gentle, meditative entrance that sets the tone for the journey.
 */

import React, { useEffect } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated'

interface SplashScreenRevealProps {
    onAnimationComplete?: () => void
}

export const SplashScreenReveal: React.FC<SplashScreenRevealProps> = ({
    onAnimationComplete,
}) => {
    const opacity = useSharedValue(0)
    const scale = useSharedValue(0.9)

    useEffect(() => {
        // Start animation immediately - no delay
        // This ensures the hero logo is the FIRST thing users see
        
        // Fade in gently
        opacity.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.ease),
        })

        // Scale up gently, hold, then fade out smoothly
        scale.value = withSequence(
            withTiming(1, {
                duration: 1000, // Gentle scale to full size
                easing: Easing.out(Easing.ease),
            }),
            // Hold the logo for presence (1.5 seconds)
            withTiming(1, {
                duration: 1500,
                easing: Easing.linear,
            }),
            // Fade out smoothly into the app
            withTiming(0, {
                duration: 800,
                easing: Easing.in(Easing.ease),
            }, () => {
                // Call completion callback when fade completes
                if (onAnimationComplete) {
                    runOnJS(onAnimationComplete)()
                }
            }),
        )
    }, [opacity, scale, onAnimationComplete])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        }
    })

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, animatedStyle]}>
                <Image
                    source={require('@/assets/images/SoulSchool_HERO_Logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 300,
        height: 150,
    },
})
