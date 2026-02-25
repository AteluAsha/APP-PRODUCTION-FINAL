/**
 * Stillness Screen – Rehydration loading
 *
 * Minimalist loading component for the rehydration/initialization phase.
 * Soft background, Cormorant Garamond text, gentle fade-in and breathing animation.
 */

import React, { useEffect } from "react"
import { View } from "react-native"
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated"
const SOFT_BG = "#0f1210"

export function StillnessScreen() {
  const opacity = useSharedValue(0.65)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.65, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    )
  }, [opacity])

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      entering={FadeIn.duration(800).easing(Easing.out(Easing.ease))}
      style={{
        flex: 1,
        backgroundColor: SOFT_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.Text
        style={[
          animatedTextStyle,
          {
            fontFamily: "CormorantGaramondItalic",
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
          },
        ]}
      >
        Landing in the heart...
      </Animated.Text>
    </Animated.View>
  )
}
