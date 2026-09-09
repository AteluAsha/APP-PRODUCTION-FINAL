/**
 * Floating notes leaf — course-day focus screens only.
 * Hub uses the toggle menu for notes. AudioPlayer has its own leaf.
 */
import React, { useMemo } from "react"
import { StyleSheet, Platform, View } from "react-native"
import { usePathname, useRouter, useSegments } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"
import { getContextChakraDayFromRoute } from "@/utils/notesContextChakra"
import { getCurrentDayOfWeek } from "@/utils/date"
import { isCourseFocusScreen } from "@/utils/courseFocusScreen"
import { NotesLeafButton } from "@/components/notes/NotesLeafButton"

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
    <View
      style={[
        styles.anchor,
        {
          left: 12,
          bottom: Math.max(insets.bottom, 12) + (Platform.OS === "android" ? 24 : 8),
        },
      ]}
      pointerEvents="box-none"
    >
      <NotesLeafButton
        whisperPlacement="above"
        onPress={() => {
          router.push(`/(chakras)/NotesAlongTheWay?contextDay=${contextDay}`)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    zIndex: 1003,
    ...(Platform.OS === "android" && { elevation: 1000 }),
  },
})
