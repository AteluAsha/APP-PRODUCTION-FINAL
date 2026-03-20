/**
 * Download icon cell – SINGLE SOURCE OF TRUTH for Audio Library download icons.
 * Used by the top "download all" row (optional `compact` ≈20% smaller) and AudioTrackRow (60×44 cell, icons 20/21).
 * Locked production design: cloud, queued, and downloading use white;
 * downloaded uses green (#87AE73) checkmark so already-downloaded tracks are clear.
 */

import React from "react"
import { View, Pressable, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"

export type DownloadIconVariant = "cloud" | "downloading" | "queued" | "downloaded"

const CELL_WIDTH = 60
const CELL_HEIGHT = 44
/** ~25% smaller than prior 26/28 — subtler vs track typography; cell stays 60×44 for tap targets */
const ICON_SIZE = 20
const CHECKMARK_SIZE = 21
/** 20% smaller than default — header "Download all" row only */
const COMPACT = 0.8

export interface DownloadIconCellProps {
  variant: DownloadIconVariant
  onPress?: () => void
  disabled?: boolean
  /** When true, cell and icons render ~20% smaller (Frequency of Gnosis download-all only). */
  compact?: boolean
}

export function DownloadIconCell({
  variant,
  onPress,
  disabled = false,
  compact = false,
}: DownloadIconCellProps) {
  const w = compact ? Math.round(CELL_WIDTH * COMPACT) : CELL_WIDTH
  const h = compact ? Math.round(CELL_HEIGHT * COMPACT) : CELL_HEIGHT
  const iconSize = compact ? Math.round(ICON_SIZE * COMPACT) : ICON_SIZE
  const checkSize = compact ? Math.round(CHECKMARK_SIZE * COMPACT) : CHECKMARK_SIZE

  const content = (
    <View
      style={{
        width: w,
        height: h,
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
            style={[
              {
                color: "rgba(255,255,255,0.95)",
                marginTop: compact ? 1 : 2,
              },
              compact && { fontSize: 10 },
            ]}
          >
            Downloading
          </AppText>
        </>
      ) : variant === "queued" ? (
        <>
          <Ionicons name="time-outline" size={iconSize} color="#ffffff" />
          <AppText
            font="instrument-regular"
            size="xs"
            style={[
              {
                color: "rgba(255,255,255,0.9)",
                marginTop: compact ? 1 : 2,
              },
              compact && { fontSize: 10 },
            ]}
          >
            Queued
          </AppText>
        </>
      ) : variant === "downloaded" ? (
        <Ionicons name="checkmark-circle" size={checkSize} color="#87AE73" />
      ) : (
        <Ionicons
          name="cloud-download-outline"
          size={iconSize}
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
