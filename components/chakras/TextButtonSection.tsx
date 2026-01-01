import React from "react"
import { View, Pressable } from "react-native"
import { AppText } from "../AppText"

interface TextButtonSectionProps {
  heading: string // Main heading text, e.g., "HEAD TO HEART"
  description: string // Description text, e.g., "Each chakra holds one of the 7 Divine Laws..."
  buttonText: string // Button's main text, e.g., "Path 1"
  buttonSubText: string // Button's subtext, e.g., "Ancestral Knowledge"
  onPress: () => void // Button press handler
}

const TextButtonSection: React.FC<TextButtonSectionProps> = ({
  heading,
  description,
  buttonText,
  buttonSubText,
  onPress,
}) => {
  return (
    <View className="mb-8">
      {/* Heading */}
      <AppText font="instrument-regular" className="mb-2 text-[14px]">
        {heading}
      </AppText>

      {/* Description */}

      <AppText font="instrument-regular" size="sm" className="mb-6">
        {description}
      </AppText>
      {/* Button */}
      <Pressable
        className="border border-[#ffffff60] rounded-2xl py-4 mx-4 mt-2 active:scale-95 active:opacity-90 bg-[#00000020]"
        onPress={onPress}
      >
        <AppText font="instrument-medium" size="xs" className="text-center">
          {buttonText}
        </AppText>
        <AppText font="instrument-regular" size="lg" className="text-center">
          {buttonSubText}
        </AppText>
      </Pressable>
    </View>
  )
}

export default TextButtonSection
