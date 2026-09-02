/**
 * Music Room full-screen player field variants (days 0–6).
 * Master + crystal bowl share the sanctuary goodbye fields;
 * tuning fork + Asha use distinct motion/gradient profiles on the same fields.
 */

import type { MusicRoomTrackKind } from '@/constants/musicRoomLibrary'

export type MusicRoomFieldVariant = {
    gradientTop: string
    gradientMid: string
    gradientBottom: string
    primarySwirlDuration: number
    secondarySwirlDuration: number
    goldSwirlDuration: number
    driftScale: number
    driftDurationMs: number
    vignetteOpacity: number
}

const BASE = {
    gradientTop: 'rgba(0,0,0,0.42)',
    gradientMid: 'rgba(0,0,0,0.52)',
    gradientBottom: 'rgba(0,0,0,0.74)',
    primarySwirlDuration: 24000,
    secondarySwirlDuration: 17000,
    goldSwirlDuration: 28000,
    driftScale: 1.055,
    driftDurationMs: 32000,
    vignetteOpacity: 1,
} as const

/** Master embodiment — calm, deep, pulsing ball. */
const MASTER: MusicRoomFieldVariant = { ...BASE }

/** Crystal bowl — warmer veil, slower drift. */
const CRYSTAL: MusicRoomFieldVariant = {
    ...BASE,
    gradientTop: 'rgba(20,12,8,0.38)',
    gradientMid: 'rgba(12,8,6,0.58)',
    gradientBottom: 'rgba(0,0,0,0.78)',
    primarySwirlDuration: 32000,
    secondarySwirlDuration: 22000,
    goldSwirlDuration: 36000,
    driftScale: 1.07,
    driftDurationMs: 42000,
}

/** Tuning fork — lighter, quicker ripples (14 unique day profiles via duration offsets). */
const TUNING_FORK_DAY_OFFSET: MusicRoomFieldVariant[] = [
    {
        ...BASE,
        gradientTop: 'rgba(8,4,4,0.36)',
        gradientMid: 'rgba(6,6,10,0.48)',
        gradientBottom: 'rgba(0,0,0,0.72)',
        primarySwirlDuration: 14000,
        secondarySwirlDuration: 9800,
        goldSwirlDuration: 18000,
        driftScale: 1.04,
        driftDurationMs: 22000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(12,6,4,0.36)',
        gradientMid: 'rgba(8,6,8,0.5)',
        gradientBottom: 'rgba(0,0,0,0.73)',
        primarySwirlDuration: 15000,
        secondarySwirlDuration: 10200,
        goldSwirlDuration: 19000,
        driftScale: 1.042,
        driftDurationMs: 23000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(10,8,4,0.35)',
        gradientMid: 'rgba(8,8,6,0.5)',
        gradientBottom: 'rgba(0,0,0,0.72)',
        primarySwirlDuration: 15500,
        secondarySwirlDuration: 10500,
        goldSwirlDuration: 19500,
        driftScale: 1.044,
        driftDurationMs: 24000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(4,10,8,0.35)',
        gradientMid: 'rgba(6,10,8,0.5)',
        gradientBottom: 'rgba(0,0,0,0.72)',
        primarySwirlDuration: 16000,
        secondarySwirlDuration: 10800,
        goldSwirlDuration: 20000,
        driftScale: 1.046,
        driftDurationMs: 25000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(4,8,14,0.35)',
        gradientMid: 'rgba(6,8,12,0.5)',
        gradientBottom: 'rgba(0,0,0,0.73)',
        primarySwirlDuration: 16500,
        secondarySwirlDuration: 11000,
        goldSwirlDuration: 20500,
        driftScale: 1.048,
        driftDurationMs: 26000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(6,4,14,0.36)',
        gradientMid: 'rgba(8,6,14,0.52)',
        gradientBottom: 'rgba(0,0,0,0.74)',
        primarySwirlDuration: 17000,
        secondarySwirlDuration: 11200,
        goldSwirlDuration: 21000,
        driftScale: 1.05,
        driftDurationMs: 27000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(10,4,12,0.36)',
        gradientMid: 'rgba(8,6,12,0.52)',
        gradientBottom: 'rgba(0,0,0,0.75)',
        primarySwirlDuration: 17500,
        secondarySwirlDuration: 11500,
        goldSwirlDuration: 21500,
        driftScale: 1.052,
        driftDurationMs: 28000,
    },
]

/** Asha speaks — soft rose-gold warmth, gentle drift (14 day profiles). */
const ASHA_DAY_OFFSET: MusicRoomFieldVariant[] = [
    {
        ...BASE,
        gradientTop: 'rgba(16,8,6,0.4)',
        gradientMid: 'rgba(12,10,8,0.55)',
        gradientBottom: 'rgba(0,0,0,0.76)',
        primarySwirlDuration: 26000,
        secondarySwirlDuration: 19000,
        goldSwirlDuration: 30000,
        driftScale: 1.06,
        driftDurationMs: 36000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(18,10,6,0.4)',
        gradientMid: 'rgba(14,10,8,0.55)',
        gradientBottom: 'rgba(0,0,0,0.76)',
        primarySwirlDuration: 26500,
        secondarySwirlDuration: 19200,
        goldSwirlDuration: 30500,
        driftScale: 1.061,
        driftDurationMs: 36500,
    },
    {
        ...BASE,
        gradientTop: 'rgba(16,12,6,0.4)',
        gradientMid: 'rgba(12,12,8,0.55)',
        gradientBottom: 'rgba(0,0,0,0.76)',
        primarySwirlDuration: 27000,
        secondarySwirlDuration: 19400,
        goldSwirlDuration: 31000,
        driftScale: 1.062,
        driftDurationMs: 37000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(10,14,10,0.4)',
        gradientMid: 'rgba(10,14,10,0.55)',
        gradientBottom: 'rgba(0,0,0,0.76)',
        primarySwirlDuration: 27500,
        secondarySwirlDuration: 19600,
        goldSwirlDuration: 31500,
        driftScale: 1.063,
        driftDurationMs: 37500,
    },
    {
        ...BASE,
        gradientTop: 'rgba(8,12,16,0.4)',
        gradientMid: 'rgba(10,12,14,0.55)',
        gradientBottom: 'rgba(0,0,0,0.76)',
        primarySwirlDuration: 28000,
        secondarySwirlDuration: 19800,
        goldSwirlDuration: 32000,
        driftScale: 1.064,
        driftDurationMs: 38000,
    },
    {
        ...BASE,
        gradientTop: 'rgba(10,8,16,0.4)',
        gradientMid: 'rgba(12,10,14,0.55)',
        gradientBottom: 'rgba(0,0,0,0.77)',
        primarySwirlDuration: 28500,
        secondarySwirlDuration: 20000,
        goldSwirlDuration: 32500,
        driftScale: 1.065,
        driftDurationMs: 38500,
    },
    {
        ...BASE,
        gradientTop: 'rgba(14,8,14,0.4)',
        gradientMid: 'rgba(12,10,14,0.56)',
        gradientBottom: 'rgba(0,0,0,0.77)',
        primarySwirlDuration: 29000,
        secondarySwirlDuration: 20200,
        goldSwirlDuration: 33000,
        driftScale: 1.066,
        driftDurationMs: 39000,
    },
]

export function getMusicRoomFieldVariant(
    trackKind: MusicRoomTrackKind,
    dayIndex: number,
): MusicRoomFieldVariant {
    const day = Math.max(0, Math.min(6, dayIndex))
    switch (trackKind) {
        case 'embodiment':
            return MASTER
        case 'crystal_bowl':
            return CRYSTAL
        case 'tuning_fork':
            return TUNING_FORK_DAY_OFFSET[day] ?? TUNING_FORK_DAY_OFFSET[0]
        case 'head_to_heart':
            return ASHA_DAY_OFFSET[day] ?? ASHA_DAY_OFFSET[0]
        default:
            return MASTER
    }
}
