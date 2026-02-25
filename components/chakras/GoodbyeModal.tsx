/**
 * Goodbye Modal - End-of-Day Completion Screen
 *
 * Root chakra goodbye (day 0) is the hero-locked design. Days 1-6 must use the exact same
 * layout, typography, and section structure; no day-specific formatting.
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
import { SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
import { AppText } from "@/components/AppText"
import React, { useState, useEffect } from "react"
import {
  View,
  Image,
  useWindowDimensions,
  Pressable,
  StyleSheet,
  ScrollView,
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
  onNavigateHome,
}: {
  isVisible: boolean
  onClose: () => void
  chakraDay?: number
  /** When false, Home just closes (stay on current screen). When true (lifetime, non-course), Home navigates to ChakraHub. */
  navigateToHubOnHome?: boolean
  /** When provided (e.g. from day screen), Home button calls this instead of internal nav. Use to close + replace without flicker. */
  onNavigateHome?: () => void
}) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const topInset = Math.max(insets.top, 12)
  const bottomInset = Math.max(insets.bottom, 24)
  const [showCardReveal, setShowCardReveal] = useState(false)
  const [showIntegrationPrompt, setShowIntegrationPrompt] = useState(true)

  // Get lifetime access status
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((state) => state.hasLifetimeAccess),
  )

  const currentChakra =
    chakraDay !== undefined ? getChakraFromDay(chakraDay) : Chakra.ROOT
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
  const nextContent =
    nextDay !== null ? chakraContent[getChakraFromDay(nextDay)] : null

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
    if (onNavigateHome) {
      onNavigateHome()
      return
    }
    onClose()
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (hasLifetimeAccess) {
          if (navigateToHubOnHome) {
            useChakraJourneyStore
              .getState()
              .setLifetimeChosenTimegateJourney(false)
            router.replace("/(chakras)/ChakraHub")
          }
          // else: stay on current screen (course mode ChakraHome) – just close
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

  // Reset integration prompt when modal opens; auto-advance after 2.5s
  useEffect(() => {
    if (isVisible) {
      setShowIntegrationPrompt(true)
      const t = setTimeout(() => setShowIntegrationPrompt(false), 2500)
      return () => clearTimeout(t)
    }
  }, [isVisible])

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

  return (
    <>
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
          {/* Back arrow: navigate to chakra day first so home screen never flashes */}
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              router.replace(`/(chakras)/${currentChakra}` as const)
              onClose()
            }}
            style={{
              position: "absolute",
              top: topInset,
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
          {/* Top right: Home/Close (lifetime = X, trial = chakra icon) */}
          <Pressable
            onPress={handleNavigateHome}
            style={{
              position: "absolute",
              top: topInset,
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
            accessibilityLabel={hasLifetimeAccess ? "Close" : "Home"}
            accessibilityHint="Return to home"
          >
            {hasLifetimeAccess ? (
              <Ionicons
                name="close"
                size={28}
                color="rgba(255, 255, 255, 0.9)"
              />
            ) : (
              <Image
                source={require("@/assets/images/7chakras.png")}
                style={{ width: 22, height: 22, opacity: 0.9 }}
                resizeMode="contain"
              />
            )}
          </Pressable>
          {/* Integration pause: "Take a breath..." – show first, then main content */}
          {showIntegrationPrompt ? (
            <Pressable
              onPress={() => setShowIntegrationPrompt(false)}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 32,
              }}
            >
              <AppText
                font="cormorant-italic"
                size="xl"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  textAlign: "center",
                  lineHeight: 32,
                  fontStyle: "italic",
                }}
              >
                Take a breath and feel what you've received today
              </AppText>
            </Pressable>
          ) : (
          <>
          {/* SECTION 1: Scrollable main content - clear hierarchy, no wrapping */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 32 + topInset,
              paddingBottom:
                24 +
                SCROLL_BREATHING_BOTTOM_PADDING +
                40 /* extra gap above chakra card so "Wonderful work..." isn't pushed into it (match day 1) */,
              paddingHorizontal: 24,
              maxWidth: 420,
              alignSelf: "center",
              width: "100%",
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Same formatting as hero AffirmationSection (no "Affirmation" label) */}
            <View style={styles.affirmationTopLine} />
            {chakraDay !== undefined && (
              <AppText
                font="cormorant-regular"
                size="xs"
                style={styles.affirmationLabel}
              >
                {getDayName(chakraDay)} {getChakraName(chakraDay)} Day
              </AppText>
            )}

            {/* Identity "I Am" – hero affirmation style (match AffirmationSection) */}
            <AppText
              font="cormorant-italic"
              style={styles.heroAffirmationText}
            >
              {identityStatement}
            </AppText>

            {/* Chakra image – smaller, tap opens card */}
            {content?.goodbye?.chakraImage && (
              <Pressable
                onPress={() => setShowCardReveal(true)}
                style={{ alignItems: "center", marginVertical: 18 }}
                accessibilityLabel="View your chakra card"
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

            {/* Hero quote – hero style; scale down font when long so days 2–7 match day 1 visual harmony */}
            <AppText
              font="cormorant-italic"
              style={[
                styles.heroAffirmationText,
                (heroAffirmation.length > 42 || heroAffirmation.includes("\n"))
                  ? styles.heroAffirmationTextLong
                  : null,
              ]}
            >
              {heroAffirmation}
            </AppText>

            {/* Closing message – gentle, slightly smaller; more space from hero above, less below */}
            <AppText
              font="cormorant-italic"
              size="sm"
              style={styles.closingMessageText}
            >
              {content?.goodbye?.closingMessage ??
                "Wonderful work, lovely soul. Have a beautiful day."}
            </AppText>

            <View style={styles.affirmationBottomLine} />
          </ScrollView>

          {/* SECTION 2: Bottom - Gift + Tomorrow + Home (own section) */}
          <View
            style={[
              styles.bottomSection,
              {
                paddingBottom: bottomInset + 24,
              },
            ]}
          >
            {/* Subtle gold separator above bottom section */}
            <LinearGradient
              colors={[
                "transparent",
                "rgba(212, 165, 116, 0.2)",
                "rgba(212, 165, 116, 0.14)",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goldSeparator}
            />
            {chakraCardImage && (
              <Pressable
                onPress={() => setShowCardReveal(true)}
                style={{ alignItems: "center" }}
              >
                <Animated.View style={cardAnimatedStyle}>
                  <Image
                    source={chakraCardImage}
                    style={styles.cardThumb}
                    resizeMode="cover"
                  />
                </Animated.View>
                <View style={styles.openGiftButtonWrap}>
                  <View style={styles.openGiftButton}>
                    <AppText font="instrument-medium" size="sm" style={{ color: "#fff" }}>
                      Open Your Gift
                    </AppText>
                  </View>
                </View>
              </Pressable>
            )}

            {/* Preview: tomorrow's line (next day's closingSubline); time subtle below */}
            {!isLastDay && nextDay !== null && (
              <View style={styles.tomorrowBlock}>
                {nextContent?.goodbye?.closingSubline ? (
                  <AppText
                    font="cormorant-italic"
                    size="base"
                    style={styles.tomorrowPreviewLine}
                  >
                    {nextContent.goodbye.closingSubline}
                  </AppText>
                ) : (
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={[styles.tomorrowPreviewLine, { fontStyle: "italic" }]}
                  >
                    We will see you tomorrow.
                  </AppText>
                )}
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.65)" />
                  <AppText font="instrument-regular" size="xs" style={styles.timeText}>
                    {hasLifetimeAccess
                      ? `Aligns at midnight ${midnightCountdown.hours}:${midnightCountdown.minutes}:${midnightCountdown.seconds}`
                      : `Opens at midnight ${midnightCountdown.hours}:${midnightCountdown.minutes}:${midnightCountdown.seconds}`}
                  </AppText>
                </View>
                {hasLifetimeAccess && (
                  <AppText font="instrument-italic" size="xs" style={styles.continueAnytime}>
                    You may continue anytime
                  </AppText>
                )}
              </View>
            )}

            {/* Home button - primary exit */}
            <Pressable
              onPress={handleNavigateHome}
              style={({ pressed }) => [
                styles.homeButton,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <AppText font="instrument-medium" size="base" style={{ color: "#fff" }}>
                Home
              </AppText>
            </Pressable>
          </View>
          </>
          )}
        </Animated.View>

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
  affirmationTopLine: {
    height: 1,
    width: 48,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignSelf: "center",
    marginBottom: 12,
  },
  affirmationLabel: {
    fontFamily: "CormorantGaramond",
    fontWeight: "300",
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    marginBottom: 14,
  },
  heroAffirmationText: {
    fontFamily: "CormorantGaramondItalic",
    fontWeight: "400",
    fontSize: 24,
    lineHeight: 38,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  heroAffirmationTextLong: {
    fontSize: 20,
    lineHeight: 30,
  },
  closingMessageText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 22,
    marginBottom: 12,
  },
  affirmationBottomLine: {
    height: 1,
    width: 48,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignSelf: "center",
    marginTop: 8,
  },
  chakraImageContainer: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  chakraImage: {
    width: 88,
    height: 88,
  },
  goldSeparator: {
    height: 1,
    width: "100%",
    marginBottom: 24,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  cardThumb: {
    width: 64,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.35)",
  },
  openGiftButtonWrap: {
    marginTop: 20,
  },
  openGiftButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.4)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  tomorrowBlock: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 165, 116, 0.12)",
  },
  tomorrowPreviewLine: {
    textAlign: "center",
    color: "rgba(255,255,255,0.88)",
    lineHeight: 26,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  timeText: {
    color: "rgba(255,255,255,0.6)",
  },
  continueAnytime: {
    color: "rgba(255,255,255,0.55)",
    marginTop: 6,
  },
  homeButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.5)",
    backgroundColor: "rgba(168, 201, 154, 0.2)",
    minWidth: 160,
    alignItems: "center",
  },
})

export default GoodbyeModal
