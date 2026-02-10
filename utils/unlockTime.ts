/**
 * Unlock Time Utilities
 *
 * Helper functions for calculating and formatting unlock times
 */

/**
 * Get next day unlock time string
 * Returns formatted string like "Unlocks Monday at midnight"
 */
export const getNextDayUnlockTimeString = (currentDay: number): string => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]
  const nextDayIndex = (currentDay + 1) % 7
  const nextDayName = days[nextDayIndex]

  return `Unlocks ${nextDayName} at midnight`
}

/**
 * Get next day unlock time string (alternative format)
 */
export const getNextDayUnlockTimeStringAlt = (currentDay: number): string => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]
  const nextDayIndex = (currentDay + 1) % 7
  const nextDayName = days[nextDayIndex]

  return `Next: ${nextDayName}`
}
