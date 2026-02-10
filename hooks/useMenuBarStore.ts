/**
 * Zustand store for tracking PermanentMenuBar open/closed state
 * Used to hide FloatingNavButtons (Anua) when menu is open
 */

import { create } from "zustand"

interface MenuBarStore {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
}

export const useMenuBarStore = create<MenuBarStore>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (open: boolean) => set({ isMenuOpen: open }),
}))
