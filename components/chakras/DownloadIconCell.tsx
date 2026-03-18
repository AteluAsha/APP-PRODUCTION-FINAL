/**
 * Download icon cell – SINGLE SOURCE OF TRUTH for Audio Library download icons.
 * Used by the top "download all" row and by AudioTrackRow. Same 60×44 container,
 * Ionicons size 26. Locked production design: cloud, queued, and downloading use white;
 * downloaded uses green (#87AE73) checkmark so already-downloaded tracks are clear.
 */

import React from "react"
import { View, Pressable, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"

export type DownloadIconVariant = "cloud" | "downloading" | "queued" | "downloaded"

const CELL_WIDTH = 60
const CELL_HEIGHT = 44
const ICON_SIZE = 26

export interface DownloadIconCellProps {
  variant: DownloadIconVariant
  onPress?: () => void
  disabled?: boolean
}

export function DownloadIconCell({
  variant,
  onPress,
  disabled = false,
}: DownloadIconCellProps) {
  const content = (
    <View
      style={{
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {variant === "downloading" ? (
        <>
          <ActivityIndicator size="small" color="#ffffff" />
          <AppText
            font="instrument-regular"
            size="xs"
            style={{ color: "rgba(255,255,255,0.95)", marginTop: 2 }}
          >
            Downloading
          </AppText>
        </>
      ) : variant === "queued" ? (
        <>
          <Ionicons name="time-outline" size={ICON_SIZE} color="#ffffff" />
          <AppText
            font="instrument-regular"
            size="xs"
            style={{ color: "rgba(255,255,255,0.9)", marginTop: 2 }}
          >
            Queued
          </AppText>
        </>
      ) : variant === "downloaded" ? (
        <Ionicons name="checkmark-circle" size={28} color="#87AE73" />
      ) : (
        <Ionicons
          name="cloud-download-outline"
          size={ICON_SIZE}
          color="#ffffff"
        />
      )}
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{
          opacity: disabled && variant !== "downloaded" ? 0.6 : 1,
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        {content}
      </Pressable>
    )
  }
  return content
}
