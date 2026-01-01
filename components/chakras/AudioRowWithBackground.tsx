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
      className="w-10/12 mt-6 border-2 border-[#9D9D9D] self-center overflow-hidden active:scale-95 active:opacity-90"
      onPress={() => {
        useCurrentAudioStore.getState().setSource(audioSource)
        useCurrentAudioStore.getState().setMetadata({
          durationMs,
          title,
          author,
        })
        useCurrentAudioStore.getState().setPrefs({
          shouldLoop: false,
        })
        router.push("/AudioPlayer")
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
          <View className="border-2 border-white rounded-full h-10 w-10 flex items-center justify-center">
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
