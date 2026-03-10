import { create } from "zustand"

/**
 * Cache of actual loaded duration (ms) per Master Embodiment track.
 * Keys match getEmbodimentAudioId(chakra, part) e.g. embodiment_root, embodiment_third_eye_part1.
 * AudioPlayer writes when it gets status.durationMillis; ChakraTemplate and AudioLibrary read for button labels.
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
  create<EmbodimentDurationCacheStore>((set, get) => ({
    durations: {},
    embodimentDurationCacheKey: null,
    getDuration: (audioId: string) => get().durations[audioId],
    setDuration: (audioId: string, durationMs: number) =>
      set((state) => ({
        durations: { ...state.durations, [audioId]: durationMs },
      })),
    setEmbodimentDurationCacheKey: (key: string | null) =>
      set({ embodimentDurationCacheKey: key }),
    clearEmbodimentDurationCacheKey: () =>
      set({ embodimentDurationCacheKey: null }),
  }))
