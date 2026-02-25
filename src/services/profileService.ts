/**
 * Profile Service
 *
 * Manages user profile data (displayName, avatarUrl, location) in Firestore
 * so Social Sanctuary and other features can show names and profile images.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface UserProfile {
  id: string
  displayName?: string
  avatarUrl?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

const PROFILES_COLLECTION = "profiles"

function mapDocToProfile(userId: string, data: Record<string, unknown>): UserProfile {
  const updatedAt = data.updatedAt instanceof Timestamp
    ? data.updatedAt.toDate()
    : data.updatedAt
      ? new Date(data.updatedAt as string | number)
      : new Date()
  const createdAt = data.createdAt instanceof Timestamp
    ? data.createdAt.toDate()
    : data.createdAt
      ? new Date(data.createdAt as string | number)
      : updatedAt
  return {
    id: userId,
    displayName: typeof data.displayName === "string" ? data.displayName : undefined,
    avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : undefined,
    location: typeof data.location === "string" ? data.location : undefined,
    createdAt,
    updatedAt,
  }
}

/**
 * Get user profile by ID (from Firestore)
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    if (!db) return null
    const ref = doc(db, PROFILES_COLLECTION, userId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return mapDocToProfile(userId, snap.data() as Record<string, unknown>)
  } catch (error) {
    if (__DEV__) {
      console.error("[profileService] Error getting profile:", error)
    }
    return null
  }
}

/**
 * Update user profile in Firestore (merge with existing)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    displayName: string | null
    avatarUrl: string | null
    location: string | null
  }>,
): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firebase is not initialized")
    }
    const ref = doc(db, PROFILES_COLLECTION, userId)
    const now = Timestamp.now()
    const snap = await getDoc(ref)
    const payload: Record<string, unknown> = {
      ...(updates.displayName !== undefined && { displayName: typeof updates.displayName === "string" ? updates.displayName.trim() || null : null }),
      ...(updates.avatarUrl !== undefined && { avatarUrl: updates.avatarUrl ?? null }),
      ...(updates.location !== undefined && { location: typeof updates.location === "string" ? updates.location.trim() || null : null }),
      updatedAt: now,
    }
    if (!snap.exists()) {
      await setDoc(ref, {
        ...payload,
        createdAt: now,
      })
    } else {
      await updateDoc(ref, payload)
    }
  } catch (error) {
    if (__DEV__) {
      console.error("[profileService] Error updating profile:", error)
    }
    throw error
  }
}
