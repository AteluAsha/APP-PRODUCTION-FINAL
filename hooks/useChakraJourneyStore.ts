import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { calculateCourseStartDate, getLocalDateISO } from "@/utils/date"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"
import { safeAsyncStorage } from "@/src/utils/safeAsyncStorage"
import { getUserId } from "@/src/services/userId"
import { updateUserScholarshipStatus } from "@/src/services/userScholarshipStatus"

// Payment status types
export type PaymentStatus = "pending" | "paid" | "scholarship"

// Type for our journey store state
interface ChakraJourneyState {
  // Whether the journey has started (user has seen first Monday)
  journeyStarted: boolean

  // Date (ISO string) of the Monday when the current journey week started
  journeyWeekStartDate: string | null

  // Date (ISO string) of when the user first opened the app
  initialOpenDate: string | null

  // Date (ISO string) of when the course should start (calculated from initialOpenDate)
  courseStartDate: string | null

  // Array of chakra indices that have been completed (viewed) within the current week
  completedChakras: number[]

  // Array of day indices (0-6) that the user has participated in during the current week
  // A day is "participated" when the user views/completes that day's chakra
  participatedDays: number[]

  // Flag indicating if all 7 chakras have ever been completed
  allChakrasCompleted: boolean

  // Trial Phase Management
  // Number of completed 7-day courses (0, 1, or 2)
  // Trials don't need to be consecutive - user can complete them at any time
  completedTrialCourses: number

  // Payment status: 'pending' (in trial), 'paid' (lifetime access), 'scholarship' (30-day access, renewable)
  paymentStatus: PaymentStatus

  // Flag indicating if user has lifetime access (bypasses time gates)
  hasLifetimeAccess: boolean

  // Scholarship expiry date (ISO string) - monthly pass; user can reapply after grant ends
  scholarshipExpiryDate: string | null

  // Accountability of Awakening - Progress Tracking
  // Track all participation history across all trials
  totalDaysParticipated: number // Total days user has participated across all trials
  totalChakrasCompleted: number // Total chakras completed across all trials
  trialHistory: {
    trialNumber: number
    startDate: string // ISO date string
    endDate: string | null // ISO date string, null if not completed
    daysParticipated: number[] // Array of day indices (0-6) participated in this trial
    completed: boolean // Whether all 7 days were completed
  }[]

  // Intellectual Embodiment – quiz completions (date + result only) for Accountability of Awakening
  quizCompletions: {
    date: string // YYYY-MM-DD
    day: number // 1-7 (chakra day)
    score: number
    total: number
  }[]

  // Friend Invite Tracking
  // List of first names of friends invited (for display on waiting room)
  invitedFriends: string[] // Array of first names

  // Lifetime user intentionally chose timegate journey (ChakraHub → DateSelection → ChakraHome)
  // Persisted so "Return to course" works across app restarts
  lifetimeChosenTimegateJourney: boolean

  // User chose "Continue to Trial 2" from paywall (Trial 1 complete) - suppresses paywall until Trial 2 ends
  userChoseTrial2: boolean
  setUserChoseTrial2: (value: boolean) => void

  // User chose "Path of the Sovereign" from Seal of the Initiate - shows Gift page instead of paywall
  userChoseSovereignDepart: boolean
  setUserChoseSovereignDepart: (value: boolean) => void

  // User chose "Path of the Gentle" from Grace of the Presence - shows RestingBlessing instead of Grace
  userChoseGentleDepart: boolean
  setUserChoseGentleDepart: (value: boolean) => void

  // Dev only: when true, ChakraHome opens paywall (CommitmentGate) on next mount/focus; then cleared
  devOpenPaywall: boolean
  setDevOpenPaywall: (value: boolean) => void

  // Grace return flow: when true, ChakraHome opens paywall on next mount; then cleared
  openPaywallFromGraceReturn: boolean
  setOpenPaywallFromGraceReturn: (value: boolean) => void

  /** Set true only when user completes Path selection → Date selection → Begin. Used to enforce hero onboarding. */
  hasCompletedHeroOnboarding: boolean
  setHasCompletedHeroOnboarding: (value: boolean) => void

  // Actions
  startJourney: (startDate: string) => void
  setInitialOpenDate: (date: string) => void
  setCourseStartDate: (date: string) => void
  markChakraCompleted: (chakraIndex: number) => void
  markDayParticipated: (dayIndex: number) => void
  resetJourney: () => void
  hasCompletedChakra: (chakraIndex: number) => boolean
  hasEverCompletedChakra: (chakraIndex: number) => boolean
  hasParticipatedDay: (dayIndex: number) => boolean
  setJourneyWeekStartDate: (date: string | null) => void
  checkAndSetCompletion: () => void
  completeTrialCourse: () => void
  grantLifetimeAccess: (method: "paid" | "scholarship") => void
  checkScholarshipExpiry: () => boolean
  getAccountabilityStats: () => {
    totalDaysParticipated: number
    totalChakrasCompleted: number
    completedTrials: number
    currentTrialProgress: number
    trialHistory: {
      trialNumber: number
      startDate: string
      endDate: string | null
      daysParticipated: number[]
      completed: boolean
    }[]
    quizCompletions: {
      date: string
      day: number
      score: number
      total: number
    }[]
  }
  recordQuizCompletion: (payload: {
    date: string
    day: number
    score: number
    total: number
  }) => void
  /** Recompute totalDaysParticipated and totalChakrasCompleted from trialHistory so progress meters stay in sync. */
  recomputeAccountabilityFromHistory: () => void

  // Friend invite actions
  addInvitedFriend: (firstName: string) => void
  clearInvitedFriends: () => void

  // Lifetime user chose timegate journey (persisted for "Return to course")
  setLifetimeChosenTimegateJourney: (value: boolean) => void
  /** Lifetime only: clear current course so user can pick a new start date (Start a new one). */
  clearLifetimeCourseForNewStart: () => void

  // Developer actions (will be removed in production)
  clearAllCompleted: () => void
  _setAllCompleted: (value: boolean) => void

  /** Dev only: Reset onboarding so user sees WelcomeScreen → DateSelection again */
  resetOnboarding: () => void
}

/**
 * Chakra Journey Store - Manages the user's progress through the 7-day chakra journey
 *
 * Uses Zustand for state management with AsyncStorage persistence
 */
export const useChakraJourneyStore = create<ChakraJourneyState>()(
  persist(
    (set, get) => {
      // Check scholarship expiry function - only call after state is initialized
      const checkScholarshipExpiry = () => {
        const state = get()
        // Safety check: state might be undefined during initialization
        if (!state) {
          return false
        }
        if (
          state.paymentStatus === "scholarship" &&
          state.scholarshipExpiryDate
        ) {
          const expiryDate = new Date(state.scholarshipExpiryDate)
          const now = new Date()
          if (now > expiryDate) {
            // Scholarship has expired - revoke access
            set({
              hasLifetimeAccess: false,
              paymentStatus: "pending",
              scholarshipExpiryDate: null,
            })
            return true // Expired
          }
        }
        return false // Not expired or not a scholarship
      }

      // Don't check on initialization - state isn't ready yet
      // This will be called in onRehydrateStorage after state is loaded

      return {
        // Initial state
        journeyStarted: false,
        journeyWeekStartDate: null,
        initialOpenDate: null,
        courseStartDate: null,
        completedChakras: [],
        participatedDays: [],
        allChakrasCompleted: false,
        completedTrialCourses: 0,
        paymentStatus: "pending" as PaymentStatus,
        hasLifetimeAccess: false,
        scholarshipExpiryDate: null,
        totalDaysParticipated: 0,
        totalChakrasCompleted: 0,
        trialHistory: [],
        quizCompletions: [],
        invitedFriends: [],
        lifetimeChosenTimegateJourney: false,
        userChoseTrial2: false,
        setUserChoseTrial2: (value: boolean) => set({ userChoseTrial2: value }),
        userChoseSovereignDepart: false,
        setUserChoseSovereignDepart: (value: boolean) =>
          set({ userChoseSovereignDepart: value }),
        userChoseGentleDepart: false,
        setUserChoseGentleDepart: (value: boolean) =>
          set({ userChoseGentleDepart: value }),
        devOpenPaywall: false,
        openPaywallFromGraceReturn: false,
        setOpenPaywallFromGraceReturn: (value: boolean) =>
          set({ openPaywallFromGraceReturn: value }),
        hasCompletedHeroOnboarding: false,
        setHasCompletedHeroOnboarding: (value: boolean) =>
          set({ hasCompletedHeroOnboarding: value }),

        // Actions
        setInitialOpenDate: (date: string) => {
          const courseStart = calculateCourseStartDate(date)
          set({
            initialOpenDate: date,
            courseStartDate: courseStart,
          })
        },

        setCourseStartDate: (date: string) => {
          set({ courseStartDate: date })
        },

        startJourney: (startDate: string) => {
          set((state) => {
            // Check if this is a new trial (not just a continuation)
            const isNewTrial =
              !state.journeyWeekStartDate ||
              state.journeyWeekStartDate !== startDate

            let newTrialHistory = [...state.trialHistory]

            // If starting a new trial, add it to history
            if (isNewTrial && state.journeyWeekStartDate) {
              // Close previous trial if it exists
              const previousTrialIndex = newTrialHistory.length - 1
              if (
                previousTrialIndex >= 0 &&
                !newTrialHistory[previousTrialIndex].endDate
              ) {
                newTrialHistory[previousTrialIndex] = {
                  ...newTrialHistory[previousTrialIndex],
                  endDate: state.journeyWeekStartDate,
                  completed: state.allChakrasCompleted,
                  daysParticipated: [...state.participatedDays],
                }
              }

              // Add new trial to history
              newTrialHistory.push({
                trialNumber: newTrialHistory.length + 1,
                startDate: startDate,
                endDate: null,
                daysParticipated: [],
                completed: false,
              })
            } else if (isNewTrial) {
              // First trial ever
              newTrialHistory.push({
                trialNumber: 1,
                startDate: startDate,
                endDate: null,
                daysParticipated: [],
                completed: false,
              })
            }

            const newState = {
              journeyStarted: true,
              journeyWeekStartDate: startDate,
              completedChakras: [],
              participatedDays: [],
              allChakrasCompleted: false, // Reset for new trial
              trialHistory: newTrialHistory,
              userChoseTrial2: false, // Clear when starting Trial 2
              userChoseSovereignDepart: false, // Clear so they see Seal again when Trial 2 completes
              userChoseGentleDepart: false, // Clear so they see Grace again when starting new journey
            }
            return newState
          })
        },

        markChakraCompleted: (chakraIndex: number) => {
          const currentCompleted = get().completedChakras
          const allCompleted = get().allChakrasCompleted

          // Only add if not already completed (prevent duplicates)
          // Skip if all chakras are permanently completed to avoid unnecessary updates
          if (!currentCompleted.includes(chakraIndex) && !allCompleted) {
            const newCompletedChakras = [...currentCompleted, chakraIndex]
            set({
              completedChakras: newCompletedChakras,
              totalChakrasCompleted: get().totalChakrasCompleted + 1,
            })
            // Also mark this day as participated
            get().markDayParticipated(chakraIndex)
            // Check if this completion marks the end of the journey
            get().checkAndSetCompletion()
          } else if (allCompleted) {
            // If all are completed, just ensure the day is marked as participated
            get().markDayParticipated(chakraIndex)
          }
        },

        markDayParticipated: (dayIndex: number) => {
          const currentParticipated = get().participatedDays
          // Only add if not already participated
          if (!currentParticipated.includes(dayIndex)) {
            const newParticipated = [...currentParticipated, dayIndex]
            set({
              participatedDays: newParticipated,
              totalDaysParticipated: get().totalDaysParticipated + 1,
            })

            // Update current trial in history
            const trialHistory = [...get().trialHistory]
            const currentTrialIndex = trialHistory.length - 1
            if (
              currentTrialIndex >= 0 &&
              !trialHistory[currentTrialIndex].endDate
            ) {
              trialHistory[currentTrialIndex] = {
                ...trialHistory[currentTrialIndex],
                daysParticipated: newParticipated,
              }
              set({ trialHistory })
            }
          }
        },

        hasCompletedChakra: (chakraIndex: number) => {
          // If all chakras have ever been completed, consider it completed
          if (get().allChakrasCompleted) {
            return true
          }
          return get().completedChakras.includes(chakraIndex)
        },

        /**
         * Check if a chakra was ever completed across all trials
         * This is used for the gallery to show cards even after trials end
         */
        hasEverCompletedChakra: (chakraIndex: number) => {
          const state = get()

          // Check current completed chakras
          if (state.completedChakras.includes(chakraIndex)) {
            return true
          }

          // Check all trial history to see if this chakra was completed in any trial
          // A chakra is considered completed if its day was participated in any trial
          for (const trial of state.trialHistory) {
            if (trial.daysParticipated.includes(chakraIndex)) {
              return true
            }
          }

          return false
        },

        hasParticipatedDay: (dayIndex: number) => {
          // If all chakras are completed, all days are considered participated
          if (get().allChakrasCompleted) {
            return true
          }
          return get().participatedDays.includes(dayIndex)
        },

        resetJourney: () => {
          // This resets the *weekly* progress for a new trial week.
          // During trial phase: All 7 days stay open until Sunday, then reset on Monday.
          // Trials don't need to be consecutive - user can complete them at any time.
          // It intentionally does NOT reset:
          // - completedTrialCourses (tracks trial phase progress - counts completed 7-day trials, persists across resets)
          // - paymentStatus (tracks payment state)
          // - hasLifetimeAccess (lifetime access state)
          // - totalDaysParticipated (Accountability of Awakening - cumulative across all trials)
          // - totalChakrasCompleted (Accountability of Awakening - cumulative across all trials)
          // - trialHistory (Accountability of Awakening - complete history)
          //
          // Note: When a trial is completed, it's recorded in trialHistory before reset
          const wasCompleted = get().allChakrasCompleted
          const currentTrialCount = get().completedTrialCourses
          const previousParticipatedDays = [...get().participatedDays]
          const previousWeekStartDate = get().journeyWeekStartDate

          // If the previous week was completed, record it before resetting
          if (wasCompleted && currentTrialCount < 2) {
            const trialHistory = [...get().trialHistory]
            const currentTrialIndex = trialHistory.length - 1
            const alreadyCounted =
              currentTrialIndex >= 0 &&
              trialHistory[currentTrialIndex].completed === true

            // Update trial history (completeTrialCourse may have already done this)
            if (currentTrialIndex >= 0 && previousWeekStartDate) {
              const today = getLocalDateISO()
              trialHistory[currentTrialIndex] = {
                ...trialHistory[currentTrialIndex],
                endDate: today,
                completed: true,
                daysParticipated: previousParticipatedDays,
              }
              set({ trialHistory })
            }

            // Only increment if completeTrialCourse hasn't already (avoids double-count after Trial 1)
            if (!alreadyCounted) {
              set({ completedTrialCourses: currentTrialCount + 1 })
            }
          } else if (previousWeekStartDate) {
            // Trial wasn't completed, but still record it in history
            const trialHistory = [...get().trialHistory]
            const currentTrialIndex = trialHistory.length - 1
            if (currentTrialIndex >= 0) {
              const today = getLocalDateISO()
              trialHistory[currentTrialIndex] = {
                ...trialHistory[currentTrialIndex],
                endDate: today,
                completed: false,
                daysParticipated: previousParticipatedDays,
              }
              set({ trialHistory })
            }
          }

          // Reset weekly progress for new trial week
          set(() => {
            const newState = {
              journeyStarted: false,
              journeyWeekStartDate: null,
              completedChakras: [],
              participatedDays: [],
              allChakrasCompleted: false, // Reset for new trial week
            }
            // Persist trial and payment state across resets
            return {
              ...newState,
              completedTrialCourses: get().completedTrialCourses,
              paymentStatus: get().paymentStatus,
              hasLifetimeAccess: get().hasLifetimeAccess,
              totalDaysParticipated: get().totalDaysParticipated,
              totalChakrasCompleted: get().totalChakrasCompleted,
              trialHistory: get().trialHistory,
            }
          })
        },

        setJourneyWeekStartDate: (date: string | null) =>
          set({ journeyWeekStartDate: date }),

        checkAndSetCompletion: () => {
          // Called after marking a chakra complete to see if all 7 are now done.
          const currentCompleted = get().completedChakras
          const alreadyAllCompleted = get().allChakrasCompleted
          const wasJustCompleted =
            !alreadyAllCompleted && currentCompleted.length === 7

          // Only set the flag if it's not already true and all 7 are complete.
          if (wasJustCompleted) {
            set({ allChakrasCompleted: true })
            // If this completes a trial course, increment the counter
            // Only increment if we haven't reached 2 courses yet and don't have lifetime access
            const hasLifetime = get().hasLifetimeAccess
            const currentTrialCount = get().completedTrialCourses
            if (!hasLifetime && currentTrialCount < 2) {
              get().completeTrialCourse()
            }
          }
        },

        completeTrialCourse: () => {
          const currentCount = get().completedTrialCourses
          // Only increment if we haven't reached 2 courses yet
          if (currentCount < 2) {
            set({ completedTrialCourses: currentCount + 1 })

            // Update current trial in history to mark as completed
            const trialHistory = [...get().trialHistory]
            const currentTrialIndex = trialHistory.length - 1
            if (currentTrialIndex >= 0) {
              const today = getLocalDateISO()
              trialHistory[currentTrialIndex] = {
                ...trialHistory[currentTrialIndex],
                endDate: today,
                completed: true,
                daysParticipated: [...get().participatedDays],
              }
              set({ trialHistory })
            }
          }
        },

        grantLifetimeAccess: (method: "paid" | "scholarship") => {
          if (method === "scholarship") {
            // Monthly pass: 30 days; user can reapply after grant ends (paywall → Monthly Course Pass again)
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
            const expiryIso = thirtyDaysFromNow.toISOString()
            set({
              hasLifetimeAccess: true, // Bypasses time gates for the 30-day period
              paymentStatus: method,
              scholarshipExpiryDate: expiryIso,
            })
            // Fire-and-forget: persist to Firestore for cross-device/session
            getUserId()
              .then((id) => updateUserScholarshipStatus(id, expiryIso))
              .catch(() => {})
          } else {
            // Paid access is lifetime
            set({
              hasLifetimeAccess: true,
              paymentStatus: method,
              scholarshipExpiryDate: null, // Clear any previous scholarship expiry
            })
          }
        },

        // Check and revoke expired scholarships
        checkScholarshipExpiry: () => {
          const state = get()
          // Safety check: state might be undefined
          if (!state) {
            return false
          }
          if (
            state.paymentStatus === "scholarship" &&
            state.scholarshipExpiryDate
          ) {
            const expiryDate = new Date(state.scholarshipExpiryDate)
            const now = new Date()
            if (now > expiryDate) {
              // Scholarship has expired - revoke access
              set({
                hasLifetimeAccess: false,
                paymentStatus: "pending",
                scholarshipExpiryDate: null,
              })
              return true // Expired
            }
          }
          return false // Not expired or not a scholarship
        },

        getAccountabilityStats: () => {
          const state = get()
          const currentTrial = state.trialHistory[state.trialHistory.length - 1]
          const currentTrialProgress = currentTrial
            ? currentTrial.daysParticipated.length
            : 0

          return {
            totalDaysParticipated: state.totalDaysParticipated,
            totalChakrasCompleted: state.totalChakrasCompleted,
            completedTrials: state.completedTrialCourses,
            currentTrialProgress,
            trialHistory: state.trialHistory,
            quizCompletions: state.quizCompletions ?? [],
          }
        },

        recordQuizCompletion: (payload) => {
          set((state) => ({
            quizCompletions: [...state.quizCompletions, payload],
          }))
        },

        /** Recompute from trialHistory; include current week only when no trials (lifetime-only progress). */
        recomputeAccountabilityFromHistory: () => {
          const state = get()
          let totalDays = 0
          const chakraSet = new Set<number>()
          for (const trial of state.trialHistory) {
            totalDays += trial.daysParticipated.length
            trial.daysParticipated.forEach((d) => chakraSet.add(d))
          }
          // Lifetime users who only use ChakraHub never have trialHistory; include current progress
          if (state.trialHistory.length === 0) {
            state.participatedDays.forEach((d) => {
              totalDays += 1
              chakraSet.add(d)
            })
            state.completedChakras.forEach((d) => chakraSet.add(d))
          }
          set({
            totalDaysParticipated: totalDays,
            totalChakrasCompleted: chakraSet.size,
          })
        },

        // Friend invite actions
        addInvitedFriend: (firstName: string) => {
          set((state) => {
            // Only add if not already in list (avoid duplicates)
            if (!state.invitedFriends.includes(firstName)) {
              return { invitedFriends: [...state.invitedFriends, firstName] }
            }
            return state
          })
        },
        clearInvitedFriends: () => set({ invitedFriends: [] }),

        setLifetimeChosenTimegateJourney: (value: boolean) =>
          set((state) => {
            if (!value) {
              return { lifetimeChosenTimegateJourney: false }
            }
            // Entering lifetime course mode: same visual reset as a fresh week for day checkboxes
            // (completed state for the current run only; cumulative totals / trialHistory unchanged).
            return {
              lifetimeChosenTimegateJourney: true,
              completedChakras: [],
              participatedDays: [],
              allChakrasCompleted: false,
            }
          }),
        clearLifetimeCourseForNewStart: () =>
          set({
            courseStartDate: null,
            lifetimeChosenTimegateJourney: false,
            journeyStarted: false,
            journeyWeekStartDate: null,
            completedChakras: [],
            participatedDays: [],
            allChakrasCompleted: false,
          }),
        setDevOpenPaywall: (value: boolean) => set({ devOpenPaywall: value }),

        // Developer actions
        clearAllCompleted: () => set({ completedChakras: [] }),
        _setAllCompleted: (value: boolean) =>
          set({ allChakrasCompleted: value }),

        resetOnboarding: () =>
          set({
            hasCompletedHeroOnboarding: false,
            courseStartDate: null,
            initialOpenDate: null,
            journeyStarted: false,
            journeyWeekStartDate: null,
            completedChakras: [],
            participatedDays: [],
            allChakrasCompleted: false,
            hasLifetimeAccess: false,
            paymentStatus: "pending" as PaymentStatus,
            scholarshipExpiryDate: null,
            completedTrialCourses: 0,
            trialHistory: [],
            quizCompletions: [],
            userChoseTrial2: false,
            userChoseSovereignDepart: false,
            userChoseGentleDepart: false,
          }),
      }
    },
    {
      name: "chakra-journey-storage",
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => {
        const { devOpenPaywall, openPaywallFromGraceReturn, ...rest } = state
        return rest
      },
      onRehydrateStorage: () => (state) => {
        useStoreRehydration.getState().setJourneyRehydrated()
        if (state) {
          if (
            state.paymentStatus === "scholarship" &&
            state.scholarshipExpiryDate
          ) {
            const expiryDate = new Date(state.scholarshipExpiryDate)
            const now = new Date()
            if (now > expiryDate) {
              useChakraJourneyStore.setState({
                hasLifetimeAccess: false,
                paymentStatus: "pending",
                scholarshipExpiryDate: null,
              })
            }
          }
          // REMOVED: Migration that auto-set hasCompletedHeroOnboarding from courseStartDate.
          // That caused users with persisted courseStartDate (e.g. from dev testing) to skip
          // WelcomeScreen and DateSelection entirely. Flow is now: Splash → WelcomeScreen →
          // DateSelection → Begin → ChakraHome. Use "Reset onboarding" in dev to clear state.
        }
      },
    },
  ),
)
