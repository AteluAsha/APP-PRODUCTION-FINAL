import React, { useState } from "react"
import { Pressable, View, ActivityIndicator } from "react-native"

import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { useEmbodimentDurationCacheStore } from "@/hooks/useEmbodimentDurationCacheStore"
import { AVPlaybackSource } from "expo-av"
import { getMinutesString } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import {
  getAudioBookmarkStorageKey,
  loadBookmarkPositionMs,
} from "@/utils/audioBookmark"

export const AudioRow = ({
  title,
  author,
  durationMs,
  audioSource,
  authorColor = "#FFFFFF",
  isIntroAudio = false,
  chakraColor,
  rightContent,
  disabled = false,
  getAudioSource,
  embodimentCacheKey,
  onPlayTriggered,
}: {
  title: string
  author: string
  durationMs: number
  audioSource: AVPlaybackSource
  authorColor: string
  isIntroAudio?: boolean
  chakraColor?: string
  rightContent?: React.ReactNode
  /** When true, row is not pressable (e.g. audio still loading). */
  disabled?: boolean
  /** When provided, called on press to resolve source (e.g. prepareLongAudioForPlay). Use for long/embodiment on Android. */
  getAudioSource?: () => Promise<AVPlaybackSource>
  /** When set, player will cache loaded duration under this key so buttons stay in sync. */
  embodimentCacheKey?: string
  /** Optional: called when user taps play (backup trigger to cache rest of day's audio). */
  onPlayTriggered?: () => void
}) => {
  const router = useRouter()
  const [isPreparing, setIsPreparing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const applyMetadataAndPrefs = () => {
    const s = useCurrentAudioStore.getState()
    s.setMetadata({ durationMs, title, author })
    s.setPrefs({ shouldLoop: false, isIntroAudio })
    if (chakraColor != null) s.setChakraColor(chakraColor)
  }

  const onMainPress = () => {
    if (disabled || isPreparing) return
    onPlayTriggered?.()
    addHapticFeedback(HapticStrength.Light)
    setLoadError(null)
    setIsPreparing(true)

    ;(async () => {
      try {
        // Persistence-first: bookmark before prepare so resume survives long downloads
        const bookmarkMs = await loadBookmarkPositionMs(embodimentCacheKey)
        if (__DEV__ && embodimentCacheKey) {
          console.log("[DEBUG] Using Bookmark Key:", embodimentCacheKey)
          console.log(
            "[DEBUG] Full storage key:",
            getAudioBookmarkStorageKey(embodimentCacheKey),
          )
        }

        const store = useCurrentAudioStore.getState()
        store.setPendingTrackKey("full-player-row")
        store.setPlaying(true)
        store.setMetadata({ durationMs, title, author })
        store.setPrefs({ shouldLoop: false, isIntroAudio })
        if (chakraColor != null) store.setChakraColor(chakraColor)
        if (embodimentCacheKey) {
          useEmbodimentDurationCacheStore
            .getState()
            .setEmbodimentDurationCacheKey(embodimentCacheKey)
        }

        if (getAudioSource) {
          const src = await getAudioSource()
          const uri =
            typeof src === "object" && src !== null && "uri" in src
              ? (src as { uri?: string }).uri
              : ""
          if (!uri || String(uri).trim() === "") {
            useCurrentAudioStore.getState().setPendingTrackKey(null)
            useCurrentAudioStore.getState().setPlaying(false)
            setLoadError("No audio URL available.")
            return
          }
          useCurrentAudioStore.getState().setSource(src, "full-player", {
            resumePositionMs: bookmarkMs,
            fullPlayerTrackId: embodimentCacheKey ?? undefined,
          })
          applyMetadataAndPrefs()
          addHapticFeedback(HapticStrength.Light)
          router.push("/AudioPlayer")
        } else {
          useCurrentAudioStore.getState().setSource(audioSource, "full-player", {
            resumePositionMs: bookmarkMs,
            fullPlayerTrackId: embodimentCacheKey ?? undefined,
          })
          applyMetadataAndPrefs()
          addHapticFeedback(HapticStrength.Light)
          router.push("/AudioPlayer")
        }
      } catch {
        useCurrentAudioStore.getState().setPendingTrackKey(null)
        useCurrentAudioStore.getState().setPlaying(false)
        setLoadError("Load failed – tap to try again.")
      } finally {
        setIsPreparing(false)
      }
    })()
  }

  return (
    <View
      style={{
        width: "83.33%",
        alignSelf: "center",
        marginTop: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.75)",
        borderRadius: 18,
        paddingVertical: 18,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 32,
          paddingRight: rightContent ? 8 : 32,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={onMainPress}
          disabled={disabled || isPreparing}
          accessibilityLabel={`Play ${title}`}
          accessibilityHint="Opens full-screen audio player"
          style={[
            { flex: 1, flexDirection: "row", alignItems: "center" },
            (disabled || isPreparing) && { opacity: 0.65 },
          ]}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ffffff",
              borderRadius: 24,
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPreparing ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.9)" />
            ) : (
              <Ionicons
                name="play"
                size={14}
                color="white"
                style={{ marginLeft: 2 }}
              />
            )}
          </View>
          <View style={{ marginLeft: 24, flex: 1 }}>
            <AppText
              font="instrument-regular"
              size="base"
              style={{ marginBottom: 4, fontSize: 18 }}
            >
              {title}
            </AppText>
            <AppText font="instrument-italic" size="sm">
              <AppText
                font="instrument-italic"
                size="base"
                style={{ color: authorColor }}
              >
                with {author}
              </AppText>{" "}
              - {getMinutesString(durationMs)}
            </AppText>
            {loadError ? (
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  marginTop: 6,
                  color: "rgba(255, 200, 100, 0.95)",
                }}
              >
                {loadError}
              </AppText>
            ) : null}
          </View>
        </Pressable>
        {rightContent != null ? <View>{rightContent}</View> : null}
      </View>
    </View>
  )
}
