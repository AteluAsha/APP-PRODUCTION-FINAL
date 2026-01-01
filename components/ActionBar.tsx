import React from "react"
import { TouchableOpacity } from "react-native"
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

interface ActionBarProps {
  useXButton?: boolean
  onXPress?: () => void
}

export const ActionBar: React.FC<ActionBarProps> = ({ useXButton = false, onXPress }) => {
  const router = useRouter()

  const backWithHapticFeedback = () => {
    router.back()
    addHapticFeedback(HapticStrength.Light)
  }

  if (useXButton) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (onXPress) {
            onXPress()
          } else {
            backWithHapticFeedback()
          }
        }}
        style={{
          position: "absolute",
          top: 68,
          right: 14,
          zIndex: 1,
        }}
      >
        <Feather name="x" size={32} color="white" />
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity
      onPress={() => {
        backWithHapticFeedback()
      }}
      style={{
        position: "absolute",
        top: 60,
        left: 14,
        zIndex: 1,
      }}
    >
      <MaterialCommunityIcons
        name="keyboard-backspace"
        size={28}
        color="white"
      />
    </TouchableOpacity>
  )
}
