import React, { useEffect } from "react"
import { View, Image } from "react-native"
import { tv } from "tailwind-variants"
import { AppText } from "@/components/AppText"
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated"
import { isChakraDayAccessible } from "@/src/services/timegate"

interface ChakraStackIndicatorProps {
  currentDay: number
  hasCompletedChakra: (day: number) => boolean
  hasParticipatedDay: (day: number) => boolean
  allChakrasCompleted: boolean
  hasLifetimeAccess?: boolean // APP_2 (Lifetime): Pass to timegate service
}

const CHAKRAS = [
  {
    day: 6,
    name: "Crown",
    dayLabel: "Su",
    image: require("@/assets/images/crown.png"),
  },
  {
    day: 5,
    name: "Third Eye",
    dayLabel: "Sa",
    image: require("@/assets/images/thirdeye.png"),
  },
  {
    day: 4,
    name: "Throat",
    dayLabel: "F",
    image: require("@/assets/images/throat.png"),
  },
  {
    day: 3,
    name: "Heart",
    dayLabel: "Th",
    image: require("@/assets/images/heart.png"),
  },
  {
    day: 2,
    name: "Solar",
    dayLabel: "W",
    image: require("@/assets/images/solar.png"),
  },
  {
    day: 1,
    name: "Sacral",
    dayLabel: "T",
    image: require("@/assets/images/sacral.png"),
  },
  {
    day: 0,
    name: "Root",
    dayLabel: "M",
    image: require("@/assets/images/root.png"),
  },
]

// Define variants using tailwind-variants
const imageVariants = tv({
  base: "w-7 h-7",
  variants: {
    unlocked: {
      true: "",
      false: "opacity-30",
    },
  },
})

const dayLabelVariants = tv({
  base: "text-xs",
  variants: {
    unlocked: {
      true: "text-white font-bold",
      false: "text-white/40",
    },
  },
})

const nameVariants = tv({
  base: "text-xs",
  variants: {
    unlocked: {
      true: "text-white/70",
      false: "text-white/30",
    },
  },
})

export const ChakraStackIndicator = ({
  currentDay,
  hasCompletedChakra,
  hasParticipatedDay,
  allChakrasCompleted,
  hasLifetimeAccess = false, // APP_2 (Lifetime): Default to false for trial mode
}: ChakraStackIndicatorProps) => {
  const pulseValue = useSharedValue(1)

  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    )
  }, [pulseValue])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }))

  return (
    <View
      className={`absolute top-1/2 -translate-y-1/2 z-10 bg-black/30 rounded-r-xl px-3 py-4`}
    >
      {CHAKRAS.map((chakra) => {
        const isCurrentDay = currentDay === chakra.day
        // Use timegate service to check if chakra is accessible (includes dev override and lifetime bypass)
        const isUnlocked = isChakraDayAccessible(
          chakra.day,
          hasLifetimeAccess, // APP_1: false, APP_2: true (properly routes to correct logic)
          hasParticipatedDay,
          currentDay,
          allChakrasCompleted,
        )
        const isCompleted = hasCompletedChakra(chakra.day)

        return (
          <View
            key={chakra.day}
            className="flex-row items-center mb-4 last:mb-0"
          >
            <Animated.View
              style={[isCurrentDay && pulseStyle]}
              className={`
                w-9 h-9 rounded-full justify-center items-center
                ${isCompleted ? "border-2 border-white" : ""}
                ${isCurrentDay ? "bg-white/20" : ""}
              `}
            >
              <Image
                source={chakra.image}
                className={imageVariants({ unlocked: isUnlocked })}
                resizeMode="contain"
              />
            </Animated.View>

            <View className="ml-3">
              <AppText
                font="koh-santepheap"
                className={dayLabelVariants({ unlocked: isUnlocked })}
              >
                {chakra.dayLabel}
              </AppText>
              <AppText
                font="koh-santepheap"
                className={nameVariants({ unlocked: isUnlocked })}
              >
                {chakra.name}
              </AppText>
            </View>
          </View>
        )
      })}
    </View>
  )
}
