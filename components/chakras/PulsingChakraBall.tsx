/**
 * PulsingChakraBall
 *
 * Non-pressable chakra ball for the AudioPlayer. Slow scale pulse only — no opacity flicker.
 * When embodimentPulse is true (Master Meditation or crystal bowl playing):
 * very slow scale pulse 70% larger (1 → 1.7), no opacity flicker.
 */

import React, { useEffect } from "react"
import { View, ImageSourcePropType, StyleSheet, Platform } from "react-native"
import { SoftChakraBall } from "@/components/chakras/SoftChakraBall"
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated"

const SIZE = 130
const GENTLE_PULSE_DURATION = 14000
const EASE = Easing.inOut(Easing.quad)

/** Master + crystal bowl: pulse up to 70% larger (scale 1.7), very slow, soft loop. iOS: 20% smaller at peak (1.36). */
const EMBODIMENT_PULSE_SCALE_MAX = 1.7
const EMBODIMENT_PULSE_SCALE_MAX_IOS = 1.36
const EMBODIMENT_PULSE_HALF_DURATION_MS = 26000
/** In-flow well so the pulse cannot grow over the title. */
const PULSE_WELL = Math.ceil(SIZE * EMBODIMENT_PULSE_SCALE_MAX)

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
  const opacity = useSharedValue(1)

  useEffect(() => {
    cancelAnimation(scale)
    cancelAnimation(opacity)
    if (embodimentPulse) {
      const scaleMax =
        Platform.OS === "ios"
          ? EMBODIMENT_PULSE_SCALE_MAX_IOS
          : EMBODIMENT_PULSE_SCALE_MAX
      opacity.value = withTiming(1, { duration: 800, easing: EASE })
      scale.value = withRepeat(
        withTiming(scaleMax, {
          duration: EMBODIMENT_PULSE_HALF_DURATION_MS,
          easing: EASE,
        }),
        -1,
        true,
      )
    } else {
      opacity.value = withTiming(1, { duration: 800, easing: EASE })
      scale.value = withRepeat(
        withTiming(1.08, {
          duration: GENTLE_PULSE_DURATION,
          easing: EASE,
        }),
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
        <SoftChakraBall source={source} size={SIZE} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: PULSE_WELL,
    height: PULSE_WELL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ball: {
    width: SIZE,
    height: SIZE,
  },
})
