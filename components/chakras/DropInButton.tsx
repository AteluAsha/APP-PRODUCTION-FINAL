/**
 * Drop In – somatic entrance to the chakra of the day with tuning fork sound.
 * App2 only. Shows headset icon + "Drop In"; plays tuning fork in-place, toggles to
 * pause while playing, auto-resets when finished.
 */

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Pressable, View } from "react-native"
import { Audio, AVPlaybackStatus } from "expo-av"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export function DropInButton({
  audioUri,
  disabled,
}: {
  audioUri: string | null
  disabled?: boolean
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = useRef<Audio.Sound | null>(null)

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

  if (!audioUri) return null

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="items-center justify-center active:opacity-80"
      style={{ minWidth: 56 }}
    >
      <Ionicons
        name={isPlaying ? "pause" : "headset"}
        size={28}
        color="#FFFFFF"
      />
      <AppText
        font="instrument-regular"
        size="xs"
        className="text-white mt-1"
      >
        Drop In
      </AppText>
    </Pressable>
  )
}
