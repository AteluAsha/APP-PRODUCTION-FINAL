/**
 * App Mode Constants
 *
 * This app operates as "Two Apps in One":
 * - APP_1 (Trial): Pre-paywall experience with timegates and progressive reveal
 * - APP_2 (Lifetime): Post-paywall experience with full access
 *
 * The paywall is the switch between the two apps.
 */

export type AppMode = "trial" | "lifetime"

/**
 * Get the current app mode based on lifetime access status
 *
 * @param hasLifetimeAccess - Whether user has lifetime access
 * @returns 'trial' if pre-paywall, 'lifetime' if post-paywall
 */
export const getAppMode = (hasLifetimeAccess: boolean): AppMode => {
  return hasLifetimeAccess ? "lifetime" : "trial"
}

/**
 * Check if we're in App 1 (Trial mode)
 */
export const isTrialMode = (hasLifetimeAccess: boolean): boolean => {
  return !hasLifetimeAccess
}

/**
 * Check if we're in App 2 (Lifetime mode)
 */
export const isLifetimeMode = (hasLifetimeAccess: boolean): boolean => {
  return hasLifetimeAccess
}
