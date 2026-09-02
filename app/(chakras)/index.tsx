/**
 * (chakras) entry – cold-start routing after store rehydration AND JS splash fade-out.
 *
 * Splash → Wellness gate (once) → App 2 homescreen (ChakraHub).
 */
import React, { useRef, useEffect, useCallback, useState } from "react"
import { View } from "react-native"
import { useRouter, useRootNavigationState } from "expo-router"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"

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
  const jsSplashFadeComplete = useSplashOverlayStore((s) => s.jsSplashFadeComplete)
  const hasStartedMasterTeachings = useFirstLaunchStore(
    (s) => s.hasStartedMasterTeachings,
  )

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
    navigatedRef.current = true
    const agreed =
      hasStartedMasterTeachings ||
      useFirstLaunchStore.getState().hasStartedMasterTeachings
    if (!agreed) {
      router.replace("/(chakras)/WellnessGate")
      return
    }
    router.replace("/(chakras)/ChakraHub")
  }, [router, hasStartedMasterTeachings])

  const routeWhenReady = appReady && jsSplashFadeComplete

  useEffect(() => {
    if (!routeWhenReady) return
    void navigate()
  }, [routeWhenReady, navigate])

  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
