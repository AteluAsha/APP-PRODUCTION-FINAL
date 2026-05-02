/**
 * (chakras) entry – cold-start routing after store rehydration AND JS splash fade-out.
 *
 * Root _layout: native shield → AnimatedSplashScreen (Soul School hero) → fade out.
 * We do not replace() to Welcome/ChakraHome/etc. until `jsSplashFadeComplete` is true so
 * ChakraHome/WaitingScreen (and portaled Modals) never mount under the splash stack.
 */
import React, { useRef, useEffect, useCallback, useState } from "react"
import { View } from "react-native"
import { useRouter, useRootNavigationState } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { WAITING_ROOM_CLARITY_MOMENT_SEEN_KEY } from "@/constants/onboardingKeys"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"
import { isWellFormedCourseStartIso } from "@/utils/journeySchedulingHealth"

const FORCE_READY_MS = 5000
/** If JS splash never completes fade (e.g. asset hang), unblock routing */
const SPLASH_FADE_FALLBACK_MS = 12000

export default function HomeScreen() {
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const navigatedRef = useRef(false)
  const [forceReady, setForceReady] = useState(false)

  const storeRehydrationReady = useStoreRehydration((s) =>
    s.safetyPassed ? true : s.journeyRehydrated && s.firstLaunchRehydrated,
  )
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const completedTrialCourses = useChakraJourneyStore(
    (s) => s.completedTrialCourses,
  )
  const courseStartDate = useChakraJourneyStore((s) => s.courseStartDate)
  const dateSelectionEmbodimentHandoffComplete = useChakraJourneyStore(
    (s) => s.dateSelectionEmbodimentHandoffComplete,
  )
  const jsSplashFadeComplete = useSplashOverlayStore((s) => s.jsSplashFadeComplete)

  const appReady = Boolean(
    (storeRehydrationReady && rootNavigationState?.key) || forceReady,
  )

  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), FORCE_READY_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!appReady || jsSplashFadeComplete) return
    const t = setTimeout(() => {
      useSplashOverlayStore.getState().setJsSplashFadeComplete(true)
    }, SPLASH_FADE_FALLBACK_MS)
    return () => clearTimeout(t)
  }, [appReady, jsSplashFadeComplete])

  const navigate = useCallback(async () => {
    if (navigatedRef.current) return

    const snap0 = useChakraJourneyStore.getState()
    if (
      !snap0.hasLifetimeAccess &&
      snap0.courseStartDate &&
      !isWellFormedCourseStartIso(snap0.courseStartDate)
    ) {
      snap0.recoverStuckCourseSchedulingToDateSelection()
    }

    // Legacy key: migrate before routing so first paint does not trap users on DateSelection.
    if (
      courseStartDate &&
      !hasLifetimeAccess &&
      dateSelectionEmbodimentHandoffComplete !== true
    ) {
      try {
        const legacy = await AsyncStorage.getItem(
          WAITING_ROOM_CLARITY_MOMENT_SEEN_KEY,
        )
        if (legacy === "true") {
          useChakraJourneyStore.setState({
            dateSelectionEmbodimentHandoffComplete: true,
          })
        }
      } catch {
        /* ignore */
      }
    }

    if (navigatedRef.current) return
    navigatedRef.current = true

    const handoffComplete =
      useChakraJourneyStore.getState().dateSelectionEmbodimentHandoffComplete ===
      true

    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
      return
    }
    if (completedTrialCourses === 1) {
      router.replace("/(chakras)/DateSelection")
      return
    }
    // Persisted course start alone must not skip DateSelection until embodiment handoff (Present).
    if (courseStartDate && !hasLifetimeAccess && !handoffComplete) {
      router.replace("/(chakras)/DateSelection")
      return
    }
    if (courseStartDate) {
      router.replace("/(chakras)/ChakraHome")
      return
    }
    router.replace("/(chakras)/WelcomeScreen")
  }, [
    hasLifetimeAccess,
    completedTrialCourses,
    courseStartDate,
    dateSelectionEmbodimentHandoffComplete,
    router,
  ])

  const routeWhenReady = appReady && jsSplashFadeComplete

  useEffect(() => {
    if (!routeWhenReady) return
    void navigate()
  }, [routeWhenReady, navigate])

  // Solid black only — never null (avoids default window flash); never loading UI here.
  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
