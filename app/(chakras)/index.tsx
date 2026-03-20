/**
 * (chakras) entry – Opening only
 *
 * Single path: OpeningSplash (logo, fade in → somatic pulse until ready → soft fade to first screen).
 * Native splash is hidden shortly after mount so in-app splash is visible. When store is rehydrated
 * and nav is ready, splash receives appReady and fades out, then navigates:
 * - Lifetime → ChakraHub
 * - Trial, after trial 1 → DateSelection
 * - Trial, has courseStartDate → ChakraHome
 * - Trial, first time → WelcomeScreen
 *
 * Fallback: if appReady never becomes true (e.g. nav state or rehydration slow in simulator),
 * we force ready after FORCE_READY_MS so the app never stays stuck on the splash.
 */
import React, { useRef, useEffect, useCallback, useState } from "react"
import { View, Platform } from "react-native"
import { useRouter, useRootNavigationState } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { OpeningSplash } from "@/components/OpeningSplash"

const HIDE_NATIVE_SPLASH_MS = Platform.OS === "ios" ? 80 : 50
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

  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {})
    }, HIDE_NATIVE_SPLASH_MS)
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

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <OpeningSplash appReady={appReady} onComplete={navigate} />
    </View>
  )
}
