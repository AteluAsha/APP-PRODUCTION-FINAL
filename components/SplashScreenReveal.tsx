/**
 * Hero Logo Splash Screen
 *
 * Beautiful, healing reveal of the Soul School Hero Logo on first app open.
 * Creates a gentle, meditative entrance that sets the tone for the journey.
 */

import React, { useEffect, useRef } from "react"
import { View, Image, StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from "react-native-reanimated"

interface SplashScreenRevealProps {
  onAnimationComplete?: () => void
  assetsReady?: boolean // Whether critical assets have loaded
}

export const SplashScreenReveal: React.FC<SplashScreenRevealProps> = ({
  onAnimationComplete,
  assetsReady = false,
}) => {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.9)
  const breathingScale = useSharedValue(1) // Separate scale for breathing effect
  const completedRef = useRef(false)

  useEffect(() => {
    // Start animation immediately - no delay
    // This ensures the hero logo is the FIRST thing users see
    // Luxury feel: Smooth, gentle, plenty of time for flow and ease

    // Fade in gently - smooth entrance
    opacity.value = withTiming(1, {
      duration: 1500, // Longer, more luxurious fade in
      easing: Easing.out(Easing.ease),
    })

    // Initial scale up gently - subtle reveal
    scale.value = withTiming(1, {
      duration: 1500, // Gentle scale to full size - smooth entrance
      easing: Easing.out(Easing.ease),
    })

    // Gentle breathing animation - expanding and contracting
    // This creates a soft, meditative pulsing effect - luxury breathing
    // Start immediately so movement is visible right away
    breathingScale.value = withRepeat(
      withSequence(
        // Expand gently - subtle luxury movement
        withTiming(1.05, {
          // Slightly more visible expansion (5%)
          duration: 2500, // Faster for more visible movement
          easing: Easing.inOut(Easing.ease),
        }),
        // Contract gently back - smooth return
        withTiming(1, {
          duration: 2500, // Faster for more visible movement
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1, // Repeat infinitely
      false, // Don't reverse (sequence handles the back-and-forth)
    )

    // Transition logic - always transition after minimum display time
    // Don't wait for assets - they can load in background
    const startFadeOut = () => {
      // Gentle pull back - subtle scale down
      scale.value = withTiming(0.95, {
        duration: 800,
        easing: Easing.in(Easing.ease),
      })

      // Then fade out smoothly
      setTimeout(() => {
        opacity.value = withTiming(
          0,
          {
            duration: 1200, // Longer, smoother fade out
            easing: Easing.in(Easing.ease),
          },
          () => {
            if (completedRef.current) return
            completedRef.current = true
            if (onAnimationComplete) {
              runOnJS(onAnimationComplete)()
            }
          },
        )
      }, 400) // Small delay between scale and fade for smooth transition
    }

    // Minimum display time: 2 seconds for luxury feel
    // Always transition after this - assets can load in background
    const mainTimeout = setTimeout(() => {
      startFadeOut()
    }, 2000) // Minimum 2 seconds display time

    // Safety timeout - force transition after max 5 seconds
    // This ensures the app always transitions even if something goes wrong
    const safetyTimeout = setTimeout(() => {
      // Force transition - don't check opacity (can't read worklet value in JS)
      startFadeOut()
    }, 5000) // Max 5 seconds total

    // Cleanup on unmount
    return () => {
      clearTimeout(mainTimeout)
      clearTimeout(safetyTimeout)
    }
  }, [opacity, scale, breathingScale, onAnimationComplete, assetsReady])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value * breathingScale.value }],
    }
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={require("@/assets/images/SoulSchool_HERO_Logo.png")}
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
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: -28,
  },
  logo: {
    width: 300,
    height: 150,
  },
})
