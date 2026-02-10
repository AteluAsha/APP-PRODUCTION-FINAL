/**
 * (chakras) entry: enforces hero opening sequence.
 *
 * Correct flow is always: Splash → Path selection (WelcomeScreen) → Date selection → Waiting room.
 * We use hasCompletedHeroOnboarding (set only in DateSelection when they tap Begin) so that
 * we never skip path selection unless they have actually completed that flow.
 */
import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { useRouter } from "expo-router"
import { ChakraHome } from "@/components/chakras/ChakraHome"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"

export default function HomeScreen() {
  const router = useRouter()
  const storeRehydrationReady = useStoreRehydration(
    (s) => s.safetyPassed || (s.journeyRehydrated && s.firstLaunchRehydrated),
  )
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const hasCompletedHeroOnboarding = useChakraJourneyStore(
    (s) => s.hasCompletedHeroOnboarding,
  )
  const [showHome, setShowHome] = useState(false)

  useEffect(() => {
    if (!storeRehydrationReady) return
    if (hasLifetimeAccess) {
      setShowHome(true)
      return
    }
    if (!hasCompletedHeroOnboarding) {
      router.replace("/(chakras)/WelcomeScreen")
      return
    }
    setShowHome(true)
  }, [storeRehydrationReady, hasLifetimeAccess, hasCompletedHeroOnboarding, router])

  if (!storeRehydrationReady || !showHome) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />
  }
  return <ChakraHome />
}
