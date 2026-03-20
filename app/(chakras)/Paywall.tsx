/**
 * Paywall Screen (Upgrade to Lifetime)
 *
 * Standalone route so trial users (APP1) can open the paywall from the hamburger
 * (SOUL SCHOOL → Upgrade to Lifetime). They can pay and go to ChakraHub or revert with back.
 * Only linked from trial mode; not shown in lifetime hamburger.
 */

import React, { useMemo } from "react"
import { useRouter } from "expo-router"
import { CommitmentGate } from "@/components/chakras/CommitmentGate"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { getCurrentDayOfWeek } from "@/utils/date"

export default function PaywallScreen() {
  const router = useRouter()
  const journeyStarted = useChakraJourneyStore((s) => s.journeyStarted)
  const trialHistory = useChakraJourneyStore((s) => s.trialHistory)
  const allChakrasCompleted = useChakraJourneyStore((s) => s.allChakrasCompleted)
  const setUserChoseTrial2 = useChakraJourneyStore((s) => s.setUserChoseTrial2)

  const currentDay = useMemo(() => getCurrentDayOfWeek(), [])
  const currentTrialNumber = useMemo(
    () => (journeyStarted ? trialHistory.length : 0),
    [journeyStarted, trialHistory.length],
  )

  const isFirstTrialComplete =
    currentTrialNumber === 1 && allChakrasCompleted && currentDay === 6

  const handleComplete = () => {
    router.replace("/(chakras)/ChakraHub")
  }

  const handleBack = () => {
    router.back()
  }

  const handleContinueToTrial2 = () => {
    setUserChoseTrial2(true)
    router.replace("/(chakras)/DateSelection")
  }

  return (
    <CommitmentGate
      onComplete={handleComplete}
      onBack={handleBack}
      showContinueToTrial2={isFirstTrialComplete}
      onContinueToTrial2={handleContinueToTrial2}
      onContinueJourney={handleBack}
    />
  )
}
