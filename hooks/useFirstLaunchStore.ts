import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useStoreRehydration } from "./useStoreRehydration"
import { safeAsyncStorage } from "@/src/utils/safeAsyncStorage"

interface FirstLaunchState {
  isFirstLaunch: boolean
  setFirstLaunchComplete: () => void
  resetForTesting: () => void
  /** True after the post-splash sanctuary gate ("Enter the Sanctuary"). */
  hasStartedMasterTeachings: boolean
  startMasterTeachings: () => void
  /**
   * Days (0–6) that have already shown the presence screen this session.
   * Session-only: a fresh app open shows the screens again.
   */
  groundedChakraDays: number[]
  hasGroundedChakra: (day: number) => boolean
  markChakraGrounded: (day: number) => void
  /** One-time hub guide pointing at Chakras 101. */
  hasSeenChakras101Guide: boolean
  markChakras101GuideSeen: () => void
  /** One-time welcome on the first Master Meditation tap (Root / Day 1). */
  hasSeenMasterMeditationWelcome: boolean
  markMasterMeditationWelcomeSeen: () => void
}

export const useFirstLaunchStore = create<FirstLaunchState>()(
  persist(
    (set, get) => ({
      isFirstLaunch: true,
      setFirstLaunchComplete: () => set({ isFirstLaunch: false }),
      resetForTesting: () =>
        set({
          isFirstLaunch: true,
          hasStartedMasterTeachings: false,
          groundedChakraDays: [],
          hasSeenChakras101Guide: false,
          hasSeenMasterMeditationWelcome: false,
        }),
      hasStartedMasterTeachings: false,
      startMasterTeachings: () =>
        set({ hasStartedMasterTeachings: true, isFirstLaunch: false }),
      groundedChakraDays: [],
      hasGroundedChakra: (day) =>
        (get().groundedChakraDays ?? []).includes(day),
      markChakraGrounded: (day) => {
        const current = get().groundedChakraDays ?? []
        if (current.includes(day)) return
        set({ groundedChakraDays: [...current, day] })
      },
      hasSeenChakras101Guide: false,
      markChakras101GuideSeen: () => set({ hasSeenChakras101Guide: true }),
      hasSeenMasterMeditationWelcome: false,
      markMasterMeditationWelcomeSeen: () =>
        set({ hasSeenMasterMeditationWelcome: true }),
    }),
    {
      name: "first-launch-storage",
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({
        isFirstLaunch: state.isFirstLaunch,
        hasStartedMasterTeachings: state.hasStartedMasterTeachings,
        hasSeenChakras101Guide: state.hasSeenChakras101Guide,
        hasSeenMasterMeditationWelcome: state.hasSeenMasterMeditationWelcome,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        groundedChakraDays: [],
      }),
      onRehydrateStorage: () => () => {
        useStoreRehydration.getState().setFirstLaunchRehydrated()
        useFirstLaunchStore.setState({ groundedChakraDays: [] })
      },
    },
  ),
)
