/**
 * Scholarship Audit Service
 *
 * Logs scholarship requests to Firestore for App Store compliance and 501(c)(3) audit.
 * Fire-and-forget: does not block grant on write success.
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"

/**
 * Log a scholarship request for audit trail.
 * Non-blocking; failures are logged but do not affect the grant.
 */
export async function logScholarshipRequest(
  userId: string,
  reason: string,
): Promise<void> {
  if (!db) return

  try {
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    await addDoc(collection(db, "scholarship_requests"), {
      userId,
      reason: reason.substring(0, 500),
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    if (__DEV__) {
      console.warn("[ScholarshipAudit] Failed to log request:", error)
    }
    // Do not throw - audit failure must not block access grant
  }
}
