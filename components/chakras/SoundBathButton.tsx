import React from "react"
import { Pressable, View } from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"

interface SoundBathButtonProps {
  className?: string // Additional Tailwind classes for styling
  onPress: () => void // Callback when the button is pressed
  title: string // Main title for the button
  subtitle: string // Subtitle for the button
}

const SoundBathButton: React.FC<SoundBathButtonProps> = ({
  className = "",
  onPress,
  title,
  subtitle,
}) => {
  return (
    <Pressable
      className={`border border-[#ffffff60] rounded-2xl py-4 w-72 active:scale-95 active:opacity-90 bg-[#00000020] ${className}`}
      onPress={onPress}
    >
      <View className="flex-row items-center ml-8 py-2">
        {/* Icon */}
        <View className="border border-[#ffffffd0] rounded-full h-10 w-10 flex items-center justify-center">
          <Ionicons name="play" size={12} className="ml-0.5" />
        </View>

        {/* Text */}
        <View className="flex-col ml-4">
          <AppText font="koh-santepheap" className="mb-1 tracking-wide">
            {title}
          </AppText>
          <AppText font="instrument-italic">{subtitle}</AppText>
        </View>
      </View>
    </Pressable>
  )
}

export default SoundBathButton
