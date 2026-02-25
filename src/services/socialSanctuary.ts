/**
 * Social Sanctuary Service
 *
 * Manages the Social Sanctuary feature - a shared space where users can
 * read and leave reflections for each chakra day, creating unity through
 * shared frequency and experience.
 *
 * SAFETY (Anua monitor): The feed is moderated by Anua (The Sentinel) before
 * any reflection is written. Callers must run moderateReflection(message) before
 * addReflection(); only approved content is stored in Firestore. So the feed
 * and Firestore stay in sync: everything in social_sanctuary has passed Anua.
 */

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"
import { robustApiCall, API_TIMEOUTS } from "@/src/utils/apiHelpers"
import { captureException } from "@/src/services/sentry"

import { getUserId } from "./userId"

const SANCTUARY_USER_DATA_COLLECTION = "sanctuary_user_data"

export interface SanctuaryUserData {
  hiddenReflectionIds: string[]
  minusPopupShownCount: number
  totalLessReceived?: number
  sanctuaryBlockedAt?: Date | null
  /** User IDs this user follows in Social Sanctuary (hero their comments in feed) */
  followedUserIds?: string[]
}

export interface SanctuaryReflection {
  id?: string // Document ID from Firestore
  userId: string
  chakraDay: number // 0-6 (Monday-Sunday)
  message: string
  timestamp: Date
  isAnonymous: boolean
  imageUrl?: string // Optional image URL (Firebase Storage download URL)
  likes?: number // Optional likes count for future implementation
  parentId?: string // ID of parent comment (for nested replies)
  replyCount?: number // Number of replies to this comment
  reactions?: {
    more: number
    neutral: number
    less: number
  }
  /** Current user's reaction (set when loading with currentUserId) */
  myReaction?: "more" | "neutral" | "less"
}

export { getUserId }

/**
 * Get sanctuary user data (hidden refs, popup count, block status)
 */
export const getSanctuaryUserData = async (
  userId: string,
): Promise<SanctuaryUserData | null> => {
  try {
    if (!db) return null
    const ref = doc(db, SANCTUARY_USER_DATA_COLLECTION, userId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return {
        hiddenReflectionIds: [],
        minusPopupShownCount: 0,
        followedUserIds: [],
      }
    }
    const data = snap.data()
    const blockedAt = data.sanctuaryBlockedAt
    return {
      hiddenReflectionIds: Array.isArray(data.hiddenReflectionIds)
        ? data.hiddenReflectionIds
        : [],
      minusPopupShownCount: typeof data.minusPopupShownCount === "number" ? data.minusPopupShownCount : 0,
      totalLessReceived: typeof data.totalLessReceived === "number" ? data.totalLessReceived : 0,
      sanctuaryBlockedAt: blockedAt?.toDate ? blockedAt.toDate() : blockedAt ?? null,
      followedUserIds: Array.isArray(data.followedUserIds) ? data.followedUserIds : [],
    }
  } catch (err) {
    if (__DEV__) console.warn("getSanctuaryUserData error:", err)
    return null
  }
}

/**
 * Add a reflection ID to the user's hidden list (remove from my feed)
 */
export const addHiddenReflection = async (
  userId: string,
  reflectionId: string,
): Promise<void> => {
  try {
    if (!db) return
    const ref = doc(db, SANCTUARY_USER_DATA_COLLECTION, userId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, {
        hiddenReflectionIds: arrayUnion(reflectionId),
      })
    } else {
      const { setDoc } = await import("firebase/firestore")
      await setDoc(ref, {
        hiddenReflectionIds: [reflectionId],
        minusPopupShownCount: 0,
      })
    }
  } catch (err) {
    if (__DEV__) console.warn("addHiddenReflection error:", err)
    throw err
  }
}

/**
 * Add a user to the current user's follow list (hero their comments in feed)
 */
export const followUserInSanctuary = async (
  currentUserId: string,
  targetUserId: string,
): Promise<void> => {
  try {
    if (!db || currentUserId === targetUserId) return
    const ref = doc(db, SANCTUARY_USER_DATA_COLLECTION, currentUserId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, {
        followedUserIds: arrayUnion(targetUserId),
      })
    } else {
      const { setDoc } = await import("firebase/firestore")
      await setDoc(ref, {
        hiddenReflectionIds: [],
        minusPopupShownCount: 0,
        followedUserIds: [targetUserId],
      })
    }
  } catch (err) {
    if (__DEV__) console.warn("followUserInSanctuary error:", err)
    throw err
  }
}

/**
 * Remove a user from the current user's follow list
 */
export const unfollowUserInSanctuary = async (
  currentUserId: string,
  targetUserId: string,
): Promise<void> => {
  try {
    if (!db) return
    const ref = doc(db, SANCTUARY_USER_DATA_COLLECTION, currentUserId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    await updateDoc(ref, {
      followedUserIds: arrayRemove(targetUserId),
    })
  } catch (err) {
    if (__DEV__) console.warn("unfollowUserInSanctuary error:", err)
    throw err
  }
}

/**
 * Increment how many times we've shown the "clean from community?" popup (cap at 3)
 */
export const incrementMinusPopupShown = async (userId: string): Promise<void> => {
  try {
    if (!db) return
    const ref = doc(db, SANCTUARY_USER_DATA_COLLECTION, userId)
    const snap = await getDoc(ref)
    const current = snap.exists() ? (snap.data().minusPopupShownCount ?? 0) : 0
    const next = Math.min(3, current + 1)
    if (snap.exists()) {
      await updateDoc(ref, { minusPopupShownCount: next })
    } else {
      const { setDoc } = await import("firebase/firestore")
      await setDoc(ref, {
        hiddenReflectionIds: [],
        minusPopupShownCount: next,
      })
    }
  } catch (err) {
    if (__DEV__) console.warn("incrementMinusPopupShown error:", err)
  }
}

/**
 * Check if user is blocked from Social Sanctuary (30 minus received)
 */
export const isUserBlockedFromSanctuary = async (
  userId: string,
): Promise<boolean> => {
  try {
    if (!db) return false
    const ref = doc(db, SANCTUARY_USER_DATA_COLLECTION, userId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return false
    const data = snap.data()
    return data.sanctuaryBlockedAt != null
  } catch (err) {
    if (__DEV__) console.warn("isUserBlockedFromSanctuary error:", err)
    return false
  }
}

/**
 * Add a reflection to the Social Sanctuary
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @param message - The reflection message (can be empty if imageUrl is provided)
 * @param isAnonymous - Whether the reflection should be anonymous
 * @param parentId - Optional parent comment ID for nested replies
 * @param imageUrl - Optional Firebase Storage download URL for attached image
 * @returns The created reflection document ID
 */
export const addReflection = async (
  chakraDay: number,
  message: string,
  isAnonymous: boolean = false,
  parentId?: string,
  imageUrl?: string,
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
    const sanitizedMessage = (message || "")
      .trim()
      .replace(/[<>]/g, "")
      .substring(0, 500)

    // Require at least message or image
    if (!sanitizedMessage && !imageUrl) {
      throw new Error("Message or image is required")
    }

    const reflection: Omit<SanctuaryReflection, "id"> = {
      userId,
      chakraDay,
      message: sanitizedMessage,
      timestamp: new Date(),
      isAnonymous,
      parentId: parentId || undefined,
      imageUrl: imageUrl || undefined,
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
 * @param currentUserId - If provided, each reflection will include myReaction from Firestore
 * @returns Array of reflections for that day, ordered by most recent first
 */
export const getReflectionsForDay = async (
  chakraDay: number,
  limitCount: number = 50,
  currentUserId?: string,
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

    querySnapshot.forEach((docSnap) => {
      try {
        const data = docSnap.data()
        // Skip globally removed reflections; filter top-level only
        if (data?.removedAt) return
        if (!data || (!data.message && !data.imageUrl) || !data.timestamp || data.parentId) return
        reflections.push({
          id: docSnap.id,
          userId: data.userId || "unknown",
          chakraDay: data.chakraDay ?? chakraDay,
          message: data.message || "",
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp),
          isAnonymous: data.isAnonymous ?? true,
          parentId: data.parentId || undefined,
          replyCount: data.replyCount || 0,
          likes: data.likes || 0,
          imageUrl: data.imageUrl || undefined,
            reactions: data.reactions
              ? {
                  more: data.reactions.more ?? 0,
                  neutral: data.reactions.neutral ?? 0,
                  less: data.reactions.less ?? 0,
                }
              : { more: 0, neutral: 0, less: 0 },
            myReaction:
              currentUserId && data.reactionsByUser?.[currentUserId]
                ? data.reactionsByUser[currentUserId]
                : undefined,
          })
      } catch (docError) {
        if (__DEV__) {
          console.warn("Error processing reflection document:", docError)
        }
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
        if (data && (data.message || data.imageUrl) && data.timestamp) {
          reflections.push({
            id: doc.id,
            userId: data.userId || "unknown",
            chakraDay: data.chakraDay ?? chakraDay,
            message: data.message || "",
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            isAnonymous: data.isAnonymous ?? true,
            likes: data.likes || 0,
            imageUrl: data.imageUrl || undefined,
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
 * @param currentUserId - If provided, each reflection will include myReaction
 */
export const subscribeToReflections = (
  chakraDay: number,
  callback: (reflections: SanctuaryReflection[]) => void,
  currentUserId?: string,
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

        querySnapshot.forEach((docSnap) => {
          try {
            const data = docSnap.data()
            if (data?.removedAt) return
            if (!data || (!data.message && !data.imageUrl) || !data.timestamp || data.parentId) return
            reflections.push({
              id: docSnap.id,
              userId: data.userId || "unknown",
              chakraDay: data.chakraDay ?? chakraDay,
              message: data.message || "",
              timestamp: data.timestamp?.toDate
                ? data.timestamp.toDate()
                : new Date(data.timestamp),
              isAnonymous: data.isAnonymous ?? true,
              parentId: data.parentId || undefined,
              replyCount: data.replyCount || 0,
              likes: data.likes || 0,
              imageUrl: data.imageUrl || undefined,
              reactions: data.reactions
                ? {
                    more: data.reactions.more ?? 0,
                    neutral: data.reactions.neutral ?? 0,
                    less: data.reactions.less ?? 0,
                  }
                : { more: 0, neutral: 0, less: 0 },
              myReaction:
                currentUserId && data.reactionsByUser?.[currentUserId]
                  ? data.reactionsByUser[currentUserId]
                  : undefined,
            })
          } catch (docError) {
            if (__DEV__) {
              console.warn("Error processing reflection document:", docError)
            }
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
 * React to a comment (more / neutral / less). Persists in Firestore.
 * Self-governance: at 10 "less" on a reflection it's removed for everyone;
 * at 30 "less" received by an author they're blocked from Sanctuary.
 */
export const reactToComment = async (
  reflectionId: string,
  reactionType: "more" | "neutral" | "less",
  previousReaction?: "more" | "neutral" | "less",
): Promise<void> => {
  try {
    if (!db) return
    const currentUserId = await getUserId()

    await runTransaction(db, async (transaction) => {
      const reflectionRef = doc(db, "social_sanctuary", reflectionId)
      const reflectionSnap = await transaction.get(reflectionRef)
      if (!reflectionSnap.exists()) return

      const data = reflectionSnap.data()
      const authorId = data.userId || "unknown"
      const reactions = {
        more: data.reactions?.more ?? 0,
        neutral: data.reactions?.neutral ?? 0,
        less: data.reactions?.less ?? 0,
      }
      const reactionsByUser: Record<string, "more" | "neutral" | "less"> =
        { ...(data.reactionsByUser || {}) }

      const prev = previousReaction ?? reactionsByUser[currentUserId]
      const next = reactionType

      // If toggling off (same reaction again), clear
      const newReaction =
        prev === next ? undefined : next
      if (newReaction) {
        reactionsByUser[currentUserId] = newReaction
      } else {
        delete reactionsByUser[currentUserId]
      }

      // Adjust counts: remove previous, add new
      if (prev === "more") reactions.more = Math.max(0, reactions.more - 1)
      else if (prev === "neutral") reactions.neutral = Math.max(0, reactions.neutral - 1)
      else if (prev === "less") reactions.less = Math.max(0, reactions.less - 1)
      if (newReaction === "more") reactions.more += 1
      else if (newReaction === "neutral") reactions.neutral += 1
      else if (newReaction === "less") reactions.less += 1

      const addedLess = newReaction === "less" && prev !== "less"
      const removedLess = prev === "less" && newReaction !== "less"

      transaction.update(reflectionRef, {
        reactions: { more: reactions.more, neutral: reactions.neutral, less: reactions.less },
        reactionsByUser,
        ...(reactions.less >= 10 ? { removedAt: serverTimestamp() } : {}),
      })

      // Update author's totalLessReceived (for 30 = block)
      if (authorId && authorId !== "unknown" && (addedLess || removedLess)) {
        const authorRef = doc(db, SANCTUARY_USER_DATA_COLLECTION, authorId)
        const authorSnap = await transaction.get(authorRef)
        const currentTotal = authorSnap.exists()
          ? (authorSnap.data().totalLessReceived ?? 0)
          : 0
        const delta = addedLess ? 1 : -1
        const newTotal = Math.max(0, currentTotal + delta)

        const authorUpdates: Record<string, unknown> = {
          totalLessReceived: newTotal,
        }
        if (newTotal >= 30) {
          authorUpdates.sanctuaryBlockedAt = serverTimestamp()
        }

        if (authorSnap.exists()) {
          transaction.update(authorRef, authorUpdates)
        } else {
          transaction.set(authorRef, {
            hiddenReflectionIds: [],
            minusPopupShownCount: 0,
            ...authorUpdates,
          })
        }
      }
    })
  } catch (err) {
    if (__DEV__) console.error("reactToComment error:", err)
    throw err
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
        if (data && (data.message || data.imageUrl) && data.timestamp) {
          replies.push({
            id: doc.id,
            userId: data.userId || "unknown",
            chakraDay: data.chakraDay ?? 0,
            message: data.message || "",
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            isAnonymous: data.isAnonymous ?? true,
            parentId: data.parentId || undefined,
            replyCount: data.replyCount || 0,
            likes: data.likes || 0,
            imageUrl: data.imageUrl || undefined,
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
