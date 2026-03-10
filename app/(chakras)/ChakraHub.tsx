/**
 * APP_2 (Lifetime): Lifetime Home Screen
 *
 * *** HERO LOCKED FOR PRODUCTION ***
 * Layout, chakra ball size/position, Sanctuary section spacing, and overall
 * design are finalized. Do not change without explicit product approval.
 *
 * This is the home screen for post-paywall users (lifetime access mode).
 * Features:
 * - All chakras accessible (no timegates)
 * - Full feature access
 * - Central hub for navigation
 *
 * ARCHITECTURE: Part of "Two Apps in One" - this is App 2 (Lifetime)
 */

import React, { useMemo, useEffect, useState } from "react"
import { View, Pressable, Image, Platform, Linking, useWindowDimensions } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { getChakraIndex } from "@/utils/chakraMapping"
import { getCurrentDayOfWeek } from "@/utils/date"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useChakrasData } from "@/hooks/useChakrasData"
import { ActionBar } from "@/components/ActionBar"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { ReturnToCourseModal } from "@/components/chakras/ReturnToCourseModal"
import { useFocusEffect } from "@react-navigation/native"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import {
  FLOATING_NAV_SCROLL_BOTTOM_PADDING,
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
  TRIAL_HOME_ROOT_CHAKRA,
} from "@/constants/layout"
import { ARCHETYPE_QUIZ_URL } from "@/constants/sharing"
import { TrialTestFlow } from "@/components/dev/TrialTestFlow"
import { IntegratedProgressStack } from "@/components/chakras/IntegratedProgressStack"

export default function ChakraHub() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const currentDay = getCurrentDayOfWeek()
  const {
    hasEverCompletedChakra,
    completedChakras,
    hasLifetimeAccess,
    markChakraCompleted,
    courseStartDate,
    journeyStarted,
    hasParticipatedDay,
    hasCompletedChakra,
    allChakrasCompleted,
    lifetimeChosenTimegateJourney,
    setLifetimeChosenTimegateJourney,
    clearLifetimeCourseForNewStart,
  } = useChakraJourneyStore(
    useShallow((state) => ({
      hasEverCompletedChakra: state.hasEverCompletedChakra,
      completedChakras: state.completedChakras,
      hasLifetimeAccess: state.hasLifetimeAccess,
      markChakraCompleted: state.markChakraCompleted,
      courseStartDate: state.courseStartDate,
      journeyStarted: state.journeyStarted,
      hasParticipatedDay: state.hasParticipatedDay,
      hasCompletedChakra: state.hasCompletedChakra,
      allChakrasCompleted: state.allChakrasCompleted,
      lifetimeChosenTimegateJourney: state.lifetimeChosenTimegateJourney,
      setLifetimeChosenTimegateJourney: state.setLifetimeChosenTimegateJourney,
      clearLifetimeCourseForNewStart: state.clearLifetimeCourseForNewStart,
    })),
  )

  // When lifetime user has an active somatic journey (date + started) AND is currently in course mode,
  // apply trial-style illumination + opacity. When they exit course mode, lifetimeChosenTimegateJourney
  // is false, so all balls stay unlocked (full App 2).
  const inCourseMode = Boolean(
    courseStartDate && journeyStarted && lifetimeChosenTimegateJourney,
  )
  const { completedChakra, clearCompletedChakra } = useCompletedChakraStore()
  const [showReturnToCourseModal, setShowReturnToCourseModal] = useState(false)
  const isGoodbyeVisible = completedChakra != null

  useEffect(() => {
    if (completedChakra) {
      const chakraDayIndex = getChakraIndex(completedChakra)
      markChakraCompleted(chakraDayIndex)
    }
  }, [completedChakra, markChakraCompleted])

  const closeGoodbyeModal = () => {
    clearCompletedChakra()
  }
  const { chakrasData } = useChakrasData()

  // APP_2 (Lifetime): Safety check - redirect trial users to ChakraHome
  useEffect(() => {
    if (!hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHome")
    }
  }, [hasLifetimeAccess, router])

  // All hooks must run unconditionally (Rules of Hooks)
  const unlockedCardsCount = useMemo(() => {
    if (!hasLifetimeAccess) return 0
    let count = 0
    for (let i = 0; i < 7; i++) {
      if (hasEverCompletedChakra(i)) {
        count++
      }
    }
    return count
  }, [hasLifetimeAccess, hasEverCompletedChakra, completedChakras])

  const { height: windowHeight } = useWindowDimensions()
  const viewportHeight = windowHeight - insets.top - insets.bottom

  // Same shape as ChakraHome: day, affirmation, description, source, onPress for IntegratedProgressStack
  const stackChakraData = useMemo(() => {
    if (chakrasData.length === 0) return []
    return chakrasData.map((item) => ({
      ...item,
      onPress: (r: any) => {
        addHapticFeedback(HapticStrength.Light)
        item.onPress(r)
      },
    }))
  }, [chakrasData])

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (completedChakra) {
          clearCompletedChakra()
        }
      }
    }, [completedChakra, clearCompletedChakra]),
  )

  const handleNavigateToGallery = () => {
    router.push("/(chakras)/GalleryOfGnosis")
    addHapticFeedback(HapticStrength.Light)
  }

  const handleNavigateToCommunity = () => {
    router.push("/CommunityHalls")
    addHapticFeedback(HapticStrength.Light)
  }

  const handleNavigateToAnua = () => {
    addHapticFeedback(HapticStrength.Light)
    useAnuaChatStore.getState().open({ isWaitingRoom: false })
  }

  const handleNavigateToAccountability = () => {
    router.push("/(chakras)/AccountabilityOfAwakening")
    addHapticFeedback(HapticStrength.Light)
  }

  const handleNavigateToContribute = () => {
    router.push("/(chakras)/Contribute")
    addHapticFeedback(HapticStrength.Light)
  }

  // Somatic journey (lifetime): no course → single path to DateSelection; course scheduled → modal: continue or start new
  const hasSomaticJourneyScheduled = Boolean(courseStartDate)

  const handleBack = () => {
    addHapticFeedback(HapticStrength.Light)
    if (isGoodbyeVisible) {
      closeGoodbyeModal()
      return
    }
    if (router.canGoBack()) {
      if (completedChakra) {
        clearCompletedChakra()
      }
      router.back()
    } else {
      // Stay on ChakraHub; do not route to WelcomeScreen (placeholder with back arrow)
      router.replace("/(chakras)/ChakraHub")
    }
  }

  if (!hasLifetimeAccess) {
    return null
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      {__DEV__ && (
        <TrialTestFlow onUnlockNextDay={() => {}} currentDay={currentDay} />
      )}
      <ActionBar onBackPress={handleBack} />
      {/* ScrollView first so overlay rendered after it receives touches on Android */}

      <ScrollView
        style={{ flex: 1, backgroundColor: "#000000" }}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
        contentContainerStyle={{
          flexGrow: 1,
          minHeight: "100%",
          paddingTop: TRIAL_HOME_ROOT_CHAKRA.SCROLL_PADDING_TOP,
          paddingBottom:
            FLOATING_NAV_SCROLL_BOTTOM_PADDING + SCROLL_BREATHING_BOTTOM_PADDING,
        }}
      >
        {/* Viewport-sized block: same placement as trial home (IntegratedProgressStack) */}
        <View
          style={{
            minHeight: viewportHeight,
            maxHeight: viewportHeight,
          }}
        >
          <IntegratedProgressStack
            currentDay={currentDay}
            hasCompletedChakra={hasCompletedChakra}
            hasParticipatedDay={hasParticipatedDay}
            allChakrasCompleted={allChakrasCompleted}
            hasLifetimeAccess={true}
            inCourseMode={inCourseMode}
            showAllChakrasForLifetimeHub={true}
            chakraData={stackChakraData}
            router={router}
          />
        </View>

        {/* Sanctuary and actions – scroll to reveal; title up, first button pushed down for cleaner look */}
        <View style={{ paddingTop: 38, paddingHorizontal: 20, marginBottom: 24 }}>
          <AppText
            font="instrument-bold"
            size="lg"
            style={{
              color: "#ffffff",
              marginBottom: 28,
              textAlign: "center",
              textShadowColor: "rgba(0,0,0,0.3)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
          >
            Sanctuary
          </AppText>

          <View style={{ gap: 12 }}>
            {/* Gallery of Gnosis */}
            <Pressable
              onPress={handleNavigateToGallery}
              accessibilityLabel="Gallery of Gnosis"
              accessibilityHint="View your collected chakra cards"
              style={({ pressed }) => [
                {
                  shadowColor: "#9D4EDD",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.06)",
                  "rgba(157, 78, 221, 0.18)",
                  "rgba(123, 44, 191, 0.22)",
                  "rgba(80, 20, 140, 0.12)",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0, 0.35, 0.7, 1]}
                style={{
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderTopColor: "rgba(255, 215, 0, 0.25)",
                  borderLeftColor: "rgba(157, 78, 221, 0.2)",
                  borderRightColor: "rgba(157, 78, 221, 0.2)",
                  borderBottomColor: "rgba(80, 20, 140, 0.35)",
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "transparent"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.5 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative" as const,
                    zIndex: 10,
                  }}
                >
                  <View
                    style={{
                      padding: 6,
                      borderRadius: 12,
                      overflow: "hidden",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                    }}
                  >
                    <Image
                      source={require("@/assets/images/elementsthroat.png")}
                      style={{ width: 44, height: 44, opacity: 1 }}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={{
                        color: "#ffffff",
                        textShadowColor: "rgba(0,0,0,0.4)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      Gallery of Gnosis
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.65)", marginTop: 2 }}
                    >
                      Your collected chakra cards
                    </AppText>
                  </View>
                  {unlockedCardsCount > 0 && (
                    <View
                      style={{
                        backgroundColor: "rgba(255, 215, 0, 0.25)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 9999,
                        marginRight: 8,
                        borderWidth: 0.5,
                        borderColor: "rgba(255, 215, 0, 0.4)",
                      }}
                    >
                      <AppText
                        font="instrument-bold"
                        size="xs"
                        style={{ color: "rgba(254, 243, 199, 1)" }}
                      >
                        {unlockedCardsCount}
                      </AppText>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </View>
              </LinearGradient>
            </Pressable>

            {/* Social Sanctuary */}
            <Pressable
              onPress={handleNavigateToCommunity}
              accessibilityLabel="Social Sanctuary"
              accessibilityHint="Connect with others on the path"
              style={({ pressed }) => [
                {
                  shadowColor: "#87AE73",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.05)",
                  "rgba(135, 174, 115, 0.18)",
                  "rgba(107, 142, 90, 0.22)",
                  "rgba(70, 110, 65, 0.12)",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0, 0.35, 0.7, 1]}
                style={{
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderTopColor: "rgba(168, 201, 154, 0.25)",
                  borderLeftColor: "rgba(135, 174, 115, 0.2)",
                  borderRightColor: "rgba(135, 174, 115, 0.2)",
                  borderBottomColor: "rgba(70, 110, 65, 0.35)",
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.07)", "transparent"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.5 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative" as const,
                    zIndex: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(135, 174, 115, 0.35)",
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <Image
                      source={require("@/assets/images/Hero_tulip_LOGO_MASTER.png")}
                      style={{ width: 44, height: 44, opacity: 1 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={{
                        color: "#ffffff",
                        textShadowColor: "rgba(0,0,0,0.4)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      Social Sanctuary
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.65)", marginTop: 2 }}
                    >
                      Connect with others on the path
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </View>
              </LinearGradient>
            </Pressable>

            {/* Talk to Anua */}
            <Pressable
              onPress={handleNavigateToAnua}
              accessibilityLabel="Talk to Anua"
              accessibilityHint="Your guide and companion"
              style={({ pressed }) => [
                {
                  shadowColor: "#9D4EDD",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.06)",
                  "rgba(157, 78, 221, 0.18)",
                  "rgba(123, 44, 191, 0.22)",
                  "rgba(80, 20, 140, 0.12)",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0, 0.35, 0.7, 1]}
                style={{
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderTopColor: "rgba(185, 120, 255, 0.25)",
                  borderLeftColor: "rgba(157, 78, 221, 0.2)",
                  borderRightColor: "rgba(157, 78, 221, 0.2)",
                  borderBottomColor: "rgba(80, 20, 140, 0.35)",
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "transparent"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.5 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative" as const,
                    zIndex: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(185, 120, 255, 0.35)",
                      padding: 10,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        opacity: 1,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={{
                        color: "#ffffff",
                        textShadowColor: "rgba(0,0,0,0.4)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      Talk to Anua
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.65)", marginTop: 2 }}
                    >
                      Your guide and companion
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </View>
              </LinearGradient>
            </Pressable>

            {/* Accountability of Awakening */}
            <Pressable
              onPress={handleNavigateToAccountability}
              accessibilityLabel="Accountability of Awakening"
              accessibilityHint="Track your journey progress"
              style={({ pressed }) => [
                {
                  shadowColor: "#6A1B9A",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.05)",
                  "rgba(106, 27, 154, 0.18)",
                  "rgba(75, 0, 130, 0.22)",
                  "rgba(55, 0, 95, 0.12)",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0, 0.35, 0.7, 1]}
                style={{
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderTopColor: "rgba(157, 78, 221, 0.25)",
                  borderLeftColor: "rgba(106, 27, 154, 0.2)",
                  borderRightColor: "rgba(106, 27, 154, 0.2)",
                  borderBottomColor: "rgba(55, 0, 95, 0.35)",
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.07)", "transparent"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.5 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative" as const,
                    zIndex: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.25)",
                      padding: 10,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="heart" size={28} color="#34D399" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={{
                        color: "#ffffff",
                        textShadowColor: "rgba(0,0,0,0.4)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      Accountability of Awakening
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(255,255,255,0.65)", marginTop: 2 }}
                    >
                      Track your journey progress
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Start a new 7 Day Somatic Journey: no course → DateSelection only; course active → modal (continue or start new) */}
        <View style={{ marginTop: 32 }}>
          <AppText
            font="instrument-semibold"
            size="base"
            style={{
              color: "#ffffff",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Start a new 7 Day Somatic Journey
          </AppText>
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Medium)
              if (hasSomaticJourneyScheduled) {
                setShowReturnToCourseModal(true)
              } else {
                setLifetimeChosenTimegateJourney(true)
                router.push("/(chakras)/DateSelection")
              }
            }}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            accessibilityLabel="Start a new 7 Day Journey"
            accessibilityHint={
              hasSomaticJourneyScheduled
                ? "Continue current course or start a new one"
                : "Choose when to begin your 7-day journey"
            }
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(212, 165, 116, 0.4)",
                backgroundColor: "rgba(212, 165, 116, 0.08)",
              }}
            >
              <AppText
                font="instrument-medium"
                size="sm"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Start a new 7 Day Journey
              </AppText>
            </View>
          </Pressable>
        </View>

        {/* Discover Your Ego Archetype – own section with clear spacing so it never sticks to the journey button above */}
        <View style={{ marginTop: 40, marginBottom: 24, alignItems: "center" }}>
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              Linking.openURL(ARCHETYPE_QUIZ_URL)
            }}
            style={({ pressed }) => [
              {
                paddingVertical: 12,
                paddingHorizontal: 28,
                borderRadius: 24,
                backgroundColor: "rgba(28, 28, 28, 0.95)",
                borderWidth: 1,
                borderColor: "rgba(212, 165, 116, 0.6)",
                minHeight: 44,
                justifyContent: "center",
                alignItems: "center",
              },
              pressed && { opacity: 0.9 },
            ]}
            accessibilityLabel="Discover Your Ego Archetype"
            accessibilityHint="Open archetype quiz in browser"
          >
            <AppText
              font="cormorant-regular"
              size="sm"
              style={{ color: "rgba(212, 165, 116, 0.95)" }}
            >
              Discover Your Ego Archetype
            </AppText>
          </Pressable>
        </View>

        {/* Subtle Donation Option - Ready but not activated */}
        {false && ( // Feature flag - set to true when ready to activate
          <Pressable
            onPress={handleNavigateToContribute}
            className="active:opacity-80 mt-6"
          >
            <View className="items-center py-3 px-6 border border-[#8B7355]/30 rounded-lg bg-[#5A4A3A]/10">
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-[#A8C99A]/70 text-center"
              >
                Support our mission
              </AppText>
            </View>
          </Pressable>
        )}

        {/* Subtle Footer Link */}
        {false && ( // Feature flag - set to true when ready to activate
          <View className="mt-8 pt-6 border-t border-white/10">
            <Pressable
              onPress={handleNavigateToContribute}
              className="active:opacity-70"
            >
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-[#8B7355]/60 text-center"
                style={{ textDecorationLine: "underline" }}
              >
                Make a tax-deductible donation
              </AppText>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Profile overlay after ScrollView so it receives touches on Android */}
      <Pressable
        onPress={() => {
          addHapticFeedback(HapticStrength.Light)
          useProfileSheetStore.getState().open()
        }}
        style={{
          position: "absolute",
          top: Math.max(insets.top, 8) + 12,
          right: 16,
          zIndex: 100,
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
        accessibilityLabel="Profile menu"
        accessibilityHint="View your profile and Soul School ID"
      >
        <Ionicons name="menu" size={22} color="rgba(255, 255, 255, 0.9)" />
      </Pressable>

      <GoodbyeModal
        isVisible={isGoodbyeVisible}
        onClose={closeGoodbyeModal}
        chakraDay={
          completedChakra ? getChakraIndex(completedChakra) : undefined
        }
        navigateToHubOnHome={false}
      />

      <ReturnToCourseModal
        visible={showReturnToCourseModal}
        onClose={() => setShowReturnToCourseModal(false)}
        onContinueCurrent={() => {
          setLifetimeChosenTimegateJourney(true)
          router.replace("/(chakras)/ChakraHome")
        }}
        onStartNew={() => {
          clearLifetimeCourseForNewStart()
          router.replace("/(chakras)/DateSelection")
        }}
      />
    </SafeAreaView>
  )
}
