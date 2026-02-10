import React, { useEffect } from "react"
import { StyleSheet, View, Dimensions } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated"

const { width } = Dimensions.get("window")

/** Production-approved: circle base size and max scale so visualizer is not oversized */
const CIRCLE_SIZE_FACTOR = 1.2
const MAX_SCALE = 1.6

const DEFAULT_COLOR = "#6366F1" // Third Eye / indigo – neutral fallback

interface RadialGradientAnimationProps {
  primaryColor?: string
}

const RadialGradientAnimation = ({
  primaryColor = DEFAULT_COLOR,
}: RadialGradientAnimationProps) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 10000 }), // Duration of one cycle
      -1, // Infinite repeat
      false, // Do not reverse animation
    )
  }, [])

  const animatedStyles = [0, 1, 2, 3, 4].map((circleIndex) => {
    return useAnimatedStyle(() => {
      // Delay each circle's animation
      const delay = circleIndex * 0.06

      // Interpolate scale and opacity based on progress
      const scale = interpolate(
        progress.value,
        [0.05 + delay, 1],
        [0, MAX_SCALE],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      )

      const opacity = interpolate(
        progress.value,
        [0 + delay, 1], // Fade out after growing
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      )

      return {
        transform: [{ scale }],
        opacity,
      }
    })
  })

  return (
    <View style={styles.gradientContainer} pointerEvents="box-none">
      {animatedStyles.map((style, index) => (
        <Animated.View
          key={index}
          style={[
            {
              position: "absolute",
              width: width * CIRCLE_SIZE_FACTOR,
              height: width * CIRCLE_SIZE_FACTOR,
              borderRadius: (width * CIRCLE_SIZE_FACTOR) / 2,
              backgroundColor: `${primaryColor}40`,
            },
            style,
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  gradientContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
})

export default RadialGradientAnimation
