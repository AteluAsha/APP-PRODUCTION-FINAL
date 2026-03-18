import { getLocalDateISO } from "@/utils/date"

/**
 * Timegate Service
 *
 * Manages time-based access control for chakra content.
 *
 * Three paths (entry is in app/(chakras)/index.tsx):
 * - Trial, no courseStartDate: index → WelcomeScreen (path selection) → DateSelection → ChakraHome (waiting room) → course opens.
 * - Trial, courseStartDate set: index → ChakraHome directly (waiting room or main home per shouldShowWaitingScreen).
 * - Lifetime: index → ChakraHub directly.
 *
 * Timegate logic here applies ONLY after the user is in (ChakraHome or ChakraHub).
 * APP_1 (Trial): Timegates enforce progressive reveal (day-by-day unlock).
 * APP_2 (Lifetime): All timegates bypassed (full access); unless lifetimeChosenTimegateJourney (somatic journey).
 *
 * In development mode (__DEV__ === true), all timegates are bypassed for testing.
 */

/**
 * Check if development override is active
 *
 * In development mode (__DEV__ === true), all timegates are bypassed
 * to allow testing of features without waiting for specific days.
 *
 * @returns true if development override is active
 */
export const isDevelopmentOverrideActive = (): boolean => {
  return __DEV__ === true
}

/**
 * Check if timegate should be bypassed
 *
 * Timegate is bypassed if:
 * - Development override is active (__DEV__ === true)
 * - User has lifetime access
 *
 * @param hasLifetimeAccess - Whether user has lifetime access
 * @returns true if timegate should be bypassed
 */
export const shouldBypassTimegate = (hasLifetimeAccess: boolean): boolean => {
  const devOverride = isDevelopmentOverrideActive()

  if (devOverride) {
    return true
  }

  return hasLifetimeAccess
}

/**
 * APP_1 (Trial): Check if a chakra day should be accessible in trial mode
 *
 * Trial-specific timegate logic - progressive reveal, day-by-day unlock
 *
 * @param dayIndex - The day index (0-6, Monday-Sunday)
 * @param hasParticipatedDay - Function to check if user has participated in a day
 * @param currentDay - The current day of week (0-6)
 * @param allChakrasCompleted - Whether all chakras are completed
 * @returns true if the chakra day should be accessible in trial mode
 */
export const isTrialChakraAccessible = (
  dayIndex: number,
  hasParticipatedDay: (day: number) => boolean,
  currentDay: number,
  allChakrasCompleted: boolean,
): boolean => {
  // APP_1 (Trial): Weekly lock - locked to 7 days of the week
  // - Can always access current day (day of week)
  // - Can access days that were opened during the week (participated or completed)
  // - Cannot access missed days (past days not opened during the week)
  // - Cannot access future days (beyond current day)

  // Always allow access to current day (day of week)
  if (currentDay === dayIndex) {
    return true
  }

  // Allow access to days that were opened during the week
  if (hasParticipatedDay(dayIndex) || allChakrasCompleted) {
    return true
  }

  // Past days not opened = missed days (not accessible)
  // Future days = not yet accessible
  return false
}

/**
 * APP_2 (Lifetime): Check if a chakra day should be accessible in lifetime mode
 *
 * Lifetime mode: all days always accessible (no timegates)
 *
 * @returns true (always accessible in lifetime mode)
 */
export const isLifetimeChakraAccessible = (): boolean => {
  return true // Always accessible in lifetime mode
}

/**
 * Main function: Routes to correct logic based on app mode
 *
 * @param dayIndex - The day index (0-6, Monday-Sunday)
 * @param hasLifetimeAccess - Whether user has lifetime access (determines app mode)
 * @param hasParticipatedDay - Function to check if user has participated in a day
 * @param currentDay - The current day of week (0-6)
 * @param allChakrasCompleted - Whether all chakras are completed
 * @param inCourseMode - Lifetime user in somatic journey: apply trial timegates (progressive reveal)
 * @returns true if the chakra day should be accessible
 */
export const isChakraDayAccessible = (
  dayIndex: number,
  hasLifetimeAccess: boolean,
  hasParticipatedDay: (day: number) => boolean,
  currentDay: number,
  allChakrasCompleted: boolean,
  inCourseMode?: boolean,
): boolean => {
  // Development override: all days accessible
  if (isDevelopmentOverrideActive()) {
    return true
  }

  // Lifetime user in somatic journey (course mode): use trial timegate logic
  if (hasLifetimeAccess && inCourseMode) {
    return isTrialChakraAccessible(
      dayIndex,
      hasParticipatedDay,
      currentDay,
      allChakrasCompleted,
    )
  }

  // APP_2 (Lifetime): All days accessible
  if (hasLifetimeAccess) {
    return isLifetimeChakraAccessible()
  }

  // APP_1 (Trial): Progressive reveal logic
  return isTrialChakraAccessible(
    dayIndex,
    hasParticipatedDay,
    currentDay,
    allChakrasCompleted,
  )
}

/**
 * Check if journey should start automatically
 *
 * In development mode, journey starts immediately.
 *
 * @param hasLifetimeAccess - Whether user has lifetime access
 * @returns true if journey should start automatically
 */
export const shouldAutoStartJourney = (hasLifetimeAccess: boolean): boolean => {
  if (isDevelopmentOverrideActive()) {
    return true
  }

  return hasLifetimeAccess
}

/**
 * APP_1 (Trial): Check if waiting screen should be shown in trial mode
 *
 * Trial-specific waiting screen logic
 *
 * @param hasReachedStartDate - Whether the course start date has been reached
 * @param isMonday - Whether today is Monday
 * @param journeyStarted - Whether the journey has started
 * @param isFirstLaunch - Whether this is the first launch (for onboarding flow)
 * @param courseStartDate - The course start date (to detect onboarding)
 * @returns true if waiting screen should be shown in trial mode
 */
export const shouldShowTrialWaitingScreen = (
  hasReachedStartDate?: boolean,
  isMonday?: boolean,
  journeyStarted?: boolean,
  isFirstLaunch?: boolean,
  courseStartDate?: string | null,
): boolean => {
  // Development override: allow testing; but if user selected today (Monday) as start, go straight to trial home
  if (isDevelopmentOverrideActive()) {
    const startDateIsToday =
      courseStartDate != null && courseStartDate === getLocalDateISO()
    if (isMonday && startDateIsToday) {
      return false
    }
    if (!journeyStarted && (courseStartDate || isFirstLaunch)) {
      return true
    }
    return false
  }

  // Trial timegate logic
  if (
    hasReachedStartDate === undefined ||
    isMonday === undefined ||
    journeyStarted === undefined
  ) {
    return true // Show waiting screen if we don't have enough info
  }

  // If they chose today as start date and today is Monday, app opens (no waiting room)
  const startDateIsToday =
    courseStartDate != null && courseStartDate === getLocalDateISO()
  if (hasReachedStartDate && isMonday && startDateIsToday) {
    return false
  }

  return !hasReachedStartDate || !isMonday || !journeyStarted
}

/**
 * APP_2 (Lifetime): Check if waiting screen should be shown in lifetime mode
 *
 * Lifetime mode: never show waiting screen (full access)
 *
 * @returns false (never show waiting screen in lifetime mode)
 */
export const shouldShowLifetimeWaitingScreen = (): boolean => {
  return false // Never show waiting screen in lifetime mode
}

/**
 * Main function: Routes to correct logic based on app mode
 *
 * When lifetimeChosenTimegateJourney is true, lifetime user chose the somatic journey
 * (ChakraHub → DateSelection → ChakraHome) and should see trial-style waiting until
 * their chosen Monday.
 *
 * @param hasLifetimeAccess - Whether user has lifetime access (determines app mode)
 * @param hasReachedStartDate - Whether the course start date has been reached
 * @param isMonday - Whether today is Monday
 * @param journeyStarted - Whether the journey has started
 * @param isFirstLaunch - Whether this is the first launch (for onboarding flow)
 * @param courseStartDate - The course start date (to detect onboarding)
 * @param lifetimeChosenTimegateJourney - Lifetime user chose somatic journey (show waiting)
 * @returns true if waiting screen should be shown
 */
export const shouldShowWaitingScreen = (
  hasLifetimeAccess: boolean,
  hasReachedStartDate?: boolean,
  isMonday?: boolean,
  journeyStarted?: boolean,
  isFirstLaunch?: boolean,
  courseStartDate?: string | null,
  lifetimeChosenTimegateJourney?: boolean,
): boolean => {
  // APP_2 (Lifetime) in somatic journey mode: use trial waiting logic (lock until Monday)
  if (hasLifetimeAccess && lifetimeChosenTimegateJourney) {
    return shouldShowTrialWaitingScreen(
      hasReachedStartDate,
      isMonday,
      journeyStarted,
      isFirstLaunch,
      courseStartDate,
    )
  }

  // APP_2 (Lifetime) normal mode: never show waiting screen
  if (hasLifetimeAccess) {
    return shouldShowLifetimeWaitingScreen()
  }

  // APP_1 (Trial): Show waiting screen based on trial logic
  return shouldShowTrialWaitingScreen(
    hasReachedStartDate,
    isMonday,
    journeyStarted,
    isFirstLaunch,
    courseStartDate,
  )
}
