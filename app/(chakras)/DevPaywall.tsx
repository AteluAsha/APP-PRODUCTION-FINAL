/**
 * Dev Paywall Screen
 *
 * Standalone route for testing the paywall (CommitmentGate) without ChakraHome's
 * useEffect fighting it. Red dev button navigates here from trial waiting room.
 *
 * Renders the EXACT SAME CommitmentGate component as ChakraHome - no duplication.
 * Any changes to CommitmentGate.tsx apply to both this dev route and the main
 * in-app paywall. Use this route to quickly preview paywall changes.
 *
 * Dev-only: __DEV__ guard; production builds will not include this route in nav.
 */

import React, { Fragment } from "react"
import { Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { CommitmentGate } from "@/components/chakras/CommitmentGate"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export default function DevPaywallScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleComplete = () => {
    router.replace("/(chakras)/ChakraHome")
  }

  const handleBack = () => {
    addHapticFeedback(HapticStrength.Light)
    router.replace("/(chakras)/ChakraHome")
  }

  // Same rendering structure as ChakraHome: CommitmentGate as primary content.
  // Dev close button is an overlay so it doesn't affect CommitmentGate layout.
  return (
    <Fragment>
      <CommitmentGate onComplete={handleComplete} />
      {__DEV__ && (
        <Pressable
          onPress={handleBack}
          style={[styles.backBtn, { top: Math.max(insets.top, 16) + 8 }]}
          hitSlop={12}
          accessibilityLabel="Back to waiting room (dev)"
        >
          <Ionicons name="close" size={28} color="rgba(255,255,255,0.8)" />
        </Pressable>
      )}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 1000,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
})
