import { chakraContent } from '@/constants/chakras/content'
import { formatHeroAffirmationText } from '@/constants/heroAffirmation'
import { getChakraFromDay } from '@/utils/chakraMapping'

export type EndOfDayBeat = {
    text: string
    holdMs: number
    hero?: boolean
    showChakra?: boolean
}

const AWAKEN_LINE: Record<number, string> = {
    0: 'Feel your root awaken',
    1: 'Feel your sacral awaken',
    2: 'Feel your solar plexus awaken',
    3: 'Feel your heart awaken',
    4: 'Feel your throat awaken',
    5: 'Feel your third eye awaken',
    6: 'Feel your crown awaken',
}

export function mantraForDay(dayIndex: number): string {
    const chakra = getChakraFromDay(dayIndex)
    const raw = chakraContent[chakra]?.affirmationText ?? ''
    return formatHeroAffirmationText(raw)
}

export function getEndOfDayBeats(dayIndex: number): EndOfDayBeat[] {
    const clamped = dayIndex < 0 || dayIndex > 6 ? 0 : dayIndex
    return [
        { text: 'Take a breath', holdMs: 3600 },
        { text: 'And Exhale', holdMs: 3600 },
        { text: AWAKEN_LINE[clamped], holdMs: 4200, hero: true },
        { text: 'Allow this space to resonate within you', holdMs: 4200 },
        {
            text: mantraForDay(clamped),
            holdMs: 4800,
            hero: true,
            showChakra: true,
        },
    ]
}
