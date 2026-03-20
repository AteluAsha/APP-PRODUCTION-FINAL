/**
 * Journey Summary Gift
 *
 * For those who chose the Path of the Sovereign. A gentle resting place with
 * a summary of their 7-day journey. They can view their chakra cards, return
 * to SOUL SCHOOL, or choose to anchor deeper (paywall).
 *
 * Aesthetic: Stillness background, Cormorant Garamond.
 */

import React from "react"
import { View, ScrollView, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { FadeIn } from "react-native-reanimated"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"

const SOFT_BG = "#0f1210"

interface JourneySummaryGiftProps {
  onReadyToAnchor: () => void
  onBack?: () => void
}

export function JourneySummaryGift({
  onReadyToAnchor,
  onBack,
}: JourneySummaryGiftProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const hasEverCompletedChakra = useChakraJourneyStore(
    (s) => s.hasEverCompletedChakra,
  )

  const hasUnlockedCards = React.useMemo(() => {
    for (let i = 0; i < 7; i++) {
      if (hasEverCompletedChakra(i)) return true
    }
    return false
  }, [hasEverCompletedChakra])

  const handleGallery = () => {
    addHapticFeedback(HapticStrength.Light)
    router.push("/(chakras)/GalleryOfGnosis")
  }

  const handleReturn = () => {
    addHapticFeedback(HapticStrength.Light)
    router.replace("/(chakras)/ChakraHome")
  }

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
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
              marginBottom: 16,
              letterSpacing: 1,
            }}
          >
            Your Keys Are Yours
          </AppText>

          <AppText
            font="cormorant-italic"
            size="base"
            style={{
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
              lineHeight: 24,
              fontStyle: "italic",
              marginBottom: 32,
              maxWidth: 340,
            }}
          >
            You walked the seven doors. The light you gathered is yours to keep.
            Carry it forward.
          </AppText>

          {/* Gallery of Gnosis - if they have cards */}
          {hasUnlockedCards && (
            <Pressable
              onPress={handleGallery}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                marginBottom: 24,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(168, 201, 154, 0.4)",
                width: "100%",
                maxWidth: 320,
              })}
            >
              <LinearGradient
                colors={[
                  "rgba(168, 201, 154, 0.15)",
                  "rgba(107, 142, 90, 0.1)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <Ionicons
                  name="images"
                  size={24}
                  color="rgba(168, 201, 154, 0.9)"
                />
                <AppText
                  font="instrument-medium"
                  size="sm"
                  style={{ color: "rgba(255,255,255,0.95)" }}
                >
                  View Your Chakra Cards
                </AppText>
              </LinearGradient>
            </Pressable>
          )}

          {/* Actions */}
          <View style={{ width: "100%", maxWidth: 320, gap: 12, marginTop: 8 }}>
            <Pressable
              onPress={onReadyToAnchor}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(168, 201, 154, 0.5)",
              })}
            >
              <LinearGradient
                colors={[
                  "rgba(168, 201, 154, 0.25)",
                  "rgba(107, 142, 90, 0.2)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                }}
              >
                <AppText
                  font="instrument-medium"
                  size="sm"
                  style={{ color: "rgba(255,255,255,0.98)" }}
                >
                  I'm ready to anchor deeper into SOUL SCHOOL
                </AppText>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleReturn}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                paddingVertical: 14,
                alignItems: "center",
              })}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textDecorationLine: "underline",
                }}
              >
                Return to SOUL SCHOOL
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  )
}
