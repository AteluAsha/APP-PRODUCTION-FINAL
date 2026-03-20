import { useState, useEffect } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/src/services/firebase"
import { Chakra } from "@/types/chakras/Chakra"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { getLocalAudioUri } from "@/src/utils/audioDownload"
import { FIREBASE_EMBODIMENT_FOLDER } from "@/constants/firebaseStoragePaths"
import { SANCTUARY_EMBODIMENT_FILES } from "@/constants/sanctuaryAudioManifest"

/** Filenames: SANCTUARY_EMBODIMENT_FILES (sanctuaryAudioManifest) */
const CHAKRA_TO_AUDIO_FILE = SANCTUARY_EMBODIMENT_FILES

const STORAGE_FOLDER = FIREBASE_EMBODIMENT_FOLDER

export interface EmbodimentAudioUrls {
  partOne?: string
  partTwo?: string
  single?: string
  localUri?: string | null
  localUriPartOne?: string | null
  localUriPartTwo?: string | null
  isLoading: boolean
  error: Error | null
}

/** Audio ID for download/cache – used by Music Room for offline listening */
export function getEmbodimentAudioId(
  chakra: Chakra,
  part?: "part1" | "part2",
): string {
  if (chakra === Chakra.THIRD_EYE) {
    return part === "part2"
      ? `embodiment_${chakra}_part2`
      : `embodiment_${chakra}_part1`
  }
  return `embodiment_${chakra}`
}

/**
 * Hook to fetch Firebase Storage URLs for chakra embodiment audio files
 * Handles Day 6 specially with two parts (Part One and Part Two)
 */
export const useEmbodimentAudio = (chakra: Chakra) => {
  const [urls, setUrls] = useState<EmbodimentAudioUrls>({
    localUri: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    const fetchAudioUrls = async () => {
      const audioFile = CHAKRA_TO_AUDIO_FILE[chakra]

      if (__DEV__) {
        console.log(`[useEmbodimentAudio] Fetching audio for chakra: ${chakra}`)
        console.log(`[useEmbodimentAudio] Audio file(s):`, audioFile)
      }

      try {
        if (!isMounted) return
        setUrls((prev) => ({ ...prev, isLoading: true, error: null }))

        if (!isMounted) return

        // Check if Firebase Storage is initialized
        if (!storage) {
          throw new Error(
            "Firebase Storage is not initialized. Please check your configuration.",
          )
        }

        // Check rate limit for Firebase Storage reads
        if (!checkRateLimit("firebase")) {
          await waitForRateLimit("firebase")
        }

        // Handle Day 6 (Third Eye) with two parts
        if (Array.isArray(audioFile)) {
          const [partOneFile, partTwoFile] = audioFile
          const partOnePath = `${STORAGE_FOLDER}/${partOneFile}`
          const partTwoPath = `${STORAGE_FOLDER}/${partTwoFile}`

          if (__DEV__) {
            console.log(
              `[useEmbodimentAudio] Day 6 (Third Eye) - Fetching Part One: ${partOnePath}`,
            )
            console.log(
              `[useEmbodimentAudio] Day 6 (Third Eye) - Fetching Part Two: ${partTwoPath}`,
            )
          }

          try {
            const [partOneUrl, partTwoUrl] = await Promise.all([
              getDownloadURL(ref(storage, partOnePath)),
              getDownloadURL(ref(storage, partTwoPath)),
            ])

            if (__DEV__) {
              console.log(
                `[useEmbodimentAudio] Day 6 (Third Eye) - Successfully fetched both parts`,
              )
            }

            const part1Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")
            const part2Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")
            const [localUriPartOne, localUriPartTwo] = await Promise.all([
              getLocalAudioUri(part1Id),
              getLocalAudioUri(part2Id),
            ])

            if (!isMounted) return
            setUrls({
              partOne: partOneUrl,
              partTwo: partTwoUrl,
              localUriPartOne: localUriPartOne || null,
              localUriPartTwo: localUriPartTwo || null,
              isLoading: false,
              error: null,
            })
          } catch (fetchError) {
            if (__DEV__) {
              console.error(
                `[useEmbodimentAudio] Day 6 (Third Eye) - Error fetching audio files:`,
                fetchError,
              )
            }
            throw fetchError
          }
        } else {
          // Rate limit already checked above for Day 6, but check again for single files
          if (!checkRateLimit("firebase")) {
            await waitForRateLimit("firebase")
          }
          const audioPath = `${STORAGE_FOLDER}/${audioFile}`

          if (__DEV__) {
            console.log(
              `[useEmbodimentAudio] Fetching single audio file: ${audioPath}`,
            )
          }

          const audioUrl = await getDownloadURL(ref(storage, audioPath))

          if (__DEV__) {
            console.log(
              `[useEmbodimentAudio] Successfully fetched audio URL for ${chakra}:`,
              audioUrl.substring(0, 50) + "...",
            )
          }

          const audioId = getEmbodimentAudioId(chakra)
          let localUri: string | null = null
          try {
            localUri = await getLocalAudioUri(audioId)
          } catch (_) {}

          if (!isMounted) return
          setUrls({
            single: audioUrl,
            localUri,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        if (__DEV__) {
          console.error(`Error fetching embodiment audio for ${chakra}:`, error)
        }

        // Provide more specific error messages
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
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your internet connection."
          } else {
            errorMessage = error.message
          }
        }

        setUrls({
          localUri: null,
          isLoading: false,
          error: new Error(errorMessage),
        })
      }
    }

    fetchAudioUrls()
    return () => {
      isMounted = false
    }
  }, [chakra])

  return urls
}
