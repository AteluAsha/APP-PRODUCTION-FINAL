/**
 * (chakras) entry – routing only after root AnimatedSplashScreen finishes.
 *
 * Root _layout shows: native shield → JS pulsing hero while fonts/preload → fade out.
 * This screen stays black until store + nav are ready, then replaces to the first route.
 */
import React, { useRef, useEffect, useCallback, useState } from "react"
import { View } from "react-native"
import { useRouter, useRootNavigationState } from "expo-router"
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

  const appReady = Boolean(
    (storeRehydrationReady && rootNavigationState?.key) || forceReady,
  )

  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), FORCE_READY_MS)
    return () => clearTimeout(t)
  }, [])

  const navigate = useCallback(() => {
    if (navigatedRef.current) return
    navigatedRef.current = true
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
  }, [hasLifetimeAccess, completedTrialCourses, courseStartDate, router])

  useEffect(() => {
    if (!appReady) return
    navigate()
  }, [appReady, navigate])

  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
