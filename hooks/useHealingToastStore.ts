import { create } from 'zustand'

type HealingToastState = {
    message: string | null
    visible: boolean
    lastKey: string | null
    lastShownAt: number
    show: (message: string, opts?: { durationMs?: number; key?: string }) => void
    hide: () => void
}

const DEFAULT_DURATION_MS = 2800
const REPEAT_WINDOW_MS = 1800

export const useHealingToastStore = create<HealingToastState>((set, get) => ({
    message: null,
    visible: false,
    lastKey: null,
    lastShownAt: 0,
    show: (message, opts) => {
        const now = Date.now()
        const key = opts?.key ?? message
        const prev = get()
        if (
            prev.visible &&
            prev.lastKey === key &&
            now - prev.lastShownAt < REPEAT_WINDOW_MS
        ) {
            return
        }
        set({
            message,
            visible: true,
            lastKey: key,
            lastShownAt: now,
        })
        const duration = opts?.durationMs ?? DEFAULT_DURATION_MS
        setTimeout(() => {
            const current = get()
            if (current.message === message && current.visible) {
                set({ visible: false })
            }
        }, duration)
    },
    hide: () => set({ visible: false, message: null }),
}))
