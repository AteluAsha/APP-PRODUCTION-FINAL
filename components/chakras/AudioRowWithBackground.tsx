import { useState } from "react"
import { View, ImageBackground, Pressable, ActivityIndicator } from "react-native"
import { usePathname } from "expo-router"
import { FontAwesome } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { AVPlaybackSource } from "expo-av"
import { getMinutesString } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import BackgroundOpacity from "../BackgroundOpacity"
import { VaultDownloadLine } from "@/components/chakras/VaultDownloadLine"
import { playSanctuaryTrack } from "@/utils/sanctuaryPlayback"
import { useSanctuaryTrackReady } from "@/hooks/useSanctuaryTrackReady"
import { AUDIO_READY_RIM } from "@/constants/audioUi"

export const AudioRowWithBackground = ({
  title,
  author,
  durationMs,
  audioSource,
  getAudioSource: _getAudioSource,
  authorColor = "#FFFFFF",
  isIntroAudio = false,
  chakraColor,
  fullPlayerTrackId,
  disabled = false,
}: {
  title: string
  author: string
  durationMs: number
  audioSource?: AVPlaybackSource
  /** When provided, used instead of audioSource for local-first / prepared playback (e.g. Head to Heart on Android). */
  getAudioSource?: () => Promise<AVPlaybackSource>
  authorColor: string
  isIntroAudio?: boolean
  chakraColor?: string
  /** When set, used to persist/restore playback position for this track (e.g. embodiment or Head to Heart audio id). */
  fullPlayerTrackId?: string
  disabled?: boolean
}) => {
  const [isPreparing, setIsPreparing] = useState(false)
  const isReady = useSanctuaryTrackReady(fullPlayerTrackId)
  const pathname = usePathname()

  const onPress = () => {
    if (isPreparing || disabled || !fullPlayerTrackId) return
    addHapticFeedback(HapticStrength.Light)
    setIsPreparing(true)
    void playSanctuaryTrack({
      audioId: fullPlayerTrackId,
      title,
      author,
      durationMs,
      chakraColor,
      isIntroAudio,
      returnPath: pathname,
    }).finally(() => setIsPreparing(false))
  }

  return (
    <Pressable
      style={{
        width: "83.33%",
        alignSelf: "center",
        marginTop: 24,
        borderWidth: 2,
        borderColor: isReady ? AUDIO_READY_RIM : "#9D9D9D",
        borderRadius: 14,
        overflow: "hidden",
      }}
      onPress={onPress}
      disabled={isPreparing || disabled}
    >
      <ImageBackground
        source={require("@/assets/images/colorbar.png")}
        style={{
          height: 72,
          width: "100%",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <BackgroundOpacity backgroundOpacity={0.55} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            paddingLeft: 28,
          }}
        >
          <View
            style={{
              borderWidth: 2,
              borderColor: isReady ? AUDIO_READY_RIM : "#ffffff",
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPreparing ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.9)" />
            ) : (
              <FontAwesome
                name="play"
                size={18}
                color="white"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <View style={{ marginLeft: 16 }}>
            <AppText
              font="instrument-medium"
              style={{ marginBottom: 2, color: "#ffffff" }}
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
            <VaultDownloadLine audioId={fullPlayerTrackId} />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  )
}
