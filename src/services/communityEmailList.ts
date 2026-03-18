/**
 * Community Email List – 7 Chakras Community
 *
 * Stores email signups from Account (Soul School updates and new offerings)
 * in Firestore for the "7 Chakras Community" list. Same flow on iOS and Android.
 */

import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

const COLLECTION_ID = "soul_school_community_emails"

/** Use this to show a friendly message when Firebase is not configured (e.g. dev without .env). */
export const FIREBASE_NOT_INITIALIZED = "FIREBASE_NOT_INITIALIZED"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= 5 && trimmed.length <= 256 && EMAIL_REGEX.test(trimmed)
}

/** True when Firestore is available for storing community emails (iOS and Android use same path). */
export function isCommunityEmailStorageAvailable(): boolean {
  return db != null
}

/**
 * Add an email to the 7 Chakras Community list (Soul School updates and new offerings).
 * Idempotent by email: we do not dedupe in Firestore; dedupe can be done when exporting.
 * Throws with message FIREBASE_NOT_INITIALIZED when Firebase is not configured (e.g. dev build without .env).
 */
export async function addCommunityEmail(email: string): Promise<void> {
  if (!db) throw new Error(FIREBASE_NOT_INITIALIZED)
  const trimmed = email.trim().toLowerCase()
  if (!isValidEmail(trimmed)) throw new Error("Invalid email address")
  const ref = collection(db, COLLECTION_ID)
  await addDoc(ref, {
    email: trimmed,
    createdAt: Timestamp.now(),
    source: "account",
  })
}
