/**
 * Slim vertical strip on the left edge to reveal or soft-close the floating UI.
 * Shown only on screens where the floating nav/home would appear (trial course days etc.).
 * Tap: reveal floats and start hide timer, or soft-close if already visible.
 * Android: TouchableOpacity and wider strip for reliable touch; scroll-to-reveal is wired in scroll screens.
 */

import React, { useEffect, useCallback } from "react"
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { usePathname, useSegments } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { useFloatingUIVisibilityStore } from "@/hooks/useFloatingUIVisibilityStore"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

/** Wider on Android so the strip is easier to tap reliably */
const STRIP_WIDTH = Platform.OS === "android" ? 32 : 20
/** On Android, elevation and zIndex keep strip above ScrollView so it stays tappable after scroll */
const STRIP_ELEVATION_ANDROID = 999
const STRIP_Z_INDEX = 999

export function FloatingUIRevealStrip() {
  const pathname = usePathname()
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((s) => s.hasLifetimeAccess),
  )
  const isGoodbyeVisible = useGoodbyeModalStore((s) => s.isGoodbyeVisible)
  const visible = useFloatingUIVisibilityStore((s) => s.visible)

  // Trial only: strip reveals/hides floating nav. Lifetime uses PermanentMenuBar only.
  if (hasLifetimeAccess) return null

  const segmentsLength = segments.length
  const isRootChakrasRoute =
    segmentsLength === 0 ||
    (segmentsLength === 1 && segments[0] === "(chakras)") ||
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname === "/" ||
    (pathname?.startsWith("/(chakras)") &&
      pathname.split("/").filter(Boolean).length <= 2)
  const isWelcomeScreen =
    isRootChakrasRoute ||
    segments.includes("WelcomeScreen") ||
    pathname?.includes("/WelcomeScreen") ||
    pathname?.includes("WelcomeScreen") ||
    pathname?.includes("index")
  const isChakraHome =
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname?.includes("/ChakraHome") ||
    isRootChakrasRoute
  const shouldHideOnWaitingScreen =
    (isChakraHome || isRootChakrasRoute) && !hasLifetimeAccess
  const isChakraHubLifetime =
    hasLifetimeAccess &&
    (pathname?.startsWith("/(chakras)/ChakraHub") || pathname?.includes("ChakraHub"))

  const shouldHide =
    isChakraHubLifetime ||
    isGoodbyeVisible ||
    segments.includes("Chakras101") ||
    segments.includes("CommitmentGate") ||
    segments.includes("DevPaywall") ||
    segments.includes("Paywall") ||
    segments.includes("EnergyExchange") ||
    segments.includes("DateSelection") ||
    segments.includes("NotesAlongTheWay") ||
    segments.includes("TribeChat") ||
    segments.includes("AudioPlayer") ||
    segments.includes("AnuaChat") ||
    segments.includes("GiftChakra") ||
    pathname?.includes("/Chakras101") ||
    pathname?.includes("/CommitmentGate") ||
    pathname?.includes("/DevPaywall") ||
    pathname?.includes("/Paywall") ||
    pathname?.includes("/EnergyExchange") ||
    pathname?.includes("/DateSelection") ||
    pathname?.includes("DateSelection") ||
    pathname?.includes("/NotesAlongTheWay") ||
    pathname?.includes("NotesAlongTheWay") ||
    pathname?.includes("/TribeChat") ||
    pathname?.includes("TribeChat") ||
    pathname?.includes("/AudioPlayer") ||
    pathname?.includes("AudioPlayer") ||
    pathname?.includes("/AnuaChat") ||
    pathname?.includes("AnuaChat") ||
    pathname === "AnuaChat" ||
    (segments.length > 0 && segments[segments.length - 1] === "AnuaChat") ||
    pathname?.includes("/GiftChakra") ||
    pathname?.includes("GiftChakra") ||
    (segments.length > 0 && segments[segments.length - 1] === "GiftChakra") ||
    isWelcomeScreen ||
    shouldHideOnWaitingScreen ||
    !pathname ||
    pathname === "/"

  useEffect(() => {
    if (!shouldHide) {
      useFloatingUIVisibilityStore.getState().revealAndResetTimer()
    }
  }, [shouldHide])

  const handlePress = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    const store = useFloatingUIVisibilityStore.getState()
    if (store.visible) {
      store.softClose()
    } else {
      store.revealAndResetTimer()
    }
  }, [])

  if (shouldHide) return null

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.strip,
        {
          width: STRIP_WIDTH,
          top: insets.top,
          bottom: insets.bottom,
          zIndex: STRIP_Z_INDEX,
          ...(Platform.OS === "android" && { elevation: STRIP_ELEVATION_ANDROID }),
        },
      ]}
      hitSlop={{ top: 24, bottom: 24, left: 0, right: 16 }}
      collapsable={false}
      accessibilityLabel={visible ? "Hide navigation" : "Show navigation"}
      accessibilityHint={
        visible
          ? "Tap to hide floating buttons"
          : "Tap to show floating buttons. Scroll to show buttons."
      }
    >
      <View style={styles.stripInner} pointerEvents="none" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  strip: {
    position: "absolute",
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  stripInner: {
    width: 4,
    flex: 1,
    maxHeight: 80,
    borderRadius: 2,
    backgroundColor: "rgba(135, 174, 115, 0.35)",
  },
})
