/**
 * Delete account – clear local state and RevenueCat so the same device
 * reopens as a fresh user (WellnessGate once if needed, then ChakraHub).
 *
 * Call after user confirms. Then navigate to ChakraHub and close the sheet.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { logOut } from "./revenuecat"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"

const USER_ID_STORAGE_KEY = "userId"

export async function deleteAccountAndClearLocalState(): Promise<void> {
  await logOut()
  await AsyncStorage.removeItem(USER_ID_STORAGE_KEY)
  useChakraJourneyStore.getState().resetOnboarding()
  useFirstLaunchStore.getState().resetForTesting()
  usePresenceStore.getState().setDisplayName(null)
  usePresenceStore.getState().setProfileImageUri(null)
  usePresenceStore.getState().setLocation(null)
}
