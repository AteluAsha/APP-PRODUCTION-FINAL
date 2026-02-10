/**
 * Global store for Profile sheet (waffle menu)
 *
 * Opens from ChakraHub and ChakraHome so users can see profile name, picture, user ID.
 */

import { create } from "zustand"

interface ProfileSheetStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useProfileSheetStore = create<ProfileSheetStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
