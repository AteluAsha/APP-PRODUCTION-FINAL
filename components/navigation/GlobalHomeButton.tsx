/**
 * Global Home Button Component
 *
 * Provides a backup home button on all screens (except Chakras101) to ensure users
 * can always return to their home screen even if there are navigation glitches.
 *
 * Hidden on ChakraHub, course-day focus screens, and gates.
 * Elsewhere, returns to ChakraHub.
 */

import React from "react"
import { View, Pressable, StyleSheet, Platform, Image } from "react-native"
import { useRouter, usePathname, useSegments } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useShallow } from "zustand/react/shallow"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { isCourseFocusScreen } from "@/utils/courseFocusScreen"
import { ICON, ANDROID_PRESS_DELAY_MS } from "@/constants/layout"

export const GlobalHomeButton: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const segments = useSegments()
  const insets = useSafeAreaInsets()

  const { completedChakra, clearCompletedChakra } = useCompletedChakraStore(
    useShallow((state) => ({
      completedChakra: state.completedChakra,
      clearCompletedChakra: state.clearCompletedChakra,
    })),
  )
  const isGoodbyeVisible = useGoodbyeModalStore((state) => state.isGoodbyeVisible)

  const isEntryGate =
    !pathname ||
    pathname === "/" ||
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname.includes("WelcomeScreen") ||
    pathname.includes("WellnessGate") ||
    pathname.includes("DayPresence") ||
    segments.includes("WelcomeScreen") ||
    segments.includes("WellnessGate") ||
    segments.includes("DayPresence")

  if (isGoodbyeVisible) {
    return null
  }

  const isChakraHub =
    pathname?.startsWith("/(chakras)/ChakraHub") || pathname?.includes("/ChakraHub")
  if (isChakraHub) {
    return null
  }

  if (isCourseFocusScreen(pathname, segments)) {
    return null
  }

  if (
    segments.includes("Chakras101") ||
    segments.includes("CommitmentGate") ||
    segments.includes("Paywall") ||
    segments.includes("EnergyExchange") ||
    segments.includes("DateSelection") ||
    segments.includes("NotesAlongTheWay") ||
    segments.includes("TribeChat") ||
    segments.includes("AudioPlayer") ||
    segments.includes("AnuaChat") ||
    pathname?.includes("/Chakras101") ||
    pathname?.includes("/CommitmentGate") ||
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
    pathname?.includes("ProfileMenu") ||
    pathname?.includes("Profile") ||
    pathname === "AnuaChat" ||
    (segments.length > 0 && segments[segments.length - 1] === "AnuaChat") ||
    isEntryGate
  ) {
    return null
  }

  const handlePress = () => {
    addHapticFeedback(HapticStrength.Light)
    if (completedChakra) {
      clearCompletedChakra()
    }
    router.dismissTo("/(chakras)/ChakraHub")
  }

  return (
    <View
      style={[
        styles.homeButtonWrap,
        {
          top: Math.max(insets.top, 8) + 8,
          right: 16,
        },
      ]}
      pointerEvents="auto"
    >
      <Pressable
        onPress={handlePress}
        style={styles.homeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        {...(Platform.OS === "android" && { delayPressIn: ANDROID_PRESS_DELAY_MS })}
      >
        <Image
          source={require("@/assets/images/7chakras.png")}
          style={{ width: ICON.homeIcon, height: ICON.homeIcon }}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  homeButtonWrap: {
    position: "absolute",
    // Above scroll/parallax content and aligned with ActionBar (1000); below ChakraHubHeader (9999).
    zIndex: 1002,
    ...(Platform.OS === "android" && { elevation: 999 }),
  },
  homeButton: {
    width: ICON.homeButton,
    height: ICON.homeButton,
    borderRadius: ICON.homeButton / 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1002,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
})
