/**
 * Waiting Screen - Mysterious Countdown
 *
 * A healing, mysterious countdown experience with subtle power.
 * Dark, clean, engaging design using chakra imagery for depth and presence.
 *
 * LOCKED: Hero styling on this page must not be changed: opening date line
 * ("I will open on Monday, March 16"), countdown (DAYS/HOURS/MINS/SECS),
 * and the "For Deepest Embodiment" card are fixed. Do not alter layout or
 * styling of these elements.
 *
 * Friends invited list: Only on Tribe screen, not here. Build Your Tribe
 * button opens invite modal; invited list is not shown on waiting room.
 *
 * Product note (lifetime → trial course → lifetime trial waiting room): When
 * the user has friends, the button should shift to Tribe Chat and load with
 * their friends and conversations instead of showing Build Your Tribe.
 */

import React from "react"
import { View, Image, Pressable, Platform, Linking, AppState } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useIsFocused } from "@react-navigation/native"
import {
  getFormattedNextMondayDate,
  getNextMondayDate,
  getTimeRemaining,
} from "@/utils/date"
import { useState, useEffect, useRef, useMemo } from "react"
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
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { getCurrentDayOfWeek } from "@/utils/date"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import { chakraContent } from "@/constants/chakras/content"
import { Chakra } from "@/types/chakras/Chakra"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TrialTestFlow } from "@/components/dev/TrialTestFlow"
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
  scheduleJourneyReminders,
} from "@/src/services/journeyNotifications"
import { CommunicationReminderModal } from "@/components/chakras/CommunicationReminderModal"

// Countdown clock dimensions - larger for presence, softer feminine design
// Android: 10% larger for better visibility on device
const COUNTDOWN_BOX_SIZE = Platform.OS === "android" ? 70 : 64
const COUNTDOWN_BOX_GAP = Platform.OS === "android" ? 7 : 6
const COUNTDOWN_BOX_RADIUS = Platform.OS === "android" ? 13 : 12
const COUNTDOWN_LABEL_MARGIN = 4

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
  const { courseStartDate, invitedFriends, addInvitedFriend } =
    useChakraJourneyStore(
      useShallow((state) => ({
        courseStartDate: state.courseStartDate,
        invitedFriends: state.invitedFriends,
        addInvitedFriend: state.addInvitedFriend,
      })),
    )

  // Use course start date if available, otherwise fall back to next Monday
  // Memoize targetDate to prevent unnecessary recalculations
  const targetDate = useMemo(() => {
    return courseStartDate
      ? new Date(courseStartDate + "T00:00:00") // Ensure local midnight
      : getNextMondayDate()
  }, [courseStartDate])

  const formattedDate = useMemo(() => {
    return courseStartDate
      ? formatDate(new Date(courseStartDate + "T00:00:00"))
      : getFormattedNextMondayDate()
  }, [courseStartDate])

  const [timeLeft, setTimeLeft] = useState({
    days: "0",
    hours: "00",
    minutes: "00",
    seconds: "00",
  })
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCommunicationModal, setShowCommunicationModal] = useState(false)
  const currentDay = getCurrentDayOfWeek()
  const chakraName = getChakraName(currentDay)
  const isFocused = useIsFocused()
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => setAppState(next))
    return () => sub.remove()
  }, [])

  // Gentle reminders: show 60s after entering waiting room if permission not yet granted (somatic, non-demanding).
  // Only run the timer when this screen is focused AND app is in foreground. If the user opens Anua, or taps
  // "While You Wait" (opens quiz in browser → app goes to background), we clear the timer and modal so when
  // they return the overlay never blocks the waiting room.
  useEffect(() => {
    const inForeground = appState === "active"
    if (!isFocused || !inForeground) {
      setShowCommunicationModal(false)
      return
    }
    let t: ReturnType<typeof setTimeout> | undefined
    const run = async () => {
      if (await hasNotificationPermission()) return
      t = setTimeout(() => setShowCommunicationModal(true), 60000)
    }
    run()
    return () => {
      if (t) clearTimeout(t)
    }
  }, [isFocused, appState])

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
    const granted = await requestNotificationPermissions()
    if (granted && courseStartDate) {
      scheduleJourneyReminders(courseStartDate).catch((err) => {
        if (__DEV__)
          console.warn("[WaitingScreen] Failed to schedule reminders:", err)
      })
    }
    setShowCommunicationModal(false)
  }

  const handleCommunicationNotNow = () => {
    setShowCommunicationModal(false)
  }

  // Waiting room ALWAYS begins full downloads of all course audio: heads first (fast), then full files in background.
  // One-time guard so it runs only once per device. Any bypass (e.g. lifetime direct to day) has backup triggers on day open and on any audio press.
  useEffect(() => {
    let cancelled = false
    getAudioPreloadStarted().then((alreadyStarted) => {
      if (cancelled || alreadyStarted) return
      import("@/src/utils/audioPreloadManifest").then(
        ({ preloadAllAudioHeads, preloadAllAudioFullFiles }) => {
          if (cancelled) return
          setAudioPreloadStarted().then(() => {
            if (cancelled) return
            preloadAllAudioHeads(storage)
              .then(() => {
                if (!cancelled) return preloadAllAudioFullFiles(storage)
              })
              .catch(() => {})
          })
        },
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleAnuaPress = () => {
    addHapticFeedback(HapticStrength.Light)
    useAnuaChatStore.getState().open({ isWaitingRoom: true })
  }

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

      {/* ScrollView from RNGH so fixed overlays (back, bottom block) receive touches on Android */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          padding: hasLifetimeAccess ? 20 : 20,
          paddingTop: Math.max(insets.top, 16) + (hasLifetimeAccess ? 20 : 20),
          paddingBottom:
            Math.max(insets.bottom, 4) +
            (hasLifetimeAccess ? Math.max(insets.bottom, 16) + 60 : 290) +
            SCROLL_BREATHING_BOTTOM_PADDING, // Trial: space for fixed bottom block (compact)
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

            {/* Countdown - larger, bold numbers, softer feminine design */}
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

            {/* While You Wait – archetype quiz (hero-style, under countdown) */}
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                Linking.openURL(ARCHETYPE_QUIZ_URL)
              }}
              style={{
                marginTop: 20,
                alignSelf: "center",
                maxWidth: 280,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 24,
                backgroundColor: "rgba(28, 28, 28, 0.95)",
                borderWidth: 1,
                borderColor: "rgba(212, 165, 116, 0.7)",
              }}
              accessibilityLabel="While You Wait"
              accessibilityHint="Open archetype quiz in browser"
            >
              <AppText
                font="cormorant-regular"
                size="base"
                style={{ color: "rgba(212, 165, 116, 0.95)", textAlign: "center" }}
              >
                While You Wait
              </AppText>
            </Pressable>

            {/* Bottom section - compact For Deepest Embodiment and invite */}
            <View
              style={{ width: "100%", maxWidth: 384, alignItems: "center" }}
            >
              <View
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    borderWidth: 1,
                    borderColor: "rgba(6, 182, 212, 0.5)",
                    shadowColor: "rgba(6, 182, 212, 0.2)",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                  }}
                >
                  <View
                    style={{ alignItems: "center", width: "100%", minWidth: 0 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Ionicons
                        name="headset"
                        size={16}
                        color="rgba(6, 182, 212, 0.8)"
                        style={{ marginRight: 6 }}
                      />
                      <AppText
                        font="instrument-medium"
                        size="xs"
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          textAlign: "center",
                        }}
                      >
                        For Deepest Embodiment
                      </AppText>
                    </View>
                    <View style={{ width: "100%", minWidth: 0 }}>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          lineHeight: 18,
                          fontStyle: "italic",
                          textAlign: "center",
                        }}
                      >
                        This course is designed for somatic gnosis that works best when
                        you awaken 1 hour before your day and sit with your
                        earphones and remove all distractions.
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>
              {courseStartDate && (
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 16,
                    marginTop: 16,
                    marginBottom: 16,
                  }}
                >
                  <Pressable
                    onPress={handleInviteFriend}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "rgba(135, 174, 115, 0.45)",
                    }}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(135, 174, 115, 0.18)",
                        "rgba(135, 174, 115, 0.1)",
                        "rgba(6, 182, 212, 0.06)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        padding: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="person-add"
                        size={18}
                        color="rgba(135, 174, 115, 0.95)"
                        style={{ marginRight: 8 }}
                      />
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          textAlign: "center",
                        }}
                      >
                        Build Your Tribe
                      </AppText>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </View>
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

            {/* Center block - I will open + clock - stays centered */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                maxWidth: 384,
                width: "100%",
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

              {/* While You Wait – archetype quiz (hero-style, under countdown) */}
              {!(completedTrialCourses === 2) && (
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    Linking.openURL(ARCHETYPE_QUIZ_URL)
                  }}
                  style={{
                    marginTop: 20,
                    alignSelf: "center",
                    maxWidth: 280,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 24,
                    backgroundColor: "rgba(28, 28, 28, 0.95)",
                    borderWidth: 1,
                    borderColor: "rgba(212, 165, 116, 0.7)",
                  }}
                  accessibilityLabel="While You Wait"
                  accessibilityHint="Open archetype quiz in browser"
                >
                  <AppText
                    font="cormorant-regular"
                    size="base"
                    style={{ color: "rgba(212, 165, 116, 0.95)", textAlign: "center" }}
                  >
                    While You Wait
                  </AppText>
                </Pressable>
              )}

              {/* Deepest Embodiment + Build Your Tribe moved to fixed bottom block above icon bar */}
            </View>

            {/* Action buttons (Preview Course, Chakras 101) moved to trial waiting room menu bar - single row with Tribe + Anua */}
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

      {!hasLifetimeAccess && (
        <View
          style={{
            position: "absolute",
            bottom: Platform.OS === "android" ? 40 : 0,
            left: 0,
            right: 0,
            paddingBottom: Math.max(insets.bottom, 4) + 20,
            zIndex: 10001,
            ...(Platform.OS === "android" && { elevation: 10002 }),
          }}
          pointerEvents="auto"
          collapsable={false}
        >
          <View style={{ paddingHorizontal: 28, paddingBottom: 16 }}>
            <View
              style={{
                width: "100%",
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 10,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderWidth: Platform.OS === "android" ? 1.5 : 1,
                borderColor: "rgba(6, 182, 212, 0.5)",
                shadowColor: "rgba(6, 182, 212, 0.2)",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                marginBottom: 12,
              }}
            >
              <View
                style={{ alignItems: "center", width: "100%", minWidth: 0 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 3,
                  }}
                >
                  <Ionicons
                    name="headset"
                    size={14}
                    color="rgba(6, 182, 212, 0.8)"
                    style={{ marginRight: 4 }}
                  />
                  <AppText
                    font="instrument-medium"
                    size="xs"
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      textAlign: "center",
                    }}
                  >
                    For Deepest Embodiment
                  </AppText>
                </View>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 18,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  This course is designed for somatic gnosis that works best when
                  you awaken 1 hour before your day and sit with your earphones
                  and remove all distractions.
                </AppText>
              </View>
            </View>
            {courseStartDate && (
              <>
                <Pressable
                  onPress={handleInviteFriend}
                  style={{
                    marginTop: 16,
                    marginBottom: 16,
                    borderRadius: 8,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "rgba(135, 174, 115, 0.45)",
                    ...(Platform.OS === "android" && { zIndex: 10003, elevation: 10003 }),
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <LinearGradient
                    colors={[
                      "rgba(135, 174, 115, 0.18)",
                      "rgba(135, 174, 115, 0.1)",
                      "rgba(6, 182, 212, 0.06)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      padding: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="person-add"
                      size={14}
                      color="rgba(135, 174, 115, 0.95)"
                      style={{ marginRight: 5 }}
                    />
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        textAlign: "center",
                      }}
                    >
                      Build Your Tribe
                    </AppText>
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "flex-end",
              paddingHorizontal: 16,
              gap: 20,
              marginTop: 12,
            }}
          >
            {onPreviewPress && (
              <View style={{ alignItems: "center", flex: 1, maxWidth: 64 }}>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    textAlign: "center",
                    marginBottom: 4,
                    fontSize: 10,
                    height: 14,
                  }}
                  numberOfLines={1}
                >
                  Preview
                </AppText>
                <Pressable
                  onPress={onPreviewPress}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  accessibilityLabel="Preview Course"
                >
                  <Image
                    source={
                      chakraContent[Chakra.SOLAR_PLEXUS].chakraHeaderImage
                    }
                    style={{ width: 32, height: 32, opacity: 0.95 }}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
            )}
            {onLearnAboutChakrasPress && (
              <View style={{ alignItems: "center", flex: 1, maxWidth: 64 }}>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    textAlign: "center",
                    marginBottom: 4,
                    fontSize: 10,
                    height: 14,
                  }}
                  numberOfLines={1}
                >
                  Chakras 101
                </AppText>
                <Pressable
                  onPress={onLearnAboutChakrasPress}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  accessibilityLabel="Chakras 101"
                >
                  <Image
                    source={require("@/assets/images/7chakras.png")}
                    style={{ width: 32, height: 32, opacity: 0.95 }}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
            )}
            <View style={{ alignItems: "center", flex: 1, maxWidth: 64 }}>
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                  marginBottom: 4,
                  fontSize: 10,
                  height: 14,
                }}
                numberOfLines={1}
              >
                tribe
              </AppText>
              <Pressable
                onPress={() => {
                  addHapticFeedback(HapticStrength.Light)
                  router.push("/(chakras)/TribeChat")
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  borderWidth: 1,
                  borderColor: "rgba(135, 174, 115, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#87AE73",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={22}
                  color="rgba(135, 174, 115, 0.95)"
                />
              </Pressable>
            </View>
            <View style={{ alignItems: "center", flex: 1, maxWidth: 64 }}>
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                  marginBottom: 4,
                  fontSize: 10,
                  height: 14,
                }}
                numberOfLines={1}
              >
                Anua
              </AppText>
              <Pressable
                onPress={handleAnuaPress}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#9D4EDD",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Image
                  source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                  resizeMode="cover"
                />
              </Pressable>
            </View>
          </View>
        </View>
      )}

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

      {/* Gentle reminders: shown 60s after entering waiting room if permission not yet granted */}
      <CommunicationReminderModal
        visible={showCommunicationModal}
        onAllow={handleCommunicationAllow}
        onNotNow={handleCommunicationNotNow}
      />

      {/* Dev Test Flow Tools - Only in dev mode */}
      {__DEV__ && (
        <TrialTestFlow
          onStartDay1={() => {
            // Start day 1 and hide waiting screen
            if (onHideWaitingScreen) {
              onHideWaitingScreen()
            }
          }}
          currentDay={-1}
        />
      )}
    </View>
  )
}
