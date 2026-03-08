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
  Platform,
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
import {
  getChakraName,
  getChakraImage,
} from "@/constants/chakras/chakraConstants"
import { SCROLL_BREATHING_BOTTOM_PADDING, SCROLL_ANDROID_SMOOTH_PROPS } from "@/constants/layout"
import { getLocalDateISO } from "@/utils/date"

// Import quiz data
const quizData = require("@/assets/data/ChakraQuizzes/chakra_quizzes.json")

/** Fisher-Yates shuffle so correct answer is not always in slot 1. */
function shuffleOptions<T>(array: T[]): T[] {
  const out = [...array]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
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
    embodied: "Your Mirror reflects a strong Root. You belong here.",
  },
  2: {
    beginner:
      "Your Mirror suggests your Sacral could use more flow. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Sacral is opening to creativity. A little more practice can deepen the flow.",
    embodied: "Your Mirror reflects a flowing Sacral. You feel; you create.",
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
    embodied: "Your Mirror reflects an open Heart. Your love is unconditional.",
  },
  5: {
    beginner:
      "Your Mirror suggests your Throat could use more expression. Ask Anua for a short practice.",
    intermediate:
      "Your Mirror suggests your Throat is finding its voice. A little more practice can deepen authentic speech.",
    embodied: "Your Mirror reflects a clear Throat. You speak your truth.",
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
    embodied: "Your Mirror reflects an open Crown. You are one with all.",
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
      const dayNum = parseInt(day || "1", 10)
      useChakraJourneyStore.getState().recordQuizCompletion({
        date: getLocalDateISO(new Date()),
        day: dayNum,
        score,
        total: quiz.questions.length,
      })
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
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

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="rgba(135, 174, 115, 0.9)" />
          <AppText
            font="instrument-regular"
            size="base"
            style={{ color: "rgba(212, 197, 169, 0.9)", marginTop: 16 }}
          >
            Preparing your mirror...
          </AppText>
          {/* Emergency exit option */}
          <Pressable
            onPress={handleGoToHome}
            style={{
              marginTop: 24,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(135, 174, 115, 0.3)",
              backgroundColor: "rgba(42, 52, 45, 0.5)",
            }}
          >
            <AppText
              font="instrument-regular"
              size="sm"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Return to Home
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const dayNum = parseInt(day || "1", 10)
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
    const mirrorMessage =
      MIRROR_MESSAGES[dayNum]?.[tier] ?? MIRROR_MESSAGES[1].beginner
    const chakraName = getChakraName(dayNum - 1)
    const anuaMessage =
      tier === "beginner"
        ? `I just completed the Mirror of Embodiment. The reflection suggests my ${chakraName} Chakra could use more attention. Can you offer a short practice?`
        : tier === "intermediate"
          ? `I just completed the Mirror of Embodiment. My ${chakraName} is deepening—could you suggest a short practice to go further?`
          : `I just completed the Mirror of Embodiment. My ${chakraName} reflection felt strong. Any practice to keep it radiant?`
    const chakraBallSource = getChakraImage(dayNum - 1)
    const heartsFilled =
      tier === "beginner" ? 1 : tier === "intermediate" ? 2 : 3

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0)",
            "rgba(42, 38, 32, 0.3)",
            "rgba(28, 32, 28, 0.4)",
            "rgba(22, 26, 22, 0.35)",
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.7,
          }}
        />

        <ScrollView
          style={{ flex: 1 }}
          {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: windowHeight - insets.top - insets.bottom,
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: SCROLL_BREATHING_BOTTOM_PADDING,
          }}
        >
          <Animated.View
            entering={FadeIn.duration(800).easing(Easing.out(Easing.ease))}
            style={{ alignItems: "center", flex: 1 }}
          >
            {/* Chakra ball: earth-toned border, subtle depth */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(42, 38, 32, 0.6)",
                  borderWidth: 1,
                  borderColor: "rgba(139, 115, 85, 0.5)",
                  shadowColor: "#1a1a1a",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
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
              style={{ textAlign: "center", marginBottom: 8, color: "#ffffff" }}
            >
              Journey Complete
            </AppText>

            {/* Embodiment Resonance Title */}
            <AppText
              font="instrument-semibold"
              size="lg"
              style={{
                textAlign: "center",
                marginBottom: 8,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Embodiment Resonance
            </AppText>

            {/* Heart meter: earth-toned, subtle */}
            <View
              style={{
                flexDirection: "row",
                marginBottom: 16,
                justifyContent: "center",
                gap: 8,
              }}
            >
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor:
                      i <= heartsFilled
                        ? "rgba(168, 201, 154, 0.4)"
                        : "rgba(42, 52, 45, 0.8)",
                    borderWidth: 1,
                    borderColor:
                      i <= heartsFilled
                        ? "rgba(168, 201, 154, 0.5)"
                        : "rgba(139, 115, 85, 0.3)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="heart"
                    size={18}
                    color={
                      i <= heartsFilled
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(212, 197, 169, 0.5)"
                    }
                  />
                </View>
              ))}
            </View>

            {/* Result card: hero style, earth tones */}
            <View style={{ marginBottom: 20 }}>
              <LinearGradient
                colors={[
                  "rgba(212, 197, 169, 0.15)",
                  "rgba(168, 201, 154, 0.1)",
                  "rgba(139, 115, 85, 0.2)",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(139, 115, 85, 0.45)",
                  shadowColor: "#2a2520",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <AppText
                  font="koh-santepheap"
                  size="2xl"
                  style={{
                    color: "#ffffff",
                    textAlign: "center",
                    textShadowColor: "rgba(0, 0, 0, 0.4)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
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
              style={{ marginBottom: 20 }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                  fontStyle: "italic",
                  paddingHorizontal: 16,
                }}
              >
                {mirrorMessage}
              </AppText>
            </Pressable>

            {/* Spacer so Return button sits at bottom */}
            <View style={{ flex: 1 }} />

            {/* Return Button: hero style, earth tones */}
            <View
              style={{
                paddingBottom: Math.max(insets.bottom, 12),
                width: "100%",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={handleBackToDay}
                style={{
                  shadowColor: "#2a2520",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.6,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(212, 197, 169, 0.2)",
                    "rgba(168, 201, 154, 0.15)",
                    "rgba(139, 115, 85, 0.25)",
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{
                    paddingHorizontal: 32,
                    paddingVertical: 14,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: "rgba(139, 115, 85, 0.45)",
                  }}
                >
                  <AppText
                    font="koh-santepheap"
                    size="xl"
                    style={{
                      color: "#ffffff",
                      textAlign: "center",
                      textShadowColor: "rgba(0, 0, 0, 0.4)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
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

      {/* Emergency home button - top right, refined */}
      <Pressable
        onPress={handleGoToHome}
        style={{
          position: "absolute",
          top: Math.max(insets.top, 8) + 8,
          right: 16,
          zIndex: 100,
          padding: 10,
          backgroundColor: "rgba(42, 52, 45, 0.8)",
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "rgba(135, 174, 115, 0.3)",
        }}
      >
        <Ionicons name="home" size={22} color="rgba(255,255,255,0.95)" />
      </Pressable>

      {/* Ambient gradient - subtle earth tones only, NO bright chakra glow */}
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0)",
          "rgba(42, 38, 32, 0.25)",
          "rgba(28, 32, 28, 0.35)",
          "rgba(22, 26, 22, 0.3)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.7,
        }}
      />

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 20 + SCROLL_BREATHING_BOTTOM_PADDING,
        }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(600).easing(Easing.out(Easing.ease))}
          style={{ marginBottom: 16 }}
        >
          {/* Spacer for absolute-positioned back button */}
          <View style={{ height: 44, marginBottom: 8 }} />

          {/* Somatic healing journey intro - embodied, not intellectual */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 20,
              paddingHorizontal: 24,
            }}
          >
            <AppText
              font="cormorant-italic"
              size="lg"
              style={{
                fontFamily: "CormorantGaramondItalic",
                textAlign: "center",
                color: "rgba(255,255,255,0.9)",
                lineHeight: 28,
              }}
            >
              Feel into each reflection. There are no wrong answers—only
              invitations to deepen.
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{
                textAlign: "center",
                marginTop: 12,
                color: "rgba(212, 197, 169, 0.75)",
              }}
            >
              Your body knows. Let the mirror reveal what it already holds.
            </AppText>
          </View>

          {/* Progress Indicator - subtle earth tones, no bright pops */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              gap: 6,
            }}
          >
            {quiz.questions.map((_, index) => {
              const isCurrent = index === currentQuestionIndex
              const isPast = index < currentQuestionIndex
              return (
                <View
                  key={index}
                  style={{
                    width: isCurrent ? 10 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isPast
                      ? "rgba(168, 201, 154, 0.5)"
                      : isCurrent
                        ? "rgba(212, 197, 169, 0.85)"
                        : "rgba(139, 115, 85, 0.25)",
                    borderWidth: 1,
                    borderColor: isPast
                      ? "rgba(168, 201, 154, 0.4)"
                      : isCurrent
                        ? "rgba(212, 197, 169, 0.5)"
                        : "rgba(139, 115, 85, 0.2)",
                  }}
                />
              )
            })}
          </View>
        </Animated.View>

        {/* Question Card - hero style: depth, earth tones, gradient lighting, NO bright color pops */}
        <Animated.View
          entering={FadeIn.duration(800).easing(Easing.out(Easing.ease))}
          key={currentQuestionIndex}
        >
          <View
            style={{
              borderRadius: 24,
              overflow: "hidden",
              marginBottom: 16,
              shadowColor: "#2a2520",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.7,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <LinearGradient
              colors={[
                "rgba(30, 28, 26, 0.98)",
                "rgba(22, 24, 22, 0.99)",
                "rgba(18, 20, 18, 0.99)",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(139, 115, 85, 0.35)",
                overflow: "hidden",
              }}
            >
              {/* Inner highlight - subtle top edge for 3D depth */}
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.08)",
                  "rgba(255, 255, 255, 0.02)",
                  "transparent",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  pointerEvents: "none",
                }}
              />
              {/* Question Number - subtle earth tone */}
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  color: "rgba(212, 197, 169, 0.65)",
                  marginBottom: 12,
                  letterSpacing: 1,
                }}
              >
                Reflection {currentQuestionIndex + 1} of {quiz.questions.length}
              </AppText>

              {/* Question Text - site font, bold and prominent */}
              <AppText
                font="instrument-bold"
                size="lg"
                style={{
                  fontSize: 19,
                  lineHeight: 28,
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: 20,
                }}
              >
                {currentQuestion.question}
              </AppText>

              {/* Answer Options - hero style: depth, earth tones, subtle 3D, NO bright pops */}
              <View style={{ gap: 12 }}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const optionIsCorrect = option.isCorrect
                  const showFeedback = selectedAnswer !== null

                  let borderColor = "rgba(139, 115, 85, 0.35)"
                  let gradientColors: [string, string] = [
                    "rgba(35, 38, 34, 0.95)",
                    "rgba(28, 32, 28, 0.98)",
                  ]

                  if (showFeedback) {
                    if (isSelected) {
                      borderColor = optionIsCorrect
                        ? "rgba(168, 201, 154, 0.5)"
                        : "rgba(212, 165, 116, 0.45)"
                      gradientColors = optionIsCorrect
                        ? ["rgba(42, 52, 45, 0.9)", "rgba(35, 45, 38, 0.95)"]
                        : ["rgba(52, 42, 38, 0.9)", "rgba(45, 38, 35, 0.95)"]
                    } else if (optionIsCorrect) {
                      borderColor = "rgba(168, 201, 154, 0.35)"
                      gradientColors = [
                        "rgba(38, 48, 40, 0.95)",
                        "rgba(32, 40, 34, 0.98)",
                      ]
                    }
                  }

                  return (
                    <Pressable
                      key={index}
                      onPress={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      style={{
                        borderRadius: 18,
                        overflow: "hidden",
                        shadowColor: "#1a1a1a",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{
                          borderRadius: 18,
                          padding: 18,
                          borderWidth: 1,
                          borderColor,
                          overflow: "hidden",
                        }}
                      >
                        {/* Subtle top highlight for depth */}
                        <LinearGradient
                          colors={["rgba(255,255,255,0.06)", "transparent"]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "45%",
                            borderTopLeftRadius: 18,
                            borderTopRightRadius: 18,
                            pointerEvents: "none",
                          }}
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            zIndex: 1,
                          }}
                        >
                          <AppText
                            font="instrument-regular"
                            size="base"
                            style={{
                              color: "rgba(255,255,255,0.92)",
                              flex: 1,
                              lineHeight: 24,
                            }}
                          >
                            {option.text}
                          </AppText>
                          {showFeedback && isSelected &&
                            (optionIsCorrect ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                  marginLeft: 12,
                                }}
                              >
                                <AppText
                                  font="instrument-medium"
                                  size="sm"
                                  style={{
                                    color: "rgba(168, 201, 154, 0.95)",
                                  }}
                                >
                                  Resonant
                                </AppText>
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color="rgba(168, 201, 154, 0.9)"
                                />
                              </View>
                            ) : (
                              <Pressable
                                onPress={() => {
                                  addHapticFeedback(HapticStrength.Light)
                                  setTimeout(() => {
                                    const dayParam = day ?? "1"
                                    const quizChakraDay = Math.max(
                                      0,
                                      parseInt(dayParam, 10) - 1,
                                    )
                                    const initialMessage =
                                      `In the Mirror of Embodiment reflection: «${currentQuestion.question}» I wasn't sure; I had thought something like: ${option.text}. I'd like to understand this better—can you explain briefly?`
                                    useAnuaChatStore.getState().open({
                                      initialMessage,
                                      chakraDayOverride: quizChakraDay,
                                    })
                                  }, 200)
                                }}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                  marginLeft: 12,
                                }}
                                accessibilityLabel="Explore further with Anua"
                                accessibilityHint="Opens a short conversation with Anua about this reflection"
                              >
                                <AppText
                                  font="instrument-medium"
                                  size="sm"
                                  style={{
                                    color: "rgba(212, 197, 169, 0.9)",
                                  }}
                                >
                                  Explore further
                                </AppText>
                                <Ionicons
                                  name="compass"
                                  size={20}
                                  color="rgba(212, 197, 169, 0.8)"
                                />
                              </Pressable>
                            ))}
                        </View>
                      </LinearGradient>
                    </Pressable>
                  )
                })}
              </View>

              {/* Rationale - earth-toned, gentle depth, NO bright pops */}
              {showRationale && selectedOption && (
                <Animated.View
                  ref={rationaleRef}
                  entering={FadeIn.duration(400)}
                  style={{
                    marginTop: 18,
                    borderRadius: 18,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "rgba(139, 115, 85, 0.4)",
                  }}
                >
                  <LinearGradient
                    colors={[
                      "rgba(42, 45, 40, 0.95)",
                      "rgba(35, 38, 34, 0.98)",
                    ]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                      padding: 18,
                      borderRadius: 18,
                    }}
                  >
                    <AppText
                      font="cormorant-italic"
                      size="sm"
                      style={{
                        fontFamily: "CormorantGaramondItalic",
                        color: "rgba(255,255,255,0.88)",
                        lineHeight: 24,
                      }}
                    >
                      {selectedOption.rationale}
                    </AppText>
                  </LinearGradient>
                </Animated.View>
              )}

              {/* Next Button - hero style: earth tones, depth, NO chakra color pops */}
              {showRationale && (
                <Animated.View
                  entering={FadeIn.duration(400)}
                  style={{ marginTop: 18 }}
                >
                  <Pressable
                    onPress={handleNext}
                    style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      shadowColor: "#2a2520",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.6,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(212, 197, 169, 0.18)",
                        "rgba(168, 201, 154, 0.12)",
                        "rgba(139, 115, 85, 0.22)",
                        "rgba(90, 74, 58, 0.35)",
                      ]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      locations={[0, 0.35, 0.7, 1]}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 28,
                        borderRadius: 20,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "rgba(139, 115, 85, 0.45)",
                      }}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(255, 255, 255, 0.1)",
                          "rgba(255, 255, 255, 0.02)",
                          "transparent",
                        ]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "55%",
                          borderTopLeftRadius: 20,
                          borderTopRightRadius: 20,
                          pointerEvents: "none",
                        }}
                      />
                      <AppText
                        font="koh-santepheap"
                        size="base"
                        style={{
                          color: "#ffffff",
                          letterSpacing: 0.5,
                          zIndex: 1,
                          textShadowColor: "rgba(0, 0, 0, 0.4)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        {isLastQuestion ? "Complete Journey" : "Continue"}
                      </AppText>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}
