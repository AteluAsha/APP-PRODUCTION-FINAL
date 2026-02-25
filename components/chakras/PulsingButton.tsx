import React, { useEffect, useCallback } from "react"
import { Dimensions, ImageSourcePropType, Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from "react-native-reanimated"

const PulsingButton = ({
  source,
  isAnimating,
  onPress,
  className,
  small = false,
  smallDivisor,
}: {
  source: ImageSourcePropType
  isAnimating: boolean
  onPress: () => void
  className?: string
  small?: boolean
  /** When small is true, use this divisor for size (smaller = larger balls). e.g. 7.8 for lifetime hub. */
  smallDivisor?: number
}) => {
  const insets = useSafeAreaInsets()
  const screenHeight = Dimensions.get("window").height
  const availableHeight = screenHeight - insets.top
  const iconWidth = small
    ? availableHeight / (smallDivisor ?? 9.5)
    : availableHeight / 8.5

  // Shared values for animation
  const scale = useSharedValue(1)
  const size = useSharedValue(iconWidth)

  // Steady breath – smooth in/out easing so there’s no jerk at direction change
  useEffect(() => {
    if (isAnimating) {
      const ease = Easing.inOut(Easing.sin)
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 2800, easing: ease }),
          withTiming(1, { duration: 2800, easing: ease }),
        ),
        -1,
        false,
      )
    } else {
      cancelAnimation(scale)
      scale.value = 1
    }
  }, [isAnimating, scale])

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    width: size.value,
    height: size.value,
  }))

  // Optimized press handler - instant response
  const handlePress = useCallback(() => {
    // Immediate haptic feedback
    addHapticFeedback(HapticStrength.Light)
    // Immediate navigation
    onPress()
  }, [onPress])

  return (
    <Pressable
      onPress={handlePress}
      className={className}
      // Larger hit area for easier tapping
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      // Disable press opacity to avoid visual lag
      android_ripple={null}
    >
      <Animated.View style={animatedStyle}>
        <Animated.Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </Animated.View>
    </Pressable>
  )
}

export default PulsingButton
