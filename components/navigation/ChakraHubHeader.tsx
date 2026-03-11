/**
 * ChakraHub header: two separate icons. Hamburger (top-left) opens full menu.
 * Profile (top-right) opens profile-only screen (Soul School ID, name, photo).
 * Each icon is in its own absolutely positioned View for correct placement and
 * touch targets. Inset from screen edge on both sides.
 */

import React from "react"
import { View, Pressable, Platform, StyleSheet } from "react-native"
import { usePathname, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const ICON_EDGE_INSET = 24
const BUTTON_SIZE = 48
const ICON_SIZE = 26
const PROFILE_ICON_SIZE = 20
const TOP_EXTRA = 8
const PROFILE_TOP_OFFSET = 4

export function ChakraHubHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((s) => s.hasLifetimeAccess),
  )

  const isChakraHub =
    pathname?.includes("ChakraHub") || pathname?.startsWith("/(chakras)/ChakraHub")
  if (!hasLifetimeAccess || !isChakraHub) {
    return null
  }

  const top = Math.max(insets.top, 8) + TOP_EXTRA

  const openHamburger = () => {
    addHapticFeedback(HapticStrength.Light)
    router.push("/(chakras)/ProfileMenu")
  }

  const openProfile = () => {
    addHapticFeedback(HapticStrength.Light)
    router.push("/(chakras)/Profile")
  }

  const buttonBase = {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  }

  return (
    <>
      <View
        style={[
          styles.iconWrap,
          { top, left: ICON_EDGE_INSET },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={openHamburger}
          style={({ pressed }) => [buttonBase, pressed && styles.pressed]}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          accessibilityLabel="Menu"
          accessibilityHint="Open menu: Account, Soul School, and more"
        >
          <Ionicons name="menu" size={ICON_SIZE} color="rgba(255, 255, 255, 0.9)" />
        </Pressable>
      </View>
      <View
        style={[
          styles.iconWrap,
          { top: top + PROFILE_TOP_OFFSET, right: ICON_EDGE_INSET },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={openProfile}
          style={({ pressed }) => [buttonBase, pressed && styles.pressed]}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          accessibilityLabel="Profile"
          accessibilityHint="View Soul School ID, name, and profile photo"
        >
          <Ionicons name="person-outline" size={PROFILE_ICON_SIZE} color="rgba(255, 255, 255, 0.95)" />
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  iconWrap: {
    position: "absolute",
    zIndex: 9999,
    ...(Platform.OS === "android" && { elevation: 9999 }),
  },
  pressed: { opacity: 0.8 },
})
