import { Chakra } from "@/types/chakras/Chakra"

/**
 * Utility functions for mapping between chakra days and Chakra enum
 * Centralized to avoid redundancy across components
 */

// Map day index (0-6) to Chakra enum
export const DAY_TO_CHAKRA: Record<number, Chakra> = {
  0: Chakra.ROOT,
  1: Chakra.SACRAL,
  2: Chakra.SOLAR_PLEXUS,
  3: Chakra.HEART,
  4: Chakra.THROAT,
  5: Chakra.THIRD_EYE,
  6: Chakra.CROWN,
}

// Map Chakra enum to day index (0-6)
export const CHAKRA_TO_DAY: Record<Chakra, number> = {
  [Chakra.ROOT]: 0,
  [Chakra.SACRAL]: 1,
  [Chakra.SOLAR_PLEXUS]: 2,
  [Chakra.HEART]: 3,
  [Chakra.THROAT]: 4,
  [Chakra.THIRD_EYE]: 5,
  [Chakra.CROWN]: 6,
}

/**
 * Get Chakra enum from day index (0-6)
 */
export const getChakraFromDay = (day: number): Chakra => {
  return DAY_TO_CHAKRA[day] || Chakra.ROOT
}

/**
 * Get day index (0-6) from Chakra enum
 */
export const getDayFromChakra = (chakra: Chakra): number => {
  return CHAKRA_TO_DAY[chakra] ?? 0
}

/**
 * Get chakra index (0-6) from Chakra enum
 * Alias for getDayFromChakra for consistency
 */
export const getChakraIndex = (chakra: Chakra): number => {
  return getDayFromChakra(chakra)
}

const CHAKRA_SLUGS = new Set<string>(Object.values(Chakra))

/** Parse a route/query slug (`root`, `solar`, `thirdeye`, …) to a Chakra. */
export function parseChakraSlug(
  param: string | string[] | undefined,
): Chakra | null {
  const raw = Array.isArray(param) ? param[0] : param
  if (!raw || typeof raw !== "string") return null
  const slug = raw.toLowerCase().trim()
  if (!CHAKRA_SLUGS.has(slug)) return null
  return slug as Chakra
}

/** Index of a gifted card in the unlocked gallery list; last card if unknown. */
export function galleryFocusIndex(
  unlocked: readonly Chakra[],
  focus: Chakra | null,
): number {
  if (unlocked.length === 0) return 0
  if (focus) {
    const index = unlocked.indexOf(focus)
    if (index >= 0) return index
  }
  return unlocked.length - 1
}
