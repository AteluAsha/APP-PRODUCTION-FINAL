import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStoreRehydration } from "./useStoreRehydration"

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
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useStoreRehydration.getState().setFirstLaunchRehydrated()
      },
    },
  ),
)
