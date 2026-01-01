import React from "react"
import { View } from "react-native"
import { tv } from "tailwind-variants"
import { AppText } from "@/components/AppText"
import PulsingButton from "@/components/chakras/PulsingButton"
import { Router } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { isChakraDayAccessible } from "@/src/services/timegate"

interface IntegratedProgressStackProps {
  currentDay: number
  hasCompletedChakra: (day: number) => boolean
  hasParticipatedDay: (day: number) => boolean
  allChakrasCompleted: boolean
  chakraData: {
    day: number
    affirmation: string
    description: string
    source: any
    onPress: (router: Router) => void
  }[]
  router: Router
}

// Day label abbreviations
const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

// Chakra names in order
const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
]

// Define variants
const chakraRowVariants = tv({
  base: "flex-row items-center justify-center mb-1 w-full",
  variants: {
    current: {
      true: "scale-105",
      false: "opacity-90",
    },
  },
  defaultVariants: {
    current: false,
  },
})

const dayLabelTextVariants = tv({
  base: "text-base font-medium",
  variants: {
    current: {
      true: "text-white",
      false: "text-white/80",
    },
  },
  defaultVariants: {
    current: false,
  },
})

const chakraNameTextVariants = tv({
  base: "text-sm",
  variants: {
    current: {
      true: "text-white/80",
      false: "text-white/60",
    },
  },
  defaultVariants: {
    current: false,
  },
})

export const IntegratedProgressStack = ({
  currentDay,
  hasCompletedChakra,
  hasParticipatedDay,
  allChakrasCompleted,
  chakraData,
  router,
}: IntegratedProgressStackProps) => {
  // Find current chakra data
  const currentChakraData = chakraData.find(({ day }) => day === currentDay)

  return (
    <View className="flex-1">
      {/* Chakra stack */}
      <View className="flex-1 justify-end items-center flex-col-reverse">
        {/* Current chakra affirmation and description at the top */}
        {currentChakraData && (
          <View className="items-center pt-6 pb-8">
            <AppText font="koh-santepheap" size="lg">
              {currentChakraData.affirmation}
            </AppText>
            <AppText font="koh-santepheap" size="2xl" className="mt-1">
              {currentChakraData.description}
            </AppText>
          </View>
        )}
        {/* chakraData is already reversed in ChakraHome - Root (day 0) at bottom, Crown (day 6) at top */}
        {chakraData.map(({ day: chakraDay, source, onPress }) => {
          const isCurrentDay = currentDay === chakraDay
          // Use timegate service to check if chakra is accessible (includes dev override)
          // In dev mode, all chakras are accessible
          const isUnlocked = isChakraDayAccessible(
            chakraDay,
            false, // hasLifetimeAccess - would need to be passed as prop if needed
            hasParticipatedDay,
            currentDay,
            allChakrasCompleted,
          )
          const isCompleted = hasCompletedChakra(chakraDay)

          if (!isUnlocked) {
            return null // Don't show locked chakras
          }

          return (
            <View
              key={chakraDay}
              className={chakraRowVariants({ current: isCurrentDay })}
            >
              <View className="w-[33%]" />
              {/* Chakra container with completion badge */}
              <View className="w-[33%]">
                {/* Chakra button */}
                <PulsingButton
                  source={source}
                  isAnimating={isCurrentDay}
                  onPress={() => {
                    onPress(router)
                  }}
                />

                {/* Completion indicator badge */}
                {isCompleted && (
                  <View className="absolute top-0 right-4 rounded-full p-1">
                    <Feather name="check-circle" size={20} color="#fff" />
                  </View>
                )}
              </View>

              {/* Day and chakra name */}
              <View className="w-[33.33%] pl-4">
                <AppText
                  font="koh-santepheap"
                  className={dayLabelTextVariants({ current: isCurrentDay })}
                >
                  {DAY_LABELS[chakraDay]}
                </AppText>
                <AppText
                  font="koh-santepheap"
                  className={chakraNameTextVariants({ current: isCurrentDay })}
                >
                  {CHAKRA_NAMES[chakraDay]}
                </AppText>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
