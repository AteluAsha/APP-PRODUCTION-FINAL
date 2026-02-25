/**
 * Crystal Bowl Audio Hook
 *
 * Fetches 1-hour crystal bowl meditation audio from Firebase Storage.
 * Paths are case-sensitive. In Firebase Console → Storage, ensure folder and
 * filenames match exactly:
 *   Folder: crystal_Bowl_Meditation_Audio
 *   Files:  Day1_396hz_CrystalBowlSoundBath_Hero2.mov, Day2_417hz_1Hour_CrystalBowl_SoundBath.aac, Day3_528hz_CrystalBowl_1Hour_SoundBath.aac, etc.
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

/** Firebase Storage folder (case-sensitive). Must match Storage bucket exactly. */
export const CRYSTAL_BOWL_STORAGE_FOLDER = FIREBASE_CRYSTAL_BOWL_FOLDER

/** Chakra → crystal bowl filename (1hr). Only these 7 hero files; must match Storage exactly. */
const CHAKRA_TO_CRYSTAL_BOWL_FILE: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_396hz_CrystalBowlSoundBath_Hero2.mov",
  [Chakra.SACRAL]: "Day2_417hz_1Hour_CrystalBowl_SoundBath.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_CrystalBowl_1Hour_SoundBath.aac",
  [Chakra.HEART]: "Day4_639hz_CrystalBowl_Meditation_FrequencyHealing.aac",
  [Chakra.THROAT]: "Day5_741Hz_CrystalBowlMeditation.aac",
  [Chakra.THIRD_EYE]: "Day6_852hz_ChakraBowl_Medittion_Audio.aac",
  [Chakra.CROWN]: "Day7_963_Hertz_CrystalBowlMeditation.aac",
}

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

        // Check for downloaded local file first
        try {
          const audioId = `crystal_bowl_${chakra}_${audioFile}`
          const localUri = await getLocalAudioUri(audioId)
          if (localUri) {
            if (__DEV__) {
              console.log(
                `[useCrystalBowlAudio] Using local file for ${chakra}`,
              )
            }
            if (isMounted) {
              setState({
                url: null,
                localUri,
                durationMs: null,
                isLoading: false,
                error: null,
              })
            }
            return
          }
        } catch (localFileError) {
          if (__DEV__) {
            console.warn(
              `[useCrystalBowlAudio] Local file check failed, continuing to Firebase:`,
              localFileError,
            )
          }
        }

        // Check cache for Firebase URL
        const cachedUrl = await getCachedAudioUrl(cacheKey)
        if (cachedUrl) {
          if (__DEV__) {
            console.log(`[useCrystalBowlAudio] Using cached URL for ${chakra}`)
          }
          if (isMounted) {
            setState({
              url: cachedUrl,
              localUri: null,
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

        if (isMounted) {
          setState({
            url: audioUrl,
            localUri: null,
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
