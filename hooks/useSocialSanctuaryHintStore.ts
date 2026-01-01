import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface SocialSanctuaryHintState {
  hasSeenHint: boolean
  setHintSeen: () => void
  resetForTesting: () => void
}

export const useSocialSanctuaryHintStore = create<SocialSanctuaryHintState>()(
  persist(
    (set) => ({
      hasSeenHint: false,
      setHintSeen: () => set({ hasSeenHint: true }),
      resetForTesting: () => set({ hasSeenHint: false }),
    }),
    {
      name: "social-sanctuary-hint-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

