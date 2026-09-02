/**
 * Start the 7-day trial / course without date or time pickers.
 * Week aligns to the real calendar: Monday = Root … Sunday = Crown.
 * Today's chakra is available immediately (no waiting room).
 */

import { getCurrentWeekStartDateISO, getLocalDateISO } from "@/utils/date"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"

export function beginCalendarAlignedTrial(): string {
  const monday = getCurrentWeekStartDateISO()
  const today = getLocalDateISO()
  const journey = useChakraJourneyStore.getState()

  journey.setInitialOpenDate(today)
  journey.setCourseStartDate(monday)
  journey.startJourney(monday)
  journey.setDateSelectionEmbodimentHandoffComplete(true)
  journey.setHasCompletedHeroOnboarding(true)
  journey.setLifetimeChosenTimegateJourney(true)

  useFirstLaunchStore.getState().setFirstLaunchComplete()

  return monday
}
