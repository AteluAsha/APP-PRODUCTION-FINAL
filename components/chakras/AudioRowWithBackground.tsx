import { View, ImageBackground, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { FontAwesome } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { AVPlaybackSource } from "expo-av"
import { getMinutesString } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import BackgroundOpacity from "../BackgroundOpacity"

export const AudioRowWithBackground = ({
  title,
  author,
  durationMs,
  audioSource,
  authorColor = "#FFFFFF",
  isIntroAudio = false,
  chakraColor,
}: {
  title: string
  author: string
  durationMs: number
  audioSource: AVPlaybackSource
  authorColor: string
  isIntroAudio?: boolean
  chakraColor?: string
}) => {
  const router = useRouter()

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
      onPress={async () => {
        useCurrentAudioStore.getState().setPendingTrackKey("full-player-row")
        useCurrentAudioStore.getState().setPlaying(true)
        // setSource internally resets and delays; wait so store has source when AudioPlayer mounts
        useCurrentAudioStore.getState().setSource(audioSource, "full-player")
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
        const { AUDIO_READY_DELAY_MS } =
          await import("@/hooks/useCurrentAudioStore")
        await new Promise((r) => setTimeout(r, AUDIO_READY_DELAY_MS))
        router.push("/AudioPlayer")
        addHapticFeedback(HapticStrength.Light)
      }}
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
            <FontAwesome
              name="play"
              size={18}
              color="white"
              style={{ marginLeft: 4 }}
            />
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
