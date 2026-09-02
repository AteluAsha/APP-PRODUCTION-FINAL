/**
 * Last-resort recovery when the root ErrorBoundary catches a crash.
 * Stops audio, clears player state, and replaces to a known-safe screen
 * so the user never has to force-quit the app.
 *
 * The navigator must stay mounted during recovery — never unmount Stack.
 */

import { InteractionManager } from 'react-native'
import { router } from 'expo-router'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import { clearVaultAutoPlayback } from '@/src/services/vaultAutoPlayback'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'

const CHAKRA_HUB = '/(chakras)/ChakraHub'
const CHAKRA_HOME = '/(chakras)/ChakraHome'
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
    return (
        path.startsWith('/(chakras)/') ||
        path === AUDIO_LIBRARY ||
        path === CHAKRA_HUB ||
        path === CHAKRA_HOME
    )
}

/** Pick course day, Audio Library, ChakraHub, or trial home — never AudioPlayer. */
export function getSafeRecoveryRoute(): string {
    if (pinnedRecoveryRoute && isSafeRecoveryRoute(pinnedRecoveryRoute)) {
        return pinnedRecoveryRoute
    }

    const audioStore = useCurrentAudioStore.getState()
    const returnPath = audioStore.playerReturnPath

    if (isSafeRecoveryRoute(returnPath)) {
        return returnPath
    }

    const origin = audioStore.audioOrigin
    if (origin === 'music-room') {
        return AUDIO_LIBRARY
    }

    if (useChakraJourneyStore.getState().hasLifetimeAccess) {
        return CHAKRA_HUB
    }

    return CHAKRA_HOME
}

export function getRecoveryDestinationLabel(route: string): string {
    if (route.includes('AudioLibrary')) return 'Return to Audio Library'
    if (route.includes('ChakraHub')) return 'Return to Sanctuary'
    if (route.includes('ChakraHome')) return 'Return to course'
    if (route.startsWith('/(chakras)/')) return 'Return to course day'
    return 'Return home'
}

function waitForNavigationSettle(): Promise<void> {
    return new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
            setTimeout(resolve, 320)
        })
    })
}

/**
 * Tear down healing audio and navigate to a safe screen.
 * Uses replace only — never dismissTo (that resets the stack like a cold start).
 */
export async function recoverFromAppError(): Promise<string> {
    const generation = ++recoveryGeneration
    recoveryActive = true
    const destination = getSafeRecoveryRoute()

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
