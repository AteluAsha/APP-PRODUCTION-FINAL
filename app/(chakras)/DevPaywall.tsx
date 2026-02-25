/**
 * Dev Paywall Screen
 *
 * Standalone route for testing the paywall (CommitmentGate) without ChakraHome's
 * useEffect fighting it. Red dev button navigates here from trial waiting room.
 *
 * Renders the EXACT SAME CommitmentGate component as ChakraHome - no duplication.
 * Any changes to CommitmentGate.tsx apply to both this dev route and the main
 * in-app paywall. Use this route to quickly preview paywall changes.
 *
 * Dev-only: __DEV__ guard; production builds will not include this route in nav.
 */

import React from "react"
import { useRouter } from "expo-router"
import { CommitmentGate } from "@/components/chakras/CommitmentGate"

export default function DevPaywallScreen() {
  const router = useRouter()

  const handleComplete = () => {
    router.replace("/(chakras)/ChakraHome")
  }

  const handleBack = () => {
    router.replace("/(chakras)/ChakraHome")
  }

  return (
    <CommitmentGate
      onComplete={handleComplete}
      onBack={__DEV__ ? handleBack : undefined}
    />
  )
}
