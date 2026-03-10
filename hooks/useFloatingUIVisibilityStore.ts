/**
 * Global store for auto-hiding floating UI (nav buttons, menu bar, home button).
 *
 * - Floats start visible; after HIDE_DELAY_MS they fade out.
 * - Tap the reveal strip: show floats and reset timer.
 * - Tap the strip again while visible: soft close (hide immediately).
 * - Scroll (trial screens): reveal floats and reset timer (throttled).
 */

import { create } from "zustand"
import { useCallback, useRef } from "react"

const HIDE_DELAY_MS = 5000

interface FloatingUIVisibilityStore {
  visible: boolean
  _timerRef: ReturnType<typeof setTimeout> | null
  revealAndResetTimer: () => void
  hide: () => void
  softClose: () => void
}

function clearTimer(timerRef: ReturnType<typeof setTimeout> | null) {
  if (timerRef != null) clearTimeout(timerRef)
}

export const useFloatingUIVisibilityStore = create<FloatingUIVisibilityStore>(
  (set, get) => ({
    visible: true,
    _timerRef: null,

    revealAndResetTimer: () => {
      const { _timerRef } = get()
      clearTimer(_timerRef)
      const newTimer = setTimeout(() => {
        set({ visible: false, _timerRef: null })
      }, HIDE_DELAY_MS)
      set({ visible: true, _timerRef: newTimer })
    },

    hide: () => {
      const { _timerRef } = get()
      clearTimer(_timerRef)
      set({ visible: false, _timerRef: null })
    },

    softClose: () => {
      const { _timerRef } = get()
      clearTimer(_timerRef)
      set({ visible: false, _timerRef: null })
    },
  }),
)

const SCROLL_REVEAL_THROTTLE_MS = 400

/**
 * Returns a throttled onScroll handler that reveals floating UI on scroll.
 * Use on trial screens with ScrollView/Animated.ScrollView so scroll reveals the strip/buttons.
 */
export function useScrollRevealFloatingUI(): (e: { nativeEvent: unknown }) => void {
  const lastRevealRef = useRef(0)
  return useCallback(() => {
    const now = Date.now()
    if (now - lastRevealRef.current < SCROLL_REVEAL_THROTTLE_MS) return
    lastRevealRef.current = now
    useFloatingUIVisibilityStore.getState().revealAndResetTimer()
  }, [])
}
