/**
 * Safe AsyncStorage wrapper for Zustand persist
 *
 * Wraps getItem with try/catch to handle corrupted JSON.
 * On parse failure: clears the key and returns null to prevent crash.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { captureException } from "@/src/services/sentry"

export const safeAsyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name)
      if (!value) return null
      JSON.parse(value)
      return value
    } catch (e) {
      if (__DEV__) {
        console.warn(`[SafeStorage] Corrupted data for ${name}, clearing:`, e)
      }
      captureException(e as Error, { extra: { storageKey: name } })
      await AsyncStorage.removeItem(name)
      return null
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value)
    } catch (e) {
      if (__DEV__) {
        console.warn(`[SafeStorage] Failed to write ${name}:`, e)
      }
      captureException(e as Error, { extra: { storageKey: name, op: "setItem" } })
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name)
    } catch (e) {
      if (__DEV__) {
        console.warn(`[SafeStorage] Failed to remove ${name}:`, e)
      }
      captureException(e as Error, { extra: { storageKey: name, op: "removeItem" } })
    }
  },
}
