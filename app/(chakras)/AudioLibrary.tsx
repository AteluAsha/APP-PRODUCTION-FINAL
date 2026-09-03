/**
 * Frequency of Gnosis — Sanctuary library (APP2 / Lifetime only).
 * 28 tracks in music-room playlist: Master → Tuning Fork → Asha → Crystal Bowl per day.
 * All downloads go to FileSystem.documentDirectory/sanctuary-audio/ (same vault as course).
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  View,
  ScrollView,
  Pressable,
  Platform,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { Chakra } from "@/types/chakras/Chakra"
import {
  FLOATING_NAV_SCROLL_BOTTOM_PADDING,
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
} from "@/constants/layout"
import {
  useCrystalBowlAudio,
} from "@/hooks/useCrystalBowlAudio"
import {
  useTuningForkAudio,
} from "@/hooks/useTuningForkAudio"
import {
  useEmbodimentAudio,
  type EmbodimentAudioUrls,
} from "@/hooks/useEmbodimentAudio"
import {
  useAncestralWisdomAudio,
} from "@/hooks/useAncestralWisdomAudio"
import { usesBundledSanctuaryAudio } from "@/src/utils/bundledSanctuaryAudio"
import { isBundledSanctuaryAudioId } from "@/constants/meditationAssetPack"
import {
  rushSanctuaryTrack,
  startSanctuaryVaultSync,
  useSanctuaryVaultStore,
} from "@/src/services/sanctuaryVaultDownloader"
import {
  buildSanctuaryDownloadManifest,
  SANCTUARY_TRACK_COUNT,
  type SanctuaryDownloadRow,
} from "@/constants/sanctuaryAudioManifest"
import { CHAKRA_NAMES } from "@/constants/chakras/chakraConstants"
import {
  MUSIC_ROOM_TRACK_DEFS,
  type MusicRoomTrackDef,
} from "@/constants/musicRoomLibrary"
import { MusicRoomLibraryHeader } from "@/components/chakras/MusicRoomLibraryHeader"
import {
  MusicRoomDaySection,
  type MusicRoomRowProps,
} from "@/components/chakras/MusicRoomDaySection"
import { HubCosmicField } from "@/components/chakras/HubCosmicField"
import { openMusicRoomAtIndex } from "@/utils/musicRoomPlayback"
import { getDayFromChakra } from "@/utils/chakraMapping"
import { showHealingToast } from "@/utils/healingToast"
import { navigateBackWithCleanup } from "@/utils/navigationHelpers"

const KEEP_AWAKE_TAG = "AudioLibraryDownloadAll"

function isOnDeviceSanctuaryTrack(audioId: string): boolean {
  return usesBundledSanctuaryAudio() && isBundledSanctuaryAudioId(audioId)
}

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

const FREQUENCY_BANNER_CONTENT: Record<
  Chakra,
  { hero: string; keywords: string; clears: string; brings: string }
> = {
  [Chakra.ROOT]: {
    hero: "SEPARATION > SAFETY",
    keywords: "Grounding • Security • Release",
    clears: "Guilt, fear, and ancestral trauma",
    brings: "Belonging and solid foundations",
  },
  [Chakra.SACRAL]: {
    hero: "INADEQUACY > AUTHENTICITY",
    keywords: "Flow • Change • Creativity",
    clears: "Emotional blocks and stagnant energy",
    brings: "Adaptability and transformation",
  },
  [Chakra.SOLAR_PLEXUS]: {
    hero: "POWERLESSNESS > ABUNDANCE",
    keywords: "Transformation • DNA • Power",
    clears: "Self-doubt and the performance ego",
    brings: "Inner authority and cellular repair",
  },
  [Chakra.HEART]: {
    hero: "ABANDONMENT > CONNECTION",
    keywords: "Connection • Unity • Repair",
    clears: "Friction in relationships and isolation",
    brings: 'Compassion and the "We" mind',
  },
  [Chakra.THROAT]: {
    hero: "SUPPRESSION > EXPRESSION",
    keywords: "Expression • Clarity • Truth",
    clears: "Toxic communication and self-deception",
    brings: "Authentic resonance and boundaries",
  },
  [Chakra.THIRD_EYE]: {
    hero: "ILLUSION > CLARITY",
    keywords: "Intuition • Vision • Order",
    clears: "Mental noise and the thinking ego",
    brings: "Spiritual clarity and inner knowing",
  },
  [Chakra.CROWN]: {
    hero: "OBLIVION > SANCTUARY",
    keywords: "Divinity • Oneness • Light",
    clears: 'The feeling of being "cut off" from Source',
    brings: "Connection to the All and pure awareness",
  },
}

function resolveSanctuaryRowUrl(
  row: SanctuaryDownloadRow,
  ctx: {
    tuningForkByChakra: Record<Chakra, { url: string | null }>
    crystalBowlByChakra: Record<Chakra, { url: string | null }>
    embodimentByChakra: Record<Chakra, EmbodimentAudioUrls>
    ancestralByChakra: Record<Chakra, { url: string | null }>
  },
): string {
  const { chakra, rowKind } = row
  const emb = ctx.embodimentByChakra[chakra]
  switch (rowKind) {
    case "tuning_fork":
      return ctx.tuningForkByChakra[chakra].url ?? ""
    case "crystal_bowl":
      return ctx.crystalBowlByChakra[chakra].url ?? ""
    case "embodiment_single":
      return emb.single ?? ""
    case "head_to_heart":
      return ctx.ancestralByChakra[chakra].url ?? ""
    default:
      return ""
  }
}

function resolveTrackMedia(
  def: MusicRoomTrackDef,
  ctx: {
    tuningForkByChakra: Record<Chakra, { url: string | null; localUri: string | null }>
    crystalBowlByChakra: Record<Chakra, { url: string | null; localUri: string | null }>
    embodimentByChakra: Record<Chakra, { single: string | null; localUri: string | null }>
    ancestralByChakra: Record<Chakra, { url: string | null; localUri: string | null }>
  },
): { url?: string | null; localUri?: string | null } {
  switch (def.trackKind) {
    case "embodiment": {
      const e = ctx.embodimentByChakra[def.chakra]
      return { url: e.single, localUri: e.localUri }
    }
    case "tuning_fork": {
      const t = ctx.tuningForkByChakra[def.chakra]
      return { url: t.url, localUri: t.localUri }
    }
    case "head_to_heart": {
      const a = ctx.ancestralByChakra[def.chakra]
      return { url: a.url, localUri: a.localUri }
    }
    case "crystal_bowl": {
      const c = ctx.crystalBowlByChakra[def.chakra]
      return { url: c.url, localUri: c.localUri }
    }
    default:
      return {}
  }
}

const AudioLibrary = () => {
  const insets = useSafeAreaInsets()
  const currentTrackKey = useCurrentAudioStore((s) => s.currentTrackKey)
  const pendingTrackKey = useCurrentAudioStore((s) => s.pendingTrackKey)
  const isPlaying = useCurrentAudioStore((s) => s.isPlaying)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const hideSanctuaryDownloads = usesBundledSanctuaryAudio()
  const vaultReadyIds = useSanctuaryVaultStore((s) => s.readyIds)
  const vaultMissingCount = useSanctuaryVaultStore((s) => s.missingCount)
  const vaultDownloadingId = useSanctuaryVaultStore((s) => s.downloadingAudioId)
  const vaultRushedId = useSanctuaryVaultStore((s) => s.rushedAudioId)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [downloadAllProgress, setDownloadAllProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [preparingGlobalIndex, setPreparingGlobalIndex] = useState<number | null>(
    null,
  )
  const scrollRef = useRef<ScrollView>(null)
  const sectionYRef = useRef<Record<string, number>>({})
  const downloadAllMountedRef = useRef(true)
  const openingIndexRef = useRef<number | null>(null)

  useEffect(() => {
    downloadAllMountedRef.current = true
    return () => {
      downloadAllMountedRef.current = false
    }
  }, [])

  const { scrollTo: scrollToParam } = useLocalSearchParams<{
    scrollTo?: string
  }>()
  const router = useRouter()

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

  const crystalBowlByChakra = useMemo(
    () => ({
      [Chakra.ROOT]: crystalBowlRoot,
      [Chakra.SACRAL]: crystalBowlSacral,
      [Chakra.SOLAR_PLEXUS]: crystalBowlSolar,
      [Chakra.HEART]: crystalBowlHeart,
      [Chakra.THROAT]: crystalBowlThroat,
      [Chakra.THIRD_EYE]: crystalBowlThirdEye,
      [Chakra.CROWN]: crystalBowlCrown,
    }),
    [
      crystalBowlRoot,
      crystalBowlSacral,
      crystalBowlSolar,
      crystalBowlHeart,
      crystalBowlThroat,
      crystalBowlThirdEye,
      crystalBowlCrown,
    ],
  )

  const tuningForkByChakra = useMemo(
    () => ({
      [Chakra.ROOT]: tuningForkRoot,
      [Chakra.SACRAL]: tuningForkSacral,
      [Chakra.SOLAR_PLEXUS]: tuningForkSolar,
      [Chakra.HEART]: tuningForkHeart,
      [Chakra.THROAT]: tuningForkThroat,
      [Chakra.THIRD_EYE]: tuningForkThirdEye,
      [Chakra.CROWN]: tuningForkCrown,
    }),
    [
      tuningForkRoot,
      tuningForkSacral,
      tuningForkSolar,
      tuningForkHeart,
      tuningForkThroat,
      tuningForkThirdEye,
      tuningForkCrown,
    ],
  )

  const embodimentByChakra = useMemo(
    () => ({
      [Chakra.ROOT]: embodimentRoot,
      [Chakra.SACRAL]: embodimentSacral,
      [Chakra.SOLAR_PLEXUS]: embodimentSolar,
      [Chakra.HEART]: embodimentHeart,
      [Chakra.THROAT]: embodimentThroat,
      [Chakra.THIRD_EYE]: embodimentThirdEye,
      [Chakra.CROWN]: embodimentCrown,
    }),
    [
      embodimentRoot,
      embodimentSacral,
      embodimentSolar,
      embodimentHeart,
      embodimentThroat,
      embodimentThirdEye,
      embodimentCrown,
    ],
  )

  const ancestralByChakra = useMemo(
    () => ({
      [Chakra.ROOT]: ancestralRoot,
      [Chakra.SACRAL]: ancestralSacral,
      [Chakra.SOLAR_PLEXUS]: ancestralSolar,
      [Chakra.HEART]: ancestralHeart,
      [Chakra.THROAT]: ancestralThroat,
      [Chakra.THIRD_EYE]: ancestralThirdEye,
      [Chakra.CROWN]: ancestralCrown,
    }),
    [
      ancestralRoot,
      ancestralSacral,
      ancestralSolar,
      ancestralHeart,
      ancestralThroat,
      ancestralThirdEye,
      ancestralCrown,
    ],
  )

  const mediaCtx = useMemo(
    () => ({
      tuningForkByChakra,
      crystalBowlByChakra,
      embodimentByChakra,
      ancestralByChakra,
    }),
    [tuningForkByChakra, crystalBowlByChakra, embodimentByChakra, ancestralByChakra],
  )

  const tracksByChakra = useMemo(() => {
    const map = new Map<Chakra, MusicRoomTrackDef[]>()
    for (const def of MUSIC_ROOM_TRACK_DEFS) {
      const list = map.get(def.chakra) ?? []
      list.push(def)
      map.set(def.chakra, list)
    }
    return map
  }, [])

  const sanctuaryManifestRows = useMemo(
    () => buildSanctuaryDownloadManifest(),
    [],
  )

  const downloadAllTasks = useMemo(
    () =>
      sanctuaryManifestRows.map((row) => ({
        ...row,
        url: resolveSanctuaryRowUrl(row, mediaCtx),
      })),
    [sanctuaryManifestRows, mediaCtx],
  )

  const vaultReadySet = useMemo(() => {
    const ready = new Set<string>()
    for (const t of downloadAllTasks) {
      if (vaultReadyIds[t.audioId] === true) {
        ready.add(t.audioId)
      }
    }
    return ready
  }, [downloadAllTasks, vaultReadyIds])

  const offlineCount = vaultReadySet.size

  useEffect(() => {
    if (__DEV__ && MUSIC_ROOM_TRACK_DEFS.length !== SANCTUARY_TRACK_COUNT) {
      console.warn(
        "[AudioLibrary] Expected",
        SANCTUARY_TRACK_COUNT,
        "library tracks, got",
        MUSIC_ROOM_TRACK_DEFS.length,
      )
    }
  }, [])

  const handleDownloadAll = useCallback(async () => {
    if (isDownloadingAll) return
    if (vaultMissingCount === 0 || offlineCount >= SANCTUARY_TRACK_COUNT) {
      showHealingToast("alreadyDownloaded")
      return
    }

    addHapticFeedback(HapticStrength.Light)
    showHealingToast("downloadAll")
    if (downloadAllMountedRef.current) {
      setIsDownloadingAll(true)
      setDownloadAllProgress({
        current: offlineCount,
        total: SANCTUARY_TRACK_COUNT,
      })
    }
    try {
      const KeepAwake = require("expo-keep-awake")
      await KeepAwake.activateKeepAwakeAsync?.(KEEP_AWAKE_TAG)
    } catch {
      // optional
    }
    startSanctuaryVaultSync()
  }, [isDownloadingAll, vaultMissingCount, offlineCount])

  useEffect(() => {
    if (!isDownloadingAll) return
    setDownloadAllProgress({
      current: offlineCount,
      total: SANCTUARY_TRACK_COUNT,
    })
    if (vaultMissingCount === 0 || offlineCount >= SANCTUARY_TRACK_COUNT) {
      setIsDownloadingAll(false)
      setDownloadAllProgress(null)
      try {
        const KeepAwake = require("expo-keep-awake")
        KeepAwake.deactivateKeepAwake?.(KEEP_AWAKE_TAG)
      } catch {
        // ignore
      }
    }
  }, [isDownloadingAll, offlineCount, vaultMissingCount])

  const handleDownload = useCallback(
    (audioId: string) => {
      if (vaultReadyIds[audioId] || isOnDeviceSanctuaryTrack(audioId)) {
        showHealingToast("alreadyDownloaded")
        return
      }
      if (
        vaultDownloadingId === audioId ||
        vaultRushedId === audioId
      ) {
        return
      }
      rushSanctuaryTrack(audioId)
      addHapticFeedback(HapticStrength.Light)
      showHealingToast("downloadQueued")
    },
    [vaultReadyIds, vaultDownloadingId, vaultRushedId],
  )

  const handlePlayTrack = useCallback(async (globalIndex: number) => {
    if (openingIndexRef.current === globalIndex) {
      showHealingToast("playerWhenReady")
      return
    }
    if (openingIndexRef.current != null) {
      showHealingToast("oneAtATime")
      return
    }
    openingIndexRef.current = globalIndex
    setPreparingGlobalIndex(globalIndex)
    showHealingToast("gatheringPresence")
    try {
      const ok = await openMusicRoomAtIndex(globalIndex)
      if (!ok) {
        showHealingToast("stillGathering")
      }
    } finally {
      openingIndexRef.current = null
      setPreparingGlobalIndex(null)
    }
  }, [])

  const handleBack = () => {
    navigateBackWithCleanup(() => {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace("/(chakras)/ChakraHub")
      }
    })
  }

  const buildRowProps = useCallback(
    (def: MusicRoomTrackDef): MusicRoomRowProps => {
      const media = resolveTrackMedia(def, mediaCtx)
      const vaultReady = vaultReadyIds[def.audioId] === true
      const isConnected = vaultReady || !!media.url
      const activeVaultDownloadId = vaultReady
        ? null
        : (vaultDownloadingId ?? vaultRushedId)
      const isActiveTrack =
        audioOrigin === "music-room" &&
        (currentTrackKey === def.trackKey || pendingTrackKey === def.trackKey)

      return {
        def,
        isLoading: preparingGlobalIndex === def.globalIndex,
        isConnected,
        isActiveTrack,
        isPlaying: isActiveTrack && isPlaying,
        downloadedIds: vaultReadySet,
        downloadingId: activeVaultDownloadId,
        isQueued:
          !vaultReady &&
          activeVaultDownloadId != null &&
          activeVaultDownloadId !== def.audioId,
        localUri: media.localUri,
        url: media.url,
        hideDownload: hideSanctuaryDownloads,
        onPlay: () => {
          void handlePlayTrack(def.globalIndex)
        },
        onDownload: () => {
          handleDownload(def.audioId)
        },
      }
    },
    [
      mediaCtx,
      vaultReadyIds,
      vaultReadySet,
      vaultDownloadingId,
      vaultRushedId,
      audioOrigin,
      currentTrackKey,
      pendingTrackKey,
      preparingGlobalIndex,
      isPlaying,
      hideSanctuaryDownloads,
      handlePlayTrack,
      handleDownload,
    ],
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
          pointerEvents="none"
        >
          <HubCosmicField />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.48)",
            }}
          />
        </View>

        <View style={{ flex: 1, zIndex: 1 }} pointerEvents="box-none">
          <MusicRoomLibraryHeader
            offlineCount={offlineCount}
            isDownloadingAll={isDownloadingAll}
            downloadProgress={downloadAllProgress}
            hideDownloads={hideSanctuaryDownloads}
            onDownloadAll={handleDownloadAll}
          />

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
            contentContainerStyle={{
              paddingBottom:
                FLOATING_NAV_SCROLL_BOTTOM_PADDING +
                SCROLL_BREATHING_BOTTOM_PADDING +
                (Platform.OS === "ios" ? insets.bottom : 0),
              paddingHorizontal: 16,
            }}
          >
            {CHAKRA_ORDER.map((chakra, index) => {
              const dayTracks = tracksByChakra.get(chakra) ?? []
              const banner = FREQUENCY_BANNER_CONTENT[chakra]
              return (
                <View
                  key={chakra}
                  onLayout={(e) => {
                    sectionYRef.current[chakra] = e.nativeEvent.layout.y
                  }}
                >
                  <MusicRoomDaySection
                    chakra={chakra}
                    chakraName={CHAKRA_NAMES[index]}
                    dayIndex={getDayFromChakra(chakra)}
                    accentColor={CHAKRA_COLORS[chakra]}
                    heroLine={banner.hero}
                    keywords={banner.keywords}
                    clears={banner.clears}
                    brings={banner.brings}
                    trackRows={dayTracks.map((def) => buildRowProps(def))}
                  />
                </View>
              )
            })}
          </ScrollView>

          <View
            style={{
              position: "absolute",
              top: 12,
              left: 16,
              zIndex: 50,
              ...(Platform.OS === "android" && { elevation: 50 }),
            }}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={handleBack}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={({ pressed }) => ({
                padding: 8,
                opacity: pressed ? 0.85 : 1,
              })}
              accessibilityLabel="Back"
              accessibilityHint="Go back to the previous screen"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="rgba(255, 255, 255, 0.95)"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default AudioLibrary
