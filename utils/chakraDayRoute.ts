import { getChakraFromDay, parseChakraSlug } from '@/utils/chakraMapping'
import { Chakra } from '@/types/chakras/Chakra'

export function chakraDayRoute(day: number): string {
    return `/(chakras)/${getChakraFromDay(day)}`
}

export function nextChakraOpenPath(day: number, alreadyGrounded: boolean): string {
    if (!alreadyGrounded) return `/(chakras)/DayPresence?day=${day}`
    return chakraDayRoute(day)
}

function parseDayIndex(raw: string | string[] | undefined): number | null {
    const value = Array.isArray(raw) ? raw[0] : raw
    if (value == null || value === '') return null
    const n = parseInt(value, 10)
    if (!Number.isFinite(n) || n < 0 || n > 6) return null
    return n
}

/**
 * Same resolver for every day. Slug, leftover presence `?day=`, or segment.
 * Missing is missing — never "invalid Root" vs "invalid Heart".
 */
export function resolveCourseDayChakra(
    param: string | string[] | undefined,
    segments: readonly string[] = [],
    dayParam?: string | string[],
): Chakra | null {
    const fromSlug = parseChakraSlug(param)
    if (fromSlug) return fromSlug
    const dayIndex = parseDayIndex(dayParam)
    if (dayIndex != null) return getChakraFromDay(dayIndex)
    for (let i = segments.length - 1; i >= 0; i--) {
        const fromSegment = parseChakraSlug(segments[i])
        if (fromSegment) return fromSegment
    }
    return null
}
