import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useStoreRehydration } from "./useStoreRehydration"
import { safeAsyncStorage } from "@/src/utils/safeAsyncStorage"

interface FirstLaunchState {
  isFirstLaunch: boolean
  setFirstLaunchComplete: () => void
  resetForTesting: () => void
}

export const useFirstLaunchStore = create<FirstLaunchState>()(
  persist(
    (set) => ({
      isFirstLaunch: true,
      setFirstLaunchComplete: () => set({ isFirstLaunch: false }),
      resetForTesting: () => set({ isFirstLaunch: true }),
    }),
    {
      name: "first-launch-storage",
      storage: createJSONStorage(() => safeAsyncStorage),
      onRehydrateStorage: () => () => {
        useStoreRehydration.getState().setFirstLaunchRehydrated()
      },
    },
  ),
)
