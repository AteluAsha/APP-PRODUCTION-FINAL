/**
 * Scholarship persistence
 *
 * Local 30-day access is mirrored to Firestore so the same phone can restore
 * after uninstall/reinstall. Paid access is restored via RevenueCat, not here.
 *
 * users/{soulId} is write-only in rules (audit). scholarship_devices/{deviceId}
 * is readable so a new Soul ID on the same device can reclaim an unexpired grant.
 */

import { Platform } from 'react-native'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { checkRateLimit, waitForRateLimit } from '@/src/utils/rateLimiter'
import { scholarshipExpiryStillValid } from '@/src/utils/scholarshipExpiry'

export { scholarshipExpiryStillValid }

const DEVICE_COLLECTION = 'scholarship_devices'

async function getStableDeviceId(): Promise<string | null> {
  try {
    const Application = require('expo-application') as {
      getIosIdForVendorAsync?: () => Promise<string | null>
      getAndroidId?: () => string | null
    }
    if (Platform.OS === 'ios') {
      const id = await Application.getIosIdForVendorAsync?.()
      return id && id.length > 0 ? id : null
    }
    if (Platform.OS === 'android') {
      const id = Application.getAndroidId?.()
      return id && id.length > 0 ? id : null
    }
  } catch {
    /* Expo Go / tests */
  }
  return null
}

function deviceDocId(raw: string): string {
  return raw.replace(/[/\s]/g, '_').slice(0, 128)
}

async function persistScholarshipDocs(
  userId: string,
  scholarshipExpiryDate: string,
): Promise<void> {
  if (!db) return

  if (!checkRateLimit('firebase')) {
    await waitForRateLimit('firebase')
  }

  const payload = {
    isScholarshipUser: true,
    scholarshipExpiryDate,
  }

  await setDoc(doc(db, 'users', userId), payload, { merge: true })

  const deviceId = await getStableDeviceId()
  if (deviceId) {
    await setDoc(
      doc(db, DEVICE_COLLECTION, deviceDocId(deviceId)),
      {
        ...payload,
        userId,
      },
      { merge: true },
    )
  }
}

/**
 * Update user + same-device scholarship docs.
 * Non-blocking; failures do not affect the grant.
 */
export async function updateUserScholarshipStatus(
  userId: string,
  scholarshipExpiryDate: string,
): Promise<void> {
  try {
    await persistScholarshipDocs(userId, scholarshipExpiryDate)
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[UserScholarshipStatus] Failed to update user document:',
        error,
      )
    }
  }
}

/**
 * After uninstall, Soul ID is new. Read the device mirror.
 * Caller applies restoreScholarshipAccess so the 30-day clock is not reset.
 */
export async function readUnexpiredScholarshipFromDevice(): Promise<
  string | null
> {
  if (!db) return null

  try {
    const deviceId = await getStableDeviceId()
    if (!deviceId) return null

    if (!checkRateLimit('firebase')) {
      await waitForRateLimit('firebase')
    }

    const snap = await getDoc(
      doc(db, DEVICE_COLLECTION, deviceDocId(deviceId)),
    )
    if (!snap.exists()) return null

    const expiryIso = snap.data()?.scholarshipExpiryDate
    if (typeof expiryIso !== 'string') return null
    if (!scholarshipExpiryStillValid(expiryIso)) return null
    return expiryIso
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[UserScholarshipStatus] Device restore failed:',
        error,
      )
    }
    return null
  }
}
