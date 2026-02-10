/**
 * Calendar Dual Display – Gregorian & Traditional
 *
 * Subtle teaching: two ways of knowing the same moment.
 * Gregorian (common) and traditional planetary day names side by side.
 * Day index: 0 = Monday, 6 = Sunday
 */

// Traditional (planetary) day names – cosmic correspondence
// Monday = Moon, Tuesday = Mars, Wednesday = Mercury, Thursday = Jupiter,
// Friday = Venus, Saturday = Saturn, Sunday = Sun
const TRADITIONAL_DAY_NAMES = [
  "Moon's Day",
  "Mars's Day",
  "Mercury's Day",
  "Jupiter's Day",
  "Venus's Day",
  "Saturn's Day",
  "Sun's Day",
] as const

/**
 * Get traditional (planetary) day name for day index (0–6, Monday–Sunday)
 */
export const getTraditionalDayName = (dayIndex: number): string => {
  if (dayIndex < 0 || dayIndex > 6) {
    return TRADITIONAL_DAY_NAMES[0]
  }
  return TRADITIONAL_DAY_NAMES[dayIndex]
}

// Sanskrit (Vedic) day names – Chandra Vāra = Moon's day, etc.
const SANSKRIT_DAY_NAMES = [
  "Chandra Vāra", // Monday
  "Maṅgala Vāra", // Tuesday
  "Budha Vāra", // Wednesday
  "Guru Vāra", // Thursday
  "Śukra Vāra", // Friday
  "Śani Vāra", // Saturday
  "Sūrya Vāra", // Sunday
] as const

/**
 * Get Sanskrit (Vedic) day name for day index (0–6, Monday–Sunday)
 */
export const getSanskritDayName = (dayIndex: number): string => {
  if (dayIndex < 0 || dayIndex > 6) {
    return SANSKRIT_DAY_NAMES[0]
  }
  return SANSKRIT_DAY_NAMES[dayIndex]
}
