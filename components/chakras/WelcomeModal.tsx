/**
 * Welcome Modal - The Grand Reveal
 *
 * Beautiful, healing introduction to the 7 Chakra Journey.
 * Matches the aesthetic of Anua and Social Sanctuary with earth tones,
 * purple gradients, and spiritual energy of peace.
 */

import React, { useMemo } from "react"
import { View, Modal, Image, ScrollView, Pressable, Share, Linking, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { calculateCourseStartDate, formatDate, getNextMondayDate } from "@/utils/date"

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
  const chakraName = CHAKRA_NAMES[index].toLowerCase().replace(" ", "")
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

/**
 * Share app with friend
 * Opens native share dialog with download link and start date
 */
const shareWithFriend = async (startDate: string) => {
  try {
    // TODO: Replace with actual app store links when available
    const appStoreLink = Platform.select({
      ios: "https://apps.apple.com/app/soul-school-7-chakras", // Placeholder
      android: "https://play.google.com/store/apps/details?id=com.sevenchakras.SevenChakras", // Placeholder
      default: "https://soulschool.app", // Placeholder
    })

    const message = `Join me on a healing journey through the 7 chakras! 🌟

I'm starting my journey on ${startDate} and would love to have you join me.

Download the Soul School app and begin your own transformation:
${appStoreLink}

Healing through connection. ✨`

    await Share.share({
      message,
      title: "Join me on the 7 Chakra Journey",
    })
  } catch (error) {
    if (__DEV__) {
      console.error("Error sharing:", error)
    }
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
  // Calculate when the course will start
  const courseStartDate = useMemo(() => {
    if (initialOpenDate) {
      const { calculateCourseStartDate } = require("@/utils/date")
      const startDateISO = calculateCourseStartDate(initialOpenDate)
      return formatDate(new Date(startDateISO))
    }
    // Fallback to next Monday
    return formatDate(getNextMondayDate())
  }, [initialOpenDate])

  const remainingTrials = 2 - completedTrialCourses

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/90">
        <View
          className="w-[95%] max-h-[90%] rounded-3xl overflow-hidden"
          style={{ shadowColor: "#9333ea", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}
        >
          <LinearGradient
            colors={["#1a0a2e", "#16213e", "#0f3460"]}
            style={{ width: "100%", height: "100%", borderRadius: 24 }}
          >
          {/* Header with close button */}
          <View className="flex-row justify-between items-center p-5 border-b border-purple-900/30">
            <View className="flex-1">
              <AppText font="instrument-bold" size="2xl" className="text-white mb-1">
                Your Path Awaits
              </AppText>
              <AppText font="instrument-regular" size="sm" className="text-purple-300/80">
                The journey from self to soul
              </AppText>
            </View>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
            {/* Hero Section */}
            <View className="items-center mb-6">
              <Image
                source={require("@/assets/images/SoulSchool_HERO_Logo.png")}
                className="w-40 h-20 mb-6"
                resizeMode="contain"
              />
              <AppText
                font="instrument-regular"
                size="base"
                className="text-center mb-4 text-white/90 leading-6"
              >
                Welcome to a sacred journey through the 7 chakras—a week-long exploration of your energy centers, guiding you from foundation to highest consciousness.
              </AppText>
            </View>

            {/* Trial Information - Subtle */}
            {remainingTrials > 0 && (
              <View className="mb-4 px-3 py-2">
                <AppText font="instrument-regular" size="xs" className="text-white/50 text-center leading-4">
                  {remainingTrials === 2
                    ? "Two complete 7-day journeys await you"
                    : "One more complete 7-day journey awaits you"}
                </AppText>
              </View>
            )}

            {/* Gentle Reminder */}
            <View className="mb-6 px-2">
              <AppText font="instrument-regular" size="sm" className="text-white/70 text-center leading-5 italic">
                When you press "Begin," the app will rest until{" "}
                <AppText font="instrument-medium" className="text-purple-300/90">
                  {courseStartDate}
                </AppText>
                , ensuring your journey begins at the perfect moment, aligned with the weekly cycle.
              </AppText>
            </View>

            {/* Weekly Path Preview */}
            <View className="mb-6">
              <AppText font="instrument-bold" size="lg" className="text-white mb-4">
                Your Weekly Path
              </AppText>
              <View className="gap-2">
                {DAY_NAMES.map((day, index) => (
                  <View
                    key={index}
                    className="flex-row items-center p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <Image
                      source={getChakraImage(index)}
                      className="w-10 h-10 mr-3"
                      resizeMode="contain"
                    />
                    <View className="flex-1">
                      <AppText font="instrument-medium" size="base" className="text-white">
                        {day}
                      </AppText>
                      <AppText font="instrument-regular" size="sm" className="text-purple-300/80">
                        {CHAKRA_NAMES[index]} Chakra
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* How It Works */}
            <View className="mb-6">
              <AppText font="instrument-bold" size="lg" className="text-white mb-3">
                How It Works
              </AppText>
              <View className="gap-3">
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700/50 items-center justify-center mr-3 mt-0.5">
                    <AppText font="instrument-bold" size="sm" className="text-purple-300">
                      1
                    </AppText>
                  </View>
                  <View className="flex-1">
                    <AppText font="instrument-regular" size="sm" className="text-white/90 leading-5">
                      Each day, a new chakra becomes available for deep exploration
                    </AppText>
                  </View>
                </View>
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700/50 items-center justify-center mr-3 mt-0.5">
                    <AppText font="instrument-bold" size="sm" className="text-purple-300">
                      2
                    </AppText>
                  </View>
                  <View className="flex-1">
                    <AppText font="instrument-regular" size="sm" className="text-white/90 leading-5">
                      Access meditations, affirmations, and wisdom for each energy center
                    </AppText>
                  </View>
                </View>
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700/50 items-center justify-center mr-3 mt-0.5">
                    <AppText font="instrument-bold" size="sm" className="text-purple-300">
                      3
                    </AppText>
                  </View>
                  <View className="flex-1">
                    <AppText font="instrument-regular" size="sm" className="text-white/90 leading-5">
                      Complete all 7 chakras to finish your journey and unlock your gift
                    </AppText>
                  </View>
                </View>
              </View>
            </View>

            {/* Invite Friend Button */}
            <Pressable
              onPress={() => shareWithFriend(courseStartDate)}
              className="mb-4 rounded-xl p-4 active:opacity-80"
              style={{ backgroundColor: "rgba(135, 174, 115, 0.2)", borderWidth: 1, borderColor: "rgba(135, 174, 115, 0.4)" }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="heart" size={24} color="#87AE73" />
                <View className="ml-3 flex-1">
                  <AppText font="instrument-bold" size="base" className="mb-1" style={{ color: "#87AE73" }}>
                    Healing Through Connection
                  </AppText>
                  <AppText font="instrument-regular" size="sm" className="text-white/80">
                    Invite a friend to join you on your journey
                  </AppText>
                </View>
              </View>
            </Pressable>
          </ScrollView>

          {/* Footer with Begin button */}
          <View className="p-5 border-t border-purple-900/30 bg-black/20">
            <LinearGradient
              colors={["#9333ea", "#7c3aed"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 9999,
                paddingVertical: 16,
                paddingHorizontal: 32,
                shadowColor: "#9333ea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Pressable
                onPress={onBeginJourney}
                className="active:opacity-80"
              >
                <AppText font="instrument-bold" size="lg" className="text-center text-white">
                  Begin Your Journey
                </AppText>
              </Pressable>
            </LinearGradient>
            <AppText font="instrument-regular" size="xs" className="text-center mt-3 text-white/60">
              Soul School is a Public Benefit Non Profit
            </AppText>
          </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  )
}
