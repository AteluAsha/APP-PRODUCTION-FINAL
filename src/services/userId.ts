/**
 * User ID Service
 *
 * Manages user identification for RevenueCat and other services.
 * New users receive a Soul Signature (e.g., "Starseed | 1212:88").
 * Legacy users keep their user_* format until they request a new ID.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  getOrCreateSoulSignature,
  isSoulSignatureFormat,
  requestNewSoulSignature,
} from "./soulSignature"

const STORAGE_KEY = "userId"

/**
 * Get or create a unique user ID
 * New users: Soul Signature. Legacy users: keep user_* format.
 */
export async function getUserId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY)

    if (stored) {
      if (isSoulSignatureFormat(stored)) {
        return stored
      }
      return stored
    }

    const soulSignature = await getOrCreateSoulSignature()
    return soulSignature
  } catch (error) {
    if (__DEV__) {
      console.warn("[userId] Error getting user ID, using fallback:", error)
    }
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }
}

/**
 * Request a new Soul School ID. Clears stored ID (including legacy user_*)
 * and generates a fresh Soul Signature. Call RevenueCat linkUserId after.
 */
export async function requestNewUserId(): Promise<string> {
  return requestNewSoulSignature()
}
