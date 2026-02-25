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
    <View style={{ marginBottom: 32 }}>
      <AppText
        font="instrument-regular"
        size="sm"
        style={{ marginBottom: 8, fontSize: 14, color: "#ffffff" }}
      >
        {heading}
      </AppText>
      <AppText
        font="instrument-regular"
        size="sm"
        style={{ marginBottom: 24, color: "#ffffff" }}
      >
        {description}
      </AppText>
      <Pressable
        onPress={onPress}
        delayPressIn={0}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.38)",
          borderRadius: 16,
          paddingVertical: 16,
          marginHorizontal: 16,
          marginTop: 8,
          backgroundColor: "rgba(0,0,0,0.125)",
        }}
      >
        <AppText
          font="instrument-medium"
          size="xs"
          style={{ textAlign: "center", color: "#ffffff" }}
        >
          {buttonText}
        </AppText>
        <AppText
          font="instrument-regular"
          size="lg"
          style={{ textAlign: "center", color: "#ffffff" }}
        >
          {buttonSubText}
        </AppText>
      </Pressable>
    </View>
  )
}

export default TextButtonSection
