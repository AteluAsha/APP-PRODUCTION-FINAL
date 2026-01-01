import React, { useEffect } from "react"
import { Dimensions, ImageSourcePropType } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { addHapticFeedback } from "@/utils/haptic"
import { TouchableHighlight } from "react-native-gesture-handler"

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
} from "react-native-reanimated"

const PulsingButton = ({
  source,
  isAnimating,
  onPress,
  className,
  small = false,
}: {
  source: ImageSourcePropType
  isAnimating: boolean
  onPress: () => void
  className?: string
  small?: boolean
}) => {
  const insets = useSafeAreaInsets()
  const screenHeight = Dimensions.get("window").height
  const availableHeight = screenHeight - insets.top
  const iconWidth = small ? availableHeight / 9.5 : availableHeight / 8.5

  // Shared values for animation
  const scale = useSharedValue(1)
  const size = useSharedValue(iconWidth)

  // Pulsing animation effect
  useEffect(() => {
    if (isAnimating) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
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

  return (
    <TouchableHighlight
      onPress={() => {
        onPress()
        addHapticFeedback()
      }}
      className={className}
      underlayColor="transparent"
    >
      <Animated.View style={animatedStyle}>
        <Animated.Image
          source={source}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableHighlight>
  )
}

export default PulsingButton
