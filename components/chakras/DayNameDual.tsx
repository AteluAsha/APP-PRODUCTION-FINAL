/**
 * DayNameDual – Gregorian, traditional, and Sanskrit day names
 *
 * Subtle gnosis: two (or three) ways of knowing the same moment.
 * Used where day of week is shown (DateSelection, WaitingScreen, ChakraHub).
 */

import React from "react"
import { View } from "react-native"
import { AppText } from "@/components/AppText"
import { getDayName } from "@/constants/chakras/chakraConstants"
import { getTraditionalDayName, getSanskritDayName } from "@/utils/calendarDual"

interface DayNameDualProps {
  dayIndex: number // 0–6, Monday–Sunday
  /** Compact: "Monday · Moon's Day" | stacked: two/three lines */
  variant?: "compact" | "stacked"
  /** Include Sanskrit (Chandra Vāra, etc.) in stacked variant */
  showSanskrit?: boolean
  className?: string
}

export const DayNameDual: React.FC<DayNameDualProps> = ({
  dayIndex,
  variant = "compact",
  showSanskrit = false,
  className = "",
}) => {
  const gregorian = getDayName(dayIndex)
  const traditional = getTraditionalDayName(dayIndex)
  const sanskrit = getSanskritDayName(dayIndex)

  if (variant === "stacked") {
    return (
      <View className={`items-center ${className}`}>
        <AppText font="instrument-medium" size="base" className="text-white/90">
          {gregorian}
        </AppText>
        <AppText
          font="instrument-regular"
          size="xs"
          className="text-white/50 italic mt-0.5"
        >
          {traditional}
        </AppText>
        {showSanskrit && (
          <AppText
            font="instrument-regular"
            size="xs"
            className="text-white/40 italic mt-0.5"
          >
            {sanskrit}
          </AppText>
        )}
      </View>
    )
  }

  return (
    <View className={`flex-row flex-wrap items-center gap-x-1 ${className}`}>
      <AppText font="instrument-medium" size="sm" className="text-white/90">
        {gregorian}
      </AppText>
      <AppText font="instrument-regular" size="sm" className="text-white/50">
        ·
      </AppText>
      <AppText font="instrument-italic" size="sm" className="text-white/60">
        {traditional}
      </AppText>
      {showSanskrit && (
        <>
          <AppText
            font="instrument-regular"
            size="sm"
            className="text-white/50"
          >
            {" "}
            ·{" "}
          </AppText>
          <AppText font="instrument-italic" size="xs" className="text-white/50">
            {sanskrit}
          </AppText>
        </>
      )}
    </View>
  )
}
