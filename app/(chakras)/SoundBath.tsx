import { ActionBar } from "@/components/ActionBar"
import SoundBathButton from "@/components/chakras/SoundBathButton"
import CrystalBowlButton from "@/components/chakras/CrystalBowlButton"
import ResponsiveImageBackground from "@/components/ResponsiveImageBackground"
import { AppText } from "@/components/AppText"
import { HapticStrength } from "@/utils/haptic"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { addHapticFeedback } from "@/utils/haptic"
import { AVPlaybackSource } from "expo-av"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { View, ScrollView, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import BackgroundOpacity from "@/components/BackgroundOpacity"
import { isValidChakra } from "@/utils/validation"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
// MiniAudioPlayer removed from SoundBath - only in AudioLibrary
import {
  useCrystalBowlAudio,
  getCrystalBowlFileName,
  CRYSTAL_BOWL_STORAGE_FOLDER,
} from "@/hooks/useCrystalBowlAudio"
import {
  useTuningForkAudio,
  getTuningForkHertz,
} from "@/hooks/useTuningForkAudio"
import { prepareCrystalBowlForPlay } from "@/src/utils/crystalBowlPlayback"
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING } from "@/constants/layout"

const SoundBath = () => {
  const searchParams = useLocalSearchParams()
  const chakraParam = searchParams.chakra as string | undefined
  const router = useRouter()
  const { width } = useWindowDimensions()
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)

  // Default to ROOT chakra if not valid
  const chakra = isValidChakra(chakraParam) ? chakraParam : Chakra.ROOT

  // Redirect to appropriate home if the chakra is invalid (APP1: ChakraHome, APP2: ChakraHub)
  useEffect(() => {
    if (!isValidChakra(chakraParam)) {
      router.replace(
        hasLifetimeAccess ? "/(chakras)/ChakraHub" : "/(chakras)/ChakraHome",
      )
    }
  }, [chakraParam, router, hasLifetimeAccess])

  const soundBathContent = chakraContent[chakra].soundBath
  const [isPreparingCrystalBowl, setIsPreparingCrystalBowl] = useState(false)

  const metadata = useCurrentAudioStore((s) => s.metadata)
  const isPlaying = useCurrentAudioStore((s) => s.isPlaying)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const setSource = useCurrentAudioStore((s) => s.setSource)
  const setMetadata = useCurrentAudioStore((s) => s.setMetadata)
  const setPrefs = useCurrentAudioStore((s) => s.setPrefs)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)
  const reset = useCurrentAudioStore((s) => s.reset)

  const crystalBowlTitle = `Crystal Bowl SOUND BATH: ${soundBathContent.title}`
  const crystalBowlAuthor = soundBathContent.title.split(" - ")[1] || "396 Hz"
  const isCurrentCrystalBowl =
    metadata?.title === crystalBowlTitle && audioOrigin === "other"

  // Fetch crystal bowl audio for this chakra (all 7 days supported)
  const crystalBowlAudio = useCrystalBowlAudio(chakra)

  // Fetch tuning fork master audio from Firebase (all 7 days supported)
  const tuningForkAudio = useTuningForkAudio(chakra)
  const tuningForkHertz = getTuningForkHertz(chakra)

  const navigateToAudioPlayer = async (
    audioSource: AVPlaybackSource,
    durationMs: number,
    title: string,
    author: string,
  ) => {
    // CRITICAL: Stop and reset any currently playing audio BEFORE setting new source
    // This prevents multiple tracks playing simultaneously
    const currentStore = useCurrentAudioStore.getState()
    if (currentStore.source) {
      // Reset store to stop any playing audio
      useCurrentAudioStore.getState().reset()
      // Small delay to ensure audio stops before new one starts
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Now set new audio source
    useCurrentAudioStore.getState().setSource(audioSource)
    useCurrentAudioStore.getState().setMetadata({
      durationMs,
      title,
      author,
    })
    useCurrentAudioStore.getState().setPrefs({
      shouldLoop: true,
    })
    router.replace("/AudioPlayer")
    addHapticFeedback(HapticStrength.Light)
  }

  // Don't render anything if the chakra is invalid
  if (!isValidChakra(chakraParam)) return null

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ActionBar useXButton={true} xButtonPosition="left" />
      <ResponsiveImageBackground
        source={require("@/assets/images/soundhealingbg.png")}
        width={width}
        style={{ marginTop: 64, alignItems: "center" }}
      >
        <BackgroundOpacity
          topGradientHeight={20}
          bottomGradientHeight={20}
          backgroundOpacity={0.7}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING }}
        >
          <AppText
            font="instrument-regular"
            size="xl"
            style={{ letterSpacing: 2, textAlign: "center", color: "#ffffff" }}
          >
            — SOUND HEALING —
          </AppText>
          <AppText
            font="instrument-semibold"
            size="lg"
            style={{ textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.95)" }}
          >
            {soundBathContent.title}
          </AppText>
          <AppText
            font="instrument-italic"
            size="xs"
            style={{ textAlign: "center", marginBottom: 16, color: "rgba(255,255,255,0.8)" }}
          >
            {soundBathContent.subtitle}
          </AppText>
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              marginBottom: 24,
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 20,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.12)",
            }}
          >
            <AppText
              font="instrument-semibold"
              size="sm"
              style={{ color: "rgba(251,191,36,0.95)", marginBottom: 6, letterSpacing: 1 }}
            >
              HELPS WITH
            </AppText>
            <AppText
              font="instrument-medium"
              size="base"
              style={{ color: "rgba(255,255,255,0.95)", lineHeight: 24, marginBottom: 16 }}
            >
              {soundBathContent.helpsWith}
            </AppText>
            <AppText
              font="instrument-semibold"
              size="sm"
              style={{ color: "rgba(251,191,36,0.95)", marginBottom: 6, letterSpacing: 1 }}
            >
              REAL-WORLD EFFECT
            </AppText>
            <AppText
              font="instrument-medium"
              size="base"
              style={{ color: "rgba(255,255,255,0.95)", lineHeight: 24 }}
            >
              {soundBathContent.realWorldEffect}
            </AppText>
          </View>

          <AppText
            font="instrument-italic"
            size="sm"
            style={{ textAlign: "center", color: "rgba(255,255,255,0.9)", lineHeight: 20, marginHorizontal: 24, marginTop: 24, marginBottom: 8 }}
          >
            These frequencies don't "fix" you — they help the nervous system
            settle, so perception, emotion, and awareness reorganize naturally.
          </AppText>

          <View style={{ flexDirection: "column", width: "100%", alignItems: "center", marginBottom: 24, marginTop: 16 }}>
            <View style={{ marginTop: 8 }}>
              <SoundBathButton
                isLoading={tuningForkAudio.isLoading}
              onPress={() => {
                const audioSource =
                  tuningForkAudio.localUri || tuningForkAudio.url
                if (audioSource) {
                  navigateToAudioPlayer(
                    { uri: audioSource },
                    0,
                    `Tuning Fork ${tuningForkHertz} Hz`,
                    soundBathContent.title.split(" - ")[1] ||
                      `${tuningForkHertz} Hz`,
                  )
                }
              }}
              title="TUNING FORK"
              subtitle={`${tuningForkHertz} Hz`}
              />
            </View>
            <AppText
              font="instrument-semibold"
              size="sm"
              style={{ color: "rgba(251,191,36,0.95)", marginTop: 32, marginBottom: 8, letterSpacing: 1 }}
            >
              1 HOUR SOUND BATH
            </AppText>
            <View style={{ marginTop: 4 }}>
              <CrystalBowlButton
                variant="layered"
                isLoading={
                crystalBowlAudio.isLoading || isPreparingCrystalBowl
              }
              audioId={`crystal_bowl_${chakra}_${getCrystalBowlFileName(chakra)}`}
              firebaseUrl={
                crystalBowlAudio.url || crystalBowlAudio.localUri || undefined
              }
              firebasePath={`${CRYSTAL_BOWL_STORAGE_FOLDER}/${getCrystalBowlFileName(chakra)}`}
              title="Crystal Bowl"
              showHeart
              onPress={async () => {
                if (isCurrentCrystalBowl && isPlaying) {
                  setPlaying(false)
                  addHapticFeedback(HapticStrength.Light)
                  return
                }
                const remoteSource =
                  crystalBowlAudio.localUri || crystalBowlAudio.url
                if (!remoteSource && !soundBathContent.crystalBowlAudio) return
                setIsPreparingCrystalBowl(true)
                try {
                  const source = await prepareCrystalBowlForPlay({
                    url: crystalBowlAudio.url,
                    localUri: crystalBowlAudio.localUri,
                    audioId: `crystal_bowl_${chakra}_${getCrystalBowlFileName(chakra)}`,
                    fallback: soundBathContent.crystalBowlAudio,
                  })
                  if (useCurrentAudioStore.getState().source) {
                    reset()
                    await new Promise((r) => setTimeout(r, 100))
                  }
                  setSource(source, "other")
                  setMetadata({
                    durationMs: 3600000,
                    title: crystalBowlTitle,
                    author: crystalBowlAuthor,
                  })
                  setPrefs({ shouldLoop: true })
                  addHapticFeedback(HapticStrength.Light)
                } catch (error) {
                  if (__DEV__) {
                    console.warn(
                      "[SoundBath] Crystal bowl prepare failed:",
                      error,
                    )
                  }
                } finally {
                  setIsPreparingCrystalBowl(false)
                }
              }}
              />
            </View>
          </View>

          <AppText
            font="instrument-italic"
            size="sm"
            style={{ marginHorizontal: 28, marginBottom: 32, lineHeight: 24, textAlign: "justify", color: "#ffffff" }}
          >
            {soundBathContent.body}
          </AppText>

          <AppText
            font="instrument-italic"
            size="sm"
            style={{ textAlign: "center", marginHorizontal: 28, marginTop: 48, color: "#ffffff" }}
          >
            You don't need to reach for alignment, you simply relax into it. Let
            yourself exhale and unfold back into place.
          </AppText>
        </ScrollView>
      </ResponsiveImageBackground>
    </SafeAreaView>
  )
}

export default SoundBath
