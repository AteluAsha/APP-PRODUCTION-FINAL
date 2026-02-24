import { Pressable, View } from "react-native"

import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { AVPlaybackSource } from "expo-av"
import { getMinutesString } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export const AudioRow = ({
  title,
  author,
  durationMs,
  audioSource,
  authorColor = "#FFFFFF",
  isIntroAudio = false, // Optional flag to mark intro audio (embodiment meditation)
}: {
  title: string
  author: string
  durationMs: number
  audioSource: AVPlaybackSource
  authorColor: string
  isIntroAudio?: boolean // Optional flag for Intro Ritual trigger
}) => {
  const router = useRouter()
  return (
    <Pressable
      className="w-10/12 mt-6 border border-[#ffffffc0] self-center overflow-hidden active:scale-95 active:opacity-90"
      onPress={async () => {
        // Set audio data in store first
        useCurrentAudioStore.getState().setSource(audioSource)
        useCurrentAudioStore.getState().setMetadata({
          durationMs,
          title,
          author,
        })
        useCurrentAudioStore.getState().setPrefs({
          shouldLoop: false,
          isIntroAudio: isIntroAudio, // Mark as intro audio only if explicitly set
        })
        
        // Small delay to ensure store is set before navigation
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Navigate to audio player
        router.push("/AudioPlayer")
        addHapticFeedback(HapticStrength.Light)
      }}
      style={{ borderRadius: 18, paddingVertical: 18 }}
    >
      <View className="flex-row items-center pl-8">
        <View className="border border-white rounded-full h-12 w-12 flex items-center justify-center">
          <Ionicons name="play" size={14} color="white" className="ml-1" />
        </View>
        <View className="ml-6">
          <AppText font="instrument-regular" className="mb-1 text-[18px]">
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
    </Pressable>
  )
}
