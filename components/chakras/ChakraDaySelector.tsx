/**
 * ChakraDaySelector - Full-width row of chakra balls for filtering
 * Used in Notes Along the Way and the notes sheet.
 * Balls stretch across the screen (no horizontal scroll) so they are easier to tap.
 */
import React from "react"
import { View, Pressable, Image } from "react-native"
import { AppText } from "@/components/AppText"
import {
  DAY_NAMES,
  getChakraName,
  getChakraImage,
} from "@/constants/chakras/chakraConstants"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const CHAKRA_COLORS = [
  { text: "#DC2626" },
  { text: "#EA580C" },
  { text: "#FCD34D" },
  { text: "#10B981" },
  { text: "#3B82F6" },
  { text: "#6366F1" },
  { text: "#9333EA" },
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
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Pressable
          onPress={() => {
            addHapticFeedback(HapticStrength.Light)
            onSelect("all")
          }}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          style={{
            height: 44,
            minWidth: 42,
            paddingHorizontal: 8,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              selectedDay === "all"
                ? "rgba(135, 174, 115, 0.25)"
                : "transparent",
            borderWidth: selectedDay === "all" ? 1 : 0,
            borderColor: "rgba(135, 174, 115, 0.4)",
          }}
          accessibilityLabel="All chakras"
        >
          <AppText
            font="instrument-regular"
            style={{
              color:
                selectedDay === "all" ? "#A8C99A" : "rgba(255, 255, 255, 0.4)",
              fontSize: 13,
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
              hitSlop={{ top: 8, bottom: 8 }}
              style={{
                flex: 1,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityLabel={`${getChakraName(index)} Chakra`}
              accessibilityRole="button"
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
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
              >
                <Image
                  source={chakraBallImage}
                  style={{
                    width: isSelected ? 32 : 28,
                    height: isSelected ? 32 : 28,
                    opacity: isSelected ? 1 : 0.55,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
