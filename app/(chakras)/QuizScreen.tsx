/**
 * Reflection of Remembrance
 *
 * A sitting, not a test. One invitation at a time, on the day's field.
 */

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
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
  getChakraColor,
} from "@/constants/chakras/chakraConstants"
import { SanctuaryFieldLayer } from "@/components/chakras/SanctuaryFieldLayer"
import { SoftChakraBall } from "@/components/chakras/SoftChakraBall"
import {
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
  SOMATIC_SPINNER_FADE_OUT_MS,
} from "@/constants/layout"
import { getLocalDateISO } from "@/utils/date"
import { goToChakraHubRoot } from "@/utils/navigationHelpers"

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

/** Three-tier remembrance blessings per chakra (awakening / deepening / embodied). */
const MIRROR_MESSAGES: Record<
  number,
  { beginner: string; intermediate: string; embodied: string }
> = {
  1: {
    beginner:
      "Your Root is calling you home. Place your feet on the Earth. You already belong.",
    intermediate:
      "Your Root is finding its ground. Keep listening. Stability is already rising in you.",
    embodied: "Your Root remembers. You are here. You exist. You belong.",
  },
  2: {
    beginner:
      "Your Sacral is inviting you to feel. Soften. Let the water of you move.",
    intermediate:
      "Your Sacral is opening. Your creativity is not something to earn — it is already flowing.",
    embodied: "Your Sacral remembers. You feel. You flow. You create.",
  },
  3: {
    beginner:
      "Your Solar Plexus is waking. Stand a little taller. Your fire is not gone — it is gathering.",
    intermediate:
      "Your Solar Plexus is building. Your truth has a shape. Trust the heat of it.",
    embodied:
      "Your Solar Plexus remembers. Through your truth, you find your soul fire.",
  },
  4: {
    beginner:
      "Your Heart is asking to open. You do not have to force it. Love is already here.",
    intermediate:
      "Your Heart is softening. Let it be wide. You are allowed to receive.",
    embodied: "Your Heart remembers. It is open. Your love is unconditional.",
  },
  5: {
    beginner:
      "Your Throat is finding its note. Speak even if the voice shakes. It is yours.",
    intermediate:
      "Your Throat is clearing. What you say can be both true and kind.",
    embodied: "Your Throat remembers. You speak with purity, compassion, and truth.",
  },
  6: {
    beginner:
      "Your Third Eye is stirring. Quiet the mind of self. Sight is arriving.",
    intermediate:
      "Your Third Eye is opening. Trust the knowing that does not need proof.",
    embodied:
      "Your Third Eye remembers. You release the mind of self, and see.",
  },
  7: {
    beginner:
      "Your Crown is reaching. You are not separate. Rest into the vastness.",
    intermediate:
      "Your Crown is opening to spirit. There is nothing to become — only to remember.",
    embodied: "Your Crown remembers. You are one with all. The light is yours.",
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
  const scrollViewRef = useRef<ScrollView>(null)
  const rationaleRef = useRef<View>(null)
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showRationale, setShowRationale] = useState(false)
  const scoreRef = useRef(0)
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
      scoreRef.current += 1
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
        score: scoreRef.current,
        total: quiz.questions.length,
      })
      setIsComplete(true)
      addHapticFeedback(HapticStrength.Medium)
    }
  }

  const handleBackToDay = () => {
    addHapticFeedback(HapticStrength.Medium)
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }

  const handleGoToHome = () => {
    addHapticFeedback(HapticStrength.Medium)
    goToChakraHubRoot()
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

        <Animated.View
          exiting={FadeOut.duration(SOMATIC_SPINNER_FADE_OUT_MS)}
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
        </Animated.View>
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
    if (tier === "beginner") return "The remembering has begun"
    if (tier === "intermediate") return "You are deepening"
    return "You remembered"
  }

  const dayIndex = dayNum - 1
  const accent = getChakraColor(Math.max(0, dayIndex))

  // Completion Screen
  if (quiz && isComplete) {
    const tier = getEmbodimentTier(scoreRef.current, quiz.questions.length)
    const resonanceRating = getResonanceLabel(tier)
    const mirrorMessage =
      MIRROR_MESSAGES[dayNum]?.[tier] ?? MIRROR_MESSAGES[1].beginner
    const chakraName = getChakraName(dayIndex)
    const anuaMessage =
      tier === "beginner"
        ? `I just sat with the Reflection of Remembrance for my ${chakraName} Chakra. I'd like a short practice to go deeper.`
        : tier === "intermediate"
          ? `I just sat with the Reflection of Remembrance. My ${chakraName} is deepening — a short practice to go further?`
          : `I just sat with the Reflection of Remembrance. My ${chakraName} felt radiant. A practice to keep this alive?`
    const chakraBallSource = getChakraImage(dayIndex)

    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <SanctuaryFieldLayer dayIndex={Math.max(0, dayIndex)} />
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

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
            style={{ alignItems: "center", flex: 1, width: "100%" }}
          >
            <SoftChakraBall
              source={chakraBallSource}
              size={148}
              glowColor={`${accent}47`}
              style={{ marginBottom: 24 }}
            />

            <AppText
              font="cormorant-italic"
              style={{
                textAlign: "center",
                marginBottom: 10,
                color: "rgba(255, 248, 236, 0.98)",
                fontSize: 32,
                lineHeight: 40,
                textShadowColor: "rgba(232, 201, 140, 0.4)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 16,
              }}
            >
              {resonanceRating}
            </AppText>

            <View
              style={{
                width: 48,
                height: 1,
                backgroundColor: "rgba(232, 201, 140, 0.45)",
                marginBottom: 22,
              }}
            />

            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                useAnuaChatStore.getState().open({
                  initialMessage: anuaMessage,
                  chakraDayOverride: dayIndex,
                })
              }}
              style={{ marginBottom: 20, paddingHorizontal: 8 }}
              accessibilityLabel="Sit with this blessing, or ask Anua"
            >
              <AppText
                font="cormorant-italic"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  textAlign: "center",
                  fontSize: 20,
                  lineHeight: 30,
                }}
              >
                {mirrorMessage}
              </AppText>
            </Pressable>

            <View style={{ flex: 1 }} />

            <View
              style={{
                paddingBottom: Math.max(insets.bottom, 12),
                width: "100%",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={handleBackToDay}
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}
                accessibilityLabel="Return to this day's course"
              >
                <LinearGradient
                  colors={[
                    "rgba(168, 201, 154, 0.9)",
                    "rgba(107, 142, 90, 0.94)",
                    "rgba(212, 165, 116, 0.55)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 16,
                    minWidth: 220,
                    alignItems: "center",
                  }}
                >
                  <AppText
                    font="instrument-semibold"
                    size="sm"
                    style={{
                      color: "#ffffff",
                      textAlign: "center",
                      textShadowColor: "rgba(0, 0, 0, 0.45)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 4,
                    }}
                  >
                    Return to this day
                  </AppText>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
        </SafeAreaView>
      </View>
    )
  }

  // Question Screen
  const selectedOption =
    selectedAnswer !== null ? currentQuestion.options[selectedAnswer] : null

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <SanctuaryFieldLayer dayIndex={Math.max(0, dayIndex)} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Pressable
        onPress={handleBackToDay}
        style={{
          position: "absolute",
          top: 8,
          left: 16,
          zIndex: 100,
          padding: 8,
          backgroundColor: "transparent",
        }}
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={28} color="rgba(255,255,255,0.9)" />
      </Pressable>

      <Pressable
        onPress={handleGoToHome}
        style={{
          position: "absolute",
          top: 8,
          right: 16,
          zIndex: 100,
          padding: 8,
        }}
        accessibilityLabel="Home"
      >
        <Ionicons name="home-outline" size={22} color="rgba(255,255,255,0.9)" />
      </Pressable>

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
              font="instrument-regular"
              size="xs"
              style={{
                textAlign: "center",
                color: "rgba(232, 201, 140, 0.92)",
                letterSpacing: 2,
                marginBottom: 12,
              }}
            >
              REFLECTION OF REMEMBRANCE
            </AppText>
            <AppText
              font="cormorant-italic"
              style={{
                textAlign: "center",
                color: "rgba(255, 248, 236, 0.96)",
                fontSize: 24,
                lineHeight: 32,
              }}
            >
              Sit. Breathe. Choose what feels true.
            </AppText>
            <AppText
              font="cormorant-italic"
              size="sm"
              style={{
                textAlign: "center",
                marginTop: 12,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              There are no wrong answers — only invitations to remember.
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
                "rgba(18, 16, 12, 0.55)",
                "rgba(8, 10, 8, 0.62)",
                "rgba(6, 8, 6, 0.7)",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(232, 201, 140, 0.32)",
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
                  color: "rgba(232, 201, 140, 0.75)",
                  marginBottom: 14,
                  letterSpacing: 2,
                  textAlign: "center",
                }}
              >
                {currentQuestionIndex + 1} of {quiz.questions.length}
              </AppText>

              <AppText
                font="cormorant-italic"
                style={{
                  fontSize: 24,
                  lineHeight: 34,
                  color: "rgba(255, 248, 236, 0.98)",
                  marginBottom: 24,
                  textAlign: "center",
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

                  let borderColor = "rgba(232, 201, 140, 0.28)"
                  let gradientColors: [string, string] = [
                    "rgba(12, 14, 12, 0.72)",
                    "rgba(8, 10, 8, 0.82)",
                  ]

                  if (showFeedback) {
                    if (isSelected) {
                      borderColor = optionIsCorrect
                        ? "rgba(168, 201, 154, 0.7)"
                        : "rgba(232, 201, 140, 0.55)"
                      gradientColors = optionIsCorrect
                        ? ["rgba(42, 62, 45, 0.75)", "rgba(28, 42, 32, 0.85)"]
                        : ["rgba(52, 42, 32, 0.75)", "rgba(38, 30, 24, 0.85)"]
                    } else if (optionIsCorrect) {
                      borderColor = "rgba(168, 201, 154, 0.45)"
                      gradientColors = [
                        "rgba(32, 48, 36, 0.7)",
                        "rgba(22, 32, 26, 0.8)",
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
                                      `In the Reflection of Remembrance: «${currentQuestion.question}» I wasn't sure; I had thought something like: ${option.text}. I'd like to understand this better—can you explain briefly?`
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
                        "rgba(168, 201, 154, 0.9)",
                        "rgba(107, 142, 90, 0.94)",
                        "rgba(212, 165, 116, 0.55)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingVertical: 16,
                        paddingHorizontal: 28,
                        borderRadius: 16,
                        alignItems: "center",
                      }}
                    >
                      <AppText
                        font="instrument-semibold"
                        size="sm"
                        style={{
                          color: "#ffffff",
                          letterSpacing: 0.4,
                          textShadowColor: "rgba(0, 0, 0, 0.45)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                      >
                        {isLastQuestion ? "Seal this remembering" : "Continue"}
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
    </View>
  )
}
