/**
 * Tracks when GoodbyeModal is visible so root overlays (PermanentMenuBar,
 * GlobalHomeButton) can hide and not block touches on the goodbye screen.
 */

import { create } from "zustand"

interface GoodbyeModalStore {
  isGoodbyeVisible: boolean
  setGoodbyeVisible: (visible: boolean) => void
}

export const useGoodbyeModalStore = create<GoodbyeModalStore>((set) => ({
  isGoodbyeVisible: false,
  setGoodbyeVisible: (visible: boolean) => set({ isGoodbyeVisible: visible }),
}))
