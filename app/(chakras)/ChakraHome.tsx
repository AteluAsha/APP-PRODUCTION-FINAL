/**
 * APP_1 (Trial): ChakraHome Route
 *
 * Routing guard: Redirects lifetime users to ChakraHub UNLESS they intentionally
 * chose the timegate journey (Somatic Alignment button on ChakraHub).
 *
 * LOCK HERO: If trial user has no courseStartDate, they bypassed path selection.
 * Redirect to WelcomeScreen (single source of truth for path selection).
 */

import React, { useEffect } from "react"
import { useRouter } from "expo-router"
import { ChakraHome } from "@/components/chakras/ChakraHome"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { StillnessScreen } from "@/components/StillnessScreen"

export default function ChakraHomeScreen() {
  const router = useRouter()

  const { hasLifetimeAccess, lifetimeChosenTimegateJourney, courseStartDate } =
    useChakraJourneyStore(
      useShallow((state) => ({
        hasLifetimeAccess: state.hasLifetimeAccess,
        lifetimeChosenTimegateJourney: state.lifetimeChosenTimegateJourney,
        courseStartDate: state.courseStartDate,
      })),
    )

  // All hooks before any conditional returns (rules-of-hooks)
  useEffect(() => {
    if (!hasLifetimeAccess && !courseStartDate) {
      router.replace("/(chakras)/WelcomeScreen")
    }
  }, [hasLifetimeAccess, courseStartDate, router])

  useEffect(() => {
    if (hasLifetimeAccess && !lifetimeChosenTimegateJourney) {
      router.replace("/(chakras)/ChakraHub")
    }
  }, [hasLifetimeAccess, lifetimeChosenTimegateJourney, router])

  if (!hasLifetimeAccess && !courseStartDate) {
    return <StillnessScreen />
  }

  if (hasLifetimeAccess && !lifetimeChosenTimegateJourney) {
    return <StillnessScreen />
  }

  return <ChakraHome />
}
