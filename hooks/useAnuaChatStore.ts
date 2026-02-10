/**
 * Global store for Anua Chat Modal
 *
 * Allows opening Anua from anywhere (Notes, Sanctuary, etc.) with optional
 * initial message to start the conversation immediately.
 */

import { create } from "zustand"

interface AnuaChatStore {
  isOpen: boolean
  initialMessage: string | null
  isWaitingRoom: boolean
  chakraDayOverride: number | null
  open: (options?: {
    initialMessage?: string
    isWaitingRoom?: boolean
    chakraDayOverride?: number
  }) => void
  close: () => void
}

export const useAnuaChatStore = create<AnuaChatStore>((set) => ({
  isOpen: false,
  initialMessage: null,
  isWaitingRoom: false,
  chakraDayOverride: null,
  open: (options) =>
    set({
      isOpen: true,
      initialMessage: options?.initialMessage ?? null,
      isWaitingRoom: options?.isWaitingRoom ?? false,
      chakraDayOverride: options?.chakraDayOverride ?? null,
    }),
  close: () =>
    set({
      isOpen: false,
      initialMessage: null,
      isWaitingRoom: false,
      chakraDayOverride: null,
    }),
}))
