/**
 * Anua Chat Modal
 *
 * Text-first chat with optional voice input. Anua never auto-speaks on launch.
 * - Default: Text input, text responses
 * - Voice: Tap mic → record → send. Gemini transcribes audio and responds with text.
 * - "Hear responses": Toggle on to have Anua speak her replies via ElevenLabs (only after user sends a message)
 */

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native"
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { AppText } from "@/components/AppText"
import { AnuaMessageText } from "@/components/anua/AnuaMessageText"
import {
  askAnua,
  askAnuaWithAudio,
  isAnuaAvailable,
} from "@/src/services/gemini"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { getCosmicContextForAnua } from "@/utils/cosmicTime"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { speakAsAnua, isElevenLabsAvailable, stopAnuaAudio } from "@/src/services/elevenlabs"
import { performIntroRitual } from "@/src/services/anuaRitualService"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import {
  SOMATIC_SPINNER_FADE_OUT_MS,
  TOUCH,
} from "@/constants/layout"
import {
  generateDailyTransmission,
  isWisdomEngineAvailable,
} from "@/src/services/wisdomEngine"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { useAnuaMemoryStore } from "@/hooks/useAnuaMemoryStore"
import { useJourneyNotesStore } from "@/hooks/useJourneyNotesStore"

/** Max characters for one Anua message; well under Gemini input token limit. */
const ANUA_INPUT_MAX_LENGTH = 25000

/** Persisted key: course intro plays only once, when opening Anua from waiting room the first time. */
const HAS_PLAYED_WAITING_ROOM_COURSE_INTRO_KEY = "hasPlayedWaitingRoomCourseIntro"

/** Gemini-style feed: Anua is full-width type, user sits in a small bubble. */
const chatStyles = StyleSheet.create({
  messageRow: { marginBottom: 18, paddingHorizontal: 4, width: "100%" },
  messageRowLeft: { alignItems: "stretch" },
  messageRowRight: { alignItems: "flex-end" },
  anuaColumn: {
    width: "100%",
    alignSelf: "stretch",
    paddingTop: 2,
    paddingBottom: 4,
  },
  messageBubbleRight: {
    maxWidth: "78%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    backgroundColor: "rgba(255, 252, 245, 0.08)",
  },
  senderText: { color: "rgba(232, 213, 183, 0.72)" },
  anuaBody: {
    color: "rgba(255, 248, 235, 0.9)",
    marginTop: 6,
    lineHeight: 30,
    letterSpacing: 0.15,
    textAlign: "left",
  },
  userBody: {
    color: "rgba(255, 252, 245, 0.92)",
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 248, 235, 0.08)",
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 248, 235, 0.12)",
    color: "rgba(255, 248, 235, 0.92)",
    fontSize: 16,
  },
})

interface AnuaChatModalProps {
  visible: boolean
  onClose: () => void
  chakraDay: number // 0-6 (Monday-Sunday)
  chakraName: string // e.g., "Root Chakra", "Heart Chakra"
  isWaitingRoom?: boolean // If true, Anua will be more informative and trial-focused
  /** When provided, starts conversation with this as first user message (e.g. from Notes) */
  initialMessage?: string | null
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isStreaming?: boolean
}

/** Props for the shared Anua chat UI (used by both Modal and Route). */
export interface AnuaChatPageProps {
  onClose: () => void
  chakraDay: number
  chakraName: string
  isWaitingRoom?: boolean
  initialMessage?: string | null
  /** When inside Modal on Android, pass height from Modal onShow; otherwise null. */
  androidModalHeight?: number | null
}

/**
 * Anua chat UI: state, logic, and content. Renders without Modal so it can be used
 * as a full-screen route (fixes Android touch issues) or inside AnuaChatModal.
 */
export const AnuaChatPage: React.FC<AnuaChatPageProps> = ({
  onClose,
  chakraDay,
  chakraName,
  isWaitingRoom = false,
  initialMessage = null,
  androidModalHeight = null,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useVoice, setUseVoice] = useState(false)
  const [dailyTransmission, setDailyTransmission] = useState<string | null>(
    null,
  )
  const scrollViewRef = useRef<ScrollView>(null)
  const stickToBottomRef = useRef(true)
  const initialMessageSentRef = useRef(false)
  const waitingRoomCourseIntroStartedRef = useRef(false)
  const [isAnuaSpeaking, setIsAnuaSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const recordingDurationRef = useRef(0)
  const introCancelledRef = useRef(false)

  // Load daily transmission gently after chat/note are visible (so it does not block or lag the open)
  useEffect(() => {
    const delayMs = initialMessage ? 3000 : 1500
    const timeoutId = setTimeout(() => {
      if (isWisdomEngineAvailable() && !dailyTransmission) {
        generateDailyTransmission(chakraDay)
          .then((transmission) => {
            if (transmission) setDailyTransmission(transmission)
          })
          .catch((err) => {
            if (__DEV__)
              console.warn("Daily transmission loading failed (optional):", err)
          })
      }
    }, delayMs)
    return () => {
      clearTimeout(timeoutId)
      setDailyTransmission(null)
    }
  }, [chakraDay, initialMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Core send logic - reusable for manual send and initialMessage
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return
      if (!isAnuaAvailable()) {
        setError("Anua is taking a moment to arrive. Please try again.")
        return
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      }
      const anuaId = `anua-${Date.now()}`
      const streamingPlaceholder: ChatMessage = {
        id: anuaId,
        text: "",
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      }
      stickToBottomRef.current = true
      setMessages((prev) => [...prev, userMessage, streamingPlaceholder])
      setInputText("")
      setIsLoading(true)
      setError(null)

      const updateStream = (partial: string) => {
        if (introCancelledRef.current) return
        setMessages((prev) =>
          prev.map((message) =>
            message.id === anuaId
              ? { ...message, text: partial, isStreaming: true }
              : message,
          ),
        )
      }

      try {
        const cosmicContext = getCosmicContextForAnua(new Date())

        let context = undefined
        if (isWaitingRoom) {
          context = {
            currentDay: undefined,
            currentChakra: undefined,
            chakraName: undefined,
            isWaitingRoom: true,
            focusAreas: [
              "all 7 chakras (root, sacral, solar plexus, heart, throat, third eye, crown)",
              "energy body and energy centers",
              "meditation and breathing practices",
              "ego and awareness",
              "soul connection and spiritual growth",
              "intentions and preparation for the journey",
            ],
            cosmicContext,
          }
        } else {
          context = {
            currentDay: chakraDay,
            currentChakra: chakraName
              .toLowerCase()
              .replace(" chakra", "")
              .replace(" ", ""),
            chakraName,
            cosmicContext,
          }
        }

        const response = await askAnua(
          text.trim(),
          {
            temperature: 0.9,
            maxTokens: 500,
            enableVoice: false,
            onChunk: updateStream,
            isCancelled: () => introCancelledRef.current,
          },
          context,
        )

        if (introCancelledRef.current) return
        if (!response.trim()) {
          setMessages((prev) =>
            prev.filter(
              (message) =>
                message.id !== anuaId || message.text.trim().length > 0,
            ),
          )
          return
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === anuaId
              ? { ...message, text: response, isStreaming: false }
              : message,
          ),
        )

        if (useVoice && isElevenLabsAvailable() && response.trim()) {
          setIsAnuaSpeaking(true)
          speakAsAnua(response, undefined, () => introCancelledRef.current)
            .catch((err) => {
              if (__DEV__) {
                console.warn(
                  "Voice synthesis note (non-critical):",
                  err instanceof Error ? err.message : String(err),
                )
              }
            })
            .finally(() => {
              setIsAnuaSpeaking(false)
            })
        }
      } catch (err) {
        if (introCancelledRef.current) return
        if (__DEV__) console.error("Error talking to Anua:", err)
        let errorMessage =
          "Anua is having trouble connecting. Please try again, or continue your journey."
        if (err instanceof Error) {
          if (
            err.message.includes("API key") ||
            err.message.includes("not configured")
          ) {
            errorMessage =
              "Anua is taking a moment to arrive. Please try again."
          } else if (
            err.message.includes("network") ||
            err.message.includes("fetch")
          ) {
            errorMessage =
              "The connection is taking a moment. Please try again, or continue your journey."
          } else if (
            err.message.includes("quota") ||
            err.message.includes("limit")
          ) {
            errorMessage = "Anua is resting. Please try again in a moment."
          }
        }
        setError(errorMessage)
        setMessages((prev) =>
          prev.filter(
            (message) =>
              message.id !== anuaId || message.text.trim().length > 0,
          ),
        )
      } finally {
        if (!introCancelledRef.current) setIsLoading(false)
      }
    },
    [isLoading, isWaitingRoom, useVoice, chakraDay, chakraName],
  )

  const requestAudioPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        })
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const granted = await requestAudioPermission()
      if (!granted) {
        Alert.alert(
          "Microphone Permission Required",
          "Please allow microphone access to speak to Anua.",
        )
        return
      }
      addHapticFeedback(HapticStrength.Medium)
      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync({
        android: {
          extension: ".aac",
          outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: ".aac",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 64000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/aac",
          bitsPerSecond: 64000,
        },
      })
      await recording.startAsync()
      recordingRef.current = recording
      recordingDurationRef.current = 0
      setIsRecording(true)
    } catch (err) {
      if (__DEV__) console.error("Error starting recording:", err)
      Alert.alert("Error", "Failed to start recording. Please try again.")
      setIsRecording(false)
    }
  }, [requestAudioPermission])

  const sendVoiceMessage = useCallback(
    async (audioUri: string) => {
      if (isLoading || !isAnuaAvailable()) return
      setIsLoading(true)
      setError(null)
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        text: "🎤 (voice message)",
        isUser: true,
        timestamp: new Date(),
      }
      const anuaId = `anua-${Date.now()}`
      stickToBottomRef.current = true
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: anuaId,
          text: "",
          isUser: false,
          timestamp: new Date(),
          isStreaming: true,
        },
      ])
      try {
        const cosmicContext = getCosmicContextForAnua()
        const context = isWaitingRoom
          ? {
              isWaitingRoom: true,
              focusAreas: [
                "all 7 chakras (root, sacral, solar plexus, heart, throat, third eye, crown)",
                "energy body and energy centers",
                "meditation and breathing practices",
                "ego and awareness",
                "soul connection and spiritual growth",
                "intentions and preparation for the journey",
              ],
              cosmicContext,
            }
          : {
              currentDay: chakraDay,
              currentChakra: chakraName
                .toLowerCase()
                .replace(" chakra", "")
                .replace(" ", ""),
              chakraName,
              cosmicContext,
            }
        const response = await askAnuaWithAudio(audioUri, context, {
          onChunk: (partial) => {
            if (introCancelledRef.current) return
            setMessages((prev) =>
              prev.map((message) =>
                message.id === anuaId
                  ? { ...message, text: partial, isStreaming: true }
                  : message,
              ),
            )
          },
          isCancelled: () => introCancelledRef.current,
        })
        if (introCancelledRef.current) return
        if (!response.trim()) {
          setMessages((prev) =>
            prev.filter(
              (message) =>
                message.id !== anuaId || message.text.trim().length > 0,
            ),
          )
          return
        }
        setMessages((prev) =>
          prev.map((message) =>
            message.id === anuaId
              ? { ...message, text: response, isStreaming: false }
              : message,
          ),
        )
        if (useVoice && isElevenLabsAvailable() && response.trim()) {
          setIsAnuaSpeaking(true)
          speakAsAnua(response, undefined, () => introCancelledRef.current)
            .catch((err) => {
              if (__DEV__) console.warn("Voice synthesis:", err)
            })
            .finally(() => {
              setIsAnuaSpeaking(false)
            })
        }
      } catch (err) {
        if (introCancelledRef.current) return
        if (__DEV__) console.error("Error talking to Anua (voice):", err)
        let errorMessage =
          "Anua is having trouble connecting. Please try again."
        if (err instanceof Error) {
          if (
            err.message.includes("API key") ||
            err.message.includes("not configured")
          ) {
            errorMessage =
              "Anua is taking a moment to arrive. Please try again."
          } else if (
            err.message.includes("network") ||
            err.message.includes("fetch")
          ) {
            errorMessage =
              "The connection is taking a moment. Please try again."
          } else if (
            err.message.includes("quota") ||
            err.message.includes("limit")
          ) {
            errorMessage = "Anua is resting. Please try again in a moment."
          }
        }
        setError(errorMessage)
        setMessages((prev) =>
          prev.filter(
            (message) =>
              message.id !== anuaId || message.text.trim().length > 0,
          ),
        )
      } finally {
        if (!introCancelledRef.current) setIsLoading(false)
      }
    },
    [isLoading, isWaitingRoom, useVoice, chakraDay, chakraName],
  )

  const stopRecordingAndSend = useCallback(async () => {
    try {
      if (!recordingRef.current) return
      addHapticFeedback(HapticStrength.Medium)
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null
      setIsRecording(false)
      if (!uri) {
        Alert.alert("Error", "Recording failed. Please try again.")
        return
      }
      await sendVoiceMessage(uri)
    } catch (err) {
      if (__DEV__) console.error("Error stopping recording:", err)
      setIsRecording(false)
      Alert.alert("Error", "Failed to stop recording. Please try again.")
    }
  }, [sendVoiceMessage])

  // On unmount, stop recording if active
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {})
        recordingRef.current = null
      }
    }
  }, [])

  // Initialize with Anua's greeting on mount
  useEffect(() => {
    initialMessageSentRef.current = false
    let greetingText: string

    if (isWaitingRoom) {
      const waitingRoomGreetings = [
        `Hello, beautiful soul. I'm Anua, your guide for this 7-day chakra journey. I'm here to help you prepare and explore before your journey begins.

The 7 chakras are energy centers that run from your root to your crown, each holding unique wisdom and healing. As you wait, I'd love to understand where you are on this path.

How are you feeling as you prepare for this journey? What do you already know about the chakras, and what draws you to explore them?`,

        `Hello, beautiful soul. I'm Anua, your guide. You're about to embark on a profound 7-day journey through your energy body—from your root foundation to your crown connection.

Before we begin, I'd love to learn about you. How familiar are you with meditation and breathing work? Have you explored your energy body before? What intentions are you bringing to this journey?`,

        `Hello, beautiful soul. I'm Anua. You're preparing for a sacred journey through all 7 chakras—each one a gateway to deeper awareness and healing.

I'm here to help you prepare. Tell me: What do you know about the relationship between ego and awareness? How do you experience your soul's presence in your daily life? What draws you to this work?`,

        `Hello, beautiful soul. I'm Anua, your guide for this 7-day chakra journey. Each chakra holds ancient wisdom—from the grounding energy of your root to the divine connection of your crown.

As you prepare, I'd love to understand your starting point. How do you currently connect with your body's energy? Have you worked with meditation, breathwork, or somatic practices? What are you hoping to discover about yourself?`,
      ]
      greetingText =
        waitingRoomGreetings[
          Math.floor(Math.random() * waitingRoomGreetings.length)
        ]
    } else {
      const wiseQuestions = [
        "What is your heart asking you to remember today?",
        "What truth is ready to emerge from within you?",
        "Where in your body do you feel the call to listen more deeply?",
        "What question has been quietly waiting for you to ask?",
        "What does your soul want you to know right now?",
        "Where do you feel the invitation to soften and open?",
        "What wisdom is your body holding that your mind hasn't yet heard?",
        "What wants to be felt, not just thought about?",
      ]
      const randomQuestion =
        wiseQuestions[Math.floor(Math.random() * wiseQuestions.length)]
      greetingText = `Hello, beautiful soul. I'm Anua, your guide on this journey. ${randomQuestion}`
    }

    const greeting: ChatMessage = {
      id: "greeting",
      text: greetingText,
      isUser: false,
      timestamp: new Date(),
    }
    setMessages([greeting])
  }, [isWaitingRoom])

  // When user leaves Anua chat: cancel any in-flight/queued speech and stop playback (Anua only speaks while in chat).
  useEffect(() => {
    return () => {
      introCancelledRef.current = true
      stopAnuaAudio().catch(() => {})
    }
  }, [])

  // Course intro: only when in waiting room, and only the first time ever (persisted).
  useEffect(() => {
    if (!isWaitingRoom || waitingRoomCourseIntroStartedRef.current) return
    waitingRoomCourseIntroStartedRef.current = true
    introCancelledRef.current = false
    const isCancelled = () => introCancelledRef.current
    AsyncStorage.getItem(HAS_PLAYED_WAITING_ROOM_COURSE_INTRO_KEY).then(
      (value) => {
        if (introCancelledRef.current || value === "true") return
        performIntroRitual(isCancelled)
          .then(() => {
            if (!introCancelledRef.current)
              AsyncStorage.setItem(
                HAS_PLAYED_WAITING_ROOM_COURSE_INTRO_KEY,
                "true",
              )
          })
          .catch((err) => {
            if (__DEV__)
              console.warn(
                "[AnuaChatModal] Waiting room course intro failed:",
                err,
              )
          })
      },
    )
    return () => {
      introCancelledRef.current = true
      stopAnuaAudio().catch(() => {})
    }
  }, [isWaitingRoom])

  // Auto-send initialMessage (e.g. from Notes "Send thought to Anua") - runs after greeting
  useEffect(() => {
    if (
      !initialMessage?.trim() ||
      initialMessageSentRef.current ||
      isLoading ||
      messages.length < 1
    )
      return
    initialMessageSentRef.current = true
    sendMessage(initialMessage)
  }, [initialMessage, messages.length, isLoading, sendMessage])

  // Keep the expanding stream in view unless the seeker has scrolled up to read.
  useEffect(() => {
    if (!stickToBottomRef.current) return
    scrollViewRef.current?.scrollToEnd({ animated: false })
  }, [messages])

  const handleSend = () => {
    if (inputText.trim()) sendMessage(inputText.trim())
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const errorFallbackPage = (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <AppText
        font="instrument-regular"
        size="base"
        style={{ color: "rgba(255,255,255,0.9)", textAlign: "center", marginBottom: 16 }}
      >
        Something went wrong
      </AppText>
      <Pressable
        onPress={onClose}
        style={{
          backgroundColor: "rgba(135, 174, 115, 0.4)",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <AppText font="instrument-medium" size="base" style={{ color: "#fff" }}>
          Close
        </AppText>
      </Pressable>
    </View>
  )

  return (
    <SafeAreaProvider style={{ flex: 1 }} pointerEvents="box-none">
      <ErrorBoundary fallback={errorFallbackPage}>
        <AnuaChatContent
          onClose={onClose}
          useVoice={useVoice}
          setUseVoice={setUseVoice}
          messages={messages}
          inputText={inputText}
          setInputText={setInputText}
          isLoading={isLoading}
          error={error}
          dailyTransmission={dailyTransmission}
          isAnuaSpeaking={isAnuaSpeaking}
          scrollViewRef={scrollViewRef}
          stickToBottomRef={stickToBottomRef}
          handleSend={handleSend}
          formatTime={formatTime}
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecordingAndSend={stopRecordingAndSend}
          androidModalHeight={androidModalHeight}
          chakraDay={chakraDay}
        />
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}

export const AnuaChatModal: React.FC<AnuaChatModalProps> = ({
  visible,
  onClose,
  chakraDay,
  chakraName,
  isWaitingRoom = false,
  initialMessage = null,
}) => {
  const [contentReady, setContentReady] = useState(false)
  const [androidModalHeight, setAndroidModalHeight] = useState<number | null>(null)
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [anuaBootSpinnerDismissed, setAnuaBootSpinnerDismissed] = useState(
    Platform.OS === "ios",
  )
  const anuaBootSpinnerOpacity = useSharedValue(Platform.OS === "ios" ? 0 : 1)
  const anuaBootSpinnerStyle = useAnimatedStyle(() => ({
    opacity: anuaBootSpinnerOpacity.value,
  }))

  useEffect(() => {
    if (!visible) {
      if (Platform.OS === "android") {
        anuaBootSpinnerOpacity.value = 1
        setAnuaBootSpinnerDismissed(false)
      }
      setContentReady(false)
      setAndroidModalHeight(null)
      if (fallbackTimeoutRef.current != null) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
      return
    }
    if (Platform.OS === "ios") {
      setContentReady(true)
      return
    }
    fallbackTimeoutRef.current = setTimeout(() => {
      fallbackTimeoutRef.current = null
      setContentReady(true)
    }, 600)
    return () => {
      if (fallbackTimeoutRef.current != null) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    }
  }, [visible, anuaBootSpinnerOpacity])

  useEffect(() => {
    if (!visible || Platform.OS === "ios") return
    if (contentReady) {
      anuaBootSpinnerOpacity.value = withTiming(
        0,
        { duration: SOMATIC_SPINNER_FADE_OUT_MS },
        (finished) => {
          if (finished) runOnJS(setAnuaBootSpinnerDismissed)(true)
        },
      )
    }
  }, [visible, contentReady, anuaBootSpinnerOpacity])

  const errorFallback = (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <AppText
        font="instrument-regular"
        size="base"
        style={{ color: "rgba(255,255,255,0.9)", textAlign: "center", marginBottom: 16 }}
      >
        Something went wrong
      </AppText>
      <Pressable
        onPress={onClose}
        style={{
          backgroundColor: "rgba(135, 174, 115, 0.4)",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <AppText font="instrument-medium" size="base" style={{ color: "#fff" }}>
          Close
        </AppText>
      </Pressable>
    </View>
  )

  const windowDimensions = Dimensions.get("window")
  const showContent = Platform.OS !== "android" || contentReady

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle={Platform.OS === "android" ? "fullScreen" : "pageSheet"}
      onRequestClose={onClose}
      onShow={() => {
        if (Platform.OS === "android") {
          if (fallbackTimeoutRef.current != null) {
            clearTimeout(fallbackTimeoutRef.current)
            fallbackTimeoutRef.current = null
          }
          setContentReady(true)
          setAndroidModalHeight(Dimensions.get("window").height)
        }
      }}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <GestureHandlerRootView
        style={[
          { flex: 1, backgroundColor: "#000" },
          Platform.OS === "android" && {
            width: windowDimensions.width,
            height: windowDimensions.height,
            minWidth: windowDimensions.width,
            minHeight: windowDimensions.height,
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          },
        ]}
        {...(Platform.OS === "android" && { unstable_forceActive: true })}
      >
        <View
          pointerEvents="box-none"
          style={{ flex: 1 }}
          collapsable={false}
        >
          <SafeAreaProvider style={{ flex: 1 }} pointerEvents="box-none">
            <ErrorBoundary fallback={errorFallback}>
              <View style={{ flex: 1 }} collapsable={false}>
                {showContent ? (
                  <AnuaChatPage
                    onClose={onClose}
                    chakraDay={chakraDay}
                    chakraName={chakraName}
                    isWaitingRoom={isWaitingRoom}
                    initialMessage={initialMessage}
                    androidModalHeight={androidModalHeight}
                  />
                ) : null}
                {Platform.OS === "android" &&
                  (!showContent || !anuaBootSpinnerDismissed) && (
                    <Animated.View
                      pointerEvents={showContent ? "none" : "auto"}
                      style={[
                        StyleSheet.absoluteFillObject,
                        {
                          backgroundColor: "#000",
                          justifyContent: "center",
                          alignItems: "center",
                        },
                        anuaBootSpinnerStyle,
                      ]}
                    >
                      {!showContent ? (
                        <ActivityIndicator
                          size="large"
                          color="rgba(135, 174, 115, 0.8)"
                        />
                      ) : null}
                    </Animated.View>
                  )}
              </View>
            </ErrorBoundary>
          </SafeAreaProvider>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

/** Inner content – must be inside SafeAreaProvider to get correct insets in Modal */
const AnuaChatContent: React.FC<{
  onClose: () => void
  useVoice: boolean
  setUseVoice: (v: boolean) => void
  messages: ChatMessage[]
  inputText: string
  setInputText: (v: string) => void
  isLoading: boolean
  error: string | null
  dailyTransmission: string | null
  isAnuaSpeaking: boolean
  scrollViewRef: React.RefObject<ScrollView | null>
  stickToBottomRef: React.MutableRefObject<boolean>
  handleSend: () => void
  formatTime: (date: Date) => string
  isRecording: boolean
  onStartRecording: () => void
  onStopRecordingAndSend: () => void
  /** On Android, set from Modal onShow so scroll area gets known-good height (forces re-layout). */
  androidModalHeight?: number | null
  chakraDay: number
}> = ({
  onClose,
  useVoice,
  setUseVoice,
  messages,
  inputText,
  setInputText,
  isLoading,
  error,
  dailyTransmission,
  isAnuaSpeaking,
  scrollViewRef,
  stickToBottomRef,
  handleSend,
  formatTime: _formatTime,
  isRecording,
  onStartRecording,
  onStopRecordingAndSend,
  androidModalHeight: _androidModalHeight,
  chakraDay,
}) => {
  const insets = useSafeAreaInsets()
  const addResonatedMessage = useAnuaMemoryStore((s) => s.addResonatedMessage)
  const removeResonatedMessage = useAnuaMemoryStore(
    (s) => s.removeResonatedMessage,
  )
  const hasResonatedWithMessage = useAnuaMemoryStore(
    (s) => s.hasResonatedWithMessage,
  )
  const hasSeenResonateTooltip = useAnuaMemoryStore(
    (s) => s.hasSeenResonateTooltip,
  )
  const latestAnuaMessageId = [...messages]
    .reverse()
    .find((message) => !message.isUser)?.id
  const setHasSeenResonateTooltip = useAnuaMemoryStore(
    (s) => s.setHasSeenResonateTooltip,
  )
  const addNote = useJourneyNotesStore((s) => s.addNote)
  const [noteSentForMessageId, setNoteSentForMessageId] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!noteSentForMessageId) return
    const t = setTimeout(() => setNoteSentForMessageId(null), 2000)
    return () => clearTimeout(t)
  }, [noteSentForMessageId])

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000000" }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Black top-fill to eliminate grey safe-area artifact (e.g. Android) */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: "#000000",
            zIndex: 0,
            ...(Platform.OS === "android" && { elevation: 0 }),
          }}
          pointerEvents="none"
        />
        {/* Header: left side only; close button is in its own top-most layer below. */}
        <View
          pointerEvents={Platform.OS === "android" ? "box-none" : "box-none"}
          collapsable={Platform.OS !== "android"}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#1f2937",
            ...(Platform.OS === "android" && {
              zIndex: 10,
              elevation: 10,
              backgroundColor: "#000000",
            }),
          }}
        >
          <View
            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            pointerEvents={Platform.OS === "android" ? "none" : "box-none"}
            {...(Platform.OS === "android" && {
              focusable: false,
              importantForAccessibility: "no-hide-descendants" as const,
            })}
          >
            <View
              style={{
                width: 48,
                height: 48,
                marginRight: 12,
                backgroundColor: "transparent",
              }}
              {...(Platform.OS === "android" && {
                focusable: false,
                importantForAccessibility: "no" as const,
              })}
            >
              <Image
                source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
                resizeMode="contain"
                style={{ width: 48, height: 48, backgroundColor: "transparent" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                font="cormorant-italic"
                size="xl"
                style={{ color: "rgba(255, 248, 235, 0.92)" }}
              >
                Talk to Anua
              </AppText>
              <AppText
                font="cormorant-regular"
                size="sm"
                style={{ color: "rgba(232, 213, 183, 0.55)", marginTop: 4 }}
              >
                Your guide for the journey
                {__DEV__ && Platform.OS === "android" ? " · Android" : ""}
              </AppText>
            </View>
          </View>
        </View>

        {/* Close button: dedicated top-most layer so it always receives touches (Android). Top of safe content; on Android align with header row (logo). */}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: Platform.OS === "android" ? 18 : insets.top,
            right: 16,
            zIndex: 9999,
            ...(Platform.OS === "android" && { elevation: 9999 }),
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              padding: 8,
              ...(Platform.OS === "android" && {
                minWidth: 48,
                minHeight: 48,
                justifyContent: "center",
                alignItems: "center",
              }),
            }}
            hitSlop={TOUCH.hitSlop}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        {/* Voice/Text Mode Toggle - right padding so "Tap to switch" doesn't sit under close X */}
        {isElevenLabsAvailable() && (
          <View
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              paddingRight: 56,
              borderBottomWidth: 1,
              borderBottomColor: "#1f2937",
            }}
          >
            {Platform.OS === "android" ? (
              <TouchableOpacity
                onPress={() => setUseVoice(!useVoice)}
                hitSlop={TOUCH.hitSlop}
                activeOpacity={TOUCH.activeOpacity}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={useVoice ? "volume-high" : "chatbubble-outline"}
                    size={20}
                    color={useVoice ? "#9333ea" : "#6b7280"}
                  />
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={{ color: "#9ca3af", marginLeft: 8 }}
                  >
                    {useVoice ? "Voice mode" : "Text only"}
                  </AppText>
                </View>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{ color: "#6b7280" }}
                >
                  Tap to switch
                </AppText>
              </TouchableOpacity>
            ) : (
              <Pressable
                onPress={() => setUseVoice(!useVoice)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={useVoice ? "volume-high" : "chatbubble-outline"}
                    size={20}
                    color={useVoice ? "#9333ea" : "#6b7280"}
                  />
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={{ color: "#9ca3af", marginLeft: 8 }}
                  >
                    {useVoice ? "Voice mode" : "Text only"}
                  </AppText>
                </View>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{ color: "#6b7280" }}
                >
                  Tap to switch
                </AppText>
              </Pressable>
            )}
          </View>
        )}

        {/* Chronological feed: oldest at top, Anua streams downward, newest at bottom. */}
        <ScrollView
          ref={scrollViewRef as React.RefObject<ScrollView>}
          style={{
            flex: 1,
            ...(Platform.OS === "android" && { zIndex: 0, elevation: 0 }),
          }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 28,
          }}
          keyboardShouldPersistTaps="handled"
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent
            stickToBottomRef.current =
              contentOffset.y + layoutMeasurement.height >=
              contentSize.height - 80
          }}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (stickToBottomRef.current) {
              scrollViewRef.current?.scrollToEnd({ animated: false })
            }
          }}
          showsVerticalScrollIndicator={false}
        >
            {dailyTransmission && (
              <View
                style={[
                  chatStyles.messageRow,
                  chatStyles.messageRowLeft,
                  { marginBottom: 8, paddingTop: 4 },
                ]}
              >
                <View style={chatStyles.anuaColumn}>
                  <AppText
                    font="cormorant-italic"
                    size="sm"
                    style={chatStyles.senderText}
                  >
                    Anua · a note for today
                  </AppText>
                  <AnuaMessageText
                    text={dailyTransmission}
                    style={chatStyles.anuaBody}
                    tone="anua"
                  />
                </View>
              </View>
            )}

            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  chatStyles.messageRow,
                  message.isUser
                    ? chatStyles.messageRowRight
                    : chatStyles.messageRowLeft,
                ]}
              >
                {message.isUser ? (
                  <View style={chatStyles.messageBubbleRight}>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={chatStyles.userBody}
                    >
                      {message.text}
                    </AppText>
                  </View>
                ) : (
                  <View style={chatStyles.anuaColumn}>
                    <AppText
                      font="cormorant-italic"
                      size="sm"
                      style={chatStyles.senderText}
                    >
                      Anua
                      {message.isStreaming ? "  ·" : ""}
                      {isAnuaSpeaking &&
                      !message.isStreaming &&
                      message.id === latestAnuaMessageId
                        ? "  · speaking"
                        : ""}
                    </AppText>
                    {(message.text.length > 0 || message.isStreaming) && (
                      <AnuaMessageText
                        text={message.text}
                        style={chatStyles.anuaBody}
                        isStreaming={message.isStreaming}
                        tone="anua"
                      />
                    )}
                    {!message.isStreaming && message.text.length > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 10,
                        gap: 12,
                        flexWrap: "wrap",
                        width: "100%",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            addHapticFeedback(HapticStrength.Light)
                            if (!hasSeenResonateTooltip) {
                              setHasSeenResonateTooltip(true)
                            }
                            if (hasResonatedWithMessage(message.id)) {
                              removeResonatedMessage(message.id)
                            } else {
                              addResonatedMessage(
                                message.id,
                                message.text,
                                chakraDay,
                              )
                            }
                          }}
                          hitSlop={8}
                          style={{ padding: 4 }}
                        >
                          <Ionicons
                            name={
                              hasResonatedWithMessage(message.id)
                                ? "heart"
                                : "heart-outline"
                            }
                            size={20}
                            color={
                              hasResonatedWithMessage(message.id)
                                ? "rgba(212, 165, 116, 0.85)"
                                : "rgba(212, 197, 169, 0.55)"
                            }
                          />
                        </Pressable>
                        {hasResonatedWithMessage(message.id) && (
                          <AppText
                            font="cormorant-italic"
                            size="xs"
                            style={{
                              color: "rgba(212, 197, 169, 0.8)",
                            }}
                          >
                            This resonates
                          </AppText>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            addHapticFeedback(HapticStrength.Light)
                            addNote({
                              chakraDay,
                              content: message.text,
                              type: "journey",
                            })
                            setNoteSentForMessageId(message.id)
                          }}
                          hitSlop={8}
                          style={{ paddingVertical: 4, paddingHorizontal: 2 }}
                        >
                          <AppText
                            font="cormorant-italic"
                            size="xs"
                            style={{
                              color: "rgba(212, 197, 169, 0.7)",
                            }}
                          >
                            Send to notes
                          </AppText>
                        </Pressable>
                        {noteSentForMessageId === message.id && (
                          <AppText
                            font="cormorant-italic"
                            size="xs"
                            style={{ color: "rgba(168, 201, 154, 0.85)" }}
                          >
                            Added to Notes
                          </AppText>
                        )}
                      </View>
                    </View>
                    )}
                  </View>
                )}
              </View>
            ))}

            {isLoading &&
              !messages.some((message) => message.isStreaming) && (
                <View style={[chatStyles.messageRow, chatStyles.messageRowLeft]}>
                  <AppText
                    font="cormorant-italic"
                    size="sm"
                    style={{ color: "rgba(232, 213, 183, 0.55)" }}
                  >
                    Anua is gathering presence…
                  </AppText>
                </View>
              )}

            {error && (
              <View style={[chatStyles.messageRow, chatStyles.messageRowLeft]}>
                <AppText
                  font="cormorant-italic"
                  size="sm"
                  style={{ color: "rgba(248, 180, 180, 0.9)" }}
                >
                  {error}
                </AppText>
              </View>
            )}
        </ScrollView>

        {/* Input Section - Tribe-style for consistent chat UX */}
        <View
          style={{
            ...chatStyles.inputRow,
            paddingHorizontal: 16,
            paddingBottom: Math.max(40, 72),
            backgroundColor: "#000",
          }}
        >
          <TextInput
            style={[
              chatStyles.input,
              { textAlignVertical: "top", minHeight: 52 },
            ]}
            value={inputText}
            onChangeText={(text) => {
              const sanitized = text.replace(/[<>]/g, "")
              setInputText(
                sanitized.length <= ANUA_INPUT_MAX_LENGTH
                  ? sanitized
                  : sanitized.slice(0, ANUA_INPUT_MAX_LENGTH),
              )
            }}
            placeholder="Ask Anua anything..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            maxLength={ANUA_INPUT_MAX_LENGTH}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            spellCheck={false}
            autoCorrect={false}
            selectTextOnFocus={false}
            contextMenuHidden
          />
          {Platform.OS === "android" ? (
            <TouchableOpacity
              onPress={isRecording ? onStopRecordingAndSend : onStartRecording}
              disabled={isLoading}
              hitSlop={TOUCH.hitSlop}
              activeOpacity={TOUCH.activeOpacity}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isRecording
                  ? "rgba(220, 38, 38, 0.4)"
                  : "rgba(135, 174, 115, 0.2)",
                borderWidth: 1,
                borderColor: isRecording
                  ? "rgba(220, 38, 38, 0.6)"
                  : "rgba(135, 174, 115, 0.4)",
                justifyContent: "center",
                alignItems: "center",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isRecording ? (
                <Ionicons name="stop" size={20} color="rgba(255,255,255,0.95)" />
              ) : (
                <Ionicons name="mic" size={20} color="rgba(255,255,255,0.95)" />
              )}
            </TouchableOpacity>
          ) : (
            <Pressable
              onPress={isRecording ? onStopRecordingAndSend : onStartRecording}
              disabled={isLoading}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isRecording
                  ? "rgba(220, 38, 38, 0.4)"
                  : "rgba(135, 174, 115, 0.2)",
                borderWidth: 1,
                borderColor: isRecording
                  ? "rgba(220, 38, 38, 0.6)"
                  : "rgba(135, 174, 115, 0.4)",
                justifyContent: "center",
                alignItems: "center",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isRecording ? (
                <Ionicons name="stop" size={20} color="rgba(255,255,255,0.95)" />
              ) : (
                <Ionicons name="mic" size={20} color="rgba(255,255,255,0.95)" />
              )}
            </Pressable>
          )}
          {Platform.OS === "android" ? (
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              hitSlop={TOUCH.hitSlop}
              activeOpacity={TOUCH.activeOpacity}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(135, 174, 115, 0.25)",
                borderWidth: 1,
                borderColor: "rgba(135, 174, 115, 0.5)",
                justifyContent: "center",
                alignItems: "center",
                opacity: !inputText.trim() || isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.95)" />
              ) : (
                <Ionicons name="send" size={20} color="rgba(255,255,255,0.95)" />
              )}
            </TouchableOpacity>
          ) : (
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(135, 174, 115, 0.25)",
                borderWidth: 1,
                borderColor: "rgba(135, 174, 115, 0.5)",
                justifyContent: "center",
                alignItems: "center",
                opacity: !inputText.trim() || isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.95)" />
              ) : (
                <Ionicons name="send" size={20} color="rgba(255,255,255,0.95)" />
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
