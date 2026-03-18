/**
 * Zustand store for tracking PermanentMenuBar open/closed state
 * and trial waiting room visibility (so menu bar can show 4-button bar or hide for lifetime).
 */

import { create } from "zustand"

export interface WaitingRoomActions {
  onPreviewPress?: () => void
  onChakras101Press?: () => void
}

interface MenuBarStore {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  /** True when ChakraHome is showing WaitingScreen (trial or lifetime course mode). */
  isWaitingScreenVisible: boolean
  setWaitingScreenVisible: (visible: boolean) => void
  /** Callbacks for trial waiting room menu bar (Preview, Chakras 101). Set by ChakraHome when WaitingScreen mounts. */
  waitingRoomActions: WaitingRoomActions
  setWaitingRoomActions: (actions: WaitingRoomActions) => void
}

export const useMenuBarStore = create<MenuBarStore>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (open: boolean) => set({ isMenuOpen: open }),
  isWaitingScreenVisible: false,
  setWaitingScreenVisible: (visible: boolean) =>
    set({ isWaitingScreenVisible: visible }),
  waitingRoomActions: {},
  setWaitingRoomActions: (actions: WaitingRoomActions) =>
    set({ waitingRoomActions: actions }),
}))
