/**
 * Delete account – clear local state and RevenueCat so the same device
 * reopens as a fresh user (WelcomeScreen → DateSelection → trials → paywall).
 *
 * Call after user confirms. Then navigate to WelcomeScreen and close the sheet.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { logOut } from "./revenuecat"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { usePresenceStore } from "@/hooks/usePresenceStore"

const USER_ID_STORAGE_KEY = "userId"

export async function deleteAccountAndClearLocalState(): Promise<void> {
  await logOut()
  await AsyncStorage.removeItem(USER_ID_STORAGE_KEY)
  useChakraJourneyStore.getState().resetOnboarding()
  usePresenceStore.getState().setDisplayName(null)
  usePresenceStore.getState().setProfileImageUri(null)
  usePresenceStore.getState().setLocation(null)
}
