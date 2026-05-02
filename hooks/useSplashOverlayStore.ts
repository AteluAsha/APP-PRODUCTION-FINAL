/**
 * Tracks when the JS splash overlay (AnimatedSplashScreen) is visible so global
 * UI (e.g. PermanentMenuBar) can stay hidden during the sacred void / somatic fade.
 *
 * jsSplashFadeComplete: set true when JS splash fade-out finishes (or web/dev bypass).
 * Used so cold-start routing ((chakras)/index) does not replace under the splash stack.
 */
import { create } from "zustand"

interface SplashOverlayState {
  splashOverlayActive: boolean
  setSplashOverlayActive: (active: boolean) => void
  /** True after AnimatedSplashScreen fade completes, or bypass when no JS splash mounts */
  jsSplashFadeComplete: boolean
  setJsSplashFadeComplete: (complete: boolean) => void
}

export const useSplashOverlayStore = create<SplashOverlayState>((set) => ({
  // Default true so no menu flashes before root syncs with JS splash overlay
  splashOverlayActive: true,
  setSplashOverlayActive: (active) => set({ splashOverlayActive: active }),
  jsSplashFadeComplete: false,
  setJsSplashFadeComplete: (complete) => set({ jsSplashFadeComplete: complete }),
}))
