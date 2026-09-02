import { getChakraFromDay } from '@/utils/chakraMapping'

export function chakraDayRoute(day: number): string {
    return `/(chakras)/${getChakraFromDay(day)}`
}

export function nextChakraOpenPath(day: number, alreadyGrounded: boolean): string {
    if (!alreadyGrounded) return `/(chakras)/DayPresence?day=${day}`
    return chakraDayRoute(day)
}
