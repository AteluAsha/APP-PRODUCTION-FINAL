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

const RadialGradientAnimation = () => {
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
        [0, 2], // Start at scale 0, grow to scale 2
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
    <View style={styles.gradientContainer}>
      {animatedStyles.map((style, index) => (
        <Animated.View
          key={index}
          className={"bg-[#8e2e2e]"}
          style={[
            {
              position: "absolute",
              width: width * 1.5, // Circle size
              height: width * 1.5,
              borderRadius: width * 0.75, // Make it circular
              backgroundColor: `#8e2e2e40`, // Adjust color and transparency
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
