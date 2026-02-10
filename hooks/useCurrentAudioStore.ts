import { AVPlaybackSource } from "expo-av"
import { create } from "zustand"

export interface AudioMetadata {
  durationMs: number
  title: string
  author: string
}

export interface AudioPlayerPrefs {
  shouldLoop: boolean
  isIntroAudio?: boolean // Flag to identify if this is the main intro audio (embodiment meditation)
}

export interface PlaylistItem {
  source: AVPlaybackSource
  metadata: AudioMetadata
  prefs: AudioPlayerPrefs
  trackKey?: string
}

export type AudioOrigin = "music-room" | "other"

interface CurrentAudioStore {
  source: AVPlaybackSource | null
  metadata: AudioMetadata | null
  prefs: AudioPlayerPrefs | null
  playlist: PlaylistItem[] | null
  audioOrigin: AudioOrigin | null
  /** When set, AudioPlayer uses this for the gradient instead of parsing Hz from metadata (e.g. embodiment from chakra day) */
  chakraColor: string | null
  isPlaying: boolean
  currentTrackKey: string | null
  setSource: (source: AVPlaybackSource, origin?: AudioOrigin) => void
  setMetadata: (metadata: AudioMetadata | null) => void
  setPrefs: (prefs: AudioPlayerPrefs | null) => void
  setChakraColor: (color: string | null) => void
  setPlaying: (playing: boolean) => void
  setSourceWithPlaylist: (
    item: PlaylistItem,
    rest: PlaylistItem[],
    trackKey?: string,
  ) => void
  advanceToNext: () => boolean
  reset: () => void
}

export const useCurrentAudioStore = create<CurrentAudioStore>((set, get) => ({
  source: null,
  metadata: null,
  prefs: null,
  playlist: null,
  audioOrigin: null,
  chakraColor: null,
  isPlaying: false,
  currentTrackKey: null,
  setSource: (source, origin = "other") =>
    set({ source, playlist: null, audioOrigin: origin, currentTrackKey: null }),
  setMetadata: (metadata) => set({ metadata }),
  setPrefs: (prefs) => set({ prefs }),
  setChakraColor: (chakraColor) => set({ chakraColor }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSourceWithPlaylist: (item, rest, trackKey?: string) =>
    set({
      source: item.source,
      metadata: item.metadata,
      prefs: { ...item.prefs, shouldLoop: false },
      playlist: rest.length > 0 ? rest : null,
      audioOrigin: "music-room",
      currentTrackKey: trackKey ?? null,
    }),
  advanceToNext: () => {
    const { playlist } = get()
    if (!playlist || playlist.length === 0) return false
    const [next, ...rest] = playlist
    set({
      source: next.source,
      metadata: next.metadata,
      prefs: { ...next.prefs, shouldLoop: false },
      playlist: rest.length > 0 ? rest : null,
      currentTrackKey: next.trackKey ?? null,
    })
    return true
  },
  reset: () =>
    set({
      prefs: null,
      metadata: null,
      source: null,
      playlist: null,
      audioOrigin: null,
      chakraColor: null,
      isPlaying: false,
      currentTrackKey: null,
    }),
}))
