/**
 * Welcome Modal - The Grand Reveal
 *
 * Beautiful, healing introduction to the 7 Chakra Journey.
 * Matches the aesthetic of Anua and Social Sanctuary with earth tones,
 * purple gradients, and spiritual energy of peace.
 */

import React, { useMemo, useState } from "react"
import {
  View,
  Modal,
  Image,
  ScrollView,
  Pressable,
  Share,
  Linking,
  Platform,
} from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import {
  calculateCourseStartDate,
  formatDate,
  getNextMondayDate,
} from "@/utils/date"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { ScrollDatePicker } from "@/components/chakras/ScrollDatePicker"
import { DateConfirmationModal } from "@/components/chakras/DateConfirmationModal"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import { InviteFriendModal } from "@/components/invite/InviteFriendModal"
import {
  scheduleJourneyReminders,
  requestNotificationPermissions,
  hasNotificationPermission,
} from "@/src/services/journeyNotifications"
import { CommunicationReminderModal } from "@/components/chakras/CommunicationReminderModal"

interface WelcomeModalProps {
  isVisible: boolean
  onClose: () => void
  onBeginJourney: () => void
  currentDayOfWeek: number
  completedTrialCourses?: number
  initialOpenDate?: string | null
}

// Day names mapping
const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

// Chakra names mapping
const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
]

// Chakra image mapping
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

export const WelcomeModal = ({
  isVisible,
  onClose,
  onBeginJourney,
  currentDayOfWeek,
  completedTrialCourses = 0,
  initialOpenDate,
}: WelcomeModalProps) => {
  // Calendar state
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCommunicationModal, setShowCommunicationModal] = useState(false)

  const { setFirstLaunchComplete } = useFirstLaunchStore()
  const { setInitialOpenDate, setCourseStartDate, courseStartDate } =
    useChakraJourneyStore()

  // Handle date selection from calendar
  const handleDateSelect = (dateISO: string) => {
    setSelectedDateISO(dateISO)
    setShowConfirmation(true)
  }

  // Handle confirmation: set date, then show our communication reminder (or schedule if already permitted)
  const handleConfirmDate = async () => {
    if (!selectedDateISO) return
    const todayISO = new Date().toISOString().split("T")[0]
    setInitialOpenDate(todayISO)
    setCourseStartDate(selectedDateISO)
    setShowConfirmation(false)

    const alreadyGranted = await hasNotificationPermission()
    if (alreadyGranted) {
      scheduleJourneyReminders(selectedDateISO).catch((err) => {
        if (__DEV__) console.warn("[WelcomeModal] Failed to schedule reminders:", err)
      })
    } else {
      setShowCommunicationModal(true)
    }
  }

  const handleCommunicationAllow = async () => {
    if (!selectedDateISO) return
    const granted = await requestNotificationPermissions()
    if (granted) {
      scheduleJourneyReminders(selectedDateISO).catch((err) => {
        if (__DEV__) console.warn("[WelcomeModal] Failed to schedule reminders:", err)
      })
    }
    setShowCommunicationModal(false)
  }

  const handleCommunicationNotNow = () => {
    setShowCommunicationModal(false)
  }

  // Handle cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    // Keep selectedDateISO so they can see what they selected
  }

  // Calculate when the course will start
  // Use selected date if available, otherwise use initialOpenDate or fallback
  const displayStartDate = useMemo(() => {
    if (selectedDateISO) {
      // If they've selected a date, show it (it's already a Monday)
      return formatDate(new Date(selectedDateISO + "T00:00:00"))
    }
    if (initialOpenDate) {
      const { calculateCourseStartDate } = require("@/utils/date")
      const startDateISO = calculateCourseStartDate(initialOpenDate)
      return formatDate(new Date(startDateISO))
    }
    // Fallback to next Monday
    return formatDate(getNextMondayDate())
  }, [selectedDateISO, initialOpenDate])

  const remainingTrials = 2 - completedTrialCourses

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
        <View style={{ width: "100%", height: "100%", maxWidth: 512 }}>
          {/* Close button - top right */}
          <View style={{ position: "absolute", top: 48, right: 24, zIndex: 10 }}>
            <Pressable
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.05)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 80,
              paddingBottom: 140,
            }}
          >
            {/* Hero Logo - Large and Prominent */}
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
                style={{ color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 24 }}
              >
                Welcome to a sacred journey through the 7 chakras—a week-long
                exploration of your energy centers, guiding you from foundation
                to highest consciousness.
              </AppText>
            </View>

            {/* Calendar - Monday Selection */}
            <View style={{ marginBottom: 40 }}>
              <ScrollDatePicker
                onDateSelect={handleDateSelect}
                selectedDateISO={selectedDateISO}
              />
            </View>

            {/* Selected Date Display */}
            {selectedDateISO && (
              <View style={{ marginBottom: 24, alignItems: "center" }}>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 8 }}
                >
                  Your journey begins
                </AppText>
                <AppText
                  font="instrument-medium"
                  size="lg"
                  style={{ color: "#ffffff", textAlign: "center" }}
                >
                  {displayStartDate}
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 8 }}
                >
                  At midnight Monday morning
                </AppText>
              </View>
            )}

            {remainingTrials > 0 && !selectedDateISO && (
              <View style={{ marginBottom: 24, alignItems: "center" }}>
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
                shadowColor: "#87AE73",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <Ionicons
                  name="heart"
                  size={18}
                  color="rgba(135, 174, 115, 1)"
                  style={{ marginRight: 10 }}
                />
                <AppText
                  font="instrument-medium"
                  size="sm"
                  style={{ textAlign: "center", color: "rgba(135, 174, 115, 1)", flex: 0 }}
                >
                  Invite a friend to join your journey
                </AppText>
              </View>
            </Pressable>
          </ScrollView>

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
              onPress={onBeginJourney}
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
              style={{ textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.4)" }}
            >
              Soul School is operated by Project Starseed, an IRS-recognized
              501(c)(3) tax-exempt organization.
            </AppText>
          </View>
        </View>
      </View>

      {/* Date Confirmation Modal */}
      <DateConfirmationModal
        visible={showConfirmation}
        selectedDateISO={selectedDateISO}
        onConfirm={handleConfirmDate}
        onCancel={handleCancelConfirmation}
      />

      {/* Invite Friend Modal */}
      <InviteFriendModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        startDate={displayStartDate}
      />

      {/* Communication reminder pre-prompt (dark, our copy) before system permission dialog */}
      <CommunicationReminderModal
        visible={showCommunicationModal}
        onAllow={handleCommunicationAllow}
        onNotNow={handleCommunicationNotNow}
      />
    </Modal>
  )
}
