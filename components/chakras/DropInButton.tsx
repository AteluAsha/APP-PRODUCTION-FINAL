/**
 * Drop In – somatic entrance to the chakra of the day with tuning fork sound.
 * App2 only. Inline chime via useInlineTuningFork: tap plays from the start,
 * tap again unloads (does not resume mid-tone), auto-resets when finished.
 */

import React from "react"
import { ActivityIndicator, Pressable, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { useInlineTuningFork } from "@/hooks/useInlineTuningFork"
import { useVaultTrackDownloadUi } from "@/hooks/useVaultTrackDownloadUi"
import { AUDIO_READY_RIM } from "@/constants/audioUi"

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
  const { isPlaying, isPreparing, toggle } = useInlineTuningFork({
    audioId,
    audioUri,
    lockScreenTitle: "Tuning Fork",
    disabled,
  })
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

  const iconSize = compact ? 20 : 28
  const minWidth = compact ? 44 : 56

  return (
    <Pressable
      onPress={() => {
        void toggle()
      }}
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
