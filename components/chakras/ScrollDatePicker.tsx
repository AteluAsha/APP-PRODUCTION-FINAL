/**
 * Scroll Date Picker
 *
 * Monday start dates only. Options are never strictly before "today" in local time (YYYY-MM-DD).
 */

import React from "react"
import { View, ScrollView, Pressable } from "react-native"
import { AppText } from "@/components/AppText"
import { getLocalDateISO, getStartOfWeek } from "@/utils/date"

interface ScrollDatePickerProps {
  onDateSelect: (dateISO: string) => void
  selectedDateISO?: string | null
}

export const ScrollDatePicker: React.FC<ScrollDatePickerProps> = ({
  onDateSelect,
  selectedDateISO,
}) => {
  /** Upcoming Mondays only (today’s Monday is included). Past Mondays in the same calendar week are skipped. */
  const generateMondays = () => {
    const mondays: string[] = []
    const todayISO = getLocalDateISO()
    let monday = getStartOfWeek(new Date())
    while (getLocalDateISO(monday) < todayISO) {
      monday.setDate(monday.getDate() + 7)
    }
    for (let i = 0; i < 6; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i * 7)
      mondays.push(getLocalDateISO(date))
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
