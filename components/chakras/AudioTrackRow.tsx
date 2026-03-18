/**
 * Audio track row for Frequency of Gnosis (Audio Library).
 * Full-width transparent bar with play icon, title, hertz badge, and download.
 * Extracted from AudioLibrary to fix Fast Refresh (nested component anti-pattern).
 */

import React from "react"
import { View, Pressable, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { DownloadIconCell, type DownloadIconVariant } from "@/components/chakras/DownloadIconCell"

export interface AudioTrackRowProps {
  title: string
  subtitle: string
  hertz?: string
  durationLabel: string
  isLoading: boolean
  isConnected: boolean
  disabledWhenUnconnected?: boolean
  onPlay: () => void
  onDownload?: () => void
  audioId?: string
  url?: string | null
  localUri?: string | null
  canDownload?: boolean
  isActiveTrack?: boolean
  isPlaying?: boolean
  downloadedIds?: Set<string>
  downloadingId?: string | null
  /** True when this track is in the download queue but not currently downloading */
  isQueued?: boolean
  /** When true, download button is enabled even without url (parent will resolve URL on tap, e.g. crystal bowl from Firebase) */
  canResolveDownload?: boolean
  /** Optional content to render on the right, before download (e.g. Drop In button) */
  rightContent?: React.ReactNode
}

export const AudioTrackRow = ({
  title,
  durationLabel,
  hertz,
  isLoading,
  isConnected,
  disabledWhenUnconnected = false,
  onPlay,
  onDownload,
  audioId,
  url,
  localUri,
  canDownload,
  isActiveTrack = false,
  isPlaying = false,
  downloadedIds = new Set(),
  downloadingId = null,
  isQueued = false,
  canResolveDownload = false,
  rightContent,
}: AudioTrackRowProps) => {
  const isDownloaded = audioId ? localUri || downloadedIds.has(audioId) : false
  const isDownloading = audioId && downloadingId === audioId
  const showPause = isActiveTrack && isPlaying
  const isDownloadable = canDownload || canResolveDownload
  const downloadVariant: DownloadIconVariant = isDownloading
    ? "downloading"
    : isQueued
      ? "queued"
      : isDownloaded || localUri
        ? "downloaded"
        : "cloud"
  const showDownloadAsDisabled = !isDownloadable

  const playDisabled = isLoading || (disabledWhenUnconnected && !isConnected)
  const downloadDisabled =
    showDownloadAsDisabled ||
    isDownloading ||
    !!localUri ||
    isQueued ||
    (!url && !canResolveDownload)

  return (
    <View
      style={{ marginHorizontal: -16, marginBottom: 14, overflow: "hidden" }}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.05)",
          "rgba(255,255,255,0.03)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Play area: only this triggers playback. Download has its own touch target below. */}
        <Pressable
          onPress={onPlay}
          disabled={playDisabled}
          style={({ pressed }) => [
            { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 },
            pressed && { opacity: 0.85 },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 18,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={showPause ? "pause" : "play"}
                size={22}
                color="#fff"
              />
            )}
          </View>
          <View style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 2,
              }}
            >
              <AppText
                font="cormorant-regular"
                size="sm"
                numberOfLines={1}
                style={{ color: "#ffffff", fontSize: 15 }}
              >
                {title}
              </AppText>
              {hertz && (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <AppText
                    font="cormorant-regular"
                    size="xs"
                    style={{ color: "#ffffff", fontSize: 12 }}
                  >
                    {hertz} Hz
                  </AppText>
                </View>
              )}
            </View>
            <AppText
              font="cormorant-italic"
              size="xs"
              numberOfLines={1}
              style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}
            >
              {durationLabel}
            </AppText>
          </View>
        </Pressable>
        {/* Right content (e.g. Drop In) - before download */}
        {rightContent != null ? (
          <View style={{ marginRight: 8 }}>{rightContent}</View>
        ) : null}
        {/* Download: separate touch target – never triggers play. Manual download fail-safe. */}
        <View pointerEvents="box-none">
          <DownloadIconCell
            variant={showDownloadAsDisabled ? "cloud" : downloadVariant}
            onPress={
              showDownloadAsDisabled
                ? undefined
                : () => {
                    onDownload?.()
                  }
            }
            disabled={downloadDisabled}
          />
        </View>
      </LinearGradient>
    </View>
  )
}
