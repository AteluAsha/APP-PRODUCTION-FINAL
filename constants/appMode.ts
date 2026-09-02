/**
 * One app: open 7-day course on ChakraHub.
 * Trial / APP_1 mode is retired. Paywall / RevenueCat still grant access.
 */

export type AppMode = 'lifetime'

export const getAppMode = (_hasLifetimeAccess?: boolean): AppMode => {
    return 'lifetime'
}

export const isTrialMode = (_hasLifetimeAccess?: boolean): boolean => {
    return false
}

export const isLifetimeMode = (_hasLifetimeAccess?: boolean): boolean => {
    return true
}
