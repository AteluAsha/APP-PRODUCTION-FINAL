/**
 * MusicRoomAudioManager
 *
 * Headless playback for Music Room (Frequency of Gnosis) audio. APP2 (Lifetime) only:
 * - Only runs when source + audioOrigin === 'music-room'. Trial never sets that.
 * - When user is ON the full-screen AudioPlayer, we must not own the track (AudioPlayer
 *   does). Otherwise we'd double-play. So we unload when pathname is AudioPlayer and
 *   do not init while on that screen.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { AVPlaybackStatus } from "expo-av"
import { usePathname } from "expo-router"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { isEmulatorOrSimulator } from "@/constants/emulator"
import { createSoundAsyncOffUiThread } from "@/src/utils/audioStreamInit"
import {
  configureHealingAudioMode,
  type HealingSound,
} from "@/src/utils/singleActiveSound"

export function MusicRoomAudioManager() {
  const pathname = usePathname()
  const source = useCurrentAudioStore((s) => s.source)
  const prefs = useCurrentAudioStore((s) => s.prefs)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const isPlayingFromStore = useCurrentAudioStore((s) => s.isPlaying)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)
  const isFullScreenPlayerMounted = useCurrentAudioStore(
    (s) => s.isFullScreenPlayerMounted,
  )

  const isOnAudioPlayer = pathname?.includes("AudioPlayer") ?? false
  const playerOwnsAudio = isFullScreenPlayerMounted || isOnAudioPlayer
  const isGoodbyeVisible = useGoodbyeModalStore((s) => s.isGoodbyeVisible)

  const trackRef = useRef<HealingSound | null>(null)
  const lastSourceRef = useRef<typeof source>(null)
  const lastIsPlayingRef = useRef(false)
  const userPauseRequestedAtRef = useRef<number>(0)
  const initInProgressRef = useRef(false)
  const [justFinished, setJustFinished] = useState(false)

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return
      // Ignore stale "isPlaying: true" for 800ms after user requested pause (e.g. after returning to Music Room)
      if (status.isPlaying && userPauseRequestedAtRef.current > 0) {
        const elapsed = Date.now() - userPauseRequestedAtRef.current
        if (elapsed < 800) return
        userPauseRequestedAtRef.current = 0
      }
      setPlaying(status.isPlaying)
      if (status.didJustFinish) {
        setJustFinished(true)
      }
    },
    [setPlaying],
  )

  const initAndPlay = useCallback(async () => {
    if (initInProgressRef.current) return
    const state = useCurrentAudioStore.getState()
    const src = state.source
    const pref = state.prefs
    if (!src || !pref || state.audioOrigin !== "music-room") return
    if (
      typeof src === "object" &&
      src !== null &&
      "uri" in src &&
      !(typeof (src as { uri?: unknown }).uri === "string" && (src as { uri: string }).uri.trim())
    )
      return

    initInProgressRef.current = true
    try {
      await configureHealingAudioMode({ background: true })

      const sound = await createSoundAsyncOffUiThread(src, {
        initialStatus: {
          shouldPlay: true,
          isLooping: false,
        },
        onPlaybackStatusUpdate,
        androidPreCreateDelayMs: isEmulatorOrSimulator() ? 100 : 50,
        keepPlayingInBackground: true,
        lockScreen: {
          title: state.metadata?.title ?? "Frequency of Gnosis",
          artist: state.metadata?.author ?? "Awakening Soul",
        },
      })
      trackRef.current = sound
      await sound.setProgressUpdateIntervalAsync(
        isEmulatorOrSimulator() ? 1000 : 500,
      )
      await sound.setIsLoopingAsync(false)
      await sound.setVolumeAsync(1)
      setPlaying(true)
    } catch (e) {
      if (__DEV__) console.warn("[MusicRoomAudioManager] Init error:", e)
      setPlaying(false)
    } finally {
      initInProgressRef.current = false
    }
  }, [onPlaybackStatusUpdate, setPlaying])

  const unloadTrack = useCallback(
    async (opts?: { skipSetPlaying?: boolean }) => {
      if (trackRef.current) {
        try {
          await trackRef.current.unloadAsync()
        } catch (e) {
          if (__DEV__)
            console.warn("[MusicRoomAudioManager] Unload error:", e)
        }
        trackRef.current = null
      }
      const skip =
        opts?.skipSetPlaying === true ||
        useCurrentAudioStore.getState().pendingTrackKey != null
      if (!skip) setPlaying(false)
    },
    [setPlaying],
  )

  // Handle play/pause from store (user tapped in mini player or Music Room row)
  // On pause/play failure (e.g. after backgrounding), unload to avoid stuck state and glitching
  useEffect(() => {
    const track = trackRef.current
    if (!track || audioOrigin !== "music-room") return
    if (isPlayingFromStore !== lastIsPlayingRef.current) {
      lastIsPlayingRef.current = isPlayingFromStore
      if (!isPlayingFromStore) userPauseRequestedAtRef.current = Date.now()
      const apply = async () => {
        try {
          if (isPlayingFromStore) {
            await track.playAsync()
          } else {
            await track.pauseAsync()
          }
        } catch (e) {
          if (__DEV__)
            console.warn("[MusicRoomAudioManager] Play/pause error:", e)
          userPauseRequestedAtRef.current = 0
          lastIsPlayingRef.current = false
          setPlaying(false)
          try {
            await track.unloadAsync()
          } catch (_) {
            /* ignore */
          }
          trackRef.current = null
        }
      }
      apply()
    }
  }, [isPlayingFromStore, audioOrigin, setPlaying])

  // Handle didJustFinish -> stop playback (no continuous play); reset store and unload so button returns to play
  useEffect(() => {
    if (!justFinished || audioOrigin !== "music-room") return
    setJustFinished(false)
    useCurrentAudioStore.getState().reset()
    lastSourceRef.current = null
    unloadTrack()
  }, [justFinished, audioOrigin, unloadTrack])

  // Main effect: init when source changes for music-room, but NOT when user is on
  // full-screen AudioPlayer (it owns the track there) or on goodbye.
  useEffect(() => {
    if (
      audioOrigin !== "music-room" ||
      !source ||
      !prefs ||
      playerOwnsAudio ||
      isGoodbyeVisible
    ) {
      unloadTrack()
      return
    }

    const sourceChanged = lastSourceRef.current !== source
    lastSourceRef.current = source

    if (sourceChanged) {
      unloadTrack({ skipSetPlaying: true }).then(() => {
        initAndPlay()
      })
    }

    return () => {
      unloadTrack()
    }
  }, [source, prefs, audioOrigin, playerOwnsAudio, isGoodbyeVisible])

  // Unload when store reset (source cleared)
  useEffect(() => {
    if (!source) {
      unloadTrack()
      lastSourceRef.current = null
    }
  }, [source, unloadTrack])

  return null
}
