/**
 * PulsingChakraBall
 *
 * Non-pressable chakra ball for the AudioPlayer. Gentle, slow pulse with opacity fade.
 * Matches the trial home screen chakra ball style but with slower animation for healing/meditation context.
 * When embodimentPulse is true (master embodiment playing): very slow scale pulse 70% larger (1 → 1.7), soft loop.
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

/** Master embodiment: pulse up to 70% larger (scale 1.7), very slow, soft loop */
const EMBODIMENT_PULSE_SCALE_MAX = 1.7
const EMBODIMENT_PULSE_HALF_DURATION_MS = 22000

interface PulsingChakraBallProps {
  source: ImageSourcePropType
  /** When true (master embodiment playing), use slow 70%-larger pulse; otherwise default gentle pulse */
  embodimentPulse?: boolean
}

export const PulsingChakraBall = ({
  source,
  embodimentPulse = false,
}: PulsingChakraBallProps) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.7)

  useEffect(() => {
    if (embodimentPulse) {
      // 70% larger than current size (1 → 1.7), very slow, forward-and-back loop, soft ease
      scale.value = withRepeat(
        withTiming(EMBODIMENT_PULSE_SCALE_MAX, {
          duration: EMBODIMENT_PULSE_HALF_DURATION_MS,
          easing: EASE,
        }),
        -1,
        true,
      )
      opacity.value = 1
    } else {
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
    }
  }, [scale, opacity, embodimentPulse])

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
