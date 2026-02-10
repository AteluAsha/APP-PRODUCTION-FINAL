/**
 * Shared BackArrow component – white arrow only, no background, standalone.
 * Used consistently across all screens to avoid grey circles on iOS.
 */

import React from "react"
import { TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface BackArrowProps {
  onPress: () => void
  size?: number
  color?: string
  topOffset?: number
  leftOffset?: number
  accessibilityLabel?: string
  accessibilityHint?: string
}

export const BackArrow: React.FC<BackArrowProps> = ({
  onPress,
  size = 24,
  color = "rgba(255, 255, 255, 0.9)",
  topOffset,
  leftOffset = 16,
  accessibilityLabel = "Back",
  accessibilityHint = "Tap to go back",
}) => {
  const insets = useSafeAreaInsets()
  const top = topOffset ?? Math.max(insets.top, 8) + 8

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={{
        position: "absolute",
        top,
        left: leftOffset,
        zIndex: 1000,
        padding: 8,
        backgroundColor: "transparent",
        margin: 0,
        justifyContent: "center",
        alignItems: "center",
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  )
}
