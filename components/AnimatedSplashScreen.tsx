/**
 * JS splash (Stage 2) – shown after native splash is dismissed.
 *
 * On mount: calls SplashScreen.hideAsync() so the native shield (golden 7) hands off
 * to this black screen + pulsing hero logo. Loops a gentle scale pulse while fonts/assets
 * load; when loadingComplete, fades out and calls onFadeOutComplete.
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
import * as SplashScreen from "expo-splash-screen"
import { OPENING_SPLASH_LOGO } from "@/constants/layout"

const FADE_IN_MS = 400
const PULSE_CYCLE_MS = 2800
const FADE_OUT_MS = 520

export interface AnimatedSplashScreenProps {
  /** True when fonts + critical image/audio preloads are done (root layout). */
  loadingComplete: boolean
  /** Called after fade-out animation finishes; root unmounts this overlay. */
  onFadeOutComplete: () => void
}

export function AnimatedSplashScreen({
  loadingComplete,
  onFadeOutComplete,
}: AnimatedSplashScreenProps) {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(1)
  const completedRef = useRef(false)
  const fadeOutStartedRef = useRef(false)
  const nativeHiddenRef = useRef(false)

  useEffect(() => {
    if (nativeHiddenRef.current) return
    nativeHiddenRef.current = true
    SplashScreen.hideAsync().catch(() => {})
  }, [])

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.ease),
    })
  }, [opacity])

  useEffect(() => {
    if (!loadingComplete || fadeOutStartedRef.current) return
    fadeOutStartedRef.current = true

    const finish = () => {
      if (completedRef.current) return
      completedRef.current = true
      onFadeOutComplete()
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
  }, [loadingComplete, opacity, scale, onFadeOutComplete])

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
    <View style={styles.container} pointerEvents="none">
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100000,
  },
  logoWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
})
