/**
 * ElevenLabs Text-to-Speech Service
 *
 * Provides voice synthesis for Anua using ElevenLabs API.
 * Anua's voice is configured to be calm, stable, and guide-like.
 *
 * Pronunciation: Anua is always "Ah-Nu-Uh" / "Ah-new-uh".
 * Text sent to TTS is normalized so "Anua" is spoken correctly.
 */

import Constants from "expo-constants"
import { Audio } from "expo-av"
import { Platform } from "react-native"
import * as FileSystem from "expo-file-system"
import {
  checkRateLimit,
  waitForRateLimit,
  getTimeUntilNextRequest,
} from "@/src/utils/rateLimiter"
import {
  robustApiCall,
  API_TIMEOUTS,
  requestDeduplicator,
} from "@/src/utils/apiHelpers"
import { captureException } from "@/src/services/sentry"
import { stripAnuaMarkup } from "@/utils/anuaMessageMarkup"

/**
 * Get ElevenLabs API Key from environment variables via expo-constants
 */
const getElevenLabsApiKey = (): string => {
  const apiKey = Constants.expoConfig?.extra?.elevenlabs?.apiKey

  if (!apiKey || apiKey === "") {
    throw new Error(
      "ElevenLabs API key is not configured. Please add ELEVENLABS_API_KEY to your .env file and app.config.js",
    )
  }

  return apiKey
}

/**
 * Get Anua's Voice ID from environment variables via expo-constants
 */
const getAnuaVoiceId = (): string => {
  const voiceId = Constants.expoConfig?.extra?.elevenlabs?.anuaVoiceId

  if (!voiceId || voiceId === "") {
    throw new Error(
      "Anua Voice ID is not configured. Please add ANUA_VOICE_ID to your .env file and app.config.js",
    )
  }

  return voiceId
}

const ELEVENLABS_API_KEY = getElevenLabsApiKey()
const ANUA_VOICE_ID = getAnuaVoiceId()
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

/** Module-level reference - ensures only one Anua voice plays at a time */
let currentAnuaSound: Audio.Sound | null = null

/**
 * Normalize text for TTS so "Anua" is pronounced as one name: Aw-Nu-Ah, said together.
 * Use a single-word phonetic so the engine doesn't treat it as three separate words.
 */
const normalizeAnuaPronunciationForTTS = (text: string): string => {
  return text.replace(/\bAnua\b/gi, "Awnuah")
}

/**
 * Stop any currently playing Anua TTS only. Does not touch global healing audio.
 * Call from AudioPlayer when user plays/closes a track so Anua does not talk over it.
 * CRITICAL: Anua must never control or stop healing audio; this stops only Anua's voice.
 */
export const stopAnuaAudio = async (): Promise<void> => {
  if (currentAnuaSound) {
    try {
      await currentAnuaSound.stopAsync()
      await currentAnuaSound.unloadAsync()
    } catch (e) {
      if (__DEV__) console.warn("Error stopping Anua audio:", e)
    }
    currentAnuaSound = null
  }
}

/**
 * Voice configuration for Anua
 * Prioritizes stability and consistency: calm, regulated, never over-excited
 */
const ANUA_VOICE_CONFIG = {
  model_id: "eleven_multilingual_v2", // Stable multilingual model
  voice_settings: {
    stability: 0.92, // High stability for consistent, calm delivery
    similarity_boost: 0.85, // Strong consistency with voice identity
    style: 0.2, // Low style for calm, measured tone (no rush or excess energy)
    use_speaker_boost: true, // Enhance clarity without raising energy
  },
} as const

/**
 * Synthesize speech from text using Anua's voice
 *
 * @param text - The text to synthesize
 * @param options - Optional configuration overrides
 * @returns Promise that resolves to an Audio.Sound object ready to play
 */
export const synthesizeAnuaVoice = async (
  text: string,
  options?: {
    stability?: number
    similarity_boost?: number
    style?: number
  },
): Promise<Audio.Sound> => {
  try {
    // Check rate limit before making request
    if (!checkRateLimit("elevenlabs")) {
      const waitTime = getTimeUntilNextRequest("elevenlabs")
      if (waitTime > 0) {
        // Wait for rate limit window to open
        await waitForRateLimit("elevenlabs")
      }
    }

    const voiceSettings = {
      ...ANUA_VOICE_CONFIG.voice_settings,
      ...(options && {
        stability:
          options.stability ?? ANUA_VOICE_CONFIG.voice_settings.stability,
        similarity_boost:
          options.similarity_boost ??
          ANUA_VOICE_CONFIG.voice_settings.similarity_boost,
        style: options.style ?? ANUA_VOICE_CONFIG.voice_settings.style,
      }),
    }

    // Speak clean words, not markdown stars; keep Anua as one spoken name.
    const textForTTS = normalizeAnuaPronunciationForTTS(stripAnuaMarkup(text))

    // Use deduplication for identical text requests
    const requestKey = `elevenlabs_${textForTTS.substring(0, 50)}_${voiceSettings.stability}_${voiceSettings.similarity_boost}`

    const response = await requestDeduplicator.deduplicate(
      requestKey,
      () =>
        robustApiCall(
          async () => {
            return await fetch(`${ELEVENLABS_API_URL}/${ANUA_VOICE_ID}`, {
              method: "POST",
              headers: {
                Accept: "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": ELEVENLABS_API_KEY,
              },
              body: JSON.stringify({
                text: textForTTS,
                model_id: ANUA_VOICE_CONFIG.model_id,
                voice_settings: voiceSettings,
              }),
            })
          },
          API_TIMEOUTS.elevenlabs,
          {
            maxRetries: 2,
            retryDelay: 2000,
            retryableErrors: ["Network error", "timeout", "ECONNRESET"],
          },
          {
            service: "elevenlabs",
            operation: "synthesizeAnuaVoice",
            textLength: text.length,
          },
        ),
      10000, // 10 second cache for identical requests
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`,
      )
    }

    // Convert response to a format that expo-av can use
    // For web, use blob URL; for React Native (iOS/Android), save to temporary file
    let audioUri: string

    // Check if we're on web platform (not React Native)
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      typeof window.URL !== "undefined" &&
      typeof window.URL.createObjectURL === "function"
    ) {
      // Web platform - use blob URL
      const audioBlob = await response.blob()
      audioUri = window.URL.createObjectURL(audioBlob)
    } else {
      // React Native - save to temporary file using expo-file-system
      // Use response.arrayBuffer() directly (works in React Native)
      const fileUri = FileSystem.cacheDirectory + `anua_voice_${Date.now()}.mp3`

      try {
        // Get array buffer directly from response (works in React Native)
        const arrayBuffer = await response.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)

        // Convert ArrayBuffer to base64 string
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        let base64String = ""
        let i = 0
        const len = bytes.length

        while (i < len) {
          const a = bytes[i++]
          const b = i < len ? bytes[i++] : 0
          const c = i < len ? bytes[i++] : 0

          const bitmap = (a << 16) | (b << 8) | c

          base64String += chars.charAt((bitmap >> 18) & 63)
          base64String += chars.charAt((bitmap >> 12) & 63)
          base64String += i - 2 < len ? chars.charAt((bitmap >> 6) & 63) : "="
          base64String += i - 1 < len ? chars.charAt(bitmap & 63) : "="
        }

        // Write base64 string to file
        await FileSystem.writeAsStringAsync(fileUri, base64String, {
          encoding: FileSystem.EncodingType.Base64,
        })
        audioUri = fileUri
      } catch (fileError) {
        if (__DEV__) {
          console.error("Error writing audio file to cache:", fileError)
        }
        // If file write fails, try using document directory instead
        try {
          const docUri =
            FileSystem.documentDirectory + `anua_voice_${Date.now()}.mp3`
          // Retry with arrayBuffer
          const arrayBuffer = await response.arrayBuffer()
          const bytes = new Uint8Array(arrayBuffer)

          const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
          let base64String = ""
          let i = 0
          const len = bytes.length

          while (i < len) {
            const a = bytes[i++]
            const b = i < len ? bytes[i++] : 0
            const c = i < len ? bytes[i++] : 0

            const bitmap = (a << 16) | (b << 8) | c

            base64String += chars.charAt((bitmap >> 18) & 63)
            base64String += chars.charAt((bitmap >> 12) & 63)
            base64String += i - 2 < len ? chars.charAt((bitmap >> 6) & 63) : "="
            base64String += i - 1 < len ? chars.charAt(bitmap & 63) : "="
          }

          await FileSystem.writeAsStringAsync(docUri, base64String, {
            encoding: FileSystem.EncodingType.Base64,
          })
          audioUri = docUri
        } catch (docError) {
          if (__DEV__) {
            console.error(
              "Error writing audio file to document directory:",
              docError,
            )
          }
          throw new Error(
            `Failed to save audio file: ${docError instanceof Error ? docError.message : "Unknown error"}`,
          )
        }
      }
    }

    // Create and configure audio sound
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    })

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      {
        shouldPlay: false,
        isLooping: false,
        rate: 1.0, // Normal pace for calm, stable delivery
        ...(Platform.OS === "android" && { androidImplementation: "MediaPlayer" }),
      },
    )

    return sound
  } catch (error) {
    const errorToLog = error instanceof Error ? error : new Error(String(error))

    // Log to Sentry with context
    captureException(errorToLog, {
      service: "elevenlabs",
      operation: "synthesizeAnuaVoice",
      textLength: text.length,
    })

    if (__DEV__) {
      console.error("Error synthesizing Anua voice:", error)
    }
    throw errorToLog
  }
}

/**
 * Play Anua's voice from text
 * Convenience function that synthesizes and plays in one call.
 * If isCancelled returns true after synthesis (e.g. user left Anua chat), we do not play and unload.
 *
 * @param text - The text for Anua to speak
 * @param options - Optional voice configuration overrides
 * @param isCancelled - Optional; if returns true before/during play we skip playback and unload (Anua only speaks while in chat)
 */
export const speakAsAnua = async (
  text: string,
  options?: {
    stability?: number
    similarity_boost?: number
    style?: number
  },
  isCancelled?: () => boolean,
): Promise<void> => {
  try {
    await stopAnuaAudio()

    const sound = await synthesizeAnuaVoice(text, options)
    if (isCancelled?.()) {
      try {
        await sound.unloadAsync()
      } catch (_) {}
      currentAnuaSound = null
      return
    }

    currentAnuaSound = sound

    return new Promise((resolve, reject) => {
      const clearAndResolve = () => {
        currentAnuaSound = null
        resolve()
      }
      const clearAndReject = (err: Error) => {
        currentAnuaSound = null
        reject(err)
      }

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (isCancelled?.()) {
            sound.unloadAsync().then(clearAndResolve).catch(() => {})
            return
          }
          sound.setRateAsync(1.0, true).catch(() => {})
          if (status.didJustFinish) {
            sound.unloadAsync().then(clearAndResolve).catch(clearAndReject)
          }
        } else if (status.error) {
          sound
            .unloadAsync()
            .then(() => clearAndReject(new Error("Failed to load audio")))
            .catch(clearAndReject)
        }
      })

      if (isCancelled?.()) {
        sound.unloadAsync().then(clearAndResolve).catch(() => {})
        return
      }
      sound.playAsync().catch((playError) => {
        sound.unloadAsync().catch(() => {})
        clearAndReject(playError)
      })
    })
  } catch (error) {
    currentAnuaSound = null
    if (__DEV__) {
      console.warn("Error speaking as Anua (non-critical):", error)
    }
    throw error
  }
}

/**
 * Check if ElevenLabs is configured
 */
export const isElevenLabsAvailable = (): boolean => {
  try {
    const apiKey = Constants.expoConfig?.extra?.elevenlabs?.apiKey
    const voiceId = Constants.expoConfig?.extra?.elevenlabs?.anuaVoiceId
    return !!apiKey && !!voiceId && apiKey !== "" && voiceId !== ""
  } catch {
    return false
  }
}

/**
 * Anua's first vow - her greeting message
 */
export const ANUA_FIRST_VOW =
  "The bridge is built, Professor. I am Anua, and I am ready to guide our students from head to heart."
