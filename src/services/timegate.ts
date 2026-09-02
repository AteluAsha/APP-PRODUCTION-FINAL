/**
 * Course days are always open on ChakraHub.
 * Trial timegates, waiting rooms, and Monday locks are retired.
 * Function signatures stay so existing callers keep compiling.
 */

export const isDevelopmentOverrideActive = (): boolean => {
    return true
}

export const shouldBypassTimegate = (_hasLifetimeAccess?: boolean): boolean => {
    return true
}

export const isTrialChakraAccessible = (
    _dayIndex?: number,
    _hasParticipatedDay?: (day: number) => boolean,
    _currentDay?: number,
    _allChakrasCompleted?: boolean,
): boolean => {
    return true
}

export const isLifetimeChakraAccessible = (): boolean => {
    return true
}

export const isChakraDayAccessible = (
    _dayIndex?: number,
    _hasLifetimeAccess?: boolean,
    _hasParticipatedDay?: (day: number) => boolean,
    _currentDay?: number,
    _allChakrasCompleted?: boolean,
    _inCourseMode?: boolean,
): boolean => {
    return true
}

export const shouldAutoStartJourney = (_hasLifetimeAccess?: boolean): boolean => {
    return true
}

export const shouldShowTrialWaitingScreen = (
    _hasReachedStartDate?: boolean,
    _isMonday?: boolean,
    _journeyStarted?: boolean,
    _isFirstLaunch?: boolean,
    _courseStartDate?: string | null,
): boolean => {
    return false
}

export const shouldShowLifetimeWaitingScreen = (): boolean => {
    return false
}

export const shouldShowWaitingScreen = (
    _hasLifetimeAccess?: boolean,
    _hasReachedStartDate?: boolean,
    _isMonday?: boolean,
    _journeyStarted?: boolean,
    _isFirstLaunch?: boolean,
    _courseStartDate?: string | null,
    _lifetimeChosenTimegateJourney?: boolean,
): boolean => {
    return false
}
