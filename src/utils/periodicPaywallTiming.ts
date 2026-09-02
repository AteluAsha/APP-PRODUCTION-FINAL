export const PERIODIC_PAYWALL_FIRST_SHOW_MS = 60 * 60 * 1000
export const PERIODIC_PAYWALL_REPEAT_MS = 48 * 60 * 60 * 1000
export const PERIODIC_PAYWALL_RETURN_DELAY_MS = 8_000

/** Milliseconds until the next auto-paywall, or null if it should not show. */
export function delayUntilPeriodicPaywallMs(
    now: number,
    firstOpenAt: number,
    lastShownAt: number,
): number | null {
    const neverShown = !lastShownAt || !Number.isFinite(lastShownAt)
    if (neverShown) {
        const openAt = Number.isFinite(firstOpenAt) ? firstOpenAt : now
        return Math.max(0, openAt + PERIODIC_PAYWALL_FIRST_SHOW_MS - now)
    }
    if (now - lastShownAt >= PERIODIC_PAYWALL_REPEAT_MS) {
        return PERIODIC_PAYWALL_RETURN_DELAY_MS
    }
    return null
}

/**
 * Automated Energy Exchange may only open from Chakra Hub.
 * Never during Audio Player / sanctuary meditation screens.
 */
export function canShowAutomatedPaywall(opts: {
    pathname?: string | null
    audioOrigin?: string | null
    isHubFocused?: boolean
}): boolean {
    if (opts.isHubFocused === false) return false
    const path = opts.pathname ?? ''
    if (!path.includes('ChakraHub')) return false
    if (
        path.includes('AudioPlayer') ||
        path.includes('SoundBath') ||
        path.includes('HeadToHeart') ||
        path.includes('AudioLibrary')
    ) {
        return false
    }
    if (
        opts.audioOrigin === 'full-player' ||
        opts.audioOrigin === 'music-room' ||
        opts.audioOrigin === 'other'
    ) {
        return false
    }
    return true
}
