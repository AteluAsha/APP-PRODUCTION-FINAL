/**
 * Timegate Service
 *
 * Manages time-based access control for chakra content.
 * Includes a Development Override that bypasses all timegates in local development.
 */

// Global dev mode flag that can be set by DevOverrideSystem
// This works even when __DEV__ is not set (e.g., QR code testing)
let globalDevModeEnabled = false

/**
 * Set the global dev mode override (used by DevOverrideSystem)
 */
export const setGlobalDevMode = (enabled: boolean): void => {
    globalDevModeEnabled = enabled
    if (enabled) {
        console.log('🔓 Global Dev Mode Enabled: All timegates bypassed')
    } else {
        console.log('🔒 Global Dev Mode Disabled: Normal timegate rules apply')
    }
}

/**
 * Get the current global dev mode state
 */
export const getGlobalDevMode = (): boolean => {
    return globalDevModeEnabled
}

/**
 * Check if development override is active
 * 
 * In development mode (__DEV__ === true) OR when global dev mode is enabled,
 * all timegates are bypassed to allow testing of features without waiting for specific days.
 * 
 * @returns true if development override is active
 */
export const isDevelopmentOverrideActive = (): boolean => {
    return __DEV__ === true || globalDevModeEnabled
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
        // Log the Sovereign Bypass activation (only once per session)
        if (!globalDevModeEnabled || __DEV__) {
            console.log('🔓 Sovereign Bypass Active: Timegate unlocked for Professor.')
        }
        return true
    }
    
    return hasLifetimeAccess
}

/**
 * Check if a chakra day should be accessible
 * 
 * In development mode, all days are accessible.
 * Otherwise, follows normal timegate rules.
 * 
 * @param dayIndex - The day index (0-6, Monday-Sunday)
 * @param hasLifetimeAccess - Whether user has lifetime access
 * @param hasParticipatedDay - Function to check if user has participated in a day
 * @param currentDay - The current day of week (0-6)
 * @param allChakrasCompleted - Whether all chakras are completed
 * @returns true if the chakra day should be accessible
 */
export const isChakraDayAccessible = (
    dayIndex: number,
    hasLifetimeAccess: boolean,
    hasParticipatedDay: (day: number) => boolean,
    currentDay: number,
    allChakrasCompleted: boolean,
): boolean => {
    // Development override: all days accessible
    if (isDevelopmentOverrideActive()) {
        return true
    }
    
    // Lifetime access: all days accessible
    if (hasLifetimeAccess) {
        return true
    }
    
    // Normal timegate logic
    return (
        hasParticipatedDay(dayIndex) ||
        (currentDay === dayIndex && !hasParticipatedDay(dayIndex)) ||
        (allChakrasCompleted && currentDay <= 6)
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
 * Check if waiting screen should be shown
 * 
 * In development mode, waiting screen is never shown.
 * 
 * @param hasLifetimeAccess - Whether user has lifetime access
 * @returns true if waiting screen should be shown
 */
export const shouldShowWaitingScreen = (
    hasLifetimeAccess: boolean,
    // Normal timegate parameters (not used in dev mode)
    hasReachedStartDate?: boolean,
    isMonday?: boolean,
    journeyStarted?: boolean,
): boolean => {
    // Development override: never show waiting screen
    if (isDevelopmentOverrideActive()) {
        return false
    }
    
    // Lifetime access: never show waiting screen
    if (hasLifetimeAccess) {
        return false
    }
    
    // Normal timegate logic
    if (hasReachedStartDate === undefined || isMonday === undefined || journeyStarted === undefined) {
        return true // Show waiting screen if we don't have enough info
    }
    
    return !hasReachedStartDate || !isMonday || !journeyStarted
}

