/**
 * Cosmic Time – Sidereal, Tropical & Lunar
 *
 * Two ways of knowing the same moment.
 * Tropical (Western, seasonal) + Sidereal (Vedic, star-based) + Lunar phase.
 */

import { getDayName } from "@/constants/chakras/chakraConstants"
import { getTraditionalDayName, getSanskritDayName } from "./calendarDual"

// Zodiac signs (tropical order from Aries)
const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", tropicalStart: { month: 3, day: 21 } },
  { name: "Taurus", symbol: "♉", tropicalStart: { month: 4, day: 20 } },
  { name: "Gemini", symbol: "♊", tropicalStart: { month: 5, day: 21 } },
  { name: "Cancer", symbol: "♋", tropicalStart: { month: 6, day: 21 } },
  { name: "Leo", symbol: "♌", tropicalStart: { month: 7, day: 23 } },
  { name: "Virgo", symbol: "♍", tropicalStart: { month: 8, day: 23 } },
  { name: "Libra", symbol: "♎", tropicalStart: { month: 9, day: 23 } },
  { name: "Scorpio", symbol: "♏", tropicalStart: { month: 10, day: 23 } },
  { name: "Sagittarius", symbol: "♐", tropicalStart: { month: 11, day: 22 } },
  { name: "Capricorn", symbol: "♑", tropicalStart: { month: 12, day: 22 } },
  { name: "Aquarius", symbol: "♒", tropicalStart: { month: 1, day: 20 } },
  { name: "Pisces", symbol: "♓", tropicalStart: { month: 2, day: 19 } },
] as const

// Lunar phases for display
const LUNAR_PHASES = [
  { name: "New Moon", emoji: "🌑" },
  { name: "Waxing Crescent", emoji: "🌒" },
  { name: "First Quarter", emoji: "🌓" },
  { name: "Waxing Gibbous", emoji: "🌔" },
  { name: "Full Moon", emoji: "🌕" },
  { name: "Waning Gibbous", emoji: "🌖" },
  { name: "Last Quarter", emoji: "🌗" },
  { name: "Waning Crescent", emoji: "🌘" },
] as const

/** Lahiri ayanamsa (degrees) – approximate for 2025. Increases ~50" per year. */
const AYANAMSHA_2025 = 24.15

/** Lunation cycle in days (~29.530588853) */
const LUNAR_CYCLE_DAYS = 29.530588853

/** Known new moon reference (Julian date) – 2024 Jan 11 */
const REFERENCE_NEW_MOON_JD = 2460320.5

/**
 * Get day of week as 0–6 (Monday=0, Sunday=6)
 */
function getDayOfWeek(date: Date): number {
  const jsDay = date.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Convert Date to simplified Julian date (days since epoch)
 */
function toJulianDate(date: Date): number {
  const t = date.getTime()
  return t / 86400000 + 2440587.5
}

/**
 * Get sun's approximate tropical longitude (0–360°) for a date.
 * Simplified: assumes circular orbit, vernal equinox ~Mar 20.
 */
function getTropicalSunLongitude(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours() + date.getMinutes() / 60

  // Approximate vernal equinox (Mar 20 or 21)
  const vernalEquinox = new Date(year, 2, 20, 12, 0, 0)
  const daysSinceEquinox = (date.getTime() - vernalEquinox.getTime()) / 86400000

  // Sun moves ~0.9856° per day (360/365.25)
  let longitude = (daysSinceEquinox * 360) / 365.25
  while (longitude < 0) longitude += 360
  while (longitude >= 360) longitude -= 360
  return longitude
}

/**
 * Get tropical sun sign and symbol from longitude
 */
function longitudeToSign(longitude: number): (typeof ZODIAC_SIGNS)[number] {
  const index = Math.floor(longitude / 30) % 12
  return ZODIAC_SIGNS[index]
}

/**
 * Get Lahiri ayanamsa for a given year (simplified)
 */
function getAyanamsa(year: number): number {
  return AYANAMSHA_2025 + (year - 2025) * (50 / 3600)
}

/**
 * Get lunar age (days since new moon) 0–29.53
 */
function getLunarAge(date: Date): number {
  const jd = toJulianDate(date)
  const cycles = (jd - REFERENCE_NEW_MOON_JD) / LUNAR_CYCLE_DAYS
  const age = (cycles - Math.floor(cycles)) * LUNAR_CYCLE_DAYS
  return age
}

/**
 * Map lunar age to phase index (0–7)
 */
function lunarAgeToPhaseIndex(age: number): number {
  const pct = age / LUNAR_CYCLE_DAYS
  if (pct < 0.0625) return 0 // New
  if (pct < 0.1875) return 1 // Waxing Crescent
  if (pct < 0.3125) return 2 // First Quarter
  if (pct < 0.4375) return 3 // Waxing Gibbous
  if (pct < 0.5625) return 4 // Full
  if (pct < 0.6875) return 5 // Waning Gibbous
  if (pct < 0.8125) return 6 // Last Quarter
  return 7 // Waning Crescent
}

export interface CosmicContext {
  tropicalSunSign: string
  tropicalSignSymbol: string
  siderealSunSign: string
  siderealSignSymbol: string
  lunarPhase: string
  lunarPhaseEmoji: string
  lunarDay: number
  dayIndex: number
  dayNameGregorian: string
  dayNameTraditional: string
  dayNameSanskrit: string
}

/**
 * Get full cosmic context for a given date.
 * Tropical + Sidereal + Lunar + Day names.
 */
export function getCosmicContext(date: Date = new Date()): CosmicContext {
  const dayIndex = getDayOfWeek(date)
  const tropicalLongitude = getTropicalSunLongitude(date)
  const ayanamsa = getAyanamsa(date.getFullYear())
  const siderealLongitude = tropicalLongitude - ayanamsa
  const siderealLongitudeNorm =
    siderealLongitude < 0 ? siderealLongitude + 360 : siderealLongitude

  const tropicalSign = longitudeToSign(tropicalLongitude)
  const siderealSign = longitudeToSign(siderealLongitudeNorm)

  const lunarAge = getLunarAge(date)
  const phaseIndex = lunarAgeToPhaseIndex(lunarAge)
  const phase = LUNAR_PHASES[phaseIndex]

  return {
    tropicalSunSign: tropicalSign.name,
    tropicalSignSymbol: tropicalSign.symbol,
    siderealSunSign: siderealSign.name,
    siderealSignSymbol: siderealSign.symbol,
    lunarPhase: phase.name,
    lunarPhaseEmoji: phase.emoji,
    lunarDay: Math.floor(lunarAge) + 1,
    dayIndex,
    dayNameGregorian: getDayName(dayIndex),
    dayNameTraditional: getTraditionalDayName(dayIndex),
    dayNameSanskrit: getSanskritDayName(dayIndex),
  }
}

/**
 * Get cosmic context for Anua (compact for prompt)
 */
export function getCosmicContextForAnua(date: Date = new Date()): {
  tropicalSunSign: string
  siderealSunSign: string
  lunarPhase: string
  dayNameSanskrit: string
} {
  const ctx = getCosmicContext(date)
  return {
    tropicalSunSign: ctx.tropicalSunSign,
    siderealSunSign: ctx.siderealSunSign,
    lunarPhase: ctx.lunarPhase,
    dayNameSanskrit: ctx.dayNameSanskrit,
  }
}
