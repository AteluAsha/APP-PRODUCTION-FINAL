/**
 * Presence Store – display name, profile image, location, first-Monday onboarding
 *
 * Persisted so name/photo/location and "has completed first Monday presence" survive restarts.
 * Used by ProfileSheet and presence-backed identity.
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface PresenceState {
  displayName: string | null
  profileImageUri: string | null
  location: string | null
  hasCompletedFirstMondayPresence: boolean

  setDisplayName: (name: string | null) => void
  setProfileImageUri: (uri: string | null) => void
  setLocation: (location: string | null) => void
  setHasCompletedFirstMondayPresence: (value: boolean) => void
}

export const usePresenceStore = create<PresenceState>()(
  persist(
    (set) => ({
      displayName: null,
      profileImageUri: null,
      location: null,
      hasCompletedFirstMondayPresence: false,

      setDisplayName: (name) => set({ displayName: name }),
      setProfileImageUri: (uri) => set({ profileImageUri: uri }),
      setLocation: (location) => set({ location }),
      setHasCompletedFirstMondayPresence: (value) =>
        set({ hasCompletedFirstMondayPresence: value }),
    }),
    {
      name: "soul-school-presence",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        displayName: state.displayName,
        profileImageUri: state.profileImageUri,
        location: state.location,
        hasCompletedFirstMondayPresence: state.hasCompletedFirstMondayPresence,
      }),
    },
  ),
)
