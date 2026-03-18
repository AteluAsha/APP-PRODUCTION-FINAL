/**
 * Zustand store for tracking PillBottomSheet visibility
 * Used when pill bottom sheet is open (e.g. for overlay behavior)
 */

import { create } from "zustand"

interface PillBottomSheetStore {
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}

export const usePillBottomSheetStore = create<PillBottomSheetStore>((set) => ({
  isVisible: false,
  setIsVisible: (visible: boolean) => set({ isVisible: visible }),
}))
