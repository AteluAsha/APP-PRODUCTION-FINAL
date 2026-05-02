import { View, Pressable, Platform } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import PulsingButton from "@/components/chakras/PulsingButton"
import Animated from "react-native-reanimated"
import React, { useRef } from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { AppText } from "@/components/AppText"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { SomaticHeroImage } from "@/components/ui/SomaticHeroImage"
import { getChakraIndex, getChakraFromDay } from "@/utils/chakraMapping"
import { chakraContent } from "@/constants/chakras/content"
import {
  daysSince,
  getCurrentDayOfWeek,
  getCurrentWeekStartDateISO,
  getLocalDateISO,
  getTimeRemaining,
  hasReachedCourseStartDate,
} from "@/utils/date"
import { WaitingScreen } from "@/components/chakras/WaitingScreen"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { IntegratedProgressStack } from "@/components/chakras/IntegratedProgressStack"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { useShallow } from "zustand/react/shallow"
import { useChakrasData } from "@/hooks/useChakrasData"
import { CommitmentGate } from "@/components/chakras/CommitmentGate"
import { SealOfTheInitiate } from "@/components/chakras/SealOfTheInitiate"
import { JourneySummaryGift } from "@/components/chakras/JourneySummaryGift"
import { GraceOfThePresence } from "@/components/chakras/GraceOfThePresence"
import { RestingBlessing } from "@/components/chakras/RestingBlessing"
// Anua access is handled globally by PermanentMenuBar
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { getNextDayUnlockTimeString } from "@/utils/unlockTime"
import {
  shouldShowWaitingScreen as shouldShowWaitingScreenCheck,
  isChakraDayAccessible,
} from "@/src/services/timegate"
// PermanentMenuBar is now rendered globally in app/_layout.tsx
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { useMenuBarStore } from "@/hooks/useMenuBarStore"
import { FirstMondayPresenceModal } from "@/components/presence/FirstMondayPresenceModal"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { useStoreRehydration } from "@/hooks/useStoreRehydration"
import {
  TRIAL_HOME_ROOT_CHAKRA,
  SCROLL_BREATHING_BOTTOM_PADDING,
} from "@/constants/layout"
import { useHomeSomaticEntrance } from "@/hooks/useHomeSomaticEntrance"
import { storage } from "@/src/services/firebase"
import {
  getAudioPreloadStarted,
  setAudioPreloadStarted,
} from "@/src/utils/audioPreloadGuard"
import { onJourneyWeekStarted } from "@/src/services/journeyNotifications"

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
    userChoseTrial2,
    setUserChoseTrial2,
    userChoseSovereignDepart,
    setUserChoseSovereignDepart,
    userChoseGentleDepart,
    setUserChoseGentleDepart,
    devOpenPaywall,
    setDevOpenPaywall,
    openPaywallFromGraceReturn,
    setOpenPaywallFromGraceReturn,
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
      userChoseTrial2: state.userChoseTrial2,
      setUserChoseTrial2: state.setUserChoseTrial2,
      userChoseSovereignDepart: state.userChoseSovereignDepart,
      setUserChoseSovereignDepart: state.setUserChoseSovereignDepart,
      userChoseGentleDepart: state.userChoseGentleDepart,
      setUserChoseGentleDepart: state.setUserChoseGentleDepart,
      devOpenPaywall: state.devOpenPaywall,
      setDevOpenPaywall: state.setDevOpenPaywall,
      openPaywallFromGraceReturn: state.openPaywallFromGraceReturn,
      setOpenPaywallFromGraceReturn: state.setOpenPaywallFromGraceReturn,
    })),
  )

  // Get first launch state
  const { isFirstLaunch, setFirstLaunchComplete } = useFirstLaunchStore()

  // Get Anua introduction state
  // AnuaIntroductionPopup temporarily disabled

  // Note: Anua access is handled globally by PermanentMenuBar

  // Whether to show waiting screen (show if not Monday and journey not started)
  const [showWaitingScreen, setShowWaitingScreen] = useState(false)

  // Whether to show payment gate (Day 14 - Sunday of second trial)
  const [showPaymentGate, setShowPaymentGate] = useState(false)

  // Goodbye modal: show on first paint when completedChakra is set (no flash of home before modal)
  const isGoodbyeVisible = completedChakra != null
  const [showFirstMondayPresenceModal, setShowFirstMondayPresenceModal] =
    useState(false)
  const hasTriggeredFirstMondayPresenceRef = useRef(false)
  const graceReturnHandledRef = useRef(false)

  const hasCompletedFirstMondayPresence = usePresenceStore(
    (s) => s.hasCompletedFirstMondayPresence,
  )

  const { completedChakra, setCompletedChakra, clearCompletedChakra } =
    useCompletedChakraStore()

  /** Track which days we have already shown GoodbyeModal this session. Course page is the only place that shows goodbye. */
  const goodbyeShownForDaysRef = useRef<Set<number>>(new Set())

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
      const today = getLocalDateISO()
      setInitialOpenDate(today)
    }
  }, [isFirstLaunch, initialOpenDate, setInitialOpenDate])

  // Log the state whenever journeyStarted changes
  // useEffect(() => {
  //     console.log('[ChakraHome State Log] journeyStarted is now:', journeyStarted)
  // }, [journeyStarted])

  // Current trial number: 1-based. trialHistory includes the in-progress trial,
  // so length 1 = trial 1, length 2 = trial 2. (Previously used +1, which made
  // trial 1 show as "trial 2" and triggered Grace/Seal incorrectly on first run.)
  const currentTrialNumber = useMemo(() => {
    if (!journeyStarted) return 0
    return trialHistory.length
  }, [trialHistory.length, journeyStarted])

  const hasReachedStartDate = useMemo(() => {
    if (!courseStartDate) return false
    return hasReachedCourseStartDate(courseStartDate)
  }, [courseStartDate])

  // GUARDRAIL: Trial 2's 7-day window has actually elapsed.
  //
  // Without this, "Trial 2 ended" was true the instant trialHistory.length === 2,
  // which meant any user who tapped "Continue to Trial 2" and picked a future Monday
  // would hit Grace / paywall the moment that Monday arrived – before doing a single
  // Trial 2 chakra. It also meant that if stale or backup-restored state ever landed
  // a fresh user with trialHistory.length === 2, they would hit Grace on their first
  // open instead of the trial home. This guard requires the 2nd trial's startDate to
  // be at least 7 days in the past.
  //
  // IMPORTANT: This flag is specifically for the Grace path (did-not-complete). The
  // Seal / paywall path ALSO accepts `allChakrasCompleted` so a user who finishes
  // all 7 on Sunday of Trial 2 week still sees Seal immediately – we are not
  // delaying the happy-ending screen.
  const hasTrial2WindowElapsed = useMemo(() => {
    if (trialHistory.length < 2) return false
    const secondTrial = trialHistory[1]
    if (!secondTrial?.startDate) return false
    const elapsed = daysSince(secondTrial.startDate)
    if (elapsed === null) return false
    return elapsed >= 7
  }, [trialHistory])

  // APP_1 (Trial): Payment gate logic
  // 1. After trial 1 (Sunday night): If all 7 days completed → paywall opens
  // 2. After trial 2: Paywall opens either (a) when all 7 are completed (early Seal →
  //    Alchemist → paywall) or (b) when the 7-day Trial 2 window has fully elapsed
  //    without completion (Grace → paywall). Never fires on Trial 2 Monday itself.
  // CRITICAL: Never show paywall before user has reached their course start date.
  // User who just picked a future Monday (DateSelection → Begin) must see WaitingScreen.
  // Old persisted trialHistory can otherwise trigger paywall incorrectly.
  const shouldShowCommitmentGate = useMemo(() => {
    // HARD RULE: Sequence cards (Grace, Seal, RestingBlessing, JourneySummaryGift, CommitmentGate) are trial-only.
    // Lifetime users must never see them. Do not remove or bypass this hasLifetimeAccess check.
    if (hasLifetimeAccess) return false // APP_2 (Lifetime): Never show payment gate

    // User chose "Continue to Trial 2" – suppress paywall until Trial 2 ends
    if (userChoseTrial2) return false

    // Must have reached course start date – user in waiting room sees WaitingScreen, not paywall
    if (!hasReachedStartDate) return false

    const isSunday = currentDay === 6 // Sunday is day 6

    // Trial 1: Show paywall on Sunday if all 7 days completed
    const isFirstTrialComplete =
      currentTrialNumber === 1 && allChakrasCompleted && isSunday

    // Trial 2 ended: either user finished all 7 chakras (Seal path, can happen any
    // day of Trial 2 week) OR 7 days have fully elapsed since Trial 2 started
    // (Grace path). Merely being in Trial 2 is not enough – that was the bug.
    const isSecondTrialEnded =
      currentTrialNumber === 2 &&
      (allChakrasCompleted || hasTrial2WindowElapsed)

    return isFirstTrialComplete || isSecondTrialEnded
  }, [
    currentTrialNumber,
    allChakrasCompleted,
    currentDay,
    hasLifetimeAccess,
    journeyStarted,
    hasReachedStartDate,
    hasTrial2WindowElapsed,
    userChoseTrial2,
  ])

  const isMonday = useMemo(() => {
    return currentDay === 0
  }, [currentDay])

  const isFirstTrialComplete = useMemo(
    () =>
      currentTrialNumber === 1 &&
      allChakrasCompleted &&
      currentDay === 6,
    [currentTrialNumber, allChakrasCompleted, currentDay],
  )

  // Trial 2 is "ended" for routing purposes when either the user completed all 7
  // chakras (triggers Seal) OR the 7-day window has elapsed (triggers Grace if
  // incomplete). Being inside Trial 2 week is NOT enough – that was today's bug.
  const isSecondTrialEnded = useMemo(
    () =>
      currentTrialNumber === 2 &&
      (allChakrasCompleted || hasTrial2WindowElapsed),
    [currentTrialNumber, allChakrasCompleted, hasTrial2WindowElapsed],
  )

  // Grace is specifically the "did not complete in time" path, so it must gate on
  // the 7-day window having elapsed – not merely on being in Trial 2. This is the
  // exact guard that prevents today's bug: Monday of Trial 2 cannot show Grace.
  const showGraceOfPresence = useMemo(
    () =>
      currentTrialNumber === 2 &&
      hasTrial2WindowElapsed &&
      !allChakrasCompleted,
    [currentTrialNumber, hasTrial2WindowElapsed, allChakrasCompleted],
  )

  const showSealOfInitiate = useMemo(
    () =>
      isFirstTrialComplete ||
      (isSecondTrialEnded && allChakrasCompleted),
    [isFirstTrialComplete, isSecondTrialEnded, allChakrasCompleted],
  )

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

    // Grace return flow: Simple Grace "Continue" → paywall
    // Skip the next effect run so we don't overwrite showPaymentGate with waiting-room logic
    // (effect re-runs when we clear the flag; shouldShowCommitmentGate can be false if they
    // picked a future date, which would incorrectly set showPaymentGate(false))
    if (openPaywallFromGraceReturn) {
      graceReturnHandledRef.current = true
      setOpenPaywallFromGraceReturn(false)
      setShowPaymentGate(true)
      setShowWaitingScreen(false)
      return
    }
    if (graceReturnHandledRef.current) {
      graceReturnHandledRef.current = false
      return
    }

    // Trial complete: show Seal of the Initiate first (sovereign recognition), then paywall if they choose Alchemist
    // showPaymentGate is only set when user taps "Path of the Alchemist" or "I'm ready to anchor deeper"
    if (shouldShowCommitmentGate) {
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

    const canAutoStart =
      completedTrialCourses === 0 ||
      (hasLifetimeAccess && lifetimeChosenTimegateJourney)

    // Past course Monday, first open is Tue–Sun: waiting UI would show a zero countdown.
    // Start the week from the current Monday so home + countdown path stay coherent.
    const midweekPastStartCatchup =
      showWaiting &&
      hasReachedStartDate &&
      !journeyStarted &&
      canAutoStart &&
      !isMonday

    if (midweekPastStartCatchup) {
      startJourney(currentWeekStartDate)
      void onJourneyWeekStarted()
      setShowWaitingScreen(false)
      if (isFirstLaunch) {
        setFirstLaunchComplete()
      }
      return
    }

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
    // Allow auto-start on Monday when waiting UI would show a dead countdown (past start, never began).
    let countdownExhausted = false
    if (courseStartDate) {
      const startD = new Date(`${courseStartDate}T00:00:00`)
      if (!Number.isNaN(startD.getTime())) {
        const r = getTimeRemaining(startD)
        countdownExhausted =
          r.days === 0 &&
          r.hours === 0 &&
          r.minutes === 0 &&
          r.seconds === 0
      }
    }

    // IMPORTANT: Don't auto-start if we're showing the waiting screen (first-time onboarding),
    // unless the countdown is exhausted (stuck state after restore / missed Monday).
    const shouldAutoStart =
      hasReachedStartDate &&
      isMonday &&
      !journeyStarted &&
      canAutoStart &&
      (!showWaiting || countdownExhausted)

    if (shouldAutoStart) {
      startJourney(currentWeekStartDate)
      void onJourneyWeekStarted()
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
    openPaywallFromGraceReturn,
    setOpenPaywallFromGraceReturn,
  ])

  // First Monday presence: only when user has not entered anything before (profile not yet completed).
  // Show once when they first see main home (no waiting). If they already completed it, go direct to chakra home.
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
  }, [showWaitingScreen, hasReachedStartDate, hasCompletedFirstMondayPresence])

  // Start HERO course audio preload when trial user sees main home (not waiting room).
  // Ensures dev-bypass path also gets preload so embodiment/meditation etc. load faster on real device.
  // Guard: persist only after heads complete (same as WaitingScreen).
  useEffect(() => {
    if (hasLifetimeAccess || !journeyStarted || showWaitingScreen || !storage)
      return
    let cancelled = false
    getAudioPreloadStarted().then((alreadyStarted) => {
      if (cancelled || alreadyStarted) return
      import("@/src/utils/audioPreloadManifest").then(
        ({ preloadAllAudioHeads, preloadAllAudioFullFiles }) => {
          if (cancelled) return
          preloadAllAudioHeads(storage)
            .then(() => {
              if (cancelled) return
              return setAudioPreloadStarted().then(() => {
                if (cancelled) return
                return preloadAllAudioFullFiles(storage)
              })
            })
            .catch((err) => {
              console.warn("[ChakraHome] audio preload chain failed", err)
            })
        },
      )
    })
    return () => {
      cancelled = true
    }
  }, [showWaitingScreen, journeyStarted, hasLifetimeAccess])

  // Sync waiting screen visibility to menu bar: hide bar for lifetime (they have "Exit course mode"); trial gets 4-button bar.
  useEffect(() => {
    const { setWaitingScreenVisible, setWaitingRoomActions } =
      useMenuBarStore.getState()
    if (showWaitingScreen) {
      setWaitingScreenVisible(true)
      if (!hasLifetimeAccess) {
        setWaitingRoomActions({
          onPreviewPress: handlePreviewPress,
          onChakras101Press: handleLearnAboutChakrasPress,
        })
      } else {
        setWaitingRoomActions({})
      }
    } else {
      setWaitingScreenVisible(false)
      setWaitingRoomActions({})
    }
    return () => {
      setWaitingScreenVisible(false)
      setWaitingRoomActions({})
    }
  }, [showWaitingScreen, hasLifetimeAccess, handlePreviewPress, handleLearnAboutChakrasPress])

  useEffect(() => {
    // Bookkeeping when completedChakra is set (from day screen or from focus when returning with completed day).
    if (completedChakra) {
      const chakraDayIndex = getChakraIndex(completedChakra)
      goodbyeShownForDaysRef.current.add(chakraDayIndex)
      markChakraCompleted(chakraDayIndex)
    }
  }, [completedChakra, markChakraCompleted])

  // Memoize chakra data - wrap onPress so navigating from home stack to course day
  // always clears stale completedChakra first (goodbye only from course completion, not home tap)
  const chakraData = useMemo(() => {
    if (chakrasData.length === 0) return []
    return chakrasData.map((item) => ({
      ...item,
      onPress: (routerInstance: Parameters<typeof item.onPress>[0]) => {
        clearCompletedChakra()
        item.onPress(routerInstance)
      },
    }))
  }, [chakrasData, clearCompletedChakra])

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

  const contentReady = !isLoadingChakras && chakraData.length === 7

  /** Only the main dashboard (not gates, waiting, or error) should trigger the session entrance. */
  const mainHomeDashboardVisible = useMemo(
    () =>
      contentReady &&
      !chakrasError &&
      storeRehydrationReady &&
      !showWaitingScreen &&
      !showPaymentGate &&
      !(shouldShowCommitmentGate && showGraceOfPresence) &&
      !(shouldShowCommitmentGate && showSealOfInitiate),
    [
      contentReady,
      chakrasError,
      storeRehydrationReady,
      showWaitingScreen,
      showPaymentGate,
      shouldShowCommitmentGate,
      showGraceOfPresence,
      showSealOfInitiate,
    ],
  )

  const { contentOpacityStyle: homeContentEntranceStyle } =
    useHomeSomaticEntrance(mainHomeDashboardVisible)

  const closeModal = () => {
    clearCompletedChakra()
  }

  // Preview handler for the waiting screen – navigate to Preview route (Stack fade, no jolt)
  const handlePreviewPress = () => {
    router.push("/(chakras)/Preview")
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

  // Note: Anua access is handled globally by PermanentMenuBar

  // ALL HOOKS MUST BE ABOVE THIS LINE - NO HOOKS AFTER EARLY RETURNS

  // If showing payment gate (they chose Alchemist), render CommitmentGate
  if (showPaymentGate) {
    return (
      <CommitmentGate
        onComplete={() => {
          setShowPaymentGate(false)
        }}
        onBack={() => {
          setShowPaymentGate(false)
          router.back()
        }}
        showContinueToTrial2={isFirstTrialComplete}
        onContinueToTrial2={() => {
          setUserChoseTrial2(true)
          setShowPaymentGate(false)
          router.replace("/(chakras)/DateSelection")
        }}
      />
    )
  }

  // Grace flow: Trial 2 ended without completing all 7 days
  // If they chose Gentle (Depart), show RestingBlessing; else show GraceOfThePresence
  if (shouldShowCommitmentGate && showGraceOfPresence) {
    if (userChoseGentleDepart) {
      return (
        <RestingBlessing
          onReadyForSanctuary={() => setShowPaymentGate(true)}
          onBack={() => router.back()}
        />
      )
    }
    return (
      <GraceOfThePresence
        onPathGentle={() => setUserChoseGentleDepart(true)}
        onPathDevoted={() => setShowPaymentGate(true)}
        onBack={() => router.back()}
      />
    )
  }

  // Seal flow: Trial 1 complete (Sunday) or Trial 2 complete
  // If they chose Sovereign (Depart), show Gift page; else show Seal
  if (shouldShowCommitmentGate && showSealOfInitiate) {
    if (userChoseSovereignDepart) {
      return (
        <JourneySummaryGift
          onReadyToAnchor={() => setShowPaymentGate(true)}
          onBack={() => router.back()}
        />
      )
    }
    return (
      <SealOfTheInitiate
        onPathSovereign={() => {
          setUserChoseSovereignDepart(true)
        }}
        onPathAlchemist={() => setShowPaymentGate(true)}
        onBack={() => router.back()}
      />
    )
  }

  // Waiting room. Route wrapper redirects trial users without courseStartDate to WelcomeScreen.
  // Path selection after first date only via hamburger "Return to SOUL SCHOOL Course Selection".
  // pointerEvents="box-none" so the wrapper never captures touches; only WaitingScreen (and its overlays) receive them (fixes Android stuck layer).
  const needsWaiting =
    !storeRehydrationReady || showWaitingScreen
  if (needsWaiting) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }} pointerEvents="box-none">
        {showWaitingScreen && (
          <WaitingScreen
            onPreviewPress={handlePreviewPress}
            onHideWaitingScreen={() => setShowWaitingScreen(false)}
            onGalleryPress={hasUnlockedCards ? handleGalleryPress : undefined}
            onBeginAgainPress={
              completedTrialCourses === 1
                ? () => {
                    startJourney(currentWeekStartDate)
                    void onJourneyWeekStarted()
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
      </View>
    )
  }

  // Somatic flow: No loading screen - smooth fade-in instead
  // Content appears naturally as data becomes available, creating embodied flow
  // Applied somatic healing principles: natural timing, breathing rhythms, smooth transitions

  // Show error state if fetching failed (with smooth fade-in)
  if (chakrasError) {
    return (
      <View
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
          style={{
            textAlign: "center",
            marginBottom: 16,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          The chakras are taking a moment to arrive
        </AppText>
        <AppText
          font="instrument-regular"
          size="base"
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.7)",
            fontStyle: "italic",
          }}
        >
          Please try again, or continue your journey
        </AppText>
      </View>
    )
  }

  // Black void only while content loads — do not repeat Soul School hero (root splash already showed it).
  if (!contentReady) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#000000" }}
        edges={["top", "bottom"]}
      >
        <View style={{ flex: 1, backgroundColor: "#000000" }} />
      </SafeAreaView>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#000000" }}
        edges={["top", "bottom"]}
        pointerEvents="box-none"
      >
        {/* ScrollView first so overlays rendered after it receive touches on Android */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            // iOS: SCROLL_PADDING_TOP_IOS so stack and ball fit on screen (matches IntegratedProgressStack viewport – LOCKED)
            paddingTop:
              Platform.OS === "ios"
                ? TRIAL_HOME_ROOT_CHAKRA.SCROLL_PADDING_TOP_IOS
                : TRIAL_HOME_ROOT_CHAKRA.SCROLL_PADDING_TOP,
            paddingBottom:
              TRIAL_HOME_ROOT_CHAKRA.SCROLL_PADDING_BOTTOM +
              SCROLL_BREATHING_BOTTOM_PADDING,
            minHeight: "100%",
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          bounces={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Somatic entrance: only the dashboard pillar / scroll content fades — not SafeArea or loading logo */}
          <Animated.View
            style={[{ flexGrow: 1, width: "100%" }, homeContentEntranceStyle]}
          >
          {/* UX Improvement: Trial Progress Indication */}
          {!hasLifetimeAccess &&
            completedTrialCourses > 0 &&
            journeyStarted && (
              <View
                style={{
                  alignItems: "center",
                  paddingHorizontal: 24,
                  marginBottom: 16,
                }}
              >
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    textAlign: "center",
                  }}
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
                  style={{
                    textAlign: "center",
                    marginBottom: 16,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Your Journey Awaits
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={{
                    textAlign: "center",
                    marginBottom: 16,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 24,
                  }}
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
                    <SomaticHeroImage
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

          {/* Render chakra display (only if not in post-trial state) */}
          {!(completedTrialCourses === 2 && !hasLifetimeAccess) &&
            renderChakraDisplay()}
          </Animated.View>
        </ScrollView>

        {/* Overlays after ScrollView so they receive touches on Android. Lifetime course-mode exit (global: iOS + Android). */}
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
            accessibilityLabel="Return to lifetime"
            accessibilityHint="Exit course mode and return to lifetime hub"
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
        {!hasLifetimeAccess && journeyStarted && (
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              router.push("/(chakras)/Chakras101")
            }}
            style={{
              position: "absolute",
              top: Math.max(insets.top, 8) + 12,
              right: 16,
              zIndex: 100,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderWidth: 1,
              borderColor: "rgba(135, 174, 115, 0.4)",
              justifyContent: "center",
              alignItems: "center",
              ...(Platform.OS === "android" && { elevation: 10 }),
            }}
            hitSlop={Platform.OS === "android" ? { top: 16, bottom: 16, left: 16, right: 16 } : { top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Chakras 101"
            accessibilityHint="Learn about the 7 chakras"
          >
            <SomaticHeroImage
              source={require("@/assets/images/7chakras.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            addHapticFeedback(HapticStrength.Light)
            useProfileSheetStore.getState().open()
          }}
          style={{
            position: "absolute",
            top: Math.max(insets.top, 8) + 12,
            left: 16,
            zIndex: 100,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.15)",
            justifyContent: "center",
            alignItems: "center",
            ...(Platform.OS === "android" && { elevation: 10 }),
          }}
          hitSlop={Platform.OS === "android" ? { top: 16, bottom: 16, left: 16, right: 16 } : { top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Profile menu"
          accessibilityHint="View your profile and SOUL SCHOOL ID"
        >
          <Ionicons name="menu" size={22} color="rgba(255, 255, 255, 0.9)" />
        </Pressable>

        {/* Note: Anua access is handled globally by PermanentMenuBar */}

        <GoodbyeModal
          isVisible={isGoodbyeVisible}
          onClose={() => closeModal()}
          chakraDay={
            completedChakra ? getChakraIndex(completedChakra) : currentDay
          }
          navigateToHubOnHome={
            hasLifetimeAccess &&
            (completedChakra ? getChakraIndex(completedChakra) : currentDay) ===
              6
          }
        />

        {/* First Monday presence: name + visual expression, then trial begins */}
        <FirstMondayPresenceModal
          visible={showFirstMondayPresenceModal}
          onClose={() => setShowFirstMondayPresenceModal(false)}
          onComplete={() => setShowFirstMondayPresenceModal(false)}
        />

        {/* Note: Anua Chat is handled globally by PermanentMenuBar (menu Anua button opens chat directly) */}

        {/* Permanent Menu Bar - Now rendered globally in app/_layout.tsx */}

      </SafeAreaView>
    </View>
  )
}
