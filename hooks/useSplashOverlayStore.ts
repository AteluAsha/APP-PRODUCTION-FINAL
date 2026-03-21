/**
 * Tracks when the JS splash overlay (AnimatedSplashScreen) is visible so global
 * UI (e.g. PermanentMenuBar) can stay hidden during the sacred void / somatic fade.
 */
import { create } from "zustand"

interface SplashOverlayState {
  splashOverlayActive: boolean
  setSplashOverlayActive: (active: boolean) => void
}

export const useSplashOverlayStore = create<SplashOverlayState>((set) => ({
  // Default true so no menu flashes before root syncs with JS splash overlay
  splashOverlayActive: true,
  setSplashOverlayActive: (active) => set({ splashOverlayActive: active }),
}))
