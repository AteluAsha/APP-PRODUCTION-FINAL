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
  rightContent,
}: AudioTrackRowProps) => {
  const isDownloaded = audioId ? localUri || downloadedIds.has(audioId) : false
  const isDownloading = audioId && downloadingId === audioId
  const showPause = isActiveTrack && isPlaying

  return (
    <View
      style={{ marginHorizontal: -16, marginBottom: 14, overflow: "hidden" }}
    >
      <Pressable
        onPress={onPlay}
        disabled={isLoading || (disabledWhenUnconnected && !isConnected)}
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
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
          {/* Play icon - framed with depth */}
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
          {/* Title and subtitle */}
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
          {/* Right content (e.g. Drop In) - before download */}
          {rightContent != null ? (
            <View style={{ marginRight: 8 }}>{rightContent}</View>
          ) : null}
          {/* Download: show when canDownload (crystal bowl etc.); disabled when no url yet */}
          {canDownload && (
            <Pressable
              onPress={() => onDownload?.()}
              disabled={isDownloading || !!localUri || isQueued || !url}
              style={{
                minWidth: 56,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                opacity: url ? 1 : 0.5,
              }}
            >
              {isDownloading ? (
                <>
                  <ActivityIndicator size="small" color="#87AE73" />
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={{ color: "rgba(135,174,115,0.9)", marginTop: 2 }}
                  >
                    Downloading
                  </AppText>
                </>
              ) : isQueued ? (
                <>
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color="rgba(255,255,255,0.6)"
                  />
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={{ color: "rgba(255,255,255,0.6)", marginTop: 2 }}
                  >
                    Queued
                  </AppText>
                </>
              ) : isDownloaded || localUri ? (
                <Ionicons name="checkmark-circle" size={24} color="#87AE73" />
              ) : (
                <Ionicons
                  name="cloud-download-outline"
                  size={24}
                  color={url ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)"}
                />
              )}
            </Pressable>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  )
}
