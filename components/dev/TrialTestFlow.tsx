/**
 * Trial Test Flow - Dev Tools for Full Trial Testing
 *
 * Provides dev buttons to:
 * 1. Red: Open paywall (CommitmentGate) for testing
 * 2. Green: Bypass waiting room → trial ChakraHome (walk through trial)
 * 3. Third: Bypass to lifetime ChakraHub
 * 4. Unlock next day (timegate bypass) when on trial home
 * 5. Grant scholarship when on paywall (after 2 trials)
 *
 * Only visible in __DEV__ mode
 */

import React from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { getCurrentWeekStartDateISO, getLocalDateISO } from "@/utils/date"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

interface TrialTestFlowProps {
  onStartDay1?: () => void
  onUnlockNextDay?: () => void
  currentDay?: number
}

export const TrialTestFlow: React.FC<TrialTestFlowProps> = ({
  onStartDay1,
  onUnlockNextDay,
  currentDay = 0,
}) => {
  if (!__DEV__) {
    return null // Only show in dev mode
  }

  const router = useRouter()
  const insets = useSafeAreaInsets()

  const {
    setInitialOpenDate,
    setCourseStartDate,
    startJourney,
    journeyStarted,
    completedTrialCourses,
    hasLifetimeAccess,
    grantLifetimeAccess,
    markDayParticipated,
    resetOnboarding,
  } = useChakraJourneyStore()
  const { resetForTesting } = useFirstLaunchStore()

  // Reset onboarding: clear all state so user sees WelcomeScreen → DateSelection → Begin flow
  const handleResetOnboarding = () => {
    addHapticFeedback(HapticStrength.Medium)
    resetOnboarding()
    resetForTesting()
    router.replace("/(chakras)/WelcomeScreen")
  }

  // Red: navigate to standalone DevPaywall for testing (avoids ChakraHome useEffect fighting it)
  const handleOpenPaywall = () => {
    addHapticFeedback(HapticStrength.Medium)
    router.replace("/(chakras)/DevPaywall")
  }

  // Green: bypass waiting room and land on trial ChakraHome (walk through trial).
  // When on waiting room we are already on ChakraHome; only hide waiting and update store.
  // Do NOT router.replace when onStartDay1 is provided — it causes remount and blank black screen on Android.
  const handleStartDay1 = () => {
    addHapticFeedback(HapticStrength.Medium)
    const today = getLocalDateISO()
    const currentWeekStart = getCurrentWeekStartDateISO()

    setInitialOpenDate(today)
    setCourseStartDate(currentWeekStart)

    if (!journeyStarted) {
      startJourney(currentWeekStart)
    }

    markDayParticipated(0)

    if (onStartDay1) {
      onStartDay1()
      return
    }
    router.replace("/(chakras)/ChakraHome")
  }

  // Third: bypass directly to lifetime ChakraHub
  const handleGoToLifetimeHome = () => {
    addHapticFeedback(HapticStrength.Medium)
    grantLifetimeAccess("scholarship")
    router.replace("/(chakras)/ChakraHub")
  }

  const handleUnlockNextDay = () => {
    addHapticFeedback(HapticStrength.Light)
    const nextDay = currentDay + 1
    if (nextDay <= 6) {
      markDayParticipated(nextDay)
      if (onUnlockNextDay) {
        onUnlockNextDay()
      }
    }
  }

  const handleGrantScholarship = () => {
    addHapticFeedback(HapticStrength.Medium)
    grantLifetimeAccess("scholarship")
  }

  return (
    <View style={[styles.container, { top: Math.max(insets.top, 8) + 8 + 56 }]}>
      {/* Tiny icon-only buttons in vertical stack */}
      <View style={styles.buttonStack}>
        {/* Reset onboarding: see full Welcome → DateSelection → Begin flow */}
        <Pressable
          onPress={handleResetOnboarding}
          style={[styles.tinyButton, styles.resetOnboardingButton]}
        >
          <Ionicons
            name="arrow-undo"
            size={12}
            color="rgba(255, 200, 100, 0.95)"
          />
        </Pressable>
        {/* Red: Open paywall for testing */}
        <Pressable
          onPress={handleOpenPaywall}
          style={[styles.tinyButton, styles.resetButton]}
        >
          <Ionicons name="refresh" size={12} color="rgba(255, 107, 107, 0.8)" />
        </Pressable>

        {/* Green: Bypass waiting room → trial ChakraHome */}
        {!hasLifetimeAccess && (
          <Pressable
            onPress={handleStartDay1}
            style={[styles.tinyButton, styles.primaryButton]}
          >
            <Ionicons
              name="play-circle"
              size={12}
              color="rgba(78, 205, 196, 0.8)"
            />
          </Pressable>
        )}

        {/* Third: Bypass to lifetime ChakraHub */}
        {!hasLifetimeAccess && (
          <Pressable
            onPress={handleGoToLifetimeHome}
            style={[styles.tinyButton, styles.lifetimeButton]}
          >
            <Ionicons name="home" size={12} color="rgba(147, 51, 234, 0.9)" />
          </Pressable>
        )}

        {/* Unlock Next Day Button (for trial home only) */}
        {journeyStarted && currentDay >= 0 && currentDay < 6 && (
          <Pressable
            onPress={handleUnlockNextDay}
            style={[styles.tinyButton, styles.secondaryButton]}
          >
            <Ionicons
              name="lock-open"
              size={12}
              color="rgba(255, 230, 109, 0.8)"
            />
          </Pressable>
        )}

        {/* Grant Scholarship Button (for paywall testing) */}
        {completedTrialCourses >= 2 && !hasLifetimeAccess && (
          <Pressable
            onPress={handleGrantScholarship}
            style={[styles.tinyButton, styles.scholarshipButton]}
          >
            <Ionicons name="gift" size={12} color="rgba(168, 201, 154, 0.8)" />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 8, // Moved to right side for better usability
    zIndex: 1000,
  },
  buttonStack: {
    flexDirection: "column",
    gap: 6,
  },
  tinyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  resetOnboardingButton: {
    borderColor: "rgba(255, 200, 100, 0.6)",
  },
  resetButton: {
    borderColor: "rgba(255, 107, 107, 0.4)",
  },
  primaryButton: {
    borderColor: "rgba(78, 205, 196, 0.4)",
  },
  secondaryButton: {
    borderColor: "rgba(255, 230, 109, 0.4)",
  },
  lifetimeButton: {
    borderColor: "rgba(147, 51, 234, 0.5)",
  },
  scholarshipButton: {
    borderColor: "rgba(168, 201, 154, 0.4)",
  },
})
