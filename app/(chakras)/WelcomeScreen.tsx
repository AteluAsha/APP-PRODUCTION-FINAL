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
 * 2. Black overlay (section box): absolute box (left 5%, right 5%, top 35%, bottom 10%). No logo; Enter Path words only at bottom of overlay.
 * 3. Content: Master body copy (four short paragraphs, Instrument Sans 13px, lineHeight 17); bold: Monday, Sunday, map to your soul, Head to Heart. Enter Path label at bottom of overlay.
 * 4. Enter Path: Pressable with "Enter Path" text only; tap to DateSelection (trial) or ChakraHub (lifetime).
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
import { LinearGradient } from "expo-linear-gradient"
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
                  bottom: "10%",
                  backgroundColor: "#000",
                  borderRadius: 12,
                }}
              >
                <View style={{ flex: 1, paddingHorizontal: 18 }}>
                  <View style={{ flex: 1, justifyContent: "center", marginTop: 16 }}>
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
                    accessibilityHint="Opens the 7 Chakras in 7 Days course"
                  >
                    <LinearGradient
                      colors={[
                        "rgba(30,30,30,0.95)",
                        "rgba(18,18,18,0.98)",
                        "rgba(8,8,8,0.95)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 32,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                        minWidth: 160,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        style={{ color: "#fff" }}
                      >
                        Enter Path
                      </AppText>
                    </LinearGradient>
                  </Pressable>
                </View>
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
