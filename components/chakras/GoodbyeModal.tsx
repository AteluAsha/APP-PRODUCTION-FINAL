/**
 * Goodbye Modal - End-of-Day Completion Screen
 *
 * Root chakra goodbye (day 0) is the hero-locked design. Days 1-6 must use the exact same
 * layout, typography, and section structure; no day-specific formatting.
 *
 * LOCKED DESIGN (all 7 days):
 * - Section 1: Day title, identity statement, chakra image, hero affirmation quote, closing message.
 *   Centered in upper area with paddingBottom reserve.
 * - Section 2: Open Your Gift, Tomorrow preview, Home. Generous spacing between sections.
 *
 * ANDROID BUILD LOCKED: The Crown chakra goodbye screen (Sunday Crown Day) is the master design
 * for all Android goodbye screens. Do not change Android layout, style, placement, or spacing
 * (hero affirmation frame, padding between Open Your Gift and Home, raised content) without
 * explicit user request.
 *
 * Content varies by chakraDay (0-6); layout is identical for all 7 days.
 */
import { AppText } from "@/components/AppText"
import React, { useState, useEffect } from "react"
import {
  View,
  Image,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
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
import { Chakra } from "@/types/chakras/Chakra"
import { useRouter } from "expo-router"
import { getChakraFromDay } from "@/utils/chakraMapping"
import { chakraContent } from "@/constants/chakras/content"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { useShallow } from "zustand/react/shallow"
import {
  getChakraName,
  getChakraImage,
  getDayName,
} from "@/constants/chakras/chakraConstants"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { SCROLL_ANDROID_SMOOTH_PROPS } from "@/constants/layout"

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
  const [showIntegrationPrompt, setShowIntegrationPrompt] = useState(true)

  // Get lifetime access status
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((state) => state.hasLifetimeAccess),
  )

  const currentChakra =
    chakraDay !== undefined ? getChakraFromDay(chakraDay) : Chakra.ROOT
  const isLastDay = chakraDay === 6
  const opacity = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const cardScale = useSharedValue(1)

  // Hero affirmations: identity statement + full affirmation (same as main page)
  const content = chakraContent[currentChakra]
  const identityStatement = content?.pills?.identityStatement?.title || ""
  const heroAffirmation = content?.affirmationText || ""

  // Get chakra card image for tiny icon teaser
  const chakraCardImage = content?.elements?.background

  // Open Your Gift: close goodbye and push gift screen (avoids modal-on-modal freeze on Android)
  const handleOpenGift = () => {
    addHapticFeedback(HapticStrength.Light)
    onClose()
    requestAnimationFrame(() => {
      setTimeout(() => {
        router.push(`/(chakras)/GiftChakra?chakra=${currentChakra}` as const)
      }, 300)
    })
  }

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

  // Sync visibility to store so root overlays (PermanentMenuBar, GlobalHomeButton) can hide
  const setGoodbyeVisible = useGoodbyeModalStore((s) => s.setGoodbyeVisible)
  useEffect(() => {
    setGoodbyeVisible(isVisible)
    return () => setGoodbyeVisible(false)
  }, [isVisible, setGoodbyeVisible])

  // When closed (opacity 0), the overlay still exists in the tree. On Android it can
  // capture touches and block the screen. Use pointerEvents so touches pass through when not visible.
  // IMPORTANT: Main content is rendered first, then Back/Home last so they draw on top and receive touches.
  return (
    <>
      <Animated.View
          pointerEvents={isVisible ? "auto" : "none"}
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
          {/* Single ScrollView: hero + flex spacer + gift/footer scroll as one unit (no split panes). */}
          <ScrollView
            style={{ flex: 1, minHeight: 0 }}
            {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop:
                Platform.OS === "android"
                  ? 56 + topInset + 48
                  : 44 + topInset,
              paddingHorizontal: 24,
              paddingBottom: 60 + bottomInset,
              maxWidth: 420,
              alignSelf: "center",
              width: "100%",
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.scrollInnerColumn} collapsable={false}>
            {/* LOCKED SECTION: From top line through "Wonderful work" and affirmationBottomLine.
                Do not move, reflow, or change layout/typography; Crown goodbye is Android master. */}
            <View key="lockedHeroSection" collapsable={false}>
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

            {/* Hero quote in pill frame only (no fill) – above chakra ball for more empty space; slightly larger font */}
            <View style={styles.heroAffirmationPillWrap}>
              <View style={styles.heroAffirmationPill}>
                <AppText
                  font="cormorant-italic"
                  style={[
                    styles.heroAffirmationText,
                    (heroAffirmation.length > 42 || heroAffirmation.includes("\n"))
                      ? styles.heroAffirmationTextLong
                      : null,
                  ]}
                >
                  "{heroAffirmation}"
                </AppText>
              </View>
            </View>

            {/* Chakra image – smaller, tap opens card */}
            {content?.goodbye?.chakraImage &&
              (Platform.OS === "android" ? (
                <TouchableOpacity
                  onPress={handleOpenGift}
                  style={{ alignItems: "center", marginVertical: 18 }}
                  activeOpacity={0.85}
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
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
                </TouchableOpacity>
              ) : (
                <Pressable
                  onPress={handleOpenGift}
                  style={{ alignItems: "center", marginVertical: 18 }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
              ))}

            {/* Closing message – gentle; chakra name + awakening; Crown day ends with Era of The Heart */}
            <AppText
              font="cormorant-italic"
              size="sm"
              style={styles.closingMessageText}
            >
              {`Wonderful work lovely soul, your ${getChakraName(chakraDay ?? 0)} chakra is now awakening. Remember to send it some love.\n\n${chakraDay === 6 ? "Welcome to The Era of The Heart" : "We will see you tomorrow."}`}
            </AppText>

            <View style={styles.affirmationBottomLine} />
            </View>

            {/* Pushes gift/Home toward bottom when content is shorter than viewport */}
            <View style={styles.scrollFooterSpacer} />

            {/* SECTION 2: Gift + Open Your Gift + Home — inside ScrollView (no absolute). */}
            <View
              style={[
                styles.scrollFooter,
                Platform.OS === "android" && styles.scrollFooterAndroid,
                Platform.OS === "ios" && styles.scrollFooterIOS,
              ]}
              collapsable={false}
              pointerEvents="box-none"
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
              style={[
                styles.goldSeparator,
                Platform.OS === "ios" && styles.goldSeparatorIOS,
              ]}
            />
            {chakraCardImage && (
              <View
                style={[
                  styles.giftSectionWrap,
                  Platform.OS === "ios" && styles.giftSectionWrapIOS,
                ]}
                pointerEvents="box-none"
              >
                {Platform.OS === "android" ? (
                  <>
                    <TouchableOpacity
                      onPress={handleOpenGift}
                      style={styles.chakraCardPressable}
                      activeOpacity={0.85}
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      accessibilityLabel="View your chakra card"
                    >
                      <Animated.View style={cardAnimatedStyle}>
                        <Image
                          source={chakraCardImage}
                          style={styles.cardThumb}
                          resizeMode="cover"
                        />
                      </Animated.View>
                    </TouchableOpacity>
                    <View style={styles.giftCardSpacer} />
                    <TouchableOpacity
                      onPress={handleOpenGift}
                      style={styles.openGiftButtonWrap}
                      activeOpacity={0.85}
                      hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
                      accessibilityLabel="Open your gift"
                    >
                      <LinearGradient
                        colors={[
                          "rgba(212, 165, 116, 0.85)",
                          "rgba(212, 165, 116, 0.5)",
                          "rgba(212, 165, 116, 0.85)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.openGiftButtonGradientFrame}
                      >
                        <View style={styles.openGiftButton}>
                          <AppText font="instrument-medium" size="sm" style={{ color: "#fff" }}>
                            Open Your Gift
                          </AppText>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Pressable
                      onPress={handleOpenGift}
                      style={styles.chakraCardPressable}
                      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                      accessibilityLabel="View your chakra card"
                    >
                      <Animated.View style={cardAnimatedStyle}>
                        <Image
                          source={chakraCardImage}
                          style={[styles.cardThumb, styles.cardThumbIOS]}
                          resizeMode="cover"
                        />
                      </Animated.View>
                    </Pressable>
                    <View style={[styles.giftCardSpacer, styles.giftCardSpacerIOS]} />
                    <Pressable
                      onPress={handleOpenGift}
                      style={({ pressed }) => [
                        styles.openGiftButtonWrap,
                        styles.openGiftButtonWrapIOS,
                        pressed && styles.openGiftButtonPressed,
                      ]}
                      hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
                      accessibilityLabel="Open your gift"
                    >
                      <LinearGradient
                        colors={[
                          "rgba(212, 165, 116, 0.85)",
                          "rgba(212, 165, 116, 0.5)",
                          "rgba(212, 165, 116, 0.85)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.openGiftButtonGradientFrame,
                          styles.openGiftButtonGradientFrameIOS,
                        ]}
                      >
                        <View style={[styles.openGiftButton, styles.openGiftButtonIOS]}>
                          <AppText font="instrument-medium" size="sm" style={{ color: "#fff" }}>
                            Open Your Gift
                          </AppText>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </>
                )}
              </View>
            )}

            {/* Explicit spacer so Open Your Gift and Home never appear crushed (all days 1–7) */}
            <View
              style={[
                styles.giftToHomeSpacer,
                Platform.OS === "ios" && styles.giftToHomeSpacerIOS,
              ]}
              pointerEvents="none"
            />

            {/* Home button - primary exit (flows at end of scroll content) */}
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
            </View>
          </ScrollView>
          </>
          )}
          {/* Back only (no top-right X): return to chakra day; Home is in the bottom section. */}
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
        </Animated.View>
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
  heroAffirmationPillWrap: {
    alignSelf: "center",
    width: "100%",
    marginTop: 24,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  heroAffirmationPill: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "transparent",
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignSelf: "center",
    minWidth: "90%",
  },
  heroAffirmationText: {
    fontFamily: "CormorantGaramondItalic",
    fontWeight: "400",
    fontSize: 26,
    lineHeight: 40,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    paddingHorizontal: 8,
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  heroAffirmationTextLong: {
    fontSize: 22,
    lineHeight: 34,
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
    marginBottom: 20,
  },
  goldSeparatorIOS: {
    marginBottom: 12,
  },
  /** Single ScrollView inner column: hero + flex spacer + footer. */
  scrollInnerColumn: {
    flexGrow: 1,
    width: "100%",
  },
  /** Expands between hero and footer so Home sits low on tall viewports. */
  scrollFooterSpacer: {
    flexGrow: 1,
    minHeight: 0,
  },
  /** Footer block inside ScrollView (no position absolute). */
  scrollFooter: {
    width: "100%",
    alignItems: "center",
  },
  scrollFooterAndroid: {
    paddingTop: 10,
  },
  scrollFooterIOS: {
    paddingTop: 12,
  },
  cardThumb: {
    width: 83,
    height: 104,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.35)",
  },
  /** iOS: smaller chakra card so it doesn't cover closing text (all days). */
  cardThumbIOS: {
    width: 50,
    height: 62,
    borderRadius: 8,
  },
  giftSectionWrap: {
    alignItems: "center",
    width: "100%",
  },
  /** iOS: minimal top margin so card/button sit lower with the bottom block. */
  giftSectionWrapIOS: {
    marginTop: 8,
  },
  chakraCardPressable: {
    alignItems: "center",
  },
  /** Explicit spacer between chakra card and Open Your Gift button (not margin) so layout can't override. */
  giftCardSpacer: {
    height: 28,
    width: "100%",
  },
  giftCardSpacerIOS: {
    height: 10,
  },
  openGiftButtonWrap: {
    alignSelf: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  /** iOS: smaller button (all days). */
  openGiftButtonWrapIOS: {
    minHeight: 34,
  },
  /** Fixed-height spacer between Open Your Gift and Home – guarantees visual separation (all days 1–7). */
  giftToHomeSpacer: {
    height: 40,
    width: "100%",
  },
  /** iOS: tighter so Home sits closer to button and stays at bottom. */
  giftToHomeSpacerIOS: {
    height: 24,
  },
  openGiftButtonPressed: {
    opacity: 0.9,
  },
  /** Gold gradient wire frame around Open Your Gift (all days 1–7) */
  openGiftButtonGradientFrame: {
    padding: 2,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  openGiftButtonGradientFrameIOS: {
    padding: 1.5,
  },
  openGiftButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 9999,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  /** iOS: smaller Open Your Gift button (all days). */
  openGiftButtonIOS: {
    paddingVertical: 6,
    paddingHorizontal: 18,
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
    marginTop: 24,
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
