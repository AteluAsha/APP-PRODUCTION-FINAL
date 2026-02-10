import React from "react"
import { Pressable, View } from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"

interface SoundBathButtonProps {
  className?: string // Additional Tailwind classes for styling
  onPress: () => void // Callback when the button is pressed
  title: string // Main title for the button
  subtitle: string // Subtitle for the button
  isLoading?: boolean // Show loading state
}

const SoundBathButton: React.FC<SoundBathButtonProps> = ({
  className = "",
  onPress,
  title,
  subtitle,
  isLoading = false,
}) => {
  return (
    <Pressable
      style={{
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.38)",
        borderRadius: 16,
        paddingVertical: 16,
        width: 288,
        backgroundColor: "rgba(0,0,0,0.125)",
      }}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 32, paddingVertical: 8 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.82)",
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="play" size={12} color="white" style={{ marginLeft: 2 }} />
        </View>

        <View style={{ flexDirection: "column", marginLeft: 16, flex: 1, maxWidth: "70%" }}>
          <AppText
            font="koh-santepheap"
            size="sm"
            numberOfLines={1}
            style={{ marginBottom: 4, letterSpacing: 1, fontSize: 13, color: "#ffffff" }}
          >
            {title}
          </AppText>
          <AppText
            font="instrument-italic"
            size="xs"
            numberOfLines={1}
            style={{ opacity: isLoading ? 0.5 : 1, fontSize: 11, color: "#ffffff" }}
          >
            {isLoading ? "Preparing..." : subtitle}
          </AppText>
        </View>
      </View>
    </Pressable>
  )
}

export default SoundBathButton
