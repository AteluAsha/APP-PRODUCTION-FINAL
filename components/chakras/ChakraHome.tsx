import { View, ScrollView, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import PulsingButton from "@/components/chakras/PulsingButton"
import Animated, { FadeIn, FadeOut, Easing } from "react-native-reanimated"
import React, { useRef } from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { AppText } from "@/components/AppText"
import { useRouter } from "expo-router"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { getChakraIndex, getChakraFromDay } from "@/utils/chakraMapping"
import { chakraContent } from "@/constants/chakras/content"
import {
  getCurrentDayOfWeek,
  getCurrentWeekStartDateISO,
  hasReachedCourseStartDate,
} from "@/utils/date"
import { WaitingScreen } from "@/components/chakras/WaitingScreen"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { IntegratedProgressStack } from "@/components/chakras/IntegratedProgressStack"
import { WelcomeModal } from "@/components/chakras/WelcomeModal"
import { PreviewJourney } from "@/components/chakras/PreviewJourney"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { useShallow } from "zustand/react/shallow"
import { useChakrasData } from "@/hooks/useChakrasData"
import { CommitmentGate } from "@/components/chakras/CommitmentGate"
// Anua access is handled globally by FloatingNavButtons
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "react-native"
import { getNextDayUnlockTimeString } from "@/utils/unlockTime"
import {
  shouldShowWaitingScreen as shouldShowWaitingScreenCheck,
  isChakraDayAccessible,
} from "@/src/services/timegate"
// PermanentMenuBar is now rendered globally in app/_layout.tsx
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
// FrequencyHealingIcon - Temporarily disabled
// import { FrequencyHealingIcon } from "@/components/chakras/FrequencyHealingIcon"
// MiniAudioPlayer - Temporarily disabled
// import { MiniAudioPlayer } from "@/components/chakras/MiniAudioPlayer"
import { TrialTestFlow } from "@/components/dev/TrialTestFlow"
import { FirstMondayPresenceModal } from "@/components/presence/FirstMondayPresenceModal"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"

/**
 * APP_1 (Trial): Trial Home Screen
 *
 * This is the home screen for pre-paywall users (trial mode).
 * Features:
 * - Progressive chakra reveal (day-by-day unlock)
 * - Timegates enforce weekly structure
 * - Waiting screens between trials
 * - Payment gate after 2 trials
 *
 * ARCHITECTURE: Part of "Two Apps in One" - this is App 1 (Trial)
 */

// Infer the state type from the store hook
type ChakraJourneyState = ReturnType<(typeof useChakraJourneyStore)["getState"]>

/**
 * Trial Home Screen Component
 *
 * APP_1: Pre-paywall trial experience with timegates and progressive reveal
 */
export const ChakraHome = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // Memoize expensive date calculations - these don't change during component lifecycle
  const realDayOfWeek = useMemo(() => getCurrentDayOfWeek(), [])
  const currentWeekStartDate = useMemo(() => getCurrentWeekStartDateISO(), [])

  // APP_1 (Trial): Lock to 7 days of the week for trials
  // Use real day of week (0-6, Monday-Sunday) - NOT journey progress
  // This ensures trials are locked to calendar days, not journey days
  // Default starting place: Monday (day 0) = Root chakra only
  const [currentDay, setCurrentDay] = useState(realDayOfWeek)

  // Update currentDay when real day of week changes (e.g., user opens app on different day)
  // This ensures the trial always reflects the actual day of the week
  useEffect(() => {
    setCurrentDay(realDayOfWeek)
  }, [realDayOfWeek])

  // Get journey store state and actions
  const {
    journeyStarted,
    startJourney,
    markChakraCompleted,
    hasCompletedChakra,
    hasEverCompletedChakra,
    hasParticipatedDay,
    initialOpenDate,
    courseStartDate,
    setInitialOpenDate,
    completedTrialCourses,
    hasLifetimeAccess,
    allChakrasCompleted,
    completedChakras,
    trialHistory,
    lifetimeChosenTimegateJourney,
    devOpenPaywall,
    setDevOpenPaywall,
  } = useChakraJourneyStore(
    useShallow((state: ChakraJourneyState) => ({
      journeyStarted: state.journeyStarted,
      startJourney: state.startJourney,
      markChakraCompleted: state.markChakraCompleted,
      hasCompletedChakra: state.hasCompletedChakra,
      hasEverCompletedChakra: state.hasEverCompletedChakra,
      hasParticipatedDay: state.hasParticipatedDay,
      initialOpenDate: state.initialOpenDate,
      courseStartDate: state.courseStartDate,
      setInitialOpenDate: state.setInitialOpenDate,
      completedTrialCourses: state.completedTrialCourses,
      hasLifetimeAccess: state.hasLifetimeAccess,
      allChakrasCompleted: state.allChakrasCompleted,
      completedChakras: state.completedChakras,
      trialHistory: state.trialHistory,
      lifetimeChosenTimegateJourney: state.lifetimeChosenTimegateJourney,
      devOpenPaywall: state.devOpenPaywall,
      setDevOpenPaywall: state.setDevOpenPaywall,
    })),
  )

  // Get first launch state
  const { isFirstLaunch, setFirstLaunchComplete } = useFirstLaunchStore()

  // Get Anua introduction state
  // AnuaIntroductionPopup temporarily disabled

  // State for welcome modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Note: Anua access is handled globally by FloatingNavButtons

  // Whether to show waiting screen (show if not Monday and journey not started)
  const [showWaitingScreen, setShowWaitingScreen] = useState(false)

  // Whether to show preview journey screen
  const [showPreview, setShowPreview] = useState(false)

  // Whether to show payment gate (Day 14 - Sunday of second trial)
  const [showPaymentGate, setShowPaymentGate] = useState(false)

  const [isModalVisible, setModalVisible] = useState(false)
  const [showFirstMondayPresenceModal, setShowFirstMondayPresenceModal] = useState(false)
  const hasTriggeredFirstMondayPresenceRef = useRef(false)

  const hasCompletedFirstMondayPresence = usePresenceStore(
    (s) => s.hasCompletedFirstMondayPresence,
  )

  const { completedChakra, clearCompletedChakra } = useCompletedChakraStore()

  const storeRehydrationReady = useStoreRehydration((s) =>
    s.safetyPassed ? true : s.journeyRehydrated && s.firstLaunchRehydrated,
  )

  // Fetch chakra data from Firestore
  const {
    chakrasData,
    isLoading: isLoadingChakras,
    error: chakrasError,
  } = useChakrasData()

  // Set initial open date on first launch
  useEffect(() => {
    if (isFirstLaunch && !initialOpenDate) {
      const today = new Date().toISOString().split("T")[0]
      setInitialOpenDate(today)
    }
  }, [isFirstLaunch, initialOpenDate, setInitialOpenDate])

  // Check if this is the first launch and show welcome modal
  useEffect(() => {
    if (isFirstLaunch) {
      setShowWelcomeModal(true)
    }
  }, [isFirstLaunch])

  // Log the state whenever journeyStarted changes
  // useEffect(() => {
  //     console.log('[ChakraHome State Log] journeyStarted is now:', journeyStarted)
  // }, [journeyStarted])

  // Get current trial number (number of completed trials - trialHistory.length)
  // Current trial is trialHistory.length + 1 (if journeyStarted) or 0 (if not started)
  const currentTrialNumber = useMemo(() => {
    if (!journeyStarted) return 0
    return trialHistory.length + 1 // Current trial = completed trials + 1
  }, [trialHistory.length, journeyStarted])

  // APP_1 (Trial): Payment gate logic
  // 1. After trial 1 (Sunday night): If all 7 days completed → paywall opens
  // 2. After trial 2 (Sunday night): Paywall opens regardless of completion
  // NOTE: This is APP_1 (Trial) specific - APP_2 (Lifetime) never shows payment gate
  const shouldShowCommitmentGate = useMemo(() => {
    if (hasLifetimeAccess) return false // APP_2 (Lifetime): Never show payment gate

    const isSunday = currentDay === 6 // Sunday is day 6

    // Trial 1: Show paywall on Sunday if all 7 days completed
    const isFirstTrialComplete =
      currentTrialNumber === 1 && allChakrasCompleted && isSunday

    // Trial 2: Show paywall on Sunday regardless of completion
    const isSecondTrialEnded = currentTrialNumber === 2 && isSunday

    return isFirstTrialComplete || isSecondTrialEnded
  }, [
    currentTrialNumber,
    allChakrasCompleted,
    currentDay,
    hasLifetimeAccess,
    journeyStarted,
  ])

  const hasReachedStartDate = useMemo(() => {
    if (!courseStartDate) return false
    return hasReachedCourseStartDate(courseStartDate)
  }, [courseStartDate])

  const isMonday = useMemo(() => {
    return currentDay === 0
  }, [currentDay])

  useEffect(() => {
    // This effect handles the initial display logic based on the current day override
    // and whether the journey has started. It determines if the waiting screen
    // should be shown or if the journey should be automatically started (on Mondays).

    // Dev only: red dev button sets this to open paywall for testing
    if (devOpenPaywall) {
      setDevOpenPaywall(false)
      setShowPaymentGate(true)
      setShowWaitingScreen(false)
      return
    }

    // Check if we should show commitment gate after 14 days (2 complete trials)
    // Commitment gate appears after completing 2 full 7-day trials
    if (shouldShowCommitmentGate) {
      setShowPaymentGate(true)
      setShowWaitingScreen(false)
      return
    } else {
      setShowPaymentGate(false)
    }

    // APP_2 (Lifetime): Redirect to ChakraHub UNLESS they intentionally chose the timegate journey
    // (ChakraHub → DateSelection → ChakraHome: they want the Monday-Sunday experience)
    if (hasLifetimeAccess) {
      const lifetimeChosenTimegate =
        useChakraJourneyStore.getState().lifetimeChosenTimegateJourney
      if (!lifetimeChosenTimegate) {
        router.replace("/(chakras)/ChakraHub")
        setShowWaitingScreen(false)
        setShowPaymentGate(false)
        return
      }
      // They chose the journey - show trial experience with hamburger to return to ChakraHub
    }

    // APP_1 (Trial): Time gate logic only applies during trial phase (not in dev mode)
    if (!courseStartDate) {
      // Course start date not yet calculated - wait for initial open date to be set
      // But in dev mode, we've already bypassed above
      return
    }

    // APP_1 (Trial) / APP_2 (Lifetime somatic journey): Check if we should show the waiting screen
    // Pass lifetimeChosenTimegateJourney so lifetime users in somatic flow see waiting until Monday
    const showWaiting = shouldShowWaitingScreenCheck(
      hasLifetimeAccess,
      hasReachedStartDate,
      isMonday,
      journeyStarted,
      isFirstLaunch,
      courseStartDate,
      lifetimeChosenTimegateJourney,
    )

    // Mark first launch as complete AFTER we've determined to show waiting screen
    // This ensures the waiting screen logic works correctly on first-time onboarding
    if (isFirstLaunch && showWaiting) {
      setFirstLaunchComplete()
    }

    // Set waiting screen state
    setShowWaitingScreen(showWaiting)

    // Auto-start logic:
    // - First trial: Auto-start on Monday if course start date reached
    // - Lifetime somatic journey: Auto-start on Monday (fresh course, ignore completedTrialCourses)
    // - After Trial 1: DON'T auto-start - user must press "Begin Again"
    // - After Trial 2: Show paywall (handled above)
    // IMPORTANT: Don't auto-start if we're showing the waiting screen (first-time onboarding)
    const canAutoStart =
      completedTrialCourses === 0 ||
      (hasLifetimeAccess && lifetimeChosenTimegateJourney)
    const shouldAutoStart =
      hasReachedStartDate &&
      isMonday &&
      !journeyStarted &&
      canAutoStart &&
      !showWaiting

    if (shouldAutoStart) {
      startJourney(currentWeekStartDate)
    }
  }, [
    currentDay,
    journeyStarted,
    startJourney,
    currentWeekStartDate,
    courseStartDate,
    shouldShowCommitmentGate,
    hasReachedStartDate,
    isMonday,
    hasLifetimeAccess,
    isFirstLaunch,
    setFirstLaunchComplete,
    shouldShowWaitingScreenCheck,
    completedTrialCourses,
    lifetimeChosenTimegateJourney,
    devOpenPaywall,
    setDevOpenPaywall,
  ])

  // First Monday presence: when user first sees main home (no waiting) on or after course start, show once
  useEffect(() => {
    if (
      !showWaitingScreen &&
      hasReachedStartDate &&
      !hasCompletedFirstMondayPresence &&
      !hasTriggeredFirstMondayPresenceRef.current
    ) {
      hasTriggeredFirstMondayPresenceRef.current = true
      setShowFirstMondayPresenceModal(true)
    }
  }, [
    showWaitingScreen,
    hasReachedStartDate,
    hasCompletedFirstMondayPresence,
  ])

  useEffect(() => {
    // This effect reacts to the completion of a chakra from the detail screen.
    if (completedChakra) {
      // Show the completion modal
      setModalVisible(true)
      // Mark the chakra (using the actual completed chakra's day index, not currentDay)
      const chakraDayIndex = getChakraIndex(completedChakra)
      markChakraCompleted(chakraDayIndex)
    }
    // Runs when a chakra is marked completed externally or the override day changes.
  }, [completedChakra, markChakraCompleted])

  // Memoize chakra data - only recalculate when chakrasData changes
  // Data comes sorted by day (0-6: Root to Crown)
  // The views use justify-end which aligns items to the bottom
  // With justify-end: first item in array = bottom, last item = top
  // We want: Root (day 0) at bottom, Crown (day 6) at top
  // So array should be [Root (0), ..., Crown (6)] - which is the natural order
  // But user reports Root is at top, suggesting the rendering is inverted
  // Solution: Keep natural order [Root, ..., Crown] - Root will be at bottom with justify-end
  const chakraData = useMemo(() => {
    return chakrasData.length > 0 ? chakrasData : []
  }, [chakrasData])

  // Debug logging in dev mode (MUST be before any conditional returns to follow Rules of Hooks)
  // Removed conditional __DEV__ check inside useEffect to ensure hook is always called
  // The console.log itself is conditional, but the hook is always called
  useEffect(() => {
    // Only log in dev mode, but hook is always called to maintain hook order
    if (__DEV__) {
      console.log("[ChakraHome Debug]", {
        chakraDataLength: chakrasData.length,
        journeyStarted,
        hasLifetimeAccess,
        currentDay,
        isLoadingChakras,
        chakrasError: chakrasError?.message,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chakrasData.length,
    journeyStarted,
    hasLifetimeAccess,
    currentDay,
    isLoadingChakras,
  ])

  const closeModal = () => {
    setModalVisible(false)
    clearCompletedChakra()
  }

  // Close welcome modal and mark first launch as complete
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false)
    setFirstLaunchComplete()
  }

  // Begin journey from welcome modal
  // Note: This no longer starts the journey immediately - the time gate logic
  // in the useEffect will handle starting the journey when conditions are met
  const handleBeginJourney = () => {
    setShowWelcomeModal(false)
    setFirstLaunchComplete()
    // The journey will start automatically when the course start date is reached
    // and it's a Monday, as handled by the time gate logic in the useEffect
  }

  // Preview handler for the waiting screen - Show PreviewJourney component
  const handlePreviewPress = () => {
    setShowPreview(true)
  }

  // Handler to return from preview to waiting screen
  const handleBackFromPreview = () => {
    setShowPreview(false)
    // Don't set showWaitingScreen back to true - let the normal flow handle it
  }

  // Gallery handler - navigate to gallery of gnosis
  const handleGalleryPress = () => {
    router.push("/(chakras)/GalleryOfGnosis")
  }

  // Learn About Chakras handler
  const handleLearnAboutChakrasPress = () => {
    // Use push to maintain navigation stack so router.back() works correctly
    router.push("/(chakras)/Chakras101")
  }

  // Toggle waiting screen (for testing)
  const toggleWaitingScreen = () => {
    setShowWaitingScreen(!showWaitingScreen)
    if (showPreview) {
      setShowPreview(false)
    }
  }

  // Check if user has any unlocked chakra cards (across all trials)
  // MUST be before any early returns to follow Rules of Hooks
  const hasUnlockedCards = useMemo(() => {
    // Check if any chakra was ever completed
    for (let i = 0; i < 7; i++) {
      if (hasEverCompletedChakra(i)) {
        return true
      }
    }
    return false
  }, [hasEverCompletedChakra, completedChakras])

  // Render chakra display - always use IntegratedProgressStack
  const renderChakraDisplay = useCallback((): React.ReactElement => {
    return (
      <IntegratedProgressStack
        currentDay={currentDay}
        hasCompletedChakra={hasCompletedChakra}
        hasParticipatedDay={hasParticipatedDay}
        allChakrasCompleted={allChakrasCompleted}
        hasLifetimeAccess={hasLifetimeAccess}
        inCourseMode={hasLifetimeAccess} // Lifetime somatic journey: apply trial timegates
        chakraData={chakraData}
        router={router}
      />
    )
  }, [
    currentDay,
    hasCompletedChakra,
    hasParticipatedDay,
    allChakrasCompleted,
    hasLifetimeAccess,
    chakraData,
    router,
  ])

  // Note: Anua access is handled globally by FloatingNavButtons

  // ALL HOOKS MUST BE ABOVE THIS LINE - NO HOOKS AFTER EARLY RETURNS

  // If showing payment gate, render it (highest priority)
  if (showPaymentGate) {
    return (
      <CommitmentGate
        onComplete={() => {
          setShowPaymentGate(false)
        }}
      />
    )
  }

  // If showing preview journey screen, render it instead of chakras or waiting screen
  if (showPreview) {
    return <PreviewJourney onBackPress={handleBackFromPreview} />
  }

  // Welcome (first launch) or Waiting room: show when waiting, or when trial user has no start date yet.
  // Do not show main content until persisted stores have rehydrated (prevents skipping to chakra home
  // on first paint before we know real courseStartDate / isFirstLaunch).
  const needsWelcomeOrWaiting =
    !storeRehydrationReady ||
    showWaitingScreen ||
    showWelcomeModal ||
    isFirstLaunch ||
    (hasLifetimeAccess === false && !courseStartDate)
  if (needsWelcomeOrWaiting) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        {showWaitingScreen && (
        <WaitingScreen
          onPreviewPress={handlePreviewPress}
          onHideWaitingScreen={() => setShowWaitingScreen(false)}
          onGalleryPress={hasUnlockedCards ? handleGalleryPress : undefined}
          onBeginAgainPress={
            completedTrialCourses === 1 && isMonday
              ? () => {
                  startJourney(currentWeekStartDate)
                  setShowWaitingScreen(false)
                }
              : undefined
          }
          onLearnAboutChakrasPress={handleLearnAboutChakrasPress}
          completedTrialCourses={completedTrialCourses}
          hasLifetimeAccess={hasLifetimeAccess}
          onPayPress={() => {
            setShowPaymentGate(true)
            setShowWaitingScreen(false)
          }}
          onExitCourseMode={
            hasLifetimeAccess
              ? () => {
                  useChakraJourneyStore
                    .getState()
                    .setLifetimeChosenTimegateJourney(false)
                  router.replace("/(chakras)/ChakraHub")
              }
            : undefined
          }
        />
        )}
        <WelcomeModal
          isVisible={
            showWelcomeModal ||
            isFirstLaunch ||
            (hasLifetimeAccess === false && !courseStartDate)
          }
          onClose={handleWelcomeModalClose}
          onBeginJourney={handleBeginJourney}
          currentDayOfWeek={realDayOfWeek}
          completedTrialCourses={completedTrialCourses}
          initialOpenDate={initialOpenDate}
        />
      </View>
    )
  }

  // Somatic flow: No loading screen - smooth fade-in instead
  // Content appears naturally as data becomes available, creating embodied flow
  // Applied somatic healing principles: natural timing, breathing rhythms, smooth transitions

  // Show error state if fetching failed (with smooth fade-in)
  if (chakrasError) {
    return (
      <Animated.View
        entering={FadeIn.duration(1200).easing(Easing.out(Easing.ease))}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
          padding: 32,
        }}
      >
        <AppText
          font="instrument-medium"
          size="lg"
          style={{ textAlign: "center", marginBottom: 16, color: "rgba(255,255,255,0.9)" }}
        >
          The chakras are taking a moment to arrive
        </AppText>
        <AppText
          font="instrument-regular"
          size="base"
          style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}
        >
          Please try again, or continue your journey
        </AppText>
      </Animated.View>
    )
  }

  return (
    <Animated.View
      entering={FadeIn.duration(1400).easing(Easing.out(Easing.ease))}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top", "bottom"]}>
        {/* APP_2 (Lifetime) → APP_1 (Trial) Switch: Hamburger menu to return to App 2 */}
        {hasLifetimeAccess && (
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              useChakraJourneyStore
                .getState()
                .setLifetimeChosenTimegateJourney(false)
              router.replace("/(chakras)/ChakraHub")
            }}
            style={{
              position: "absolute",
              top: 60,
              left: 16,
              zIndex: 1000,
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Return to Hub"
            accessibilityHint="Tap to return to your sacred space"
          >
            <View style={{ gap: 4 }}>
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 1,
                }}
              />
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 1,
                }}
              />
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 1,
                }}
              />
            </View>
          </Pressable>
        )}
        {/* Note: GlobalHomeButton handles "chakras 101" link on home screen (top right) */}

        {/* Hamburger – Profile (name, photo, Soul School ID). Same position as ChakraHub. */}
        <Pressable
          onPress={() => {
            addHapticFeedback(HapticStrength.Light)
            useProfileSheetStore.getState().open()
          }}
          style={{
            position: "absolute",
            top: Math.max(insets.top, 8) + 12,
            right: 16,
            zIndex: 100,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.15)",
            justifyContent: "center",
            alignItems: "center",
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Profile menu"
          accessibilityHint="View your profile and Soul School ID"
        >
          <Ionicons name="menu" size={22} color="rgba(255, 255, 255, 0.9)" />
        </Pressable>

        {/* ScrollView to enable scrolling through chakras */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 40,
            minHeight: "100%",
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          bounces={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* UX Improvement: Trial Progress Indication */}
          {!hasLifetimeAccess &&
            completedTrialCourses > 0 &&
            journeyStarted && (
              <View style={{ alignItems: "center", paddingHorizontal: 24, marginBottom: 16 }}>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}
                >
                  {completedTrialCourses === 1
                    ? "Trial 2 of 2"
                    : "Trial 1 of 2"}
                </AppText>
              </View>
            )}

          {/* Show "Continue Your Journey" button if user has completed 2 trials but hasn't paid */}
          {completedTrialCourses === 2 && !hasLifetimeAccess && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 80,
              }}
            >
              <View style={{ alignItems: "center", maxWidth: 448, gap: 24 }}>
                <AppText
                  font="instrument-bold"
                  size="2xl"
                  style={{ textAlign: "center", marginBottom: 16, color: "rgba(255,255,255,0.9)" }}
                >
                  Your Journey Awaits
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={{ textAlign: "center", marginBottom: 16, color: "rgba(255,255,255,0.7)", lineHeight: 24 }}
                >
                  You've completed both trials. Continue your path with lifetime
                  access to all teachings and sacred spaces.
                </AppText>

                {/* Learn About Chakras Button */}
                <Pressable
                  onPress={handleLearnAboutChakrasPress}
                  style={{ width: "100%" }}
                  accessibilityLabel="Learn About Chakras"
                  accessibilityHint="Explore the 7 chakras"
                >
                  <View
                    style={{
                      borderRadius: 16,
                      paddingVertical: 14,
                      paddingHorizontal: 24,
                      alignItems: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={require("@/assets/images/SoulSchool_HERO_Logo.png")}
                      style={{ width: 28, height: 14 }}
                      resizeMode="contain"
                    />
                    <AppText
                      font="instrument-regular"
                      size="base"
                      style={{ color: "rgba(255,255,255,0.8)", marginLeft: 12 }}
                    >
                      Learn About Chakras
                    </AppText>
                  </View>
                </Pressable>

                {/* Continue Your Journey Button */}
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Medium)
                    setShowPaymentGate(true)
                  }}
                  style={{ width: "100%" }}
                  accessibilityLabel="Continue Your Journey"
                  accessibilityHint="Proceed to payment options"
                >
                  <LinearGradient
                    colors={["#60a5fa", "#a855f7", "#fb923c"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 16,
                      paddingVertical: 16,
                      paddingHorizontal: 32,
                      alignItems: "center",
                      shadowColor: "#60a5fa",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <AppText
                      font="instrument-bold"
                      size="lg"
                      style={{ color: "#ffffff" }}
                    >
                      Continue Your Journey
                    </AppText>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          )}

          {/* Chakra Cards button: gradient depth + chakra icon pop */}
          {!hasLifetimeAccess &&
            hasUnlockedCards &&
            journeyStarted &&
            !(completedTrialCourses === 2 && !hasLifetimeAccess) && (
              <View style={{ alignItems: "center", paddingHorizontal: 24, marginBottom: 16 }}>
                <Pressable
                  onPress={handleGalleryPress}
                  style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
                  accessibilityLabel="View Your Chakra Cards"
                  accessibilityHint="Open Gallery of Gnosis"
                >
                  <LinearGradient
                    colors={[
                      "rgba(135, 174, 115, 0.22)",
                      "rgba(135, 174, 115, 0.1)",
                      "rgba(6, 182, 212, 0.12)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 18,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "rgba(6, 182, 212, 0.35)",
                      shadowColor: "rgba(6, 182, 212, 0.3)",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.6,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Image
                      source={require("@/assets/images/7chakras.png")}
                      style={{ width: 28, height: 28, marginRight: 10 }}
                      resizeMode="contain"
                      accessibilityLabel="Chakra cards"
                    />
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={{ color: "rgba(255, 255, 255, 0.95)", flex: 1 }}
                    >
                      View Your Chakra Cards
                    </AppText>
                  </LinearGradient>
                </Pressable>
              </View>
            )}

          {/* Render chakra display (only if not in post-trial state) */}
          {!(completedTrialCourses === 2 && !hasLifetimeAccess) &&
            renderChakraDisplay()}
        </ScrollView>

        {/* Note: Anua access is handled globally by FloatingNavButtons */}

        <GoodbyeModal
          isVisible={isModalVisible}
          onClose={() => closeModal()}
          chakraDay={
            completedChakra ? getChakraIndex(completedChakra) : currentDay
          }
        />

        {/* First Monday presence: name + visual expression, then trial begins */}
        <FirstMondayPresenceModal
          visible={showFirstMondayPresenceModal}
          onClose={() => setShowFirstMondayPresenceModal(false)}
          onComplete={() => setShowFirstMondayPresenceModal(false)}
        />

        {/* Note: Anua Chat is handled globally by FloatingNavButtons via SocialSanctuaryModal */}

        {/* Permanent Menu Bar - Now rendered globally in app/_layout.tsx */}

        {/* Dev Test Flow Tools - Only in dev mode, and NOT on goodbye modal */}
        {__DEV__ && !isModalVisible && (
          <TrialTestFlow
            onUnlockNextDay={() => {
              // Force re-render to show newly unlocked day
              // The store update should trigger a re-render via zustand subscription
            }}
            currentDay={currentDay}
          />
        )}
      </SafeAreaView>
    </Animated.View>
  )
}
