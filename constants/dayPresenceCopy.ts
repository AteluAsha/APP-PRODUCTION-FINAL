export type PresenceBeat = {
    text: string
    holdMs: number
    hero?: boolean
}

const ROOT_BEATS: PresenceBeat[] = [
    {
        text: 'Take this moment to be with nature\nso we can go within and awaken the Soul.',
        holdMs: 4800,
    },
    {
        text: 'Today is about letting your body listen.',
        holdMs: 4200,
    },
    {
        text: 'Breathe in and exhale.',
        holdMs: 3600,
    },
    {
        text: 'Get your earphones and just be.',
        holdMs: 0,
    },
]

const SHARED_CLOSING_BEATS: PresenceBeat[] = [
    {
        text: 'Today is about letting your body listen.',
        holdMs: 4200,
    },
    {
        text: 'Breathe in and exhale.',
        holdMs: 3600,
    },
    {
        text: 'Get your earphones and just be.',
        holdMs: 0,
    },
]

const DAY_OPENING: Record<number, string> = {
    1: 'Take this moment with the water.\nSoften, and go within.',
    2: 'Take this moment with the fire.\nStand gently in your light.',
    3: 'Take this moment with the living green.\nOpen, and go within.',
    4: 'Take this moment in the open sky.\nListen, and go within.',
    5: 'Take this moment in the quiet light.\nSee from within.',
    6: 'Take this moment in the vastness.\nExpand into the whole.',
}

function beatsForLaterDay(opening: string): PresenceBeat[] {
    return [
        { text: opening, holdMs: 4800 },
        ...SHARED_CLOSING_BEATS,
    ]
}

const SIMPLE_BEATS: Record<number, PresenceBeat[]> = {
    1: beatsForLaterDay(DAY_OPENING[1]),
    2: beatsForLaterDay(DAY_OPENING[2]),
    3: beatsForLaterDay(DAY_OPENING[3]),
    4: beatsForLaterDay(DAY_OPENING[4]),
    5: beatsForLaterDay(DAY_OPENING[5]),
    6: beatsForLaterDay(DAY_OPENING[6]),
}

export function presenceHoldBeforeButtonMs(dayIndex: number): number {
    return getDayPresenceBeats(dayIndex).reduce((sum, beat) => sum + beat.holdMs, 0)
}

export function getDayPresenceBeats(dayIndex: number): PresenceBeat[] {
    if (dayIndex <= 0) return ROOT_BEATS
    return SIMPLE_BEATS[dayIndex] ?? SIMPLE_BEATS[1]
}

export const I_AM_PRESENT_LABEL = 'I Am Present'
