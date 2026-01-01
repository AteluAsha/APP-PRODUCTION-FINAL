import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { useChakraJourneyStore } from "./useChakraJourneyStore"
import { getCurrentWeekStartDateISO } from "@/utils/date"

/**
 * Custom hook to manage the weekly transition logic for the Chakra Journey.
 *
 * - Checks if the current week is different from the stored journey week.
 * - Resets the journey progress if the week has changed and the journey wasn't completed.
 * - Ensures the journey start date is correctly set/updated in the store.
 */
export const useChakraWeekTransition = () => {
  const {
    journeyStarted,
    journeyWeekStartDate,
    allChakrasCompleted,
    completedTrialCourses,
    resetJourney,
    setJourneyWeekStartDate,
  } = useChakraJourneyStore(
    useShallow((state) => ({
      journeyStarted: state.journeyStarted,
      journeyWeekStartDate: state.journeyWeekStartDate,
      allChakrasCompleted: state.allChakrasCompleted,
      completedTrialCourses: state.completedTrialCourses,
      resetJourney: state.resetJourney,
      setJourneyWeekStartDate: state.setJourneyWeekStartDate,
    })),
  )

  useEffect(() => {
    const currentWeekStartDate = getCurrentWeekStartDateISO()

    // This effect runs whenever the journey state related to weekly progress might change.
    if (journeyStarted) {
      // Check 1: Has the week rolled over since the journey started?
      // During trial phase, we reset on Monday regardless of completion status
      // (all 7 days stay open until Sunday, then reset on Monday for next trial week)
      // BUT: After Trial 1 ends, we DON'T auto-start Trial 2 - user must press "Begin Again"
      if (
        journeyWeekStartDate &&
        journeyWeekStartDate !== currentWeekStartDate
      ) {
        // Week has changed - reset the weekly progress
        // This allows a new trial week to begin (but won't auto-start if completedTrialCourses === 1)
        resetJourney()
        // Note: allChakrasCompleted flag is preserved across resets to track trial completion
        // but the weekly progress (completedChakras, participatedDays) resets
      } else if (!journeyWeekStartDate) {
        // Check 2: Handle edge case where journey started but the start date wasn't set (e.g., state corruption).
        // Set the start date to the current week.
        setJourneyWeekStartDate(currentWeekStartDate)
      }
      // Note: If journeyWeekStartDate matches currentWeekStartDate, no action is needed.
    }
    // If journeyStarted is false, no transition logic is needed.
  }, [
    journeyStarted,
    journeyWeekStartDate,
    allChakrasCompleted,
    completedTrialCourses,
    resetJourney,
    setJourneyWeekStartDate,
  ])
}
