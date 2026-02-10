/**
 * ChakraDaySelector - Horizontal scroll of chakra icons for filtering
 * Used in Notes Along the Way and Community Halls
 */
import React from "react"
import { View, ScrollView, Pressable, Image } from "react-native"
import { AppText } from "@/components/AppText"
import {
  DAY_NAMES,
  getChakraName,
  getChakraImage,
} from "@/constants/chakras/chakraConstants"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const CHAKRA_COLORS = [
  { text: "#DC2626" }, // Root
  { text: "#EA580C" }, // Sacral
  { text: "#FCD34D" }, // Solar Plexus
  { text: "#10B981" }, // Heart
  { text: "#3B82F6" }, // Throat
  { text: "#6366F1" }, // Third Eye
  { text: "#9333EA" }, // Crown
]

interface ChakraDaySelectorProps {
  selectedDay: number | "all"
  onSelect: (day: number | "all") => void
}

export const ChakraDaySelector: React.FC<ChakraDaySelectorProps> = ({
  selectedDay,
  onSelect,
}) => {
  return (
    <View
      style={{
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom: 12,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 6,
          alignItems: "center",
          paddingHorizontal: 4,
        }}
      >
        <Pressable
          onPress={() => {
            addHapticFeedback(HapticStrength.Light)
            onSelect("all")
          }}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor:
              selectedDay === "all"
                ? "rgba(135, 174, 115, 0.25)"
                : "transparent",
            borderWidth: selectedDay === "all" ? 1 : 0,
            borderColor: "rgba(135, 174, 115, 0.4)",
          }}
        >
          <AppText
            font="instrument-regular"
            style={{
              color:
                selectedDay === "all" ? "#A8C99A" : "rgba(255, 255, 255, 0.4)",
              fontSize: 12,
            }}
          >
            All
          </AppText>
        </Pressable>
        {DAY_NAMES.map((_, index) => {
          const chakraColor = CHAKRA_COLORS[index]
          const isSelected = selectedDay === index
          const chakraBallImage = getChakraImage(index)

          return (
            <Pressable
              key={index}
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                onSelect(index)
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: isSelected
                  ? `${chakraColor.text}25`
                  : "transparent",
                borderWidth: isSelected ? 1.5 : 0.5,
                borderColor: isSelected
                  ? chakraColor.text
                  : "rgba(255, 255, 255, 0.15)",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
              accessibilityLabel={`${getChakraName(index)} Chakra`}
            >
              <Image
                source={chakraBallImage}
                style={{
                  width: isSelected ? 22 : 18,
                  height: isSelected ? 22 : 18,
                  opacity: isSelected ? 1 : 0.5,
                }}
                resizeMode="contain"
              />
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
