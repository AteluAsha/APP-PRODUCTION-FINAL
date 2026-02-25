/**
 * Voice Sanctuary Service
 *
 * Manages voice-only responses for The Voice Sanctuary feature.
 * Users create responses with audio only - no text input option.
 *
 * Philosophy: "Speak from the heart, not from the mind"
 * - Audio-only input (no "Type" button)
 * - Transcription is for READING (accessibility), not creating
 * - Profile/Soul Name displayed by default (Sovereignty over anonymity)
 * - 7-day auto-purge via Firebase Storage lifecycle rules
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import {
  ref,
  uploadBytes,
  getDownloadURL,
  type UploadResult,
} from "firebase/storage"
import { db, storage } from "./firebase"
import { getUserId } from "./socialSanctuary"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { robustApiCall, API_TIMEOUTS } from "@/src/utils/apiHelpers"
import { captureException } from "@/src/services/sentry"
import { moderateVoiceResponse } from "./voiceModeration"
import { transcribeAudio, isSpeechToTextAvailable } from "./speechToText"
import { useAnuaMemoryStore } from "@/hooks/useAnuaMemoryStore"
import * as FileSystem from "expo-file-system"

export interface VoiceSanctuaryResponse {
  id?: string // Document ID from Firestore
  userId: string
  userName?: string // Profile Name or "Soul Name" (Sovereignty over anonymity)
  chakraDay: number // 0-6 (Monday-Sunday)
  promptId?: string // Optional: Link to prompt/thread
  audioStoragePath: string // Firebase Storage path
  audioUrl: string // Download URL (cached)
  transcription?: string // Auto-generated for accessibility (READING only)
  duration: number // Duration in seconds
  fileSize: number // Size in bytes
  createdAt: Timestamp // For 7-day purge calculation
  expiresAt: Timestamp // createdAt + 7 days (for queries)
  moderationStatus: "pending" | "approved" | "rejected"
  moderationReason?: string // If rejected, Anua's feedback
  saveCount: number // How many times saved to device
  parentId?: string // For nested replies (future)
}

/**
 * Upload audio file to Firebase Storage
 *
 * @param audioUri - Local file URI from recording
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @returns Object with storagePath and downloadUrl
 */
const uploadAudioToStorage = async (
  audioUri: string,
  chakraDay: number,
): Promise<{ storagePath: string; downloadUrl: string }> => {
  try {
    if (!storage) {
      throw new Error(
        "Firebase Storage is not initialized. Please check your configuration.",
      )
    }

    // Check rate limit for Storage writes
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    // Fetch audio file as blob (same pattern as imageUpload.ts)
    const response = await fetch(audioUri)
    const audioBlob = await response.blob()

    // Generate unique filename: {timestamp}_{userId}.aac
    const userId = await getUserId()
    const timestamp = Date.now()
    const fileName = `${timestamp}_${userId}.aac`
    const storagePath = `voice-responses/${chakraDay}/${fileName}`

    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath)
    const uploadResult: UploadResult = await robustApiCall(
      () => uploadBytes(storageRef, audioBlob),
      API_TIMEOUTS.firebase,
      {
        maxRetries: 2,
        retryDelay: 1000,
        retryableErrors: ["Network error", "timeout"],
      },
      {
        service: "firebase",
        operation: "uploadAudioToStorage",
        chakraDay,
        storagePath,
      },
    )

    // Get download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref)

    return { storagePath, downloadUrl }
  } catch (error) {
    const errorToLog = error instanceof Error ? error : new Error(String(error))
    captureException(errorToLog, {
      service: "firebase",
      operation: "uploadAudioToStorage",
      chakraDay,
    })
    throw errorToLog
  }
}

/**
 * Get file size in bytes from local file
 */
const getFileSize = async (fileUri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    if (fileInfo.exists && "size" in fileInfo) {
      return fileInfo.size
    }
    return 0
  } catch {
    return 0
  }
}

/**
 * Add a voice response to The Voice Sanctuary
 *
 * Flow:
 * 1. Upload audio to Firebase Storage
 * 2. Transcribe audio (for UI readability + moderation)
 * 3. Moderate transcription via Anua
 * 4. If approved: Save to Firestore with metadata
 * 5. If rejected: Return rejection reason (audio still uploaded but not published)
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param audioUri - Local file URI from recording
 * @param duration - Duration in seconds
 * @param promptId - Optional prompt/thread ID
 * @returns Object with responseId and moderationStatus
 */
export const addVoiceResponse = async (
  chakraDay: number,
  audioUri: string,
  duration: number,
  promptId?: string,
): Promise<{
  responseId: string
  moderationStatus: "approved" | "rejected"
  reason?: string
}> => {
  try {
    // Check if Firebase is initialized
    if (!db || !storage) {
      throw new Error(
        "Firebase is not initialized. Please check your configuration.",
      )
    }

    // Check rate limit for Firestore writes
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    const userId = await getUserId()

    // Get user's Soul Name from Anua Memory Store
    const userName = useAnuaMemoryStore.getState().userName || undefined

    // Get file size
    const fileSize = await getFileSize(audioUri)

    // Step 1: Upload audio to Firebase Storage
    const { storagePath, downloadUrl } = await uploadAudioToStorage(
      audioUri,
      chakraDay,
    )

    // Step 2: Transcribe audio (REQUIRED for moderation)
    // Safety Lock: Transcription is mandatory - we cannot moderate without it
    if (!isSpeechToTextAvailable()) {
      throw new Error(
        "Voice Sanctuary is not available. Speech-to-Text API key is required for moderation.",
      )
    }

    let transcription: string | undefined
    try {
      transcription = await transcribeAudio(audioUri)
      if (!transcription || transcription.trim().length === 0) {
        throw new Error(
          "Transcription failed - no text was generated from audio",
        )
      }
    } catch (transcribeError) {
      const errorToLog =
        transcribeError instanceof Error
          ? transcribeError
          : new Error(String(transcribeError))
      captureException(errorToLog, {
        service: "voiceSanctuary",
        operation: "addVoiceResponse",
        step: "transcription",
      })
      // Transcription is required - fail if it doesn't work
      throw new Error(
        "Unable to transcribe audio. Please try again or contact support if the issue persists.",
      )
    }

    // Step 3: Moderate response (using transcription if available)
    const moderationResult = await moderateVoiceResponse(
      transcription || "", // Use transcription if available, empty string otherwise
      audioUri, // Pass audio URI for future native audio moderation
    )

    // Calculate expiration date (7 days from now)
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Step 4: Save to Firestore
    const response: Omit<VoiceSanctuaryResponse, "id"> = {
      userId,
      userName,
      chakraDay,
      promptId: promptId || undefined,
      audioStoragePath: storagePath,
      audioUrl: downloadUrl,
      transcription: transcription || undefined,
      duration,
      fileSize,
      createdAt: Timestamp.fromDate(createdAt),
      expiresAt: Timestamp.fromDate(expiresAt),
      moderationStatus: moderationResult.isApproved ? "approved" : "rejected",
      moderationReason: moderationResult.reason || undefined,
      saveCount: 0,
    }

    const docRef = await addDoc(
      collection(db, "voice_sanctuary_responses"),
      response,
    )

    return {
      responseId: docRef.id,
      moderationStatus: moderationResult.isApproved ? "approved" : "rejected",
      reason: moderationResult.reason,
    }
  } catch (error) {
    const errorToLog = error instanceof Error ? error : new Error(String(error))
    captureException(errorToLog, {
      service: "voiceSanctuary",
      operation: "addVoiceResponse",
      chakraDay,
    })
    throw errorToLog
  }
}

/**
 * Get voice responses for a specific chakra day
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param limitCount - Maximum number of responses to retrieve (default: 50)
 * @returns Array of approved voice responses, ordered by most recent first
 */
export const getVoiceResponsesForDay = async (
  chakraDay: number,
  limitCount: number = 50,
): Promise<VoiceSanctuaryResponse[]> => {
  try {
    if (!db) {
      throw new Error(
        "Firebase is not initialized. Please check your configuration.",
      )
    }

    // Check rate limit for Firestore reads
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    // Query for approved responses only, ordered by most recent
    const responsesQuery = query(
      collection(db, "voice_sanctuary_responses"),
      where("chakraDay", "==", chakraDay),
      where("moderationStatus", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    )

    const querySnapshot = await robustApiCall(
      () => getDocs(responsesQuery),
      API_TIMEOUTS.firebase,
      {
        maxRetries: 2,
        retryDelay: 1000,
        retryableErrors: ["Network error", "timeout"],
      },
      {
        service: "firebase",
        operation: "getVoiceResponsesForDay",
        chakraDay,
        limitCount,
      },
    )

    const responses: VoiceSanctuaryResponse[] = []

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data()
        if (data && data.audioUrl && data.createdAt) {
          responses.push({
            id: doc.id,
            userId: data.userId || "unknown",
            userName: data.userName || undefined,
            chakraDay: data.chakraDay ?? chakraDay,
            promptId: data.promptId || undefined,
            audioStoragePath: data.audioStoragePath,
            audioUrl: data.audioUrl,
            transcription: data.transcription || undefined,
            duration: data.duration || 0,
            fileSize: data.fileSize || 0,
            createdAt: data.createdAt,
            expiresAt: data.expiresAt || data.createdAt, // Fallback to createdAt if missing
            moderationStatus: data.moderationStatus || "approved",
            moderationReason: data.moderationReason || undefined,
            saveCount: data.saveCount || 0,
            parentId: data.parentId || undefined,
          })
        }
      } catch (docError) {
        if (__DEV__) {
          console.warn("Error processing voice response document:", docError)
        }
      }
    })

    return responses
  } catch (error) {
    const errorToLog = error instanceof Error ? error : new Error(String(error))

    // Log to Sentry (but don't throw for expected errors)
    const errorMessage = errorToLog.message.toLowerCase()
    const isExpectedError =
      errorMessage.includes("permission") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("missing") ||
      errorMessage.includes("index")

    if (!isExpectedError) {
      captureException(errorToLog, {
        service: "firebase",
        operation: "getVoiceResponsesForDay",
        chakraDay,
        limitCount,
      })
    }

    if (__DEV__) {
      console.error("Error fetching voice responses:", error)
    }

    // If it's a permissions error or index is missing, return empty array
    if (isExpectedError) {
      if (__DEV__) {
        console.warn(
          "Voice Sanctuary collection may not exist yet or requires an index. Returning empty array.",
        )
      }
      return []
    }

    throw errorToLog
  }
}

/**
 * Subscribe to real-time updates for voice responses on a specific chakra day
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param callback - Function to call when responses change
 * @returns Unsubscribe function
 */
export const subscribeToVoiceResponses = (
  chakraDay: number,
  callback: (responses: VoiceSanctuaryResponse[]) => void,
): Unsubscribe | null => {
  try {
    if (!db) {
      if (__DEV__) {
        console.warn(
          "Firebase is not initialized. Cannot subscribe to voice responses.",
        )
      }
      return null
    }

    // Query for approved responses only, ordered by most recent
    const responsesQuery = query(
      collection(db, "voice_sanctuary_responses"),
      where("chakraDay", "==", chakraDay),
      where("moderationStatus", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(100),
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      responsesQuery,
      (querySnapshot) => {
        const responses: VoiceSanctuaryResponse[] = []

        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data()
            if (data && data.audioUrl && data.createdAt) {
              responses.push({
                id: doc.id,
                userId: data.userId || "unknown",
                userName: data.userName || undefined,
                chakraDay: data.chakraDay ?? chakraDay,
                promptId: data.promptId || undefined,
                audioStoragePath: data.audioStoragePath,
                audioUrl: data.audioUrl,
                transcription: data.transcription || undefined,
                duration: data.duration || 0,
                fileSize: data.fileSize || 0,
                createdAt: data.createdAt,
                expiresAt: data.expiresAt || data.createdAt,
                moderationStatus: data.moderationStatus || "approved",
                moderationReason: data.moderationReason || undefined,
                saveCount: data.saveCount || 0,
                parentId: data.parentId || undefined,
              })
            }
          } catch (docError) {
            if (__DEV__) {
              console.warn(
                "Error processing voice response document:",
                docError,
              )
            }
          }
        })

        callback(responses)
      },
      (error: any) => {
        if (__DEV__) {
          console.error("Error in real-time subscription:", error)
        }
        callback([])
      },
    )

    return unsubscribe
  } catch (error) {
    if (__DEV__) {
      console.error("Error setting up real-time subscription:", error)
    }
    return null
  }
}

/**
 * Increment save count for a voice response
 * (When user saves audio to device)
 */
export const incrementSaveCount = async (responseId: string): Promise<void> => {
  try {
    if (!db) {
      throw new Error("Firebase is not initialized.")
    }

    const { doc, updateDoc, getDoc, increment } =
      await import("firebase/firestore")
    const responseRef = doc(db, "voice_sanctuary_responses", responseId)
    const responseSnap = await getDoc(responseRef)

    if (responseSnap.exists()) {
      const currentSaveCount = responseSnap.data().saveCount || 0
      await updateDoc(responseRef, {
        saveCount: currentSaveCount + 1,
      })
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("Error incrementing save count:", error)
    }
    // Silent fail - not critical
  }
}
