/**
 * Journey Notes Store
 *
 * ARCHITECTURE: "Two Apps in One"
 * - APP_1 (Trial): Notes available when journey starts (first Monday opens)
 * - APP_2 (Lifetime): Notes always available
 *
 * CRITICAL: Notes are always stored and never deleted unless user chooses.
 * Storage persists across app restarts, trial resets, and app updates.
 *
 * Manages personal journey notes and reflections
 * Stores notes organized by chakra day
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface JourneyNote {
  id: string
  chakraDay: number
  content: string
  createdAt: string
  type?: "journey" | "meditation" // Type of note
}

interface JourneyNotesState {
  notes: JourneyNote[]
  addNote: (note: Omit<JourneyNote, "id" | "createdAt">) => void
  getAllNotes: (type?: "journey" | "meditation") => JourneyNote[]
  getNotesForDay: (chakraDay: number) => JourneyNote[]
  getNotesCount: (type?: "journey" | "meditation") => number
  deleteNote: (id: string) => void
  clearAllNotes: () => void
}

export const useJourneyNotesStore = create<JourneyNotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (noteData) => {
        const newNote: JourneyNote = {
          ...noteData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          notes: [...state.notes, newNote],
        }))
      },

      getAllNotes: (type) => {
        const notes = get().notes
        if (type) {
          return notes.filter((note) => note.type === type)
        }
        return notes
      },

      getNotesForDay: (chakraDay) => {
        return get().notes.filter((note) => note.chakraDay === chakraDay)
      },

      getNotesCount: (type) => {
        const notes = get().notes
        if (type) {
          return notes.filter((note) => note.type === type).length
        }
        return notes.length
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }))
      },

      clearAllNotes: () => {
        set({ notes: [] })
      },
    }),
    {
      name: "journey-notes-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
