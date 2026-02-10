/**
 * Scroll Date Picker
 *
 * Simple date picker for selecting Mondays
 */

import React, { useState } from "react"
import { View, ScrollView, Pressable } from "react-native"
import { AppText } from "@/components/AppText"
import { getNextMondayDate } from "@/utils/date"

interface ScrollDatePickerProps {
  onDateSelect: (dateISO: string) => void
  selectedDateISO?: string | null
}

export const ScrollDatePicker: React.FC<ScrollDatePickerProps> = ({
  onDateSelect,
  selectedDateISO,
}) => {
  // Generate next 6 Mondays for better swiping experience
  const generateMondays = () => {
    const mondays: string[] = []
    const nextMonday = getNextMondayDate()

    for (let i = 0; i < 6; i++) {
      const date = new Date(nextMonday)
      date.setDate(date.getDate() + i * 7)
      mondays.push(date.toISOString().split("T")[0])
    }

    return mondays
  }

  const mondays = generateMondays()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexDirection: "row" }}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      decelerationRate="fast"
      snapToInterval={undefined}
      snapToAlignment="center"
      pagingEnabled={false}
    >
      {mondays.map((mondayISO) => {
        const isSelected = selectedDateISO === mondayISO
        const date = new Date(mondayISO + "T00:00:00")
        const dateStr = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })

        return (
          <Pressable
            key={mondayISO}
            onPress={() => onDateSelect(mondayISO)}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              marginRight: 12,
              minWidth: 100,
              backgroundColor: isSelected
                ? "rgba(135, 174, 115, 0.3)"
                : "rgba(0, 0, 0, 0.4)",
              borderWidth: 1,
              borderColor: isSelected
                ? "rgba(6, 182, 212, 0.5)"
                : "rgba(135, 174, 115, 0.2)",
              shadowColor: isSelected
                ? "rgba(6, 182, 212, 0.4)"
                : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isSelected ? 0.6 : 0,
              shadowRadius: isSelected ? 8 : 0,
            }}
          >
            <AppText
              font={isSelected ? "instrument-bold" : "instrument-regular"}
              size="base"
              style={{
                color: isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
              }}
            >
              {dateStr}
            </AppText>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
