/**
 * Simple Grace Transition
 *
 * Bridges users who've used both trials (from Grace return flow) to the paywall.
 * Acknowledges their work, offers sovereignty, and explains the energy exchange
 * before they see the Commitment Gate.
 *
 * Flow: DateSelection (confirm date) → this screen → Continue → ChakraHome (paywall)
 *
 * Aesthetic: Stillness background (#0f1210), Cormorant Garamond, slow meditative fade-in.
 */

import React, { useMemo } from "react"
import { View, ScrollView, Pressable, Platform } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { formatDate } from "@/utils/date"
import {
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
} from "@/constants/layout"

const STILLNESS_BG = "#0f1210"

export default function SimpleGraceTransitionScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const courseStartDate = useChakraJourneyStore((s) => s.courseStartDate)
  const setOpenPaywallFromGraceReturn =
    useChakraJourneyStore((s) => s.setOpenPaywallFromGraceReturn)

  const formattedReturnDate = useMemo(() => {
    if (!courseStartDate) return null
    return formatDate(new Date(courseStartDate + "T00:00:00"))
  }, [courseStartDate])

  const handleContinue = () => {
    addHapticFeedback(HapticStrength.Medium)
    setOpenPaywallFromGraceReturn(true)
    router.replace("/(chakras)/ChakraHome")
  }

  return (
    <View style={{ flex: 1, backgroundColor: STILLNESS_BG }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <Pressable
          onPress={() => {
            addHapticFeedback(HapticStrength.Light)
            router.back()
          }}
          style={{
            position: "absolute",
            left: 20,
            top: Math.max(insets.top, 12),
            zIndex: 10,
            padding: 8,
          }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: Math.max(insets.top, 48),
            paddingBottom: Math.max(insets.bottom, 40) + SCROLL_BREATHING_BOTTOM_PADDING,
            justifyContent: "center",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
          {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
        >
          <AppText
            font="cormorant-italic"
            size="xl"
            style={{
              color: "rgba(255,255,255,0.95)",
              textAlign: "center",
              marginBottom: 32,
              lineHeight: 32,
              fontStyle: "italic",
            }}
          >
            Dear Soul,
          </AppText>

          <View style={{ marginBottom: 40, maxWidth: 380 }}>
            <AppText
              font="cormorant-italic"
              size="lg"
              style={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: 28,
                fontStyle: "italic",
                marginBottom: 20,
              }}
            >
              Your trial offerings are now complete.
              {formattedReturnDate
                ? ` You have chosen ${formattedReturnDate}—the sanctuary will be ready when you return. `
                : " "}
              To continue your journey and anchor deeper into the sanctuary of
              SOUL SCHOOL, we invite you to choose the path that resonates
              with your heart.
            </AppText>
            <AppText
              font="cormorant-italic"
              size="lg"
              style={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: 28,
                fontStyle: "italic",
              }}
            >
              This is our circle of energy exchange—keeping the light spinning for
              you, and for all who follow.
            </AppText>
          </View>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              paddingVertical: 18,
              paddingHorizontal: 48,
              borderRadius: 14,
              backgroundColor: "rgba(168, 201, 154, 0.25)",
              borderWidth: 1,
              borderColor: "rgba(168, 201, 154, 0.5)",
            })}
          >
            <AppText
              font="instrument-medium"
              size="base"
              style={{
                color: "rgba(255,255,255,0.98)",
                textAlign: "center",
              }}
            >
              Continue
            </AppText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
