/**
 * Resting Blessing
 *
 * Graceful exit for those who chose the Path of the Gentle. A final "I Am"
 * blessing before they rest. They can return to Soul School (RestingBlessing
 * as home) or choose the sanctuary when ready.
 *
 * Aesthetic: Warm amber / dusk glow, Cormorant Garamond.
 */

import React from "react"
import { View, ScrollView, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { FadeIn } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"

const DUSK_AMBER_BG = "#1a1510"

interface RestingBlessingProps {
  onReadyForSanctuary: () => void
  onBack?: () => void
}

export function RestingBlessing({
  onReadyForSanctuary,
  onBack,
}: RestingBlessingProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleReturnToSoulSchool = () => {
    addHapticFeedback(HapticStrength.Light)
    router.replace("/(chakras)/WelcomeScreen")
  }

  const handleReadyForSanctuary = () => {
    addHapticFeedback(HapticStrength.Medium)
    onReadyForSanctuary()
  }

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={{ flex: 1, backgroundColor: DUSK_AMBER_BG }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {onBack ? (
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              onBack()
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
        ) : null}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: Math.max(insets.top, 24),
            paddingBottom: Math.max(insets.bottom, 32),
            justifyContent: "center",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* I Am Blessing */}
          <AppText
            font="cormorant-italic"
            size="2xl"
            style={{
              color: "rgba(255,255,255,0.95)",
              textAlign: "center",
              marginBottom: 40,
              letterSpacing: 1,
              lineHeight: 36,
            }}
          >
            I am. I rest. I return when the timing is soft.
          </AppText>

          {/* Actions */}
          <View style={{ width: "100%", maxWidth: 340, gap: 16 }}>
            <Pressable
              onPress={handleReadyForSanctuary}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(168, 201, 154, 0.5)",
              })}
            >
              <LinearGradient
                colors={[
                  "rgba(168, 201, 154, 0.25)",
                  "rgba(107, 142, 90, 0.2)",
                  "rgba(212, 165, 116, 0.12)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppText
                  font="cormorant-italic"
                  size="base"
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  I need the sanctuary to help me find my way.
                </AppText>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleReturnToSoulSchool}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(212, 165, 116, 0.4)",
              })}
            >
              <LinearGradient
                colors={[
                  "rgba(42, 31, 21, 0.95)",
                  "rgba(26, 18, 16, 0.95)",
                  "rgba(212, 165, 116, 0.08)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppText
                  font="instrument-medium"
                  size="base"
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    textAlign: "center",
                  }}
                >
                  Return to Soul School
                </AppText>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  )
}
