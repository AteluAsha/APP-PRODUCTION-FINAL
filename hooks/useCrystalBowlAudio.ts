/**
 * Crystal Bowl Audio Hook
 *
 * Fetches 1-hour crystal bowl meditation audio from Firebase Storage.
 * Paths are case-sensitive. In Firebase Console → Storage, ensure folder and
 * filenames match exactly:
 *   Folder: crystal_Bowl_Meditation_Audio — filenames: sanctuaryAudioManifest SANCTUARY_CRYSTAL_BOWL_FILE
 */

import { useState, useEffect } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/src/services/firebase"
import { Chakra } from "@/types/chakras/Chakra"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { getCachedAudioUrl, setCachedAudioUrl } from "@/src/utils/audioCache"
import { retryWithBackoff, isRetryableError } from "@/src/utils/audioRetry"
import { getLocalAudioUri } from "@/src/utils/audioDownload"
import { FIREBASE_CRYSTAL_BOWL_FOLDER } from "@/constants/firebaseStoragePaths"
import { SANCTUARY_CRYSTAL_BOWL_FILE } from "@/constants/sanctuaryAudioManifest"

/** Firebase Storage folder (case-sensitive). Must match Storage bucket exactly. */
export const CRYSTAL_BOWL_STORAGE_FOLDER = FIREBASE_CRYSTAL_BOWL_FOLDER

const CHAKRA_TO_CRYSTAL_BOWL_FILE = SANCTUARY_CRYSTAL_BOWL_FILE

export interface CrystalBowlAudioState {
  url: string | null
  localUri: string | null
  durationMs: number | null
  isLoading: boolean
  error: Error | null
}

export const useCrystalBowlAudio = (chakra: Chakra) => {
  const [state, setState] = useState<CrystalBowlAudioState>({
    url: null,
    localUri: null,
    durationMs: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchAudioUrl = async () => {
      const audioFile = CHAKRA_TO_CRYSTAL_BOWL_FILE[chakra]
      const cacheKey = `crystal_bowl_${chakra}_${audioFile}`

      try {
        if (!isMounted) return
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Check if Firebase Storage is initialized
        if (!storage) {
          if (__DEV__) {
            console.warn(
              "[useCrystalBowlAudio] Firebase Storage not initialized yet, retrying in 500ms",
            )
          }
          setTimeout(() => {
            if (isMounted && storage) {
              fetchAudioUrl()
            } else if (isMounted) {
              setState({
                url: null,
                localUri: null,
                durationMs: null,
                isLoading: false,
                error: new Error(
                  "Firebase Storage is not initialized. Please check your configuration.",
                ),
              })
            }
          }, 500)
          return
        }

        const audioId = `crystal_bowl_${chakra}_${audioFile}`

        // Check cache for Firebase URL
        const cachedUrl = await getCachedAudioUrl(cacheKey)
        if (cachedUrl) {
          if (__DEV__) {
            console.log(`[useCrystalBowlAudio] Using cached URL for ${chakra}`)
          }
          let localUri: string | null = null
          try {
            localUri = await getLocalAudioUri(audioId)
          } catch {
            // ignore
          }
          if (isMounted) {
            setState({
              url: cachedUrl,
              localUri,
              durationMs: null,
              isLoading: false,
              error: null,
            })
          }
          return
        }

        // Check rate limit for Firebase Storage reads
        if (!checkRateLimit("firebase")) {
          await waitForRateLimit("firebase")
        }

        const audioPath = `${CRYSTAL_BOWL_STORAGE_FOLDER}/${audioFile}`

        if (__DEV__) {
          console.log(`[useCrystalBowlAudio] Fetching audio file: ${audioPath}`)
        }

        // Fetch URL from Firebase
        if (!storage) {
          throw new Error("Firebase Storage is not initialized")
        }
        // Type assertion: storage is non-null after the check above
        const storageInstance = storage
        const audioUrl = await retryWithBackoff(
          async () => {
            return await getDownloadURL(ref(storageInstance, audioPath))
          },
          {
            maxRetries: 3,
            initialDelayMs: 1000,
            maxDelayMs: 5000,
          },
        )

        if (__DEV__) {
          console.log(
            `[useCrystalBowlAudio] Successfully fetched audio URL for ${chakra}`,
          )
        }

        // Validate URL format
        if (!audioUrl || !audioUrl.startsWith("http")) {
          throw new Error(
            `Invalid audio URL format: ${audioUrl?.substring(0, 50)}`,
          )
        }

        // Cache the URL
        await setCachedAudioUrl(cacheKey, audioUrl)

        let localUri: string | null = null
        try {
          localUri = await getLocalAudioUri(audioId)
        } catch {
          // ignore
        }

        if (isMounted) {
          setState({
            url: audioUrl,
            localUri,
            durationMs: null,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        const isNotFound =
          error instanceof Error &&
          (error.message.includes("object-not-found") ||
            error.message.includes("404"))
        if (__DEV__ && !isNotFound) {
          console.error(
            `Error fetching crystal bowl audio for ${chakra}:`,
            error,
          )
        } else if (__DEV__ && isNotFound) {
          console.warn(
            `[useCrystalBowlAudio] ${chakra}: file not in Storage (expected)`,
          )
        }

        let errorMessage = "Failed to fetch audio URL"
        if (error instanceof Error) {
          if (
            error.message.includes("object-not-found") ||
            error.message.includes("404")
          ) {
            errorMessage = `Audio file not found in Firebase Storage. Please verify the file exists: ${audioFile}`
          } else if (
            error.message.includes("permission") ||
            error.message.includes("403")
          ) {
            errorMessage =
              "Permission denied. Please check Firebase Storage rules."
          } else if (isRetryableError(error)) {
            errorMessage =
              "Network error. Please check your connection and try again."
          } else {
            errorMessage = error.message
          }
        }
        if (isMounted) {
          setState({
            url: null,
            localUri: null,
            durationMs: null,
            isLoading: false,
            error: new Error(errorMessage),
          })
        }
      }
    }

    fetchAudioUrl()

    return () => {
      isMounted = false
    }
  }, [chakra])

  return state
}

export const getCrystalBowlFileName = (chakra: Chakra): string => {
  return CHAKRA_TO_CRYSTAL_BOWL_FILE[chakra]
}
