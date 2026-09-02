/**
 * Drop In – somatic entrance to the chakra of the day with tuning fork sound.
 * App2 only. Inline chime, no slider: tap plays from the start, tap again
 * unloads (does not resume mid-tone), auto-resets when finished.
 * One-audio rule: before playing, resets store and waits so other managers unload;
 * when store gets a source (music-room or other), stops so only one playback path is active.
 */

import React, { useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, AppState, Pressable, View } from "react-native"
import { AVPlaybackStatus } from "expo-av"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { createSoundAsyncOffUiThread } from "@/src/utils/audioStreamInit"
import { toAbsoluteFileUri } from "@/src/utils/crystalBowlPlayback"
import {
  peekSanctuaryTrack,
  rushSanctuaryTrack,
} from "@/src/services/sanctuaryVaultDownloader"
import { showHealingToast } from "@/utils/healingToast"
import { useVaultTrackDownloadUi } from "@/hooks/useVaultTrackDownloadUi"
import { AUDIO_READY_RIM } from "@/constants/audioUi"
import { registerAndroidBackCleanup } from '@/utils/androidBackCleanup'

const DROP_IN_UNLOAD_WAIT_MS = 200

export function DropInButton({
  audioUri,
  audioId,
  disabled,
  compact = true,
}: {
  audioUri: string | null
  audioId?: string
  disabled?: boolean
  compact?: boolean
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const soundRef = useRef<HealingSound | null>(null)
  const mountedRef = useRef(true)
  const source = useCurrentAudioStore((s) => s.source)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const { vaultReady, progressLabel, isActiveTrack } = useVaultTrackDownloadUi(
    audioId,
    {
      labelMode: 'cue',
      idleLabel: isPlaying ? 'Playing…' : 'Drop In',
    },
  )
  const dropInLabel = isPreparing
    ? 'Opening…'
    : isActiveTrack && progressLabel
      ? progressLabel
      : isPlaying
        ? 'Playing…'
        : 'Drop In'

  const stopAndUnload = useCallback(async () => {
    const s = soundRef.current
    if (s) {
      try {
        await s.stopAsync()
        await s.unloadAsync()
      } catch (_) {}
      soundRef.current = null
    }
    if (mountedRef.current) {
      setIsPlaying(false)
    }
  }, [])

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return
      if (status.didJustFinish && !status.isLooping) {
        stopAndUnload()
      }
    },
    [stopAndUnload],
  )

  const onPress = useCallback(async () => {
    if (disabled || isPreparing) return
    addHapticFeedback(HapticStrength.Light)

    if (isPlaying) {
      await stopAndUnload()
      return
    }

    setIsPreparing(true)
    try {
      useCurrentAudioStore.getState().reset()
      await new Promise((r) => setTimeout(r, DROP_IN_UNLOAD_WAIT_MS))
      let playUri = audioUri
      if (audioId) {
        playUri = await peekSanctuaryTrack(audioId)
        if (!playUri) {
          showHealingToast("gatheringPresence")
          rushSanctuaryTrack(audioId)
          return
        }
      }
      if (!playUri) {
        return
      }
      const sound = await createSoundAsyncOffUiThread(
        { uri: toAbsoluteFileUri(playUri) },
        {
          initialStatus: {
            shouldPlay: true,
          },
          onPlaybackStatusUpdate,
          keepPlayingInBackground: true,
          lockScreen: {
            title: "Tuning Fork",
            artist: "Sound Healing",
          },
        },
      )
      await sound.setVolumeAsync(1)
      soundRef.current = sound
      if (mountedRef.current) setIsPlaying(true)
    } catch (error) {
      console.warn('[DropInButton] play failed', error)
      if (mountedRef.current) setIsPlaying(false)
    } finally {
      if (mountedRef.current) setIsPreparing(false)
    }
  }, [audioUri, audioId, disabled, isPreparing, isPlaying, onPlaybackStatusUpdate, stopAndUnload])

  useEffect(() => {
    return registerAndroidBackCleanup(() => {
      void stopAndUnload()
    })
  }, [stopAndUnload])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      const snapshot = AppState.currentState
      const s = soundRef.current
      setTimeout(() => {
        if (snapshot !== "active" || AppState.currentState !== "active") {
          return
        }
        s?.unloadAsync().catch(() => {})
        if (soundRef.current === s) soundRef.current = null
      }, 150)
    }
  }, [])

  useEffect(() => {
    if (source != null || audioOrigin != null) {
      stopAndUnload()
    }
  }, [source, audioOrigin, stopAndUnload])

  const iconSize = compact ? 20 : 28
  const minWidth = compact ? 44 : 56

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isPreparing}
      accessibilityLabel="Drop in with tuning fork"
      accessibilityHint={
        isPlaying
          ? "Stops the tuning fork. Next tap starts from the beginning"
          : "Plays tuning fork sound for this chakra from the beginning"
      }
      style={{
        minWidth,
        alignItems: "center",
        justifyContent: "center",
      }}
      className="active:opacity-80"
    >
      <View style={{ alignItems: "center", width: "100%" }}>
        <View
          style={{
            width: iconSize + 16,
            height: iconSize + 16,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: (iconSize + 16) / 2,
            borderWidth: vaultReady ? 1.5 : 1,
            borderColor: vaultReady ? AUDIO_READY_RIM : "rgba(255,255,255,0.35)",
          }}
        >
          {disabled || isPreparing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "headset"}
              size={iconSize}
              color="#FFFFFF"
            />
          )}
        </View>
        <AppText
          font="instrument-regular"
          size="xs"
          style={{
            color: "#ffffff",
            marginTop: 4,
            textAlign: "center",
            width: "100%",
            ...(compact ? { fontSize: 11 } : undefined),
          }}
        >
          {dropInLabel}
        </AppText>
      </View>
    </Pressable>
  )
}
