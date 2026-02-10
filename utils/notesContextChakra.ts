/**
 * Notes Context Chakra - Derive chakra day from route
 *
 * Store notes to the SCREEN the user is viewing, not the calendar date.
 * If user is on Root (Monday) chakra page and writes a note → store to Root.
 */

import { isValidChakra } from "@/utils/validation"
import { CHAKRA_TO_DAY } from "@/utils/chakraMapping"
import { Chakra } from "@/types/chakras/Chakra"

/**
 * Get chakra day (0-6) from the current route.
 * Returns null when not on a chakra detail page (e.g. ChakraHome, Gallery).
 *
 * - /(chakras)/root → 0 (Monday/Root)
 * - /(chakras)/throat → 4 (Friday/Throat)
 * - /(chakras)/ChakraHome → null (use getCurrentDayOfWeek)
 */
export function getContextChakraDayFromRoute(
  pathname: string | undefined,
  segments: (string | number)[],
): number | null {
  if (!pathname) return null

  // Try last segment first (e.g. pathname "/(chakras)/root" → segment "root")
  const parts = pathname.split("/").filter(Boolean)
  const lastPart = parts[parts.length - 1]
  if (lastPart && isValidChakra(lastPart)) {
    return CHAKRA_TO_DAY[lastPart as Chakra]
  }

  // Try last segment from segments array
  const lastSegment = segments[segments.length - 1]
  const segmentStr =
    typeof lastSegment === "string" ? lastSegment : String(lastSegment)
  if (segmentStr && isValidChakra(segmentStr)) {
    return CHAKRA_TO_DAY[segmentStr as Chakra]
  }

  return null
}
