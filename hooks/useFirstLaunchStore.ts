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
  /** One-time notice after the first close of Chakras 101. */
  hasSeenWeek1JourneyNotice: boolean
  markWeek1JourneyNoticeSeen: () => void
  /** Session-only: show the notice on the screen after leaving Chakras 101. */
  pendingWeek1JourneyNotice: boolean
  setPendingWeek1JourneyNotice: (value: boolean) => void
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
          hasSeenWeek1JourneyNotice: false,
          pendingWeek1JourneyNotice: false,
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
      hasSeenWeek1JourneyNotice: false,
      markWeek1JourneyNoticeSeen: () =>
        set({
          hasSeenWeek1JourneyNotice: true,
          pendingWeek1JourneyNotice: false,
        }),
      pendingWeek1JourneyNotice: false,
      setPendingWeek1JourneyNotice: (value) =>
        set({ pendingWeek1JourneyNotice: value }),
    }),
    {
      name: "first-launch-storage",
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({
        isFirstLaunch: state.isFirstLaunch,
        hasStartedMasterTeachings: state.hasStartedMasterTeachings,
        hasSeenChakras101Guide: state.hasSeenChakras101Guide,
        hasSeenMasterMeditationWelcome: state.hasSeenMasterMeditationWelcome,
        hasSeenWeek1JourneyNotice: state.hasSeenWeek1JourneyNotice,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        groundedChakraDays: [],
        pendingWeek1JourneyNotice: false,
      }),
      onRehydrateStorage: () => () => {
        useStoreRehydration.getState().setFirstLaunchRehydrated()
        useFirstLaunchStore.setState({ groundedChakraDays: [] })
      },
    },
  ),
)
