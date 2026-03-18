/**
 * Integrated Progress Stack Component
 *
 * ARCHITECTURE: "Two Apps in One"
 * - APP_1 (Trial): Progressive reveal, teaser logic, missed day handling
 * - APP_2 (Lifetime): All chakras visible and interactive (not used in lifetime mode)
 *
 * This component is primarily for APP_1 (Trial mode).
 * APP_2 (Lifetime) uses ChakraHub instead.
 *
 * LOCKED (trials home): The 7 chakra balls are pinned to the base of the
 * viewport (minHeight/maxHeight: viewportHeight, justifyContent: "flex-end",
 * paddingBottom: TRIAL_HOME_ROOT_CHAKRA.BOTTOM_PADDING). They must never be
 * centered; this placement is non-negotiable.
 */

import React, { useState, useEffect } from "react"
import { View, StyleSheet, Image, Platform, useWindowDimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { tv } from "tailwind-variants"
import { AppText } from "@/components/AppText"
import PulsingButton from "@/components/chakras/PulsingButton"
import { Router } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import {
  isChakraDayAccessible,
  isTrialChakraAccessible,
} from "@/src/services/timegate"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import {
  DAY_NAMES,
  CHAKRA_NAMES,
  getDayName,
  getChakraName,
  getChakraImage,
  getChakraColor,
} from "@/constants/chakras/chakraConstants"
import {
  TRIAL_HOME_ROOT_CHAKRA,
  SCROLL_BREATHING_BOTTOM_PADDING,
  LIFETIME_HUB_STACK_RAISE_IOS,
  ROOT_BOTTOM_OFFSET_LIFETIME_HUB_IOS,
  LIFETIME_HUB_CHAKRA_BALL_DIVISOR,
} from "@/constants/layout"
import { getTimeRemaining } from "@/utils/date"
import { formatCountdown } from "@/utils/format"

interface IntegratedProgressStackProps {
  currentDay: number
  hasCompletedChakra: (day: number) => boolean
  hasParticipatedDay: (day: number) => boolean
  allChakrasCompleted: boolean
  hasLifetimeAccess?: boolean // APP_2 (Lifetime): Pass to timegate service
  inCourseMode?: boolean // When true (lifetime somatic journey), apply trial timegates
  /** When true (ChakraHub): show all 7 chakras, no current-day label or teaser */
  showAllChakrasForLifetimeHub?: boolean
  chakraData: {
    day: number
    affirmation: string
    description: string
    source: any
    onPress: (router: Router) => void
  }[]
  router: Router
}

// Sanskrit names for each chakra (day 0-6: Monday-Sunday)
const SANSKRIT_NAMES = [
  "Muladhara", // Root (Monday, day 0)
  "Svadhisthana", // Sacral (Tuesday, day 1)
  "Manipura", // Solar Plexus (Wednesday, day 2)
  "Anahata", // Heart (Thursday, day 3)
  "Vishuddha", // Throat (Friday, day 4)
  "Ajna", // Third Eye (Saturday, day 5)
  "Sahasrara", // Crown (Sunday, day 6)
] as const

// Define variants
const chakraRowVariants = tv({
  base: "flex-row items-center justify-center mb-1 w-full",
  variants: {
    current: {
      true: "scale-105",
      false: "opacity-90",
    },
  },
  defaultVariants: {
    current: false,
  },
})

const dayLabelTextVariants = tv({
  base: "text-base font-medium",
  variants: {
    current: {
      true: "text-white",
      false: "text-white/80",
    },
  },
  defaultVariants: {
    current: false,
  },
})

const chakraNameTextVariants = tv({
  base: "text-sm",
  variants: {
    current: {
      true: "text-white/80",
      false: "text-white/60",
    },
  },
  defaultVariants: {
    current: false,
  },
})

/**
 * APP_1 (Trial): Integrated Progress Stack
 *
 * This component displays the progressive chakra reveal for trial users.
 * Features:
 * - Progressive reveal (only shows chakras up to current day)
 * - Teaser logic (shows next day's shadow after completing current day)
 * - Missed day handling (dimmed, not clickable)
 * - Check globes for completed chakras
 *
 * NOTE: This is APP_1 (Trial) specific. APP_2 (Lifetime) uses ChakraHub.
 */
export const IntegratedProgressStack = ({
  currentDay,
  hasCompletedChakra,
  hasParticipatedDay,
  allChakrasCompleted,
  hasLifetimeAccess = false, // APP_2 (Lifetime): Default to false for trial mode
  inCourseMode = false, // Lifetime somatic journey: apply trial timegates
  showAllChakrasForLifetimeHub = false,
  chakraData,
  router,
}: IntegratedProgressStackProps) => {
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  // Find current chakra data
  const currentChakraData = chakraData.find(({ day }) => day === currentDay)

  // LOCKED (Android): Trials home stack placement – constants/layout.ts TRIAL_HOME_ROOT_CHAKRA. iOS lifetime hub: pin root ball higher via ROOT_BOTTOM_OFFSET_LIFETIME_HUB_IOS (production-approved).
  const bottomPadding =
    showAllChakrasForLifetimeHub && Platform.OS === "ios"
      ? ROOT_BOTTOM_OFFSET_LIFETIME_HUB_IOS
      : TRIAL_HOME_ROOT_CHAKRA.BOTTOM_PADDING
  const dayLabelToBallGap = TRIAL_HOME_ROOT_CHAKRA.DAY_LABEL_TO_BALL_GAP

  // Trial home (ChakraHome): ScrollView has paddingTop + paddingBottom; stack must fit in visible area
  // so the root ball is not cut off (iOS was showing ball below screen). Use reduced viewport when
  // not in lifetime hub (Android: 32 top; iOS: SCROLL_PADDING_TOP_IOS – LOCKED in layout.ts).
  const scrollPaddingTop =
    Platform.OS === "ios"
      ? TRIAL_HOME_ROOT_CHAKRA.SCROLL_PADDING_TOP_IOS
      : TRIAL_HOME_ROOT_CHAKRA.SCROLL_PADDING_TOP
  const scrollPaddingBottom =
    TRIAL_HOME_ROOT_CHAKRA.SCROLL_PADDING_BOTTOM +
    SCROLL_BREATHING_BOTTOM_PADDING
  const viewportHeightForTrialHome =
    windowHeight -
    insets.top -
    insets.bottom -
    scrollPaddingTop -
    scrollPaddingBottom

  // Viewport height for base-pinned stack (flex-end). Lifetime hub uses full safe area; trial home uses reduced so stack fits.
  const viewportHeight = showAllChakrasForLifetimeHub
    ? windowHeight - insets.top - insets.bottom
    : viewportHeightForTrialHome

  // iOS lifetime hub only: use a shorter container so the root ball is pinned higher (LOCKED production layout).
  const stackContainerHeight =
    showAllChakrasForLifetimeHub && Platform.OS === "ios"
      ? viewportHeight - LIFETIME_HUB_STACK_RAISE_IOS
      : viewportHeight

  // Next-day preview: midnight countdown when there is a tomorrow (currentDay < 6)
  const [midnightCountdown, setMidnightCountdown] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  })
  useEffect(() => {
    if (currentDay >= 6) return
    const calculateMidnight = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      setMidnightCountdown(formatCountdown(getTimeRemaining(tomorrow)))
    }
    calculateMidnight()
    const interval = setInterval(calculateMidnight, 1000)
    return () => clearInterval(interval)
  }, [currentDay])

  // LOCKED: viewport-sized container + stack pinned to base – do not center (trials home). iOS lifetime hub: shorter container so root ball sits higher (LIFETIME_HUB_STACK_RAISE_IOS). flexGrow (not flex) so min/max height are respected.
  return (
    <View
      style={{
        flexGrow: 1,
        minHeight: stackContainerHeight,
        maxHeight: stackContainerHeight,
      }}
    >
      {/* Chakra stack – pinned to base (flex-end); same position Monday–Sunday; never center by day */}
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: bottomPadding,
        }}
      >
        {/* Reverse chakraData so Root (day 0) appears at bottom, Crown (day 6) at top */}
        {[...chakraData]
          .reverse()
          .map(({ day: chakraDay, source, onPress }, index) => {
            const isCurrentDay = currentDay === chakraDay

            // APP_1 (Trial): Weekly lock - show all 7 chakras by Sunday
            // Monday (day 0): Only root chakra visible (default starting place)
            // Tuesday-Sunday: Progressive reveal, all 7 visible by Sunday
            // Root always stays at the bottom (justify-end + flex-col-reverse)
            // By Sunday, all 7 chakras are present (even if not opened, they're greyed out)
            const isWithinCurrentDayRange = chakraDay <= currentDay

            // Show all chakras up to current day (or all 7 when lifetime hub)
            // Monday: only root (day 0); Sunday: all 7 (days 0-6)
            const shouldShowChakra =
              showAllChakrasForLifetimeHub || chakraDay <= currentDay

            // Check timegate service for accessibility (routes to trial or lifetime logic)
            // APP_1 (Trial): Progressive reveal logic
            // APP_2 (Lifetime): All days accessible
            const isUnlocked = isChakraDayAccessible(
              chakraDay,
              hasLifetimeAccess,
              hasParticipatedDay,
              currentDay,
              allChakrasCompleted,
              inCourseMode, // Lifetime somatic: apply trial timegates
            )
            const isCompleted = hasCompletedChakra(chakraDay)

            // APP_1 (Trial): Missed day logic
            // Missed days: Past days (before current day) that were not opened during the week
            // If they didn't open the app on that day, it greys out and is not accessible
            // They can always access the current day (day of week)
            const isMissedDay =
              chakraDay < currentDay &&
              !hasParticipatedDay(chakraDay) &&
              !hasCompletedChakra(chakraDay)

            // UX Improvement: Add tooltip explanation for missed days
            const missedDayTooltip = isMissedDay
              ? "This day was missed and is no longer accessible this week"
              : undefined

            // Check if CURRENT day is completed - teaser only shows after completing current day
            // This checks if the currentDay (not the chakraDay being iterated) is completed
            const isCurrentDayCompleted = hasCompletedChakra(currentDay)

            // TEASER LOGIC: Only for next day's chakra shadow AFTER completing current day
            // Teaser = very low opacity shadow of next day's chakra (currentDay + 1)
            // Isolated from all other processing - ONLY affects visual appearance
            // CRITICAL: Teaser ONLY shows if CURRENT day is completed
            const isTeaserPosition =
              chakraDay === currentDay + 1 &&
              currentDay < 6 &&
              isCurrentDayCompleted

            // PRODUCTION: Show ALL 7 chakras for spacing verification and locked positioning
            // All chakras are visible, but only current day and completed days are interactive
            // Future days are dimmed/disabled but visible for proper spacing

            // APP_1 (Trial): Visibility logic
            // Monday (day 0): Only show root chakra (default starting place)
            // Tuesday-Sunday: Progressive reveal, all 7 visible by Sunday
            // Hide chakras beyond current day (except on Sunday when all are visible)
            if (!shouldShowChakra) {
              return null // Don't render chakras beyond current day (except Sunday)
            }

            const dayName = getDayName(chakraDay)
            const chakraName = getChakraName(chakraDay)
            const showDayLabel =
              !showAllChakrasForLifetimeHub &&
              ((isCurrentDay && !isCompleted) || isTeaserPosition)
            // Current day title: show for current day (completed or not) so each day/chakra is labeled on APP1 and APP2
            const showCurrentDayTitle =
              !showAllChakrasForLifetimeHub && isCurrentDay
            // Lifetime hub: day title next to every chakra ball (same row, aligned all the way up)
            const showLifetimeLeftDayTitle = showAllChakrasForLifetimeHub

            return (
              <View
                key={chakraDay}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  marginBottom: 2,
                  position: "relative",
                  paddingTop: showDayLabel || showCurrentDayTitle ? dayLabelToBallGap : 0,
                  ...(Platform.OS === "android" && chakraDay === 0 && {
                    paddingBottom: 24,
                  }),
                }}
              >
                {/* APP_1/APP_2: Day title above chakra ball – in-flow layout so it renders on Android (absolute + bottom 100% is unreliable) */}
                {showCurrentDayTitle && (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      marginBottom: dayLabelToBallGap,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        maxWidth: "100%",
                      }}
                    >
                      <AppText
                        font="cormorant-regular"
                        size="xs"
                        numberOfLines={1}
                        style={{
                          fontFamily: "CormorantGaramond",
                          fontWeight: "600",
                          color: "#ffffff",
                          textShadowColor: "rgba(0, 0, 0, 0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {dayName}
                      </AppText>
                      <AppText
                        font="cormorant-regular"
                        size="xs"
                        numberOfLines={1}
                        style={{
                          fontFamily: "CormorantGaramond",
                          color: "#ffffff",
                          textShadowColor: "rgba(0, 0, 0, 0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {" "}
                        – {chakraName} Day
                      </AppText>
                    </View>
                  </View>
                )}

                {/* Teaser title + next-day preview box - after completing current day; skip for hub; in-flow for Android */}
                {!showAllChakrasForLifetimeHub && isTeaserPosition && (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      marginBottom: dayLabelToBallGap,
                      opacity: 0.6,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        maxWidth: "100%",
                      }}
                    >
                      <AppText
                        font="cormorant-regular"
                        size="xs"
                        numberOfLines={1}
                        style={{
                          fontFamily: "CormorantGaramond",
                          fontWeight: "600",
                          color: "#ffffff",
                          textShadowColor: "rgba(0, 0, 0, 0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {getDayName(chakraDay)}
                      </AppText>
                      <AppText
                        font="cormorant-regular"
                        size="xs"
                        numberOfLines={1}
                        style={{
                          fontFamily: "CormorantGaramond",
                          color: "#ffffff",
                          textShadowColor: "rgba(0, 0, 0, 0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {" "}
                        – {getChakraName(chakraDay)} Day
                      </AppText>
                    </View>
                    {/* Soft preview: opens at midnight countdown */}
                    <View
                      style={{
                        marginTop: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.12)",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.65)" />
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        Opens at midnight {midnightCountdown.hours}:{midnightCountdown.minutes}:{midnightCountdown.seconds}
                      </AppText>
                    </View>
                  </View>
                )}

                {/* Lifetime hub: day title next to chakra ball (left of ball); trial: ball only in this slot */}
                {showLifetimeLeftDayTitle ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 2,
                        maxWidth: "40%",
                      }}
                      pointerEvents="none"
                    >
                      <AppText
                        font="cormorant-regular"
                        size="xs"
                        numberOfLines={1}
                        style={{
                          fontFamily: "CormorantGaramond",
                          fontWeight: "600",
                          color: "#ffffff",
                          textShadowColor: "rgba(0, 0, 0, 0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {dayName}
                      </AppText>
                      <AppText
                        font="cormorant-regular"
                        size="xs"
                        numberOfLines={1}
                        style={{
                          fontFamily: "CormorantGaramond",
                          color: "#ffffff",
                          textShadowColor: "rgba(0, 0, 0, 0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {chakraName} Day
                      </AppText>
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        ...(isCurrentDay
                          ? { transform: [{ scale: 1.15 }] }
                          : { transform: [{ scale: 1 }] }),
                        opacity: showAllChakrasForLifetimeHub
                          ? 1.0
                          : isTeaserPosition
                            ? 0.15
                            : isCompleted ||
                                hasParticipatedDay(chakraDay) ||
                                isCurrentDay
                              ? 1.0
                              : isMissedDay
                                ? 0.3
                                : 0.4,
                      }}
                      accessibilityLabel={
                        isMissedDay
                          ? `${getChakraName(chakraDay)} - Missed day`
                          : isCompleted
                            ? `${getChakraName(chakraDay)} - Completed`
                            : `${getChakraName(chakraDay)} - ${isCurrentDay ? "Current day" : "Available"}`
                      }
                      accessibilityHint={
                        isMissedDay
                          ? "This day was missed and is no longer accessible"
                          : isCompleted
                            ? "Tap to revisit this completed chakra"
                            : isCurrentDay
                              ? "Tap to open today's chakra"
                              : "Tap to open this chakra"
                      }
                      accessibilityRole="button"
                    >
                  {/* Chakra button - larger for current day, disabled for future/missed days */}
                  {/* TEASER: Not clickable (visual shadow only) */}
                  <PulsingButton
                    source={source}
                    small={showAllChakrasForLifetimeHub}
                    smallDivisor={
                      showAllChakrasForLifetimeHub
                        ? LIFETIME_HUB_CHAKRA_BALL_DIVISOR
                        : undefined
                    }
                    isAnimating={
                      isCurrentDay &&
                      !isMissedDay &&
                      chakraDay <= currentDay &&
                      !isTeaserPosition
                    }
                    isBottomChakra={chakraDay === 0}
                    onPress={() => {
                      // APP_1 (Trial): Accessibility rules
                      // - Can always click current day (day of week)
                      // - Can click completed days (they stay open)
                      // - Can click participated days (they stay open)
                      // - Cannot click future days (beyond current day)
                      // - Cannot click missed days (not opened during the week)
                      // - Cannot click teaser (visual only)
                      // - Lifetime hub: all balls tappable
                      if (
                        !showAllChakrasForLifetimeHub &&
                        (chakraDay > currentDay ||
                          isMissedDay ||
                          isTeaserPosition)
                      ) {
                        return
                      }
                      // Allow access to: current day, completed days, participated days
                      onPress(router)
                    }}
                  />

                  {/* Completion indicator badge - Half size, chakra-colored, subtle with depth */}
                  {/* Show check ball for completed chakras (not missed days, not teaser) */}
                  {/* TEASER: No check globe (visual shadow only) */}
                  {isCompleted &&
                    !isMissedDay &&
                    !isTeaserPosition &&
                    (() => {
                      const chakraColor = getChakraColor(chakraDay)
                      // Convert hex to rgba for subtle opacity
                      const hexToRgba = (hex: string, alpha: number) => {
                        const r = parseInt(hex.slice(1, 3), 16)
                        const g = parseInt(hex.slice(3, 5), 16)
                        const b = parseInt(hex.slice(5, 7), 16)
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`
                      }
                      // Create gradient colors from chakra color (darker to lighter)
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
                            right: -20, // Adjusted for smaller size
                            transform: [{ translateY: -4 }], // Center vertically (half of 8px height)
                            zIndex: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* Subtle halo glow - Half size, chakra-colored */}
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
                          {/* Chakra-colored gradient circle - Half size with depth */}
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
                  </View>
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      ...(isCurrentDay
                        ? { transform: [{ scale: 1.15 }] }
                        : { transform: [{ scale: 1 }] }),
                      opacity: showAllChakrasForLifetimeHub
                        ? 1.0
                        : isTeaserPosition
                          ? 0.15
                          : isCompleted ||
                              hasParticipatedDay(chakraDay) ||
                              isCurrentDay
                            ? 1.0
                            : isMissedDay
                              ? 0.3
                              : 0.4,
                    }}
                    accessibilityLabel={
                      isMissedDay
                        ? `${getChakraName(chakraDay)} - Missed day`
                        : isCompleted
                          ? `${getChakraName(chakraDay)} - Completed`
                          : `${getChakraName(chakraDay)} - ${isCurrentDay ? "Current day" : "Available"}`
                    }
                    accessibilityHint={
                      isMissedDay
                        ? "This day was missed and is no longer accessible"
                        : isCompleted
                          ? "Tap to revisit this completed chakra"
                          : isCurrentDay
                            ? "Tap to open today's chakra"
                            : "Tap to open this chakra"
                    }
                    accessibilityRole="button"
                  >
                    <PulsingButton
                      source={source}
                      small={showAllChakrasForLifetimeHub}
                      smallDivisor={
                        showAllChakrasForLifetimeHub
                          ? LIFETIME_HUB_CHAKRA_BALL_DIVISOR
                          : undefined
                      }
                      isAnimating={
                        isCurrentDay &&
                        !isMissedDay &&
                        chakraDay <= currentDay &&
                        !isTeaserPosition
                      }
                      isBottomChakra={chakraDay === 0}
                      onPress={() => {
                        if (
                          !showAllChakrasForLifetimeHub &&
                          (chakraDay > currentDay ||
                            isMissedDay ||
                            isTeaserPosition)
                        ) {
                          return
                        }
                        onPress(router)
                      }}
                    />
                    {isCompleted &&
                      !isMissedDay &&
                      !isTeaserPosition &&
                      (() => {
                        const chakraColor = getChakraColor(chakraDay)
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
                              right: -20,
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
                              colors={[gradientColors[0], gradientColors[1], gradientColors[2]]}
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
                )}
              </View>
            )
          })}
      </View>
    </View>
  )
}
