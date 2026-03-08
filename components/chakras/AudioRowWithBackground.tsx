import { useState } from "react"
import { View, ImageBackground, Pressable, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { FontAwesome } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { useCurrentAudioStore, AUDIO_READY_DELAY_MS } from "@/hooks/useCurrentAudioStore"
import { AVPlaybackSource } from "expo-av"
import { getMinutesString } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import BackgroundOpacity from "../BackgroundOpacity"

export const AudioRowWithBackground = ({
  title,
  author,
  durationMs,
  audioSource,
  getAudioSource,
  authorColor = "#FFFFFF",
  isIntroAudio = false,
  chakraColor,
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
}) => {
  const router = useRouter()
  const [isPreparing, setIsPreparing] = useState(false)

  const onPress = async () => {
    if (isPreparing) return
    addHapticFeedback(HapticStrength.Light)
    useCurrentAudioStore.getState().setPendingTrackKey("full-player-row")
    useCurrentAudioStore.getState().setPlaying(true)
    setIsPreparing(true)
    try {
      const source = getAudioSource
        ? await getAudioSource()
        : audioSource
      if (!source) {
        useCurrentAudioStore.getState().setPendingTrackKey(null)
        useCurrentAudioStore.getState().setPlaying(false)
        return
      }
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
      if (chakraColor) {
        useCurrentAudioStore.getState().setChakraColor(chakraColor)
      }
      await new Promise((r) => setTimeout(r, AUDIO_READY_DELAY_MS))
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
    <Pressable
      style={{
        width: "83.33%",
        alignSelf: "center",
        marginTop: 24,
        borderWidth: 2,
        borderColor: "#9D9D9D",
        borderRadius: 14,
        overflow: "hidden",
      }}
      onPress={onPress}
      disabled={isPreparing}
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
              borderColor: "#ffffff",
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
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  )
}
