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
  /** One-time leaf whisper on first Audio Player open. */
  hasSeenNotesLeafWhisper: boolean
  markNotesLeafWhisperSeen: () => void
  /** One-time notice after the first close of Chakras 101. */
  hasSeenWeek1JourneyNotice: boolean
  markWeek1JourneyNoticeSeen: () => void
  /** Session-only: show the notice on the screen after leaving Chakras 101. */
  pendingWeek1JourneyNotice: boolean
  setPendingWeek1JourneyNotice: (value: boolean) => void
  /** One-time notice after leaving the Crown goodbye screen. */
  hasSeenCrownReminderNotice: boolean
  markCrownReminderNoticeSeen: () => void
  pendingCrownReminderNotice: boolean
  setPendingCrownReminderNotice: (value: boolean) => void
  /**
   * Day indexes (0–2) that already received the post-meditation Bridge cue.
   * Persisted so the teaching only fires once per early day.
   */
  bridgeCueOfferedDays: number[]
  hasOfferedBridgeCue: (day: number) => boolean
  markBridgeCueOffered: (day: number) => void
  /** One-time Sanctuary prompt before the system notification dialog. */
  hasSeenNotificationPermissionPrompt: boolean
  markNotificationPermissionPromptSeen: () => void
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
          hasSeenNotesLeafWhisper: false,
          hasSeenWeek1JourneyNotice: false,
          pendingWeek1JourneyNotice: false,
          hasSeenCrownReminderNotice: false,
          pendingCrownReminderNotice: false,
          bridgeCueOfferedDays: [],
          hasSeenNotificationPermissionPrompt: false,
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
      hasSeenNotesLeafWhisper: false,
      markNotesLeafWhisperSeen: () => set({ hasSeenNotesLeafWhisper: true }),
      hasSeenWeek1JourneyNotice: false,
      markWeek1JourneyNoticeSeen: () =>
        set({
          hasSeenWeek1JourneyNotice: true,
          pendingWeek1JourneyNotice: false,
        }),
      pendingWeek1JourneyNotice: false,
      setPendingWeek1JourneyNotice: (value) =>
        set({ pendingWeek1JourneyNotice: value }),
      hasSeenCrownReminderNotice: false,
      markCrownReminderNoticeSeen: () =>
        set({
          hasSeenCrownReminderNotice: true,
          pendingCrownReminderNotice: false,
        }),
      pendingCrownReminderNotice: false,
      setPendingCrownReminderNotice: (value) =>
        set({ pendingCrownReminderNotice: value }),
      bridgeCueOfferedDays: [],
      hasOfferedBridgeCue: (day) =>
        (get().bridgeCueOfferedDays ?? []).includes(day),
      markBridgeCueOffered: (day) => {
        const current = get().bridgeCueOfferedDays ?? []
        if (current.includes(day)) return
        set({ bridgeCueOfferedDays: [...current, day] })
      },
      hasSeenNotificationPermissionPrompt: false,
      markNotificationPermissionPromptSeen: () =>
        set({ hasSeenNotificationPermissionPrompt: true }),
    }),
    {
      name: "first-launch-storage",
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({
        isFirstLaunch: state.isFirstLaunch,
        hasStartedMasterTeachings: state.hasStartedMasterTeachings,
        hasSeenChakras101Guide: state.hasSeenChakras101Guide,
        hasSeenMasterMeditationWelcome: state.hasSeenMasterMeditationWelcome,
        hasSeenNotesLeafWhisper: state.hasSeenNotesLeafWhisper,
        hasSeenWeek1JourneyNotice: state.hasSeenWeek1JourneyNotice,
        hasSeenCrownReminderNotice: state.hasSeenCrownReminderNotice,
        bridgeCueOfferedDays: state.bridgeCueOfferedDays,
        hasSeenNotificationPermissionPrompt:
          state.hasSeenNotificationPermissionPrompt,
      }),
      merge: (persisted, current) => {
        const saved =
          persisted && typeof persisted === "object"
            ? (persisted as Partial<FirstLaunchState>)
            : {}
        return {
          ...current,
          ...saved,
          groundedChakraDays: [],
          pendingWeek1JourneyNotice: false,
          pendingCrownReminderNotice: false,
          bridgeCueOfferedDays: saved.bridgeCueOfferedDays ?? [],
        }
      },
      onRehydrateStorage: () => () => {
        useStoreRehydration.getState().setFirstLaunchRehydrated()
        useFirstLaunchStore.setState({ groundedChakraDays: [] })
      },
    },
  ),
)
