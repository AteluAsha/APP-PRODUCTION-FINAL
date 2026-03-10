/**
 * Date Selection Screen (Hero) - Trials App
 *
 * Full-screen "Your Path Awaits" date selection. Replaces the previous
 * date selection with the hero screen.
 * Flow: Path selection → this screen → confirm date (locks only) →
 * scroll → Begin Your Journey → waiting room (preload starts there).
 */

import React, { useMemo, useState, useCallback } from "react"
import {
  View,
  Image,
  ScrollView,
  Pressable,
  Platform,
  Modal,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { ScrollDatePicker } from "@/components/chakras/ScrollDatePicker"
import { DateConfirmationModal } from "@/components/chakras/DateConfirmationModal"
import { InviteFriendModal } from "@/components/invite/InviteFriendModal"
import { formatDate, getLocalDateISO, getNextMondayDate } from "@/utils/date"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import {
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
} from "@/constants/layout"
import { DAY_NAMES, CHAKRA_NAMES } from "@/constants/chakras/chakraConstants"
import {
  scheduleJourneyReminders,
  hasNotificationPermission,
} from "@/src/services/journeyNotifications"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const getChakraImage = (index: number) => {
  const chakraName = getChakraName(index).toLowerCase().replace(" ", "")
  switch (chakraName) {
    case "root":
      return require("@/assets/images/root.png")
    case "sacral":
      return require("@/assets/images/sacral.png")
    case "solarplexus":
      return require("@/assets/images/solar.png")
    case "heart":
      return require("@/assets/images/heart.png")
    case "throat":
      return require("@/assets/images/throat.png")
    case "thirdeye":
      return require("@/assets/images/thirdeye.png")
    case "crown":
      return require("@/assets/images/crown.png")
    default:
      return require("@/assets/images/root.png")
  }
}

export default function DateSelectionScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showPickDateReminder, setShowPickDateReminder] = useState(false)

  const { setFirstLaunchComplete } = useFirstLaunchStore()
  const {
    setInitialOpenDate,
    setCourseStartDate,
    courseStartDate,
    completedTrialCourses = 0,
    hasLifetimeAccess = false,
  } = useChakraJourneyStore()

  const handleBack = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    useChakraJourneyStore.getState().setLifetimeChosenTimegateJourney(false)
    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
    } else {
      router.replace("/(chakras)/WelcomeScreen")
    }
  }, [router, hasLifetimeAccess])

  const handleDateSelect = useCallback((dateISO: string) => {
    setSelectedDateISO(dateISO)
    setTimeout(() => setShowConfirmation(true), 150)
  }, [])

  // Confirm locks the date; schedule reminders if already permitted. Reminder modal now shows 60s after entering waiting room.
  const handleConfirmDate = useCallback(async () => {
    if (!selectedDateISO) return
    const todayISO = getLocalDateISO()
    setInitialOpenDate(todayISO)
    setCourseStartDate(selectedDateISO)
    addHapticFeedback(HapticStrength.Medium)
    setShowConfirmation(false)

    const alreadyGranted = await hasNotificationPermission()
    if (alreadyGranted) {
      scheduleJourneyReminders(selectedDateISO).catch((err) => {
        if (__DEV__)
          console.warn("[DateSelection] Failed to schedule reminders:", err)
      })
    }
  }, [selectedDateISO, setInitialOpenDate, setCourseStartDate])

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false)
  }, [])

  // Begin Your Journey: three doors for trial users (Lifetime does not use these—they go WelcomeScreen → ChakraHub).
  // If no start date has been confirmed, show reminder to choose a Monday (Android & iOS).
  const handleBeginJourney = useCallback(() => {
    addHapticFeedback(HapticStrength.Medium)
    const state = useChakraJourneyStore.getState()
    if (!state.courseStartDate) {
      setShowPickDateReminder(true)
      return
    }

    const bothTrialsActuallyCompleted =
      !state.hasLifetimeAccess && state.completedTrialCourses >= 2

    if (state.completedTrialCourses < 2 || state.hasLifetimeAccess) {
      state.setHasCompletedHeroOnboarding(true)
      setFirstLaunchComplete()
    }

    if (state.hasLifetimeAccess) {
      state.setLifetimeChosenTimegateJourney(true)
    }

    if (bothTrialsActuallyCompleted) {
      router.replace("/(chakras)/SimpleGraceTransition")
    } else {
      router.replace("/(chakras)/ChakraHome")
    }
  }, [setFirstLaunchComplete, router])

  const displayStartDate = useMemo(() => {
    if (selectedDateISO) {
      return formatDate(new Date(selectedDateISO + "T00:00:00"))
    }
    if (courseStartDate) {
      return formatDate(new Date(courseStartDate + "T00:00:00"))
    }
    return formatDate(getNextMondayDate())
  }, [selectedDateISO, courseStartDate])

  const remainingTrials = 2 - completedTrialCourses

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000000" }}
      edges={["top", "bottom"]}
    >
      <View
        style={{ width: "100%", flex: 1, maxWidth: 512, alignSelf: "center" }}
        pointerEvents="box-none"
      >
        {/* ScrollView first so back button overlay receives touches on Android */}

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 80,
            paddingBottom: 140 + SCROLL_BREATHING_BOTTOM_PADDING,
          }}
        >
          {/* Hero Logo */}
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <Image
              source={require("@/assets/images/SoulSchool_HERO_Logo.png")}
              style={{ width: 256, height: 128, marginBottom: 16 }}
              resizeMode="contain"
            />
          </View>

          {/* Title Section */}
          <View style={{ marginBottom: 32 }}>
            <AppText
              font="instrument-bold"
              size="3xl"
              style={{ color: "#ffffff", marginBottom: 8, textAlign: "center" }}
            >
              Your Path Awaits
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}
            >
              The journey from self to soul
            </AppText>
          </View>

          {/* Main Description */}
          <View style={{ marginBottom: 32 }}>
            <AppText
              font="instrument-regular"
              size="base"
              style={{
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Welcome to a sacred journey through the 7 chakras—a week-long
              exploration of your energy centers, guiding you from foundation to
              highest consciousness.
            </AppText>
          </View>

          {/* Calendar - Monday Selection */}
          <View style={{ marginBottom: 40 }}>
            <ScrollDatePicker
              onDateSelect={handleDateSelect}
              selectedDateISO={selectedDateISO}
            />
          </View>

          {/* Selected Date Display - ~20% larger for visibility (countdown-style block) */}
          {selectedDateISO && (
            <View style={{ marginBottom: 24, alignItems: "center" }}>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Your journey begins
              </AppText>
              <AppText
                font="instrument-bold"
                size="xl"
                style={{ color: "#ffffff", textAlign: "center" }}
              >
                {displayStartDate}
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                At midnight Monday morning
              </AppText>
            </View>
          )}

          {/* Clarity line under calendar (when no date selected) + Trials Info - hide for lifetime users */}
          {!hasLifetimeAccess && remainingTrials > 0 && !selectedDateISO && (
            <View style={{ marginBottom: 24, alignItems: "center" }}>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "#ffffff",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Select A Date To Begin The Somatic Course
              </AppText>
              <AppText
                font="instrument-regular"
                size="xs"
                style={{ color: "rgba(255,255,255,0.4)", textAlign: "center" }}
              >
                {remainingTrials === 2
                  ? "Two complete 7-day journeys await you"
                  : "One more complete 7-day journey awaits you"}
              </AppText>
            </View>
          )}
          {/* Weekly Path - Review of the week */}
          <View style={{ marginBottom: 40 }}>
            <View style={{ gap: 12 }}>
              {DAY_NAMES.map((day, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <Image
                    source={getChakraImage(index)}
                    style={{ width: 32, height: 32, marginRight: 16 }}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={{ color: "#ffffff" }}
                    >
                      {day}
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {CHAKRA_NAMES[index]} Chakra
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Invite Friend Button - single border, centered content */}
          <Pressable
            onPress={() => setShowInviteModal(true)}
            style={{
              marginBottom: 32,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              overflow: "hidden",
              backgroundColor: "rgba(135, 174, 115, 0.15)",
              borderWidth: 1,
              borderColor: "rgba(135, 174, 115, 0.3)",
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="heart"
                size={18}
                color="rgba(135, 174, 115, 1)"
                style={{ marginRight: 10 }}
              />
              <AppText
                font="instrument-medium"
                size="sm"
                style={{
                  color: "rgba(135, 174, 115, 1)",
                  textAlign: "center",
                }}
              >
                Invite a friend to join your journey
              </AppText>
            </View>
          </Pressable>
        </ScrollView>

        {/* Back button overlay after ScrollView so it receives touches on Android */}
        <Pressable
          onPress={handleBack}
          style={{
            position: "absolute",
            top: 48,
            left: 24,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.05)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </Pressable>

        {/* Fixed Footer with Begin button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            paddingBottom: 32,
            backgroundColor: "rgba(0,0,0,0.95)",
            borderTopWidth: 1,
            borderTopColor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <Pressable
            onPress={handleBeginJourney}
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              backgroundColor: "#9333ea",
              shadowColor: "#9333ea",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <AppText
              font="instrument-bold"
              size="base"
              style={{ textAlign: "center", color: "#ffffff" }}
            >
              Begin Your Journey
            </AppText>
          </Pressable>
          <AppText
            font="instrument-regular"
            size="xs"
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Soul School is operated by Project Starseed, an IRS-recognized
            501(c)(3) tax-exempt organization.
          </AppText>
        </View>
      </View>

      <DateConfirmationModal
        visible={showConfirmation}
        selectedDateISO={selectedDateISO}
        onConfirm={handleConfirmDate}
        onCancel={handleCancelConfirmation}
        offeringNumber={completedTrialCourses === 1 ? 2 : 1}
        isCourseMode={hasLifetimeAccess}
      />

      <InviteFriendModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        startDate={displayStartDate}
      />

      {/* Reminder when tapping Begin without having chosen a start date (Android & iOS) */}
      <Modal
        visible={showPickDateReminder}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPickDateReminder(false)}
        statusBarTranslucent
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.85)",
            paddingHorizontal: 24,
          }}
          onPress={() => setShowPickDateReminder(false)}
        >
          <Pressable
            style={{
              width: "100%",
              maxWidth: 320,
              padding: 24,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(135, 174, 115, 0.4)",
              backgroundColor: "rgba(20, 20, 20, 0.98)",
              alignItems: "center",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <AppText
              font="instrument-bold"
              size="lg"
              style={{
                color: "#ffffff",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Choose a Monday to begin
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{
                color: "rgba(255,255,255,0.88)",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              This course aligns with the 7 days of the week for somatic alchemy.
              Please choose a Monday on which to begin, then continue on the path.
            </AppText>
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                setShowPickDateReminder(false)
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12,
                backgroundColor: "rgba(135, 174, 115, 0.35)",
                borderWidth: 1,
                borderColor: "rgba(135, 174, 115, 0.6)",
              }}
            >
              <AppText
                font="instrument-medium"
                size="sm"
                style={{ color: "#ffffff" }}
              >
                OK
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
