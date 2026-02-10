/**
 * Mirror Of Embodiment Quiz Screen
 *
 * A mystical, spiritual quiz experience for each chakra day.
 * Features dark background, gradient lights, earth tone accents,
 * and one question at a time with immediate feedback.
 */

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeIn, FadeOut, Easing } from "react-native-reanimated"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { getChakraName, getChakraImage } from "@/constants/chakras/chakraConstants"

// Import quiz data
const quizData = require("@/assets/data/ChakraQuizzes/chakra_quizzes.json")

/** Fisher-Yates shuffle so correct answer is not always in slot 1. */
function shuffleOptions<T>(array: T[]): T[] {
  const out = [...array]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Chakra colors matching the app's earth tone palette
const CHAKRA_COLORS: Record<
  number,
  {
    primary: string
    secondary: string
    glow: string
    correct: string
    incorrect: string
  }
> = {
  1: {
    primary: "#DC2626",
    secondary: "rgba(220, 38, 38, 0.3)",
    glow: "rgba(220, 38, 38, 0.2)",
    correct: "#10B981",
    incorrect: "rgba(220, 38, 38, 0.6)",
  }, // Root - Crimson red
  2: {
    primary: "#EA580C",
    secondary: "rgba(234, 88, 12, 0.3)",
    glow: "rgba(234, 88, 12, 0.2)",
    correct: "#10B981",
    incorrect: "rgba(234, 88, 12, 0.6)",
  }, // Sacral - Terracotta
  3: {
    primary: "#FCD34D",
    secondary: "rgba(252, 211, 77, 0.3)",
    glow: "rgba(252, 211, 77, 0.2)",
    correct: "#10B981",
    incorrect: "rgba(252, 211, 77, 0.6)",
  }, // Solar Plexus - Gold
  4: {
    primary: "#10B981",
    secondary: "rgba(16, 185, 129, 0.3)",
    glow: "rgba(16, 185, 129, 0.2)",
    correct: "#FCD34D",
    incorrect: "rgba(185, 28, 28, 0.6)",
  }, // Heart - Emerald
  5: {
    primary: "#3B82F6",
    secondary: "rgba(59, 130, 246, 0.3)",
    glow: "rgba(59, 130, 246, 0.2)",
    correct: "#10B981",
    incorrect: "rgba(59, 130, 246, 0.6)",
  }, // Throat - Cyan blue
  6: {
    primary: "#6366F1",
    secondary: "rgba(99, 102, 241, 0.3)",
    glow: "rgba(99, 102, 241, 0.2)",
    correct: "#10B981",
    incorrect: "rgba(99, 102, 241, 0.6)",
  }, // Third Eye - Indigo
  7: {
    primary: "#9333EA",
    secondary: "rgba(147, 51, 234, 0.3)",
    glow: "rgba(147, 51, 234, 0.2)",
    correct: "#10B981",
    incorrect: "rgba(147, 51, 234, 0.6)",
  }, // Crown - Violet
}

/** Three-tier mirror messages per chakra (beginner / intermediate / embodied). */
const MIRROR_MESSAGES: Record<
  number,
  { beginner: string; intermediate: string; embodied: string }
> = {
  1: {
    beginner:
      "Your Mirror suggests your Root could use more grounding. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Root is finding its footing. A little more practice can deepen stability.",
    embodied:
      "Your Mirror reflects a strong Root. You belong here.",
  },
  2: {
    beginner:
      "Your Mirror suggests your Sacral could use more flow. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Sacral is opening to creativity. A little more practice can deepen the flow.",
    embodied:
      "Your Mirror reflects a flowing Sacral. You feel; you create.",
  },
  3: {
    beginner:
      "Your Mirror suggests your Solar Plexus could use more fire. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Solar Plexus is building power. A little more practice can deepen your truth.",
    embodied:
      "Your Mirror reflects a strong Solar Plexus. Through your truth, you find your soul fire.",
  },
  4: {
    beginner:
      "Your Mirror suggests your Heart could use more opening. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Heart is softening. A little more practice can deepen unconditional love.",
    embodied:
      "Your Mirror reflects an open Heart. Your love is unconditional.",
  },
  5: {
    beginner:
      "Your Mirror suggests your Throat could use more expression. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Throat is finding its voice. A little more practice can deepen authentic speech.",
    embodied:
      "Your Mirror reflects a clear Throat. You speak your truth.",
  },
  6: {
    beginner:
      "Your Mirror suggests your Third Eye could use more vision. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Third Eye is opening. A little more practice can deepen inner sight.",
    embodied:
      "Your Mirror reflects a clear Third Eye. You open your mind to the Universe.",
  },
  7: {
    beginner:
      "Your Mirror suggests your Crown could use more connection. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Crown is opening to spirit. A little more practice can deepen unity.",
    embodied:
      "Your Mirror reflects an open Crown. You are one with all.",
  },
}

interface QuizQuestion {
  id: string
  question: string
  options: {
    text: string
    isCorrect: boolean
    rationale: string
  }[]
}

interface QuizData {
  day: number
  title: string
  description: string
  dragon_guide: string
  frequency: string
  questions: QuizQuestion[]
}

export default function QuizScreen() {
  const { day } = useLocalSearchParams<{ day: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const scrollViewRef = useRef<ScrollView>(null)
  const rationaleRef = useRef<View>(null)
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showRationale, setShowRationale] = useState(false)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Load quiz data for the specified day; shuffle options so correct answer is not always first
  useEffect(() => {
    const dayNum = parseInt(day || "1", 10)
    const dayQuiz = (quizData as QuizData[]).find((q) => q.day === dayNum)

    if (dayQuiz) {
      const quizWithShuffledOptions: QuizData = {
        ...dayQuiz,
        questions: dayQuiz.questions.map((q) => ({
          ...q,
          options: shuffleOptions(q.options),
        })),
      }
      setQuiz(quizWithShuffledOptions)
    }
  }, [day])

  const handleAnswerSelect = (optionIndex: number) => {
    if (selectedAnswer !== null) return // Already answered

    addHapticFeedback(HapticStrength.Medium)
    setSelectedAnswer(optionIndex)
    setShowRationale(true)

    // Update score if correct
    if (
      quiz &&
      quiz.questions[currentQuestionIndex].options[optionIndex].isCorrect
    ) {
      setScore((prev) => prev + 1)
    }

    // Scroll to show rationale after a brief delay
    setTimeout(() => {
      if (scrollViewRef.current) {
        // Scroll to end to ensure rationale is visible
        scrollViewRef.current.scrollToEnd({ animated: true })
      }
    }, 150)
  }

  const handleNext = () => {
    if (!quiz) return

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowRationale(false)
      addHapticFeedback(HapticStrength.Light)
    } else {
      setIsComplete(true)
      addHapticFeedback(HapticStrength.Medium)
    }
  }

  const handleBackToDay = () => {
    addHapticFeedback(HapticStrength.Medium)
    router.back()
  }

  const handleGoToHome = () => {
    addHapticFeedback(HapticStrength.Medium)
    router.replace(
      hasLifetimeAccess ? "/(chakras)/ChakraHub" : "/(chakras)/ChakraHome",
    )
  }

  if (!quiz) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        {/* Always-visible back button during loading */}
        <Pressable
          onPress={handleBackToDay}
          style={{
            position: "absolute",
            top: Math.max(insets.top, 8) + 8,
            left: 16,
            zIndex: 100,
            padding: 8,
            backgroundColor: "transparent",
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#9333EA" />
          <AppText
            font="instrument-regular"
            size="base"
            className="text-white/70 mt-4"
          >
            Preparing your mirror...
          </AppText>
          {/* Emergency exit option */}
          <Pressable
            onPress={handleGoToHome}
            className="mt-6 px-4 py-2 rounded-lg border border-white/20"
          >
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-white/70"
            >
              Return to Home
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const dayNum = parseInt(day || "1", 10)
  const colors = CHAKRA_COLORS[dayNum] || CHAKRA_COLORS[1]
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  // Embodiment tier from score: 0-3 beginner, 4-7 intermediate, 8-11 embodied (11 questions per quiz)
  type EmbodimentTier = "beginner" | "intermediate" | "embodied"
  const getEmbodimentTier = (
    correctAnswers: number,
    totalQuestions: number,
  ): EmbodimentTier => {
    const p = totalQuestions > 0 ? correctAnswers / totalQuestions : 0
    if (p <= 3 / 11) return "beginner"
    if (p <= 7 / 11) return "intermediate"
    return "embodied"
  }

  const getResonanceLabel = (tier: EmbodimentTier): string => {
    if (tier === "beginner") return "Awakening Awareness"
    if (tier === "intermediate") return "Deepening Integration"
    return "Radiant Embodiment"
  }

  // Completion Screen
  if (isComplete) {
    const tier = getEmbodimentTier(score, quiz.questions.length)
    const resonanceRating = getResonanceLabel(tier)
    const mirrorMessage = MIRROR_MESSAGES[dayNum]?.[tier] ?? MIRROR_MESSAGES[1].beginner
    const chakraName = getChakraName(dayNum - 1)
    const anuaMessage =
      tier === "beginner"
        ? `I just completed the Mirror of Embodiment. The reflection suggests my ${chakraName} Chakra could use more attention. Can you offer a short practice?`
        : tier === "intermediate"
          ? `I just completed the Mirror of Embodiment. My ${chakraName} is deepening—could you suggest a short practice to go further?`
          : `I just completed the Mirror of Embodiment. My ${chakraName} reflection felt strong. Any practice to keep it radiant?`
    const chakraBallSource = getChakraImage(dayNum - 1)
    const heartsFilled = tier === "beginner" ? 1 : tier === "intermediate" ? 2 : 3

    return (
      <SafeAreaView className="flex-1 bg-black">
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", colors.secondary, "rgba(0, 0, 0, 0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0 opacity-25"
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: windowHeight - insets.top - insets.bottom,
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 0,
          }}
        >
          <Animated.View
            entering={FadeIn.duration(800).easing(Easing.out(Easing.ease))}
            style={{ alignItems: "center", flex: 1 }}
          >
            {/* Chakra ball: clipped to circle so square asset doesn't show corners */}
            <View className="mb-4">
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.primary + "20",
                  borderWidth: 2,
                  borderColor: colors.primary + "60",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={chakraBallSource}
                    style={{ width: 96, height: 96 }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            {/* Completion Message */}
            <AppText
              font="koh-santepheap"
              size="3xl"
              className="text-center mb-2 text-white"
            >
              Journey Complete
            </AppText>

            {/* Embodiment Resonance Title */}
            <AppText
              font="instrument-semibold"
              size="lg"
              className="text-center mb-2 text-white/70"
            >
              Embodiment Resonance
            </AppText>

            {/* Heart meter: energy of embodiment (no number) */}
            <View className="flex-row gap-2 mb-4">
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: i <= heartsFilled ? colors.primary + "90" : "rgba(255,255,255,0.12)",
                    borderWidth: 1,
                    borderColor: i <= heartsFilled ? colors.primary : "rgba(255,255,255,0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="heart"
                    size={16}
                    color={i <= heartsFilled ? "#FFFFFF" : "rgba(255,255,255,0.4)"}
                  />
                </View>
              ))}
            </View>

            {/* Result card: chakra-colored, gentle depth */}
            <View className="mb-5">
              <LinearGradient
                colors={[colors.primary + "35", colors.secondary + "80", colors.primary + "25"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: colors.primary + "70",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <AppText
                  font="koh-santepheap"
                  size="2xl"
                  className="text-white text-center"
                >
                  {resonanceRating}
                </AppText>
              </LinearGradient>
            </View>

            {/* Mirror message: tier-specific; tap opens Anua with matching message */}
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                useAnuaChatStore.getState().open({
                  initialMessage: anuaMessage,
                  chakraDayOverride: dayNum - 1,
                })
              }}
              className="mb-5 active:opacity-80"
            >
              <AppText
                font="instrument-regular"
                size="sm"
                className="text-white/70 text-center italic px-4"
              >
                {mirrorMessage}
              </AppText>
            </Pressable>

            {/* Spacer so Return button sits at bottom */}
            <View style={{ flex: 1 }} />

            {/* Return Button: chakra-colored, gentle depth; anchored near bottom */}
            <View style={{ paddingBottom: Math.max(insets.bottom, 12), width: "100%", alignItems: "center" }}>
              <Pressable
                onPress={handleBackToDay}
                className="active:scale-95 active:opacity-90"
                style={{
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={[colors.primary + "E6", colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 32,
                    paddingVertical: 10,
                    borderRadius: 24,
                    borderWidth: 1.5,
                    borderColor: colors.primary + "99",
                  }}
                >
                  <AppText
                    font="koh-santepheap"
                    size="xl"
                    className="text-white text-center"
                  >
                    Return to Day {dayNum}
                  </AppText>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Question Screen
  const selectedOption =
    selectedAnswer !== null ? currentQuestion.options[selectedAnswer] : null
  const isCorrect = selectedOption?.isCorrect || false

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Always-visible back button - white arrow only, no background */}
      <Pressable
        onPress={handleBackToDay}
        style={{
          position: "absolute",
          top: Math.max(insets.top, 8) + 8,
          left: 16,
          zIndex: 100,
          padding: 8,
          backgroundColor: "transparent",
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Emergency home button - top right */}
      <Pressable
        onPress={handleGoToHome}
        style={{
          position: "absolute",
          top: Math.max(insets.top, 8) + 8,
          right: 16,
          zIndex: 100,
          padding: 8,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: 20,
        }}
      >
        <Ionicons name="home" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Gradient Background Glow */}
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", colors.glow, "rgba(0, 0, 0, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0 opacity-20"
      />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(600).easing(Easing.out(Easing.ease))}
          className="mb-4"
        >
          {/* Spacer for absolute-positioned back button */}
          <View style={{ height: 44, marginBottom: 8 }} />

          {/* Inspirational Quote - More compact */}
          <View className="items-center mb-4 px-2">
            <AppText
              font="koh-santepheap"
              size="base"
              className="text-center text-white/90 italic leading-5"
            >
              This is not an intellectual process, but an embodiment.
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-center mt-2 text-white/70"
            >
              Let these serve as a mirror to your awareness.
            </AppText>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center justify-center gap-1.5 mb-4">
            {quiz.questions.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index <= currentQuestionIndex
                      ? colors.primary
                      : "rgba(255, 255, 255, 0.2)",
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Question Card */}
        <Animated.View
          entering={FadeIn.duration(800).easing(Easing.out(Easing.ease))}
          key={currentQuestionIndex}
        >
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              marginBottom: 16,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Question Number */}
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-white/60 mb-2"
            >
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </AppText>

            {/* Question Text - More compact */}
            <AppText
              font="koh-santepheap"
              size="lg"
              className="text-white mb-4 leading-6"
            >
              {currentQuestion.question}
            </AppText>

            {/* Answer Options - Tighter spacing */}
            <View className="gap-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const optionIsCorrect = option.isCorrect
                const showFeedback = selectedAnswer !== null

                let borderColor = "rgba(255, 255, 255, 0.2)"
                let bgColor = "rgba(255, 255, 255, 0.03)"

                if (showFeedback) {
                  if (isSelected) {
                    borderColor = optionIsCorrect
                      ? colors.correct
                      : colors.incorrect
                    bgColor = optionIsCorrect
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(185, 28, 28, 0.15)"
                  } else if (optionIsCorrect) {
                    borderColor = colors.correct
                    bgColor = "rgba(16, 185, 129, 0.1)"
                  }
                }

                return (
                  <Pressable
                    key={index}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className="active:scale-98"
                  >
                    <View
                      style={{
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 2,
                        borderColor,
                        backgroundColor: bgColor,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <AppText
                          font="instrument-regular"
                          size="base"
                          className="text-white flex-1"
                        >
                          {option.text}
                        </AppText>
                        {showFeedback && isSelected && (
                          <View className="flex-row items-center gap-2">
                            <AppText
                              font="instrument-semibold"
                              size="base"
                              style={{
                                color: optionIsCorrect ? "#FCD34D" : "#EA580C",
                              }}
                            >
                              {optionIsCorrect ? "Well Done" : "Not Quite"}
                            </AppText>
                            <Ionicons
                              name={
                                optionIsCorrect
                                  ? "checkmark-circle"
                                  : "close-circle"
                              }
                              size={24}
                              color={optionIsCorrect ? "#FCD34D" : "#EA580C"}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                )
              })}
            </View>

            {/* Rationale - Compact */}
            {showRationale && selectedOption && (
              <Animated.View
                ref={rationaleRef}
                entering={FadeIn.duration(400)}
                className="mt-3 p-3 rounded-lg"
                style={{
                  backgroundColor: isCorrect
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(185, 28, 28, 0.1)",
                  borderWidth: 1,
                  borderColor: isCorrect
                    ? "rgba(16, 185, 129, 0.3)"
                    : "rgba(185, 28, 28, 0.3)",
                }}
              >
                <AppText
                  font="instrument-italic"
                  size="sm"
                  className="text-white/90 leading-5"
                >
                  {selectedOption.rationale}
                </AppText>
              </Animated.View>
            )}

            {/* Next Button - Compact */}
            {showRationale && (
              <Animated.View entering={FadeIn.duration(400)} className="mt-3">
                <Pressable
                  onPress={handleNext}
                  className="active:scale-95 active:opacity-90"
                  style={{
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 16,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: colors.primary,
                    }}
                  >
                    <AppText
                      font="koh-santepheap"
                      size="base"
                      className="text-white"
                    >
                      {isLastQuestion ? "Complete Journey" : "Continue Journey"}
                    </AppText>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}
