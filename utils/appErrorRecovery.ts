/**
 * Last-resort recovery when the root ErrorBoundary catches a crash.
 * Stops audio, clears player state, and replaces to a known-safe screen
 * so the user never has to force-quit the app.
 *
 * The navigator must stay mounted during recovery — never unmount Stack.
 */

import { router } from 'expo-router'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import { clearVaultAutoPlayback } from '@/src/services/vaultAutoPlayback'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'

const CHAKRA_HUB = '/(chakras)/ChakraHub'
const AUDIO_LIBRARY = '/(chakras)/AudioLibrary'

let recoveryActive = false
let recoveryGeneration = 0
/** Set before player teardown clears store so recovery still knows Audio Library vs hub. */
let pinnedRecoveryRoute: string | null = null

export function isAppErrorRecoveryActive(): boolean {
    return recoveryActive
}

export function pinRecoveryRoute(route: string | null | undefined): void {
    if (route && isSafeRecoveryRoute(route)) {
        pinnedRecoveryRoute = route
    }
}

export function clearPinnedRecoveryRoute(): void {
    pinnedRecoveryRoute = null
}

function isSafeRecoveryRoute(path: string | null | undefined): path is string {
    if (!path) return false
    if (path.includes('AudioPlayer')) return false
    if (path.includes('ChakraHome')) return false
    return (
        path.startsWith('/(chakras)/') ||
        path === AUDIO_LIBRARY ||
        path === CHAKRA_HUB
    )
}

/**
 * Screen-boundary recovery. Never return the screen that just threw
 * (course day, presence, notes). Hub or Audio Library only.
 */
export function getScreenCrashRecoveryRoute(): string {
    const suggested = getSafeRecoveryRoute()
    if (suggested.includes('AudioLibrary')) return AUDIO_LIBRARY
    return CHAKRA_HUB
}

/** Pick course day, Audio Library, or ChakraHub — never AudioPlayer or retired trial home. */
export function getSafeRecoveryRoute(): string {
    if (pinnedRecoveryRoute && isSafeRecoveryRoute(pinnedRecoveryRoute)) {
        return pinnedRecoveryRoute
    }

    const audioStore = useCurrentAudioStore.getState()
    const returnPath = audioStore.playerReturnPath

    if (isSafeRecoveryRoute(returnPath)) {
        return returnPath
    }

    if (audioStore.audioOrigin === 'music-room') {
        return AUDIO_LIBRARY
    }

    return CHAKRA_HUB
}

export function getRecoveryDestinationLabel(route: string): string {
    if (route.includes('AudioLibrary')) return 'Return to Audio Library'
    if (route.includes('ChakraHub')) return 'Return to Sanctuary'
    if (route.startsWith('/(chakras)/')) return 'Return to course day'
    return 'Return home'
}

function waitForNavigationSettle(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 400)
    })
}

/**
 * Tear down healing audio and navigate to a safe screen.
 * Uses replace only — never dismissTo (that resets the stack like a cold start).
 */
export async function recoverFromAppError(): Promise<string> {
    const generation = ++recoveryGeneration
    recoveryActive = true
    const destination = getScreenCrashRecoveryRoute()

    try {
        clearVaultAutoPlayback()
        await silenceAllAudio()
    } catch {
        // recovery must never throw
    }

    try {
        useCurrentAudioStore.getState().reset()
    } catch {
        // ignore
    }

    try {
        router.replace(destination as never)
    } catch {
        try {
            router.replace(CHAKRA_HUB as never)
        } catch {
            // navigator may still settle on remount
        }
    }

    if (generation === recoveryGeneration) {
        await waitForNavigationSettle()
    }

    if (generation === recoveryGeneration) {
        recoveryActive = false
        clearPinnedRecoveryRoute()
    }

    return destination
}

export function cancelAppErrorRecovery(): void {
    recoveryGeneration += 1
    recoveryActive = false
}
