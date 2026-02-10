/**
 * Social Sanctuary Service
 *
 * Manages the Social Sanctuary feature - a shared space where users can
 * read and leave reflections for each chakra day, creating unity through
 * shared frequency and experience.
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
import { db } from "./firebase"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { robustApiCall, API_TIMEOUTS } from "@/src/utils/apiHelpers"
import { captureException } from "@/src/services/sentry"

/**
 * Generate a unique user ID for anonymous users
 * In a production app, this would come from authentication
 * For now, we'll use a device-based identifier stored in AsyncStorage
 */
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface SanctuaryReflection {
  id?: string // Document ID from Firestore
  userId: string
  chakraDay: number // 0-6 (Monday-Sunday)
  message: string
  timestamp: Date
  isAnonymous: boolean
  likes?: number // Optional likes count for future implementation
  parentId?: string // ID of parent comment (for nested replies)
  replyCount?: number // Number of replies to this comment
  reactions?: {
    more: number
    neutral: number
    less: number
  }
}

export const getUserId = async (): Promise<string> => {
  // TODO: Replace with actual user authentication ID
  // For now, use a simple device-based identifier
  // In production, this should come from Clerk or your auth system
  const storedUserId = await AsyncStorage.getItem("sanctuary_user_id")

  // If no stored ID, generate one and store it
  if (!storedUserId) {
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await AsyncStorage.setItem("sanctuary_user_id", newUserId)
    return newUserId
  }

  return storedUserId
}

/**
 * Add a reflection to the Social Sanctuary
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param message - The reflection message
 * @param isAnonymous - Whether the reflection should be anonymous
 * @param parentId - Optional parent comment ID for nested replies
 * @returns The created reflection document ID
 */
export const addReflection = async (
  chakraDay: number,
  message: string,
  isAnonymous: boolean = false,
  parentId?: string,
): Promise<string> => {
  try {
    // Check if Firebase is initialized
    if (!db) {
      throw new Error(
        "Firebase is not initialized. Please check your configuration.",
      )
    }

    // Check rate limit for Firestore writes
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    const userId = await getUserId()
    // Sanitize message: remove potential XSS characters and limit length
    // Firestore will store this safely, but we sanitize on input for extra security
    const sanitizedMessage = message
      .trim()
      .replace(/[<>]/g, "") // Remove angle brackets to prevent HTML injection
      .substring(0, 500) // Enforce max length on server side too

    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      throw new Error("Message cannot be empty")
    }

    const reflection: Omit<SanctuaryReflection, "id"> = {
      userId,
      chakraDay,
      message: sanitizedMessage,
      timestamp: new Date(),
      isAnonymous,
      parentId: parentId || undefined,
    }

    const docRef = await addDoc(collection(db, "social_sanctuary"), {
      ...reflection,
      timestamp: Timestamp.fromDate(reflection.timestamp),
    })

    // If this is a reply, increment the parent's reply count
    if (parentId) {
      try {
        const { doc, updateDoc, getDoc } = await import("firebase/firestore")
        const parentRef = doc(db, "social_sanctuary", parentId)
        const parentSnap = await getDoc(parentRef)
        if (parentSnap.exists()) {
          const parentData = parentSnap.data()
          const currentReplyCount = parentData.replyCount || 0
          await updateDoc(parentRef, {
            replyCount: currentReplyCount + 1,
          })
        }
      } catch (updateError) {
        if (__DEV__) {
          console.warn("Error updating parent reply count:", updateError)
        }
        // Don't fail the whole operation if reply count update fails
      }
    }

    return docRef.id
  } catch (error) {
    if (__DEV__) {
      console.error("Error adding reflection to Social Sanctuary:", error)
    }
    throw error
  }
}

/**
 * Get reflections for a specific chakra day
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param limitCount - Maximum number of reflections to retrieve (default: 50)
 * @returns Array of reflections for that day, ordered by most recent first
 */
export const getReflectionsForDay = async (
  chakraDay: number,
  limitCount: number = 50,
): Promise<SanctuaryReflection[]> => {
  try {
    // Check if Firebase is initialized
    if (!db) {
      throw new Error(
        "Firebase is not initialized. Please check your configuration.",
      )
    }

    // Check rate limit for Firestore reads
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    // First, check if the collection exists and has any documents
    // If the collection doesn't exist or is empty, return empty array instead of error
    // Only get top-level comments (no parentId)
    // Note: Firestore doesn't support querying for null with ==, so we filter in code
    const reflectionsQuery = query(
      collection(db, "social_sanctuary"),
      where("chakraDay", "==", chakraDay),
      orderBy("timestamp", "desc"),
      limit(limitCount * 2), // Get more to account for filtering
    )

    const querySnapshot = await robustApiCall(
      () => getDocs(reflectionsQuery),
      API_TIMEOUTS.firebase,
      {
        maxRetries: 2,
        retryDelay: 1000,
        retryableErrors: ["Network error", "timeout"],
      },
      {
        service: "firebase",
        operation: "getReflectionsForDay",
        chakraDay,
        limitCount,
      },
    )
    const reflections: SanctuaryReflection[] = []

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data()
        // Validate required fields exist and filter for top-level comments only
        if (data && data.message && data.timestamp && !data.parentId) {
          reflections.push({
            id: doc.id,
            userId: data.userId || "unknown",
            chakraDay: data.chakraDay ?? chakraDay,
            message: data.message,
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            isAnonymous: data.isAnonymous ?? true,
            parentId: data.parentId || undefined,
            replyCount: data.replyCount || 0,
            likes: data.likes || 0,
          })
        }
      } catch (docError) {
        if (__DEV__) {
          console.warn("Error processing reflection document:", docError)
        }
        // Skip invalid documents but continue processing others
      }
    })

    // Limit to requested count after filtering
    return reflections.slice(0, limitCount)
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
        operation: "getReflectionsForDay",
        chakraDay,
        limitCount,
      })
    }

    if (__DEV__) {
      console.error("Error fetching reflections from Social Sanctuary:", error)
    }
    // If it's a permissions error or collection doesn't exist, return empty array
    // This allows the UI to still function and show "No reflections yet"
    if (error instanceof Error) {
      if (isExpectedError) {
        if (__DEV__) {
          console.warn(
            "Social Sanctuary collection may not exist yet or has permission issues. Returning empty array.",
          )
        }
        return []
      }
    }
    // For other errors, still throw so the UI can show an error message
    throw errorToLog
  }
}

/**
 * Get the most recent reflections for Anua's synthesis
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param limitCount - Maximum number of reflections to include (default: 10)
 * @returns Array of recent reflections
 */
export const getRecentReflectionsForSynthesis = async (
  chakraDay: number,
  limitCount: number = 10,
): Promise<SanctuaryReflection[]> => {
  return getReflectionsForDay(chakraDay, limitCount)
}

/**
 * Get the top 2 most recent reflections for community highlights
 * These are displayed on the main Social Sanctuary page
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @returns Array of top 2 reflections, ordered by most recent first
 */
export const getTopReflections = async (
  chakraDay: number,
): Promise<SanctuaryReflection[]> => {
  try {
    // Check if Firebase is initialized
    if (!db) {
      throw new Error(
        "Firebase is not initialized. Please check your configuration.",
      )
    }

    // Check rate limit for Firestore reads
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    // BACKUP PLAN: Simplified query that doesn't require composite index
    // Query by chakraDay only (single field index - auto-created by Firestore)
    // Then sort client-side to get top 2
    const reflectionsQuery = query(
      collection(db, "social_sanctuary"),
      where("chakraDay", "==", chakraDay),
      // Note: Removed orderBy('timestamp') to avoid composite index requirement
      // We'll sort client-side instead
      limit(50), // Get more documents to sort client-side
    )

    const querySnapshot = await robustApiCall(
      () => getDocs(reflectionsQuery),
      API_TIMEOUTS.firebase,
      {
        maxRetries: 2,
        retryDelay: 1000,
        retryableErrors: ["Network error", "timeout"],
      },
      {
        service: "firebase",
        operation: "getTopReflections",
        chakraDay,
      },
    )

    const reflections: SanctuaryReflection[] = []

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data()
        // Validate required fields exist
        if (data && data.message && data.timestamp) {
          reflections.push({
            id: doc.id,
            userId: data.userId || "unknown",
            chakraDay: data.chakraDay ?? chakraDay,
            message: data.message,
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            isAnonymous: data.isAnonymous ?? true,
            likes: data.likes || 0,
          })
        }
      } catch (docError) {
        if (__DEV__) {
          console.warn("Error processing reflection document:", docError)
        }
        // Skip invalid documents but continue processing others
      }
    })

    // Sort client-side by timestamp (newest first) and return top 2
    const sortedReflections = reflections.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )

    return sortedReflections.slice(0, 2)
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
        operation: "getTopReflections",
        chakraDay,
      })
    }

    if (__DEV__) {
      console.error(
        "Error fetching top reflections from Social Sanctuary:",
        error,
      )
    }
    // If it's a permissions error, collection doesn't exist, or index is missing, return empty array
    if (error instanceof Error) {
      if (isExpectedError) {
        if (__DEV__) {
          console.warn(
            "Social Sanctuary collection may not exist yet, has permission issues, or requires an index. Returning empty array.",
          )
        }
        return []
      }
    }
    // For other errors, still throw so the UI can show an error message
    throw errorToLog
  }
}

/**
 * Subscribe to real-time updates for reflections on a specific chakra day
 * Returns an unsubscribe function to stop listening
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param callback - Function to call when reflections change
 * @returns Unsubscribe function
 */
export const subscribeToReflections = (
  chakraDay: number,
  callback: (reflections: SanctuaryReflection[]) => void,
): Unsubscribe | null => {
  try {
    // Check if Firebase is initialized
    if (!db) {
      if (__DEV__) {
        console.warn(
          "Firebase is not initialized. Cannot subscribe to reflections.",
        )
      }
      return null
    }

    // Query for reflections for this day, ordered by most recent
    // Note: We filter for top-level comments (no parentId) in the callback
    const reflectionsQuery = query(
      collection(db, "social_sanctuary"),
      where("chakraDay", "==", chakraDay),
      orderBy("timestamp", "desc"),
      limit(100), // Get more to account for filtering
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      reflectionsQuery,
      (querySnapshot) => {
        const reflections: SanctuaryReflection[] = []

        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data()
            // Validate required fields exist and filter for top-level comments only
            if (data && data.message && data.timestamp && !data.parentId) {
              reflections.push({
                id: doc.id,
                userId: data.userId || "unknown",
                chakraDay: data.chakraDay ?? chakraDay,
                message: data.message,
                timestamp: data.timestamp?.toDate
                  ? data.timestamp.toDate()
                  : new Date(data.timestamp),
                isAnonymous: data.isAnonymous ?? true,
                parentId: data.parentId || undefined,
                replyCount: data.replyCount || 0,
                likes: data.likes || 0,
              })
            }
          } catch (docError) {
            if (__DEV__) {
              console.warn("Error processing reflection document:", docError)
            }
            // Skip invalid documents but continue processing others
          }
        })

        // Limit to 50 top-level comments
        callback(reflections.slice(0, 50))
      },
      (error: any) => {
        if (__DEV__) {
          console.error("Error in real-time subscription:", error)
        }
        // Call callback with empty array on error
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
 * Get replies for a specific comment
 *
 * @param parentId - The ID of the parent comment
 * @returns Array of replies, ordered by most recent first
 */
/**
 * React to a comment (like/reaction)
 * Placeholder for future implementation
 */
export const reactToComment = async (
  reflectionId: string,
  reactionType: "more" | "neutral" | "less",
  previousReaction?: "more" | "neutral" | "less",
): Promise<void> => {
  // TODO: Implement reaction system
  // For now, this is a placeholder that does nothing
  // Future: Store reactions in Firestore and update reflection document
  if (__DEV__) {
    console.log(
      `[reactToComment] Placeholder: ${reactionType} on ${reflectionId}`,
    )
  }
}

export const getReplies = async (
  parentId: string,
): Promise<SanctuaryReflection[]> => {
  try {
    if (!db) {
      throw new Error(
        "Firebase is not initialized. Please check your configuration.",
      )
    }

    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    const repliesQuery = query(
      collection(db, "social_sanctuary"),
      where("parentId", "==", parentId),
      orderBy("timestamp", "asc"), // Oldest first for replies (like YouTube)
      limit(100),
    )

    const querySnapshot = await getDocs(repliesQuery)
    const replies: SanctuaryReflection[] = []

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data()
        if (data && data.message && data.timestamp) {
          replies.push({
            id: doc.id,
            userId: data.userId || "unknown",
            chakraDay: data.chakraDay ?? 0,
            message: data.message,
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            isAnonymous: data.isAnonymous ?? true,
            parentId: data.parentId || undefined,
            replyCount: data.replyCount || 0,
            likes: data.likes || 0,
          })
        }
      } catch (docError) {
        if (__DEV__) {
          console.warn("Error processing reply document:", docError)
        }
      }
    })

    return replies
  } catch (error) {
    if (__DEV__) {
      console.error("Error fetching replies:", error)
    }
    return []
  }
}
