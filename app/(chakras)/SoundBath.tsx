import { ActionBar } from "@/components/ActionBar"
import SoundBathButton from "@/components/chakras/SoundBathButton"
import CrystalBowlButton from "@/components/chakras/CrystalBowlButton"
import { AppText } from "@/components/AppText"
import { HapticStrength } from "@/utils/haptic"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { addHapticFeedback } from "@/utils/haptic"
import { Audio } from "expo-av"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { View, ScrollView, ImageBackground, Platform, Dimensions } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import BackgroundOpacity from "@/components/BackgroundOpacity"
import { isValidChakra } from "@/utils/validation"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useCrystalBowlAudio, getCrystalBowlFileName } from "@/hooks/useCrystalBowlAudio"
import { useTuningForkAudio, getTuningForkHertz } from "@/hooks/useTuningForkAudio"
import { prepareCrystalBowlForPlay } from "@/src/utils/crystalBowlPlayback"
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING, SCROLL_BREATHING_BOTTOM_PADDING, SCROLL_ANDROID_SMOOTH_PROPS } from "@/constants/layout"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { getDayFromChakra } from "@/utils/chakraMapping"

const SoundBath = () => {
  const searchParams = useLocalSearchParams()
  const chakraParam = searchParams.chakra as string | undefined
  const router = useRouter()
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
  const [crystalBowlPreparing, setCrystalBowlPreparing] = useState(false)
  const [tuningForkPreparing, setTuningForkPreparing] = useState(false)

  // Tuning fork: play/pause only on page, no player. One local Sound ref.
  const tuningForkSoundRef = useRef<Audio.Sound | null>(null)
  const [tuningForkPlaying, setTuningForkPlaying] = useState(false)
  const [tuningForkPositionMs, setTuningForkPositionMs] = useState(0)
  const [tuningForkDurationMs, setTuningForkDurationMs] = useState(0)

  // Crystal bowl: trial = full AudioPlayer; lifetime = mini player (navigate away and keep listening)
  const metadata = useCurrentAudioStore((s) => s.metadata)
  const isPlaying = useCurrentAudioStore((s) => s.isPlaying)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const positionMs = useCurrentAudioStore((s) => s.positionMs)
  const setSeekTo = useCurrentAudioStore((s) => s.setSeekTo)
  const setSource = useCurrentAudioStore((s) => s.setSource)
  const setMetadata = useCurrentAudioStore((s) => s.setMetadata)
  const setPrefs = useCurrentAudioStore((s) => s.setPrefs)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)

  const crystalBowlTitle = `Crystal Bowl SOUND BATH: ${soundBathContent.title}`
  const crystalBowlAuthor = soundBathContent.title.split(" - ")[1] || "396 Hz"
  const isCurrentCrystalBowl =
    metadata?.title === crystalBowlTitle &&
    (audioOrigin === "other" || audioOrigin === "full-player")

  const crystalBowlAudio = useCrystalBowlAudio(chakra)
  const tuningForkAudio = useTuningForkAudio(chakra)
  const tuningForkHertz = getTuningForkHertz(chakra)

  // On leave: unload tuning fork (local). Do NOT reset store so crystal bowl mini player can show for both trial and lifetime.
  useFocusEffect(
    useCallback(() => {
      return () => {
        const s = tuningForkSoundRef.current
        if (s) {
          s.stopAsync().then(() => s.unloadAsync().catch(() => {})).catch(() => {})
          tuningForkSoundRef.current = null
          setTuningForkPlaying(false)
          setTuningForkPositionMs(0)
          setTuningForkDurationMs(0)
        }
      }
    }, []),
  )

  const handleTuningForkSeek = useCallback((ms: number) => {
    const s = tuningForkSoundRef.current
    if (s) {
      s.setPositionAsync(ms).catch(() => {})
      setTuningForkPositionMs(ms)
    }
  }, [])

  const handleTuningForkPress = useCallback(async () => {
    const uri = tuningForkAudio.localUri || tuningForkAudio.url
    if (!uri || typeof uri !== "string" || uri.trim() === "") return
    addHapticFeedback(HapticStrength.Light)

    if (isCurrentCrystalBowl && isPlaying) {
      useCurrentAudioStore.getState().reset()
    }

    const s = tuningForkSoundRef.current
    if (s) {
      const status = await s.getStatusAsync()
      if (status.isLoaded && status.isPlaying) {
        await s.pauseAsync()
        setTuningForkPlaying(false)
      } else {
        await s.playAsync()
        setTuningForkPlaying(true)
      }
      return
    }

    setTuningForkPreparing(true)
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          ...(Platform.OS === "android" && { androidImplementation: "MediaPlayer" }),
        },
      )
      await sound.setVolumeAsync(1)
      tuningForkSoundRef.current = sound
      setTuningForkPlaying(true)
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return
        if (status.positionMillis != null) setTuningForkPositionMs(status.positionMillis)
        if (status.durationMillis != null) setTuningForkDurationMs(status.durationMillis)
        if (status.didJustFinish && !status.isLooping) {
          setTuningForkPlaying(false)
          setTuningForkPositionMs(0)
          setTuningForkDurationMs(0)
          tuningForkSoundRef.current = null
          sound.unloadAsync().catch(() => {})
        }
      })
    } catch (e) {
      if (__DEV__) console.warn("[SoundBath] Tuning fork play failed:", e)
      setTuningForkPlaying(false)
    } finally {
      setTuningForkPreparing(false)
    }
  }, [tuningForkAudio.localUri, tuningForkAudio.url, isCurrentCrystalBowl, isPlaying])

  const handleCrystalBowlPress = useCallback(async () => {
    if (isCurrentCrystalBowl && isPlaying) {
      setPlaying(false)
      addHapticFeedback(HapticStrength.Light)
      return
    }
    if (!crystalBowlAudio.url && !crystalBowlAudio.localUri) return

    const s = tuningForkSoundRef.current
    if (s) {
      try {
        await s.stopAsync()
        await s.unloadAsync()
      } catch (_) {}
      tuningForkSoundRef.current = null
      setTuningForkPlaying(false)
    }
    useCurrentAudioStore.getState().reset()

    setCrystalBowlPreparing(true)
    addHapticFeedback(HapticStrength.Light)
    try {
      const audioId = `crystal_bowl_${chakra}_${getCrystalBowlFileName(chakra)}`
      const source = await prepareCrystalBowlForPlay({
        url: crystalBowlAudio.url ?? null,
        localUri: crystalBowlAudio.localUri ?? null,
        audioId,
        fallback: { uri: crystalBowlAudio.url || "" },
      })
      const uriStr =
        typeof source === "object" && source !== null && "uri" in source
          ? (source as { uri: string }).uri
          : ""
      if (!uriStr || typeof uriStr !== "string" || uriStr.trim() === "") {
        if (__DEV__) console.warn("[SoundBath] Crystal bowl prepare returned no URI")
        return
      }
      setSource(source, "other")
      setMetadata({
        durationMs: 3600000,
        title: crystalBowlTitle,
        author: crystalBowlAuthor,
      })
      setPrefs({ shouldLoop: true })
      useCurrentAudioStore.getState().setChakraColor(
        getChakraColor(getDayFromChakra(chakra)),
      )
      setPlaying(true)
    } catch (e) {
      if (__DEV__) console.warn("[SoundBath] Crystal bowl failed:", e)
    } finally {
      setCrystalBowlPreparing(false)
    }
  }, [
    crystalBowlAudio.localUri,
    crystalBowlAudio.url,
    crystalBowlTitle,
    crystalBowlAuthor,
    chakra,
    isCurrentCrystalBowl,
    isPlaying,
    setSource,
    setMetadata,
    setPrefs,
    setPlaying,
  ])

  // Don't render anything if the chakra is invalid
  if (!isValidChakra(chakraParam)) return null

  const insets = useSafeAreaInsets()
  // Background must sit BEHIND content (hero + scroll). On Android, ImageBackground can composite
  // its image on top of children; use explicit layer order: background first (zIndex 0), content on top (zIndex 1).
  const { height: screenHeight } = Dimensions.get("window")
  const backgroundLayerStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    ...(Platform.OS === "android" && { elevation: 0, minHeight: screenHeight }),
  }
  const contentLayerStyle = {
    flex: 1,
    zIndex: 1,
    ...(Platform.OS === "android" && { elevation: 1 }),
  }

  return (
    <View style={{ flex: 1, minHeight: Platform.OS === "android" ? screenHeight : undefined }}>
      <ImageBackground
        source={require("@/assets/images/soundhealingbg.png")}
        style={[{ flex: 1 }, backgroundLayerStyle]}
        resizeMode="cover"
      />
      <SafeAreaView style={contentLayerStyle} edges={["top"]} pointerEvents="box-none">
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 52,
            backgroundColor: "#000000",
            zIndex: 0,
          }}
        />
        {/* Scroll content first so ActionBar overlay receives touches on Android */}
        <View style={{ flex: 1, marginTop: 52 }} pointerEvents="box-none">
          <BackgroundOpacity
            topGradientHeight={0}
            bottomGradientHeight={0}
            backgroundOpacity={0.7}
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
            contentContainerStyle={{
              paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING + SCROLL_BREATHING_BOTTOM_PADDING,
            }}
          >
          <AppText
            font="instrument-regular"
            size="2xl"
            style={{
              letterSpacing: 2,
              textAlign: "center",
              color: "#ffffff",
              fontSize: 24 * 1.3,
            }}
          >
            — SOUND HEALING —
          </AppText>
          <View
            style={{
              marginTop: 16,
              marginHorizontal: 24,
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
            }}
          >
            <AppText
              font="instrument-semibold"
              size="lg"
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {soundBathContent.title}
            </AppText>
            <AppText
              font="instrument-italic"
              size="xs"
              style={{
                textAlign: "center",
                marginTop: 4,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {soundBathContent.subtitle}
            </AppText>
          </View>
          <View
            style={{
              marginHorizontal: 24,
              marginTop: 24,
              marginBottom: 28,
              borderRadius: 16,
              paddingHorizontal: 28,
              paddingVertical: 28,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText
              font="instrument-semibold"
              size="xs"
              style={{
                color: "rgba(251,191,36,0.9)",
                marginBottom: 12,
                letterSpacing: 1.5,
                textAlign: "center",
              }}
            >
              HELPS WITH
            </AppText>
            <AppText
              font="instrument-regular"
              size="base"
              style={{
                color: "rgba(255,255,255,0.95)",
                lineHeight: 26,
                marginBottom: 24,
                textAlign: "center",
                paddingHorizontal: 8,
              }}
            >
              {soundBathContent.helpsWith}
            </AppText>
            <AppText
              font="instrument-semibold"
              size="xs"
              style={{
                color: "rgba(251,191,36,0.9)",
                marginBottom: 12,
                letterSpacing: 1.5,
                textAlign: "center",
              }}
            >
              REAL-WORLD EFFECT
            </AppText>
            <AppText
              font="instrument-regular"
              size="base"
              style={{
                color: "rgba(255,255,255,0.95)",
                lineHeight: 26,
                textAlign: "center",
                paddingHorizontal: 8,
              }}
            >
              {soundBathContent.realWorldEffect}
            </AppText>
          </View>

          <AppText
            font="instrument-italic"
            size="sm"
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.9)",
              lineHeight: 20,
              marginHorizontal: 24,
              marginTop: 16,
              marginBottom: 6,
            }}
          >
            These frequencies don't "fix" you — they help the nervous system
            settle, so perception, emotion, and awareness reorganize naturally.
          </AppText>

          <View
            style={{
              flexDirection: "column",
              width: "100%",
              alignItems: "center",
              marginBottom: 16,
              marginTop: 16,
              paddingHorizontal: 20,
            }}
          >
            <View style={{ marginBottom: 14 }}>
              <SoundBathButton
                isLoading={tuningForkAudio.isLoading || tuningForkPreparing}
                error={tuningForkAudio.error}
                onPress={handleTuningForkPress}
                title="TUNING FORK"
                subtitle={tuningForkPlaying ? "Playing…" : `${tuningForkHertz} Hz`}
                isPlaying={tuningForkPlaying}
                positionMs={tuningForkPlaying ? tuningForkPositionMs : 0}
                durationMs={tuningForkDurationMs}
                onSeek={tuningForkPlaying ? handleTuningForkSeek : undefined}
              />
            </View>
            <AppText
              font="instrument-semibold"
              size="sm"
              style={{
                color: "rgba(251,191,36,0.95)",
                marginTop: 12,
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              1 HOUR SOUND BATH
            </AppText>
            <View style={{ marginTop: 8, width: "100%", alignItems: "center" }}>
              <CrystalBowlButton
                variant="layered"
                isLoading={crystalBowlAudio.isLoading || crystalBowlPreparing}
                subtitle={`${tuningForkHertz} Hz`}
                title="Crystal Bowl Sound Bath"
                showHeart
                isPlaying={isCurrentCrystalBowl && isPlaying}
                onPress={handleCrystalBowlPress}
                positionMs={isCurrentCrystalBowl ? positionMs : 0}
                durationMs={isCurrentCrystalBowl && metadata?.durationMs ? metadata.durationMs : 0}
                onSeek={isCurrentCrystalBowl ? (ms) => setSeekTo(ms) : undefined}
              />
            </View>
          </View>

          <AppText
            font="instrument-italic"
            size="sm"
            style={{
              marginHorizontal: 28,
              marginBottom: 32,
              lineHeight: 24,
              textAlign: "justify",
              color: "#ffffff",
            }}
          >
            {soundBathContent.body}
          </AppText>

          <AppText
            font="instrument-italic"
            size="sm"
            style={{
              textAlign: "center",
              marginHorizontal: 28,
              marginTop: 48,
              color: "#ffffff",
            }}
          >
            You don't need to reach for alignment, you simply relax into it. Let
            yourself exhale and unfold back into place.
          </AppText>
          </ScrollView>
        </View>
        <ActionBar useXButton={true} xButtonPosition="left" />
      </SafeAreaView>
    </View>
  )
}

export default SoundBath
