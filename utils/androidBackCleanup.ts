/**
 * Screen-local cleanup before Android hardware back or ActionBar back.
 * Lets inline audio (Drop In, Sound Bath tuning fork) stop before pop.
 * Hardware back overrides run after cleanup when registered (focused screens / modals).
 */

type CleanupFn = () => void
type BackOverrideFn = () => boolean

const cleanupFns = new Set<CleanupFn>()
const backOverrides: BackOverrideFn[] = []

export function registerAndroidBackCleanup(fn: CleanupFn): () => void {
    cleanupFns.add(fn)
    return () => {
        cleanupFns.delete(fn)
    }
}

export function runAndroidBackCleanup(): void {
    cleanupFns.forEach((fn) => {
        try {
            fn()
        } catch {
            // cleanup must never block navigation
        }
    })
}

/** Last registered override wins (matches RN BackHandler ordering). Return true when handled. */
export function registerAndroidHardwareBackOverride(fn: BackOverrideFn): () => void {
    backOverrides.push(fn)
    return () => {
        const index = backOverrides.indexOf(fn)
        if (index >= 0) backOverrides.splice(index, 1)
    }
}

export function runAndroidHardwareBackOverrides(): boolean {
    for (let i = backOverrides.length - 1; i >= 0; i--) {
        try {
            if (backOverrides[i]()) return true
        } catch {
            // override must never block navigation
        }
    }
    return false
}
