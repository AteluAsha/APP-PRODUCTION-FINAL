/**
 * Audio Library Screen (APP2 / Lifetime Access Only)
 *
 * SINGLE SOURCE OF TRUTH: This is the only Audio Library screen. The download-all
 * row and every track row use DownloadIconCell only (60×44, icon 26), white-only
 * styling, no alternate or ghost layout. Locked production design.
 *
 * Spotify-like audio library with all sound healing content organized by chakra.
 * Accessible via Music menu bar button in lifetime mode.
 * No autoplay: playback only on user tap. One track at a time app-wide.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  View,
  ScrollView,
  ImageBackground,
  Pressable,
  Platform,
  Dimensions,
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
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING, SCROLL_BREATHING_BOTTOM_PADDING, SCROLL_ANDROID_SMOOTH_PROPS } from "@/constants/layout"
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
import { useEmbodimentDurationCacheStore } from "@/hooks/useEmbodimentDurationCacheStore"
import {
  useAncestralWisdomAudio,
  getHeadToHeartAudioId,
} from "@/hooks/useAncestralWisdomAudio"
import {
  downloadAndCacheAudio,
  downloadAndCacheAudioResumable,
  downloadAndCacheAudioResumableWithTimeout,
  getLocalAudioUri,
} from "@/src/utils/audioDownload"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/src/services/firebase"
import { FIREBASE_CRYSTAL_BOWL_FOLDER } from "@/constants/firebaseStoragePaths"
import { preloadFullFilesForChakra } from "@/src/utils/audioPreloadManifest"
import {
  prepareCrystalBowlForPlay,
  prepareLongAudioForPlay,
} from "@/src/utils/crystalBowlPlayback"
import { LinearGradient } from "expo-linear-gradient"
import { CHAKRA_NAMES } from "@/constants/chakras/chakraConstants"
import { AudioTrackRow } from "@/components/chakras/AudioTrackRow"
import { DownloadIconCell } from "@/components/chakras/DownloadIconCell"
import { DropInButton } from "@/components/chakras/DropInButton"
import AsyncStorage from "@react-native-async-storage/async-storage"

/** Timeout per full-file download in download-all (non–crystal bowl) so one stuck file doesn't block. */
const FULL_FILE_DOWNLOAD_TIMEOUT_MS = 120 * 1000
/** Timeout per crystal-bowl (resumable) in download-all; 1hr files need longer. */
const DOWNLOAD_ALL_CRYSTAL_BOWL_TIMEOUT_MS = 5 * 60 * 1000
const KEEP_AWAKE_TAG = "AudioLibraryDownloadAll"

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
  /** Queue for manual per-track downloads: process one by one, show "Queued" until download starts */
  const [downloadQueue, setDownloadQueue] = useState<
    Array<{ audioId: string; url: string; isCrystalBowl: boolean }>
  >([])
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  /** When download-all hit an error or timeout, show "Stalled" and let user tap Continue */
  const [downloadAllStalled, setDownloadAllStalled] = useState(false)
  const [downloadAllLastError, setDownloadAllLastError] = useState<string | null>(null)
  /** Progress for "Downloading X of Y" */
  const [downloadAllProgress, setDownloadAllProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [preparingPlaybackId, setPreparingPlaybackId] = useState<string | null>(
    null,
  )
  const scrollRef = useRef<ScrollView>(null)
  const sectionYRef = useRef<Record<string, number>>({})
  const downloadAllMountedRef = useRef(true)
  useEffect(() => {
    downloadAllMountedRef.current = true
    return () => {
      downloadAllMountedRef.current = false
    }
  }, [])
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

  const embodimentDurations = useEmbodimentDurationCacheStore((s) => s.durations)

  const playWithPlaylist = useCallback(
    async (chakra: Chakra, startIndex: number) => {
      if (storage) preloadFullFilesForChakra(storage, chakra).catch(() => {})
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
          const src = await prepareLongAudioForPlay(
            {
              url: embodiment.partOne ?? null,
              localUri: embodiment.localUriPartOne ?? null,
              audioId: part1Id,
              fallback: { uri: embodiment.partOne ?? "" },
            },
            { requireFullDownload: true },
          )
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
          const src = await prepareLongAudioForPlay(
            {
              url: embodiment.partTwo ?? null,
              localUri: embodiment.localUriPartTwo ?? null,
              audioId: part2Id,
              fallback: { uri: embodiment.partTwo ?? "" },
            },
            { requireFullDownload: true },
          )
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
        const src = await prepareLongAudioForPlay(
          {
            url: embodiment.single ?? null,
            localUri: embodiment.localUri ?? null,
            audioId: embodimentId,
            fallback: { uri: embodiment.single ?? embodimentRemoteUrl ?? "" },
          },
          { requireFullDownload: true },
        )
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
      if (Platform.OS === "android") {
        const src = current.source
        const hasEmptyUri =
          typeof src === "object" &&
          src !== null &&
          "uri" in src &&
          !(typeof (src as { uri?: string }).uri === "string" && (src as { uri: string }).uri.trim())
        if (hasEmptyUri) {
          useCurrentAudioStore.getState().setPendingTrackKey(null)
          setPlaying(false)
          return
        }
      }
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
      const isPendingThisTrack = pendingTrackKey === trackKey
      if (isActive) {
        setPlaying(!isPlaying)
      } else if (isPendingThisTrack) {
        // Already loading this track – ignore repeat tap (avoids double-fire / play-then-stop on iOS)
        return
      } else {
        setPendingTrackKey(trackKey)
        playWithPlaylist(chakra, startIndex).catch(() => {
          useCurrentAudioStore.getState().setPendingTrackKey(null)
          useCurrentAudioStore.getState().setPlaying(false)
        })
      }
    },
    [
      audioOrigin,
      currentTrackKey,
      pendingTrackKey,
      isPlaying,
      setPlaying,
      setPendingTrackKey,
      playWithPlaylist,
    ],
  )

  const handlePlayEmbodimentFullPlayer = useCallback(
    async (chakra: Chakra, part: "single" | "part1" | "part2") => {
      // Embodiment play: only this chakra's embodiment; never load another track.
      // Prepare source FIRST, then set store and navigate so AudioPlayer never sees a stale source.
      if (storage) preloadFullFilesForChakra(storage, chakra).catch(() => {})
      const content = chakraContent[chakra]
      const embodiment = embodimentByChakra[chakra]
      const hertz = getTuningForkHertz(chakra)
      const preparingId = `embodiment_${chakra}_${part}`
      setPreparingPlaybackId(preparingId)
      const cacheStore = useEmbodimentDurationCacheStore.getState()
      let title: string
      let durationMs: number
      let author: string

      if (
        part === "part1" &&
        (embodiment.localUriPartOne || embodiment.partOne)
      ) {
        const part1Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")
        title = content.audioIntro.title
        durationMs = cacheStore.getDuration(part1Id) ?? content.audioIntro.durationMs
        author = `${content.audioIntro.author} · ${hertz} Hz`
      } else if (
        part === "part2" &&
        (embodiment.localUriPartTwo || embodiment.partTwo)
      ) {
        const part2Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")
        title = "Part Two: Somatic Healing"
        durationMs = cacheStore.getDuration(part2Id) ?? 1257000
        author = `${content.audioIntro.author} · ${hertz} Hz`
      } else if (
        part === "single" &&
        (embodiment.localUri || embodiment.single)
      ) {
        const embodimentId = getEmbodimentAudioId(chakra)
        title = content.audioIntro.title
        durationMs =
          cacheStore.getDuration(embodimentId) ??
          (chakra === Chakra.CROWN ? 2684000 : content.audioIntro.durationMs)
        author = `${content.audioIntro.author} · ${hertz} Hz`
      } else {
        useCurrentAudioStore.getState().setPendingTrackKey(null)
        useCurrentAudioStore.getState().setPlaying(false)
        setPreparingPlaybackId(null)
        return
      }

      try {
        let src: AVPlaybackSource
        if (
          part === "part1" &&
          (embodiment.localUriPartOne || embodiment.partOne)
        ) {
          const part1Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")
          src = await prepareLongAudioForPlay(
            {
              url: embodiment.partOne ?? null,
              localUri: embodiment.localUriPartOne ?? null,
              audioId: part1Id,
              fallback: { uri: embodiment.partOne ?? "" },
            },
            { requireFullDownload: true },
          )
          cacheStore.setEmbodimentDurationCacheKey(part1Id)
        } else if (
          part === "part2" &&
          (embodiment.localUriPartTwo || embodiment.partTwo)
        ) {
          const part2Id = getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")
          src = await prepareLongAudioForPlay(
            {
              url: embodiment.partTwo ?? null,
              localUri: embodiment.localUriPartTwo ?? null,
              audioId: part2Id,
              fallback: { uri: embodiment.partTwo ?? "" },
            },
            { requireFullDownload: true },
          )
          cacheStore.setEmbodimentDurationCacheKey(part2Id)
        } else {
          const embodimentId = getEmbodimentAudioId(chakra)
          if (__DEV__) {
            const expected = getEmbodimentAudioId(chakra)
            if (embodimentId !== expected) {
              console.error(
                `[handlePlayEmbodimentFullPlayer] audioId mismatch: got ${embodimentId}, expected ${expected} for chakra ${chakra}`,
              )
            }
          }
          src = await prepareLongAudioForPlay(
            {
              url: embodiment.single ?? null,
              localUri: embodiment.localUri ?? null,
              audioId: embodimentId,
              fallback: {
                uri: embodiment.single ?? embodiment.partOne ?? "",
              },
            },
            { requireFullDownload: true },
          )
          cacheStore.setEmbodimentDurationCacheKey(embodimentId)
        }
        const uri =
          typeof src === "object" && src !== null && "uri" in src
            ? (src as { uri?: string }).uri
            : ""
        if (!uri || String(uri).trim() === "") {
          useCurrentAudioStore.getState().setPendingTrackKey(null)
          useCurrentAudioStore.getState().setPlaying(false)
          return
        }
        const finalDuration =
          part === "part1"
            ? cacheStore.getDuration(getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")) ?? durationMs
            : part === "part2"
              ? cacheStore.getDuration(getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")) ?? durationMs
              : cacheStore.getDuration(getEmbodimentAudioId(chakra)) ?? durationMs
        const trackId =
          part === "single"
            ? getEmbodimentAudioId(chakra)
            : getEmbodimentAudioId(Chakra.THIRD_EYE, part)
        const saved = await AsyncStorage.getItem(`audio_position_${trackId}`)
        const resumeMs =
          saved != null && Number.isFinite(Number(saved)) ? Number(saved) : 0
        useCurrentAudioStore.getState().setSource(src, "full-player", {
          resumePositionMs: resumeMs > 0 ? resumeMs : undefined,
          fullPlayerTrackId: trackId,
        })
        const store = useCurrentAudioStore.getState()
        store.setMetadata({ durationMs: finalDuration, title, author })
        store.setPrefs({ shouldLoop: false, isIntroAudio: true })
        store.setChakraColor(CHAKRA_COLORS[chakra])
        store.setPendingTrackKey("embodiment")
        store.setPlaying(true)
        addHapticFeedback(HapticStrength.Light)
        router.push("/AudioPlayer")
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
      // Head to Heart: prepare source FIRST, then set store and navigate so AudioPlayer never sees a stale source.
      if (storage) preloadFullFilesForChakra(storage, chakra).catch(() => {})
      const ancestral = ancestralByChakra[chakra]
      const content = chakraContent[chakra].headtoheart
      if (!ancestral.url && !ancestral.localUri) return
      const preparingId = `headtoheart_${chakra}`
      setPreparingPlaybackId(preparingId)
      const audioId = getHeadToHeartAudioId(chakra)
      try {
        const src = await prepareLongAudioForPlay(
          {
            url: ancestral.url ?? null,
            localUri: ancestral.localUri ?? null,
            audioId,
            fallback: { uri: ancestral.url ?? ancestral.localUri ?? "" },
          },
          {
            requireFullDownload: true,
            allowStreamingFallback: false,
            downloadTimeoutMs: 180000,
          },
        )
        const uri =
          typeof src === "object" && src !== null && "uri" in src
            ? (src as { uri?: string }).uri
            : ""
        if (!uri || String(uri).trim() === "") {
          useCurrentAudioStore.getState().setPendingTrackKey(null)
          useCurrentAudioStore.getState().setPlaying(false)
          return
        }
        const saved = await AsyncStorage.getItem(`audio_position_${audioId}`)
        const resumeMs =
          saved != null && Number.isFinite(Number(saved)) ? Number(saved) : 0
        useCurrentAudioStore.getState().setSource(src, "full-player", {
          resumePositionMs: resumeMs > 0 ? resumeMs : undefined,
          fullPlayerTrackId: audioId,
        })
        const store = useCurrentAudioStore.getState()
        store.setMetadata({
          durationMs: content.audio.duration,
          title: content.audio.title,
          author: `with ${content.audio.author}`,
        })
        store.setPrefs({ shouldLoop: false, isIntroAudio: false })
        store.setChakraColor(CHAKRA_COLORS[chakra])
        store.setPendingTrackKey("headtoheart")
        store.setPlaying(true)
        addHapticFeedback(HapticStrength.Light)
        router.push("/AudioPlayer")
      } catch (_) {
        useCurrentAudioStore.getState().setPendingTrackKey(null)
        useCurrentAudioStore.getState().setPlaying(false)
      } finally {
        setPreparingPlaybackId(null)
      }
    },
    [ancestralByChakra, chakraContent, router],
  )

  /** All downloadable tracks for "download all" (same as per-chakra rows). Crystal bowls always included (29 total); URL resolved from Firebase when hook returned null. */
  const downloadAllTasks = useMemo(() => {
    const tasks: {
      url: string
      audioId: string
      isCrystalBowl: boolean
      storagePath?: string
    }[] = []
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
      const crystalBowlPath = `${FIREBASE_CRYSTAL_BOWL_FOLDER}/${getCrystalBowlFileName(chakra)}`
      tasks.push({
        url: crystalBowl.url ?? "",
        audioId: crystalBowlId,
        isCrystalBowl: true,
        storagePath: crystalBowl.url ? undefined : crystalBowlPath,
      })
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
    const withCacheStatus = await Promise.all(
      downloadAllTasks.map(async (t) => ({
        ...t,
        alreadyCached: !!(await getLocalAudioUri(t.audioId)),
      })),
    )
    const toDownload = withCacheStatus
      .filter((t) => !t.alreadyCached)
      .map((t) => ({
        url: t.url,
        audioId: t.audioId,
        isCrystalBowl: t.isCrystalBowl,
        storagePath: t.storagePath,
      }))
    if (downloadAllMountedRef.current) {
      setDownloadedIds((prev) => {
        const next = new Set(prev)
        withCacheStatus.filter((t) => t.alreadyCached).forEach((t) => next.add(t.audioId))
        return next
      })
    }
    if (toDownload.length === 0) {
      if (downloadAllMountedRef.current) {
        setDownloadAllStalled(false)
        setDownloadAllLastError(null)
      }
      return
    }
    addHapticFeedback(HapticStrength.Light)
    if (downloadAllMountedRef.current) {
      setDownloadAllStalled(false)
      setDownloadAllLastError(null)
      setIsDownloadingAll(true)
    }
    try {
      const KeepAwake = require("expo-keep-awake")
      await KeepAwake.activateKeepAwakeAsync?.(KEEP_AWAKE_TAG)
    } catch {
      // optional
    }
    const total = toDownload.length
    let hadError = false
    try {
      for (let i = 0; i < toDownload.length; i++) {
        if (!downloadAllMountedRef.current) break
        const t = toDownload[i]
        let url = t.url
        if (!url && t.isCrystalBowl && t.storagePath && storage) {
          for (let retry = 0; retry < 3 && !url; retry++) {
            try {
              url = await getDownloadURL(ref(storage, t.storagePath!))
            } catch (e) {
              if (__DEV__) console.warn("[AudioLibrary] Download all: resolve URL failed for", t.audioId, e)
              if (retry < 2) await new Promise((r) => setTimeout(r, 1000))
            }
          }
        }
        if (!url) {
          hadError = true
          if (downloadAllMountedRef.current) {
            setDownloadAllLastError(`Could not get URL for ${t.audioId}`)
            setDownloadAllStalled(true)
          }
          continue
        }
        if (downloadAllMountedRef.current) {
          setDownloadAllProgress({ current: i + 1, total })
        }
        try {
          if (t.isCrystalBowl) {
            await downloadAndCacheAudioResumableWithTimeout(
              url,
              t.audioId,
              DOWNLOAD_ALL_CRYSTAL_BOWL_TIMEOUT_MS,
            )
          } else {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Download timeout")),
                FULL_FILE_DOWNLOAD_TIMEOUT_MS,
              ),
            )
            await Promise.race([
              downloadAndCacheAudio(url, t.audioId),
              timeoutPromise,
            ])
          }
          if (downloadAllMountedRef.current) {
            setDownloadedIds((prev) => new Set(prev).add(t.audioId))
          }
        } catch (e) {
          hadError = true
          const msg = e instanceof Error ? e.message : String(e)
          if (downloadAllMountedRef.current) {
            setDownloadAllLastError(msg)
            setDownloadAllStalled(true)
          }
          if (__DEV__) console.warn("[AudioLibrary] Download all: failed for", t.audioId, e)
        }
        if (i < toDownload.length - 1) {
          await new Promise((r) => setTimeout(r, 400))
        }
      }
    } catch (err) {
      hadError = true
      if (downloadAllMountedRef.current) {
        setDownloadAllLastError(err instanceof Error ? err.message : String(err))
        setDownloadAllStalled(true)
      }
    } finally {
      try {
        const KeepAwake = require("expo-keep-awake")
        KeepAwake.deactivateKeepAwake?.(KEEP_AWAKE_TAG)
      } catch {
        // ignore
      }
      if (downloadAllMountedRef.current) {
        setIsDownloadingAll(false)
        setDownloadAllProgress(null)
        if (hadError) setDownloadAllStalled(true)
      }
    }
  }, [downloadAllTasks, isDownloadingAll, downloadingId])

  const handleDownload = useCallback(
    (url: string, audioId: string) => {
      if (!url || downloadedIds.has(audioId)) return
      if (downloadQueue.some((q) => q.audioId === audioId) || downloadingId === audioId)
        return
      const isCrystalBowl = audioId.startsWith("crystal_bowl_")
      setDownloadQueue((prev) => [...prev, { audioId, url, isCrystalBowl }])
      addHapticFeedback(HapticStrength.Light)
    },
    [downloadedIds, downloadQueue, downloadingId],
  )

  /** Resolve crystal bowl URL from Firebase if hook returned null (e.g. 528Hz), then queue download. */
  const handleCrystalBowlDownload = useCallback(
    async (chakra: Chakra, crystalBowlId: string) => {
      const crystalBowl = crystalBowlByChakra[chakra]
      let url = crystalBowl.url
      if (!url && storage) {
        try {
          const path = `${FIREBASE_CRYSTAL_BOWL_FOLDER}/${getCrystalBowlFileName(chakra)}`
          url = await getDownloadURL(ref(storage, path))
        } catch (e) {
          if (__DEV__) console.warn("[AudioLibrary] Crystal bowl resolve URL failed for", chakra, e)
        }
      }
      if (url) handleDownload(url, crystalBowlId)
    },
    [crystalBowlByChakra, handleDownload],
  )

  // Process download queue one at a time
  useEffect(() => {
    if (downloadingId !== null || downloadQueue.length === 0) return
    const [first, ...rest] = downloadQueue
    setDownloadingId(first.audioId)
    setDownloadQueue(rest)
    const downloadFn = first.isCrystalBowl
      ? downloadAndCacheAudioResumable(first.url, first.audioId)
      : downloadAndCacheAudio(first.url, first.audioId)
    downloadFn
      .then(() => {
        setDownloadedIds((prev) => new Set(prev).add(first.audioId))
      })
      .catch((e) => {
        if (__DEV__) console.warn("[AudioLibrary] Download failed:", first.audioId, e)
      })
      .finally(() => {
        setDownloadingId(null)
      })
  }, [downloadingId, downloadQueue])

  // Hydrate downloadedIds from cache so all rows show correct download state (icons and counter)
  useEffect(() => {
    if (downloadAllTasks.length === 0) return
    let cancelled = false
    const check = async () => {
      const found = new Set<string>()
      await Promise.all(
        downloadAllTasks.map(async (t) => {
          if (cancelled) return
          const uri = await getLocalAudioUri(t.audioId)
          if (uri) found.add(t.audioId)
        }),
      )
      if (!cancelled) {
        setDownloadedIds((prev) => {
          const next = new Set(prev)
          found.forEach((id) => next.add(id))
          return next
        })
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [downloadAllTasks])

  // APP1 (trial) never sees Music Room; redirect above sends them to ChakraHome. Only APP2 can set audioOrigin "music-room".
  if (!hasLifetimeAccess) return null

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    router.replace("/(chakras)/ChakraHub")
  }

  // Background behind content (zIndex 0); content on top (zIndex 1). Stops bg image covering hero/scroll on Android.
  const screenHeight = Dimensions.get("window").height
  const backgroundLayerStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    ...(Platform.OS === "android" && { elevation: 0 }),
  }
  const contentLayerStyle = {
    flex: 1,
    zIndex: 1,
    ...(Platform.OS === "android" && { elevation: 1 }),
  }
  const bgFill =
    Platform.OS === "android"
      ? { flex: 1, minHeight: screenHeight }
      : { flex: 1 }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1, minHeight: Platform.OS === "android" ? screenHeight : undefined }}>
        <ImageBackground
          source={require("@/assets/images/soundhealingbg.png")}
          resizeMode="cover"
          style={[bgFill, backgroundLayerStyle]}
          imageStyle={{ alignSelf: "center" }}
        />
        <View style={contentLayerStyle} pointerEvents="box-none">
          <BackgroundOpacity
            topGradientHeight={0}
            bottomGradientHeight={0}
            backgroundOpacity={0.75}
          />
          {/* Header + Download all: fixed outside ScrollView so always visible and tappable (not tied to fade/reveal).
              Design consistency: same BackgroundOpacity behind header and scroll; header uses elevation 2 for stacking only.
              DownloadIconCell (top and rows) uses full opacity for "downloaded" variant; cloud/queued/downloading dim when disabled. */}
          <View
            style={{
              paddingTop: 56,
              paddingBottom: 16,
              paddingHorizontal: 16,
              zIndex: 2,
              ...(Platform.OS === "android" && { elevation: 2 }),
            }}
            pointerEvents="auto"
            collapsable={false}
          >
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
            {__DEV__ && (
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  color: "rgba(100,200,255,0.7)",
                  textAlign: "center",
                  marginTop: 4,
                  fontSize: 11,
                }}
              >
                hero
              </AppText>
            )}
            {/* Download-all row: SAME icon block as AudioTrackRow (60×44, icon 26) – single system, no ghost layout. */}
            <View
              style={{
                width: "100%",
                marginTop: 32,
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.12)",
                paddingTop: 12,
                paddingBottom: 4,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Pressable
                onPress={handleDownloadAll}
                disabled={(isDownloadingAll && !downloadAllStalled) || downloadingId !== null}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  opacity: pressed ? 0.88 : 1,
                  marginHorizontal: -4,
                })}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                collapsable={false}
              >
                <View style={{ marginRight: 10 }}>
                  <DownloadIconCell
                    variant="cloud"
                    disabled={(isDownloadingAll && !downloadAllStalled) || downloadingId !== null}
                  />
                </View>
                <AppText
                  font="cormorant-italic"
                  size="xs"
                  numberOfLines={1}
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 13,
                  }}
                >
                  {downloadAllStalled
                    ? "Stalled — tap to continue"
                    : isDownloadingAll && downloadAllProgress
                      ? `Downloading ${downloadAllProgress.current} of ${downloadAllProgress.total}`
                      : "Download for offline listening"}
                </AppText>
              </Pressable>
            </View>
            {downloadAllLastError && downloadAllStalled && (
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  color: "rgba(255,200,150,0.9)",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Last error: {downloadAllLastError}
              </AppText>
            )}
          </View>
          {/* ScrollView: chakra list only; header and Download all are fixed above */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
          contentContainerStyle={{
            paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING + SCROLL_BREATHING_BOTTOM_PADDING,
            paddingHorizontal: 16,
          }}
        >
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
                  isQueued={
                    downloadQueue.some((q) => q.audioId === tuningForkId) &&
                    downloadingId !== tuningForkId
                  }
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
                  isQueued={
                    downloadQueue.some((q) => q.audioId === crystalBowlId) &&
                    downloadingId !== crystalBowlId
                  }
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
                    crystalBowl.url
                      ? handleDownload(crystalBowl.url, crystalBowlId)
                      : handleCrystalBowlDownload(chakra, crystalBowlId)
                  }
                  audioId={crystalBowlId}
                  url={crystalBowl.url}
                  localUri={crystalBowl.localUri}
                  canDownload={true}
                  canResolveDownload={true}
                />

                {isThirdEye ? (
                  <>
                    <AudioTrackRow
                      title={content.audioIntro.title}
                      subtitle={`with ${content.audioIntro.author} · ~${Math.round(
                        (embodimentDurations[getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")] ?? 1750000) / 60000,
                      )} min`}
                      durationLabel={`with ${content.audioIntro.author} · ~${Math.round(
                        (embodimentDurations[getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")] ?? 1750000) / 60000,
                      )} min`}
                      isLoading={
                        embodiment.isLoading ||
                        preparingPlaybackId === `embodiment_${chakra}_part1`
                      }
                      isConnected={embodimentPartOneConnected}
                      disabledWhenUnconnected={true}
                      isPlaying={isPlaying}
                      downloadedIds={downloadedIds}
                      downloadingId={downloadingId}
                      isQueued={
                        downloadQueue.some((q) => q.audioId === embodimentId) &&
                        downloadingId !== embodimentId
                      }
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
                      subtitle={`with ${content.audioIntro.author} · ~${Math.round(
                        (embodimentDurations[getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")] ?? 1257000) / 60000,
                      )} min`}
                      durationLabel={`with ${content.audioIntro.author} · ~${Math.round(
                        (embodimentDurations[getEmbodimentAudioId(Chakra.THIRD_EYE, "part2")] ?? 1257000) / 60000,
                      )} min`}
                      isLoading={
                        embodiment.isLoading ||
                        preparingPlaybackId === `embodiment_${chakra}_part2`
                      }
                      isConnected={embodimentPartTwoConnected}
                      disabledWhenUnconnected={true}
                      isPlaying={isPlaying}
                      downloadedIds={downloadedIds}
                      downloadingId={downloadingId}
                      isQueued={
                        downloadQueue.some(
                          (q) => q.audioId === embodimentPartTwoId,
                        ) && downloadingId !== embodimentPartTwoId
                      }
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
                    subtitle={`with ${content.audioIntro.author} · ~${Math.round(
                      (embodimentDurations[embodimentId] ??
                        (chakra === Chakra.CROWN
                          ? 2684000
                          : content.audioIntro.durationMs)) / 60000,
                    )} min`}
                    durationLabel={`with ${content.audioIntro.author} · ~${Math.round(
                      (embodimentDurations[embodimentId] ??
                        (chakra === Chakra.CROWN
                          ? 2684000
                          : content.audioIntro.durationMs)) / 60000,
                    )} min`}
                    isLoading={
                      embodiment.isLoading ||
                      preparingPlaybackId === `embodiment_${chakra}_single`
                    }
                    isConnected={embodimentConnected}
                    disabledWhenUnconnected={true}
                    isPlaying={isPlaying}
                    downloadedIds={downloadedIds}
                    downloadingId={downloadingId}
                    isQueued={
                      downloadQueue.some((q) => q.audioId === embodimentId) &&
                      downloadingId !== embodimentId
                    }
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
                    isLoading={
                      ancestralByChakra[chakra].isLoading ||
                      preparingPlaybackId === `headtoheart_${chakra}`
                    }
                    isConnected={!!ancestralByChakra[chakra].source}
                    disabledWhenUnconnected={true}
                    isPlaying={isPlaying}
                    downloadedIds={downloadedIds}
                    downloadingId={downloadingId}
                    isQueued={
                      downloadQueue.some(
                        (q) => q.audioId === getHeadToHeartAudioId(chakra),
                      ) &&
                      downloadingId !== getHeadToHeartAudioId(chakra)
                    }
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
          <ActionBar
            useXButton={true}
            xButtonPosition="left"
            xButtonTop={0}
            onXPress={handleClose}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default AudioLibrary
