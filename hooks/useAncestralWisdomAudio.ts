/**
 * Ancestral Wisdom Audio Hook
 *
 * Fetches the hero "Power of Creation" (and future Divine Law) audios from Firebase.
 * Folder: AncestralWisdomAudioFiles_Days_1_7
 * Base: gs://soul-school-367ee.firebasestorage.app
 *
 * Day 1–7: All Divine Law hero audios configured.
 */

import { useState, useEffect } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/src/services/firebase"
import { Chakra } from "@/types/chakras/Chakra"
import { AVPlaybackSource } from "expo-av"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { getCachedAudioUrl, setCachedAudioUrl } from "@/src/utils/audioCache"
import { retryWithBackoff, isRetryableError } from "@/src/utils/audioRetry"
import { getLocalAudioUri } from "@/src/utils/audioDownload"
import { FIREBASE_ANCESTRAL_WISDOM_FOLDER } from "@/constants/firebaseStoragePaths"

const STORAGE_FOLDER = FIREBASE_ANCESTRAL_WISDOM_FOLDER

const CHAKRA_TO_ANCESTRAL_FILE: Partial<Record<Chakra, string>> = {
  [Chakra.ROOT]: "Day1_7th_DivineLaw_With_Asha.aac",
  [Chakra.SACRAL]: "day2_theauthenticself_6th_DivineLaw_POLARITY_With_Asha.aac",
  [Chakra.SOLAR_PLEXUS]:
    "day3_egoheartrailroad_5thdivinelaw_causeandeffect_With_Asha_Length_12minutes.aac",
  [Chakra.HEART]: "Day4_AWAKENINGTHEHEART_4thDivinelaw_Rhythm_With_Asha.aac",
  [Chakra.THROAT]:
    "Day5_ThePOWEROfVibration_Vishuddha_3rd_DivineLaw_With_Asha.aac",
  [Chakra.THIRD_EYE]:
    "Day6_LISTENINGTOTHECOSMOS_2nd_DivineLaw_Correspodence_With_Asha.aac",
  [Chakra.CROWN]:
    "Day7_THEMEADOWOFTHESOUL_1stDivineLaw_Mentalism_With_Asha.aac",
}

export interface AncestralWisdomAudioState {
  source: AVPlaybackSource | null
  url: string | null
  localUri: string | null
  isLoading: boolean
  error: Error | null
}

/** Audio ID for download/cache – used by Music Room for offline listening */
export function getHeadToHeartAudioId(chakra: Chakra): string {
  const audioFile = CHAKRA_TO_ANCESTRAL_FILE[chakra]
  return audioFile
    ? `head_to_heart_${chakra}_${audioFile}`
    : `head_to_heart_${chakra}`
}

export const useAncestralWisdomAudio = (chakra: Chakra) => {
  const [state, setState] = useState<AncestralWisdomAudioState>({
    source: null,
    url: null,
    localUri: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    const audioFile = CHAKRA_TO_ANCESTRAL_FILE[chakra]
    if (!audioFile) {
      setState({
        source: null,
        url: null,
        localUri: null,
        isLoading: false,
        error: null,
      })
      return
    }

    const audioId = getHeadToHeartAudioId(chakra)
    const cacheKey = audioId

    const fetchUrl = async () => {
      try {
        if (!isMounted) return
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Check if Firebase Storage is initialized
        if (!storage) {
          if (__DEV__) {
            console.warn(
              "[useAncestralWisdomAudio] Firebase Storage not initialized yet, retrying in 500ms",
            )
          }
          setTimeout(() => {
            if (isMounted && storage) {
              fetchUrl()
            } else if (isMounted) {
              setState({
                source: null,
                url: null,
                localUri: null,
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
          const localUri = await getLocalAudioUri(audioId)
          if (localUri) {
            if (__DEV__) {
              console.log(
                `[useAncestralWisdomAudio] Using local file for ${chakra}`,
              )
            }
            if (isMounted) {
              setState({
                source: { uri: localUri },
                url: null,
                localUri,
                isLoading: false,
                error: null,
              })
            }
            return
          }
        } catch (localFileError) {
          if (__DEV__) {
            console.warn(
              `[useAncestralWisdomAudio] Local file check failed, continuing to Firebase:`,
              localFileError,
            )
          }
        }

        // Check cache for Firebase URL
        const cachedUrl = await getCachedAudioUrl(cacheKey)
        if (cachedUrl) {
          if (__DEV__) {
            console.log(
              `[useAncestralWisdomAudio] Using cached URL for ${chakra}`,
            )
          }
          if (isMounted) {
            setState({
              source: { uri: cachedUrl },
              url: cachedUrl,
              localUri: null,
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
          console.log(
            `[useAncestralWisdomAudio] Fetching audio file: ${audioPath}`,
          )
        }

        const storageInstance = storage
        const url = await retryWithBackoff(
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
            `[useAncestralWisdomAudio] Successfully fetched audio URL for ${chakra}`,
          )
        }

        if (!url || !url.startsWith("http")) {
          throw new Error(`Invalid audio URL format: ${url?.substring(0, 50)}`)
        }

        await setCachedAudioUrl(cacheKey, url)

        // Prefer local file if it exists (e.g. downloaded in background)
        let localUri: string | null = null
        try {
          localUri = await getLocalAudioUri(audioId)
        } catch {
          // ignore
        }

        if (isMounted) {
          setState({
            source: localUri ? { uri: localUri } : { uri: url },
            url,
            localUri,
            isLoading: false,
            error: null,
          })
        }
      } catch (err) {
        const isNotFound =
          err instanceof Error &&
          (err.message.includes("object-not-found") ||
            err.message.includes("404"))
        if (__DEV__ && !isNotFound) {
          console.error(
            `[useAncestralWisdomAudio] Error fetching audio for ${chakra}:`,
            err,
          )
        }

        let errorMessage = "Failed to fetch audio URL"
        if (err instanceof Error) {
          if (
            err.message.includes("object-not-found") ||
            err.message.includes("404")
          ) {
            errorMessage = `Audio file not found in Firebase Storage. Please verify the file exists: ${audioFile}`
          } else if (
            err.message.includes("permission") ||
            err.message.includes("403")
          ) {
            errorMessage =
              "Permission denied. Please check Firebase Storage rules."
          } else if (isRetryableError(err)) {
            errorMessage =
              "Network error. Please check your connection and try again."
          } else {
            errorMessage = err.message
          }
        }

        if (isMounted) {
          setState({
            source: null,
            url: null,
            localUri: null,
            isLoading: false,
            error: new Error(errorMessage),
          })
        }
      }
    }

    fetchUrl()
    return () => {
      isMounted = false
    }
  }, [chakra])

  return state
}
