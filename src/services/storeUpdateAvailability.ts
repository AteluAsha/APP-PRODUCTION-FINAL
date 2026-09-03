/**
 * Ask the store whether a newer binary exists for this install.
 * Fail closed: any error or unknown state means no prompt.
 *
 * Android uses Play In-App Updates (only true if Play has a newer versionCode
 * than the one on the device — auto-update already applied → false).
 * iOS uses the iTunes lookup API against the installed marketing version.
 */
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import {
    ANDROID_PACKAGE_ID,
    APP_STORE_LOOKUP_ID,
} from '@/constants/storeUpdateNotice'
import { isStoreVersionAhead } from '@/src/utils/compareDottedVersion'

export interface StoreUpdateAvailability {
    available: boolean
    storeVersion: string
}

const EMPTY: StoreUpdateAvailability = { available: false, storeVersion: '' }

export async function checkStoreUpdateAvailability(): Promise<StoreUpdateAvailability> {
    if (Platform.OS === 'web') return EMPTY
    if (__DEV__) return EMPTY

    try {
        if (Platform.OS === 'ios') {
            return await checkIosAppStore()
        }
        if (Platform.OS === 'android') {
            return await checkAndroidPlayStore()
        }
    } catch {
        return EMPTY
    }
    return EMPTY
}

async function checkIosAppStore(): Promise<StoreUpdateAvailability> {
    const installed = Constants.nativeAppVersion ?? ''
    const url = `https://itunes.apple.com/lookup?id=${APP_STORE_LOOKUP_ID}&t=${Date.now()}`
    const response = await fetch(url)
    if (!response.ok) return EMPTY
    const json = (await response.json()) as {
        results?: { version?: string; bundleId?: string }[]
    }
    const result = json.results?.[0]
    if (result?.bundleId && result.bundleId !== ANDROID_PACKAGE_ID) {
        return EMPTY
    }
    const storeVersion = result?.version ?? ''
    if (!isStoreVersionAhead(storeVersion, installed)) return EMPTY
    return { available: true, storeVersion }
}

async function checkAndroidPlayStore(): Promise<StoreUpdateAvailability> {
    try {
        const ExpoInAppUpdates = require('expo-in-app-updates') as {
            checkForUpdate?: () => Promise<{
                updateAvailable?: boolean
                storeVersion?: string | number
            }>
        }
        if (typeof ExpoInAppUpdates.checkForUpdate !== 'function') {
            return EMPTY
        }
        const result = await ExpoInAppUpdates.checkForUpdate()
        if (!result?.updateAvailable) return EMPTY
        const storeVersion = String(result.storeVersion ?? ANDROID_PACKAGE_ID)
        return { available: true, storeVersion }
    } catch {
        return EMPTY
    }
}
