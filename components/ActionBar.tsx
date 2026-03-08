import React from "react"
import { TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { ICON } from "@/constants/layout"

/** Same row as GlobalHomeButton (chakra icon): top offset and 40px height */
const HEADER_ROW_TOP = (insets: { top: number }) =>
  Math.max(insets.top, 8) + 8
const HEADER_ROW_HEIGHT = ICON.homeButton

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
  const insets = useSafeAreaInsets()

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
  const shadowStyle = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 } as const,
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  }

  const top = HEADER_ROW_TOP(insets)
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
          top,
          width: HEADER_ROW_HEIGHT,
          height: HEADER_ROW_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          ...(isLeft ? { left: 16 } : { right: 16 }),
          zIndex: 1000,
          backgroundColor: "transparent",
          ...shadowStyle,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
        accessibilityLabel="Close"
        accessibilityHint="Closes the audio player"
      >
        <Ionicons name="close" size={ICON.actionBar + 2} color="white" />
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity
      onPress={backWithHapticFeedback}
      style={{
        position: "absolute",
        top,
        left: 16,
        width: HEADER_ROW_HEIGHT,
        height: HEADER_ROW_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
        backgroundColor: "transparent",
        ...shadowStyle,
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Ionicons
        name="arrow-back"
        size={ICON.actionBar}
        color="rgba(255, 255, 255, 0.95)"
      />
    </TouchableOpacity>
  )
}
