/**
 * Paywall Screen (Energy Exchange)
 *
 * Periodic and menu-opened gate. Dismissable. Continue returns to ChakraHub.
 */

import React, { useEffect } from "react"
import { useRouter } from "expo-router"
import { CommitmentGate } from "@/components/chakras/CommitmentGate"
import { requestChakraHubRevealBreath } from "@/utils/homeSessionEntrance"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"

export default function PaywallScreen() {
  const router = useRouter()
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)

  useEffect(() => {
    if (!hasLifetimeAccess) return
    if (router.canGoBack()) router.back()
    else router.replace("/(chakras)/ChakraHub")
  }, [hasLifetimeAccess, router])

  const handleComplete = () => {
    requestChakraHubRevealBreath()
    router.replace("/(chakras)/ChakraHub")
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }

  if (hasLifetimeAccess) return null

  return (
    <CommitmentGate
      onComplete={handleComplete}
      onBack={handleBack}
      onContinueJourney={handleBack}
    />
  )
}
