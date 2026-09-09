import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { safeAsyncStorage } from "@/src/utils/safeAsyncStorage"
import { preferPlayerDurationMs } from "@/utils/displayAudioDuration"

/**
 * Button minute labels. AudioPlayer writes the real file length once per
 * audioId. Same file: rest. A new file whose length differs by a minute
 * or more replaces the number, then rest.
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
        getDuration: (audioId: string) => get().durations?.[audioId],
        setDuration: (audioId: string, durationMs: number) => {
          if (!Number.isFinite(durationMs) || durationMs <= 0) return
          const current = get().durations?.[audioId]
          // Same file can report a few ms of jitter. Rest unless a new audio.
          if (
            current != null &&
            Math.abs(current - durationMs) < 60_000
          ) {
            return
          }
          set((state) => ({
            durations: { ...(state.durations ?? {}), [audioId]: durationMs },
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
        partialize: (state) => ({ durations: state.durations ?? {} }),
        merge: (persistedState, currentState) => {
          const persisted =
            persistedState && typeof persistedState === "object"
              ? (persistedState as Partial<EmbodimentDurationCacheStore>)
              : {}
          return {
            ...currentState,
            ...persisted,
            durations: {
              ...(currentState.durations ?? {}),
              ...(persisted.durations ?? {}),
            },
          }
        },
      },
    ),
  )

/** Course / library / Asha labels: player minutes once logged, else catalog. */
export function useResolvedTrackDurationMs(
  audioId: string | undefined,
  catalogMs: number,
): number {
  const cached = useEmbodimentDurationCacheStore((s) =>
    audioId ? s.durations?.[audioId] : undefined,
  )
  return preferPlayerDurationMs(cached, catalogMs)
}
