import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { safeAsyncStorage } from "@/src/utils/safeAsyncStorage"

/**
 * Cache of actual loaded duration (ms) per full-player track.
 * Survives app restart so a remaster longer than catalog does not shrink
 * the slider on the next open while native duration is still 0.
 * AudioPlayer writes when it gets a credible status.durationMillis.
 */
interface EmbodimentDurationCacheStore {
  /** audioId -> durationMs from loaded file */
  durations: Record<string, number>
  /** Set by callers when starting embodiment playback; player writes duration then clears this */
  embodimentDurationCacheKey: string | null
  getDuration: (audioId: string) => number | undefined
  setDuration: (audioId: string, durationMs: number) => void
  setEmbodimentDurationCacheKey: (key: string | null) => void
  clearEmbodimentDurationCacheKey: () => void
}

export const useEmbodimentDurationCacheStore =
  create<EmbodimentDurationCacheStore>()(
    persist(
      (set, get) => ({
        durations: {},
        embodimentDurationCacheKey: null,
        getDuration: (audioId: string) => get().durations[audioId],
        setDuration: (audioId: string, durationMs: number) => {
          if (!Number.isFinite(durationMs) || durationMs <= 0) return
          const current = get().durations[audioId]
          if (current != null && current >= durationMs) return
          set((state) => ({
            durations: { ...state.durations, [audioId]: durationMs },
          }))
        },
        setEmbodimentDurationCacheKey: (key: string | null) =>
          set({ embodimentDurationCacheKey: key }),
        clearEmbodimentDurationCacheKey: () =>
          set({ embodimentDurationCacheKey: null }),
      }),
      {
        name: "full-player-duration-cache",
        storage: createJSONStorage(() => safeAsyncStorage),
        partialize: (state) => ({ durations: state.durations }),
      },
    ),
  )
