import { getChakraImage, getChakraName } from '@/constants/chakras/chakraConstants'

export type TomorrowAwakeningCopy = {
    nextDayIndex: number | null
    heading: string
    message: string
}

const NEXT_DAY_BLESSING: Record<number, string> = {
    1: 'Feel the flow of your authentic expression.',
    2: 'Stand in your truth and let your inner fire rise.',
    3: 'Soften, and let love move through you.',
    4: 'Speak with purity, compassion, and truth.',
    5: 'See from within, and trust what you already know.',
    6: 'Expand into the vastness of who you are.',
}

/** Copy shown on the hub after completing `completedDayIndex` (0–6). */
export function getTomorrowAwakeningCopy(
    completedDayIndex: number,
): TomorrowAwakeningCopy {
    const next = completedDayIndex + 1
    if (next > 6) {
        return {
            nextDayIndex: null,
            heading: 'The seven are awake',
            message:
                'Welcome to The Era of The Heart. Rest here. Return whenever you need.',
        }
    }
    const name = getChakraName(next)
    return {
        nextDayIndex: next,
        heading: `Tomorrow we awaken the ${name} chakra`,
        message: NEXT_DAY_BLESSING[next],
    }
}

export function tomorrowAwakeningImage(completedDayIndex: number) {
    const copy = getTomorrowAwakeningCopy(completedDayIndex)
    const day = copy.nextDayIndex ?? completedDayIndex
    return getChakraImage(day)
}
