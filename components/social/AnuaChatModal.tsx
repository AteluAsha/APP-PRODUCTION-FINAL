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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  useWindowDimensions,
  Alert,
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
import { speakAsAnua, isElevenLabsAvailable } from "@/src/services/elevenlabs"
import { performIntroRitual } from "@/src/services/anuaRitualService"
import {
  generateDailyTransmission,
  isWisdomEngineAvailable,
} from "@/src/services/wisdomEngine"
import { LinearGradient } from "expo-linear-gradient"

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

export const AnuaChatModal: React.FC<AnuaChatModalProps> = ({
  visible,
  onClose,
  chakraDay,
  chakraName,
  isWaitingRoom = false,
  initialMessage = null,
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

  // Load daily transmission asynchronously (non-blocking) - optional feature
  // This loads in the background and doesn't block the chat from opening
  useEffect(() => {
    if (visible) {
      // Defer loading to not block initial render
      const timeoutId = setTimeout(() => {
        // Load in background without blocking UI
        if (isWisdomEngineAvailable() && !dailyTransmission) {
          generateDailyTransmission(chakraDay)
            .then((transmission) => {
              if (transmission) {
                setDailyTransmission(transmission)
              }
            })
            .catch((err) => {
              // Silently fail - daily transmission is optional
              if (__DEV__) {
                console.warn(
                  "Daily transmission loading failed (optional):",
                  err,
                )
              }
            })
        }
      }, 1000) // Delay to ensure chat opens quickly first

      return () => clearTimeout(timeoutId)
    } else {
      setDailyTransmission(null)
    }
  }, [visible, chakraDay]) // eslint-disable-line react-hooks/exhaustive-deps

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
          speakAsAnua(response)
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
          speakAsAnua(response)
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

  useEffect(() => {
    if (!visible && isRecording && recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {})
      recordingRef.current = null
      setIsRecording(false)
    }
  }, [visible, isRecording])

  // Initialize with Anua's greeting when modal opens
  useEffect(() => {
    if (visible && messages.length === 0) {
      initialMessageSentRef.current = false
      let greetingText: string

      if (isWaitingRoom) {
        // Waiting room: More informative, trial-focused, educational about all chakras
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
        // Regular chat: Wise question (not day-specific)
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

      // Anua never auto-speaks on launch except: waiting room first open plays course intro once (below).
    } else if (!visible) {
      setMessages([])
      setInputText("")
      setError(null)
      initialMessageSentRef.current = false
      waitingRoomCourseIntroStartedRef.current = false
    }
  }, [visible, isWaitingRoom, initialMessage])

  // Course intro: only when opening Anua from waiting room, and only the first time ever (persisted).
  useEffect(() => {
    if (!visible || !isWaitingRoom || waitingRoomCourseIntroStartedRef.current)
      return
    waitingRoomCourseIntroStartedRef.current = true
    let cancelled = false
    AsyncStorage.getItem(HAS_PLAYED_WAITING_ROOM_COURSE_INTRO_KEY).then(
      (value) => {
        if (cancelled || value === "true") return
        performIntroRitual()
          .then(() => {
            if (!cancelled)
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
      cancelled = true
    }
  }, [visible, isWaitingRoom])

  // Auto-send initialMessage (e.g. from Notes "Send thought to Anua") - runs after greeting
  useEffect(() => {
    if (
      !visible ||
      !initialMessage?.trim() ||
      initialMessageSentRef.current ||
      isLoading
    )
      return
    if (messages.length < 1) return // Wait for greeting

    initialMessageSentRef.current = true
    sendMessage(initialMessage)
  }, [visible, initialMessage, messages.length, isLoading, sendMessage])

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaProvider>
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
        />
      </SafeAreaProvider>
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
}) => {
  const { height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  // Min height so scroll content fills the viewport and messages anchor at bottom (like Tribe Chat)
  const headerH = 88
  const voiceToggleH = isElevenLabsAvailable() ? 52 : 0
  const inputRowH = 100
  const scrollMinHeight = Math.max(
    200,
    windowHeight -
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#1f2937",
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
              resizeMode="contain"
              style={{ width: 48, height: 48, marginRight: 12 }}
            />
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
              </AppText>
            </View>
          </View>
          <Pressable onPress={onClose} style={{ padding: 8 }}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        {/* Voice/Text Mode Toggle */}
        {isElevenLabsAvailable() && (
          <View
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#1f2937",
            }}
          >
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
          </View>
        )}

        {/* Messages: Chat starts at bottom above input (like Tribe Chat); quote at top; scroll up for older */}
        <ScrollView
          ref={scrollViewRef as React.RefObject<ScrollView>}
          style={{ flex: 1 }}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
