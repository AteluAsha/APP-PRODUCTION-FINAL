import React from "react"
import { TouchableOpacity } from "react-native"
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { ICON } from "@/constants/layout"

interface ActionBarProps {
  useXButton?: boolean
  /** Position of X when useXButton: 'left' for audio screens, 'right' default */
  xButtonPosition?: "left" | "right"
  onXPress?: () => void
  onBackPress?: () => void
  /** When false, hide back arrow (e.g. ChakraHub is root for lifetime users) */
  showBackButton?: boolean
}

export const ActionBar: React.FC<ActionBarProps> = ({
  useXButton = false,
  xButtonPosition = "right",
  onXPress,
  onBackPress,
  showBackButton = true,
}) => {
  const router = useRouter()

  const backWithHapticFeedback = () => {
    addHapticFeedback(HapticStrength.Light)
    if (onBackPress) {
      onBackPress()
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)")
    }
  }

  if (!showBackButton && !useXButton) {
    return null
  }
  if (useXButton) {
    const isLeft = xButtonPosition === "left"
    return (
      <TouchableOpacity
        onPress={() => {
          if (onXPress) {
            onXPress()
            addHapticFeedback(HapticStrength.Light)
          } else {
            backWithHapticFeedback()
          }
        }}
        style={{
          position: "absolute",
          top: 56,
          ...(isLeft ? { left: 12 } : { right: 12 }),
          zIndex: 1000,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Close"
        accessibilityHint="Closes the audio player"
      >
        <Feather name="x" size={ICON.actionBar} color="white" />
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity
      onPress={backWithHapticFeedback}
      style={{
        position: "absolute",
        top: 56,
        left: 12,
        zIndex: 1,
        backgroundColor: "transparent",
        padding: 6,
        margin: 0,
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={ICON.actionBar} color="rgba(255, 255, 255, 0.9)" />
    </TouchableOpacity>
  )
}
