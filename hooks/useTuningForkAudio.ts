/**
 * Tuning Fork Audio Hook
 *
 * Fetches tuning fork master files from Firebase Storage
 * Files are in: TuningForkAudio folder
 * Base path: gs://soul-school-367ee.firebasestorage.app/TuningForkAudio
 *
 * Day Mapping (Monday = Day 0):
 * - Monday (Day 0) - ROOT: Day1 (396 Hz)
 * - Tuesday (Day 1) - SACRAL: Day2 (417 Hz)
 * - Wednesday (Day 2) - SOLAR_PLEXUS: Day3 (528 Hz)
 * - Thursday (Day 3) - HEART: Day4 (639 Hz)
 * - Friday (Day 4) - THROAT: Day5 (741 Hz)
 * - Saturday (Day 5) - THIRD_EYE: Day6 (852 Hz)
 * - Sunday (Day 6) - CROWN: Day7 (963 Hz)
 */

import { useState, useEffect } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/src/services/firebase"
import { Chakra } from "@/types/chakras/Chakra"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { getCachedAudioUrl, setCachedAudioUrl } from "@/src/utils/audioCache"
import { retryWithBackoff, isRetryableError } from "@/src/utils/audioRetry"
import { getLocalAudioUri } from "@/src/utils/audioDownload"
import { FIREBASE_TUNING_FORK_FOLDER } from "@/constants/firebaseStoragePaths"
import { SANCTUARY_TUNING_FORK_FILE } from "@/constants/sanctuaryAudioManifest"
// Audio import removed - duration extraction disabled to prevent crashes
// Duration will be determined by the audio player when it loads

const CHAKRA_TO_TUNING_FORK_FILE = SANCTUARY_TUNING_FORK_FILE

const STORAGE_FOLDER = FIREBASE_TUNING_FORK_FOLDER

export interface TuningForkAudioState {
  url: string | null
  localUri: string | null
  durationMs: number | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch Firebase Storage URL for tuning fork audio file
 * Also fetches metadata to get duration
 */
export const useTuningForkAudio = (chakra: Chakra) => {
  const [state, setState] = useState<TuningForkAudioState>({
    url: null,
    localUri: null,
    durationMs: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchAudioUrl = async () => {
      const audioFile = CHAKRA_TO_TUNING_FORK_FILE[chakra]
      const cacheKey = `tuning_fork_${chakra}_${audioFile}`
      const durationCacheKey = `tuning_fork_duration_${chakra}_${audioFile}`

      if (__DEV__) {
        console.log(`[useTuningForkAudio] Fetching audio for chakra: ${chakra}`)
        console.log(`[useTuningForkAudio] Audio file: ${audioFile}`)
      }

      try {
        if (!isMounted) return
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Check if Firebase Storage is initialized - retry if not ready
        if (!storage) {
          // Retry after a short delay if Firebase isn't ready yet
          if (__DEV__) {
            console.warn(
              "[useTuningForkAudio] Firebase Storage not initialized yet, retrying in 500ms",
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

        const audioId = `tuning_fork_${chakra}_${audioFile}`

        // Check cache for Firebase URL
        const cachedUrl = await getCachedAudioUrl(cacheKey)
        const cachedDuration = await getCachedAudioUrl(durationCacheKey)
        if (cachedUrl) {
          if (__DEV__) {
            console.log(`[useTuningForkAudio] Using cached URL for ${chakra}`)
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
              durationMs: cachedDuration ? parseInt(cachedDuration, 10) : null,
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

        const audioPath = `${STORAGE_FOLDER}/${audioFile}`

        if (__DEV__) {
          console.log(`[useTuningForkAudio] Fetching audio file: ${audioPath}`)
        }

        // Store storage in const for TypeScript narrowing
        const storageInstance = storage

        // Fetch URL from Firebase
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
            `[useTuningForkAudio] Successfully fetched audio URL for ${chakra}`,
          )
          console.log(
            `[useTuningForkAudio] Audio URL (first 100 chars): ${audioUrl.substring(0, 100)}...`,
          )
        }

        // Validate URL format (should be https://)
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

        // NOTE: Duration extraction is disabled for now to prevent crashes
        if (!isMounted) return
        setState({
          url: audioUrl,
          localUri,
          durationMs: null,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        const isNotFound =
          error instanceof Error &&
          (error.message.includes("object-not-found") ||
            error.message.includes("404"))
        if (__DEV__ && !isNotFound) {
          console.error(
            `Error fetching tuning fork audio for ${chakra}:`,
            error,
          )
        } else if (__DEV__ && isNotFound) {
          console.warn(
            `[useTuningForkAudio] ${chakra}: file not in Storage (expected)`,
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

        setState({
          url: null,
          localUri: null,
          durationMs: null,
          isLoading: false,
          error: new Error(errorMessage),
        })
      }
    }

    fetchAudioUrl()

    return () => {
      isMounted = false
    }
  }, [chakra])

  return state
}

/**
 * Get the hertz frequency for a given chakra
 */
export const getTuningForkHertz = (chakra: Chakra): string => {
  const hertzMap: Record<Chakra, string> = {
    [Chakra.ROOT]: "396",
    [Chakra.SACRAL]: "417",
    [Chakra.SOLAR_PLEXUS]: "528",
    [Chakra.HEART]: "639",
    [Chakra.THROAT]: "741",
    [Chakra.THIRD_EYE]: "852",
    [Chakra.CROWN]: "963",
  }
  return hertzMap[chakra] || "396"
}

/**
 * Get tuning fork audio filename for a given chakra
 */
export const getTuningForkFileName = (chakra: Chakra): string => {
  return CHAKRA_TO_TUNING_FORK_FILE[chakra]
}

/**
 * Format duration in milliseconds to readable format (e.g., "2:34")
 */
export const formatAudioDuration = (durationMs: number | null): string => {
  if (!durationMs) return ""
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
