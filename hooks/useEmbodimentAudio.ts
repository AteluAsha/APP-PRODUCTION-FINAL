import { useState, useEffect } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/src/services/firebase"
import { Chakra } from "@/types/chakras/Chakra"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { getLocalAudioUri } from "@/src/utils/audioDownload"
import { FIREBASE_EMBODIMENT_FOLDER } from "@/constants/firebaseStoragePaths"

/**
 * Map chakras to their embodiment audio filenames
 * CRITICAL: These must match exactly with Firebase Storage file names
 *
 * Day Mapping (EXACT file names from Firebase Storage):
 * - Monday (Day 0) - ROOT: Day1_ROOT_DAY_MASTER_EMBODIMENT_SoulSchool_MotherJJ.aac (44:44, Mother JJ)
 * - Tuesday (Day 1) - SACRAL: Day2_SacralChakraEmbodiment_SoulSchool.aac
 * - Wednesday (Day 2) - SOLAR_PLEXUS: Day3_SolarChakraEmbodiment_SoulSchool.aac
 * - Thursday (Day 3) - HEART: Day4_HeartChakraEmbodiment_SoulSchool.aac
 * - Friday (Day 4) - THROAT: Day5_ThroatChakraEmbodiment_SoulSchool.aac
 * - Saturday (Day 5) - THIRD_EYE: Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac + Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac
 * - Sunday (Day 6) - CROWN: Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool.aac
 */
const CHAKRA_TO_AUDIO_FILE: Record<Chakra, string | string[]> = {
  [Chakra.ROOT]: "Day1_ROOT_DAY_MASTER_EMBODIMENT_SoulSchool_MotherJJ.aac", // Monday - Day 0 (44:44, Mother JJ)
  [Chakra.SACRAL]: "Day2_SacralChakraEmbodiment_SoulSchool.aac", // Tuesday - Day 1
  [Chakra.SOLAR_PLEXUS]: "Day3_SolarChakraEmbodiment_SoulSchool.aac", // Wednesday - Day 2
  [Chakra.HEART]: "Day4_HeartChakraEmbodiment_SoulSchool.aac", // Thursday - Day 3
  [Chakra.THROAT]: "Day5_ThroatChakraEmbodiment_SoulSchool.aac", // Friday - Day 4
  [Chakra.THIRD_EYE]: [
    "Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac",
    "Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac",
  ], // Saturday - Day 5
  [Chakra.CROWN]: "Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool.aac", // Sunday - Day 6
}

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
      const audioId = getEmbodimentAudioId(chakra)

      if (__DEV__) {
        console.log(`[useEmbodimentAudio] Fetching audio for chakra: ${chakra}`)
        console.log(`[useEmbodimentAudio] Audio file(s):`, audioFile)
      }

      try {
        if (!isMounted) return
        setUrls((prev) => ({ ...prev, isLoading: true, error: null }))

        // Check for downloaded local file first (skip for Third Eye – we need both parts)
        if (chakra !== Chakra.THIRD_EYE) {
          try {
            const localUri = await getLocalAudioUri(audioId)
            if (localUri && isMounted) {
              if (__DEV__)
                console.log(
                  `[useEmbodimentAudio] Using local file for ${chakra}`,
                )
              setUrls({
                localUri,
                isLoading: false,
                error: null,
              })
              return
            }
          } catch (localErr) {
            if (__DEV__)
              console.warn("[useEmbodimentAudio] Local check failed:", localErr)
          }
        }

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
        }
        // Handle Crown (Day 7) - awaiting final export
        else if (!audioFile || audioFile === "") {
          setUrls({
            isLoading: false,
            error: new Error("Audio file not yet available for Crown chakra"),
          })
        }
        // Handle single audio file (Days 1-5)
        else {
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
