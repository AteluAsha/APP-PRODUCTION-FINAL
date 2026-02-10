/**
 * Welcome Screen - Open Pathways
 *
 * Minimal version: no images to avoid freeze on hero/logo assets.
 * PathSelectionGate in root layout ensures Enter Path is never blocked.
 * Trial: Tap Enter Path → DateSelection → Waiting room.
 */

import React from "react"
import { View, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export default function WelcomeScreen() {
  const router = useRouter()
  const { hasLifetimeAccess } = useChakraJourneyStore(
    useShallow((state) => ({
      hasLifetimeAccess: state.hasLifetimeAccess,
    })),
  )

  const handleEnterPath = () => {
    addHapticFeedback(HapticStrength.Medium)
    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
    } else {
      router.push("/(chakras)/DateSelection")
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top", "bottom"]}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 28, marginBottom: 8 }}>
          Soul School
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 32 }}>
          Open pathways
        </Text>
        <View style={{ width: "80%", maxWidth: 320, height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 32 }} />
        <Pressable
          onPress={handleEnterPath}
          style={{
            backgroundColor: "rgba(135, 174, 115, 0.9)",
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
          }}
          accessibilityLabel="Enter Path"
          accessibilityHint="Opens date selection to begin your journey"
        >
          <Text style={{ color: "#000", fontSize: 18, fontWeight: "600" }}>Enter Path</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
