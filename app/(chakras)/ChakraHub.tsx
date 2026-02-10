/**
 * APP_2 (Lifetime): Lifetime Home Screen
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
import { View, ScrollView, Pressable, Image } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { Feather } from "@expo/vector-icons"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { Chakra } from "@/types/chakras/Chakra"
import { CHAKRA_TO_DAY, getChakraIndex } from "@/utils/chakraMapping"
import { getCurrentDayOfWeek } from "@/utils/date"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import PulsingButton from "@/components/chakras/PulsingButton"
import { useChakrasData } from "@/hooks/useChakrasData"
import { ActionBar } from "@/components/ActionBar"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { isChakraDayAccessible } from "@/src/services/timegate"
import { useFocusEffect } from "@react-navigation/native"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING } from "@/constants/layout"

const CHAKRA_ORDER: Chakra[] = [
  Chakra.ROOT,
  Chakra.SACRAL,
  Chakra.SOLAR_PLEXUS,
  Chakra.HEART,
  Chakra.THROAT,
  Chakra.THIRD_EYE,
  Chakra.CROWN,
]

const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
]

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

// Static chakra ball images – used when useChakrasData has not yet loaded or fails (e.g. Firestore)
const DAY_INDEX_TO_CHAKRA_IMAGE: Record<number, ReturnType<typeof require>> = {
  0: require("@/assets/images/root.png"),
  1: require("@/assets/images/sacral.png"),
  2: require("@/assets/images/solar.png"),
  3: require("@/assets/images/heart.png"),
  4: require("@/assets/images/throat.png"),
  5: require("@/assets/images/thirdeye.png"),
  6: require("@/assets/images/crown.png"),
}

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
    })),
  )

  // When lifetime user has an active somatic journey (date + started), apply trial-style illumination + opacity
  const inCourseMode = Boolean(courseStartDate && journeyStarted)
  const { completedChakra, clearCompletedChakra } = useCompletedChakraStore()
  const [isGoodbyeModalVisible, setIsGoodbyeModalVisible] = useState(false)

  useEffect(() => {
    if (completedChakra) {
      setIsGoodbyeModalVisible(true)
      const chakraDayIndex = getChakraIndex(completedChakra)
      markChakraCompleted(chakraDayIndex)
    } else {
      setIsGoodbyeModalVisible(false)
    }
  }, [completedChakra, markChakraCompleted])

  const closeGoodbyeModal = () => {
    setIsGoodbyeModalVisible(false)
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

  const hubChakraData = useMemo(() => {
    if (!hasLifetimeAccess) return []
    return CHAKRA_ORDER.map((chakra) => {
      const dayIndex = CHAKRA_TO_DAY[chakra]
      const chakraData = chakrasData.find((c) => c.day === dayIndex)
      return {
        chakra,
        dayIndex,
        name: CHAKRA_NAMES[dayIndex],
        dayName: DAY_NAMES[dayIndex],
        source: chakraData?.source ?? DAY_INDEX_TO_CHAKRA_IMAGE[dayIndex],
        onPress: (_r: any) => {
          router.push(`/(chakras)/${chakra}`)
          addHapticFeedback(HapticStrength.Light)
        },
      }
    })
  }, [hasLifetimeAccess, chakrasData, router])

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (completedChakra) {
          setIsGoodbyeModalVisible(false)
          clearCompletedChakra()
        }
      }
    }, [completedChakra, clearCompletedChakra]),
  )

  const handleNavigateToChakra = (chakra: Chakra) => {
    router.push(`/(chakras)/${chakra}`)
    addHapticFeedback(HapticStrength.Light)
  }

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

  const handleNavigateToDonate = () => {
    router.push("/(chakras)/Donate")
    addHapticFeedback(HapticStrength.Light)
  }

  const hasSomaticJourneyScheduled = Boolean(courseStartDate)

  const getChakraBallProps = (dayIndex: number) => {
    const isUnlocked = inCourseMode
      ? isChakraDayAccessible(
          dayIndex,
          true,
          hasParticipatedDay,
          currentDay,
          allChakrasCompleted,
          true,
        )
      : true
    const isMissedDay =
      inCourseMode &&
      dayIndex < currentDay &&
      !hasParticipatedDay(dayIndex) &&
      !hasCompletedChakra(dayIndex)
    const opacity = inCourseMode
      ? isMissedDay
        ? 0.3
        : dayIndex > currentDay
          ? 0.4
          : 1
      : 1
    return { isUnlocked, opacity }
  }

  const handleBack = () => {
    addHapticFeedback(HapticStrength.Light)
    if (isGoodbyeModalVisible) {
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
      <ActionBar onBackPress={handleBack} />
      {/* Hamburger – Profile (name, photo, Soul School ID). Same position as ChakraHome. */}
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
      {/* Note: GlobalHomeButton handles "chakras 101" link on home screen (top right) */}

      <ScrollView
        style={{ flex: 1, backgroundColor: "#000000" }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING,
          paddingTop: Math.max(insets.top, 20) + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: Day title + tagline – explicit style so layout matches APP1 restoration */}
        <View style={{ alignItems: "center", marginBottom: 32, paddingHorizontal: 16 }}>
          <AppText
            font="instrument-medium"
            size="lg"
            numberOfLines={1}
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.95)",
              letterSpacing: 1,
              textShadowColor: "rgba(168, 201, 154, 0.25)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 6,
            }}
          >
            {DAY_NAMES[currentDay]} – {CHAKRA_NAMES[currentDay]} Day
          </AppText>
          <AppText
            font="instrument-italic"
            size="sm"
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
              marginTop: 8,
              letterSpacing: 0.8,
            }}
          >
            All pathways are open to you
          </AppText>
        </View>

        {/* Chakras Grid - Bottom to top: Root at bottom, Crown at top */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "column-reverse",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Row 1 (DOM first) - Renders at bottom: Root, Sacral, Solar Plexus */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 16,
              }}
            >
              {hubChakraData
                .slice(0, 3)
                .map(({ chakra, dayIndex, name, dayName, source }) => {
                  const { isUnlocked, opacity } = getChakraBallProps(dayIndex)
                  return (
                    <ChakraBallItem
                      key={chakra}
                      chakra={chakra}
                      dayIndex={dayIndex}
                      name={name}
                      dayName={dayName}
                      source={source}
                      currentDay={currentDay}
                      hasEverCompletedChakra={hasEverCompletedChakra}
                      onPress={() => handleNavigateToChakra(chakra)}
                      inCourseMode={inCourseMode}
                      isUnlocked={isUnlocked}
                      opacity={opacity}
                    />
                  )
                })}
            </View>
            {/* Row 2 - Renders middle: Heart, Throat, Third Eye */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 16,
              }}
            >
              {hubChakraData
                .slice(3, 6)
                .map(({ chakra, dayIndex, name, dayName, source }) => {
                  const { isUnlocked, opacity } = getChakraBallProps(dayIndex)
                  return (
                    <ChakraBallItem
                      key={chakra}
                      chakra={chakra}
                      dayIndex={dayIndex}
                      name={name}
                      dayName={dayName}
                      source={source}
                      currentDay={currentDay}
                      hasEverCompletedChakra={hasEverCompletedChakra}
                      onPress={() => handleNavigateToChakra(chakra)}
                      inCourseMode={inCourseMode}
                      isUnlocked={isUnlocked}
                      opacity={opacity}
                    />
                  )
                })}
            </View>
            {/* Row 3 (DOM last) - Renders at top: Crown */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 16,
              }}
            >
              {hubChakraData
                .slice(6, 7)
                .map(({ chakra, dayIndex, name, dayName, source }) => {
                  const { isUnlocked, opacity } = getChakraBallProps(dayIndex)
                  return (
                    <ChakraBallItem
                      key={chakra}
                      chakra={chakra}
                      dayIndex={dayIndex}
                      name={name}
                      dayName={dayName}
                      source={source}
                      currentDay={currentDay}
                      hasEverCompletedChakra={hasEverCompletedChakra}
                      onPress={() => handleNavigateToChakra(chakra)}
                      inCourseMode={inCourseMode}
                      isUnlocked={isUnlocked}
                      opacity={opacity}
                    />
                  )
                })}
            </View>
          </View>
        </View>

        {/* Sanctuary - Menu Options (explicit style for APP2 restoration) */}
        <View style={{ marginTop: 40, marginBottom: 24 }}>
          <AppText
            font="instrument-bold"
            size="lg"
            style={{
              color: "#ffffff",
              marginBottom: 16,
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
                <View style={{ flexDirection: "row", alignItems: "center", position: "relative" as const, zIndex: 10 }}>
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
                <View style={{ flexDirection: "row", alignItems: "center", position: "relative" as const, zIndex: 10 }}>
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
                <View style={{ flexDirection: "row", alignItems: "center", position: "relative" as const, zIndex: 10 }}>
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
                <View style={{ flexDirection: "row", alignItems: "center", position: "relative" as const, zIndex: 10 }}>
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

        {/* Start a new 7 Day Somatic Journey */}
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
              useChakraJourneyStore
                .getState()
                .setLifetimeChosenTimegateJourney(true)
              router.push("/(chakras)/DateSelection")
            }}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            accessibilityLabel={
              hasSomaticJourneyScheduled
                ? "Access course"
                : "Select a start date"
            }
            accessibilityHint="Choose when to begin your 7-day journey"
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
                {hasSomaticJourneyScheduled
                  ? "Access course"
                  : "Select a start date"}
              </AppText>
            </View>
          </Pressable>
        </View>

        {/* Subtle Donation Option - Ready but not activated */}
        {false && ( // Feature flag - set to true when ready to activate
          <Pressable
            onPress={handleNavigateToDonate}
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
              onPress={handleNavigateToDonate}
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

      <GoodbyeModal
        isVisible={isGoodbyeModalVisible}
        onClose={closeGoodbyeModal}
        chakraDay={
          completedChakra ? getChakraIndex(completedChakra) : undefined
        }
        navigateToHubOnHome={false}
      />
    </SafeAreaView>
  )
}

function ChakraBallItem({
  chakra,
  dayIndex,
  name,
  dayName,
  source,
  currentDay,
  hasEverCompletedChakra,
  onPress,
  inCourseMode = false,
  isUnlocked = true,
  opacity = 1,
}: {
  chakra: Chakra
  dayIndex: number
  name: string
  dayName: string
  source: any
  currentDay: number
  hasEverCompletedChakra: (i: number) => boolean
  onPress: () => void
  inCourseMode?: boolean
  isUnlocked?: boolean
  opacity?: number
}) {
  const isCurrentDay = dayIndex === currentDay
  const handlePress = () => {
    if (inCourseMode && !isUnlocked) return
    onPress()
  }
  return (
    <View style={{ alignItems: "center", width: 90, opacity }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
        accessibilityLabel={`${name} Chakra, ${dayName}`}
        accessibilityHint={
          inCourseMode && !isUnlocked
            ? "This day is not yet accessible"
            : `Open ${name} chakra day content`
        }
      >
        <View style={{ alignItems: "center", position: "relative" as const }}>
          <View
            style={{
              position: "relative",
              transform:
                inCourseMode && isCurrentDay ? [{ scale: 1.15 }] : undefined,
            }}
          >
            <PulsingButton
              source={source}
              isAnimating={isCurrentDay && (!inCourseMode || isUnlocked)}
              onPress={handlePress}
              small={true}
            />
            {isCurrentDay &&
              (() => {
                const chakraColor = getChakraColor(dayIndex)
                const hexToRgba = (hex: string, alpha: number) => {
                  const r = parseInt(hex.slice(1, 3), 16)
                  const g = parseInt(hex.slice(3, 5), 16)
                  const b = parseInt(hex.slice(5, 7), 16)
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`
                }
                const gradientColors: [string, string, string] = [
                  hexToRgba(chakraColor, 0.7),
                  hexToRgba(chakraColor, 0.5),
                  hexToRgba(chakraColor, 0.6),
                ]
                return (
                  <View
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: -12,
                      transform: [{ translateY: -4 }],
                      zIndex: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: hexToRgba(chakraColor, 0.12),
                        shadowColor: chakraColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      }}
                    />
                    <LinearGradient
                      colors={[
                        gradientColors[0],
                        gradientColors[1],
                        gradientColors[2],
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 0.5,
                        borderColor: hexToRgba(chakraColor, 0.3),
                        shadowColor: chakraColor,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.4,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Feather
                        name="check"
                        size={4}
                        color="rgba(255, 255, 255, 0.95)"
                        style={{ fontWeight: "bold" }}
                      />
                    </LinearGradient>
                  </View>
                )
              })()}
          </View>
          <AppText
            font="instrument-medium"
            size="xs"
            style={{
              color: "#ffffff",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {name}
          </AppText>
          <AppText
            font="instrument-regular"
            size="xs"
            style={{
              color: "rgba(255,255,255,0.6)",
              marginTop: 2,
              textAlign: "center",
            }}
          >
            {dayName}
          </AppText>
        </View>
      </Pressable>
    </View>
  )
}
