import { AVPlaybackSource } from "expo-av"
import { create } from "zustand"

/** Delay (ms) after reset before setting new source. Ensures MusicRoomAudioManager
 * and OtherOriginAudioManager have time to unload their tracks before new playback starts.
 * Prevents multiple tracks playing simultaneously. */
const UNLOAD_GRACE_MS = 180

/** Wait this long after setSource/setSourceWithPlaylist before navigating to AudioPlayer
 * so the store has source when the screen mounts (avoids "No audio selected" flash). */
export const AUDIO_READY_DELAY_MS = 320

let pendingSetTimeoutId: ReturnType<typeof setTimeout> | null = null

function clearPendingSet() {
  if (pendingSetTimeoutId) {
    clearTimeout(pendingSetTimeoutId)
    pendingSetTimeoutId = null
  }
}

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

/**
 * APP1 (Trial) only ever has "other" or "full-player" or null – trial cannot reach AudioLibrary (redirect).
 * APP2 (Lifetime) can have "music-room" (Frequency of Gnosis / playlist) or "other" (SoundBath crystal bowl, mini player) or "full-player".
 * "full-player": opened from Master Embodiment, Head to Heart, or SoundBath full page – only AudioPlayer plays; OtherOriginAudioManager must not start (prevents double/echo playback).
 * HARD RULE: Master Embodiment meditation must always use "full-player"; never "other". Entry points: ChakraTemplate (AudioRow), AudioLibrary handlePlayEmbodimentFullPlayer.
 * Only one origin at a time; setSource/setSourceWithPlaylist reset before setting.
 *
 * Audio hard rules (single-owner, no double-play):
 * - Single active playback: Only one AV.Sound should be active. Full-screen playback is owned by AudioPlayer; mini-player by OtherOriginAudioManager / MusicRoomAudioManager; they never play when pathname is AudioPlayer.
 * - Full-player ownership: When audioOrigin === "full-player", only AudioPlayer creates and owns the sound; it must stop and unload that sound before any reset() and navigation.
 * - Close rule: Any "close player and navigate" must go through one code path (AudioPlayer.closePlayerAndNavigate) that awaits stop + unload, then reset, then navigate. Prevents double-play when user taps the same or another track.
 * - AudioPlayer never routes to goodbye: only close or revert back. Goodbye is shown only by the course page (ChakraHome) when the user is on it with a completed day.
 * - Completion rule: Day completion (dot) can be set at track end or at 80% (dot only). No progress threshold affects audio or navigation. Goodbye is driven by the course page, not by AudioPlayer.
 *
 * SAFE SPACE (healing audio): Playback may only stop on (1) user closes player, (2) user pauses, (3) user leaves screen (back/revert), or (4) track ends. No other system (Anua, modals, navigation, app state) may call reset() or stop playback. When track ends, player stays open or returns to Audio Library (lifetime); no auto-close. Anua must never control or stop healing audio.
 */
export type AudioOrigin = "music-room" | "other" | "full-player"

interface CurrentAudioStore {
  source: AVPlaybackSource | null
  metadata: AudioMetadata | null
  prefs: AudioPlayerPrefs | null
  playlist: PlaylistItem[] | null
  audioOrigin: AudioOrigin | null
  /** When set, AudioPlayer uses this for the gradient instead of parsing Hz from metadata (e.g. embodiment from chakra day) */
  chakraColor: string | null
  isPlaying: boolean
  /** Playback position in ms (e.g. for "other" origin crystal bowl slider). */
  positionMs: number
  /** Seek target; when set, manager seeks then clears. */
  seekToMs: number | null
  currentTrackKey: string | null
  /** Set on play tap so UI shows active (pause) until source is set or fails. Cleared in setSource/setSourceWithPlaylist delayed callback or on reset. */
  pendingTrackKey: string | null
  setPendingTrackKey: (key: string | null) => void
  setPositionMs: (ms: number) => void
  setSeekTo: (ms: number | null) => void
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
  reset: (opts?: { keepPending?: boolean }) => void
}

export const useCurrentAudioStore = create<CurrentAudioStore>((set, get) => ({
  source: null,
  metadata: null,
  prefs: null,
  playlist: null,
  audioOrigin: null,
  chakraColor: null,
  isPlaying: false,
  positionMs: 0,
  seekToMs: null,
  currentTrackKey: null,
  pendingTrackKey: null,
  setPendingTrackKey: (key) => set({ pendingTrackKey: key }),
  setPositionMs: (ms) => set({ positionMs: ms }),
  setSeekTo: (ms) => set({ seekToMs: ms }),
  setSource: (source, origin: AudioOrigin = "full-player") => {
    // HARD RULE: Only one audio can play at a time. Reset first (keep pending so UI stays active), then delay before setting
    // new source so managers (MusicRoom, OtherOrigin) can unload their tracks.
    clearPendingSet()
    get().reset({ keepPending: true })
    pendingSetTimeoutId = setTimeout(() => {
      pendingSetTimeoutId = null
      set({
        source,
        playlist: null,
        audioOrigin: origin,
        currentTrackKey: null,
        pendingTrackKey: null,
      })
    }, UNLOAD_GRACE_MS)
  },
  setMetadata: (metadata) => set({ metadata }),
  setPrefs: (prefs) => set({ prefs }),
  setChakraColor: (chakraColor) => set({ chakraColor }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSourceWithPlaylist: (item, rest, trackKey?: string) => {
    clearPendingSet()
    get().reset({ keepPending: true })
    set({
      audioOrigin: "music-room",
      currentTrackKey: trackKey ?? null,
      isPlaying: true,
    })
    pendingSetTimeoutId = setTimeout(() => {
      pendingSetTimeoutId = null
      set({
        source: item.source,
        metadata: item.metadata,
        prefs: { ...item.prefs, shouldLoop: false },
        playlist: rest.length > 0 ? rest : null,
        audioOrigin: "music-room",
        currentTrackKey: trackKey ?? null,
        pendingTrackKey: null,
      })
    }, UNLOAD_GRACE_MS)
  },
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
  reset: (opts?: { keepPending?: boolean }) => {
    clearPendingSet()
    const keep = opts?.keepPending === true
    set({
      prefs: null,
      metadata: null,
      source: null,
      playlist: null,
      audioOrigin: null,
      chakraColor: null,
      positionMs: 0,
      seekToMs: null,
      ...(keep ? {} : { isPlaying: false, currentTrackKey: null, pendingTrackKey: null }),
    })
  },
}))
