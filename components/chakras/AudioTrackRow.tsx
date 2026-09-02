/**
 * Audio track row for Frequency of Gnosis (Audio Library).
 * Full-width transparent bar with play icon, title, hertz badge, and download.
 * Extracted from AudioLibrary to fix Fast Refresh (nested component anti-pattern).
 *
 * Layout: strict 3-column row (play | text flex | download) — no absolute play/text.
 */

import React from "react"
import { View, Pressable, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { DownloadIconCell, type DownloadIconVariant } from "@/components/chakras/DownloadIconCell"
import { VaultDownloadLine } from "@/components/chakras/VaultDownloadLine"
import { useSanctuaryTrackReady } from "@/hooks/useSanctuaryTrackReady"
import { AUDIO_READY_RIM } from "@/constants/audioUi"

/** Fixed column for download / cloud control */
const COL_DOWNLOAD_WIDTH = 60
/** Fixed column for play control */
const COL_PLAY_WIDTH = 50

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
  /** When true, omit the download column (PAD/ODR ships audio with the app). */
  hideDownload?: boolean
  /** Optional content below subtitle (e.g. Drop In) — lives in middle column only */
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
  hideDownload = false,
  rightContent,
}: AudioTrackRowProps) => {
  const isDownloaded = audioId ? localUri || downloadedIds.has(audioId) : false
  const vaultReady = useSanctuaryTrackReady(audioId)
  const showReadyRim = vaultReady || !!isDownloaded
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

  const playDisabled = isLoading
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
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {/* Column 1: play */}
          <View
            style={{
              width: COL_PLAY_WIDTH,
              marginRight: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pressable
              onPress={onPlay}
              disabled={playDisabled}
              style={({ pressed }) => [
                pressed && { opacity: 0.85 },
                disabledWhenUnconnected && !isConnected && { opacity: 0.7 },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderWidth: showReadyRim ? 1.5 : 1,
                  borderColor: showReadyRim
                    ? AUDIO_READY_RIM
                    : "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
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
            </Pressable>
          </View>

          {/* Column 2: text (+ optional rightContent below) */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              minWidth: 0,
              marginRight: 8,
            }}
          >
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
                style={{ color: "#ffffff", fontSize: 15, flexShrink: 1 }}
              >
                {title}
              </AppText>
              {hertz ? (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    flexShrink: 0,
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
              ) : null}
            </View>
            <AppText
              font="cormorant-italic"
              size="xs"
              numberOfLines={1}
              style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}
            >
              {durationLabel}
            </AppText>
            {audioId ? <VaultDownloadLine audioId={audioId} /> : null}
            {rightContent != null ? (
              <View style={{ marginTop: 10, alignSelf: "flex-start" }}>
                {rightContent}
              </View>
            ) : null}
          </View>

          {/* Column 3: download — omitted when packs ship with the app */}
          {!hideDownload ? (
          <View
            style={{
              width: COL_DOWNLOAD_WIDTH,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
          ) : null}
        </View>
      </LinearGradient>
    </View>
  )
}
