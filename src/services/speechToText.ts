/**
 * Speech-to-Text Service
 *
 * Transcribes audio files to text for:
 * 1. UI readability (accessibility - users can READ voice responses)
 * 2. Moderation (text-based moderation via Anua)
 *
 * Note: Transcription is for READING, not creating.
 * Users create responses with voice only - no text input option.
 *
 * Implementation: Google Cloud Speech-to-Text API
 * Alternative: Could use Expo Speech API (limited) or other services
 */

import Constants from "expo-constants"
import * as FileSystem from "expo-file-system"
import { captureException } from "./sentry"

/**
 * Transcribe audio file to text
 *
 * @param audioUri - Local file URI from recording
 * @returns Transcribed text, or empty string if transcription fails
 */
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  try {
    // Check if Google Cloud Speech-to-Text API key is configured
    const speechApiKey = Constants.expoConfig?.extra?.googleCloudSpeechApiKey

    if (!speechApiKey || speechApiKey === "") {
      if (__DEV__) {
        console.warn(
          "Speech-to-Text: Google Cloud Speech API key not configured. Transcription will be skipped.",
        )
      }
      // Return empty string - moderation will proceed without transcription
      return ""
    }

    // Read audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    // Call Google Cloud Speech-to-Text API
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${speechApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "AAC", // AAC format from our recording
            sampleRateHertz: 44100, // Matches our recording settings
            languageCode: "en-US",
            enableAutomaticPunctuation: true,
          },
          audio: {
            content: audioBase64,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Speech-to-Text API error: ${response.status} - ${errorText}`,
      )
    }

    const data = await response.json()

    // Extract transcription from response
    if (data.results && data.results.length > 0) {
      const transcript = data.results
        .map((result: any) => result.alternatives[0]?.transcript || "")
        .join(" ")
        .trim()

      if (transcript) {
        return transcript
      }
    }

    // No transcription found
    if (__DEV__) {
      console.warn("Speech-to-Text: No transcription found in response")
    }
    return ""
  } catch (error) {
    const errorToLog = error instanceof Error ? error : new Error(String(error))

    // Log to Sentry but don't throw - allow response to proceed without transcription
    captureException(errorToLog, {
      service: "speechToText",
      operation: "transcribeAudio",
    })

    if (__DEV__) {
      console.error("Speech-to-Text: Error transcribing audio:", error)
    }

    // Return empty string - moderation will proceed without transcription
    return ""
  }
}

/**
 * Check if Speech-to-Text is available
 */
export const isSpeechToTextAvailable = (): boolean => {
  const speechApiKey = Constants.expoConfig?.extra?.googleCloudSpeechApiKey
  return !!(speechApiKey && speechApiKey !== "")
}
