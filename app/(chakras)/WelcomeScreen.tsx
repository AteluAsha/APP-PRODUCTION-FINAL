/**
 * Welcome Screen - Hero Path Selection (PERMANENT ENTRY)
 *
 * *** LOCKED FOR PRODUCTION ***
 * This screen layout and design are finalized. Do not change layout, overlay positions,
 * typography, or content unless specifically requested by product or when fixing bugs.
 *
 * OPENING SEQUENCE: Splash → Path Selection (this screen) → 7 Chakras: The Map from Self to Soul course.
 *
 * Flow after Enter Path:
 * - Trial: DateSelection → Waiting Room → Trial Home (or CommitmentGate if post-trial 2)
 * - Lifetime: ChakraHub (full access)
 *
 * ASSETS: Welcomeheader.png (778×456); course title strip is SoulSchool_welcomeTitleLogo_7CHAKRAS_THE_MAP_FROM_SELF_TO_SOUL_v2.png (not baked into WelcomeMain).
 *
 * LAYERS:
 * 1. Top: Welcomeheader (hero intro strip).
 * 2. "OPEN PATHWAYS" section title (aligned with card inset).
 * 3. Bordered card: banner image flush to inner top/sides (parent clips corners); padded text + Enter Path below.
 *
 * Course copy and banner render in the same frame so nothing flashes before load (opacity gate on both images).
 */

import React, { useMemo, useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import {
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
  SOMATIC_WELCOME_ENTRANCE_MS,
} from "@/constants/layout"
import { useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { useShallow } from "zustand/react/shallow"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { AppText } from "@/components/AppText"

const PINCH_MIN_SCALE = 1
const PINCH_MAX_SCALE = 3

const HEADER_WIDTH = 778
const HEADER_HEIGHT = 456

/** Landscape course banner (~2.5:1); height derived from width. */
const WELCOME_TITLE_BANNER_ASPECT = 2.5

/** Lower block (OPEN PATHWAYS + white card) width vs (screenWidth - side gutters). */
const WELCOME_LOWER_SECTION_WIDTH_RATIO = 0.95

const WELCOME_CARD_BASE_RADIUS = 28

/** Inset for body copy + button only (not the banner). */
const WELCOME_CARD_BODY_PADDING = 20

/** Nudge hero upward slightly for less dead space under status bar (px; stays below notch on most devices). */
const WELCOME_HERO_TOP_NUDGE = 10

/** Space between hero strip and OPEN PATHWAYS row */
const WELCOME_AFTER_HERO_SPACING = 36
/** Space between OPEN PATHWAYS title and white course card */
const WELCOME_OPEN_PATHWAYS_TO_CARD = 14

/**
 * Android: extra space before the bordered course card only (hero + OPEN PATHWAYS row unchanged).
 * Pushes the content card lower in the frame without shifting the hero strip.
 */
const WELCOME_ANDROID_CONTENT_CARD_TOP_OFFSET = 40

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const { hasLifetimeAccess, completedTrialCourses = 0 } = useChakraJourneyStore(
    useShallow((state) => ({
      hasLifetimeAccess: state.hasLifetimeAccess,
      completedTrialCourses: state.completedTrialCourses,
    })),
  )

  const isFirstLaunch = useFirstLaunchStore((s) => s.isFirstLaunch)
  const bothTrialsActuallyCompleted =
    !hasLifetimeAccess && completedTrialCourses >= 2
  // Only show "Ready to continue your journey?" for returning users who've completed both trials—never on first app open.
  const showPostTrialShortcut = bothTrialsActuallyCompleted && !isFirstLaunch

  const handleEnterPath = () => {
    addHapticFeedback(HapticStrength.Medium)
    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
    } else {
      router.push("/(chakras)/DateSelection")
    }
  }

  const handleReadyToContinue = () => {
    addHapticFeedback(HapticStrength.Light)
    router.replace("/(chakras)/SimpleGraceTransition")
  }

  const headerAspectRatio = HEADER_HEIGHT / HEADER_WIDTH

  const lowerSectionWidth = useMemo(
    () =>
      Math.max(
        260,
        Math.round((screenWidth - 32) * WELCOME_LOWER_SECTION_WIDTH_RATIO),
      ),
    [screenWidth],
  )
  const scaledCardRadius = Math.round(WELCOME_CARD_BASE_RADIUS * WELCOME_LOWER_SECTION_WIDTH_RATIO)
  const scaledEnterMinOuter = Math.round(160 * WELCOME_LOWER_SECTION_WIDTH_RATIO)

  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((e) => {
          const next = savedScale.value * e.scale
          scale.value = Math.min(PINCH_MAX_SCALE, Math.max(PINCH_MIN_SCALE, next))
        })
        .onEnd(() => {
          savedScale.value = scale.value
          if (scale.value <= PINCH_MIN_SCALE) {
            scale.value = withSpring(PINCH_MIN_SCALE)
            savedScale.value = PINCH_MIN_SCALE
          }
        }),
    [],
  )
  const animatedZoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  // Somatic flow: wait for both images to load, then fade in the whole screen as one (fixes Android staggered load)
  const [headerLoaded, setHeaderLoaded] = useState(false)
  const [bannerLoaded, setBannerLoaded] = useState(false)
  const contentOpacity = useSharedValue(0)
  const bothLoaded = headerLoaded && bannerLoaded

  useEffect(() => {
    if (!bothLoaded) return
    contentOpacity.value = withTiming(1, {
      duration: SOMATIC_WELCOME_ENTRANCE_MS,
      easing: Easing.out(Easing.ease),
    })
  }, [bothLoaded, contentOpacity])

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }))

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000" }}
      edges={["top", "bottom"]}
    >
      <Animated.View
        style={[{ flex: 1, overflow: "visible" as const }, animatedContentStyle]}
      >
      <ScrollView
        style={{ flex: 1, overflow: "visible" }}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: 0,
          paddingBottom:
            40 +
            SCROLL_BREATHING_BOTTOM_PADDING +
            insets.bottom +
            32,
        }}
      >
        <GestureDetector gesture={pinchGesture}>
          <Animated.View
            style={[
              animatedZoomStyle,
              {
                alignItems: "center",
                width: screenWidth,
                overflow: "visible" as const,
              },
            ]}
          >
            <View
              style={{
                width: screenWidth,
                marginTop: -WELCOME_HERO_TOP_NUDGE,
                aspectRatio: 1 / headerAspectRatio,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: "hidden",
              }}
            >
              <Image
                source={require("@/assets/images/Welcomeheader.png")}
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
                onLoad={() => setHeaderLoaded(true)}
              />
            </View>

            <View
              style={{
                width: lowerSectionWidth,
                alignSelf: "center",
                marginTop: WELCOME_AFTER_HERO_SPACING,
                marginBottom: WELCOME_OPEN_PATHWAYS_TO_CARD,
              }}
            >
              <AppText
                font="instrument-semibold"
                size="xs"
                accessibilityRole="header"
                accessibilityLabel="Open pathways"
                style={{
                  color: "rgba(255, 255, 255, 0.88)",
                  textAlign: "center",
                  letterSpacing: 5.5,
                  textTransform: "uppercase",
                }}
              >
                Open pathways
              </AppText>
            </View>

            <View
              style={{
                width: lowerSectionWidth,
                alignSelf: "center",
                marginTop:
                  Platform.OS === "android"
                    ? WELCOME_ANDROID_CONTENT_CARD_TOP_OFFSET
                    : 0,
                marginBottom: 8,
                backgroundColor: "#000",
                borderWidth: 1,
                borderColor: "#FFFFFF",
                borderRadius: scaledCardRadius,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: "100%",
                  aspectRatio: WELCOME_TITLE_BANNER_ASPECT,
                  backgroundColor: "#000",
                }}
              >
                <Image
                  source={require("@/assets/images/SoulSchool_welcomeTitleLogo_7CHAKRAS_THE_MAP_FROM_SELF_TO_SOUL_v2.png")}
                  resizeMode="cover"
                  style={{ width: "100%", height: "100%" }}
                  onLoad={() => setBannerLoaded(true)}
                />
              </View>

              <View
                style={{
                  padding: WELCOME_CARD_BODY_PADDING,
                  backgroundColor: "#000",
                }}
              >
                <View style={{ justifyContent: "center" }}>
                  <Text
                    style={{
                      fontFamily: "InstrumentSansRegular",
                      fontSize: 13,
                      color: "#fff",
                      textAlign: "center",
                      lineHeight: 21,
                      marginBottom: 20,
                    }}
                  >
                    This journey begins on{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>Monday</Text>
                    {" "}at your root and ends on{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>Sunday</Text>
                    {" "}in pure bliss.
                  </Text>
                  <Text
                    style={{
                      fontFamily: "InstrumentSansRegular",
                      fontSize: 13,
                      color: "#fff",
                      textAlign: "center",
                      lineHeight: 21,
                      marginBottom: 20,
                    }}
                  >
                    The chakras are the supercomputers of your soul, translating
                    ancestral wisdom into how you feel, act, and co-create your
                    life.
                  </Text>
                  <Text
                    style={{
                      fontFamily: "InstrumentSansRegular",
                      fontSize: 13,
                      color: "#fff",
                      textAlign: "center",
                      lineHeight: 21,
                      marginBottom: 20,
                    }}
                  >
                    This is not just about the chakras, this is about how your
                    chakras reveal the{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>map to your soul</Text>
                    .
                  </Text>
                  <Text
                    style={{
                      fontFamily: "InstrumentSansRegular",
                      fontSize: 13,
                      color: "#fff",
                      textAlign: "center",
                      lineHeight: 21,
                    }}
                  >
                    The Path from{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>Head to Heart</Text>
                    {" "}begins...
                  </Text>
                </View>
                <Pressable
                  onPress={handleEnterPath}
                  style={{ alignItems: "center", marginTop: 16 }}
                  accessibilityLabel="Enter Path"
                  accessibilityRole="button"
                  accessibilityHint="Opens 7 Chakras: The Map from Self to Soul"
                >
                  <ImageBackground
                    source={require("@/assets/images/EnterPath_BgButtonImage.png")}
                    resizeMode="cover"
                    imageStyle={{ borderRadius: 14 }}
                    style={{
                      borderRadius: 14,
                      overflow: "hidden",
                      paddingVertical: 14,
                      paddingHorizontal: 32,
                      minWidth: scaledEnterMinOuter,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AppText
                      font="instrument-semibold"
                      size="sm"
                      style={{
                        color: "#ffffff",
                        textShadowColor: "rgba(0, 0, 0, 0.92)",
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 8,
                      }}
                    >
                      Enter Path
                    </AppText>
                  </ImageBackground>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </ScrollView>

      {/* Subtle shortcut for post-trial users only: skip DateSelection, go to Simple Grace. Never on first launch. */}
      {showPostTrialShortcut && (
        <Pressable
          onPress={handleReadyToContinue}
          style={{
            position: "absolute",
            bottom: 48,
            left: 24,
            right: 24,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            zIndex: 99998,
          }}
          accessibilityLabel="Ready to continue your journey"
          accessibilityRole="button"
          accessibilityHint="Go to energy exchange and paywall"
        >
          <AppText
            font="instrument-regular"
            size="xs"
            style={{
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
            }}
          >
            Ready to continue your journey?
          </AppText>
        </Pressable>
      )}
      </Animated.View>
    </SafeAreaView>
  )
}
