import { ActionBar } from "@/components/ActionBar"
import SoundBathButton from "@/components/chakras/SoundBathButton"
import ResponsiveImageBackground from "@/components/ResponsiveImageBackground"
import { AppText } from "@/components/AppText"
import { HapticStrength } from "@/utils/haptic"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { addHapticFeedback } from "@/utils/haptic"
import { AVPlaybackSource } from "expo-av"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect } from "react"
import { View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import BackgroundOpacity from "@/components/BackgroundOpacity"
import { isValidChakra } from "@/utils/validation"

const SoundBath = () => {
  const searchParams = useLocalSearchParams()
  const chakraParam = searchParams.chakra as string | undefined
  const router = useRouter()
  const { width } = useWindowDimensions()

  // Default to ROOT chakra if not valid
  const chakra = isValidChakra(chakraParam) ? chakraParam : Chakra.ROOT

  // Redirect to home if the chakra is invalid
  useEffect(() => {
    if (!isValidChakra(chakraParam)) {
      router.replace("/")
    }
  }, [chakraParam, router])

  const soundBathContent = chakraContent[chakra].soundBath

  const navigateToAudioPlayer = (
    audioSource: AVPlaybackSource,
    durationMs: number,
    title: string,
    author: string,
  ) => {
    useCurrentAudioStore.getState().setSource(audioSource)
    useCurrentAudioStore.getState().setMetadata({
      durationMs,
      title,
      author,
    })
    useCurrentAudioStore.getState().setPrefs({
      shouldLoop: true,
    })
    router.push("/AudioPlayer")
    addHapticFeedback(HapticStrength.Light)
  }

  // Don't render anything if the chakra is invalid
  if (!isValidChakra(chakraParam)) return null

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ActionBar />
      <ResponsiveImageBackground
        source={require("@/assets/images/soundhealingbg.png")}
        width={width}
        className="mt-16 items-center"
      >
        <BackgroundOpacity
          topGradientHeight={20}
          bottomGradientHeight={20}
          backgroundOpacity={0.7}
        />

        <AppText font="instrument-regular" size="xl" className="tracking-wider">
          — SOUND HEALING —
        </AppText>
        <AppText
          font="instrument-italic"
          size="sm"
          className="text-center mx-10 mt-4"
        >
          "If you want to find the secrets of the universe, think in terms of{" "}
          <AppText font="instrument-bold">energy</AppText>,{" "}
          <AppText font="instrument-bold">frequency</AppText>, and{" "}
          <AppText font="instrument-bold">vibration</AppText>."
        </AppText>
        <AppText
          font="instrument-italic"
          size="xs"
          className="text-center mx-5 mb-8 mt-1"
        >
          - Nikola Tesla
        </AppText>

        {/* Frequency and description */}
        <AppText font="instrument-regular" size="xl" className="text-center">
          {soundBathContent.title}
        </AppText>
        <AppText
          font="instrument-italic"
          size="sm"
          className="text-center mb-6"
        >
          {soundBathContent.subtitle}
        </AppText>
        <AppText
          font="instrument-italic"
          size="sm"
          className="mx-7 mb-5 leading-6 text-justify"
        >
          {soundBathContent.body}
        </AppText>

        {/* Buttons */}
        <View className="flex flex-col w-full items-center">
          <SoundBathButton
            className="mt-2"
            onPress={() => {
              navigateToAudioPlayer(
                soundBathContent.soundBowlAudio,
                3102,
                `Tibetan Sound Bowl: Root Chakra`,
                "396 Hz",
              )
            }}
            title="SOUND BATH"
            subtitle="Tibetan Sound Bowl"
          />
          <SoundBathButton
            className="mt-8"
            onPress={() => {
              navigateToAudioPlayer(
                soundBathContent.tuningForkAudio,
                1674,
                "Tuning Fork: Root Chakra",
                "396 Hz",
              )
            }}
            title="BODY ALIGNMENT"
            subtitle="Tuning Fork"
          />
        </View>

        {/* Footer */}
        <AppText
          font="instrument-italic"
          size="sm"
          className="text-center mx-7 mt-12"
        >
          You don't need to reach for alignment, you simply relax into it. Let
          yourself exhale and unfold back into place.
        </AppText>
      </ResponsiveImageBackground>
    </SafeAreaView>
  )
}

export default SoundBath
