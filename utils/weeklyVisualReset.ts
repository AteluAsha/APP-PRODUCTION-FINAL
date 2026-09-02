/**
 * Monday 00:00 local — uncheck end-of-day boxes and gold circles.
 * Gallery cards are a separate ever-collected set and are never cleared here.
 */

import { getCurrentWeekStartDateISO, getStartOfWeek } from '@/utils/date'

export function uniqueDayIds(...groups: Array<number[] | undefined>): number[] {
    const ids = new Set<number>()
    for (const group of groups) {
        if (!group) continue
        for (const day of group) {
            if (Number.isInteger(day) && day >= 0 && day <= 6) ids.add(day)
        }
    }
    return [...ids].sort((a, b) => a - b)
}

export function collectEverCompletedIds(state: {
    completedChakras?: number[]
    everCompletedChakras?: number[]
    trialHistory?: Array<{ daysParticipated?: number[] }>
}): number[] {
    const fromTrials =
        state.trialHistory?.flatMap((trial) => trial.daysParticipated ?? []) ??
        []
    return uniqueDayIds(
        state.everCompletedChakras,
        state.completedChakras,
        fromTrials,
    )
}

export type WeeklyVisualResetPlan = {
    weeklyVisualResetWeekStart: string
    completedChakras: number[]
    everCompletedChakras: number[]
    didClearWeekMarks: boolean
}

/**
 * First persist of the week stamp keeps this week's checks.
 * A new Monday (local midnight week start) clears checks only.
 */
export function planWeeklyVisualReset(opts: {
    lastResetWeekStart: string | null | undefined
    thisMonday: string
    completedChakras: number[]
    everCompletedChakras: number[]
}): WeeklyVisualResetPlan {
    const everCompletedChakras = uniqueDayIds(
        opts.everCompletedChakras,
        opts.completedChakras,
    )
    if (!opts.lastResetWeekStart) {
        return {
            weeklyVisualResetWeekStart: opts.thisMonday,
            completedChakras: opts.completedChakras,
            everCompletedChakras,
            didClearWeekMarks: false,
        }
    }
    if (opts.lastResetWeekStart === opts.thisMonday) {
        return {
            weeklyVisualResetWeekStart: opts.thisMonday,
            completedChakras: opts.completedChakras,
            everCompletedChakras,
            didClearWeekMarks: false,
        }
    }
    return {
        weeklyVisualResetWeekStart: opts.thisMonday,
        completedChakras: [],
        everCompletedChakras,
        didClearWeekMarks: true,
    }
}

export function msUntilNextMondayMidnight(now = new Date()): number {
    const thisMonday = getStartOfWeek(now)
    const nextMonday = new Date(thisMonday)
    if (now.getTime() >= thisMonday.getTime()) {
        nextMonday.setDate(thisMonday.getDate() + 7)
    }
    return Math.max(1_000, nextMonday.getTime() - now.getTime())
}

export function thisMondayIso(now = new Date()): string {
    return getCurrentWeekStartDateISO(now)
}
