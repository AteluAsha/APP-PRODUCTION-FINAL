/**
 * JS splash (Stage 2) – after native shield (golden 7), Soul School hero + breath pulse.
 *
 * Native splash stays until the hero image has loaded and we have painted a frame (onLoad +
 * double rAF), then SplashScreen.hideAsync(). Pulse: 5s sine in/out cycle. Solid black throughout.
 */
import React, { useCallback, useEffect, useRef } from "react"
import { View, Image, StyleSheet, Platform } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
  cancelAnimation,
} from "react-native-reanimated"
import * as SplashScreen from "expo-splash-screen"
import { OPENING_SPLASH_LOGO } from "@/constants/layout"

const PULSE_MAX_SCALE = 1.04
const PULSE_HALF_MS = 2500
const FADE_OUT_MS = 520
/** If Image onLoad never fires, still dismiss native splash so the app cannot hang. */
const NATIVE_HIDE_FALLBACK_MS = 3500

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
  const pulseStartedRef = useRef(false)

  const startBreathPulse = useCallback(() => {
    if (pulseStartedRef.current) return
    pulseStartedRef.current = true
    cancelAnimation(scale)
    scale.value = 1
    scale.value = withRepeat(
      withTiming(PULSE_MAX_SCALE, {
        duration: PULSE_HALF_MS,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true,
    )
  }, [scale])

  const hideNativeAndStartPulse = useCallback(() => {
    if (nativeHiddenRef.current) return
    nativeHiddenRef.current = true
    opacity.value = 1
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        SplashScreen.hideAsync().catch(() => {})
        startBreathPulse()
      })
    })
  }, [opacity, startBreathPulse])

  const onHeroLoad = useCallback(() => {
    hideNativeAndStartPulse()
  }, [hideNativeAndStartPulse])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!nativeHiddenRef.current) {
        hideNativeAndStartPulse()
      }
    }, NATIVE_HIDE_FALLBACK_MS)
    return () => clearTimeout(t)
  }, [hideNativeAndStartPulse])

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
    return () => {
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
          onLoad={onHeroLoad}
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
