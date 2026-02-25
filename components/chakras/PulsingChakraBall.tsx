/**
 * PulsingChakraBall
 *
 * Non-pressable chakra ball for the AudioPlayer. Gentle, slow pulse with opacity fade.
 * Matches the trial home screen chakra ball style but with slower animation for healing/meditation context.
 */

import React, { useEffect } from "react"
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated"

const SIZE = 130
const PULSE_DURATION = 4800
const EASE = Easing.inOut(Easing.sin)

interface PulsingChakraBallProps {
  source: ImageSourcePropType
}

export const PulsingChakraBall = ({ source }: PulsingChakraBallProps) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.7)

  useEffect(() => {
    // Reverse mode: smooth 1 ↔ 1.06 and 0.7 ↔ 1 with no jump at reset
    scale.value = withRepeat(
      withTiming(1.06, { duration: PULSE_DURATION, easing: EASE }),
      -1,
      true,
    )
    opacity.value = withRepeat(
      withTiming(1, { duration: PULSE_DURATION, easing: EASE }),
      -1,
      true,
    )
  }, [scale, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.ball, animatedStyle]}>
        <Image source={source} style={styles.image} resizeMode="contain" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ball: {
    width: SIZE,
    height: SIZE,
  },
  image: {
    width: "100%",
    height: "100%",
  },
})
