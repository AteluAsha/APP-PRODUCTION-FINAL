/**
 * APP_1 (Trial): ChakraHome Route
 *
 * Routing guard: Redirects lifetime users to ChakraHub UNLESS they intentionally
 * chose the timegate journey (Somatic Alignment button on ChakraHub).
 */

import React, { useEffect } from "react"
import { useRouter } from "expo-router"
import { ChakraHome } from "@/components/chakras/ChakraHome"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"

export default function ChakraHomeScreen() {
  const router = useRouter()

  const { hasLifetimeAccess, lifetimeChosenTimegateJourney } =
    useChakraJourneyStore(
      useShallow((state) => ({
        hasLifetimeAccess: state.hasLifetimeAccess,
        lifetimeChosenTimegateJourney: state.lifetimeChosenTimegateJourney,
      })),
    )

  // APP_2 (Lifetime): Redirect to ChakraHub UNLESS they chose the timegate journey
  // (ChakraHub → Somatic Alignment → DateSelection → ChakraHome)
  useEffect(() => {
    if (hasLifetimeAccess && !lifetimeChosenTimegateJourney) {
      router.replace("/(chakras)/ChakraHub")
    }
  }, [hasLifetimeAccess, lifetimeChosenTimegateJourney, router])

  // Don't render ChakraHome if redirecting (lifetime without timegate choice)
  if (hasLifetimeAccess && !lifetimeChosenTimegateJourney) {
    return null
  }

  return <ChakraHome />
}
