/**
 * Headless playback for "other" origin audio (e.g. crystal bowl on SoundBath).
 * When source + audioOrigin === 'other' and we're NOT on the AudioPlayer screen,
 * creates and manages the expo-av Sound. Playback continues when user leaves the
 * page; mini player shows. When user opens full-screen AudioPlayer, AudioPlayer
 * takes the track from the shared ref.
 */

import { useCallback, useEffect, useRef } from "react"
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from "expo-av"
import { Platform } from "react-native"
import { usePathname } from "expo-router"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { isEmulatorOrSimulator } from "@/constants/emulator"
import {
  otherOriginTrackRef,
  getSourceSignature,
} from "@/src/services/otherOriginTrackRef"

export function OtherOriginAudioManager() {
  const pathname = usePathname()
  const source = useCurrentAudioStore((s) => s.source)
  const prefs = useCurrentAudioStore((s) => s.prefs)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const isPlayingFromStore = useCurrentAudioStore((s) => s.isPlaying)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)
  const setPositionMs = useCurrentAudioStore((s) => s.setPositionMs)
  const seekToMs = useCurrentAudioStore((s) => s.seekToMs)
  const setSeekTo = useCurrentAudioStore((s) => s.setSeekTo)

  const isOnAudioPlayer = pathname?.includes("AudioPlayer") ?? false
  const lastIsPlayingRef = useRef(false)

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return
      setPlaying(status.isPlaying)
      setPositionMs(status.positionMillis ?? 0)
    },
    [setPlaying, setPositionMs],
  )

  const initAndPlay = useCallback(async () => {
    const state = useCurrentAudioStore.getState()
    const src = state.source
    const pref = state.prefs
    const meta = state.metadata
    if (!src || !pref || state.audioOrigin !== "other") return

    const hasUri = typeof src === "object" && src !== null && "uri" in src
    const uriStr =
      hasUri && typeof (src as { uri?: string }).uri === "string"
        ? (src as { uri: string }).uri
        : ""
    if (hasUri && (!uriStr || uriStr.trim() === "")) {
      if (__DEV__) console.warn("[OtherOriginAudioManager] Invalid or empty source URI, skipping createAsync")
      setPlaying(false)
      return
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        ...(Platform.OS === "android" && { playThroughEarpieceAndroid: false }),
      })

      const { sound } = await Audio.Sound.createAsync(
        src,
        {
          shouldPlay: true,
          isLooping: pref.shouldLoop ?? true,
          ...(Platform.OS === "android" && { androidImplementation: "MediaPlayer" }),
        },
        onPlaybackStatusUpdate,
      )
      await sound.setProgressUpdateIntervalAsync(
        isEmulatorOrSimulator() ? 1000 : 500,
      )
      await sound.setIsLoopingAsync(pref.shouldLoop ?? true)
      await sound.setVolumeAsync(1)
      setPositionMs(0)

      const sig = getSourceSignature(src)
      otherOriginTrackRef.current = { sound, sourceSignature: sig }
      setPlaying(true)
      if (Platform.OS === "android") {
        try {
          await sound.playAsync()
        } catch (e) {
          if (__DEV__) console.warn("[OtherOriginAudioManager] Android playAsync after create:", e)
        }
      }
    } catch (e) {
      if (__DEV__) console.warn("[OtherOriginAudioManager] Init error:", e)
      setPlaying(false)
    }
  }, [onPlaybackStatusUpdate, setPlaying])

  const unloadTrack = useCallback(async () => {
    const ref = otherOriginTrackRef.current
    if (ref) {
      try {
        await ref.sound.unloadAsync()
      } catch (e) {
        if (__DEV__) console.warn("[OtherOriginAudioManager] Unload error:", e)
      }
      otherOriginTrackRef.current = null
    }
    setPlaying(false)
  }, [setPlaying])

  // Create track when not on AudioPlayer and source is set for "other" origin
  useEffect(() => {
    if (isOnAudioPlayer || audioOrigin !== "other" || !source || !prefs) {
      return
    }

    const sig = getSourceSignature(source)
    const ref = otherOriginTrackRef.current

    if (ref && ref.sourceSignature === sig) {
      return
    }

    unloadTrack().then(() => {
      initAndPlay()
    })
  }, [isOnAudioPlayer, source, prefs, audioOrigin, initAndPlay, unloadTrack])

  // Seek when seekToMs is set (crystal bowl slider). On Android, resume playback after seek if was playing.
  useEffect(() => {
    if (seekToMs == null || audioOrigin !== "other") return
    const ref = otherOriginTrackRef.current
    if (!ref) {
      setSeekTo(null)
      return
    }
    const wasPlaying = isPlayingFromStore
    ref.sound
      .setPositionAsync(seekToMs)
      .then(async () => {
        if (Platform.OS === "android" && wasPlaying) {
          await ref.sound.playAsync()
          setPlaying(true)
        }
        setSeekTo(null)
      })
      .catch(() => setSeekTo(null))
  }, [seekToMs, audioOrigin, setSeekTo, isPlayingFromStore, setPlaying])

  // Sync play/pause from store (mini player or crystal bowl button)
  useEffect(() => {
    if (isOnAudioPlayer || audioOrigin !== "other") return
    const ref = otherOriginTrackRef.current
    if (!ref) return
    if (isPlayingFromStore === lastIsPlayingRef.current) return
    lastIsPlayingRef.current = isPlayingFromStore
    const apply = async () => {
      try {
        if (isPlayingFromStore) {
          await ref.sound.playAsync()
        } else {
          await ref.sound.pauseAsync()
        }
      } catch (e) {
        if (__DEV__)
          console.warn("[OtherOriginAudioManager] Play/pause sync error:", e)
      }
    }
    apply()
  }, [isOnAudioPlayer, audioOrigin, isPlayingFromStore])

  // When we get the track back (ref has same source), sync initial play state
  useEffect(() => {
    if (isOnAudioPlayer || audioOrigin !== "other" || !source) return
    const ref = otherOriginTrackRef.current
    if (!ref || ref.sourceSignature !== getSourceSignature(source)) return
    lastIsPlayingRef.current = isPlayingFromStore
  }, [isOnAudioPlayer, audioOrigin, source, isPlayingFromStore])

  // Unload when store reset or no source
  useEffect(() => {
    if (!source || audioOrigin !== "other") {
      unloadTrack()
    }
  }, [source, audioOrigin, unloadTrack])

  return null
}
