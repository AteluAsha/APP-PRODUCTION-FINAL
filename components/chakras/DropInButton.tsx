/**
 * Drop In – somatic entrance to the chakra of the day with tuning fork sound.
 * App2 only. Shows headset icon + "Drop In"; plays tuning fork in-place, toggles to
 * pause while playing, auto-resets when finished.
 * One-audio rule: before playing, resets store and waits so other managers unload;
 * when store gets a source (music-room or other), stops so only one playback path is active.
 */

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Pressable, View } from "react-native"
import { Audio, AVPlaybackStatus } from "expo-av"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"

const DROP_IN_UNLOAD_WAIT_MS = 200

export function DropInButton({
  audioUri,
  disabled,
  compact = true,
}: {
  audioUri: string | null
  disabled?: boolean
  compact?: boolean
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = useRef<Audio.Sound | null>(null)
  const source = useCurrentAudioStore((s) => s.source)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)

  const stopAndUnload = useCallback(async () => {
    const s = soundRef.current
    if (s) {
      try {
        await s.stopAsync()
        await s.unloadAsync()
      } catch (_) {}
      soundRef.current = null
    }
    setIsPlaying(false)
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
    if (!audioUri || disabled) return
    addHapticFeedback(HapticStrength.Light)

    if (isPlaying) {
      await stopAndUnload()
      return
    }

    try {
      useCurrentAudioStore.getState().reset()
      await new Promise((r) => setTimeout(r, DROP_IN_UNLOAD_WAIT_MS))
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      )
      soundRef.current = sound
      setIsPlaying(true)
    } catch (_) {
      setIsPlaying(false)
    }
  }, [audioUri, disabled, isPlaying, onPlaybackStatusUpdate, stopAndUnload])

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {})
      soundRef.current = null
    }
  }, [])

  useEffect(() => {
    if (source != null || audioOrigin != null) {
      stopAndUnload()
    }
  }, [source, audioOrigin, stopAndUnload])

  if (!audioUri) return null

  const iconSize = compact ? 20 : 28
  const minWidth = compact ? 44 : 56

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
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
            width: iconSize,
            height: iconSize,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "headset"}
            size={iconSize}
            color="#FFFFFF"
          />
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
          Drop In
        </AppText>
      </View>
    </Pressable>
  )
}
