/**
 * Journey Notes Store
 *
 * Notes are always available on the 7-day course.
 * Stored until the seeker deletes them. Never cleared by week rollover.
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
  /** ISO time after last successful journey-notes file export (incremental window). */
  lastJourneyNotesExportAt: string | null
  addNote: (note: Omit<JourneyNote, "id" | "createdAt">) => void
  getAllNotes: (type?: "journey" | "meditation") => JourneyNote[]
  getNotesForDay: (chakraDay: number) => JourneyNote[]
  getNotesCount: (type?: "journey" | "meditation") => number
  deleteNote: (id: string) => void
  clearAllNotes: () => void
  markJourneyNotesExportedNow: () => void
}

export const useJourneyNotesStore = create<JourneyNotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      lastJourneyNotesExportAt: null,

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

      markJourneyNotesExportedNow: () => {
        set({ lastJourneyNotesExportAt: new Date().toISOString() })
      },
    }),
    {
      name: "journey-notes-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
