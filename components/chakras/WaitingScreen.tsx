/**
 * Waiting Screen - Mysterious Countdown
 *
 * A healing, mysterious countdown experience with subtle power.
 * Dark, clean, engaging design using chakra imagery for depth and presence.
 *
 * LOCKED: Hero styling on this page must not be changed: opening date line
 * ("I will open on Monday, March 16"), countdown (DAYS/HOURS/MINS/SECS).
 * "For Deepest Embodiment" copy lives in ClarityMomentModal (shown once on entry).
 *
 * LOCKED FOR PRODUCTION (iOS waiting room): Layout, countdown position (iOS marginTop),
 * Build Your Tribe fixed strip above menu bar, and While You Wait button are finalized.
 * Do not change without explicit product request.
 *
 * Friends invited list: Only on Tribe screen, not here. Build Your Tribe
 * button opens invite modal; invited list is not shown on waiting room.
 *
 * Product note (lifetime → trial course → lifetime trial waiting room): When
 * the user has friends, the button should shift to Tribe Chat and load with
 * their friends and conversations instead of showing Build Your Tribe.
 */

import React from "react"
import {
  View,
  Image,
  Pressable,
  Platform,
  Linking,
  AppState,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import {
  getFormattedNextMondayDate,
  getNextMondayDate,
  getTimeRemaining,
} from "@/utils/date"
import { isWellFormedCourseStartIso } from "@/utils/journeySchedulingHealth"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { formatCountdown } from "@/utils/format"
import {
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
} from "@/constants/layout"
import { ARCHETYPE_QUIZ_URL } from "@/constants/sharing"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { getCurrentWeekStartDateISO, formatDate } from "@/utils/date"
import { InviteFriendModal } from "@/components/invite/InviteFriendModal"
import { getCurrentDayOfWeek } from "@/utils/date"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import { chakraContent } from "@/constants/chakras/content"
import { Chakra } from "@/types/chakras/Chakra"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TreeOfLifeIcon } from "@/components/social/TreeOfLifeIcon"
import { LinearGradient } from "expo-linear-gradient"
import { storage } from "@/src/services/firebase"
import {
  getAudioPreloadStarted,
  setAudioPreloadStarted,
} from "@/src/utils/audioPreloadGuard"
import {
  hasNotificationPermission,
  requestNotificationPermissions,
  scheduleSoulJourneyAfterPermission,
  scheduleWaitingRoomNudgesIfPermitted,
} from "@/src/services/journeyNotifications"
import { CommunicationReminderModal } from "@/components/chakras/CommunicationReminderModal"
import { ClarityMomentModal } from "@/components/chakras/ClarityMomentModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { WAITING_ROOM_CLARITY_MOMENT_SEEN_KEY } from "@/constants/onboardingKeys"
// Countdown clock dimensions - larger for presence, softer feminine design
// Android: 10% larger for better visibility on device
const COUNTDOWN_BOX_SIZE = Platform.OS === "android" ? 70 : 64
const COUNTDOWN_BOX_GAP = Platform.OS === "android" ? 7 : 6
const COUNTDOWN_BOX_RADIUS = Platform.OS === "android" ? 13 : 12
const COUNTDOWN_LABEL_MARGIN = 4

/** Offset from screen bottom so Build Your Tribe strip sits just above PermanentMenuBar (menu bar content height + gap). */
const BUILD_TRIBE_ABOVE_MENU_OFFSET = 80

// Chakra images for mysterious background effect
const CHAKRA_IMAGES = [
  require("@/assets/images/root.png"),
  require("@/assets/images/sacral.png"),
  require("@/assets/images/solar.png"),
  require("@/assets/images/heart.png"),
  require("@/assets/images/throat.png"),
  require("@/assets/images/thirdeye.png"),
  require("@/assets/images/crown.png"),
]

interface WaitingScreenProps {
  onPreviewPress?: () => void
  onHideWaitingScreen?: () => void
  onSummaryPress?: () => void
  onGalleryPress?: () => void
  onBeginAgainPress?: () => void
  onLearnAboutChakrasPress?: () => void // For navigating to Chakras101 screen
  // For starting Trial 2 after Trial 1 ends
  completedTrialCourses?: number
  hasLifetimeAccess?: boolean
  onPayPress?: () => void // For navigating to paywall after Trial 2
  onExitCourseMode?: () => void // Lifetime only: return to ChakraHub, exit somatic journey
}

export const WaitingScreen = ({
  onPreviewPress,
  onHideWaitingScreen,
  onSummaryPress,
  onGalleryPress,
  onBeginAgainPress,
  onLearnAboutChakrasPress,
  completedTrialCourses = 0,
  hasLifetimeAccess = false,
  onPayPress,
  onExitCourseMode,
}: WaitingScreenProps) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const {
    courseStartDate,
    initialOpenDate,
    invitedFriends,
    addInvitedFriend,
    soulJourneyNudgesEnabled,
    dateSelectionEmbodimentHandoffComplete,
    lifetimeChosenTimegateJourney,
  } = useChakraJourneyStore(
    useShallow((state) => ({
      courseStartDate: state.courseStartDate,
      initialOpenDate: state.initialOpenDate,
      invitedFriends: state.invitedFriends,
      addInvitedFriend: state.addInvitedFriend,
      soulJourneyNudgesEnabled: state.soulJourneyNudgesEnabled,
      dateSelectionEmbodimentHandoffComplete:
        state.dateSelectionEmbodimentHandoffComplete,
      lifetimeChosenTimegateJourney: state.lifetimeChosenTimegateJourney,
    })),
  )
  const nudgesPreferenceOn = soulJourneyNudgesEnabled !== false

  // Use course start date if available, otherwise fall back to next Monday
  // Memoize targetDate to prevent unnecessary recalculations
  const targetDate = useMemo(() => {
    if (
      courseStartDate &&
      isWellFormedCourseStartIso(courseStartDate)
    ) {
      const d = new Date(`${courseStartDate}T00:00:00`)
      if (!Number.isNaN(d.getTime())) return d
    }
    return getNextMondayDate()
  }, [courseStartDate])

  const formattedDate = useMemo(() => {
    if (
      courseStartDate &&
      isWellFormedCourseStartIso(courseStartDate)
    ) {
      return formatDate(new Date(`${courseStartDate}T00:00:00`))
    }
    return getFormattedNextMondayDate()
  }, [courseStartDate])

  // Corrupt courseStartDate (e.g. backup restore): recover so user is not trapped on a dead clock.
  useEffect(() => {
    if (hasLifetimeAccess && !lifetimeChosenTimegateJourney) return
    if (!courseStartDate) return
    if (isWellFormedCourseStartIso(courseStartDate)) return
    useChakraJourneyStore.getState().recoverStuckCourseSchedulingToDateSelection()
    router.replace("/(chakras)/DateSelection")
  }, [
    courseStartDate,
    hasLifetimeAccess,
    lifetimeChosenTimegateJourney,
    router,
  ])

  const [timeLeft, setTimeLeft] = useState(() => {
    const initialTarget =
      courseStartDate && isWellFormedCourseStartIso(courseStartDate)
        ? new Date(`${courseStartDate}T00:00:00`)
        : getNextMondayDate()
    if (Number.isNaN(initialTarget.getTime())) {
      return formatCountdown(getTimeRemaining(getNextMondayDate()))
    }
    return formatCountdown(getTimeRemaining(initialTarget))
  })
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCommunicationModal, setShowCommunicationModal] = useState(false)
  /** Default false: never flash Clarity before we know DateSelection path vs legacy waiting-room path */
  const [showClarityMomentModal, setShowClarityMomentModal] = useState(false)
  const currentDay = getCurrentDayOfWeek()

  // Clarity on WaitingScreen: only legacy users who never completed embodiment on DateSelection.
  // If handoff is already true (Begin → Present on DateSelection), never show again here (removes duplicate flash + AsyncStorage race).
  useEffect(() => {
    let cancelled = false
    if (dateSelectionEmbodimentHandoffComplete) {
      setShowClarityMomentModal(false)
    } else {
      AsyncStorage.getItem(WAITING_ROOM_CLARITY_MOMENT_SEEN_KEY).then((value) => {
        if (cancelled) return
        if (value === "true") {
          setShowClarityMomentModal(false)
        } else {
          setShowClarityMomentModal(true)
        }
      })
    }
    return () => {
      cancelled = true
    }
  }, [dateSelectionEmbodimentHandoffComplete])
  const chakraName = getChakraName(currentDay)
  const isFocused = useIsFocused()
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => setAppState(next))
    return () => sub.remove()
  }, [])

  // Gentle reminders: show 30s after entering waiting room if permission not yet granted (somatic, non-demanding).
  // Only run the timer when this screen is focused AND app is in foreground.
  // Do NOT clear the modal when isFocused flips during stack transitions (600ms fade) — that was dismissing
  // the pre-prompt before the user could act. Clear on app background only; useFocusEffect clears on real blur.
  useEffect(() => {
    const inForeground = appState === "active"
    if (!inForeground) {
      setShowCommunicationModal(false)
      return
    }
    if (!isFocused) {
      return
    }
    let t: ReturnType<typeof setTimeout> | undefined
    const run = async () => {
      if (!nudgesPreferenceOn) return
      if (await hasNotificationPermission()) return
      t = setTimeout(() => setShowCommunicationModal(true), 30000)
    }
    run()
    return () => {
      if (t) clearTimeout(t)
    }
  }, [isFocused, appState, nudgesPreferenceOn])

  // If the user already granted notification permission (e.g. system settings or earlier session),
  // schedule pre-course + horizon + engagement sync immediately — no modal required.
  useEffect(() => {
    const inForeground = appState === "active"
    if (!nudgesPreferenceOn || !inForeground || !isFocused || !courseStartDate)
      return
    let cancelled = false
    const run = async () => {
      if (!(await hasNotificationPermission())) return
      if (cancelled) return
      await scheduleWaitingRoomNudgesIfPermitted()
    }
    run()
    return () => {
      cancelled = true
    }
  }, [isFocused, appState, courseStartDate, nudgesPreferenceOn])

  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowCommunicationModal(false)
      }
    }, []),
  )

  // Safety: auto-dismiss communication modal after 2 min so Android never gets stuck with an invisible/touch-blocking overlay (RN Modal can leave overlay when buttons fail)
  useEffect(() => {
    if (!showCommunicationModal) return
    const safety = setTimeout(() => {
      setShowCommunicationModal(false)
      if (__DEV__) console.warn("[WaitingScreen] Communication modal auto-dismissed (safety timeout)")
    }, 2 * 60 * 1000)
    return () => clearTimeout(safety)
  }, [showCommunicationModal])

  const handleCommunicationAllow = async () => {
    if (!nudgesPreferenceOn) {
      setShowCommunicationModal(false)
      return
    }
    const granted = await requestNotificationPermissions()
    if (granted && courseStartDate) {
      const signup = initialOpenDate ?? courseStartDate
      scheduleSoulJourneyAfterPermission(signup, courseStartDate).catch(
        (err) => {
          if (__DEV__)
            console.warn("[WaitingScreen] Failed to schedule reminders:", err)
        },
      )
    }
    setShowCommunicationModal(false)
  }

  const handleCommunicationNotNow = () => {
    setShowCommunicationModal(false)
  }

  // Waiting room ALWAYS begins full downloads of all course audio: heads first (fast), then full files in background.
  // One-time guard: persist only after heads complete so a killed app / first-run error can retry next visit.
  // No UI block — downloads continue in background; foreground resume also continues preload (see audioPreloadLifecycle).
  useEffect(() => {
    if (!storage) return
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
              console.warn("[WaitingScreen] audio preload chain failed", err)
            })
        },
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Handle invite friend - opens beautiful custom modal matching app design
  const handleInviteFriend = () => {
    addHapticFeedback(HapticStrength.Medium)
    setShowInviteModal(true)
  }

  // Subtle pulsing animation for chakra images
  const pulseOpacity = useSharedValue(0.1)
  const pulseScale = useSharedValue(0.95)

  useEffect(() => {
    // Gentle pulse animation
    pulseOpacity.value = withRepeat(
      withTiming(0.25, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
    pulseScale.value = withRepeat(
      withTiming(1.05, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
      transform: [{ scale: pulseScale.value }],
    }
  })

  // Calculate time remaining until course start date (or next Monday as fallback)
  // Update every second for smooth countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const remaining = getTimeRemaining(targetDate)
      setTimeLeft(formatCountdown(remaining))
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second for smooth countdown
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  // Handle back to date selection
  const handleBackToDateSelection = () => {
    addHapticFeedback(HapticStrength.Light)
    // Navigate back to date selection to allow changing the date
    router.replace("/(chakras)/DateSelection")
  }

  // FORCE REBUILD MARKER v3.0 - Jan 25 22:00
  // Square buttons: flex-row gap-3, flex-1, aspectRatio: 1
  // Anua: isWaitingRoom={true}
  // Ask a Friend: Below For Deepest Embodiment

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }} pointerEvents="box-none">
      {/* Mysterious background chakra images - subtle, layered (first so it stays behind) */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
        }}
        pointerEvents="none"
      >
        {CHAKRA_IMAGES.map((image, index) => {
          const angle = (index * 360) / CHAKRA_IMAGES.length
          const radius = 180
          const x = Math.cos((angle * Math.PI) / 180) * radius
          const y = Math.sin((angle * Math.PI) / 180) * radius

          return (
            <Animated.View
              key={index}
              style={[
                {
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 120,
                  height: 120,
                  marginLeft: x - 60,
                  marginTop: y - 60,
                },
                animatedStyle,
              ]}
            >
              <Image
                source={image}
                style={{ width: "100%", height: "100%", opacity: 0.3 }}
                resizeMode="contain"
              />
            </Animated.View>
          )
        })}
      </View>

      {/* ScrollView from RNGH so overlays receive touches on Android; no fixed bottom block—only PermanentMenuBar in _layout */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          padding: hasLifetimeAccess ? 20 : 20,
          paddingTop: Math.max(insets.top, 16) + (hasLifetimeAccess ? 20 : 20),
          paddingBottom:
            Math.max(insets.bottom, 4) +
            (hasLifetimeAccess ? Math.max(insets.bottom, 16) + 60 : 72) +
            SCROLL_BREATHING_BOTTOM_PADDING, // Trial: space for PermanentMenuBar; Build Your Tribe at previous position
          ...(hasLifetimeAccess
            ? { justifyContent: "space-between" }
            : { flexDirection: "column" }), // Trial: top section + centered clock block
        }}
        showsVerticalScrollIndicator={false}
        style={{ zIndex: 0, flex: 1 }}
        {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
      >
        {hasLifetimeAccess ? (
          <>
            {/* Top section - title and date */}
            <View
              style={{
                alignItems: "center",
                maxWidth: 384,
                ...(Platform.OS === "android" && { marginTop: 20 }),
              }}
            >
              <View style={{ marginBottom: 20 }}>
                <Image
                  source={require("@/assets/images/7chakras.png")}
                  style={{ width: 80, height: 80, opacity: 0.9 }}
                  resizeMode="contain"
                />
              </View>
              <AppText
                font="instrument-bold"
                size="xl"
                style={{
                  textAlign: "center",
                  marginBottom: 12,
                  color: "#ffffff",
                }}
              >
                Your 7 Day Journey Begins
              </AppText>
              <AppText
                font="instrument-regular"
                size="base"
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: 20,
                }}
              >
                I will open on {formattedDate}
              </AppText>
            </View>

            {/* Countdown - larger, bold numbers, softer feminine design (iOS: moved down for TestFlight) */}
            {!(completedTrialCourses === 2 && !hasLifetimeAccess) && (
              <View
                style={{
                  width: "100%",
                  maxWidth: 384,
                  alignItems: "center",
                  paddingVertical: 20,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(212, 165, 116, 0.25)",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  shadowColor: "rgba(168, 201, 154, 0.15)",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 6,
                  ...(Platform.OS === "ios" && { marginTop: -16 }),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: COUNTDOWN_BOX_GAP,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.12)",
                        "rgba(212, 165, 116, 0.08)",
                        "rgba(168, 201, 154, 0.06)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: COUNTDOWN_BOX_SIZE,
                        height: COUNTDOWN_BOX_SIZE,
                        borderRadius: COUNTDOWN_BOX_RADIUS,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: COUNTDOWN_LABEL_MARGIN,
                        borderWidth: 1,
                        borderColor: "rgba(212, 165, 116, 0.2)",
                        shadowColor: "rgba(168, 201, 154, 0.15)",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <AppText
                        font="instrument-bold"
                        size="3xl"
                        style={{ color: "#ffffff" }}
                      >
                        {timeLeft.days}
                      </AppText>
                    </LinearGradient>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      DAYS
                    </AppText>
                  </View>
                  <AppText
                    font="instrument-bold"
                    size="2xl"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    :
                  </AppText>
                  <View style={{ alignItems: "center" }}>
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.12)",
                        "rgba(212, 165, 116, 0.08)",
                        "rgba(168, 201, 154, 0.06)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: COUNTDOWN_BOX_SIZE,
                        height: COUNTDOWN_BOX_SIZE,
                        borderRadius: COUNTDOWN_BOX_RADIUS,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: COUNTDOWN_LABEL_MARGIN,
                        borderWidth: 1,
                        borderColor: "rgba(212, 165, 116, 0.2)",
                        shadowColor: "rgba(168, 201, 154, 0.15)",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <AppText
                        font="instrument-bold"
                        size="3xl"
                        style={{ color: "#ffffff" }}
                      >
                        {timeLeft.hours}
                      </AppText>
                    </LinearGradient>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      HOURS
                    </AppText>
                  </View>
                  <AppText
                    font="instrument-bold"
                    size="2xl"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    :
                  </AppText>
                  <View style={{ alignItems: "center" }}>
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.12)",
                        "rgba(212, 165, 116, 0.08)",
                        "rgba(168, 201, 154, 0.06)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: COUNTDOWN_BOX_SIZE,
                        height: COUNTDOWN_BOX_SIZE,
                        borderRadius: COUNTDOWN_BOX_RADIUS,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: COUNTDOWN_LABEL_MARGIN,
                        borderWidth: 1,
                        borderColor: "rgba(212, 165, 116, 0.2)",
                        shadowColor: "rgba(168, 201, 154, 0.15)",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <AppText
                        font="instrument-bold"
                        size="3xl"
                        style={{ color: "#ffffff" }}
                      >
                        {timeLeft.minutes}
                      </AppText>
                    </LinearGradient>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      MINS
                    </AppText>
                  </View>
                  <AppText
                    font="instrument-bold"
                    size="2xl"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    :
                  </AppText>
                  <View style={{ alignItems: "center" }}>
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.12)",
                        "rgba(212, 165, 116, 0.08)",
                        "rgba(168, 201, 154, 0.06)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: COUNTDOWN_BOX_SIZE,
                        height: COUNTDOWN_BOX_SIZE,
                        borderRadius: COUNTDOWN_BOX_RADIUS,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: COUNTDOWN_LABEL_MARGIN,
                        borderWidth: 1,
                        borderColor: "rgba(212, 165, 116, 0.2)",
                        shadowColor: "rgba(168, 201, 154, 0.15)",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <AppText
                        font="instrument-bold"
                        size="3xl"
                        style={{ color: "#ffffff" }}
                      >
                        {timeLeft.seconds}
                      </AppText>
                    </LinearGradient>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      SECS
                    </AppText>
                  </View>
                </View>
              </View>
            )}

            {/* While You Wait – narrow, small, separate element (archetype quiz link) */}
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                Linking.openURL(ARCHETYPE_QUIZ_URL)
              }}
              style={{
                marginTop: 56,
                alignSelf: "center",
                maxWidth: 200,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: "rgba(28, 28, 28, 0.95)",
                borderWidth: 1,
                borderColor: "rgba(212, 165, 116, 0.7)",
              }}
              accessibilityLabel="While You Wait"
              accessibilityHint="Open archetype quiz in browser"
            >
              <AppText
                font="cormorant-regular"
                size="sm"
                style={{ color: "rgba(212, 165, 116, 0.95)", textAlign: "center" }}
              >
                While You Wait
              </AppText>
            </Pressable>
          </>
        ) : (
          <>
            {/* Top section - icon, title, description - moved down a little on Android */}
            <View
              style={{
                alignItems: "center",
                maxWidth: 384,
                marginBottom: 16,
                ...(Platform.OS === "android" && { marginTop: 36 }),
              }}
            >
              <View style={{ marginBottom: 24 }}>
                <Image
                  source={require("@/assets/images/7chakras.png")}
                  style={{ width: 80, height: 80, opacity: 0.9 }}
                  resizeMode="contain"
                />
              </View>
              <AppText
                font="instrument-bold"
                size="xl"
                style={{
                  textAlign: "center",
                  marginBottom: 12,
                  color: "#ffffff",
                }}
              >
                Your 7 Day Journey Begins
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.7)",
                  paddingHorizontal: 16,
                }}
              >
                Each day of the week unlocks a new chakra, guiding you from your
                foundation to your crown.
              </AppText>
            </View>

            {/* Center block - I will open + clock - stays centered (iOS: moved down for TestFlight) */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                maxWidth: 384,
                width: "100%",
                ...(Platform.OS === "ios" && { marginTop: -12 }),
              }}
            >
              {/* Date text - centered, clear spacing above countdown */}
              {!(completedTrialCourses === 2) && (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <AppText
                    font="instrument-bold"
                    size="base"
                    style={{
                      textAlign: "center",
                      color: "rgba(6, 182, 212, 0.95)",
                    }}
                  >
                    I will open on {formattedDate}
                  </AppText>
                </View>
              )}

              {/* Countdown box - larger, bold numbers, softer feminine design */}
              {!(completedTrialCourses === 2) && (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    paddingVertical: 20,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(212, 165, 116, 0.22)",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    shadowColor: "rgba(168, 201, 154, 0.12)",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    elevation: 6,
                    maxWidth: "100%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: COUNTDOWN_BOX_GAP,
                    }}
                  >
                    {/* Days */}
                    <View style={{ alignItems: "center" }}>
                      <LinearGradient
                        colors={[
                          "rgba(255, 255, 255, 0.12)",
                          "rgba(212, 165, 116, 0.08)",
                          "rgba(168, 201, 154, 0.06)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: COUNTDOWN_BOX_SIZE,
                          height: COUNTDOWN_BOX_SIZE,
                          borderRadius: COUNTDOWN_BOX_RADIUS,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: COUNTDOWN_LABEL_MARGIN,
                          borderWidth: 1,
                          borderColor: "rgba(212, 165, 116, 0.2)",
                          shadowColor: "rgba(168, 201, 154, 0.15)",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <AppText
                          font="instrument-bold"
                          size="3xl"
                          style={{ color: "#ffffff" }}
                        >
                          {timeLeft.days}
                        </AppText>
                      </LinearGradient>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        DAYS
                      </AppText>
                    </View>

                    <AppText
                      font="instrument-bold"
                      size="2xl"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      :
                    </AppText>

                    {/* Hours */}
                    <View style={{ alignItems: "center" }}>
                      <LinearGradient
                        colors={[
                          "rgba(255, 255, 255, 0.12)",
                          "rgba(212, 165, 116, 0.08)",
                          "rgba(168, 201, 154, 0.06)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: COUNTDOWN_BOX_SIZE,
                          height: COUNTDOWN_BOX_SIZE,
                          borderRadius: COUNTDOWN_BOX_RADIUS,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: COUNTDOWN_LABEL_MARGIN,
                          borderWidth: 1,
                          borderColor: "rgba(212, 165, 116, 0.2)",
                          shadowColor: "rgba(168, 201, 154, 0.15)",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <AppText
                          font="instrument-bold"
                          size="3xl"
                          style={{ color: "#ffffff" }}
                        >
                          {timeLeft.hours}
                        </AppText>
                      </LinearGradient>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        HOURS
                      </AppText>
                    </View>

                    <AppText
                      font="instrument-bold"
                      size="2xl"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      :
                    </AppText>

                    {/* Minutes */}
                    <View style={{ alignItems: "center" }}>
                      <LinearGradient
                        colors={[
                          "rgba(255, 255, 255, 0.12)",
                          "rgba(212, 165, 116, 0.08)",
                          "rgba(168, 201, 154, 0.06)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: COUNTDOWN_BOX_SIZE,
                          height: COUNTDOWN_BOX_SIZE,
                          borderRadius: COUNTDOWN_BOX_RADIUS,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: COUNTDOWN_LABEL_MARGIN,
                          borderWidth: 1,
                          borderColor: "rgba(212, 165, 116, 0.2)",
                          shadowColor: "rgba(168, 201, 154, 0.15)",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <AppText
                          font="instrument-bold"
                          size="3xl"
                          style={{ color: "#ffffff" }}
                        >
                          {timeLeft.minutes}
                        </AppText>
                      </LinearGradient>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        MINS
                      </AppText>
                    </View>

                    <AppText
                      font="instrument-bold"
                      size="2xl"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      :
                    </AppText>

                    {/* Seconds */}
                    <View style={{ alignItems: "center" }}>
                      <LinearGradient
                        colors={[
                          "rgba(255, 255, 255, 0.12)",
                          "rgba(212, 165, 116, 0.08)",
                          "rgba(168, 201, 154, 0.06)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: COUNTDOWN_BOX_SIZE,
                          height: COUNTDOWN_BOX_SIZE,
                          borderRadius: COUNTDOWN_BOX_RADIUS,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: COUNTDOWN_LABEL_MARGIN,
                          borderWidth: 1,
                          borderColor: "rgba(212, 165, 116, 0.2)",
                          shadowColor: "rgba(168, 201, 154, 0.15)",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <AppText
                          font="instrument-bold"
                          size="3xl"
                          style={{ color: "#ffffff" }}
                        >
                          {timeLeft.seconds}
                        </AppText>
                      </LinearGradient>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        SECS
                      </AppText>
                    </View>
                  </View>
                </View>
              )}

              {/* While You Wait – narrow, small, separate element (archetype quiz link) */}
              {!(completedTrialCourses === 2) && (
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    Linking.openURL(ARCHETYPE_QUIZ_URL)
                  }}
                  style={{
                    marginTop: 56,
                    alignSelf: "center",
                    maxWidth: 200,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    backgroundColor: "rgba(28, 28, 28, 0.95)",
                    borderWidth: 1,
                    borderColor: "rgba(212, 165, 116, 0.7)",
                  }}
                  accessibilityLabel="While You Wait"
                  accessibilityHint="Open archetype quiz in browser"
                >
                  <AppText
                    font="cormorant-regular"
                    size="sm"
                    style={{ color: "rgba(212, 165, 116, 0.95)", textAlign: "center" }}
                  >
                    While You Wait
                  </AppText>
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Overlays rendered after ScrollView so they receive touches on Android (RNGH ScrollView + elevation) */}
      <Pressable
        onPress={handleBackToDateSelection}
        style={{
          position: "absolute",
          top: Math.max(insets.top, 16) + 8,
          left: 16,
          zIndex: 10002,
          padding: 8,
          backgroundColor: "transparent",
          ...(Platform.OS === "android" && { elevation: 10003 }),
        }}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        accessibilityLabel="Back"
        accessibilityHint="Return to date selection"
      >
        <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 1)" />
      </Pressable>

      {/* Build Your Tribe – fixed strip pinned just above menu bar (trial and lifetime) */}
      {courseStartDate && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: Math.max(insets.bottom, 4) + BUILD_TRIBE_ABOVE_MENU_OFFSET,
            paddingHorizontal: 24,
            zIndex: 10001,
            ...(Platform.OS === "android" && { elevation: 10002 }),
          }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={handleInviteFriend}
            style={{
              width: "100%",
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(135, 174, 115, 0.4)",
            }}
          >
            <LinearGradient
              colors={[
                "rgba(135, 174, 115, 0.28)",
                "rgba(135, 174, 115, 0.15)",
                "rgba(6, 182, 212, 0.08)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="person-add"
                size={18}
                color="rgba(135, 174, 115, 1)"
                style={{ marginRight: 10 }}
              />
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.95)",
                  textAlign: "center",
                }}
              >
                Build Your Tribe
              </AppText>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {hasLifetimeAccess && onExitCourseMode && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
            paddingHorizontal: 24,
            alignItems: "center",
            zIndex: 10001,
            ...(Platform.OS === "android" && { elevation: 10002 }),
          }}
          pointerEvents="auto"
          collapsable={false}
        >
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Medium)
              onExitCourseMode()
            }}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              shadowColor: "#2a2520",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={[
                "rgba(194, 178, 128, 0.35)",
                "rgba(168, 154, 110, 0.28)",
                "rgba(139, 126, 90, 0.35)",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderWidth: 1,
                borderColor: "rgba(194, 178, 128, 0.5)",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.12)",
                  "rgba(255, 255, 255, 0.02)",
                  "transparent",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              />
              <AppText
                font="instrument-medium"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.95)",
                  textAlign: "center",
                  letterSpacing: 0.3,
                }}
              >
                Exit course mode
              </AppText>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* Trial waiting room: no fixed bottom block. Only PermanentMenuBar (4 buttons: Preview, Chakras 101, Anua, Notes) at bottom; "For Deepest Embodiment" and "Build Your Tribe" live in scroll content only. */}

      {/* Invite Friend Modal - Beautiful custom design matching app style */}
      <InviteFriendModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        startDate={formattedDate}
        courseStartDateISO={courseStartDate ?? undefined}
        onInviteSent={() => {
          // Add friend to list when invite is sent
          const friendLabel = `Friend ${invitedFriends.length + 1}`
          addInvitedFriend(friendLabel)
        }}
      />

      {/* Clarity Moment: shown once on first entry to waiting room; tap Present to enter */}
      <ClarityMomentModal
        visible={showClarityMomentModal}
        onPresent={() => {
          setShowClarityMomentModal(false)
          AsyncStorage.setItem(WAITING_ROOM_CLARITY_MOMENT_SEEN_KEY, "true").catch(
            () => {},
          )
        }}
      />

      {/* Gentle reminders: shown 60s after entering waiting room if permission not yet granted */}
      <CommunicationReminderModal
        visible={showCommunicationModal}
        onAllow={handleCommunicationAllow}
        onNotNow={handleCommunicationNotNow}
      />

    </View>
  )
}
