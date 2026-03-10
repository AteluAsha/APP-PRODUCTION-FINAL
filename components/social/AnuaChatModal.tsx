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
  useWindowDimensions,
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
import {
  generateDailyTransmission,
  isWisdomEngineAvailable,
} from "@/src/services/wisdomEngine"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { LinearGradient } from "expo-linear-gradient"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { TOUCH } from "@/constants/layout"

/** Max characters for one Anua message; well under Gemini input token limit. */
const ANUA_INPUT_MAX_LENGTH = 25000

/** Persisted key: course intro plays only once, when opening Anua from waiting room the first time. */
const HAS_PLAYED_WAITING_ROOM_COURSE_INTRO_KEY = "hasPlayedWaitingRoomCourseIntro"

/** Chat bubble styles aligned with Tribe Chat: user right, Anua left; same text/bubble styling */
const chatStyles = StyleSheet.create({
  messageRow: { marginBottom: 14, paddingHorizontal: 8, flexDirection: "row" },
  messageRowLeft: { justifyContent: "flex-start" },
  messageRowRight: { justifyContent: "flex-end" },
  messageBubble: {
    maxWidth: "80%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  messageBubbleLeft: {
    borderColor: "rgba(135, 174, 115, 0.25)",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    borderColor: "rgba(168, 201, 154, 0.3)",
    backgroundColor: "rgba(135, 174, 115, 0.12)",
    borderBottomRightRadius: 4,
  },
  senderNameWrap: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  senderText: { color: "rgba(255, 255, 255, 0.98)" },
  messageText: { color: "rgba(255, 255, 255, 0.98)", marginTop: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(135, 174, 115, 0.25)",
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.3)",
    color: "#fff",
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
  const initialMessageSentRef = useRef(false)
  const waitingRoomCourseIntroStartedRef = useRef(false)
  const [isAnuaSpeaking, setIsAnuaSpeaking] = useState(false)
  const [pendingAnuaMessage, setPendingAnuaMessage] = useState<string | null>(
    null,
  )
  const [isRecording, setIsRecording] = useState(false)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const recordingDurationRef = useRef(0)

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
      setMessages((prev) => [...prev, userMessage])
      setInputText("")
      setIsLoading(true)
      setError(null)

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
          { temperature: 0.9, maxTokens: 500, enableVoice: false },
          context,
        )

        if (useVoice && isElevenLabsAvailable()) {
          setIsAnuaSpeaking(true)
          setPendingAnuaMessage(response)
          speakAsAnua(response, undefined, () => introCancelledRef.current)
            .then(() => {
              const anuaMessage: ChatMessage = {
                id: `anua-${Date.now()}`,
                text: response,
                isUser: false,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, anuaMessage])
            })
            .catch((err) => {
              if (__DEV__) {
                console.warn(
                  "Voice synthesis note (non-critical):",
                  err instanceof Error ? err.message : String(err),
                )
              }
              const anuaMessage: ChatMessage = {
                id: `anua-${Date.now()}`,
                text: response,
                isUser: false,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, anuaMessage])
            })
            .finally(() => {
              setIsAnuaSpeaking(false)
              setPendingAnuaMessage(null)
            })
        } else {
          const anuaMessage: ChatMessage = {
            id: `anua-${Date.now()}`,
            text: response,
            isUser: false,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, anuaMessage])
        }
      } catch (err) {
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
      } finally {
        setIsLoading(false)
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
      setMessages((prev) => [...prev, userMsg])
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
        const response = await askAnuaWithAudio(audioUri, context)
        if (useVoice && isElevenLabsAvailable()) {
          setIsAnuaSpeaking(true)
          setPendingAnuaMessage(response)
          speakAsAnua(response, undefined, () => introCancelledRef.current)
            .then(() => {
              const anuaMessage: ChatMessage = {
                id: `anua-${Date.now()}`,
                text: response,
                isUser: false,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, anuaMessage])
            })
            .catch((err) => {
              if (__DEV__) console.warn("Voice synthesis:", err)
              const anuaMessage: ChatMessage = {
                id: `anua-${Date.now()}`,
                text: response,
                isUser: false,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, anuaMessage])
            })
            .finally(() => {
              setIsAnuaSpeaking(false)
              setPendingAnuaMessage(null)
            })
        } else {
          const anuaMessage: ChatMessage = {
            id: `anua-${Date.now()}`,
            text: response,
            isUser: false,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, anuaMessage])
        }
      } catch (err) {
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
      } finally {
        setIsLoading(false)
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
  const introCancelledRef = useRef(false)
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
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
          handleSend={handleSend}
          formatTime={formatTime}
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecordingAndSend={stopRecordingAndSend}
          androidModalHeight={androidModalHeight}
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

  useEffect(() => {
    if (!visible) {
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
  }, [visible])

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
      animationType={Platform.OS === "android" ? "fade" : "slide"}
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
              {showContent ? (
                <AnuaChatPage
                  onClose={onClose}
                  chakraDay={chakraDay}
                  chakraName={chakraName}
                  isWaitingRoom={isWaitingRoom}
                  initialMessage={initialMessage}
                  androidModalHeight={androidModalHeight}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#000",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="rgba(135, 174, 115, 0.8)" />
                </View>
              )}
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
  handleSend: () => void
  formatTime: (date: Date) => string
  isRecording: boolean
  onStartRecording: () => void
  onStopRecordingAndSend: () => void
  /** On Android, set from Modal onShow so scroll area gets known-good height (forces re-layout). */
  androidModalHeight?: number | null
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
  handleSend,
  formatTime,
  isRecording,
  onStartRecording,
  onStopRecordingAndSend,
  androidModalHeight,
}) => {
  const { height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  // On Android inside Modal, use known-good height from onShow when available; else Dimensions.get("window") so scroll area has valid height.
  const effectiveHeight =
    Platform.OS === "android"
      ? (androidModalHeight ?? Dimensions.get("window").height)
      : (windowHeight ?? Dimensions.get("window").height)
  // Min height so scroll content fills the viewport and messages anchor at bottom (like Tribe Chat)
  const headerH = 88
  const voiceToggleH = isElevenLabsAvailable() ? 52 : 0
  const inputRowH = 100
  const scrollMinHeight = Math.max(
    200,
    (effectiveHeight ?? 0) -
      insets.top -
      insets.bottom -
      headerH -
      voiceToggleH -
      inputRowH,
  )

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
                font="instrument-bold"
                size="xl"
                style={{ color: "#ffffff" }}
              >
                Talk to Anua
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "#9ca3af", marginTop: 4 }}
              >
                Your guide for the journey
                {__DEV__ && Platform.OS === "android" ? " · Android" : ""}
              </AppText>
            </View>
          </View>
        </View>

        {/* Close button: dedicated top-most layer so it always receives touches (Android). */}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: insets.top,
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

        {/* Messages: Chat starts at bottom above input (like Tribe Chat); quote at top; scroll up for older. Android: zIndex/elevation 0 so header stays on top for touch. */}
        <ScrollView
          ref={scrollViewRef as React.RefObject<ScrollView>}
          style={{
            flex: 1,
            ...(Platform.OS === "android" && { zIndex: 0, elevation: 0 }),
          }}
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: scrollMinHeight,
            paddingHorizontal: 8,
            paddingBottom: 20,
          }}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, minHeight: scrollMinHeight }}>
            {/* Anua's post of the day — same bubble as her messages, a little larger; chakra-focused, her voice */}
            {dailyTransmission && (
              <View
                style={[
                  chatStyles.messageRow,
                  chatStyles.messageRowLeft,
                  { marginBottom: 24, paddingTop: 8 },
                ]}
              >
                <View
                  style={[
                    chatStyles.messageBubble,
                    chatStyles.messageBubbleLeft,
                    {
                      maxWidth: "92%",
                      paddingVertical: 16,
                      paddingHorizontal: 18,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(212, 165, 116, 0.95)",
                      "rgba(180, 140, 100, 0.9)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={chatStyles.senderNameWrap}
                  >
                    <AppText
                      font="instrument-semibold"
                      size="xs"
                      style={chatStyles.senderText}
                    >
                      Anua · Post of the day
                    </AppText>
                  </LinearGradient>
                  <AppText
                    font="instrument-regular"
                    size="base"
                    style={{
                      color: "rgba(255, 255, 255, 0.98)",
                      lineHeight: 26,
                      marginTop: 2,
                    }}
                  >
                    {dailyTransmission}
                  </AppText>
                </View>
              </View>
            )}

            {/* Spacer: pushes messages to bottom so first/newest is right above input */}
            <View style={{ flex: 1, minHeight: 24 }} />

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
                <View
                  style={[
                    chatStyles.messageBubble,
                    message.isUser
                      ? chatStyles.messageBubbleRight
                      : chatStyles.messageBubbleLeft,
                  ]}
                >
                  <LinearGradient
                    colors={
                      message.isUser
                        ? [
                            "rgba(135, 174, 115, 0.95)",
                            "rgba(107, 142, 90, 0.9)",
                          ]
                        : [
                            "rgba(212, 165, 116, 0.95)",
                            "rgba(180, 140, 100, 0.9)",
                          ]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={chatStyles.senderNameWrap}
                  >
                    <AppText
                      font="instrument-semibold"
                      size="xs"
                      style={chatStyles.senderText}
                    >
                      {message.isUser ? "You" : "Anua"}
                    </AppText>
                  </LinearGradient>
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={chatStyles.messageText}
                  >
                    {message.text}
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      color: message.isUser
                        ? "rgba(168, 201, 154, 0.9)"
                        : "rgba(212, 197, 169, 0.8)",
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </AppText>
                </View>
              </View>
            ))}

            {isAnuaSpeaking && (
              <View style={[chatStyles.messageRow, chatStyles.messageRowLeft]}>
                <View
                  style={[
                    chatStyles.messageBubble,
                    chatStyles.messageBubbleLeft,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color="rgba(212, 165, 116, 0.9)"
                    />
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={chatStyles.messageText}
                    >
                      Anua is speaking...
                    </AppText>
                  </View>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={{ marginTop: 6, color: "rgba(212, 197, 169, 0.8)" }}
                  >
                    Listen with your heart
                  </AppText>
                </View>
              </View>
            )}

            {isLoading && !isAnuaSpeaking && (
              <View style={[chatStyles.messageRow, chatStyles.messageRowLeft]}>
                <View
                  style={[
                    chatStyles.messageBubble,
                    chatStyles.messageBubbleLeft,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color="rgba(212, 165, 116, 0.9)"
                    />
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={chatStyles.messageText}
                    >
                      Anua is gathering presence...
                    </AppText>
                  </View>
                </View>
              </View>
            )}

            {error && (
              <View style={[chatStyles.messageRow, chatStyles.messageRowLeft]}>
                <View
                  style={[
                    chatStyles.messageBubble,
                    chatStyles.messageBubbleLeft,
                    {
                      borderColor: "rgba(220, 38, 38, 0.4)",
                      backgroundColor: "rgba(127, 29, 29, 0.25)",
                    },
                  ]}
                >
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={{ color: "rgba(248, 113, 113, 0.98)" }}
                  >
                    {error}
                  </AppText>
                </View>
              </View>
            )}
          </View>
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
