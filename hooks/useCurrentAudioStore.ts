import { AVPlaybackSource } from "expo-av"
import { create } from "zustand"

interface AudioMetadata {
  durationMs: number
  title: string
  author: string
}

interface AudioPlayerPrefs {
  shouldLoop: boolean
  isIntroAudio?: boolean // Flag to identify if this is the main intro audio (embodiment meditation)
}

interface CurrentAudioStore {
  source: AVPlaybackSource | null
  metadata: AudioMetadata | null
  prefs: AudioPlayerPrefs | null
  setSource: (source: AVPlaybackSource) => void
  setMetadata: (metadata: AudioMetadata | null) => void
  setPrefs: (prefs: AudioPlayerPrefs | null) => void
  reset: () => void
}

export const useCurrentAudioStore = create<CurrentAudioStore>((set) => ({
  source: null,
  metadata: null,
  prefs: null,
  setSource: (source) => set({ source }),
  setMetadata: (metadata) => set({ metadata }),
  setPrefs: (prefs) => set({ prefs }),
  reset: () => set({ prefs: null, metadata: null, source: null }),
}))
