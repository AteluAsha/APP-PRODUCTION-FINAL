import React from "react"
import { View } from "react-native"
import { tv } from "tailwind-variants"
import { AppText } from "@/components/AppText"
import { isChakraDayAccessible } from "@/src/services/timegate"

interface DayProgressIndicatorProps {
  currentDay: number
  hasCompletedChakra: (day: number) => boolean
  hasParticipatedDay: (day: number) => boolean
  allChakrasCompleted: boolean
  hasLifetimeAccess?: boolean // APP_2 (Lifetime): Pass to timegate service
}

const DAYS = ["M", "T", "W", "Th", "F", "Sa", "Su"]

// Define variants
const dayIndicatorVariants = tv({
  base: "w-10 h-10 rounded-full justify-center items-center",
  variants: {
    current: {
      true: "bg-white",
      false: "",
    },
    unlocked: {
      true: "bg-white/20",
      false: "bg-gray-900/90",
    },
    completed: {
      true: "border-2 border-white",
    },
  },
  compoundVariants: [
    // If current is true, unlocked state background doesn't matter
    {
      current: true,
      class: "bg-white",
    },
  ],
  defaultVariants: {
    current: false,
    unlocked: false,
    completed: false,
  },
})

const dayTextVariants = tv({
  base: "text-xs",
  variants: {
    current: {
      true: "text-black",
      false: "text-white",
    },
  },
  defaultVariants: {
    current: false,
  },
})

export const DayProgressIndicator = ({
  currentDay,
  hasCompletedChakra,
  hasParticipatedDay,
  allChakrasCompleted,
  hasLifetimeAccess = false, // APP_2 (Lifetime): Default to false for trial mode
}: DayProgressIndicatorProps) => {
  return (
    <View className="flex-row justify-center items-center gap-1 px-2">
      {DAYS.map((day, index) => {
        const isCurrentDay = currentDay === index
        const isCompleted = hasCompletedChakra(index)
        // Use timegate service to check if day is accessible (includes dev override and lifetime bypass)
        const isUnlocked = isChakraDayAccessible(
          index,
          hasLifetimeAccess, // APP_1: false, APP_2: true (properly routes to correct logic)
          hasParticipatedDay,
          currentDay,
          allChakrasCompleted,
        )

        return (
          <View
            key={index}
            className={dayIndicatorVariants({
              current: isCurrentDay,
              unlocked: isUnlocked,
              completed: isCompleted,
            })}
          >
            <AppText
              font="koh-santepheap"
              className={dayTextVariants({ current: isCurrentDay })}
            >
              {day}
            </AppText>
          </View>
        )
      })}
    </View>
  )
}
