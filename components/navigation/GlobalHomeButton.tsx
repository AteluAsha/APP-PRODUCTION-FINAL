/**
 * Global Home Button Component
 *
 * Provides a backup home button on all screens (except Chakras101) to ensure users
 * can always return to their home screen even if there are navigation glitches.
 *
 * For trial users: navigates to ChakraHome
 * For lifetime users: navigates to ChakraHub
 */

import React from "react"
import { Pressable, StyleSheet } from "react-native"
import { useRouter, usePathname, useSegments } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Image } from "react-native"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { AppText } from "@/components/AppText"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import { ICON } from "@/constants/layout"

export const GlobalHomeButton: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const segments = useSegments()
  const insets = useSafeAreaInsets()

  // Get lifetime access to determine which home screen to navigate to
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((state) => state.hasLifetimeAccess),
  )
  const { completedChakra, clearCompletedChakra } = useCompletedChakraStore(
    useShallow((state) => ({
      completedChakra: state.completedChakra,
      clearCompletedChakra: state.clearCompletedChakra,
    })),
  )

  // Hide on Chakras101, CommitmentGate, EnergyExchange, WelcomeScreen, DateSelection, and WaitingScreen
  // Use both pathname and segments for reliable detection
  // WelcomeScreen is the index route - check segments array for empty or just ['(chakras)']
  // WaitingScreen is shown inside ChakraHome when showWaitingScreen is true
  const segmentsLength: number = segments.length
  const isRootChakrasRoute =
    segmentsLength === 0 ||
    (segmentsLength === 1 && segments[0] === "(chakras)") ||
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname === "/" ||
    (pathname &&
      pathname.startsWith("/(chakras)") &&
      pathname.split("/").filter(Boolean).length <= 2)

  const isWelcomeScreen =
    isRootChakrasRoute ||
    segments.includes("WelcomeScreen") ||
    pathname?.includes("/WelcomeScreen") ||
    pathname?.includes("WelcomeScreen") ||
    pathname?.includes("index")

  // Check if we're on ChakraHome (which shows WaitingScreen when conditions are met)
  // Hide GlobalHomeButton when on ChakraHome in trial mode (waiting screen context)
  const isChakraHome =
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname === "/(chakras)/ChakraHome" ||
    pathname?.includes("/ChakraHome") ||
    isRootChakrasRoute

  // Hide chakra icon on waiting screen - it's redundant (Learn About Chakras button does the same thing)
  const shouldHideOnWaitingScreen = isChakraHome || isRootChakrasRoute

  // EARLY RETURN - Most important check first
  if (
    segments.includes("Chakras101") ||
    segments.includes("CommitmentGate") ||
    segments.includes("DevPaywall") ||
    segments.includes("EnergyExchange") ||
    segments.includes("DateSelection") ||
    segments.includes("TribeChat") ||
    pathname?.includes("/Chakras101") ||
    pathname?.includes("/CommitmentGate") ||
    pathname?.includes("/DevPaywall") ||
    pathname?.includes("/EnergyExchange") ||
    pathname?.includes("/DateSelection") ||
    pathname?.includes("DateSelection") ||
    pathname?.includes("/TribeChat") ||
    pathname?.includes("TribeChat") ||
    isWelcomeScreen ||
    shouldHideOnWaitingScreen || // Hide when waiting screen is shown
    !pathname || // Safety: hide if pathname is undefined
    pathname === "/" // Safety: hide on root
  ) {
    return null
  }

  // Check if we're on a home screen (trial or post-paywall)
  // Trial home: '/(chakras)', '/(chakras)/', '/(chakras)/index', '/(chakras)/ChakraHome'
  // Post-paywall home: '/(chakras)/ChakraHub'
  const isTrialHomeScreen =
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname === "/(chakras)/ChakraHome" ||
    pathname?.includes("/ChakraHome") ||
    (isRootChakrasRoute && !pathname?.includes("ChakraHub"))

  const isPostPaywallHomeScreen =
    pathname?.startsWith("/(chakras)/ChakraHub") ||
    pathname?.includes("/ChakraHub") ||
    pathname === "/(chakras)/ChakraHub"

  const isHomeScreen = isTrialHomeScreen || isPostPaywallHomeScreen

  const handlePress = () => {
    addHapticFeedback(HapticStrength.Light)
    if (completedChakra) {
      clearCompletedChakra()
      if (hasLifetimeAccess) {
        router.replace("/(chakras)/ChakraHub")
      } else {
        router.replace("/(chakras)/ChakraHome")
      }
      return
    }
    if (isHomeScreen) {
      // On home screen (trial or post-paywall), navigate to Chakras 101
      router.push("/(chakras)/Chakras101")
    } else {
      // On other screens, navigate to respective home screen
      // Trial screens → trial homepage (ChakraHome with progressive reveal)
      // Post-paywall screens → ChakraHub
      if (hasLifetimeAccess) {
        router.replace("/(chakras)/ChakraHub")
      } else {
        // Trial users: Navigate to ChakraHome (trial landing page with progressive chakra reveal)
        router.replace("/(chakras)/ChakraHome")
      }
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.homeButton,
        {
          top: Math.max(insets.top, 8) + 8, // Standard placement - as high as possible without hitting status bar
          right: 16,
        },
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {/* Always show hero chakra icon - on home screen it navigates to Chakras 101 */}
      <Image
        source={require("@/assets/images/7chakras.png")}
        style={{ width: ICON.homeIcon, height: ICON.homeIcon }}
        resizeMode="contain"
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  homeButton: {
    position: "absolute",
    width: ICON.homeButton,
    height: ICON.homeButton,
    borderRadius: ICON.homeButton / 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
})
