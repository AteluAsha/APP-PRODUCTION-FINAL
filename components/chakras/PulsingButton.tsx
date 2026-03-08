import React, { useEffect, useCallback } from "react"
import { Dimensions, ImageSourcePropType, Pressable, Platform } from "react-native"
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
  isBottomChakra = false,
}: {
  source: ImageSourcePropType
  isAnimating: boolean
  onPress: () => void
  className?: string
  small?: boolean
  /** When small is true, use this divisor for size (smaller = larger balls). e.g. 7.8 for lifetime hub. */
  smallDivisor?: number
  /** When true (e.g. Root at bottom of stack), use larger Android hitSlop for easier tap. */
  isBottomChakra?: boolean
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

  const hitSlop =
    Platform.OS === "android"
      ? isBottomChakra
        ? { top: 36, bottom: 36, left: 36, right: 36 }
        : { top: 28, bottom: 28, left: 28, right: 28 }
      : { top: 15, bottom: 15, left: 15, right: 15 }

  return (
    <Pressable
      onPress={handlePress}
      className={className}
      hitSlop={hitSlop}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      android_ripple={
        Platform.OS === "android"
          ? { color: "rgba(255, 255, 255, 0.25)", borderless: false }
          : undefined
      }
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
