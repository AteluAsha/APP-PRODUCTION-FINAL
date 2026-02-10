/**
 * Zustand store for tracking PillBottomSheet visibility
 * Used to hide FloatingNavButtons when pill bottom sheet is open
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
