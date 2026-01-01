/**
 * Waiting Screen - Mysterious Countdown
 *
 * A healing, mysterious countdown experience with subtle power.
 * Dark, clean, engaging design using chakra imagery for depth and presence.
 */

import React from "react"
import { View, Image, Pressable, ScrollView } from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import {
  getFormattedNextMondayDate,
  getNextMondayDate,
  getTimeRemaining,
  formatDate,
} from "@/utils/date"
import { useState, useEffect, useRef } from "react"
import { formatCountdown } from "@/utils/format"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated"

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
  // For starting Trial 2 after Trial 1 ends
  completedTrialCourses?: number
  hasLifetimeAccess?: boolean
  onPayPress?: () => void // For navigating to paywall after Trial 2
}

const WaitingScreenDevTools = ({
  showDevTools,
  toggleDevTools,
  onHideWaitingScreen,
}: {
  showDevTools: boolean
  toggleDevTools: () => void
  onHideWaitingScreen?: () => void
}) => {
  return (
    <>
      {/* Developer tools toggle button - always visible */}
      <Pressable
        onPress={toggleDevTools}
        className="absolute top-20 right-4 z-10 px-3 py-2 bg-gray-800/70 rounded-lg border border-gray-700"
      >
        <AppText font="instrument-medium" size="sm">
          {showDevTools ? "Hide Developer Tools" : "Show Developer Tools"}
        </AppText>
      </Pressable>

      {/* Developer tools panel - conditionally visible */}
      {showDevTools && (
        <View className="absolute top-32 right-4 z-10 p-4 bg-gray-800/80 rounded-lg border border-gray-600 min-w-[200px]">
          <AppText
            font="instrument-bold"
            size="base"
            className="mb-3 text-center"
          >
            Developer Tools
          </AppText>

          <Pressable
            onPress={onHideWaitingScreen}
            className="bg-white/10 py-2 px-4 rounded-md mb-2"
          >
            <AppText font="instrument-medium" size="sm" className="text-center">
              Hide Waiting Screen
            </AppText>
          </Pressable>
        </View>
      )}
    </>
  )
}

export const WaitingScreen = ({
  onPreviewPress,
  onHideWaitingScreen,
  onSummaryPress,
  onGalleryPress,
  onBeginAgainPress,
  completedTrialCourses = 0,
  hasLifetimeAccess = false,
  onPayPress,
}: WaitingScreenProps) => {
  const { courseStartDate } = useChakraJourneyStore(
    useShallow((state) => ({
      courseStartDate: state.courseStartDate,
    })),
  )

  // Use course start date if available, otherwise fall back to next Monday
  const targetDate = courseStartDate
    ? new Date(courseStartDate + "T00:00:00") // Ensure local midnight
    : getNextMondayDate()
  const formattedDate = courseStartDate
    ? formatDate(new Date(courseStartDate + "T00:00:00"))
    : getFormattedNextMondayDate()

  const [timeLeft, setTimeLeft] = useState({
    days: "0",
    hours: "00",
    minutes: "00",
    seconds: "00",
  })
  const [showDevTools, setShowDevTools] = useState(false)

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
      true
    )
    pulseScale.value = withRepeat(
      withTiming(1.05, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
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

  // Toggle developer tools visibility
  const toggleDevTools = () => {
    setShowDevTools(!showDevTools)
  }

  return (
    <View className="flex-1 bg-black">
      {/* Mysterious background chakra images - subtle, layered */}
      <View className="absolute inset-0" style={{ opacity: 0.15 }}>
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

      {/* Developer Tools */}
      {__DEV__ && (
        <WaitingScreenDevTools
          showDevTools={showDevTools}
          toggleDevTools={toggleDevTools}
          onHideWaitingScreen={onHideWaitingScreen}
        />
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Central chakra symbol - mysterious and powerful */}
        <View className="mb-12">
          <Image
            source={require("@/assets/images/7chakras.png")}
            className="w-32 h-32"
            resizeMode="contain"
            style={{ opacity: 0.9 }}
          />
        </View>

        {/* Main content */}
        <View className="items-center mb-12 max-w-sm">
          <AppText
            font="instrument-regular"
            size="2xl"
            className="text-center mb-3 text-white/90"
            style={{ letterSpacing: 1 }}
          >
            Your Journey Begins
          </AppText>

          <AppText font="instrument-regular" size="sm" className="text-center mb-10 text-white/50 leading-5">
            Opening on {formattedDate}
          </AppText>

          {/* Countdown display - clean, mysterious, powerful */}
          {/* Only show countdown if not after Trial 2 */}
          {!(completedTrialCourses === 2 && !hasLifetimeAccess) && (
            <View className="flex-row justify-center items-center gap-3 mb-10">
            {/* Days */}
            <View className="items-center">
              <View
                className="w-16 h-16 rounded-lg justify-center items-center mb-2"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <AppText font="instrument-bold" size="2xl" className="text-white/90">
                  {timeLeft.days}
                </AppText>
              </View>
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-white/40"
                style={{ letterSpacing: 2 }}
              >
                DAYS
              </AppText>
            </View>

            <AppText font="instrument-regular" size="xl" className="text-white/30">
              :
            </AppText>

            {/* Hours */}
            <View className="items-center">
              <View
                className="w-16 h-16 rounded-lg justify-center items-center mb-2"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <AppText font="instrument-bold" size="2xl" className="text-white/90">
                  {timeLeft.hours}
                </AppText>
              </View>
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-white/40"
                style={{ letterSpacing: 2 }}
              >
                HOURS
              </AppText>
            </View>

            <AppText font="instrument-regular" size="xl" className="text-white/30">
              :
            </AppText>

            {/* Minutes */}
            <View className="items-center">
              <View
                className="w-16 h-16 rounded-lg justify-center items-center mb-2"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <AppText font="instrument-bold" size="2xl" className="text-white/90">
                  {timeLeft.minutes}
                </AppText>
              </View>
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-white/40"
                style={{ letterSpacing: 2 }}
              >
                MINS
              </AppText>
            </View>
          </View>
          )}
        </View>

        {/* Action Buttons - subtle, clean */}
        <View className="w-full max-w-sm gap-3 mb-8">
          {/* After Trial 2: Landing screen with pay/scholarship/gallery options */}
          {completedTrialCourses === 2 && !hasLifetimeAccess ? (
            <>
              {/* Gallery Button - Always show if user has unlocked cards */}
              {onGalleryPress && (
                <Pressable
                  onPress={onGalleryPress}
                  className="bg-white/5 border border-white/10 py-3 px-6 rounded-lg active:opacity-60"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="images" size={18} color="rgba(255, 255, 255, 0.7)" />
                    <AppText font="instrument-regular" size="sm" className="text-center ml-2 text-white/70">
                      View Your Chakra Cards
                    </AppText>
                  </View>
                </Pressable>
              )}

              {/* Pay/Scholarship Button */}
              {onPayPress && (
                <Pressable
                  onPress={onPayPress}
                  className="bg-purple-500/20 border border-purple-400/30 py-4 px-6 rounded-lg active:opacity-60"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="diamond" size={20} color="rgba(168, 85, 247, 0.9)" />
                    <AppText font="instrument-medium" size="base" className="text-center ml-2 text-purple-300">
                      Continue Your Journey
                    </AppText>
                  </View>
                </Pressable>
              )}
            </>
          ) : completedTrialCourses === 1 ? (
            <>
              {/* After Trial 1: Begin Again button (only on Monday) */}
              {onBeginAgainPress && (
                <Pressable
                  onPress={onBeginAgainPress}
                  className="bg-purple-500/20 border border-purple-400/30 py-4 px-6 rounded-lg active:opacity-60 mb-3"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="play-circle" size={20} color="rgba(168, 85, 247, 0.9)" />
                    <AppText font="instrument-medium" size="base" className="text-center ml-2 text-purple-300">
                      Begin Again
                    </AppText>
                  </View>
                </Pressable>
              )}

              {/* Gallery Button */}
              {onGalleryPress && (
                <Pressable
                  onPress={onGalleryPress}
                  className="bg-white/5 border border-white/10 py-3 px-6 rounded-lg active:opacity-60"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="images" size={18} color="rgba(255, 255, 255, 0.7)" />
                    <AppText font="instrument-regular" size="sm" className="text-center ml-2 text-white/70">
                      View Your Chakra Cards
                    </AppText>
                  </View>
                </Pressable>
              )}

              {/* Summary Button */}
              {onSummaryPress && (
                <Pressable
                  onPress={onSummaryPress}
                  className="bg-white/5 border border-white/10 py-3 px-6 rounded-lg active:opacity-60"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="document-text" size={18} color="rgba(255, 255, 255, 0.7)" />
                    <AppText font="instrument-regular" size="sm" className="text-center ml-2 text-white/70">
                      View Journey Summary
                    </AppText>
                  </View>
                </Pressable>
              )}
            </>
          ) : (
            <>
              {/* Before first trial: Normal waiting screen */}
              {/* Gallery Button - Always show if user has unlocked cards */}
              {onGalleryPress && (
                <Pressable
                  onPress={onGalleryPress}
                  className="bg-white/5 border border-white/10 py-3 px-6 rounded-lg active:opacity-60"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="images" size={18} color="rgba(255, 255, 255, 0.7)" />
                    <AppText font="instrument-regular" size="sm" className="text-center ml-2 text-white/70">
                      View Your Chakra Cards
                    </AppText>
                  </View>
                </Pressable>
              )}

              {/* Summary Button */}
              {onSummaryPress && (
                <Pressable
                  onPress={onSummaryPress}
                  className="bg-white/5 border border-white/10 py-3 px-6 rounded-lg active:opacity-60"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="document-text" size={18} color="rgba(255, 255, 255, 0.7)" />
                    <AppText font="instrument-regular" size="sm" className="text-center ml-2 text-white/70">
                      View Journey Summary
                    </AppText>
                  </View>
                </Pressable>
              )}

              {/* Preview button */}
              {onPreviewPress && (
                <Pressable
                  onPress={onPreviewPress}
                  className="bg-white/5 border border-white/10 py-3 px-6 rounded-lg active:opacity-60"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="eye" size={18} color="rgba(255, 255, 255, 0.7)" />
                    <AppText font="instrument-regular" size="sm" className="text-center ml-2 text-white/70">
                      Preview Journey
                    </AppText>
                  </View>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* Bottom info text - mysterious, subtle */}
        <View className="px-8">
          <AppText
            font="instrument-regular"
            size="xs"
            className="text-center text-white/30 leading-4"
            style={{ letterSpacing: 0.5 }}
          >
            Each day of the week unlocks a new chakra, guiding you from your
            foundation to your crown. The journey begins when the time is right.
          </AppText>
        </View>
      </ScrollView>
    </View>
  )
}
