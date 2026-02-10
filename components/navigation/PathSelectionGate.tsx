/**
 * Path Selection Gate - Ensures Enter Path is NEVER blocked
 *
 * Renders a single tap target on top of everything when the user is on the
 * welcome (path selection) screen. Tapping it navigates to DateSelection or ChakraHub.
 * This is the last-resort layer so onboarding can never get stuck.
 */

import React from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { useRouter, usePathname } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const Z_INDEX = 999999

export function PathSelectionGate() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((s) => s.hasLifetimeAccess),
  )

  const isWelcomeScreen =
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname === "/" ||
    (typeof pathname === "string" &&
      pathname.startsWith("/(chakras)") &&
      pathname.split("/").filter(Boolean).length <= 2)

  const onEnterPath = () => {
    addHapticFeedback(HapticStrength.Medium)
    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
    } else {
      router.push("/(chakras)/DateSelection")
    }
  }

  if (!isWelcomeScreen) return null

  return (
    <View
      style={[
        styles.container,
        {
          bottom: 0,
          left: 0,
          right: 0,
          height: 220 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
      pointerEvents="box-none"
      zIndex={Z_INDEX}
      elevation={Z_INDEX}
    >
      <Pressable
        onPress={onEnterPath}
        style={styles.hitArea}
        accessibilityLabel="Enter Path"
        accessibilityRole="button"
        accessibilityHint="Opens date selection to begin your journey"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  hitArea: {
    width: 280,
    height: 120,
    borderRadius: 60,
  },
})
