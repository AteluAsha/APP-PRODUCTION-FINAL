import React, { useState } from "react"
import { Pressable, View, ActivityIndicator } from "react-native"

import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { useCurrentAudioStore, AUDIO_READY_DELAY_MS } from "@/hooks/useCurrentAudioStore"
import { AVPlaybackSource } from "expo-av"
import { getMinutesString } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

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
}) => {
  const router = useRouter()
  const [isPreparing, setIsPreparing] = useState(false)

  const onMainPress = async () => {
    if (disabled || isPreparing) return
    addHapticFeedback(HapticStrength.Light)
    useCurrentAudioStore.getState().setPendingTrackKey("full-player-row")
    useCurrentAudioStore.getState().setPlaying(true)
    setIsPreparing(true)
    try {
      const source = getAudioSource
        ? await getAudioSource()
        : audioSource
      useCurrentAudioStore.getState().setSource(source, "full-player")
      useCurrentAudioStore.getState().setMetadata({
        durationMs,
        title,
        author,
      })
      useCurrentAudioStore.getState().setPrefs({
        shouldLoop: false,
        isIntroAudio,
      })
      if (chakraColor != null) {
        useCurrentAudioStore.getState().setChakraColor(chakraColor)
      }
      await new Promise((resolve) => setTimeout(resolve, AUDIO_READY_DELAY_MS))
      router.push("/AudioPlayer")
      addHapticFeedback(HapticStrength.Light)
    } catch {
      useCurrentAudioStore.getState().setPendingTrackKey(null)
      useCurrentAudioStore.getState().setPlaying(false)
    } finally {
      setIsPreparing(false)
    }
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
          <View style={{ marginLeft: 24 }}>
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
          </View>
        </Pressable>
        {rightContent != null ? <View>{rightContent}</View> : null}
      </View>
    </View>
  )
}
