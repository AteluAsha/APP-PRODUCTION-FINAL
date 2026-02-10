/**
 * Goodbye Modal - End-of-Day Completion Screen
 *
 * LOCKED DESIGN (all 7 days):
 * - Section 1: Day title, identity statement, chakra image, hero affirmation quote, closing message.
 *   Centered in upper area with paddingBottom reserve.
 * - Section 2: Open Your Gift, Tomorrow preview. Anchored to bottom of screen
 *   (position absolute, direct child of full-screen view). Generous spacing between sections.
 *
 * Content varies by chakraDay (0-6); layout is identical for all 7 days.
 */
import ResponsiveImage from "@/components/ResponsiveImage"
import { AppText } from "@/components/AppText"
import React, { useState, useEffect } from "react"
import {
  View,
  Image,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Pressable,
  StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withRepeat,
  Easing,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { ChakraCardRevealModal } from "./ChakraCardRevealModal"
import { Chakra } from "@/types/chakras/Chakra"
import { useRouter } from "expo-router"
import { getChakraFromDay } from "@/utils/chakraMapping"
import { chakraContent } from "@/constants/chakras/content"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import {
  getChakraName,
  getChakraImage,
  getDayName,
} from "@/constants/chakras/chakraConstants"
import { getTimeRemaining } from "@/utils/date"
import { formatCountdown } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const GoodbyeModal = ({
  isVisible,
  onClose,
  chakraDay,
  navigateToHubOnHome = true,
}: {
  isVisible: boolean
  onClose: () => void
  chakraDay?: number
  /** When false (e.g. shown from ChakraHub), Home just closes. When true (ChakraHome), Home navigates to ChakraHub. */
  navigateToHubOnHome?: boolean
}) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [showCardReveal, setShowCardReveal] = useState(false)

  // Get lifetime access status
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((state) => state.hasLifetimeAccess),
  )

  const currentChakra =
    chakraDay !== undefined ? getChakraFromDay(chakraDay) : Chakra.ROOT
  const isDayOne = chakraDay === 0
  const isLastDay = chakraDay === 6
  const { width } = useWindowDimensions()
  const opacity = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const cardScale = useSharedValue(1)

  // Hero affirmations: identity statement + full affirmation (same as main page)
  const content = chakraContent[currentChakra]
  const identityStatement = content?.pills?.identityStatement?.title || ""
  const heroAffirmation = content?.affirmationText || ""

  // Get chakra card image for tiny icon teaser
  const chakraCardImage = content?.elements?.background

  // Calculate next day's chakra for tease (trials only)
  const nextDay =
    chakraDay !== undefined && chakraDay < 6 ? chakraDay + 1 : null
  const nextChakraName = nextDay !== null ? getChakraName(nextDay) : null
  const nextChakraImage = nextDay !== null ? getChakraImage(nextDay) : null

  // Calculate midnight countdown for next day (trials only)
  const [midnightCountdown, setMidnightCountdown] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  })

  useEffect(() => {
    if (!isVisible || !nextDay) return

    const calculateMidnight = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0) // Next midnight

      const remaining = getTimeRemaining(tomorrow)
      setMidnightCountdown(formatCountdown(remaining))
    }

    calculateMidnight()
    const interval = setInterval(calculateMidnight, 1000)
    return () => clearInterval(interval)
  }, [isVisible, nextDay])

  // Handle navigation to home
  const handleNavigateHome = () => {
    addHapticFeedback(HapticStrength.Light)
    onClose()
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (hasLifetimeAccess) {
          useChakraJourneyStore
            .getState()
            .setLifetimeChosenTimegateJourney(false)
          router.replace("/(chakras)/ChakraHub")
        } else {
          router.push("/(chakras)/ChakraHome")
        }
      }, 300)
    })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }))

  React.useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 400 })
      // Smooth pulse for chakra ball: single repeating timing with reverse (no slam at reset)
      pulseScale.value = withRepeat(
        withTiming(1.04, {
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      )
      // Subtle pulse for tiny card icon: same smooth reverse
      cardScale.value = withRepeat(
        withTiming(1.05, {
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      )
    } else {
      opacity.value = withTiming(0, { duration: 300 })
      pulseScale.value = 1
      cardScale.value = 1
    }
  }, [isVisible, opacity, pulseScale, cardScale])

  const Wrapper = hasLifetimeAccess ? React.Fragment : TouchableWithoutFeedback
  const wrapperProps = hasLifetimeAccess
    ? {}
    : { onPress: onClose }

  return (
    <>
      <Wrapper {...wrapperProps}>
        <Animated.View
          style={[
            animatedStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000",
              zIndex: 10001,
            },
          ]}
        >
          {/* Trial: Back arrow top left (return to chakra day); Chakra icon top right (home) */}
          {!hasLifetimeAccess && (
            <>
              <Pressable
                onPress={() => {
                  addHapticFeedback(HapticStrength.Light)
                  onClose()
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      router.push(`/(chakras)/${currentChakra}` as const)
                    }, 300)
                  })
                }}
                style={{
                  position: "absolute",
                  top: Math.max(insets.top, 16) + 8,
                  left: 16,
                  zIndex: 10003,
                  padding: 8,
                  backgroundColor: "transparent",
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Back"
                accessibilityHint="Return to chakra day"
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color="rgba(255, 255, 255, 0.9)"
                />
              </Pressable>
              <Pressable
                onPress={handleNavigateHome}
                style={{
                  position: "absolute",
                  top: Math.max(insets.top, 16) + 4,
                  right: 16,
                  zIndex: 10003,
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
                accessibilityLabel="Home"
                accessibilityHint="Return to trial home"
              >
                <Image
                  source={require("@/assets/images/7chakras.png")}
                  style={{ width: 22, height: 22, opacity: 0.9 }}
                  resizeMode="contain"
                />
              </Pressable>
            </>
          )}
          {/* Lifetime: X top right only (replaces touch-anywhere-to-close) */}
          {hasLifetimeAccess && (
            <Pressable
              onPress={handleNavigateHome}
              style={{
                position: "absolute",
                top: Math.max(insets.top, 16) + 8,
                right: 16,
                zIndex: 10003,
                padding: 8,
                backgroundColor: "transparent",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close"
              accessibilityHint="Return to home"
            >
              <Ionicons
                name="close"
                size={28}
                color="rgba(255, 255, 255, 0.9)"
              />
            </Pressable>
          )}
          {/* SECTION 1: Main content - centered, stays in upper area */}
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 400,
              alignSelf: "center",
              paddingHorizontal: 24,
            }}
          >
            {/* SECTION 1: Main content - shifted down a bit, never overlaps Section 2 */}
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 52,
                paddingVertical: 20,
                paddingBottom: 320 /* Reserve space for Section 2 so content stays above it */,
              }}
            >
              {/* Day Name */}
              {chakraDay !== undefined && (
                <View className="w-full items-center mb-1">
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    className="text-white/85 text-center"
                    style={{
                      letterSpacing: 1,
                      textShadowColor: "rgba(168, 201, 154, 0.2)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 6,
                    }}
                  >
                    {getDayName(chakraDay)} {getChakraName(chakraDay)} Day
                  </AppText>
                </View>
              )}

              {/* Identity Statement - Seed phrase (e.g. "I Am", "I Speak") */}
              <View className="items-center mb-2">
                <AppText
                  font="koh-santepheap"
                  size="2xl"
                  className="text-center text-white/90"
                  style={{
                    letterSpacing: 1.2,
                    textShadowColor: "rgba(168, 201, 154, 0.3)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 16,
                    lineHeight: 36,
                  }}
                >
                  {identityStatement}
                </AppText>
              </View>

              {/* Chakra Image */}
              {content?.goodbye?.chakraImage && (
                <Pressable
                  onPress={handleNavigateHome}
                  disabled={!hasLifetimeAccess}
                  className="active:opacity-80"
                  accessibilityLabel={
                    hasLifetimeAccess ? "Return home" : undefined
                  }
                  accessibilityHint={
                    hasLifetimeAccess
                      ? "Tap to return to your journey home"
                      : undefined
                  }
                >
                  <View style={styles.chakraImageContainer}>
                    <Animated.View style={pulseAnimatedStyle}>
                      <Image
                        source={content.goodbye.chakraImage}
                        style={styles.chakraImage}
                        resizeMode="contain"
                      />
                    </Animated.View>
                  </View>
                </Pressable>
              )}

              {/* Hero Affirmation Quote - Full daily affirmation (slightly lower / more centered) */}
              <View
                className="mt-5 mb-5 px-6 py-4 rounded-xl w-full"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: 0.5,
                  borderColor: "rgba(168, 201, 154, 0.15)",
                }}
              >
                <AppText
                  font="instrument-regular"
                  size="base"
                  className="text-center text-white/90"
                  style={{
                    letterSpacing: 1.5,
                    lineHeight: 28,
                    fontStyle: "italic",
                    textShadowColor: "rgba(168, 201, 154, 0.4)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 12,
                  }}
                >
                  {heroAffirmation}
                </AppText>
              </View>

              {/* Closing message */}
              <View className="w-full items-center">
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-center text-white/85 mb-2"
                  style={{
                    letterSpacing: 0.8,
                    lineHeight: 22,
                    textShadowColor: "rgba(168, 201, 154, 0.25)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 8,
                  }}
                >
                  Wonderful work, lovely soul. Have a beautiful day.
                </AppText>
                {!isLastDay && (
                  <View className="relative w-full items-center justify-center">
                    <Image
                      source={require("@/assets/images/heartoutline.png")}
                      style={{
                        position: "absolute",
                        width: 24,
                        height: 24,
                        opacity: 0.3,
                        alignSelf: "center",
                      }}
                    />
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      className="text-center text-white/80 italic"
                      style={{
                        letterSpacing: 1,
                        textShadowColor: "rgba(168, 201, 154, 0.2)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 6,
                      }}
                    >
                      We will see you tomorrow.
                    </AppText>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* SECTION 2: Anchored to BOTTOM of screen - direct child of full-screen view */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "rgba(255, 255, 255, 0.08)",
              paddingTop: 24,
              paddingBottom: Math.max(insets.bottom, 24) + 60,
              paddingHorizontal: 24,
            }}
          >
            {chakraCardImage && (
              <Pressable
                onPress={() => setShowCardReveal(true)}
                className="active:opacity-80 mb-5"
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: "rgba(168, 201, 154, 0.5)",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.8,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(139, 115, 85, 0.12)",
                    "rgba(168, 201, 154, 0.08)",
                    "rgba(212, 197, 169, 0.1)",
                    "rgba(139, 115, 85, 0.12)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.3, 0.7, 1]}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderWidth: 0.5,
                    borderColor: "rgba(168, 201, 154, 0.25)",
                    backgroundColor: "rgba(0, 0, 0, 0.15)",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle gradient light overlay - top to bottom */}
                  <LinearGradient
                    colors={[
                      "rgba(255, 255, 255, 0.12)",
                      "rgba(255, 255, 255, 0.04)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 16,
                    }}
                  />
                  {/* Subtle inner glow */}
                  <View
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "20%",
                      right: "20%",
                      height: "30%",
                      backgroundColor: "rgba(168, 201, 154, 0.15)",
                      borderRadius: 8,
                      opacity: 0.6,
                    }}
                  />
                  <View className="flex-row items-center justify-center gap-3 relative z-10">
                    {/* Tiny vibrant card icon */}
                    <Animated.View style={cardAnimatedStyle}>
                      <Image
                        source={chakraCardImage}
                        style={{
                          width: 32,
                          height: 42,
                          borderRadius: 4,
                          borderWidth: 0.5,
                          borderColor: "rgba(168, 201, 154, 0.3)",
                        }}
                        resizeMode="cover"
                      />
                    </Animated.View>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      className="text-white/90"
                      style={{
                        letterSpacing: 0.8,
                        textShadowColor: "rgba(168, 201, 154, 0.5)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 8,
                      }}
                    >
                      Open Your Gift
                    </AppText>
                  </View>
                </LinearGradient>
              </Pressable>
            )}

            {/* Gallery of Gnosis info on Day One */}
            {isDayOne && (
              <View className="mb-5 px-4">
                <AppText
                  font="instrument-regular"
                  size="xs"
                  className="text-center text-white/60"
                  style={{
                    textAlign: "center",
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Your chakra cards are collected in the Gallery
                </AppText>
              </View>
            )}

            {/* Next Day Tease - Trials and Lifetime (different clock copy) */}
            {nextDay !== null && nextChakraName && nextChakraImage && (
              <View
                className="px-4 w-full items-center mt-4 pt-5"
                style={{
                  borderTopWidth: 0.5,
                  borderTopColor: "rgba(255, 255, 255, 0.06)",
                }}
              >
                <AppText
                  font="instrument-medium"
                  size="xs"
                  className="text-center text-white/80 mb-2"
                  style={{
                    textAlign: "center",
                    letterSpacing: 0.6,
                    textShadowColor: "rgba(0, 0, 0, 0.6)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 4,
                  }}
                >
                  Tomorrow: {nextChakraName} Chakra
                </AppText>

                <View className="mb-2 items-center">
                  <Image
                    source={nextChakraImage}
                    style={{ width: 44, height: 44, opacity: 0.7 }}
                    resizeMode="contain"
                  />
                </View>

                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    className="text-white/70 text-center"
                    style={{
                      textAlign: "center",
                      textShadowColor: "rgba(0, 0, 0, 0.5)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    {hasLifetimeAccess
                      ? `Aligns at midnight (lunar time): ${midnightCountdown.hours}:${midnightCountdown.minutes}:${midnightCountdown.seconds}`
                      : `Opens at midnight: ${midnightCountdown.hours}:${midnightCountdown.minutes}:${midnightCountdown.seconds}`}
                  </AppText>
                </View>
                {hasLifetimeAccess && (
                  <AppText
                    font="instrument-italic"
                    size="xs"
                    className="text-white/60 text-center mt-1"
                    style={{
                      textShadowColor: "rgba(0, 0, 0, 0.5)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    You may continue anytime
                  </AppText>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </Wrapper>

      {/* Chakra Card Reveal Modal */}
      <ChakraCardRevealModal
        visible={showCardReveal}
        chakra={currentChakra}
        onClose={() => setShowCardReveal(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  chakraImageContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8, // Reduced from 16
  },
  chakraImage: {
    width: 120,
    height: 120,
  },
})

export default GoodbyeModal
