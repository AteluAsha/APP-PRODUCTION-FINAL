/**
 * Scroll Date Picker
 *
 * Monday start dates only. Options are never strictly before "today" in local time (YYYY-MM-DD).
 */

import React from "react"
import { ScrollView, Pressable, Platform } from "react-native"
import { AppText } from "@/components/AppText"
import { getLocalDateISO, getStartOfWeek } from "@/utils/date"

/** Android: vibrant cyan date label (unselected / selected pair with rim + fill). */
const ANDROID_DATE_TEXT_UNSELECTED = "#38bdf8"
const ANDROID_DATE_TEXT_SELECTED = "#ecfeff"

/** Android: brighter square rims around each date cell */
const ANDROID_CELL_BORDER_UNSELECTED = "rgba(56, 189, 248, 0.55)"
const ANDROID_CELL_BORDER_SELECTED = "rgba(34, 211, 238, 0.95)"
const ANDROID_CELL_SHADOW_SELECTED = "rgba(34, 211, 238, 0.55)"

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

        const isAndroid = Platform.OS === "android"

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
                ? isAndroid
                  ? "rgba(56, 189, 248, 0.18)"
                  : "rgba(135, 174, 115, 0.3)"
                : "rgba(0, 0, 0, 0.4)",
              borderWidth: 1,
              borderColor: isSelected
                ? isAndroid
                  ? ANDROID_CELL_BORDER_SELECTED
                  : "rgba(6, 182, 212, 0.5)"
                : isAndroid
                  ? ANDROID_CELL_BORDER_UNSELECTED
                  : "rgba(135, 174, 115, 0.2)",
              shadowColor: isSelected
                ? isAndroid
                  ? ANDROID_CELL_SHADOW_SELECTED
                  : "rgba(6, 182, 212, 0.4)"
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
                color: isAndroid
                  ? isSelected
                    ? ANDROID_DATE_TEXT_SELECTED
                    : ANDROID_DATE_TEXT_UNSELECTED
                  : isSelected
                    ? "#FFFFFF"
                    : "rgba(255, 255, 255, 0.8)",
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
