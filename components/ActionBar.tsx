import React from "react"
import { TouchableOpacity, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { runAndroidBackCleanup } from "@/utils/androidBackCleanup"
import { ICON, safeOverlayTop } from "@/constants/layout"

/** Same row as GlobalHomeButton (chakra icon): top offset and 40px height */
const HEADER_ROW_HEIGHT = ICON.homeButton

interface ActionBarProps {
  useXButton?: boolean
  /** Position of X when useXButton: 'left' for audio screens, 'right' default */
  xButtonPosition?: "left" | "right"
  /** When set, use this for X button top (e.g. Frequency of Gnosis so X doesn't block Download all) */
  xButtonTop?: number
  onXPress?: () => void
  onBackPress?: () => void
  /** When false, hide back arrow (e.g. ChakraHub is root for lifetime users) */
  showBackButton?: boolean
  /** Home icon instead of back chevron. Still uses onBackPress (ChakraHub). */
  useHomeButton?: boolean
  /** Icon color. Default white for dark screens. */
  iconColor?: string
}

export const ActionBar: React.FC<ActionBarProps> = ({
  useXButton = false,
  xButtonPosition = "right",
  xButtonTop,
  onXPress,
  onBackPress,
  showBackButton = true,
  useHomeButton = false,
  iconColor = "rgba(255, 255, 255, 0.95)",
}) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const backWithHapticFeedback = () => {
    if (Platform.OS === "android") {
      runAndroidBackCleanup()
    }
    addHapticFeedback(HapticStrength.Light)
    if (onBackPress) {
      onBackPress()
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
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

  const top = safeOverlayTop(insets.top)
  const xTop = xButtonTop ?? top
  if (useXButton) {
    const isLeft = xButtonPosition === "left"
    return (
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === "android") {
            runAndroidBackCleanup()
          }
          if (onXPress) {
            onXPress()
            addHapticFeedback(HapticStrength.Light)
          } else {
            backWithHapticFeedback()
          }
        }}
        style={{
          position: "absolute",
          top: xTop,
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
        activeOpacity={Platform.OS === "ios" ? 0.78 : 0.7}
        accessibilityLabel="Close"
        accessibilityHint="Closes the audio player"
      >
        <Ionicons name="close" size={ICON.actionBar + 2} color={iconColor} />
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
        zIndex: 1000,
        backgroundColor: "transparent",
        ...shadowStyle,
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={Platform.OS === "ios" ? 0.78 : 0.7}
      accessibilityLabel={useHomeButton ? "Home" : "Back"}
      accessibilityHint={
        useHomeButton
          ? "Return to sanctuary home"
          : "Go back to previous screen"
      }
    >
      <Ionicons
        name={useHomeButton ? "home-outline" : "arrow-back"}
        size={ICON.actionBar}
        color={iconColor}
      />
    </TouchableOpacity>
  )
}
