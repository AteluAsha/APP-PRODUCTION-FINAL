/**
 * Audio Library Screen (APP2 / Lifetime Access Only)
 *
 * Spotify-like audio library with all sound healing content organized by chakra.
 * Accessible via Music menu bar button in lifetime mode.
 */

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageBackground,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { ActionBar } from "@/components/ActionBar"
import BackgroundOpacity from "@/components/BackgroundOpacity"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { AVPlaybackSource } from "expo-av"
import {
  useCurrentAudioStore,
  type PlaylistItem,
} from "@/hooks/useCurrentAudioStore"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING } from "@/constants/layout"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import {
  useCrystalBowlAudio,
  getCrystalBowlFileName,
} from "@/hooks/useCrystalBowlAudio"
import {
  useTuningForkAudio,
  getTuningForkHertz,
  getTuningForkFileName,
} from "@/hooks/useTuningForkAudio"
import {
  useEmbodimentAudio,
  getEmbodimentAudioId,
} from "@/hooks/useEmbodimentAudio"
import {
  downloadAndCacheAudio,
  downloadAndCacheAudioResumable,
} from "@/src/utils/audioDownload"
import {
  prepareCrystalBowlForPlay,
  prepareLongAudioForPlay,
} from "@/src/utils/crystalBowlPlayback"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { CHAKRA_NAMES } from "@/constants/chakras/chakraConstants"

const CHAKRA_ORDER: Chakra[] = [
  Chakra.ROOT,
  Chakra.SACRAL,
  Chakra.SOLAR_PLEXUS,
  Chakra.HEART,
  Chakra.THROAT,
  Chakra.THIRD_EYE,
  Chakra.CROWN,
]

const CHAKRA_COLORS: Record<Chakra, string> = {
  [Chakra.ROOT]: "#DC2626",
  [Chakra.SACRAL]: "#EA580C",
  [Chakra.SOLAR_PLEXUS]: "#FCD34D",
  [Chakra.HEART]: "#10B981",
  [Chakra.THROAT]: "#3B82F6",
  [Chakra.THIRD_EYE]: "#6366F1",
  [Chakra.CROWN]: "#9333EA",
}

const AudioLibrary = () => {
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const currentTrackKey = useCurrentAudioStore((s) => s.currentTrackKey)
  const isPlaying = useCurrentAudioStore((s) => s.isPlaying)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [preparingPlaybackId, setPreparingPlaybackId] = useState<string | null>(
    null,
  )
  const scrollRef = useRef<ScrollView>(null)
  const sectionYRef = useRef<Record<string, number>>({})
  const { scrollTo: scrollToParam } = useLocalSearchParams<{ scrollTo?: string }>()

  // APP2 only: redirect trial users
  const router = useRouter()
  useEffect(() => {
    if (!hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHome")
    }
  }, [hasLifetimeAccess, router])

  // When opened from mini player with scrollTo param, scroll to that chakra section
  useEffect(() => {
    if (!scrollToParam || !scrollRef.current) return
    const chakra = scrollToParam.split("_")[0]
    if (!chakra) return
    const t = setTimeout(() => {
      const y = sectionYRef.current[chakra]
      if (typeof y === "number") {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - 80),
          animated: true,
        })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [scrollToParam])

  // Hooks for each chakra (must be unconditional)
  const crystalBowlRoot = useCrystalBowlAudio(Chakra.ROOT)
  const crystalBowlSacral = useCrystalBowlAudio(Chakra.SACRAL)
  const crystalBowlSolar = useCrystalBowlAudio(Chakra.SOLAR_PLEXUS)
  const crystalBowlHeart = useCrystalBowlAudio(Chakra.HEART)
  const crystalBowlThroat = useCrystalBowlAudio(Chakra.THROAT)
  const crystalBowlThirdEye = useCrystalBowlAudio(Chakra.THIRD_EYE)
  const crystalBowlCrown = useCrystalBowlAudio(Chakra.CROWN)

  const tuningForkRoot = useTuningForkAudio(Chakra.ROOT)
  const tuningForkSacral = useTuningForkAudio(Chakra.SACRAL)
  const tuningForkSolar = useTuningForkAudio(Chakra.SOLAR_PLEXUS)
  const tuningForkHeart = useTuningForkAudio(Chakra.HEART)
  const tuningForkThroat = useTuningForkAudio(Chakra.THROAT)
  const tuningForkThirdEye = useTuningForkAudio(Chakra.THIRD_EYE)
  const tuningForkCrown = useTuningForkAudio(Chakra.CROWN)

  const embodimentRoot = useEmbodimentAudio(Chakra.ROOT)
  const embodimentSacral = useEmbodimentAudio(Chakra.SACRAL)
  const embodimentSolar = useEmbodimentAudio(Chakra.SOLAR_PLEXUS)
  const embodimentHeart = useEmbodimentAudio(Chakra.HEART)
  const embodimentThroat = useEmbodimentAudio(Chakra.THROAT)
  const embodimentThirdEye = useEmbodimentAudio(Chakra.THIRD_EYE)
  const embodimentCrown = useEmbodimentAudio(Chakra.CROWN)

  const crystalBowlByChakra: Record<
    Chakra,
    ReturnType<typeof useCrystalBowlAudio>
  > = {
    [Chakra.ROOT]: crystalBowlRoot,
    [Chakra.SACRAL]: crystalBowlSacral,
    [Chakra.SOLAR_PLEXUS]: crystalBowlSolar,
    [Chakra.HEART]: crystalBowlHeart,
    [Chakra.THROAT]: crystalBowlThroat,
    [Chakra.THIRD_EYE]: crystalBowlThirdEye,
    [Chakra.CROWN]: crystalBowlCrown,
  }

  const tuningForkByChakra: Record<
    Chakra,
    ReturnType<typeof useTuningForkAudio>
  > = {
    [Chakra.ROOT]: tuningForkRoot,
    [Chakra.SACRAL]: tuningForkSacral,
    [Chakra.SOLAR_PLEXUS]: tuningForkSolar,
    [Chakra.HEART]: tuningForkHeart,
    [Chakra.THROAT]: tuningForkThroat,
    [Chakra.THIRD_EYE]: tuningForkThirdEye,
    [Chakra.CROWN]: tuningForkCrown,
  }

  const embodimentByChakra: Record<
    Chakra,
    ReturnType<typeof useEmbodimentAudio>
  > = {
    [Chakra.ROOT]: embodimentRoot,
    [Chakra.SACRAL]: embodimentSacral,
    [Chakra.SOLAR_PLEXUS]: embodimentSolar,
    [Chakra.HEART]: embodimentHeart,
    [Chakra.THROAT]: embodimentThroat,
    [Chakra.THIRD_EYE]: embodimentThirdEye,
    [Chakra.CROWN]: embodimentCrown,
  }

  const playWithPlaylist = useCallback(
    async (chakra: Chakra, startIndex: number) => {
      const trackKey = `${chakra}_${startIndex}`
      setPreparingPlaybackId(trackKey)
      try {
        await doPlayWithPlaylist(chakra, startIndex)
      } finally {
        setPreparingPlaybackId(null)
      }
    },
    [crystalBowlByChakra, tuningForkByChakra, embodimentByChakra],
  )

  const doPlayWithPlaylist = useCallback(
    async (chakra: Chakra, startIndex: number) => {
      const content = chakraContent[chakra]
      const soundBathContent = content.soundBath
      const hertz = getTuningForkHertz(chakra)
      const crystalBowl = crystalBowlByChakra[chakra]
      const tuningFork = tuningForkByChakra[chakra]
      const embodiment = embodimentByChakra[chakra]
      const isThirdEye = chakra === Chakra.THIRD_EYE
      const embodimentRemoteUrl = embodiment.single || embodiment.partOne

      const items: PlaylistItem[] = []

      const tuningForkId = `tuning_fork_${chakra}_${getTuningForkFileName(chakra)}`
      if (tuningFork.localUri || tuningFork.url) {
        const tfSource = await prepareLongAudioForPlay({
          url: tuningFork.url,
          localUri: tuningFork.localUri,
          audioId: tuningForkId,
          fallback: {
            uri: tuningFork.url ?? tuningFork.localUri ?? "",
          },
        })
        items.push({
          source: tfSource,
          metadata: {
            durationMs: 0,
            title: `Tuning Fork ${hertz} Hz`,
            author: soundBathContent.title.split(" - ")[1] || hertz + " Hz",
          },
          prefs: { shouldLoop: false },
          trackKey: `${chakra}_0`,
        })
      }

      // Crystal Bowl: download to local cache first for smooth playback (no streaming glitches)
      const crystalBowlId = `crystal_bowl_${chakra}_${getCrystalBowlFileName(chakra)}`
      const hasCrystalBowl =
        crystalBowl.localUri || crystalBowl.url || soundBathContent.crystalBowlAudio
      if (hasCrystalBowl) {
        try {
          const cbSource = await prepareCrystalBowlForPlay({
            url: crystalBowl.url,
            localUri: crystalBowl.localUri,
            audioId: crystalBowlId,
            fallback: soundBathContent.crystalBowlAudio,
          })
          items.push({
            source: cbSource,
            metadata: {
              durationMs: 3600000,
              title: `Crystal Bowl SOUND BATH: ${soundBathContent.title}`,
              author: hertz + " Hz",
            },
            prefs: { shouldLoop: false },
            trackKey: `${chakra}_1`,
          })
        } catch (error) {
          if (__DEV__) {
            console.warn(
              `[AudioLibrary] Crystal bowl prepare failed for ${chakra}:`,
              error,
            )
          }
        }
      }

      if (isThirdEye && (embodimentPartOneSource || embodiment.partOne || embodiment.partTwo)) {
        const part1Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")
        const part2Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")
        if (embodiment.partOne || embodiment.localUriPartOne) {
          const src = await prepareLongAudioForPlay({
            url: embodiment.partOne ?? null,
            localUri: embodiment.localUriPartOne ?? null,
            audioId: part1Id,
            fallback: { uri: embodiment.partOne ?? "" },
          })
          items.push({
            source: src,
            metadata: {
              durationMs: content.audioIntro.durationMs,
              title: content.audioIntro.title,
              author: `${content.audioIntro.author} · ${hertz} Hz`,
            },
            prefs: { shouldLoop: false },
            trackKey: `${chakra}_2`,
          })
        }
        if (embodiment.partTwo || embodiment.localUriPartTwo) {
          const src = await prepareLongAudioForPlay({
            url: embodiment.partTwo ?? null,
            localUri: embodiment.localUriPartTwo ?? null,
            audioId: part2Id,
            fallback: { uri: embodiment.partTwo ?? "" },
          })
          items.push({
            source: src,
            metadata: {
              durationMs: 1257000,
              title: "Part Two: Somatic Healing",
              author: `${content.audioIntro.author} · ${hertz} Hz`,
            },
            prefs: { shouldLoop: false },
            trackKey: `${chakra}_3`,
          })
        }
      } else if (embodiment.single || embodiment.localUri) {
        const embodimentId = getEmbodimentAudioId(chakra)
        const src = await prepareLongAudioForPlay({
          url: embodiment.single ?? null,
          localUri: embodiment.localUri ?? null,
          audioId: embodimentId,
          fallback: { uri: embodiment.single ?? embodimentRemoteUrl ?? "" },
        })
        items.push({
          source: src,
          metadata: {
            durationMs: content.audioIntro.durationMs,
            title: content.audioIntro.title,
            author: `${content.audioIntro.author} · ${hertz} Hz`,
          },
          prefs: { shouldLoop: false },
          trackKey: `${chakra}_2`,
        })
      }

      if (startIndex < 0 || startIndex >= items.length) return
      const [current, ...rest] = items.slice(startIndex)
      const trackKey = `${chakra}_${startIndex}`
      useCurrentAudioStore.getState().reset()
      await new Promise((resolve) => setTimeout(resolve, 100))
      useCurrentAudioStore
        .getState()
        .setSourceWithPlaylist(current, rest, trackKey)
      addHapticFeedback(HapticStrength.Light)
    },
    [crystalBowlByChakra, tuningForkByChakra, embodimentByChakra],
  )

  const handleRowPress = useCallback(
    (
      trackKey: string,
      chakra: Chakra,
      startIndex: number,
      canPlay: boolean,
    ) => {
      if (!canPlay) return
      const isActive =
        audioOrigin === "music-room" && currentTrackKey === trackKey
      if (isActive) {
        setPlaying(!isPlaying)
      } else {
        playWithPlaylist(chakra, startIndex)
      }
    },
    [audioOrigin, currentTrackKey, isPlaying, setPlaying, playWithPlaylist],
  )

  const handleDownload = useCallback(
    async (url: string, audioId: string) => {
      if (!url || downloadingId) return
      setDownloadingId(audioId)
      addHapticFeedback(HapticStrength.Light)
      try {
        const isCrystalBowl = audioId.startsWith("crystal_bowl_")
        await (isCrystalBowl
          ? downloadAndCacheAudioResumable(url, audioId)
          : downloadAndCacheAudio(url, audioId))
        setDownloadedIds((prev) => new Set(prev).add(audioId))
      } catch (e) {
        if (__DEV__) console.warn("[AudioLibrary] Download failed:", e)
      } finally {
        setDownloadingId(null)
      }
    },
    [downloadingId],
  )

  if (!hasLifetimeAccess) return null

  const AudioTrackRow = ({
    title,
    subtitle,
    hertz,
    durationLabel,
    isLoading,
    isConnected,
    disabledWhenUnconnected = false,
    onPlay,
    onDownload,
    audioId,
    url,
    localUri,
    canDownload,
    isActiveTrack = false,
  }: {
    title: string
    subtitle: string
    hertz?: string
    durationLabel: string
    isLoading: boolean
    isConnected: boolean
    disabledWhenUnconnected?: boolean
    onPlay: () => void
    onDownload?: () => void
    audioId?: string
    url?: string | null
    localUri?: string | null
    canDownload?: boolean
    isActiveTrack?: boolean
  }) => {
    const isDownloaded = audioId
      ? localUri || downloadedIds.has(audioId)
      : false
    const isDownloading = audioId && downloadingId === audioId
    const showPause = isActiveTrack && isPlaying

    return (
      <Pressable
        onPress={onPlay}
        disabled={isLoading || (disabledWhenUnconnected && !isConnected)}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            marginBottom: 8,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={showPause ? "pause" : "play"}
              size={20}
              color="#fff"
            />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <AppText
              font="cormorant-regular"
              size="sm"
              numberOfLines={1}
              style={{ color: "#ffffff", fontSize: 15 }}
            >
              {title}
            </AppText>
            {hertz && (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <AppText
                  font="cormorant-regular"
                  size="xs"
                  style={{ color: "#ffffff", fontSize: 12 }}
                >
                  {hertz} Hz
                </AppText>
              </View>
            )}
          </View>
          <AppText
            font="cormorant-italic"
            size="xs"
            numberOfLines={1}
            style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}
          >
            {durationLabel}
          </AppText>
        </View>
        {((canDownload && url) || localUri) && (
          <Pressable
            onPress={() => onDownload?.()}
            disabled={isDownloading || !!localUri}
            style={{ padding: 8 }}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#87AE73" />
            ) : isDownloaded || localUri ? (
              <Ionicons name="checkmark-circle" size={22} color="#87AE73" />
            ) : (
              <Ionicons
                name="cloud-download-outline"
                size={22}
                color="rgba(255,255,255,0.7)"
              />
            )}
          </Pressable>
        )}
      </Pressable>
    )
  }

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    router.replace("/(chakras)/ChakraHub")
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ActionBar useXButton={true} xButtonPosition="left" onXPress={handleClose} />
      <ImageBackground
        source={require("@/assets/images/soundhealingbg.png")}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <BackgroundOpacity
          topGradientHeight={60}
          bottomGradientHeight={80}
          backgroundOpacity={0.75}
        />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING,
            paddingHorizontal: 16,
          }}
        >
          <View>
          <View style={{ paddingTop: 64, paddingBottom: 24 }}>
            <AppText
              font="cormorant-regular"
              size="xl"
              style={{
                color: "#ffffff",
                letterSpacing: 2,
                textAlign: "center",
                fontSize: 20,
              }}
            >
              — FREQUENCY OF GNOSIS —
            </AppText>
            <AppText
              font="cormorant-italic"
              size="sm"
              style={{
                color: "rgba(255,255,255,0.75)",
                textAlign: "center",
                marginHorizontal: 24,
                marginTop: 12,
                fontSize: 15,
              }}
            >
              Where sound meets soul. Download for your journey.
            </AppText>
          </View>

          {CHAKRA_ORDER.map((chakra, index) => {
            const content = chakraContent[chakra]
            const soundBathContent = content.soundBath
            const chakraName = CHAKRA_NAMES[index]
            const hertz = getTuningForkHertz(chakra)
            const crystalBowl = crystalBowlByChakra[chakra]
            const tuningFork = tuningForkByChakra[chakra]
            const embodiment = embodimentByChakra[chakra]
            const crystalBowlId = `crystal_bowl_${chakra}_${getCrystalBowlFileName(chakra)}`
            const tuningForkId = `tuning_fork_${chakra}_${getTuningForkFileName(chakra)}`
            const crystalBowlConnected = !!(
              crystalBowl.url || crystalBowl.localUri
            )
            const tuningForkConnected = !!(
              tuningFork.url || tuningFork.localUri
            )
            const isThirdEye = chakra === Chakra.THIRD_EYE
            const embodimentPartOneSource =
              embodiment.localUriPartOne || embodiment.partOne
            const embodimentPartTwoSource =
              embodiment.localUriPartTwo || embodiment.partTwo
            const embodimentPartOneConnected = !!embodimentPartOneSource
            const embodimentPartTwoConnected = !!embodimentPartTwoSource
            const embodimentRemoteUrl = embodiment.single || embodiment.partOne
            const embodimentPlaybackSource =
              embodiment.localUri || embodimentRemoteUrl
            const embodimentConnected = !!embodimentPlaybackSource
            const embodimentId = getEmbodimentAudioId(chakra)
            const embodimentPartTwoId = getEmbodimentAudioId(chakra, "part2")

            return (
              <View
                key={chakra}
                style={{ marginBottom: 32 }}
                onLayout={(e) => {
                  sectionYRef.current[chakra] = e.nativeEvent.layout.y
                }}
              >
                <LinearGradient
                  colors={[`${CHAKRA_COLORS[chakra]}35`, "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <AppText
                      font="cormorant-regular"
                      size="base"
                      style={{ color: "#ffffff", fontSize: 17 }}
                    >
                      {chakraName} Chakra
                    </AppText>
                    <AppText
                      font="cormorant-regular"
                      size="xl"
                      style={{
                        color: "#ffffff",
                        letterSpacing: 1,
                        fontSize: 18,
                      }}
                    >
                      {hertz} Hz
                    </AppText>
                  </View>
                </LinearGradient>

                <AudioTrackRow
                  title="Tuning Fork"
                  subtitle="Pure frequency"
                  durationLabel="Pure frequency"
                  hertz={hertz}
                  isLoading={tuningFork.isLoading}
                  isConnected={tuningForkConnected}
                  disabledWhenUnconnected={true}
                  isActiveTrack={currentTrackKey === `${chakra}_0`}
                  onPlay={() =>
                    handleRowPress(
                      `${chakra}_0`,
                      chakra,
                      0,
                      !!tuningForkConnected,
                    )
                  }
                  onDownload={() =>
                    tuningFork.url &&
                    handleDownload(tuningFork.url, tuningForkId)
                  }
                  audioId={tuningForkId}
                  url={tuningFork.url}
                  localUri={tuningFork.localUri}
                  canDownload={true}
                />

                <AudioTrackRow
                  title="Crystal Bowl SOUND BATH"
                  subtitle="1 hour"
                  durationLabel="~60 min"
                  hertz={hertz}
                  isLoading={
                    crystalBowl.isLoading ||
                    preparingPlaybackId === `${chakra}_1`
                  }
                  isConnected={crystalBowlConnected}
                  isActiveTrack={currentTrackKey === `${chakra}_1`}
                  onPlay={() =>
                    handleRowPress(
                      `${chakra}_1`,
                      chakra,
                      1,
                      !!(
                        crystalBowl.localUri ||
                        crystalBowl.url ||
                        soundBathContent.crystalBowlAudio
                      ),
                    )
                  }
                  onDownload={() =>
                    crystalBowl.url &&
                    handleDownload(crystalBowl.url, crystalBowlId)
                  }
                  audioId={crystalBowlId}
                  url={crystalBowl.url}
                  localUri={crystalBowl.localUri}
                  canDownload={true}
                />

                {isThirdEye ? (
                  <>
                    <AudioTrackRow
                      title={content.audioIntro.title}
                      subtitle={`with ${content.audioIntro.author} · ~${Math.round(content.audioIntro.durationMs / 60000)} min`}
                      durationLabel={`with ${content.audioIntro.author} · ~29 min`}
                      isLoading={embodiment.isLoading}
                      isConnected={embodimentPartOneConnected}
                      disabledWhenUnconnected={true}
                      isActiveTrack={currentTrackKey === `${chakra}_2`}
                      onPlay={() =>
                        handleRowPress(
                          `${chakra}_2`,
                          chakra,
                          2,
                          !!embodimentPartOneSource,
                        )
                      }
                      onDownload={() =>
                        embodiment.partOne &&
                        handleDownload(embodiment.partOne, embodimentId)
                      }
                      audioId={embodimentId}
                      url={embodiment.partOne || undefined}
                      localUri={embodiment.localUriPartOne || undefined}
                      canDownload={!!embodiment.partOne}
                    />
                    <AudioTrackRow
                      title="Part Two: Somatic Healing"
                      subtitle={`with ${content.audioIntro.author} · ~21 min`}
                      durationLabel={`with ${content.audioIntro.author} · ~21 min`}
                      isLoading={embodiment.isLoading}
                      isConnected={embodimentPartTwoConnected}
                      disabledWhenUnconnected={true}
                      isActiveTrack={currentTrackKey === `${chakra}_3`}
                      onPlay={() =>
                        handleRowPress(
                          `${chakra}_3`,
                          chakra,
                          3,
                          !!embodimentPartTwoSource,
                        )
                      }
                      onDownload={() =>
                        embodiment.partTwo &&
                        handleDownload(embodiment.partTwo, embodimentPartTwoId)
                      }
                      audioId={embodimentPartTwoId}
                      url={embodiment.partTwo || undefined}
                      localUri={embodiment.localUriPartTwo || undefined}
                      canDownload={!!embodiment.partTwo}
                    />
                  </>
                ) : (
                  <AudioTrackRow
                    title={content.audioIntro.title}
                    subtitle={`with ${content.audioIntro.author} · ~${Math.round(content.audioIntro.durationMs / 60000)} min`}
                    durationLabel={`with ${content.audioIntro.author} · ~${Math.round(content.audioIntro.durationMs / 60000)} min`}
                    isLoading={embodiment.isLoading}
                    isConnected={embodimentConnected}
                    disabledWhenUnconnected={true}
                    isActiveTrack={currentTrackKey === `${chakra}_2`}
                    onPlay={() =>
                      handleRowPress(
                        `${chakra}_2`,
                        chakra,
                        2,
                        !!embodimentPlaybackSource,
                      )
                    }
                    onDownload={() =>
                      embodimentRemoteUrl &&
                      handleDownload(embodimentRemoteUrl, embodimentId)
                    }
                    audioId={embodimentId}
                    url={embodimentRemoteUrl || undefined}
                    localUri={embodiment.localUri || undefined}
                    canDownload={!!embodimentRemoteUrl}
                  />
                )}
              </View>
            )
          })}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default AudioLibrary
