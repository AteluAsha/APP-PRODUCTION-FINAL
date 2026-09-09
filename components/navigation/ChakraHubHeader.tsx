/**
 * ChakraHub header: Chakras 101 (top-left) and profile (top-right).
 * Hamburger menus are removed for now — hub navigation is the chevron toggle.
 */

import React, { useEffect, useState } from "react"
import { View, Pressable, Platform, StyleSheet, Image } from "react-native"
import { usePathname, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { AppText } from "@/components/AppText"
import { safeOverlayTop } from "@/constants/layout"

const ICON_EDGE_INSET = 24
const BUTTON_SIZE = 48
const PROFILE_ICON_SIZE = 20
const PROFILE_TOP_OFFSET = 4

export function ChakraHubHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isGoodbyeVisible = useGoodbyeModalStore((s) => s.isGoodbyeVisible)
  const hasSeenChakras101Guide = useFirstLaunchStore(
    (s) => s.hasSeenChakras101Guide,
  )
  const markChakras101GuideSeen = useFirstLaunchStore(
    (s) => s.markChakras101GuideSeen,
  )
  const [showGuide, setShowGuide] = useState(false)

  const isChakraHub =
    pathname?.includes("ChakraHub") || pathname?.startsWith("/(chakras)/ChakraHub")
  const top = safeOverlayTop(insets.top)

  useEffect(() => {
    if (!isChakraHub || isGoodbyeVisible || hasSeenChakras101Guide) {
      setShowGuide(false)
      return
    }
    const t = setTimeout(() => setShowGuide(true), 700)
    return () => clearTimeout(t)
  }, [hasSeenChakras101Guide, isChakraHub, isGoodbyeVisible])

  if (!isChakraHub || isGoodbyeVisible) {
    return null
  }

  const dismissGuide = () => {
    setShowGuide(false)
    markChakras101GuideSeen()
  }

  const openChakras101 = () => {
    addHapticFeedback(HapticStrength.Light)
    dismissGuide()
    router.push("/(chakras)/Chakras101")
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
    <View
      style={[styles.bar, { top: top + PROFILE_TOP_OFFSET }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={openChakras101}
        style={({ pressed }) => [buttonBase, pressed && styles.pressed]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        accessibilityLabel="Chakras 101"
        accessibilityHint="Learn about the 7 chakras before you begin"
      >
        <Image
          source={require("@/assets/images/7chakras.png")}
          style={{ width: 26, height: 26 }}
          resizeMode="contain"
        />
      </Pressable>

      <Pressable
        onPress={openProfile}
        style={({ pressed }) => [buttonBase, pressed && styles.pressed]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        accessibilityLabel="Profile"
        accessibilityHint="View Awakening Soul ID, name, and profile photo"
      >
        <Ionicons
          name="person-outline"
          size={PROFILE_ICON_SIZE}
          color="rgba(255, 255, 255, 0.95)"
        />
      </Pressable>

      {showGuide ? (
        <View style={styles.guideCard} pointerEvents="box-none">
          <View style={styles.guidePointer} />
          <Pressable
            onPress={dismissGuide}
            accessibilityLabel="Chakras 101 guide"
            accessibilityHint="Dismiss this guide, or tap the wheel to open Chakras 101"
            style={styles.guideInner}
          >
            <AppText font="cormorant-italic" style={styles.guideTitle}>
              Just beginning?
            </AppText>
            <AppText font="instrument-regular" style={styles.guideBody}>
              The wheel at the top left holds Chakras 101 — a quiet study of
              the 7 chakras before you open a day.
            </AppText>
            <AppText font="instrument-regular" style={styles.guideDismiss}>
              Got it
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: ICON_EDGE_INSET,
    right: ICON_EDGE_INSET,
    zIndex: 9999,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    ...(Platform.OS === "android" && { elevation: 9999 }),
  },
  pressed: { opacity: 0.8 },
  guideCard: {
    position: "absolute",
    top: BUTTON_SIZE + 10,
    left: 0,
    width: 236,
  },
  guidePointer: {
    width: 12,
    height: 12,
    backgroundColor: "rgba(18, 16, 14, 0.92)",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(232, 201, 140, 0.4)",
    transform: [{ rotate: "45deg" }],
    marginLeft: 16,
    marginBottom: -6,
    zIndex: 1,
  },
  guideInner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(232, 201, 140, 0.4)",
    backgroundColor: "rgba(18, 16, 14, 0.92)",
  },
  guideTitle: {
    color: "rgba(255, 248, 236, 0.96)",
    fontSize: 20,
    lineHeight: 26,
    textAlign: "left",
    marginBottom: 8,
  },
  guideBody: {
    color: "rgba(255, 255, 255, 0.86)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
  },
  guideDismiss: {
    marginTop: 12,
    color: "rgba(232, 201, 140, 0.92)",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
})
