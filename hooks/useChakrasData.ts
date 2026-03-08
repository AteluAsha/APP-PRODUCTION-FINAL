import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/src/services/firebase"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/src/services/firebase"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { getChakraFromDay } from "@/utils/chakraMapping"

// Map day numbers to Firestore document IDs
const DAY_TO_DOC_ID: Record<number, string> = {
  0: "root",
  1: "sacral",
  2: "solar_plexus",
  3: "heart",
  4: "throat",
  5: "third_eye",
  6: "crown",
}

// Map document IDs to image sources (static require for React Native)
const DOC_ID_TO_IMAGE: Record<string, any> = {
  root: require("@/assets/images/root.png"),
  sacral: require("@/assets/images/sacral.png"),
  solar_plexus: require("@/assets/images/solar.png"),
  heart: require("@/assets/images/heart.png"),
  throat: require("@/assets/images/throat.png"),
  third_eye: require("@/assets/images/thirdeye.png"),
  crown: require("@/assets/images/crown.png"),
}

export interface ChakraData {
  day: number
  affirmation: string
  description: string
  source: any
  onPress: (router: any) => void
  title?: string
  color?: string
  day_name?: string
  audiopath?: string
}

interface FirestoreChakraData {
  title: string
  color: string
  day_name: string
  audiopath: string
}

/**
 * Hook to fetch chakra data from Firestore
 * Fetches title, color, day_name, and audiopath for all chakras
 */
export const useChakrasData = () => {
  const [chakrasData, setChakrasData] = useState<ChakraData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchChakrasData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if Firebase is initialized
        if (!db) {
          throw new Error(
            "Firebase is not initialized. Please check your configuration.",
          )
        }

        // Check rate limit for Firestore reads (batch operation)
        // For batch reads, we check once and allow all documents to be fetched
        if (!checkRateLimit("firebase")) {
          await waitForRateLimit("firebase")
        }

        // Fetch all chakra documents from Firestore
        const chakrasPromises = Object.entries(DAY_TO_DOC_ID).map(
          async ([dayStr, docId]) => {
            if (!db) {
              throw new Error("Firestore is not initialized")
            }
            const day = parseInt(dayStr, 10)
            const chakraDocRef = doc(db, "chakras", docId)
            const chakraDocSnap = await getDoc(chakraDocRef)

            if (!chakraDocSnap.exists()) {
              throw new Error(`Chakra document ${docId} not found in Firestore`)
            }

            const data = chakraDocSnap.data() as FirestoreChakraData

            // Get download URL for audio file if audiopath exists
            // Skip Day 3 (solar_plexus), Day 6 (third_eye), and Day 7 (crown) -
            // these use Firebase Storage audio files handled by useEmbodimentAudio hook
            let audioUrl: string | undefined
            const chakrasUsingEmbodimentAudio = [
              "solar_plexus",
              "third_eye",
              "crown",
            ]
            if (
              data.audiopath &&
              !chakrasUsingEmbodimentAudio.includes(docId)
            ) {
              if (!storage) {
                throw new Error("Firebase Storage is not initialized")
              }
              try {
                const audioRef = ref(storage, data.audiopath)
                audioUrl = await getDownloadURL(audioRef)
              } catch (storageError) {
                if (__DEV__) {
                  console.warn(
                    `useChakrasData: Failed to get audio URL for ${docId}:`,
                    storageError,
                  )
                }
              }
            }
            // For Day 3, 6, and 7, audio is handled by useEmbodimentAudio hook with correct Firebase Storage paths

            // Map to route using Chakra enum so [chakra] route always gets valid segment (APP1 + APP2)
            const chakraSlug = getChakraFromDay(day) as string
            const routerPath = `/(chakras)/${chakraSlug}` as const

            // Get image source from static mapping
            const imageSource = DOC_ID_TO_IMAGE[docId]

            return {
              day,
              affirmation: `"${data.title}"`, // Wrap title in quotes for affirmation
              description: data.day_name || "", // Use day_name as description
              source: imageSource, // Use static image mapping
              onPress: (router: any) => router.push(routerPath),
              title: data.title,
              color: data.color,
              day_name: data.day_name,
              audiopath: audioUrl || data.audiopath,
            } as ChakraData
          },
        )

        const fetchedChakras = await Promise.all(chakrasPromises)

        // Sort by day number (0-6)
        fetchedChakras.sort((a, b) => a.day - b.day)

        setChakrasData(fetchedChakras)
      } catch (err) {
        if (__DEV__) {
          console.error("useChakrasData: Error fetching chakras data:", err)
        }
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch chakras data"),
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchChakrasData()
  }, [])

  return { chakrasData, isLoading, error }
}
