/**
 * MusicRoomAudioManager
 *
 * Headless playback for Music Room audio. When source + audioOrigin === 'music-room',
 * creates and manages the expo-av Sound. No UI. Handles play/pause from store and
 * playlist advance on track end.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from "expo-av"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"

export function MusicRoomAudioManager() {
  const source = useCurrentAudioStore((s) => s.source)
  const prefs = useCurrentAudioStore((s) => s.prefs)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const isPlayingFromStore = useCurrentAudioStore((s) => s.isPlaying)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)

  const trackRef = useRef<Audio.Sound | null>(null)
  const lastSourceRef = useRef<typeof source>(null)
  const lastIsPlayingRef = useRef(false)
  const userPauseRequestedAtRef = useRef<number>(0)
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
    const state = useCurrentAudioStore.getState()
    const src = state.source
    const pref = state.prefs
    const meta = state.metadata
    if (!src || !pref || state.audioOrigin !== "music-room") return

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      })

      const { sound } = await Audio.Sound.createAsync(
        src,
        { shouldPlay: true, isLooping: false },
        onPlaybackStatusUpdate,
      )
      trackRef.current = sound
      await sound.setIsLoopingAsync(false)
      await sound.setVolumeAsync(1)
      setPlaying(true)
    } catch (e) {
      if (__DEV__) console.warn("[MusicRoomAudioManager] Init error:", e)
      setPlaying(false)
    }
  }, [onPlaybackStatusUpdate, setPlaying])

  const unloadTrack = useCallback(async () => {
    if (trackRef.current) {
      try {
        await trackRef.current.unloadAsync()
      } catch (e) {
        if (__DEV__) console.warn("[MusicRoomAudioManager] Unload error:", e)
      }
      trackRef.current = null
    }
    setPlaying(false)
  }, [setPlaying])

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
          if (__DEV__) console.warn("[MusicRoomAudioManager] Play/pause error:", e)
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

  // Handle didJustFinish -> advance to next in playlist
  useEffect(() => {
    if (!justFinished || audioOrigin !== "music-room") return
    setJustFinished(false)

    const advanced = useCurrentAudioStore.getState().advanceToNext()
    if (advanced) {
      lastSourceRef.current = null
      unloadTrack().then(() => {
        initAndPlay()
      })
    }
  }, [justFinished, audioOrigin, unloadTrack, initAndPlay])

  // Main effect: init when source changes for music-room
  useEffect(() => {
    if (audioOrigin !== "music-room" || !source || !prefs) {
      unloadTrack()
      return
    }

    const sourceChanged = lastSourceRef.current !== source
    lastSourceRef.current = source

    if (sourceChanged) {
      unloadTrack().then(() => {
        initAndPlay()
      })
    }

    return () => {
      unloadTrack()
    }
  }, [source, prefs, audioOrigin])

  // Unload when store reset (source cleared)
  useEffect(() => {
    if (!source) {
      unloadTrack()
      lastSourceRef.current = null
    }
  }, [source, unloadTrack])

  return null
}
