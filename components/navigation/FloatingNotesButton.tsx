/**
 * Floating notes leaf — course-day focus screens only.
 * Hub uses the toggle menu for notes. AudioPlayer has its own leaf.
 */
import React, { useMemo } from "react"
import { Pressable, StyleSheet, Platform } from "react-native"
import { usePathname, useRouter, useSegments } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"
import { getContextChakraDayFromRoute } from "@/utils/notesContextChakra"
import { getCurrentDayOfWeek } from "@/utils/date"
import { isCourseFocusScreen } from "@/utils/courseFocusScreen"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { ANDROID_PRESS_DELAY_MS, TOUCH } from "@/constants/layout"

export function FloatingNotesButton() {
  const router = useRouter()
  const pathname = usePathname()
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const isGoodbyeVisible = useGoodbyeModalStore((s) => s.isGoodbyeVisible)
  const splashOverlayActive = useSplashOverlayStore((s) => s.splashOverlayActive)

  const contextDay =
    getContextChakraDayFromRoute(pathname, segments) ?? getCurrentDayOfWeek()

  const shouldShow = useMemo(() => {
    if (isGoodbyeVisible || splashOverlayActive) return false
    if (!pathname) return false

    const onNotes =
      pathname.includes("NotesAlongTheWay") ||
      segments.includes("NotesAlongTheWay")
    if (onNotes) return false

    const onGate =
      pathname.includes("WellnessGate") ||
      pathname.includes("DayPresence") ||
      pathname.includes("WelcomeScreen") ||
      pathname.includes("DateSelection") ||
      pathname.includes("Paywall") ||
      pathname.includes("CommitmentGate") ||
      pathname.includes("EnergyExchange")
    if (onGate) return false

    const onHub =
      pathname.includes("ChakraHub") || pathname.includes("ChakraHome")
    if (onHub) return false

    const onAudioPlayer = pathname.includes("AudioPlayer")
    if (onAudioPlayer) return false

    return isCourseFocusScreen(pathname, segments)
  }, [
    pathname,
    segments,
    isGoodbyeVisible,
    splashOverlayActive,
  ])

  if (!shouldShow) return null

  return (
    <Pressable
      onPress={() => {
        addHapticFeedback(HapticStrength.Light)
        router.push(`/(chakras)/NotesAlongTheWay?contextDay=${contextDay}`)
      }}
      delayPressIn={
        Platform.OS === "android" ? ANDROID_PRESS_DELAY_MS : undefined
      }
      hitSlop={TOUCH.hitSlop}
      style={[
        styles.button,
        {
          left: 12,
          bottom: Math.max(insets.bottom, 12) + (Platform.OS === "android" ? 24 : 8),
        },
      ]}
      accessibilityLabel="Notes Along the Way"
      accessibilityHint="Tap to view and add your journey notes"
    >
      <Ionicons name="leaf" size={26} color="#87AE73" />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(135, 174, 115, 0.14)",
    zIndex: 1003,
    ...(Platform.OS === "android" && { elevation: 1000 }),
  },
})
