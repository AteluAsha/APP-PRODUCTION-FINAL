/**
 * Course daily check-ins: rolling 7 local days from now.
 * Noon = today's chakra. Evening 20:00 = tomorrow's chakra (night before).
 * Never for the day the app is currently open.
 */

export const WEEK1_DAY_COUNT = 7
export const WEEK1_NOON_HOUR = 12
export const WEEK1_EVENING_HOUR = 20
export const WEEK1_ID_PREFIX = 'week1-daily-'
export const COURSE_DAILY_PREFIX = 'course-daily-'

export type Week1SlotKind = 'noon' | 'evening'

export type Week1ReminderSlot = {
    id: string
    fireAt: Date
    kind: Week1SlotKind
    dateKey: string
}

export function localDateKey(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export function parseLocalDateKey(key: string): Date {
    return new Date(`${key}T00:00:00`)
}

function startOfLocalDay(d: Date): Date {
    const next = new Date(d)
    next.setHours(0, 0, 0, 0)
    return next
}

export function addLocalDays(anchor: Date, days: number): Date {
    const next = new Date(anchor)
    next.setDate(next.getDate() + days)
    return next
}

export function isWithinFirstJourneyWeek(
    anchorDateKey: string,
    now: Date,
): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(anchorDateKey)) return false
    const start = startOfLocalDay(parseLocalDateKey(anchorDateKey))
    const end = startOfLocalDay(addLocalDays(start, WEEK1_DAY_COUNT))
    return now < end
}

export function week1SlotId(kind: Week1SlotKind, dateKey: string): string {
    return `${COURSE_DAILY_PREFIX}${kind}-${dateKey}`
}

export function shouldOfferWeek1JourneyNotice(opts: {
    hasSeen: boolean
    initialOpenDate: string | null
    now?: Date
}): boolean {
    if (opts.hasSeen) return false
    if (!opts.initialOpenDate) return true
    return isWithinFirstJourneyWeek(
        opts.initialOpenDate,
        opts.now ?? new Date(),
    )
}

/**
 * Future noon + night-before slots for the next 7 local days, excluding today.
 * Opening the app re-syncs and drops whatever is left for the current calendar day.
 */
export function buildWeek1ReminderSlots(opts: {
    now: Date
    anchorDateKey?: string
}): Week1ReminderSlot[] {
    const start = startOfLocalDay(opts.now)
    const slots: Week1ReminderSlot[] = []

    for (let i = 1; i <= WEEK1_DAY_COUNT; i++) {
        const day = addLocalDays(start, i)
        const dateKey = localDateKey(day)

        const noon = new Date(day)
        noon.setHours(WEEK1_NOON_HOUR, 0, 0, 0)
        const evening = new Date(day)
        evening.setHours(WEEK1_EVENING_HOUR, 0, 0, 0)

        if (noon > opts.now) {
            slots.push({
                id: week1SlotId('noon', dateKey),
                fireAt: noon,
                kind: 'noon',
                dateKey,
            })
        }
        if (evening > opts.now) {
            slots.push({
                id: week1SlotId('evening', dateKey),
                fireAt: evening,
                kind: 'evening',
                dateKey,
            })
        }
    }

    return slots
}
