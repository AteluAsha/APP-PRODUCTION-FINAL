/**
 * Welcome Screen - Hero Path Selection (PERMANENT ENTRY)
 *
 * *** LOCKED FOR PRODUCTION ***
 * This screen layout and design are finalized. Do not change layout, overlay positions,
 * typography, or content unless specifically requested by product or when fixing bugs.
 *
 * OPENING SEQUENCE: Splash → Path Selection (this screen) → 7 Chakras in 7 Days course.
 *
 * Flow after Enter Path:
 * - Trial: DateSelection → Waiting Room → Trial Home (or CommitmentGate if post-trial 2)
 * - Lifetime: ChakraHub (full access)
 *
 * ASSETS: Welcomeheader.png (778×456), WelcomeMain.png (750×1000).
 *
 * LAYERS (hard-baked over background; render synchronously so underlying image text never shows):
 * 1. Background: Welcomeheader + WelcomeMain.png (card with baked-in "SEVEN CHAKRAS" strip).
 * 2. Black overlay: absolute box (left 5%, right 5%, top 35%, bottom 28%) over paragraph region only.
 * 3. Content: Editable paragraph (Instrument Sans, 12px, lineHeight 17, bold phrases) inside overlay.
 * 4. Enter Path: Transparent tap target (bottom 52, centered); visual is in WelcomeMain.png.
 *
 * Do not defer or conditionally render the overlay—it must be in the same frame as the Image
 * so the text behind it never flashes.
 */

import React, { useMemo, useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
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
import { SafeAreaView } from "react-native-safe-area-context"
import {
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
  SOMATIC_FADE_IN_MS,
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
const MAIN_WIDTH = 750
const MAIN_HEIGHT = 1000

/** Diameter of the transparent click circle over the Enter Path play button */
const ENTER_PATH_TAP_CIRCLE = 200

export default function WelcomeScreen() {
  const router = useRouter()
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
  const mainAspectRatio = MAIN_HEIGHT / MAIN_WIDTH

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
  const [mainLoaded, setMainLoaded] = useState(false)
  const contentOpacity = useSharedValue(0)
  const bothLoaded = headerLoaded && mainLoaded

  useEffect(() => {
    if (!bothLoaded) return
    contentOpacity.value = withTiming(1, {
      duration: SOMATIC_FADE_IN_MS,
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
      <Animated.View style={[{ flex: 1 }, animatedContentStyle]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
        contentContainerStyle={{
          paddingBottom: 40 + SCROLL_BREATHING_BOTTOM_PADDING,
          alignItems: "center",
        }}
      >
        <GestureDetector gesture={pinchGesture}>
          <Animated.View
            style={[
              animatedZoomStyle,
              { alignItems: "center", width: screenWidth },
            ]}
          >
            <View
              style={{
                width: screenWidth,
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
                width: screenWidth,
                aspectRatio: 1 / mainAspectRatio,
                marginTop: 0,
                position: "relative",
              }}
            >
              <Image
                source={require("@/assets/images/WelcomeMain.png")}
                resizeMode="contain"
                style={{ width: "100%", height: "100%" }}
                onLoad={() => setMainLoaded(true)}
              />
              {/* LOCKED: Overlay must render with Image (no conditional/delay) so text behind never shows */}
              <View
                style={{
                  position: "absolute",
                  left: "5%",
                  right: "5%",
                  top: "35%",
                  bottom: "28%",
                  backgroundColor: "#000",
                  borderRadius: 12,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    paddingHorizontal: 14,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "InstrumentSansRegular",
                      fontSize: 12,
                      color: "#fff",
                      textAlign: "center",
                      lineHeight: 17,
                    }}
                  >
                    A wonderful system to integrate the 7 chakras into your life is
                    to fold them into the 7 days of the week. For this,{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>
                      we start on Monday
                    </Text>{" "}
                    with{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>
                      your root into the Earth
                    </Text>{" "}
                    and{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>
                      work our way to Sunday
                    </Text>{" "}
                    where we spend time in the{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>
                      Soul Chakra of pure bliss
                    </Text>
                    . The chakras are one of the most important aspects of your
                    authentic self and{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>
                      have everything to do with what you do, who you are, and how
                      you feel.
                    </Text>{" "}
                    These spinning balls of energy act as the supercomputers
                    translating the signals from your soul.{" "}
                    <Text style={{ fontFamily: "InstrumentSansBold" }}>
                      Each chakra carries a profound ancestral wisdom
                    </Text>
                    , and they all have a direct impact on your emotions, your
                    deepest wounds, and your ability to co-create life itself.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </ScrollView>

      {/* BAKED IN: Transparent click circle - fixed overlay; positioned lower to leave room and recenter text above */}
      <Pressable
        onPress={handleEnterPath}
        hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
        style={{
          position: "absolute",
          bottom: 52,
          left: (screenWidth - ENTER_PATH_TAP_CIRCLE) / 2,
          width: ENTER_PATH_TAP_CIRCLE,
          height: ENTER_PATH_TAP_CIRCLE,
          borderRadius: ENTER_PATH_TAP_CIRCLE / 2,
          backgroundColor: "transparent",
          zIndex: 99999,
        }}
        accessibilityLabel="Enter Path"
        accessibilityRole="button"
        accessibilityHint="Opens the 7 Chakras in 7 Days course"
      />

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
