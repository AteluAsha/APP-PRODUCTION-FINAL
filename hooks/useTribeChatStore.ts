/**
 * Global store for Tribe Chat (opened from Notes, etc.)
 *
 * Allows opening Tribe Chat with an optional initial message (e.g. from a note).
 * Recipient (room/friend) can be extended later for group chat and DMs.
 */

import { create } from "zustand"

interface TribeChatStore {
  isOpen: boolean
  initialMessage: string | null
  roomId: string | null
  friendId: string | null
  open: (options?: {
    initialMessage?: string
    roomId?: string
    friendId?: string
  }) => void
  close: () => void
  clearInitialMessage: () => void
}

export const useTribeChatStore = create<TribeChatStore>((set) => ({
  isOpen: false,
  initialMessage: null,
  roomId: null,
  friendId: null,
  open: (options) =>
    set({
      isOpen: true,
      initialMessage: options?.initialMessage ?? null,
      roomId: options?.roomId ?? null,
      friendId: options?.friendId ?? null,
    }),
  close: () =>
    set({
      isOpen: false,
      initialMessage: null,
      roomId: null,
      friendId: null,
    }),
  clearInitialMessage: () =>
    set((state) => ({ ...state, initialMessage: null })),
}))
