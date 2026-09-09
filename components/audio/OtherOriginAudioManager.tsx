/**
 * Headless playback for "other" origin audio (e.g. crystal bowl on SoundBath).
 * When source + audioOrigin === 'other' and we're NOT on the AudioPlayer screen,
 * creates and manages the expo-av Sound. Playback continues when user leaves the
 * page; mini player shows. When user opens full-screen AudioPlayer, AudioPlayer
 * takes the track from the shared ref.
 */

import { useCallback, useEffect, useRef } from "react"
import { AVPlaybackStatus } from "expo-av"
import { Platform } from "react-native"
import { usePathname } from "expo-router"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { isEmulatorOrSimulator } from "@/constants/emulator"
import {
  otherOriginTrackRef,
  getSourceSignature,
} from "@/src/services/otherOriginTrackRef"
import { createSoundAsyncOffUiThread } from "@/src/utils/audioStreamInit"
import { configureHealingAudioMode } from "@/src/utils/singleActiveSound"

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
  const isFullScreenPlayerMounted = useCurrentAudioStore(
    (s) => s.isFullScreenPlayerMounted,
  )

  const isOnAudioPlayer = pathname?.includes("AudioPlayer") ?? false
  const playerOwnsAudio = isFullScreenPlayerMounted || isOnAudioPlayer
  const isGoodbyeVisible = useGoodbyeModalStore((s) => s.isGoodbyeVisible)
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
      await configureHealingAudioMode({ background: true })

      const sound = await createSoundAsyncOffUiThread(src, {
        initialStatus: {
          shouldPlay: false,
          isLooping: pref.shouldLoop ?? true,
        },
        onPlaybackStatusUpdate,
        androidPreCreateDelayMs: isEmulatorOrSimulator() ? 100 : 50,
        keepPlayingInBackground: true,
        lockScreen: {
          title: meta?.title ?? "Crystal Bowl",
          artist: meta?.author ?? "Awakening Soul",
        },
      })
      await sound.setProgressUpdateIntervalAsync(
        isEmulatorOrSimulator() ? 1000 : 500,
      )
      await sound.setIsLoopingAsync(pref.shouldLoop ?? true)
      await sound.setVolumeAsync(1)
      const loaded = await sound.getStatusAsync()
      if (loaded.isLoaded && loaded.positionMillis > 0) {
        setPositionMs(loaded.positionMillis)
      }
      const sig = getSourceSignature(src)
      otherOriginTrackRef.current = { sound, sourceSignature: sig }
      setPlaying(true)
      try {
        await sound.playAsync()
      } catch (e) {
        console.warn("[OtherOriginAudioManager] playAsync after create:", e)
        setPlaying(false)
      }
    } catch (e) {
      console.warn("[OtherOriginAudioManager] Init error:", e)
      setPlaying(false)
    }
  }, [onPlaybackStatusUpdate, setPlaying, setPositionMs])

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
    if (playerOwnsAudio) {
      return
    }
    if (isGoodbyeVisible || audioOrigin !== "other" || !source || !prefs) {
      void unloadTrack()
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
  }, [isGoodbyeVisible, playerOwnsAudio, source, prefs, audioOrigin, initAndPlay, unloadTrack])

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
    if (playerOwnsAudio || audioOrigin !== "other") return
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
  }, [playerOwnsAudio, audioOrigin, isPlayingFromStore])

  // When we get the track back (ref has same source), sync initial play state
  useEffect(() => {
    if (playerOwnsAudio || audioOrigin !== "other" || !source) return
    const ref = otherOriginTrackRef.current
    if (!ref || ref.sourceSignature !== getSourceSignature(source)) return
    lastIsPlayingRef.current = isPlayingFromStore
  }, [playerOwnsAudio, audioOrigin, source, isPlayingFromStore])

  // Unload when store reset or no source
  useEffect(() => {
    if (!source || audioOrigin !== "other") {
      unloadTrack()
    }
  }, [source, audioOrigin, unloadTrack])

  return null
}
