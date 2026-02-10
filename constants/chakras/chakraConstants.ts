/**
 * Chakra Constants
 *
 * Centralized constants for chakra names, day names, and helper functions
 * Used throughout the app for consistency
 */

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

export const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
] as const

/**
 * Get day name from day index (0-6, Monday-Sunday)
 */
export const getDayName = (dayIndex: number): string => {
  if (dayIndex < 0 || dayIndex > 6) {
    return DAY_NAMES[0]
  }
  return DAY_NAMES[dayIndex]
}

/**
 * Get chakra name from day index (0-6, Root-Crown)
 */
export const getChakraName = (dayIndex: number): string => {
  if (dayIndex < 0 || dayIndex > 6) {
    return CHAKRA_NAMES[0]
  }
  return CHAKRA_NAMES[dayIndex]
}

/**
 * Get chakra color (hex) from day index
 */
export const getChakraColor = (dayIndex: number): string => {
  const colors = [
    "#DC2626", // Root - Red
    "#EA580C", // Sacral - Orange
    "#FCD34D", // Solar Plexus - Yellow
    "#10B981", // Heart - Green
    "#3B82F6", // Throat - Blue
    "#6366F1", // Third Eye - Indigo
    "#9333EA", // Crown - Purple
  ]
  if (dayIndex < 0 || dayIndex > 6) {
    return colors[0]
  }
  return colors[dayIndex]
}

/**
 * Get chakra image source from day index
 */
export const getChakraImage = (dayIndex: number) => {
  const images = [
    require("@/assets/images/root.png"),
    require("@/assets/images/sacral.png"),
    require("@/assets/images/solar.png"),
    require("@/assets/images/heart.png"),
    require("@/assets/images/throat.png"),
    require("@/assets/images/thirdeye.png"),
    require("@/assets/images/crown.png"),
  ]
  if (dayIndex < 0 || dayIndex > 6) {
    return images[0]
  }
  return images[dayIndex]
}
