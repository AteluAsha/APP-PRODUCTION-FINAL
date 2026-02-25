/**
 * Audio Library Screen (APP2 / Lifetime Access Only)
 *
 * Spotify-like audio library with all sound healing content organized by chakra.
 * Accessible via Music menu bar button in lifetime mode.
 * No autoplay: playback only on user tap. One track at a time app-wide.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { View, ScrollView, ImageBackground, Pressable } from "react-native"
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
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING, SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
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
  useAncestralWisdomAudio,
  getHeadToHeartAudioId,
} from "@/hooks/useAncestralWisdomAudio"
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
import { AudioTrackRow } from "@/components/chakras/AudioTrackRow"
import { DropInButton } from "@/components/chakras/DropInButton"

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

/** Descriptive text for each frequency banner (hero title, keywords, subline). */
const FREQUENCY_BANNER_CONTENT: Record<
  Chakra,
  { hero: string; keywords: string; clears: string; brings: string }
> = {
  [Chakra.ROOT]: {
    hero: "SEPARATION",
    keywords: "Grounding • Security • Release",
    clears: "Guilt, fear, and ancestral trauma",
    brings: "Belonging and solid foundations",
  },
  [Chakra.SACRAL]: {
    hero: "INADEQUACY",
    keywords: "Flow • Change • Creativity",
    clears: "Emotional blocks and stagnant energy",
    brings: "Adaptability and transformation",
  },
  [Chakra.SOLAR_PLEXUS]: {
    hero: "POWERLESSNESS",
    keywords: "Transformation • DNA • Power",
    clears: "Self-doubt and the performance ego",
    brings: "Inner authority and cellular repair",
  },
  [Chakra.HEART]: {
    hero: "ABANDONMENT",
    keywords: "Connection • Unity • Repair",
    clears: "Friction in relationships and isolation",
    brings: "Compassion and the \"We\" mind",
  },
  [Chakra.THROAT]: {
    hero: "SUPPRESSION",
    keywords: "Expression • Clarity • Truth",
    clears: "Toxic communication and self-deception",
    brings: "Authentic resonance and boundaries",
  },
  [Chakra.THIRD_EYE]: {
    hero: "ILLUSION",
    keywords: "Intuition • Vision • Order",
    clears: "Mental noise and the thinking ego",
    brings: "Spiritual clarity and inner knowing",
  },
  [Chakra.CROWN]: {
    hero: "OBLIVION",
    keywords: "Divinity • Oneness • Light",
    clears: "The feeling of being \"cut off\" from Source",
    brings: "Connection to the All and pure awareness",
  },
}

const AudioLibrary = () => {
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const currentTrackKey = useCurrentAudioStore((s) => s.currentTrackKey)
  const pendingTrackKey = useCurrentAudioStore((s) => s.pendingTrackKey)
  const isPlaying = useCurrentAudioStore((s) => s.isPlaying)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)
  const setPendingTrackKey = useCurrentAudioStore((s) => s.setPendingTrackKey)
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [preparingPlaybackId, setPreparingPlaybackId] = useState<string | null>(
    null,
  )
  const scrollRef = useRef<ScrollView>(null)
  const sectionYRef = useRef<Record<string, number>>({})
  const { scrollTo: scrollToParam } = useLocalSearchParams<{
    scrollTo?: string
  }>()

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

  const ancestralRoot = useAncestralWisdomAudio(Chakra.ROOT)
  const ancestralSacral = useAncestralWisdomAudio(Chakra.SACRAL)
  const ancestralSolar = useAncestralWisdomAudio(Chakra.SOLAR_PLEXUS)
  const ancestralHeart = useAncestralWisdomAudio(Chakra.HEART)
  const ancestralThroat = useAncestralWisdomAudio(Chakra.THROAT)
  const ancestralThirdEye = useAncestralWisdomAudio(Chakra.THIRD_EYE)
  const ancestralCrown = useAncestralWisdomAudio(Chakra.CROWN)

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

  const ancestralByChakra: Record<
    Chakra,
    ReturnType<typeof useAncestralWisdomAudio>
  > = {
    [Chakra.ROOT]: ancestralRoot,
    [Chakra.SACRAL]: ancestralSacral,
    [Chakra.SOLAR_PLEXUS]: ancestralSolar,
    [Chakra.HEART]: ancestralHeart,
    [Chakra.THROAT]: ancestralThroat,
    [Chakra.THIRD_EYE]: ancestralThirdEye,
    [Chakra.CROWN]: ancestralCrown,
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
      // Hero tuning fork only: do not use bundled fallback in Audio Library
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
        crystalBowl.localUri ||
        crystalBowl.url ||
        soundBathContent.crystalBowlAudio
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

      if (
        isThirdEye &&
        (embodiment.localUriPartOne ||
          embodiment.partOne ||
          embodiment.localUriPartTwo ||
          embodiment.partTwo)
      ) {
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
        setPendingTrackKey(trackKey)
        setPlaying(true)
        playWithPlaylist(chakra, startIndex).catch(() => {
          useCurrentAudioStore.getState().setPendingTrackKey(null)
          useCurrentAudioStore.getState().setPlaying(false)
        })
      }
    },
    [
      audioOrigin,
      currentTrackKey,
      isPlaying,
      setPlaying,
      setPendingTrackKey,
      playWithPlaylist,
    ],
  )

  const handlePlayEmbodimentFullPlayer = useCallback(
    async (chakra: Chakra, part: "single" | "part1" | "part2") => {
      const content = chakraContent[chakra]
      const embodiment = embodimentByChakra[chakra]
      const hertz = getTuningForkHertz(chakra)
      const preparingId = `embodiment_${chakra}_${part}`
      setPreparingPlaybackId(preparingId)
      useCurrentAudioStore.getState().setPendingTrackKey("embodiment")
      useCurrentAudioStore.getState().setPlaying(true)
      try {
        let src: AVPlaybackSource
        let title: string
        let durationMs: number
        let author: string

        if (
          part === "part1" &&
          (embodiment.localUriPartOne || embodiment.partOne)
        ) {
          const part1Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")
          src = await prepareLongAudioForPlay({
            url: embodiment.partOne ?? null,
            localUri: embodiment.localUriPartOne ?? null,
            audioId: part1Id,
            fallback: { uri: embodiment.partOne ?? "" },
          })
          title = content.audioIntro.title
          durationMs = content.audioIntro.durationMs
          author = `${content.audioIntro.author} · ${hertz} Hz`
        } else if (
          part === "part2" &&
          (embodiment.localUriPartTwo || embodiment.partTwo)
        ) {
          const part2Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")
          src = await prepareLongAudioForPlay({
            url: embodiment.partTwo ?? null,
            localUri: embodiment.localUriPartTwo ?? null,
            audioId: part2Id,
            fallback: { uri: embodiment.partTwo ?? "" },
          })
          title = "Part Two: Somatic Healing"
          durationMs = 1257000
          author = `${content.audioIntro.author} · ${hertz} Hz`
        } else if (
          part === "single" &&
          (embodiment.localUri || embodiment.single)
        ) {
          const embodimentId = getEmbodimentAudioId(chakra)
          src = await prepareLongAudioForPlay({
            url: embodiment.single ?? null,
            localUri: embodiment.localUri ?? null,
            audioId: embodimentId,
            fallback: {
              uri: embodiment.single ?? embodiment.partOne ?? "",
            },
          })
          title = content.audioIntro.title
          durationMs =
            chakra === Chakra.CROWN ? 2684000 : content.audioIntro.durationMs
          author = `${content.audioIntro.author} · ${hertz} Hz`
        } else {
          useCurrentAudioStore.getState().setPendingTrackKey(null)
          useCurrentAudioStore.getState().setPlaying(false)
          return
        }

        useCurrentAudioStore.getState().setSource(src, "full-player")
        useCurrentAudioStore.getState().setMetadata({
          durationMs,
          title,
          author,
        })
        useCurrentAudioStore.getState().setPrefs({
          shouldLoop: false,
          isIntroAudio: true,
        })
        useCurrentAudioStore.getState().setChakraColor(CHAKRA_COLORS[chakra])
        const { AUDIO_READY_DELAY_MS } =
          await import("@/hooks/useCurrentAudioStore")
        await new Promise((r) => setTimeout(r, AUDIO_READY_DELAY_MS))
        router.push("/AudioPlayer")
        addHapticFeedback(HapticStrength.Light)
      } catch (_) {
        useCurrentAudioStore.getState().setPendingTrackKey(null)
        useCurrentAudioStore.getState().setPlaying(false)
      } finally {
        setPreparingPlaybackId(null)
      }
    },
    [embodimentByChakra, router],
  )

  const handlePlayHeadToHeartFullPlayer = useCallback(
    async (chakra: Chakra) => {
      const ancestral = ancestralByChakra[chakra]
      const content = chakraContent[chakra].headtoheart
      if (!ancestral.source) return
      useCurrentAudioStore.getState().setPendingTrackKey("headtoheart")
      useCurrentAudioStore.getState().setPlaying(true)
      useCurrentAudioStore.getState().setSource(ancestral.source, "full-player")
      useCurrentAudioStore.getState().setMetadata({
        durationMs: content.audio.duration,
        title: content.audio.title,
        author: `with ${content.audio.author}`,
      })
      useCurrentAudioStore.getState().setPrefs({
        shouldLoop: false,
        isIntroAudio: false, // Head to Heart is not the embodiment intro; only ChakraTemplate uses isIntroAudio for intro ritual
      })
      useCurrentAudioStore.getState().setChakraColor(CHAKRA_COLORS[chakra])
      const { AUDIO_READY_DELAY_MS } =
        await import("@/hooks/useCurrentAudioStore")
      await new Promise((r) => setTimeout(r, AUDIO_READY_DELAY_MS))
      router.push("/AudioPlayer")
      addHapticFeedback(HapticStrength.Light)
    },
    [ancestralByChakra, router],
  )

  /** All downloadable tracks for "download all" (same as per-chakra rows) */
  const downloadAllTasks = useMemo(() => {
    const tasks: { url: string; audioId: string; isCrystalBowl: boolean }[] = []
    CHAKRA_ORDER.forEach((chakra) => {
      const content = chakraContent[chakra]
      const crystalBowl = crystalBowlByChakra[chakra]
      const tuningFork = tuningForkByChakra[chakra]
      const embodiment = embodimentByChakra[chakra]
      const isThirdEye = chakra === Chakra.THIRD_EYE
      const embodimentRemoteUrl = embodiment.single || embodiment.partOne

      const tuningForkId = `tuning_fork_${chakra}_${getTuningForkFileName(chakra)}`
      if (tuningFork.url) {
        tasks.push({ url: tuningFork.url, audioId: tuningForkId, isCrystalBowl: false })
      }
      const crystalBowlId = `crystal_bowl_${chakra}_${getCrystalBowlFileName(chakra)}`
      if (crystalBowl.url) {
        tasks.push({ url: crystalBowl.url, audioId: crystalBowlId, isCrystalBowl: true })
      }
      if (isThirdEye && (embodiment.partOne || embodiment.partTwo)) {
        const embodimentId = getEmbodimentAudioId(chakra)
        const embodimentPartTwoId = getEmbodimentAudioId(chakra, "part2")
        if (embodiment.partOne) {
          tasks.push({ url: embodiment.partOne, audioId: embodimentId, isCrystalBowl: false })
        }
        if (embodiment.partTwo) {
          tasks.push({ url: embodiment.partTwo, audioId: embodimentPartTwoId, isCrystalBowl: false })
        }
      } else if (embodimentRemoteUrl) {
        tasks.push({
          url: embodimentRemoteUrl,
          audioId: getEmbodimentAudioId(chakra),
          isCrystalBowl: false,
        })
      }
      const ancestral = ancestralByChakra[chakra]
      if (ancestral.url) {
        tasks.push({
          url: ancestral.url,
          audioId: getHeadToHeartAudioId(chakra),
          isCrystalBowl: false,
        })
      }
    })
    return tasks
  }, [
    crystalBowlByChakra,
    tuningForkByChakra,
    embodimentByChakra,
    ancestralByChakra,
  ])

  const handleDownloadAll = useCallback(async () => {
    if (isDownloadingAll || downloadingId) return
    const toDownload = downloadAllTasks.filter((t) => !downloadedIds.has(t.audioId))
    if (toDownload.length === 0) return
    addHapticFeedback(HapticStrength.Light)
    setIsDownloadingAll(true)
    try {
      for (const { url, audioId, isCrystalBowl } of toDownload) {
        try {
          await (isCrystalBowl
            ? downloadAndCacheAudioResumable(url, audioId)
            : downloadAndCacheAudio(url, audioId))
          setDownloadedIds((prev) => new Set(prev).add(audioId))
        } catch (e) {
          if (__DEV__) console.warn("[AudioLibrary] Download all: failed for", audioId, e)
        }
      }
    } finally {
      setIsDownloadingAll(false)
    }
  }, [downloadAllTasks, downloadedIds, isDownloadingAll, downloadingId])

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

  // APP1 (trial) never sees Music Room; redirect above sends them to ChakraHome. Only APP2 can set audioOrigin "music-room".
  if (!hasLifetimeAccess) return null

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    router.replace("/(chakras)/ChakraHub")
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ActionBar
        useXButton={true}
        xButtonPosition="left"
        onXPress={handleClose}
      />
      <ImageBackground
        source={require("@/assets/images/soundhealingbg.png")}
        resizeMode="cover"
        style={{ flex: 1 }}
        imageStyle={{ alignSelf: "center" }}
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
            paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING + SCROLL_BREATHING_BOTTOM_PADDING,
            paddingHorizontal: 16,
          }}
        >
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
              Where sound meets soul.
            </AppText>
            <Pressable
              onPress={handleDownloadAll}
              disabled={isDownloadingAll || downloadingId !== null}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 8,
                gap: 6,
                opacity: pressed ? 0.7 : 1,
              })}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="cloud-download-outline"
                size={14}
                color="rgba(255,255,255,0.6)"
              />
              <AppText
                font="cormorant-italic"
                size="xs"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                {isDownloadingAll ? "Downloading…" : "Download for offline listening"}
              </AppText>
            </Pressable>
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
            const tuningForkConnected = !!(tuningFork.url || tuningFork.localUri)
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
                <View
                  style={{
                    marginHorizontal: -16,
                    marginBottom: 12,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[
                      `${CHAKRA_COLORS[chakra]}35`,
                      `${CHAKRA_COLORS[chakra]}18`,
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderTopWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
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
                </View>

                {/* Frequency banner: hero in Cormorant Garamond Italic; keywords and Clears/Brings in unchanged from original */}
                {(() => {
                  const bannerContent = FREQUENCY_BANNER_CONTENT[chakra]
                  return (
                    <View
                      style={{
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 20,
                        marginBottom: 4,
                      }}
                    >
                      <AppText
                        font="cormorant-italic"
                        style={{
                          fontFamily: "CormorantGaramondItalic",
                          fontWeight: "400",
                          fontSize: 17,
                          color: "#ffffff",
                          textAlign: "center",
                          letterSpacing: 1,
                          marginBottom: 10,
                        }}
                      >
                        {bannerContent.hero}
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        style={{
                          fontSize: 15,
                          color: "rgba(255,255,255,0.95)",
                          textAlign: "center",
                          marginBottom: 12,
                        }}
                      >
                        {bannerContent.keywords}
                      </AppText>
                      <AppText
                        font="cormorant-italic"
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.72)",
                          textAlign: "center",
                          lineHeight: 20,
                        }}
                      >
                        Clears: {bannerContent.clears}
                        {"\n"}
                        Brings in: {bannerContent.brings}
                      </AppText>
                    </View>
                  )
                })()}

                <AudioTrackRow
                  title="Tuning Fork"
                  subtitle="Pure frequency"
                  durationLabel="Pure frequency"
                  hertz={hertz}
                  isLoading={tuningFork.isLoading}
                  isConnected={tuningForkConnected}
                  disabledWhenUnconnected={true}
                  isActiveTrack={
                    currentTrackKey === `${chakra}_0` ||
                    pendingTrackKey === `${chakra}_0`
                  }
                  isPlaying={isPlaying}
                  downloadedIds={downloadedIds}
                  downloadingId={downloadingId}
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

                <View style={{ alignItems: "center", marginBottom: 8 }}>
                  <DropInButton
                    audioUri={tuningFork.localUri ?? tuningFork.url ?? null}
                    disabled={tuningFork.isLoading}
                    compact
                  />
                </View>
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
                  isActiveTrack={
                    currentTrackKey === `${chakra}_1` ||
                    pendingTrackKey === `${chakra}_1`
                  }
                  isPlaying={isPlaying}
                  downloadedIds={downloadedIds}
                  downloadingId={downloadingId}
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
                      isLoading={
                        embodiment.isLoading ||
                        preparingPlaybackId === `embodiment_${chakra}_part1`
                      }
                      isConnected={embodimentPartOneConnected}
                      disabledWhenUnconnected={true}
                      isPlaying={isPlaying}
                      downloadedIds={downloadedIds}
                      downloadingId={downloadingId}
                      onPlay={() =>
                        handlePlayEmbodimentFullPlayer(chakra, "part1")
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
                      isLoading={
                        embodiment.isLoading ||
                        preparingPlaybackId === `embodiment_${chakra}_part2`
                      }
                      isConnected={embodimentPartTwoConnected}
                      disabledWhenUnconnected={true}
                      isPlaying={isPlaying}
                      downloadedIds={downloadedIds}
                      downloadingId={downloadingId}
                      onPlay={() =>
                        handlePlayEmbodimentFullPlayer(chakra, "part2")
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
                    isLoading={
                      embodiment.isLoading ||
                      preparingPlaybackId === `embodiment_${chakra}_single`
                    }
                    isConnected={embodimentConnected}
                    disabledWhenUnconnected={true}
                    isPlaying={isPlaying}
                    downloadedIds={downloadedIds}
                    downloadingId={downloadingId}
                    onPlay={() =>
                      handlePlayEmbodimentFullPlayer(chakra, "single")
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

                <>
                  <AppText
                    font="cormorant-regular"
                    size="sm"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 13,
                      marginTop: 16,
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Head to Heart
                  </AppText>
                  <AudioTrackRow
                    title={content.headtoheart.audio.title}
                    subtitle={`with ${content.headtoheart.audio.author}`}
                    durationLabel={`with ${content.headtoheart.audio.author} · ~${Math.round(content.headtoheart.audio.duration / 60000)} min`}
                    isLoading={ancestralByChakra[chakra].isLoading}
                    isConnected={!!ancestralByChakra[chakra].source}
                    disabledWhenUnconnected={true}
                    isPlaying={isPlaying}
                    downloadedIds={downloadedIds}
                    downloadingId={downloadingId}
                    onPlay={() => handlePlayHeadToHeartFullPlayer(chakra)}
                    onDownload={() => {
                      const url = ancestralByChakra[chakra].url
                      if (url) {
                        handleDownload(url, getHeadToHeartAudioId(chakra))
                      }
                    }}
                    audioId={getHeadToHeartAudioId(chakra)}
                    url={ancestralByChakra[chakra].url ?? undefined}
                    localUri={ancestralByChakra[chakra].localUri ?? undefined}
                    canDownload={!!ancestralByChakra[chakra].url}
                  />
                </>
              </View>
            )
          })}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default AudioLibrary
