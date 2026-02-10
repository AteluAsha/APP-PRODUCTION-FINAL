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
  chakraColor, // When set, play screen uses this for gradient (e.g. master embodiment on chakra day)
}: {
  title: string
  author: string
  durationMs: number
  audioSource: AVPlaybackSource
  authorColor: string
  isIntroAudio?: boolean // Optional flag for Intro Ritual trigger
  chakraColor?: string // Optional hex; when provided, AudioPlayer uses it for the play screen
}) => {
  const router = useRouter()
  return (
    <Pressable
      style={{
        width: "83.33%",
        alignSelf: "center",
        marginTop: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.75)",
        overflow: "hidden",
        borderRadius: 18,
        paddingVertical: 18,
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
          isIntroAudio: isIntroAudio, // Mark as intro audio only if explicitly set
        })
        useCurrentAudioStore.getState().setChakraColor(chakraColor ?? null)

        // Small delay to ensure store is set before navigation
        await new Promise((resolve) => setTimeout(resolve, 50))

        // Replace (don't push) so we never stack two AudioPlayer screens and avoid double-play
        router.replace("/AudioPlayer")
        addHapticFeedback(HapticStrength.Light)
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: 32 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ffffff",
            borderRadius: 24,
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 4,
          }}
        >
          <Ionicons name="play" size={14} color="white" />
        </View>
        <View style={{ marginLeft: 24 }}>
          <AppText font="instrument-regular" size="base" style={{ marginBottom: 4, fontSize: 18 }}>
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
