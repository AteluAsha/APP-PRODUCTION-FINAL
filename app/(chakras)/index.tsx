/**
 * (chakras) entry – OPENING SEQUENCE (direct when already in)
 *
 * Four paths:
 * 1. Lifetime: Splash → ChakraHub. Only route to DateSelection is via course-mode button on ChakraHub (somatic journey).
 * 2. Trial, after trial 1 (completedTrialCourses === 1): Splash → DateSelection so user can engage trial 2.
 * 3. Trial, already in (courseStartDate set): Splash → ChakraHome (waiting room or main home per timegate). No WelcomeScreen.
 * 4. Trial, first time (no courseStartDate): Splash → WelcomeScreen (path selection).
 *
 * UX: After first date confirmation, welcome never opens on app open. Return to path selection only via hamburger "Return to Soul School Course Selection".
 *
 * Dev note: On simulator, state persists across rebuilds. So a "fresh build" can still have courseStartDate from a prior run → path 3 (ChakraHome). That is correct; it is not an onboarding bug. Use the dev "Reset onboarding" button to clear state and test path 4 (WelcomeScreen → timegate → waiting room).
 */
import React, { useEffect } from "react"
import { useRouter, useRootNavigationState } from "expo-router"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { StillnessScreen } from "@/components/StillnessScreen"

export default function HomeScreen() {
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const storeRehydrationReady = useStoreRehydration((s) =>
    s.safetyPassed ? true : s.journeyRehydrated && s.firstLaunchRehydrated,
  )
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const completedTrialCourses = useChakraJourneyStore(
    (s) => s.completedTrialCourses,
  )
  const courseStartDate = useChakraJourneyStore((s) => s.courseStartDate)

  // Wait for store rehydration and root navigator mount, then route once.
  useEffect(() => {
    if (!storeRehydrationReady) return
    if (!rootNavigationState?.key) return

    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
      return
    }
    if (completedTrialCourses === 1) {
      router.replace("/(chakras)/DateSelection")
      return
    }
    if (courseStartDate) {
      router.replace("/(chakras)/ChakraHome")
      return
    }
    router.replace("/(chakras)/WelcomeScreen")
  }, [
    storeRehydrationReady,
    rootNavigationState?.key,
    hasLifetimeAccess,
    completedTrialCourses,
    courseStartDate,
    router,
  ])

  return <StillnessScreen />
}
