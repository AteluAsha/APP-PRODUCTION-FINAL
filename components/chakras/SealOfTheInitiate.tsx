/**
 * Seal of the Initiate
 *
 * A moment of sovereign recognition before the paywall. Honors the user for
 * completing their 7-day journey and offers a choice: carry the keys forward
 * on their own, or anchor deeper into Awakening Soul.
 *
 * Aesthetic: Stillness background, Cormorant Garamond, gentle and ceremonial.
 */

import React from "react"
import { View, ScrollView, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { FadeIn } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { LinearGradient } from "expo-linear-gradient"
import { ICON, safeOverlayTop } from "@/constants/layout"

const SOFT_BG = "#0f1210"

interface SealOfTheInitiateProps {
  onPathSovereign: () => void
  onPathAlchemist: () => void
  onBack?: () => void
}

export function SealOfTheInitiate({
  onPathSovereign,
  onPathAlchemist,
  onBack,
}: SealOfTheInitiateProps) {
  const insets = useSafeAreaInsets()

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={{ flex: 1, backgroundColor: SOFT_BG }}
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
              left: 16,
              top: safeOverlayTop(insets.top),
              zIndex: 1000,
              width: ICON.homeButton,
              height: ICON.homeButton,
              justifyContent: "center",
              alignItems: "center",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
          {/* Header */}
          <AppText
            font="cormorant-italic"
            size="2xl"
            style={{
              color: "rgba(255,255,255,0.95)",
              textAlign: "center",
              marginBottom: 32,
              letterSpacing: 1,
            }}
          >
            The Seven Doors are Open
          </AppText>

          {/* Master Teacher Response */}
          <View style={{ marginBottom: 40, maxWidth: 380 }}>
            <AppText
              font="cormorant-italic"
              size="lg"
              style={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: 28,
                fontStyle: "italic",
                marginBottom: 16,
              }}
            >
              You have walked the bridge from Head to Heart. For seven days, you
              have untangled the timid scripts of your survival and anchored
              yourself in the "I Am."
            </AppText>
            <AppText
              font="cormorant-italic"
              size="lg"
              style={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: 28,
                fontStyle: "italic",
                marginBottom: 16,
              }}
            >
              You are no longer a seeker; you are an Initiate of the Heart-Mind.
            </AppText>
            <AppText
              font="cormorant-italic"
              size="lg"
              style={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: 28,
                fontStyle: "italic",
                marginBottom: 16,
              }}
            >
              The locks you opened this week were your own lived experiences. The
              keys you used are now yours to keep—forever. You can take this
              light back into the world right now, and it will be enough. You
              have everything you need to be a lighthouse.
            </AppText>
          </View>

          {/* The Sovereign Choice */}
          <View style={{ width: "100%", maxWidth: 340, gap: 16 }}>
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                onPathSovereign()
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(168, 201, 154, 0.4)",
              })}
            >
              <LinearGradient
                colors={[
                  "rgba(28, 32, 38, 0.95)",
                  "rgba(24, 28, 34, 0.95)",
                  "rgba(168, 201, 154, 0.08)",
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
                  size="sm"
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  The Path of the Sovereign
                </AppText>
                <AppText
                  font="cormorant-italic"
                  size="base"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  I will carry these keys forward on my own.
                </AppText>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                onPathAlchemist()
              }}
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
                  font="instrument-medium"
                  size="sm"
                  style={{
                    color: "rgba(255,255,255,0.98)",
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  The Path of the Alchemist
                </AppText>
                <AppText
                  font="cormorant-italic"
                  size="base"
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  I am ready to anchor deeper into Awakening Soul.
                </AppText>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  )
}
