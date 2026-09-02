import { create } from 'zustand'

interface TomorrowAwakeningStore {
    completedDayIndex: number | null
    queueTomorrowAwakening: (completedDayIndex: number) => void
    clearTomorrowAwakening: () => void
}

export const useTomorrowAwakeningStore = create<TomorrowAwakeningStore>(
    (set) => ({
        completedDayIndex: null,
        queueTomorrowAwakening: (completedDayIndex) =>
            set({ completedDayIndex }),
        clearTomorrowAwakening: () => set({ completedDayIndex: null }),
    }),
)
