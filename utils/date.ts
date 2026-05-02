/**
 * Date and time utility functions.
 * Combines functionality for handling specific dates, weeks, time differences, and formatting.
 *
 * CRITICAL: All dates use the device's LOCAL timezone to match user expectations.
 * - getLocalDateISO(): Today's date in local time (YYYY-MM-DD)
 * - getCurrentWeekStartDateISO(): Monday of current week in local time
 * - Parsing "YYYY-MM-DD" + "T00:00:00" ensures local midnight (not UTC)
 * - Never use toISOString().split("T")[0] for local dates – that returns UTC
 */

// --- Local Date (Timezone-Safe) ---

/**
 * Returns today's date as YYYY-MM-DD in the device's LOCAL timezone.
 * Use this instead of new Date().toISOString().split("T")[0] which returns UTC.
 */
export const getLocalDateISO = (date?: Date): string => {
  const d = date ?? new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// --- Day of Week & Week Start ---

/**
 * Returns the current day of week as a number (0 = Monday, 6 = Sunday)
 * Note that this differs from JavaScript's Date.getDay() where 0 = Sunday
 */
export const getCurrentDayOfWeek = (): number => {
  const date = new Date()
  const jsDay = date.getDay() // JS day: 0 = Sunday, 1 = Monday, ...

  // Convert to our format where 0 = Monday, 6 = Sunday
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Gets the Date object for the Monday of the week containing the given date.
 * @param date The date to find the start of the week for.
 * @returns The Date object representing Monday 00:00:00 of that week.
 */
export const getStartOfWeek = (date: Date): Date => {
  const dt = new Date(date)
  const day = dt.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(dt.setDate(diff))
  monday.setHours(0, 0, 0, 0) // Set to the beginning of the day
  return monday
}

/**
 * Gets the ISO date string (YYYY-MM-DD) for the Monday of the current week.
 * Uses local timezone – toISOString() would return UTC and cause timezone bugs.
 * @returns ISO date string (YYYY-MM-DD) in local time.
 */
export const getCurrentWeekStartDateISO = (): string => {
  const monday = getStartOfWeek(new Date())
  return getLocalDateISO(monday)
}

/**
 * Gets the date of the next Monday
 * If today is Monday, it returns today's date at midnight
 */
export const getNextMondayDate = (): Date => {
  const date = new Date()
  const currentDay = date.getDay() // JS day: 0 = Sunday, 1 = Monday

  // Calculate days until next Monday
  // If today is Sunday (0), need 1 day. If Monday (1), need 7 days (next week). If Tuesday (2), need 6 days.
  const daysUntilNextMonday = currentDay === 0 ? 1 : 7 - currentDay + 1

  // Create new date for next Monday
  const nextMonday = new Date(date)
  nextMonday.setDate(date.getDate() + daysUntilNextMonday)

  // Set time to midnight (00:00:00)
  nextMonday.setHours(0, 0, 0, 0)

  return nextMonday
}

// --- Time Remaining ---

/**
 * Calculate time remaining until a target date
 * Returns an object with days, hours, minutes, and seconds remaining
 */
export const getTimeRemaining = (
  targetDate: Date,
): {
  days: number
  hours: number
  minutes: number
  seconds: number
} => {
  const now = new Date()
  const targetMs = targetDate.getTime()
  if (Number.isNaN(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const diffMs = targetMs - now.getTime()

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  // Convert to time units
  const totalSeconds = Math.floor(diffMs / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)

  // Calculate individual units
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

// --- Formatting ---

/**
 * Formats a date as a readable string (e.g., "Monday, January 1")
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

/**
 * Gets a formatted string for the next Monday
 */
export const getFormattedNextMondayDate = (): string => {
  const nextMonday = getNextMondayDate()
  return formatDate(nextMonday)
}

/**
 * Calculates the course start date based on the initial open date.
 *
 * Rules:
 * - If initial open date is a Monday, course starts on initial open date + 7 days (next Monday)
 * - If initial open date is any other day, course starts on the very next upcoming Monday
 *
 * @param initialOpenDateISO ISO date string (YYYY-MM-DD) of when user first opened the app
 * @returns ISO date string (YYYY-MM-DD) of when the course should start
 */
export const calculateCourseStartDate = (
  initialOpenDateISO: string,
): string => {
  const initialDate = new Date(initialOpenDateISO + "T00:00:00") // Ensure local midnight
  const initialDayOfWeek = initialDate.getDay() // JS day: 0 = Sunday, 1 = Monday, ...

  // Convert to our format where 0 = Monday, 6 = Sunday
  const dayOfWeek = initialDayOfWeek === 0 ? 6 : initialDayOfWeek - 1

  let courseStartDate: Date

  if (dayOfWeek === 0) {
    // Initial open date is Monday - course starts 7 days later (next Monday)
    courseStartDate = new Date(initialDate)
    courseStartDate.setDate(initialDate.getDate() + 7)
  } else {
    // Initial open date is any other day - course starts on next Monday
    const daysUntilMonday = 7 - dayOfWeek
    courseStartDate = new Date(initialDate)
    courseStartDate.setDate(initialDate.getDate() + daysUntilMonday)
  }

  // Set time to midnight
  courseStartDate.setHours(0, 0, 0, 0)

  // Return ISO date string in local timezone (YYYY-MM-DD format)
  const year = courseStartDate.getFullYear()
  const month = String(courseStartDate.getMonth() + 1).padStart(2, "0")
  const day = String(courseStartDate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Checks if the current date has reached or passed the course start date.
 * Uses local timezone – "T00:00:00" ensures the date is parsed as local midnight
 * (new Date("YYYY-MM-DD") alone parses as UTC midnight, causing timezone bugs).
 * @param courseStartDateISO ISO date string (YYYY-MM-DD) of when the course should start
 * @returns true if current date >= course start date
 */
export const hasReachedCourseStartDate = (
  courseStartDateISO: string,
): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(courseStartDateISO)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const courseStartDate = new Date(courseStartDateISO + "T00:00:00")
  if (Number.isNaN(courseStartDate.getTime())) return false
  courseStartDate.setHours(0, 0, 0, 0)

  return today >= courseStartDate
}

/**
 * Returns the number of whole days between a past ISO date (YYYY-MM-DD) and today,
 * in the device's local timezone. Returns 0 for today, positive for past dates,
 * and a negative number for future dates. Returns null for invalid input.
 *
 * Used by trial-window guardrails (e.g. "has Trial 2's 7-day window elapsed?") so
 * that time-gated branches don't fire the instant a trial begins.
 */
export const daysSince = (isoDate: string | null | undefined): number | null => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null
  const parsed = new Date(isoDate + "T00:00:00")
  if (Number.isNaN(parsed.getTime())) return null
  parsed.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - parsed.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
