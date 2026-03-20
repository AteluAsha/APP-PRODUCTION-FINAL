/**
 * Hero / large Image: opacity 0 → 1 on load (Reanimated).
 * Avoids expo-image dependency; geometry matches parent `style` + `Image` props.
 */
import React from "react"
import type { ImageProps } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { SOMATIC_HERO_IMAGE_FADE_MS } from "@/constants/layout"

type SomaticHeroImageProps = ImageProps

export function SomaticHeroImage({
  onLoad,
  style,
  ...rest
}: SomaticHeroImageProps) {
  const opacity = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.Image
      {...rest}
      style={[style, animatedStyle]}
      onLoad={(e) => {
        opacity.value = withTiming(1, { duration: SOMATIC_HERO_IMAGE_FADE_MS })
        onLoad?.(e)
      }}
    />
  )
}
