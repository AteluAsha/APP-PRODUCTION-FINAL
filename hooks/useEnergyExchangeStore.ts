/**
 * Energy Exchange Store – completion state for the three connection options
 *
 * Persisted so "complete" visuals survive app restarts.
 * Used by Energy Exchange screen only.
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface EnergyExchangeState {
  videoComplete: boolean
  reviewComplete: boolean
  writeToUsComplete: boolean

  markVideoComplete: () => void
  markReviewComplete: () => void
  markWriteToUsComplete: () => void
}

export const useEnergyExchangeStore = create<EnergyExchangeState>()(
  persist(
    (set) => ({
      videoComplete: false,
      reviewComplete: false,
      writeToUsComplete: false,

      markVideoComplete: () => set({ videoComplete: true }),
      markReviewComplete: () => set({ reviewComplete: true }),
      markWriteToUsComplete: () => set({ writeToUsComplete: true }),
    }),
    {
      name: "soul-school-energy-exchange",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        videoComplete: state.videoComplete,
        reviewComplete: state.reviewComplete,
        writeToUsComplete: state.writeToUsComplete,
      }),
    },
  ),
)
