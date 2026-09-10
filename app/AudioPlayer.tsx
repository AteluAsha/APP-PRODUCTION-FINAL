import { ActionBar } from "@/components/ActionBar"
import { ScreenCrashBoundary } from "@/components/ScreenCrashBoundary"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  View,
  TouchableHighlight,
  Pressable,
  Platform,
  AppState,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import {
  AVPlaybackStatus,
  AVPlaybackSource,
} from "expo-av"
import * as FileSystem from "expo-file-system"
import { useRouter } from "expo-router"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { useEmbodimentDurationCacheStore } from "@/hooks/useEmbodimentDurationCacheStore"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { PlayerProgressBar } from "@/components/chakras/PlayerProgressBar"
import { PulsingChakraBall } from "@/components/chakras/PulsingChakraBall"
import { SoftChakraBall } from "@/components/chakras/SoftChakraBall"
import { VaultFirstLoadPanel } from "@/components/chakras/VaultFirstLoadPanel"
import { HeadsetListenReminder } from "@/components/audio/HeadsetListenReminder"
import { PlayerVaultSaveCue } from "@/components/audio/PlayerVaultSaveCue"
import { usePlayerDownloadGlitch } from "@/hooks/usePlayerDownloadGlitch"
import { NotesLeafButton } from "@/components/notes/NotesLeafButton"
import {
  getChakraImage,
  getChakraName,
} from "@/constants/chakras/chakraConstants"
import Rewind10 from "@/assets/svg/rewind10.svg"
import Forward10 from "@/assets/svg/forward10.svg"
import { stopAnuaAudio } from "@/src/services/elevenlabs"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { ICON, TOUCH, safeOverlayTop } from "@/constants/layout"
import { isEmulatorOrSimulator } from "@/constants/emulator"
import {
  otherOriginTrackRef,
  getSourceSignature,
} from "@/src/services/otherOriginTrackRef"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  clearAudioBookmark,
  loadBookmarkPositionMs,
  persistResumeBookmark,
  saveAudioBookmark,
} from "@/utils/audioBookmark"
import {
  createSoundAsyncOffUiThread,
  waitForSoundLoaded,
  waitForSoundReadyForSeek,
  yieldToUiThread,
} from "@/src/utils/audioStreamInit"
import {
  notifyRushedTrackPlaying,
  peekSanctuaryTrack,
  rushSanctuaryTrack,
  getVaultDownloadSpeedBps,
  useSanctuaryVaultStore,
} from "@/src/services/sanctuaryVaultDownloader"
import { peekPlayableVaultUri } from "@/src/utils/sanctuaryAudioVault"
import { toAbsoluteFileUri } from "@/src/utils/crystalBowlPlayback"
import {
  bestResumeCandidateMs,
  clampSeekMs,
  commitPlaybackDurationMs,
  isPlaybackComplete,
  isPlaybackPositionRegression,
  nativeSeekLanded,
  resolvePlaybackDurationMs,
  resumePositionMs,
  shouldHoldSeekTarget,
  shouldTrustNativeDuration,
  sliderDurationMs,
} from "@/src/utils/playerControls"
import {
  silenceAllAudio,
  configureHealingAudioMode,
  handoffExclusiveSound,
  type HealingSound,
} from "@/src/utils/singleActiveSound"
import {
  closeFullPlayerAndLeave,
  isClosingFullPlayer,
  reportFullPlayerListenCompleted,
  reportFullPlayerPosition,
} from "@/utils/openFullPlayer"
import { pinRecoveryRoute } from "@/utils/appErrorRecovery"
import { clearVaultAutoPlayback } from "@/src/services/vaultAutoPlayback"
import { registerAndroidHardwareBackOverride } from "@/utils/androidBackCleanup"
import { MusicRoomPlayerFieldLayer } from "@/components/chakras/MusicRoomPlayerFieldLayer"
import type { MusicRoomTrackKind } from "@/constants/musicRoomLibrary"
import { getSanctuarySoundField } from "@/utils/ashaPlayerField"
import {
  growingPartHandoffMinDurationMs,
  growingPartHasEnoughNewBytes,
  isGrowingVaultPartUri,
  isLibrarySingleTrack,
  shouldReloadGrowingVaultPart,
  shouldTreatAsTrackEnd,
} from "@/utils/audioPlayMode"
import {
  getActiveMusicRoomTrack,
  getMusicRoomActiveAudioId,
} from "@/utils/musicRoomPlayback"

const FALLBACK_DAY_INDEX = 5 // Third Eye
const GROWING_PART_RELOAD_DEBOUNCE_MS = 4000

async function vaultPartFileBytes(uri: string): Promise<number> {
  if (!isGrowingVaultPartUri(uri)) return 0
  try {
    const info = await FileSystem.getInfoAsync(toAbsoluteFileUri(uri))
    if (info.exists && "size" in info && typeof info.size === "number") {
      return info.size
    }
  } catch {
    // best-effort — store progress is the fallback
  }
  return 0
}

function PlayerTrackFace({
  dayIndex,
  title,
  author,
  isLoading,
  audioId,
  embodimentPulse,
  animatedStyle,
}: {
  dayIndex: number
  title: string
  author?: string
  isLoading: boolean
  audioId?: string | null
  embodimentPulse: boolean
  animatedStyle: object
}) {
  const { showGlitch } = usePlayerDownloadGlitch(audioId, { isLoading })
  return (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 28,
          paddingTop: 72,
          paddingBottom: 168,
        },
        animatedStyle,
      ]}
    >
      <PulsingChakraBall
        source={
          dayIndex === 5
            ? require("@/assets/images/ajna.png")
            : getChakraImage(dayIndex)
        }
        embodimentPulse={embodimentPulse}
      />
      <AppText
        font="cormorant-regular"
        size="xl"
        numberOfLines={2}
        style={{
          marginTop: 4,
          marginBottom: 6,
          color: "#ffffff",
          textAlign: "center",
          paddingHorizontal: 8,
        }}
      >
        {title}
      </AppText>
      {author ? (
        <AppText
          font="instrument-regular"
          size="sm"
          numberOfLines={1}
          style={{
            color: "rgba(255,255,255,0.62)",
            textAlign: "center",
            letterSpacing: 0.6,
          }}
        >
          {author}
        </AppText>
      ) : null}
      {isLoading && showGlitch ? (
        <AppText
          font="instrument-regular"
          size="base"
          style={{
            marginTop: 16,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
          }}
        >
          Preparing audio…
        </AppText>
      ) : null}
      <PlayerVaultSaveCue
        audioId={audioId}
        visible={showGlitch}
        isLoading={isLoading}
      />
    </Animated.View>
  )
}

/** Nuclear diagnostic: periodic AsyncStorage writes while playing (__DEV__ only). */
const AUDIO_BOOKMARK_PERIODIC_SAVE_MS = 5000

async function logAllAsyncStorageKeys(tag: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    console.log(`[DEBUG] ALL STORAGE KEYS (${tag}):`, keys)
  } catch (e) {
    console.warn("[DEBUG] getAllKeys failed:", e)
  }
}

/** Hz → day index (0–6) for chakra ball image */
const HERTZ_TO_DAY_INDEX: Record<number, number> = {
  396: 0,
  417: 1,
  528: 2,
  639: 3,
  741: 4,
  852: 5,
  963: 6,
}

/** Chakra color (hex) → day index when set from store (e.g. ChakraTemplate) */
const CHAKRA_COLOR_TO_DAY_INDEX: Record<string, number> = {
  "#DC2626": 0,
  "#EA580C": 1,
  "#FCD34D": 2,
  "#10B981": 3,
  "#3B82F6": 4,
  "#6366F1": 5,
  "#9333EA": 6,
}

function parseHzToDayIndex(metadata: {
  title: string
  author: string
}): number {
  const text = `${metadata.title} ${metadata.author}`
  const match = text.match(/(\d{3})\s*[Hh]z/i)
  if (!match) return FALLBACK_DAY_INDEX
  const hz = parseInt(match[1], 10)
  return HERTZ_TO_DAY_INDEX[hz] ?? FALLBACK_DAY_INDEX
}

const CONTROLS_HIDE_DELAY_MS = 3000
/** Brief wait before showing "No audio selected" so delayed setSource (180ms) and navigation can run */
const NO_AUDIO_GRACE_MS = 2500

const AudioPlayer = () => {
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const markChakraCompleted = useChakraJourneyStore(
    (s) => s.markChakraCompleted,
  )
  const source = useCurrentAudioStore((state) => state.source)
  const metadata = useCurrentAudioStore((state) => state.metadata)
  const prefs = useCurrentAudioStore((state) => state.prefs)
  const audioOrigin = useCurrentAudioStore((state) => state.audioOrigin)
  const setPlaying = useCurrentAudioStore((state) => state.setPlaying)
  const setPositionMs = useCurrentAudioStore((state) => state.setPositionMs)
  const setFullScreenPlayerMounted = useCurrentAudioStore(
    (state) => state.setFullScreenPlayerMounted,
  )
  const storeChakraColor = useCurrentAudioStore((state) => state.chakraColor)
  const musicRoomPlaylist = useCurrentAudioStore((s) => s.musicRoomPlaylist)
  const musicRoomIndex = useCurrentAudioStore((s) => s.musicRoomIndex)
  const pendingTrackKey = useCurrentAudioStore((state) => state.pendingTrackKey)
  const fullPlayerTrackId = useCurrentAudioStore(
    (state) => state.fullPlayerTrackId,
  )
  const activeMusicRoom = getActiveMusicRoomTrack()
  const musicRoomDayIndex =
    activeMusicRoom?.dayIndex ??
    (storeChakraColor &&
    CHAKRA_COLOR_TO_DAY_INDEX[storeChakraColor] !== undefined
      ? CHAKRA_COLOR_TO_DAY_INDEX[storeChakraColor]
      : metadata
        ? parseHzToDayIndex(metadata)
        : FALLBACK_DAY_INDEX)
  const musicRoomTrackKind: MusicRoomTrackKind =
    activeMusicRoom?.trackKind ?? "embodiment"
  const isMusicRoomPlaylist =
    audioOrigin === "music-room" &&
    !!musicRoomPlaylist &&
    musicRoomPlaylist.length > 0
  const ashaPlayerField = isMusicRoomPlaylist
    ? null
    : getSanctuarySoundField(fullPlayerTrackId)
  const playerFieldDayIndex = isMusicRoomPlaylist
    ? musicRoomDayIndex
    : ashaPlayerField?.dayIndex
  const playerFieldTrackKind: MusicRoomTrackKind | undefined =
    isMusicRoomPlaylist ? musicRoomTrackKind : ashaPlayerField?.trackKind
  const dayIndex =
    audioOrigin === "music-room" && musicRoomPlaylist
      ? musicRoomDayIndex
      : storeChakraColor &&
          CHAKRA_COLOR_TO_DAY_INDEX[storeChakraColor] !== undefined
        ? CHAKRA_COLOR_TO_DAY_INDEX[storeChakraColor]
        : metadata
          ? parseHzToDayIndex(metadata)
          : FALLBACK_DAY_INDEX

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // This ensures React hooks are always called in the same order on every render
  useEffect(() => {
    setFullScreenPlayerMounted(true)
    return () => {
      setFullScreenPlayerMounted(false)
      const state = useCurrentAudioStore.getState()
      if (state.source != null || state.audioOrigin != null) {
        void closeFullPlayerAndLeave({ navigate: false })
      } else {
        void silenceAllAudio()
      }
    }
  }, [setFullScreenPlayerMounted])

  const [track, setTrack] = useState<HealingSound>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [positionMs, setPosition] = useState(0)
  const [durationMs, setDuration] = useState<number>(metadata?.durationMs || 0)
  const [justFinished, setJustFinished] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [showNoAudioMessage, setShowNoAudioMessage] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [focusKey, setFocusKey] = useState(0)
  const controlsHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const noAudioGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoadedRef = useRef(false)
  const lastSourceRef = useRef<AVPlaybackSource | null>(null)
  const lastSourceSignatureRef = useRef<string | null>(null)
  const lastAppliedStorePlayingRef = useRef<boolean | null>(null)
  const lastStatusUpdateTimeRef = useRef(0)
  /** 80% = dot only: mark day complete for homescreen; no routing, no goodbye. Reset when source changes. */
  const embodimentEightyPercentRef = useRef(false)
  const PROGRESS_UPDATE_INTERVAL_MS = 500
  /** Prevents double createAsync when effect runs twice (e.g. Strict Mode); Master Embodiment must never echo */
  const initializingTrackRef = useRef(false)
  /** Ref to current track. Only stop/unload on: user close, pause, leave screen (focus cleanup), or track end. No other system may stop playback. */
  const trackRef = useRef<HealingSound | undefined>(undefined)
  /** When true, we just returned from Notes; ignore one Android back so we don't close player. */
  const justReturnedFromNotesRef = useRef(false)
  /** Reset when source/track changes so first loaded status always updates progress bar (no throttle). */
  const hasAppliedFirstStatusRef = useRef(false)
  /** Latest playback position from native status (capture-proof for bookmark save if React/store lags). */
  const lastPlaybackPositionMsRef = useRef(0)
  /** True after a real end this session so leave/reopen starts at 0. */
  const completedListenRef = useRef(false)
  const setListenCompleted = useCallback((completed: boolean) => {
    completedListenRef.current = completed
    reportFullPlayerListenCompleted(completed)
  }, [])
  const lastPeriodicBookmarkSaveAtRef = useRef(0)
  const closingRef = useRef(false)
  /** Set true after teardown so beforeRemove allows the pop without re-running cleanup. */
  const allowLeaveRef = useRef(false)
  /** Cancels in-flight initializeTrack when source changes (music-room swipe). */
  const initGenerationRef = useRef(0)
  const seekingUntilRef = useRef(0)
  const seekTargetMsRef = useRef(0)
  const fileDurationMsRef = useRef(0)
  const lastLoadedPartBytesRef = useRef(0)
  const growingPartNeedsResumeRef = useRef(false)
  const growingPartReloadingRef = useRef(false)
  const growingPartReloadAtRef = useRef(0)
  const tryReloadGrowingVaultPartRef = useRef<() => void>(() => {})

  const resolveActivePlaybackDurationMs = useCallback(
    (opts?: { bookmarkMs?: number; positionMs?: number }) => {
      const trackId = useCurrentAudioStore.getState().fullPlayerTrackId
      const cached =
        trackId != null
          ? useEmbodimentDurationCacheStore.getState().getDuration(trackId)
          : undefined
      const catalog =
        useCurrentAudioStore.getState().metadata?.durationMs ?? durationMs
      return resolvePlaybackDurationMs({
        fileDurationMs: fileDurationMsRef.current || cached,
        catalogDurationMs: catalog,
        bookmarkMs: opts?.bookmarkMs,
      })
    },
    [durationMs],
  )

  useEffect(() => {
    trackRef.current = track
    return () => {
      trackRef.current = undefined
    }
  }, [track])

  useEffect(() => {
    if (fullPlayerTrackId == null) return
    closingRef.current = false
    allowLeaveRef.current = false
    fileDurationMsRef.current = 0
    setListenCompleted(false)
    const cached =
      useEmbodimentDurationCacheStore.getState().getDuration(fullPlayerTrackId)
    const catalog =
      useCurrentAudioStore.getState().metadata?.durationMs ?? 0
    setDuration(
      resolvePlaybackDurationMs({
        fileDurationMs: cached,
        catalogDurationMs: catalog,
      }),
    )
    const stored = useCurrentAudioStore.getState().positionMs
    const resumeAt = resumePositionMs(stored, catalog, cached)
    lastPlaybackPositionMsRef.current = resumeAt
    if (resumeAt > 0) {
      setPosition(resumeAt)
    } else {
      setPosition(0)
    }
  }, [fullPlayerTrackId])

  // When store is empty, wait briefly before showing "No audio selected" so delayed setSource (180ms) can run.
  // When source is loading (pendingTrackKey set, metadata/prefs present), never show "No audio selected" — user is waiting for prepare.
  useEffect(() => {
    const sourceLoading =
      !source && !!pendingTrackKey && (!!metadata || !!prefs)
    if (sourceLoading) {
      if (noAudioGraceTimerRef.current) {
        clearTimeout(noAudioGraceTimerRef.current)
        noAudioGraceTimerRef.current = null
      }
      setShowNoAudioMessage(false)
      return
    }
    const empty = !source || !metadata || !prefs
    if (empty) {
      if (noAudioGraceTimerRef.current) return
      noAudioGraceTimerRef.current = setTimeout(() => {
        noAudioGraceTimerRef.current = null
        setShowNoAudioMessage(true)
      }, NO_AUDIO_GRACE_MS)
    } else {
      if (noAudioGraceTimerRef.current) {
        clearTimeout(noAudioGraceTimerRef.current)
        noAudioGraceTimerRef.current = null
      }
      setShowNoAudioMessage(false)
    }
    return () => {
      if (noAudioGraceTimerRef.current) {
        clearTimeout(noAudioGraceTimerRef.current)
        noAudioGraceTimerRef.current = null
      }
    }
  }, [source, metadata, prefs, pendingTrackKey])

  // While the player is open without a source, poll until the vault has enough bytes.
  useEffect(() => {
    if (source) return
    if (closingRef.current) return
    const st = useCurrentAudioStore.getState()
    const isFullPlayer = st.audioOrigin === "full-player"
    const isMusicRoom = st.audioOrigin === "music-room"
    if (!isFullPlayer && !isMusicRoom) return
    const id = isMusicRoom
      ? (st.musicRoomPlaylist?.[st.musicRoomIndex]?.audioId ??
        st.fullPlayerTrackId)
      : fullPlayerTrackId
    if (!id) return
    if (isFullPlayer && (!st.metadata || !st.prefs)) return

    let cancelled = false
    const poll = async () => {
      while (!cancelled && !closingRef.current) {
        const live = useCurrentAudioStore.getState()
        if (live.source) return
        const liveId = isMusicRoom
          ? (live.musicRoomPlaylist?.[live.musicRoomIndex]?.audioId ??
            live.fullPlayerTrackId)
          : live.fullPlayerTrackId
        if (liveId !== id) return
        const speed = getVaultDownloadSpeedBps()
        const uri =
          (await peekSanctuaryTrack(id)) ??
          (await peekPlayableVaultUri(id, {
            downloadSpeedBps: speed,
            durationMs: live.metadata?.durationMs,
            userRushed: true,
          }))
        if (cancelled || closingRef.current) return
        if (uri) {
          if (isMusicRoom) {
            live.applyMusicRoomTrack(live.musicRoomIndex, {
              uri: toAbsoluteFileUri(uri),
            })
            return
          }
          clearVaultAutoPlayback(id)
          const bookmark = await loadBookmarkPositionMs(id)
          const cached = useEmbodimentDurationCacheStore.getState().getDuration(id)
          const catalogMs = live.metadata?.durationMs ?? 0
          live.setSource({ uri: toAbsoluteFileUri(uri) }, "full-player", {
            resumePositionMs: resumePositionMs(bookmark, catalogMs, cached),
            fullPlayerTrackId: id,
          })
          return
        }
        rushSanctuaryTrack(id)
        await new Promise((r) => setTimeout(r, 600))
      }
    }
    void poll()
    return () => {
      cancelled = true
    }
  }, [source, fullPlayerTrackId, metadata, prefs, audioOrigin])

  const vaultTrackComplete = useSanctuaryVaultStore((s) =>
    fullPlayerTrackId ? s.readyIds[fullPlayerTrackId] === true : false,
  )

  // Finished vault file: leave the growing-`.part` path. Paused swap is safe via setSource.
  useEffect(() => {
    if (!fullPlayerTrackId || !vaultTrackComplete || !source) return
    if (isPlaying || isLoading) return
    const uri =
      typeof source === "object" && source !== null && "uri" in source
        ? String((source as { uri?: string }).uri ?? "")
        : ""
    if (!uri.includes(".part")) return
    let cancelled = false
    void (async () => {
      const finalUri = await peekSanctuaryTrack(fullPlayerTrackId)
      if (cancelled || !finalUri) return
      const id = fullPlayerTrackId
      const bookmark = await loadBookmarkPositionMs(id)
      const cached = useEmbodimentDurationCacheStore.getState().getDuration(id)
      const st = useCurrentAudioStore.getState()
      const candidate = bestResumeCandidateMs({
        storeMs: st.positionMs,
        bookmarkMs: bookmark,
        lastPlaybackMs: lastPlaybackPositionMsRef.current,
      })
      const sameListenMs = lastPlaybackPositionMsRef.current
      const resumeAt = isLibrarySingleTrack(st.audioOrigin, st.playMode)
        ? Math.max(0, sameListenMs)
        : resumePositionMs(
            candidate,
            st.metadata?.durationMs ?? 0,
            cached,
          )
      if (st.audioOrigin === "music-room") {
        st.applyMusicRoomTrack(st.musicRoomIndex, {
          uri: toAbsoluteFileUri(finalUri),
        })
        st.setPositionMs(resumeAt)
        return
      }
      st.setSource(
        { uri: toAbsoluteFileUri(finalUri) },
        "full-player",
        {
          resumePositionMs: resumeAt,
          fullPlayerTrackId: st.fullPlayerTrackId,
        },
      )
    })()
    return () => {
      cancelled = true
    }
  }, [vaultTrackComplete, fullPlayerTrackId, source, isPlaying, isLoading])

  // Sync duration from metadata when we have source so progress bar shows total even before first status (e.g. Android durationMillis delay)
  useEffect(() => {
    if (!source || !metadata?.durationMs) return
    const trackId = useCurrentAudioStore.getState().fullPlayerTrackId
    const cached =
      trackId != null
        ? useEmbodimentDurationCacheStore.getState().getDuration(trackId)
        : undefined
    setDuration((prev) =>
      commitPlaybackDurationMs({
        currentMs: prev,
        nextMs: resolvePlaybackDurationMs({
          fileDurationMs: fileDurationMsRef.current || cached,
          catalogDurationMs: metadata.durationMs,
        }),
        fileDurationMs: fileDurationMsRef.current || cached || 0,
        catalogDurationMs: metadata.durationMs,
      }),
    )
  }, [source, metadata?.durationMs])

  // Define callbacks - safe to call even if source/metadata/prefs are null
  const seekToPosition = useCallback(
    async (newPositionMs: number, wasPlaying?: boolean) => {
      const active = trackRef.current ?? track
      if (!active) return
      const duration = resolveActivePlaybackDurationMs({
        positionMs: newPositionMs,
      })
      const clamped =
        duration > 0
          ? clampSeekMs(newPositionMs, duration)
          : Math.max(0, newPositionMs)
      seekingUntilRef.current = Date.now() + 6000
      seekTargetMsRef.current = clamped
      lastPlaybackPositionMsRef.current = clamped
      if (
        clamped > 0 &&
        !isPlaybackComplete(clamped, duration)
      ) {
        setListenCompleted(false)
      }
      setPosition(clamped)
      setPositionMs(clamped)
      reportFullPlayerPosition(clamped)
      try {
        await waitForSoundReadyForSeek(active)
        let nativePlaying = false
        try {
          const before = await active.getStatusAsync()
          nativePlaying = before.isLoaded && !!before.isPlaying
        } catch {
          // ignore
        }
        await active.setPositionAsync(clamped)
        lastPlaybackPositionMsRef.current = clamped
        setPosition(clamped)
        const id = useCurrentAudioStore.getState().fullPlayerTrackId
        await saveAudioBookmark(id, clamped, { force: true })
        if (wasPlaying && !nativePlaying) {
          await active.playAsync()
          setIsPlaying(true)
          setPlaying(true)
        }
      } catch (e) {
        if (__DEV__) console.warn("AudioPlayer: seek failed:", e)
        setPosition(lastPlaybackPositionMsRef.current)
      }
    },
    [track, setPlaying, setPositionMs, resolveActivePlaybackDurationMs, setListenCompleted],
  )

  // Completion and navigation are driven only by track end (didJustFinish). No progress threshold
  // affects audio or navigation. 80% is dot-only: mark day complete for homescreen.
  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!metadata) return

      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)

        const metaMs = metadata?.durationMs ?? 0
        const fileMs = status.durationMillis && status.durationMillis > 0 ? status.durationMillis : 0
        if (fileMs > 0) {
          fileDurationMsRef.current = fileMs
        }
        const duration = resolvePlaybackDurationMs({
          fileDurationMs: fileMs,
          catalogDurationMs: metaMs,
        })
        const playing = !!status.isPlaying
        const live = useCurrentAudioStore.getState()
        const endedId = live.fullPlayerTrackId
        const vaultReady =
          !endedId ||
          useSanctuaryVaultStore.getState().readyIds[endedId] === true
        const finishedThisListen =
          !!status.didJustFinish &&
          shouldTreatAsTrackEnd({
            didJustFinish: true,
            vaultReady,
          }) &&
          live.prefs?.shouldLoop !== true
        const fileEndedWithoutFinish =
          !playing &&
          shouldTrustNativeDuration(fileMs, metaMs) &&
          isPlaybackComplete(status.positionMillis, fileMs) &&
          live.prefs?.shouldLoop !== true

        if (playing && status.positionMillis > 1500) {
          setListenCompleted(false)
        }
        if (finishedThisListen || fileEndedWithoutFinish) {
          setListenCompleted(true)
        }

        if (
          shouldHoldSeekTarget({
            seekingUntil: seekingUntilRef.current,
            statusPositionMs: status.positionMillis,
            seekTargetMs: seekTargetMsRef.current,
          })
        ) {
          return
        }
        if (nativeSeekLanded(status.positionMillis, seekTargetMsRef.current)) {
          seekingUntilRef.current = 0
        }

        const sourceUri =
          typeof live.source === "object" &&
          live.source != null &&
          "uri" in live.source
            ? String((live.source as { uri?: string }).uri ?? "")
            : ""
        if (
          shouldReloadGrowingVaultPart({
            vaultReady,
            sourceUri,
            didJustFinish: status.didJustFinish,
            isPlaying: playing,
            positionMs: status.positionMillis,
            nativeDurationMs: fileMs,
          })
        ) {
          growingPartNeedsResumeRef.current = true
          if (endedId) rushSanctuaryTrack(endedId)
          tryReloadGrowingVaultPartRef.current()
        }

        if (finishedThisListen) {
          setJustFinished(true)
        }

        if (
          completedListenRef.current &&
          seekTargetMsRef.current <= 0 &&
          !isLibrarySingleTrack(live.audioOrigin, live.playMode)
        ) {
          lastPlaybackPositionMsRef.current = 0
          reportFullPlayerPosition(0)
          if (endedId) {
            void clearAudioBookmark(endedId)
          }
          const now = Date.now()
          const isFirstStatus = !hasAppliedFirstStatusRef.current
          if (isFirstStatus) {
            hasAppliedFirstStatusRef.current = true
          }
          if (shouldTrustNativeDuration(fileMs, metaMs) && endedId) {
            useEmbodimentDurationCacheStore.getState().setDuration(endedId, fileMs)
          }
          const cacheKey =
            useEmbodimentDurationCacheStore.getState()
              .embodimentDurationCacheKey
          if (cacheKey && shouldTrustNativeDuration(fileMs, metaMs)) {
            useEmbodimentDurationCacheStore.getState().setDuration(cacheKey, fileMs)
            useEmbodimentDurationCacheStore.getState().clearEmbodimentDurationCacheKey()
          }
          lastStatusUpdateTimeRef.current = now
          setPosition(0)
          setPositionMs(0)
          setDuration((prev) =>
            commitPlaybackDurationMs({
              currentMs: prev,
              nextMs: duration,
              fileDurationMs: fileMs,
              catalogDurationMs: metaMs,
            }),
          )
          setPlaying(false)
          lastAppliedStorePlayingRef.current = false
          return
        }

        if (
          isPlaybackPositionRegression(
            status.positionMillis,
            lastPlaybackPositionMsRef.current,
            !!status.didJustFinish,
          )
        ) {
          return
        }

        if (
          status.didJustFinish &&
          !vaultReady &&
          lastPlaybackPositionMsRef.current > status.positionMillis
        ) {
          reportFullPlayerPosition(lastPlaybackPositionMsRef.current)
        } else {
          lastPlaybackPositionMsRef.current = status.positionMillis
          reportFullPlayerPosition(status.positionMillis)
        }

        if (!playing) {
          lastPeriodicBookmarkSaveAtRef.current = 0
        }

        // First loaded status always updates progress bar (no throttle); then throttle to reduce UI flicker (every 500ms)
        const now = Date.now()
        const isFirstStatus = !hasAppliedFirstStatusRef.current
        const shouldUpdateProgress =
          isFirstStatus ||
          status.didJustFinish ||
          playing !== lastAppliedStorePlayingRef.current ||
          now - lastStatusUpdateTimeRef.current >= PROGRESS_UPDATE_INTERVAL_MS
        if (shouldUpdateProgress) {
          if (isFirstStatus) {
            hasAppliedFirstStatusRef.current = true
          }
          const trackId = useCurrentAudioStore.getState().fullPlayerTrackId
          if (shouldTrustNativeDuration(fileMs, metaMs) && trackId) {
            useEmbodimentDurationCacheStore.getState().setDuration(trackId, fileMs)
          }
          const cacheKey =
            useEmbodimentDurationCacheStore.getState()
              .embodimentDurationCacheKey
          if (cacheKey && shouldTrustNativeDuration(fileMs, metaMs)) {
            useEmbodimentDurationCacheStore.getState().setDuration(cacheKey, fileMs)
            useEmbodimentDurationCacheStore.getState().clearEmbodimentDurationCacheKey()
          }
          lastStatusUpdateTimeRef.current = now
          setPosition(status.positionMillis)
          setPositionMs(status.positionMillis)
          setDuration((prev) =>
            commitPlaybackDurationMs({
              currentMs: prev,
              nextMs: duration,
              fileDurationMs: fileMs,
              catalogDurationMs: metaMs,
            }),
          )
        }

        // 80% = dot only: auto-check complete box so chakra shows dot on homescreen. No setCompletedChakra, no navigation.
        if (
          !hasLifetimeAccess &&
          prefs?.isIntroAudio === true &&
          (audioOrigin === "other" || audioOrigin === "full-player") &&
          duration > 0 &&
          status.positionMillis >= 0.8 * duration &&
          !embodimentEightyPercentRef.current
        ) {
          embodimentEightyPercentRef.current = true
          markChakraCompleted(dayIndex)
        }

        setPlaying(playing)
        lastAppliedStorePlayingRef.current = playing

        if (playing && status.positionMillis > 0 && !completedListenRef.current) {
          const stStore = useCurrentAudioStore.getState()
          if (
            !isLibrarySingleTrack(stStore.audioOrigin, stStore.playMode) &&
            stStore.fullPlayerTrackId != null &&
            stStore.fullPlayerTrackId.length > 0
          ) {
            const nowSave = Date.now()
            if (lastPeriodicBookmarkSaveAtRef.current === 0) {
              lastPeriodicBookmarkSaveAtRef.current = nowSave
            } else if (
              nowSave - lastPeriodicBookmarkSaveAtRef.current >=
              AUDIO_BOOKMARK_PERIODIC_SAVE_MS
            ) {
              lastPeriodicBookmarkSaveAtRef.current = nowSave
              const persistMs = Math.max(
                lastPlaybackPositionMsRef.current,
                status.positionMillis,
              )
              void persistResumeBookmark(
                stStore.fullPlayerTrackId,
                persistMs,
                sliderDurationMs(
                  fileDurationMsRef.current,
                  stStore.metadata?.durationMs ?? 0,
                ),
              )
            }
          }
        }
      } else {
        if (status.error) {
          if (__DEV__) {
            console.error("AudioPlayer: Loading error:", status.error)
          }
        }
      }
    },
    [
      metadata,
      setPlaying,
      setPositionMs,
      hasLifetimeAccess,
      prefs?.isIntroAudio,
      audioOrigin,
      dayIndex,
      markChakraCompleted,
      setListenCompleted,
    ],
  )

  const initializeTrack = useCallback(async () => {
    if (!source || !prefs) return
    if (closingRef.current || isClosingFullPlayer()) return
    const myGen = ++initGenerationRef.current
    initializingTrackRef.current = true
    setLoadError(null)

    const abandoned = () =>
      myGen !== initGenerationRef.current ||
      closingRef.current ||
      isClosingFullPlayer() ||
      useCurrentAudioStore.getState().source == null

    const notifyVaultPlaying = () => {
      const playingId =
        useCurrentAudioStore.getState().fullPlayerTrackId ??
        getMusicRoomActiveAudioId()
      notifyRushedTrackPlaying(playingId)
    }

    // Never call createAsync with empty or invalid URI — prevents "sound is not loaded" and crashes
    const hasUri = typeof source === "object" && source !== null && "uri" in source
    const uriStr = hasUri && typeof (source as { uri?: unknown }).uri === "string"
      ? (source as { uri: string }).uri
      : ""
    const uriInvalid = hasUri && (!uriStr || uriStr.trim() === "")
    const isAsset = typeof source === "number"
    if (uriInvalid && !isAsset) {
      setTrack(undefined)
      setIsLoading(false)
      isLoadedRef.current = false
      initializingTrackRef.current = false
      setLoadError("Invalid audio source.")
      return
    }

    try {
      if (__DEV__) {
        await logAllAsyncStorageKeys("initializeTrack")
      }

      stopAnuaAudio().catch(() => {})

      isLoadedRef.current = false
      setIsLoading(true)

      // Let the player shell paint before network / native MediaPlayer init
      await yieldToUiThread()

      if (abandoned()) {
        await silenceAllAudio()
        return
      }

      await configureHealingAudioMode({ background: true })

      const sound = await createSoundAsyncOffUiThread(source, {
        initialStatus: {
          shouldPlay: false,
          isLooping: prefs.shouldLoop || false,
        },
        onPlaybackStatusUpdate,
        androidPreCreateDelayMs: isEmulatorOrSimulator() ? 100 : 50,
        keepPlayingInBackground: true,
        lockScreen: {
          title: metadata?.title || "Awakening Soul",
          artist: metadata?.author || "Meditation",
        },
      })

      if (abandoned()) {
        await silenceAllAudio()
        return
      }

      setTrack(sound)

      await waitForSoundLoaded(sound)

      if (abandoned()) {
        await silenceAllAudio()
        return
      }

      if (isGrowingVaultPartUri(uriStr)) {
        const disk = await vaultPartFileBytes(uriStr)
        const storeBytes =
          useSanctuaryVaultStore.getState().progressByAudioId[
            useCurrentAudioStore.getState().fullPlayerTrackId ?? ""
          ]?.bytesWritten ?? 0
        lastLoadedPartBytesRef.current = Math.max(disk, storeBytes)
      } else {
        lastLoadedPartBytesRef.current = 0
        growingPartNeedsResumeRef.current = false
      }

      const progressIntervalMs = isEmulatorOrSimulator()
        ? 1000
        : PROGRESS_UPDATE_INTERVAL_MS
      await sound.setProgressUpdateIntervalAsync(progressIntervalMs)
      await sound.setIsLoopingAsync(prefs.shouldLoop || false)
      await sound.setVolumeAsync(1)
      await new Promise((resolve) => setTimeout(resolve, 100))

      const status = await sound.getStatusAsync()
      if (abandoned()) {
        await silenceAllAudio()
        return
      }
      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)
        setLoadError(null)
        if (status.durationMillis && status.durationMillis > 0) {
          fileDurationMsRef.current = status.durationMillis
        }
        const state = useCurrentAudioStore.getState()
        const fileMs =
          status.durationMillis && status.durationMillis > 0
            ? status.durationMillis
            : 0
        const catalogMs = state.metadata?.durationMs ?? 0
        const trackId = state.fullPlayerTrackId
        const cachedDuration =
          trackId != null
            ? useEmbodimentDurationCacheStore.getState().getDuration(trackId)
            : undefined
        const skipResume = isLibrarySingleTrack(state.audioOrigin, state.playMode)
        const saved =
          !skipResume && trackId != null
            ? await loadBookmarkPositionMs(trackId)
            : undefined
        const candidate = skipResume
          ? lastPlaybackPositionMsRef.current
          : bestResumeCandidateMs({
              storeMs: state.positionMs,
              bookmarkMs: saved,
              lastPlaybackMs: lastPlaybackPositionMsRef.current,
            })
        const usableDuration = resolvePlaybackDurationMs({
          fileDurationMs: fileMs || cachedDuration,
          catalogDurationMs: catalogMs,
          bookmarkMs: skipResume ? undefined : candidate,
        })
        if (usableDuration > 0) {
          if (shouldTrustNativeDuration(fileMs, catalogMs) && trackId) {
            useEmbodimentDurationCacheStore.getState().setDuration(trackId, fileMs)
          }
          setDuration((prev) =>
            commitPlaybackDurationMs({
              currentMs: prev,
              nextMs: usableDuration,
              fileDurationMs: fileMs || cachedDuration || 0,
              catalogDurationMs: catalogMs,
            }),
          )
        }
        const resumeAt = resumePositionMs(
          candidate > 0 ? candidate : undefined,
          catalogMs,
          fileMs || cachedDuration,
        )
        if (abandoned()) {
          await silenceAllAudio()
          return
        }
        if (resumeAt > 0) {
          const clamped = clampSeekMs(
            resumeAt,
            usableDuration > 0 ? usableDuration : resumeAt,
          )
          seekingUntilRef.current = Date.now() + 6000
          seekTargetMsRef.current = clamped
          await waitForSoundReadyForSeek(sound)
          await sound.setPositionAsync(clamped)
          lastPlaybackPositionMsRef.current = clamped
          setPosition(clamped)
          setPositionMs(clamped)
          if (abandoned()) {
            await silenceAllAudio()
            return
          }
          await sound.playAsync()
          if (Platform.OS === "android") {
            await sound.setVolumeAsync(1)
          }
          setIsPlaying(true)
          setPlaying(true)
          notifyVaultPlaying()
        } else {
          if (abandoned()) {
            await silenceAllAudio()
            return
          }
          await sound.playAsync()
          if (Platform.OS === "android") {
            await sound.setVolumeAsync(1)
          }
          setIsPlaying(true)
          setPlaying(true)
          notifyVaultPlaying()
        }
      } else {
        setIsLoading(true)
      }
    } catch (error) {
      if (__DEV__) {
        console.error("AudioPlayer: Error creating sound:", error)
      }
      try {
        const { captureException } = require("@/src/services/sentry")
        captureException(
          error instanceof Error ? error : new Error(String(error)),
          { component: "AudioPlayer", operation: "initializeTrack" },
        )
      } catch (_) {
        // Never let Sentry cause a crash
      }
      setTrack(undefined)
      setIsPlaying(false)
      setIsLoading(false)
      isLoadedRef.current = false
      const msg =
        error instanceof Error
          ? error.message
          : String(error)
      if (closingRef.current || /replaced by another track/i.test(msg)) {
        return
      }
      const friendly =
        msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")
          ? "Unable to load audio. Check your connection and try again."
          : "Unable to load audio. Try again or close."
      setLoadError(friendly)
    } finally {
      initializingTrackRef.current = false
    }
  }, [onPlaybackStatusUpdate, source, prefs, metadata])

  const tryReloadGrowingVaultPart = useCallback(() => {
    if (growingPartReloadingRef.current) return
    if (Date.now() - growingPartReloadAtRef.current < GROWING_PART_RELOAD_DEBOUNCE_MS) {
      return
    }
    const live = useCurrentAudioStore.getState()
    const id = live.fullPlayerTrackId
    if (!id) return
    if (useSanctuaryVaultStore.getState().readyIds[id] === true) {
      growingPartNeedsResumeRef.current = false
      return
    }
    const uri =
      typeof live.source === "object" &&
      live.source != null &&
      "uri" in live.source
        ? String((live.source as { uri?: string }).uri ?? "")
        : ""
    if (!isGrowingVaultPartUri(uri)) return

    growingPartReloadingRef.current = true
    growingPartReloadAtRef.current = Date.now()
    const pos = lastPlaybackPositionMsRef.current
    void (async () => {
      try {
        const storeBytes =
          useSanctuaryVaultStore.getState().progressByAudioId[id]
            ?.bytesWritten ?? 0
        const diskBytes = await vaultPartFileBytes(uri)
        const currentBytes = Math.max(storeBytes, diskBytes)
        if (
          !growingPartHasEnoughNewBytes(
            currentBytes,
            lastLoadedPartBytesRef.current,
          )
        ) {
          return
        }
        const resumeMs = Math.max(pos, lastPlaybackPositionMsRef.current)
        live.setPositionMs(resumeMs)
        void persistResumeBookmark(id, resumeMs, live.metadata?.durationMs ?? 0)
        const next = await handoffExclusiveSound(
          { uri: toAbsoluteFileUri(uri) },
          {
            positionMs: resumeMs,
            minDurationMs: growingPartHandoffMinDurationMs(resumeMs),
            onPlaybackStatusUpdate,
            keepPlayingInBackground: true,
            isLooping: live.prefs?.shouldLoop === true,
            lockScreen: {
              title: live.metadata?.title || "Awakening Soul",
              artist: live.metadata?.author || "Meditation",
            },
          },
        )
        if (!next) return
        trackRef.current = next
        setTrack(next)
        lastLoadedPartBytesRef.current = currentBytes
        growingPartNeedsResumeRef.current = false
        isLoadedRef.current = true
        setIsLoading(false)
        setIsPlaying(true)
        setPlaying(true)
      } finally {
        growingPartReloadingRef.current = false
      }
    })()
  }, [onPlaybackStatusUpdate, setPlaying])

  tryReloadGrowingVaultPartRef.current = tryReloadGrowingVaultPart

  // Download finished while still on a `.part`: hand off to the final local file
  // at the current place, then this listen is a normal start-to-finish player.
  useEffect(() => {
    if (!fullPlayerTrackId || !vaultTrackComplete || !source || !isPlaying) return
    const uri =
      typeof source === "object" && source !== null && "uri" in source
        ? String((source as { uri?: string }).uri ?? "")
        : ""
    if (!isGrowingVaultPartUri(uri)) {
      growingPartNeedsResumeRef.current = false
      return
    }
    if (growingPartReloadingRef.current) return
    growingPartReloadingRef.current = true
    const trackId = fullPlayerTrackId
    const pos = lastPlaybackPositionMsRef.current
    void (async () => {
      try {
        const finalUri = await peekSanctuaryTrack(trackId)
        if (!finalUri || isGrowingVaultPartUri(finalUri)) return
        if (useCurrentAudioStore.getState().fullPlayerTrackId !== trackId) return
        const resumeMs = Math.max(pos, lastPlaybackPositionMsRef.current)
        const abs = toAbsoluteFileUri(finalUri)
        const live = useCurrentAudioStore.getState()
        const next = await handoffExclusiveSound(
          { uri: abs },
          {
            positionMs: resumeMs,
            minDurationMs: resumeMs + 1000,
            onPlaybackStatusUpdate,
            keepPlayingInBackground: true,
            isLooping: live.prefs?.shouldLoop === true,
            lockScreen: {
              title: live.metadata?.title || "Awakening Soul",
              artist: live.metadata?.author || "Meditation",
            },
          },
        )
        if (!next) return
        if (useCurrentAudioStore.getState().fullPlayerTrackId !== trackId) return
        trackRef.current = next
        setTrack(next)
        growingPartNeedsResumeRef.current = false
        lastLoadedPartBytesRef.current = 0
        lastSourceSignatureRef.current = getSourceSignature({ uri: abs })
        if (live.audioOrigin === "music-room") {
          live.applyMusicRoomTrack(live.musicRoomIndex, { uri: abs })
          live.setPositionMs(resumeMs)
          return
        }
        live.setSource(
          { uri: abs },
          "full-player",
          {
            resumePositionMs: resumeMs,
            fullPlayerTrackId: live.fullPlayerTrackId,
          },
        )
      } finally {
        growingPartReloadingRef.current = false
      }
    })()
  }, [
    vaultTrackComplete,
    fullPlayerTrackId,
    source,
    isPlaying,
    onPlaybackStatusUpdate,
  ])

  useEffect(() => {
    if (vaultTrackComplete) return
    const timer = setInterval(() => {
      if (growingPartNeedsResumeRef.current) {
        tryReloadGrowingVaultPart()
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [vaultTrackComplete, tryReloadGrowingVaultPart])

  // Unload track when store is reset (e.g. mini player Close)
  useEffect(() => {
    if (closingRef.current || allowLeaveRef.current || isClosingFullPlayer()) {
      return
    }
    if (!source && track) {
      track
        .unloadAsync()
        .catch(
          (e) => __DEV__ && console.warn("AudioPlayer: Unload on reset:", e),
        )
      setTrack(undefined)
      setIsPlaying(false)
      setIsLoading(false)
      isLoadedRef.current = false
    }
  }, [source, track])

  // On leave: do NOT stop/unload the track so that opening Notes (or any overlay) keeps playback
  // and returning to this screen shows the same track. Stop+unload only when leaving (X or Android back via beforeRemove).
  // Android: hardware back from this screen is handled below via BackHandler → requestLeavePlayer.
  useFocusEffect(
    useCallback(() => {
      setFocusKey((k) => k + 1)
      const clearReturnedFromNotesTimer = setTimeout(() => {
        justReturnedFromNotesRef.current = false
      }, 450)
      return () => {
        clearTimeout(clearReturnedFromNotesTimer)
        const state = useCurrentAudioStore.getState()
        const isFullPlayerOrOther =
          state.audioOrigin === "full-player" ||
          state.audioOrigin === "other"
        if (!isFullPlayerOrOther) return
        stopAnuaAudio().catch(() => {})
        // Do not stop/unload track on blur — keeps playback when user opens Notes Along the Way (or other overlay).
      }
    }, []),
  )

  /** Teardown audio before leaving; navigation is dispatched after cleanup in beforeRemove. */
  const teardownPlayerForLeave = useCallback(async () => {
    if (closingRef.current) {
      await closeFullPlayerAndLeave({
        positionMs: lastPlaybackPositionMsRef.current,
        seekTargetMs: seekTargetMsRef.current,
        durationMs: fileDurationMsRef.current,
        listenCompleted: completedListenRef.current,
        navigate: false,
      })
      return
    }
    closingRef.current = true
    initializingTrackRef.current = false
    initGenerationRef.current += 1
    const storeSnapshot = useCurrentAudioStore.getState()
    const returnPath =
      storeSnapshot.playerReturnPath ??
      (storeSnapshot.audioOrigin === "music-room"
        ? "/(chakras)/AudioLibrary"
        : null)
    pinRecoveryRoute(returnPath)
    stopAnuaAudio().catch(() => {})
    try {
      if (trackRef.current) {
        try {
          await trackRef.current.stopAsync()
          await trackRef.current.unloadAsync()
        } catch {
          // best-effort before global silence
        }
        trackRef.current = null
      }
    } catch {
      // never block leave on teardown errors
    }
    setTrack(undefined)
    setIsPlaying(false)
    setIsLoading(false)
    isLoadedRef.current = false
    await closeFullPlayerAndLeave({
      positionMs: lastPlaybackPositionMsRef.current,
      seekTargetMs: seekTargetMsRef.current,
      durationMs: fileDurationMsRef.current,
      listenCompleted: completedListenRef.current,
      navigate: false,
    })
  }, [])

  /** X button, hardware back, and stack pop all route through beforeRemove. */
  const requestLeavePlayer = useCallback(() => {
    if (allowLeaveRef.current || closingRef.current) {
      return
    }
    const origin = useCurrentAudioStore.getState().audioOrigin
    const returnPath =
      useCurrentAudioStore.getState().playerReturnPath ??
      (origin === "music-room" ? "/(chakras)/AudioLibrary" : null)
    pinRecoveryRoute(returnPath)
    if (router.canGoBack()) {
      router.back()
      return
    }
    if (returnPath) {
      void teardownPlayerForLeave().finally(() => {
        allowLeaveRef.current = true
        router.replace(returnPath as never)
      })
      return
    }
    void teardownPlayerForLeave().finally(() => {
      allowLeaveRef.current = true
      router.replace("/(chakras)/ChakraHub")
    })
  }, [router, teardownPlayerForLeave])

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current) return
      e.preventDefault()
      void (async () => {
        try {
          await teardownPlayerForLeave()
        } finally {
          allowLeaveRef.current = true
          navigation.dispatch(e.data.action)
        }
      })()
    })
    return unsub
  }, [navigation, teardownPlayerForLeave])

  // Android: hardware back must stop and unload audio, then navigate. When we just returned from Notes, ignore one back so we don't close the player.
  useFocusEffect(
    useCallback(() => {
      allowLeaveRef.current = false
      if (Platform.OS !== "android") return
      return registerAndroidHardwareBackOverride(() => {
        if (justReturnedFromNotesRef.current) {
          justReturnedFromNotesRef.current = false
          return true
        }
        requestLeavePlayer()
        return true
      })
    }, [requestLeavePlayer]),
  )

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background" || next === "inactive") {
        const live = useCurrentAudioStore.getState()
        if (isLibrarySingleTrack(live.audioOrigin, live.playMode)) return
        const id = live.fullPlayerTrackId
        const pos = Math.max(
          lastPlaybackPositionMsRef.current,
          live.positionMs,
          seekTargetMsRef.current,
        )
        void persistResumeBookmark(
          id,
          pos,
          sliderDurationMs(
            fileDurationMsRef.current,
            live.metadata?.durationMs ?? 0,
          ),
          { listenCompleted: completedListenRef.current },
        )
        return
      }
      if (next !== "active") return
      void (async () => {
        const live = useCurrentAudioStore.getState()
        if (isLibrarySingleTrack(live.audioOrigin, live.playMode)) return
        const id = live.fullPlayerTrackId
        const active = trackRef.current
        if (!id || !active || closingRef.current) return
        if (completedListenRef.current) return
        const bookmark = await loadBookmarkPositionMs(id)
        const known = Math.max(
          lastPlaybackPositionMsRef.current,
          useCurrentAudioStore.getState().positionMs,
          seekTargetMsRef.current,
          bookmark ?? 0,
        )
        if (known < 3000) return
        try {
          const st = await active.getStatusAsync()
          if (!st.isLoaded) return
          if (
            !isPlaybackPositionRegression(
              st.positionMillis,
              known,
              !!st.didJustFinish,
            )
          ) {
            return
          }
          seekingUntilRef.current = Date.now() + 6000
          seekTargetMsRef.current = known
          lastPlaybackPositionMsRef.current = known
          setPosition(known)
          setPositionMs(known)
          await waitForSoundReadyForSeek(active)
          const wantPlaying =
            !!st.isPlaying || useCurrentAudioStore.getState().isPlaying
          await active.setPositionAsync(known)
          let nativePlaying = false
          try {
            const after = await active.getStatusAsync()
            nativePlaying = after.isLoaded && !!after.isPlaying
          } catch {
            nativePlaying = false
          }
          if (wantPlaying && !nativePlaying) {
            await active.playAsync()
            setIsPlaying(true)
            setPlaying(true)
          }
          await saveAudioBookmark(id, known, { force: true })
        } catch (e) {
          if (__DEV__) console.warn("AudioPlayer: foreground resync failed:", e)
        }
      })()
    })
    return () => sub.remove()
  }, [setPositionMs, setPlaying])

  const storeIsPlaying = useCurrentAudioStore((state) => state.isPlaying)

  // AudioPlayer never routes to goodbye. Only mark day complete and close/back. Goodbye is shown only by the course page (ChakraHome).
  useEffect(() => {
    if (!prefs) return

    if (!prefs.shouldLoop && justFinished) {
      setJustFinished(false)
      const finished = useCurrentAudioStore.getState()
      setListenCompleted(true)
      if (!isLibrarySingleTrack(finished.audioOrigin, finished.playMode)) {
        void clearAudioBookmark(finished.fullPlayerTrackId)
      }
      lastPlaybackPositionMsRef.current = 0
      reportFullPlayerPosition(0)
      finished.setPositionMs(0)
      seekToPosition(0)
      track?.pauseAsync()
      setIsPlaying(false)
      setPlaying(false)
    }
  }, [justFinished, seekToPosition, track, prefs, setListenCompleted])

  // Re-initialize only when the source URI changes. Do not re-init on focus
  // (Notes overlay) or prefs object identity — that snaps the slider to 0 and
  // can create a second Sound.
  useEffect(() => {
    if (!source || !prefs) return
    if (closingRef.current) return

    const sig = getSourceSignature(source)
    const sourceChanged = lastSourceSignatureRef.current !== sig
    if (sourceChanged) {
      lastSourceRef.current = source
      lastSourceSignatureRef.current = sig
      lastAppliedStorePlayingRef.current = null
      embodimentEightyPercentRef.current = false
      hasAppliedFirstStatusRef.current = false
      lastPeriodicBookmarkSaveAtRef.current = 0
      fileDurationMsRef.current = 0
      setListenCompleted(false)
      setLoadError(null)
    }

    const runInit = async () => {
      if (sourceChanged) {
        const live = useCurrentAudioStore.getState()
        const id = live.fullPlayerTrackId
        if (!isLibrarySingleTrack(live.audioOrigin, live.playMode)) {
          const saved = id ? await loadBookmarkPositionMs(id) : undefined
          const cached = id
            ? useEmbodimentDurationCacheStore.getState().getDuration(id)
            : undefined
          const resumePos = resumePositionMs(
            bestResumeCandidateMs({
              storeMs: live.positionMs,
              bookmarkMs: saved,
              lastPlaybackMs: lastPlaybackPositionMsRef.current,
            }),
            live.metadata?.durationMs ?? 0,
            cached,
          )
          if (resumePos > 0) {
            lastPlaybackPositionMsRef.current = resumePos
            setPosition(resumePos)
            setPositionMs(resumePos)
          } else {
            lastPlaybackPositionMsRef.current = 0
            setPosition(0)
            setPositionMs(0)
          }
        } else if (lastPlaybackPositionMsRef.current <= 0) {
          setPosition(0)
          setPositionMs(0)
        }
      }

      if (audioOrigin === "other") {
        const ref = otherOriginTrackRef.current
        const handoffSig = getSourceSignature(source)
        if (ref && ref.sourceSignature === handoffSig) {
          otherOriginTrackRef.current = null
          setTrack(ref.sound)
          try {
            const status = await ref.sound.getStatusAsync()
            if (status.isLoaded) {
              isLoadedRef.current = true
              setIsLoading(false)
              setIsPlaying(status.isPlaying)
              lastPlaybackPositionMsRef.current = status.positionMillis
              setPosition(status.positionMillis)
              if (status.durationMillis) {
                fileDurationMsRef.current = status.durationMillis
                const catalogMs =
                  useCurrentAudioStore.getState().metadata?.durationMs ?? 0
                setDuration((prev) =>
                  commitPlaybackDurationMs({
                    currentMs: prev,
                    nextMs: status.durationMillis,
                    fileDurationMs: status.durationMillis,
                    catalogDurationMs: catalogMs,
                  }),
                )
              }
            }
          } catch (e) {
            if (__DEV__) console.warn("AudioPlayer: getStatusAsync (other) failed:", e)
            setIsLoading(true)
          }
          return
        }
      }

      if (sourceChanged) {
        initGenerationRef.current += 1
        if (trackRef.current) {
          try {
            await trackRef.current.stopAsync()
            await trackRef.current.unloadAsync()
          } catch {
            // best-effort before next track
          }
          trackRef.current = undefined
          setTrack(undefined)
          isLoadedRef.current = false
        }
      } else if (initializingTrackRef.current) {
        return
      }

      setIsLoading(true)
      await yieldToUiThread()
      await initializeTrack()
    }

    if (!trackRef.current || sourceChanged) {
      void runInit()
    }
  }, [source, audioOrigin, initializeTrack, prefs])

  // When mini player toggles play/pause for "other", apply to our track (ignore initial/self updates)
  useEffect(() => {
    if (audioOrigin !== "other" || !track) return
    if (lastAppliedStorePlayingRef.current === storeIsPlaying) return
    lastAppliedStorePlayingRef.current = storeIsPlaying
    if (storeIsPlaying) {
      track.playAsync().then(() => setIsPlaying(true))
    } else {
      track.pauseAsync().then(() => setIsPlaying(false))
    }
  }, [audioOrigin, storeIsPlaying, track])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (controlsHideTimerRef.current) {
      clearTimeout(controlsHideTimerRef.current)
      controlsHideTimerRef.current = null
    }
    controlsHideTimerRef.current = setTimeout(() => {
      setControlsVisible(false)
      controlsHideTimerRef.current = null
    }, CONTROLS_HIDE_DELAY_MS)
  }, [])

  const handleRestart = useCallback(() => {
    showControls()
    addHapticFeedback(HapticStrength.Light)
    const live = useCurrentAudioStore.getState()
    if (!isLibrarySingleTrack(live.audioOrigin, live.playMode)) {
      void clearAudioBookmark(live.fullPlayerTrackId)
    }
    lastPlaybackPositionMsRef.current = 0
    seekToPosition(0, isPlaying)
  }, [showControls, seekToPosition, isPlaying])

  const bottomBarOpacity = useSharedValue(1)
  const trackContentOpacity = useSharedValue(1)
  const trackBarTranslateY = useSharedValue(0)
  useEffect(() => {
    const duration =
      Platform.OS === "ios" ? 420 : 300
    bottomBarOpacity.value = withTiming(controlsVisible ? 1 : 0, {
      duration,
    })
  }, [controlsVisible, bottomBarOpacity])

  const pulseTrackTransition = useCallback(() => {
    trackContentOpacity.value = withTiming(0.35, { duration: 120 })
    trackBarTranslateY.value = withTiming(36, { duration: 140 }, () => {
      trackBarTranslateY.value = withSpring(0, {
        damping: 16,
        stiffness: 220,
      })
    })
    trackContentOpacity.value = withTiming(1, { duration: 260 })
  }, [trackContentOpacity, trackBarTranslateY])

  const musicRoomTransitionMountedRef = useRef(false)
  useEffect(() => {
    if (!isMusicRoomPlaylist) return
    if (!musicRoomTransitionMountedRef.current) {
      musicRoomTransitionMountedRef.current = true
      return
    }
    pulseTrackTransition()
  }, [musicRoomIndex, fullPlayerTrackId, isMusicRoomPlaylist, pulseTrackTransition])

  const animatedBottomBarStyle = useAnimatedStyle(() => ({
    opacity: bottomBarOpacity.value,
    transform: [{ translateY: trackBarTranslateY.value }],
  }))

  const animatedTrackContentStyle = useAnimatedStyle(() => ({
    opacity: trackContentOpacity.value,
  }))

  // On mobile: start hide timer after open so controls fade when idle
  useEffect(() => {
    if (Platform.OS !== "web") {
      const t = setTimeout(
        () => setControlsVisible(false),
        CONTROLS_HIDE_DELAY_MS,
      )
      return () => clearTimeout(t)
    }
  }, [])

  const performClose = useCallback(() => {
    requestLeavePlayer()
  }, [requestLeavePlayer])

  const handleCloseX = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    performClose()
  }, [performClose])

  const handleCloseXNoSource = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    performClose()
  }, [performClose])

  const handleBottomBarPress = useCallback(() => {
    showControls()
  }, [showControls])

  const handleControlPress = useCallback(
    (fn: () => void | Promise<void>) => {
      showControls()
      fn()
    },
    [showControls],
  )

  // NOW we can check for missing data and return early
  // All hooks have been declared above, so React's hook order is preserved

  if (source && metadata && prefs && loadError) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ActionBar
          useXButton={true}
          xButtonPosition="left"
          onXPress={handleCloseXNoSource}
        />
        <HeadsetListenReminder />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
        >
          <AppText
            font="instrument-regular"
            size="lg"
            className="text-white text-center"
          >
            {loadError}
          </AppText>
          <View style={{ flexDirection: "row", marginTop: 24, gap: 16 }}>
            <Pressable
              onPress={() => {
                setLoadError(null)
                initializeTrack()
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 12,
              }}
            >
              <AppText font="instrument-regular" size="base" style={{ color: "#fff" }}>
                Retry
              </AppText>
            </Pressable>
            <Pressable
              onPress={handleCloseXNoSource}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
              }}
            >
              <AppText font="instrument-regular" size="base" style={{ color: "#fff" }}>
                Close
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  if (!source || !metadata || !prefs) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ActionBar
          useXButton={true}
          xButtonPosition="left"
          onXPress={handleCloseXNoSource}
        />
        <HeadsetListenReminder />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {storeChakraColor != null && !showNoAudioMessage && (
            <View style={{ marginBottom: 20, alignItems: "center" }}>
              <SoftChakraBall
                source={getChakraImage(dayIndex)}
                size={56}
                opacity={0.85}
              />
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 8,
                }}
              >
                {getChakraName(dayIndex)}
              </AppText>
            </View>
          )}
          {showNoAudioMessage && !fullPlayerTrackId ? (
            <AppText
              font="instrument-regular"
              size="base"
              className="text-white text-center px-4"
            >
              No audio selected. Please select an audio file to play.
            </AppText>
          ) : (
            <VaultFirstLoadPanel
              title={metadata?.title}
              audioId={fullPlayerTrackId}
              durationMs={metadata?.durationMs}
            />
          )}
          <Pressable
            onPress={handleCloseXNoSource}
            style={{
              marginTop: 24,
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 12,
            }}
          >
            <AppText
              font="instrument-regular"
              size="base"
              style={{ color: "#fff" }}
            >
              Close
            </AppText>
          </Pressable>
        </View>
      </View>
    )
  }

  async function togglePlayPause() {
    if (!track) {
      await initializeTrack()
    } else if (isPlaying) {
      await track.pauseAsync()
      setIsPlaying(false)
      setPlaying(false)
      const live = useCurrentAudioStore.getState()
      await persistResumeBookmark(
        live.fullPlayerTrackId,
        lastPlaybackPositionMsRef.current || positionMs,
        sliderDurationMs(
          fileDurationMsRef.current,
          live.metadata?.durationMs ?? 0,
        ),
        { listenCompleted: completedListenRef.current },
      )
    } else {
      if (isLoadedRef.current) {
        await track.playAsync()
        setIsPlaying(true)
        setPlaying(true)
      } else {
        setIsLoading(true)
      }
    }
  }

  const rewind10 = async () => {
    if (!track) return
    const next = Math.max((lastPlaybackPositionMsRef.current || positionMs) - 10000, 0)
    await seekToPosition(next, isPlaying)
  }

  const forward10 = async () => {
    if (!track) return
    const duration = resolveActivePlaybackDurationMs()
    const next = Math.min(
      (lastPlaybackPositionMsRef.current || positionMs) + 10000,
      duration,
    )
    await seekToPosition(next, isPlaying)
  }

  const playerBody = (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {playerFieldTrackKind != null && playerFieldDayIndex != null ? (
        <MusicRoomPlayerFieldLayer
          dayIndex={playerFieldDayIndex}
          trackKind={playerFieldTrackKind}
        />
      ) : null}

      <ActionBar
        useXButton={true}
        xButtonPosition="left"
        onXPress={handleCloseX}
      />
      <HeadsetListenReminder />

      <Pressable
        style={{ flex: 1 }}
        onPress={handleBottomBarPress}
        onPointerEnter={
          Platform.OS === "web" ? handleBottomBarPress : undefined
        }
        onPointerLeave={
          Platform.OS === "web"
            ? () => {
                if (controlsHideTimerRef.current) {
                  clearTimeout(controlsHideTimerRef.current)
                }
                setControlsVisible(false)
              }
            : undefined
        }
      >
        <PlayerTrackFace
          dayIndex={dayIndex}
          title={metadata.title}
          author={metadata.author}
          isLoading={isLoading}
          audioId={fullPlayerTrackId}
          embodimentPulse={
            isPlaying &&
            (prefs?.isIntroAudio === true ||
              playerFieldTrackKind === "crystal_bowl")
          }
          animatedStyle={animatedTrackContentStyle}
        />
      </Pressable>

      {/* Bottom bar - play/pause, slider */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: 100,
          paddingHorizontal: 24,
          paddingBottom:
            Math.max(insets.bottom, 24) +
            (Platform.OS === "android" ? 24 : 0),
          paddingTop: 20,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
        }}
      >
        <Animated.View style={[{ width: "100%" }, animatedBottomBarStyle]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <PlayerProgressBar
                durationMs={durationMs}
                positionMs={positionMs}
                seekToPosition={async (ms) => {
                  showControls()
                  await seekToPosition(ms, isPlaying)
                }}
              />
            </View>
            <Pressable
              onPress={handleRestart}
              hitSlop={TOUCH.hitSlop}
              style={{ padding: 8 }}
              accessibilityLabel="Restart from beginning"
              accessibilityHint="Starts the track over from the beginning"
            >
              <Ionicons
                name="refresh"
                size={22}
                color="rgba(255,255,255,0.9)"
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: ICON.controlsGap,
            }}
          >
            <TouchableHighlight
              style={{ padding: 8 }}
              onPress={() => handleControlPress(rewind10)}
              underlayColor="transparent"
              activeOpacity={Platform.OS === "ios" ? 0.72 : 1}
            >
              <Rewind10
                width={ICON.skipControl}
                height={ICON.skipControl}
                color="white"
              />
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => handleControlPress(togglePlayPause)}
              underlayColor="transparent"
              activeOpacity={Platform.OS === "ios" ? 0.72 : 1}
              style={{
                width: ICON.playPauseCircle,
                height: ICON.playPauseCircle,
                borderRadius: ICON.playPauseCircle / 2,
                borderWidth: 1,
                borderColor: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={ICON.playPauseIcon}
                color="white"
                style={!isPlaying ? { marginLeft: 2 } : undefined}
              />
            </TouchableHighlight>
            <TouchableHighlight
              style={{ padding: 8 }}
              onPress={() => handleControlPress(forward10)}
              underlayColor="transparent"
              activeOpacity={Platform.OS === "ios" ? 0.72 : 1}
            >
              <Forward10
                width={ICON.skipControl}
                height={ICON.skipControl}
                color="white"
              />
            </TouchableHighlight>
          </View>
        </Animated.View>
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 12,
          bottom:
            112 +
            Math.max(insets.bottom, 24) +
            (Platform.OS === "android" ? 24 : 0),
          zIndex: 20,
        }}
      >
        <NotesLeafButton
          whisperOnFirstOpen
          whisperPlacement="above"
          onPress={() => {
            justReturnedFromNotesRef.current = true
            router.push(`/(chakras)/NotesAlongTheWay?contextDay=${dayIndex}`)
          }}
        />
      </View>
    </View>
  )

  return playerBody
}

export default function AudioPlayerScreen() {
  return (
    <ScreenCrashBoundary>
      <AudioPlayer />
    </ScreenCrashBoundary>
  )
}
