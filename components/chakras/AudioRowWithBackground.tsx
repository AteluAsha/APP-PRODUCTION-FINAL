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
}: {
  title: string
  author: string
  durationMs: number
  audioSource: AVPlaybackSource
  authorColor: string
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
        overflow: "hidden",
      }}
      onPress={async () => {
        // Stop any current audio before playing new track (prevents overlap)
        useCurrentAudioStore.getState().reset()
        await new Promise((resolve) => setTimeout(resolve, 100))
        useCurrentAudioStore.getState().setSource(audioSource)
        useCurrentAudioStore.getState().setMetadata({
          durationMs,
          title,
          author,
        })
        useCurrentAudioStore.getState().setPrefs({
          shouldLoop: false,
        })
        router.replace("/AudioPlayer")
        addHapticFeedback(HapticStrength.Light)
      }}
      style={{ borderRadius: 14 }}
    >
      <ImageBackground
        source={require("@/assets/images/colorbar.png")}
        style={{
          height: 72, // Keep the height fixed while allowing width overflow
          justifyContent: "center",
          alignItems: "center",
        }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <BackgroundOpacity backgroundOpacity={0.55} />
        <View className="flex-row items-center w-full pl-7">
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
            <FontAwesome name="play" size={18} color="white" className="ml-1" />
          </View>
          <View className="ml-4">
            <AppText font="instrument-medium" className="mb-0.5">
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
