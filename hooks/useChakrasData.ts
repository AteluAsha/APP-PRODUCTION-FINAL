import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/src/services/firebase"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import {
  buildLocalChakraData,
  type ChakraData,
} from "@/src/utils/localChakraStack"

export type { ChakraData }

const FIRESTORE_ENRICH_TIMEOUT_MS = 8000

const DAY_TO_DOC_ID: Record<number, string> = {
  0: "root",
  1: "sacral",
  2: "solar_plexus",
  3: "heart",
  4: "throat",
  5: "third_eye",
  6: "crown",
}

interface FirestoreChakraData {
  title: string
  color: string
  day_name: string
  audiopath: string
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Chakra metadata fetch timed out")),
      ms,
    )
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

/**
 * Chakra stack data is local-first.
 *
 * The 7 balls (image, day, route) render from bundled assets immediately.
 * Firestore only enriches copy when it responds. Audio URLs are never fetched
 * here — playback hooks own that, and a hung Storage call must not blank the course.
 */
export const useChakrasData = () => {
  const [chakrasData, setChakrasData] = useState<ChakraData[]>(() =>
    buildLocalChakraData(),
  )

  useEffect(() => {
    let cancelled = false

    const enrichFromFirestore = async () => {
      if (!db) {
        return
      }

      try {
        if (!checkRateLimit("firebase")) {
          await waitForRateLimit("firebase")
        }
        if (cancelled) return

        const localByDay = buildLocalChakraData()
        const chakrasPromises = Object.entries(DAY_TO_DOC_ID).map(
          async ([dayStr, docId]) => {
            if (!db) {
              throw new Error("Firestore is not initialized")
            }
            const day = parseInt(dayStr, 10)
            const chakraDocRef = doc(db, "chakras", docId)
            const chakraDocSnap = await getDoc(chakraDocRef)
            const local = localByDay[day]

            if (!chakraDocSnap.exists()) {
              return local
            }

            const data = chakraDocSnap.data() as FirestoreChakraData
            const title = data.title || local.title
            const dayName = data.day_name || local.day_name

            return {
              ...local,
              affirmation: `"${title}"`,
              description: dayName || "",
              title,
              color: data.color || local.color,
              day_name: dayName,
              audiopath: data.audiopath,
            } as ChakraData
          },
        )

        const fetchedChakras = await withTimeout(
          Promise.all(chakrasPromises),
          FIRESTORE_ENRICH_TIMEOUT_MS,
        )
        if (cancelled) return

        fetchedChakras.sort((a, b) => a.day - b.day)
        if (fetchedChakras.length === 7) {
          setChakrasData(fetchedChakras)
        }
      } catch (err) {
        if (__DEV__) {
          console.warn(
            "useChakrasData: Firestore enrich failed; keeping bundled stack",
            err,
          )
        }
      }
    }

    void enrichFromFirestore()
    return () => {
      cancelled = true
    }
  }, [])

  return { chakrasData, isLoading: false, error: null as Error | null }
}
