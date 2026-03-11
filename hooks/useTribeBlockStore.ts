/**
 * Tribe block list – users you've blocked (e.g. from pending invites).
 * "Your sacred space. You decide the energy in your tribe."
 * Blocked users' pending invites are hidden; they cannot be re-invited until unblocked.
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface TribeBlockState {
  blockedUserIds: string[]
  blockUser: (userId: string) => void
  unblockUser: (userId: string) => void
  isBlocked: (userId: string) => boolean
}

export const useTribeBlockStore = create<TribeBlockState>()(
  persist(
    (set, get) => ({
      blockedUserIds: [],

      blockUser: (userId) => {
        const id = userId.trim()
        if (!id) return
        set((state) =>
          state.blockedUserIds.includes(id)
            ? state
            : { blockedUserIds: [...state.blockedUserIds, id] },
        )
      },

      unblockUser: (userId) => {
        const id = userId.trim()
        if (!id) return
        set((state) => ({
          blockedUserIds: state.blockedUserIds.filter((x) => x !== id),
        }))
      },

      isBlocked: (userId) => {
        return get().blockedUserIds.includes(userId.trim())
      },
    }),
    {
      name: "tribe-block-list",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
