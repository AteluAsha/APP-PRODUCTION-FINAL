/**
 * Accountability of Awakening – Energy Awakening to Soul
 *
 * Full redesign: Path from head to heart. Stunning heart meter on black.
 * Stats and trial history on black – refined, no panels.
 */

import React from "react"
import { View, ScrollView, Platform, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { ActionBar } from "@/components/ActionBar"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { Ionicons } from "@expo/vector-icons"
import { useShallow } from "zustand/react/shallow"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
import { SCROLL_ANDROID_SMOOTH_PROPS } from "@/constants/layout"
import { CHAKRA_NAMES, DAY_NAMES } from "@/constants/chakras/chakraConstants"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export const AccountabilityOfAwakening = () => {
  const router = useRouter()
  const [
    getAccountabilityStats,
    hasEverCompletedChakra,
    recomputeAccountabilityFromHistory,
    hasLifetimeAccess,
  ] = useChakraJourneyStore(
    useShallow((state) => [
      state.getAccountabilityStats,
      state.hasEverCompletedChakra,
      state.recomputeAccountabilityFromHistory,
      state.hasLifetimeAccess,
    ]),
  )
  useChakraJourneyStore(
    useShallow((s) => ({
      t: s.trialHistory,
      d: s.totalDaysParticipated,
      c: s.totalChakrasCompleted,
      q: s.quizCompletions,
    })),
  )
  const stats = getAccountabilityStats()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const heartMeterFills = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    hasEverCompletedChakra(i),
  )
  const filledCount = heartMeterFills.filter(Boolean).length
  const heartPercent = Math.round((filledCount / 7) * 100)

  const getEncouragement = () => {
    if (filledCount === 0) return "Every step begins with the first"
    if (filledCount < 4)
      return "Awareness descends. Your heart receives the light."
    if (filledCount < 7)
      return "You are flowing beautifully through your awakening"
    return "Your heart is fully open — you have journeyed through all seven"
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000" }}
      edges={["top", "left", "right"]}
    >
      <ActionBar onBackPress={handleBack} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: Platform.OS === "android" ? 40 : 24,
          paddingBottom: 60 + SCROLL_BREATHING_BOTTOM_PADDING,
        }}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
      >
        <View
          style={{
            maxWidth: 400,
            alignSelf: "center",
            width: "100%",
            paddingVertical: Platform.OS === "android" ? 16 : 0,
          }}
        >
          {/* Header – more space on Android for visual harmony */}
          <View
            style={{
              alignItems: "center",
              marginBottom: Platform.OS === "android" ? 28 : 40,
              position: "relative",
            }}
          >
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                recomputeAccountabilityFromHistory()
              }}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: 8,
                opacity: 0.6,
              }}
              hitSlop={12}
              accessibilityLabel="Refresh progress"
              accessibilityHint="Rechecks all progress meters from your journey history"
            >
              <Ionicons
                name="refresh"
                size={20}
                color="rgba(212, 197, 169, 0.7)"
              />
            </Pressable>
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-center"
              style={{
                marginBottom: 8,
                color: "rgba(168, 201, 154, 0.5)",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              From head to heart
            </AppText>
            <AppText
              font="koh-santepheap"
              size="2xl"
              className="text-center"
              style={{
                marginBottom: 6,
                color: "rgba(232, 223, 208, 0.95)",
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              Accountability of Awakening
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-center"
              style={{ color: "rgba(212, 197, 169, 0.55)" }}
            >
              Energy awakening to soul
            </AppText>
          </View>

          {/* Hero: Heart Meter – glowing on black, respaced for Android */}
          <View
            style={{
              alignItems: "center",
              marginBottom: Platform.OS === "android" ? 32 : 56,
            }}
          >
            {/* Glow behind heart – subtle bg helps shadow render on iOS */}
            <View
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor:
                  filledCount > 0
                    ? "rgba(16, 185, 129, 0.04)"
                    : "rgba(168, 201, 154, 0.02)",
                shadowColor:
                  filledCount > 0 ? "#10B981" : "rgba(168, 201, 154, 0.4)",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5 + (heartPercent / 100) * 0.4,
                shadowRadius: 24 + (heartPercent / 100) * 20,
                elevation: 8,
              }}
            />
            <View
              style={{
                opacity: 0.6 + (heartPercent / 100) * 0.4,
              }}
            >
              <Ionicons
                name="heart"
                size={88}
                color={filledCount > 0 ? "#10B981" : "rgba(168, 201, 154, 0.5)"}
                style={{
                  textShadowColor:
                    filledCount > 0 ? "rgba(16, 185, 129, 0.6)" : "transparent",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 20,
                }}
              />
            </View>
            <AppText
              font="instrument-bold"
              size="3xl"
              style={{
                marginTop: Platform.OS === "android" ? 20 : 16,
                color: "rgba(232, 223, 208, 0.98)",
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {heartPercent}%
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{
                marginTop: Platform.OS === "android" ? 8 : 4,
                color: "rgba(168, 201, 154, 0.85)",
              }}
            >
              Heart Opening
            </AppText>

            {/* 7 chakra dots – Crown (6) to Root (0), head to heart path */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: Platform.OS === "android" ? 28 : 20,
                gap: 6,
              }}
            >
              {[6, 5, 4, 3, 2, 1, 0].map((dayIndex) => {
                const filled = heartMeterFills[dayIndex]
                const color = getChakraColor(dayIndex)
                return (
                  <View
                    key={dayIndex}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: filled ? color : "rgba(80, 80, 80, 0.5)",
                      borderWidth: filled ? 0 : 1,
                      borderColor: "rgba(120, 120, 120, 0.4)",
                      shadowColor: filled ? color : "transparent",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 4,
                    }}
                  />
                )
              })}
            </View>
            <AppText
              font="instrument-italic"
              size="xs"
              className="text-center px-6"
              style={{
                marginTop: Platform.OS === "android" ? 24 : 16,
                color: "rgba(168, 201, 154, 0.75)",
              }}
            >
              {getEncouragement()}
            </AppText>
          </View>

          {/* Stats – on black, refined, more spacing on Android */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "rgba(139, 115, 85, 0.12)",
              paddingTop: Platform.OS === "android" ? 28 : 20,
              marginBottom: Platform.OS === "android" ? 32 : 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: Platform.OS === "android" ? 16 : 12,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(139, 115, 85, 0.06)",
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "rgba(212, 197, 169, 0.7)" }}
              >
                Days Participated
              </AppText>
              <AppText
                font="instrument-bold"
                size="base"
                style={{ color: "rgba(168, 201, 154, 0.95)" }}
              >
                {stats.totalDaysParticipated}
              </AppText>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: Platform.OS === "android" ? 16 : 12,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(139, 115, 85, 0.06)",
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "rgba(212, 197, 169, 0.7)" }}
              >
                Chakras Completed
              </AppText>
              <AppText
                font="instrument-bold"
                size="base"
                style={{ color: "rgba(168, 201, 154, 0.95)" }}
              >
                {stats.totalChakrasCompleted} / 7
              </AppText>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: Platform.OS === "android" ? 16 : 12,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(139, 115, 85, 0.06)",
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "rgba(212, 197, 169, 0.7)" }}
              >
                Completed Trials
              </AppText>
              <AppText
                font="instrument-bold"
                size="base"
                style={{ color: "rgba(168, 201, 154, 0.95)" }}
              >
                {stats.completedTrials} / 2
              </AppText>
            </View>
            {stats.currentTrialProgress > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: Platform.OS === "android" ? 16 : 12,
                }}
              >
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={{ color: "rgba(212, 197, 169, 0.7)" }}
                >
                  Current Trial
                </AppText>
                <AppText
                  font="instrument-bold"
                  size="base"
                  style={{ color: "rgba(168, 201, 154, 0.95)" }}
                >
                  {stats.currentTrialProgress} / 7
                </AppText>
              </View>
            )}
          </View>

          {/* Trial History – on black, minimal, more top space on Android */}
          {stats.trialHistory.length > 0 && (
            <View style={{ marginTop: Platform.OS === "android" ? 8 : 0 }}>
              <AppText
                font="instrument-bold"
                size="xs"
                style={{
                  marginBottom: Platform.OS === "android" ? 16 : 12,
                  color: "rgba(212, 197, 169, 0.6)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Trial History
              </AppText>
              {stats.trialHistory.map((trial, index) => (
                <View
                  key={index}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(139, 115, 85, 0.08)",
                  }}
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <AppText
                      font="instrument-bold"
                      size="sm"
                      style={{ color: "rgba(232, 223, 208, 0.9)" }}
                    >
                      Trial {trial.trialNumber}
                    </AppText>
                    {trial.completed && (
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={{ color: "rgba(168, 201, 154, 0.9)" }}
                      >
                        Completed
                      </AppText>
                    )}
                  </View>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={{ color: "rgba(212, 197, 169, 0.5)" }}
                  >
                    {formatDate(trial.startDate)}
                    {trial.endDate && ` – ${formatDate(trial.endDate)}`}
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    className="mt-1"
                    style={{ color: "rgba(212, 197, 169, 0.6)" }}
                  >
                    {trial.daysParticipated.length} / 7 days
                  </AppText>
                  {trial.daysParticipated.length > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 8,
                      }}
                    >
                      {trial.daysParticipated
                        .sort((a, b) => a - b)
                        .map((dayIndex) => (
                          <AppText
                            key={dayIndex}
                            font="instrument-regular"
                            size="xs"
                            style={{ color: "rgba(168, 201, 154, 0.75)" }}
                          >
                            {DAY_NAMES[dayIndex]}
                          </AppText>
                        ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Intellectual Embodiment – Quiz results (newest first) */}
          {stats.quizCompletions && stats.quizCompletions.length > 0 && (
            <View
              style={{
                marginTop: Platform.OS === "android" ? 24 : 20,
                borderTopWidth: 1,
                borderTopColor: "rgba(139, 115, 85, 0.12)",
                paddingTop: Platform.OS === "android" ? 24 : 20,
              }}
            >
              <AppText
                font="instrument-bold"
                size="xs"
                style={{
                  marginBottom: Platform.OS === "android" ? 14 : 10,
                  color: "rgba(212, 197, 169, 0.6)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Intellectual Embodiment
              </AppText>
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  marginBottom: 12,
                  color: "rgba(168, 201, 154, 0.5)",
                }}
              >
                Quiz results
              </AppText>
              {[...stats.quizCompletions].reverse().map((entry, index) => (
                <View
                  key={`${entry.date}-${entry.day}-${index}`}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(139, 115, 85, 0.08)",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{ color: "rgba(212, 197, 169, 0.6)" }}
                    >
                      {formatDate(entry.date + "T00:00:00")}
                      {entry.day >= 1 &&
                        entry.day <= 7 &&
                        ` · ${CHAKRA_NAMES[entry.day - 1]}`}
                    </AppText>
                    <AppText
                      font="instrument-bold"
                      size="sm"
                      style={{ color: "rgba(168, 201, 154, 0.95)" }}
                    >
                      {entry.score} / {entry.total}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty state only when no progress at all (avoids misleading message for lifetime ChakraHub-only users) */}
          {stats.trialHistory.length === 0 &&
            stats.totalChakrasCompleted === 0 &&
            stats.totalDaysParticipated === 0 && (
              <View className="items-center py-16">
                <Ionicons
                  name="leaf-outline"
                  size={28}
                  color="rgba(168, 201, 154, 0.35)"
                  style={{ marginBottom: 12 }}
                />
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-center px-8"
                  style={{ color: "rgba(212, 197, 169, 0.55)" }}
                >
                  Your journey begins when you start your first trial
                </AppText>
                <AppText
                  font="instrument-italic"
                  size="xs"
                  className="text-center mt-2"
                  style={{ color: "rgba(168, 201, 154, 0.45)" }}
                >
                  Every step is sacred
                </AppText>
              </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
