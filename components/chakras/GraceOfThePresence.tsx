/**
 * Grace of the Presence
 *
 * A bridge for those who didn't quite make it through the trials. Acknowledges
 * the struggle and offers the sanctuary as medicine, not rejection. Meets them
 * with grace instead of ego's ultimate rejection.
 *
 * Aesthetic: Soft warm amber / dusk glow, Cormorant Garamond.
 */

import React from "react"
import { View, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { FadeIn } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { LinearGradient } from "expo-linear-gradient"
import { ICON, safeOverlayTop } from "@/constants/layout"
import { CenteredInviteScroll } from "@/components/CenteredInviteScroll"

const DUSK_AMBER_BG = "#1a1510"

interface GraceOfThePresenceProps {
  onPathGentle: () => void
  onPathDevoted: () => void
  onBack?: () => void
}

export function GraceOfThePresence({
  onPathGentle,
  onPathDevoted,
  onBack,
}: GraceOfThePresenceProps) {
  const insets = useSafeAreaInsets()

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
        <CenteredInviteScroll
          contentContainerStyle={{
            paddingHorizontal: 28,
            paddingTop: Math.max(insets.top, 24),
            paddingBottom: Math.max(insets.bottom, 32),
          }}
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
            The Heart has no Clock
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
              If these seven days felt like a mountain you couldn't quite climb,
              or if the noise of the world felt too loud to hear your own
              heart—know that you haven't failed.
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
              Integration is not a race. Sometimes the soul needs to sit at the
              base of the mountain a little longer, just breathing, before it
              begins the ascent. The friction you felt is simply your old
              self-agendas saying a loud goodbye.
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
              You don't need to "get it right" to belong here. This sanctuary was
              built for the days when the keys feel heavy and the locks feel
              stuck.
            </AppText>
          </View>

          {/* The Sovereign Choice */}
          <View style={{ width: "100%", maxWidth: 340, gap: 16 }}>
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                onPathGentle()
              }}
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
                  size="sm"
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  The Path of the Gentle
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
                  I will rest and return when the timing is soft.
                </AppText>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                onPathDevoted()
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
                  The Path of the Devoted
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
                  I need the sanctuary to help me find my way.
                </AppText>
              </LinearGradient>
            </Pressable>
          </View>
        </CenteredInviteScroll>
      </SafeAreaView>
    </Animated.View>
  )
}
