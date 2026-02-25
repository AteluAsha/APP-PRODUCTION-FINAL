/**
 * User Scholarship Status – Firestore persistence
 *
 * When a user is granted scholarship access, updates their Firestore user document
 * with isScholarshipUser: true and scholarshipExpiryDate. Ensures status persists
 * across devices and sessions.
 *
 * Fire-and-forget: does not block grant on write success.
 */

import { doc, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"

/**
 * Update user document with scholarship status.
 * Non-blocking; failures are logged but do not affect the grant.
 */
export async function updateUserScholarshipStatus(
  userId: string,
  scholarshipExpiryDate: string,
): Promise<void> {
  if (!db) return

  try {
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    await setDoc(
      doc(db, "users", userId),
      {
        isScholarshipUser: true,
        scholarshipExpiryDate,
      },
      { merge: true },
    )
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[UserScholarshipStatus] Failed to update user document:",
        error,
      )
    }
    // Do not throw - persistence failure must not block access grant
  }
}
