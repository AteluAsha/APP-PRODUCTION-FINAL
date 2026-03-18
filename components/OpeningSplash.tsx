/**
 * Opening Splash – Single source for iOS/Android opening
 *
 * App opens to this splash: black screen, Soul School hero logo. Logo fades in,
 * then a gentle somatic pulse (breathing scale). Splash keeps pulsing until app
 * is ready (store rehydration, nav). When ready, splash soft-fades out and
 * calls onComplete so the app navigates to the first screen (e.g. Welcome).
 *
 * Uses SoulSchool_HERO_Logo.png only. Logo size from OPENING_SPLASH_LOGO.
 */
import React, { useEffect, useRef } from "react"
import { View, Image, StyleSheet, Platform } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
  cancelAnimation,
} from "react-native-reanimated"
import { OPENING_SPLASH_LOGO } from "@/constants/layout"

const FADE_IN_MS = 600
const PULSE_CYCLE_MS = 2800
const FADE_OUT_MS = 520

interface OpeningSplashProps {
  /** When true, splash stops pulsing and fades out, then calls onComplete. */
  appReady: boolean
  onComplete: () => void
}

export function OpeningSplash({ appReady, onComplete }: OpeningSplashProps) {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(1)
  const completedRef = useRef(false)
  const fadeOutStartedRef = useRef(false)

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.ease),
    })
  }, [opacity])

  useEffect(() => {
    if (!appReady || fadeOutStartedRef.current) return
    fadeOutStartedRef.current = true

    const finish = () => {
      if (completedRef.current) return
      completedRef.current = true
      onComplete()
    }

    cancelAnimation(scale)
    scale.value = withTiming(1, { duration: 200 })
    opacity.value = withTiming(
      0,
      {
        duration: FADE_OUT_MS,
        easing: Easing.in(Easing.ease),
      },
      (finished) => {
        if (finished) runOnJS(finish)()
      },
    )
  }, [appReady, opacity, scale, onComplete])

  useEffect(() => {
    const startPulse = () => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, {
            duration: PULSE_CYCLE_MS / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: PULSE_CYCLE_MS / 2,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      )
    }
    const t = setTimeout(startPulse, FADE_IN_MS)
    return () => {
      clearTimeout(t)
      cancelAnimation(scale)
    }
  }, [scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const isIos = Platform.OS === "ios"
  const w = OPENING_SPLASH_LOGO.width[isIos ? "ios" : "android"]
  const h = OPENING_SPLASH_LOGO.height[isIos ? "ios" : "android"]

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, animatedStyle]}>
        <Image
          source={require("@/assets/images/SoulSchool_HERO_Logo.png")}
          style={{ width: w, height: h }}
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
  logoWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
})
