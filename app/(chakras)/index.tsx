/**
 * (chakras) entry – routing only after root AnimatedSplashScreen finishes.
 *
 * Root _layout shows: native shield → JS pulsing hero while fonts/preload → fade out.
 *
 * This route renders nothing but the Void: no logos, no spinners. Store + nav resolve in
 * silence while the chakras Stack fade (~600ms) runs; replace() then hands off to the
 * destination (Welcome / ChakraHome / ChakraHub / DateSelection) for its own entrance
 * (e.g. 3000ms somatic inhalation on home dashboards).
 */
import React, { useRef, useEffect, useCallback, useState } from "react"
import { View } from "react-native"
import { useRouter, useRootNavigationState } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { WAITING_ROOM_CLARITY_MOMENT_SEEN_KEY } from "@/constants/onboardingKeys"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"

const FORCE_READY_MS = 5000

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

  const appReady = Boolean(
    (storeRehydrationReady && rootNavigationState?.key) || forceReady,
  )

  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), FORCE_READY_MS)
    return () => clearTimeout(t)
  }, [])

  const navigate = useCallback(async () => {
    if (navigatedRef.current) return

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

  useEffect(() => {
    if (!appReady) return
    void navigate()
  }, [appReady, navigate])

  // Solid black only — never null (avoids default window flash); never loading UI here.
  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
