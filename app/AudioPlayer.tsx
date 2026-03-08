import { ActionBar } from "@/components/ActionBar"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  View,
  TouchableHighlight,
  Pressable,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import {
  Audio,
  AVPlaybackStatus,
  AVPlaybackSource,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from "expo-av"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { Ionicons, Feather } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { PlayerProgressBar } from "@/components/chakras/PlayerProgressBar"
import { PulsingChakraBall } from "@/components/chakras/PulsingChakraBall"
import { JourneyNotesView } from "@/components/chakras/JourneyNotesView"
import { getChakraImage } from "@/constants/chakras/chakraConstants"
import Rewind10 from "@/assets/svg/rewind10.svg"
import Forward10 from "@/assets/svg/forward10.svg"
import { stopAnuaAudio } from "@/src/services/elevenlabs"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { ICON } from "@/constants/layout"
import { isEmulatorOrSimulator } from "@/constants/emulator"
import {
  otherOriginTrackRef,
  getSourceSignature,
} from "@/src/services/otherOriginTrackRef"
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet"

const FALLBACK_DAY_INDEX = 5 // Third Eye

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
  const insets = useSafeAreaInsets()
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const markChakraCompleted = useChakraJourneyStore(
    (s) => s.markChakraCompleted,
  )
  const source = useCurrentAudioStore((state) => state.source)
  const metadata = useCurrentAudioStore((state) => state.metadata)
  const prefs = useCurrentAudioStore((state) => state.prefs)
  const audioOrigin = useCurrentAudioStore((state) => state.audioOrigin)
  const reset = useCurrentAudioStore((state) => state.reset)
  const setPlaying = useCurrentAudioStore((state) => state.setPlaying)
  const storeChakraColor = useCurrentAudioStore((state) => state.chakraColor)
  const dayIndex =
    storeChakraColor &&
    CHAKRA_COLOR_TO_DAY_INDEX[storeChakraColor] !== undefined
      ? CHAKRA_COLOR_TO_DAY_INDEX[storeChakraColor]
      : metadata
        ? parseHzToDayIndex(metadata)
        : FALLBACK_DAY_INDEX

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // This ensures React hooks are always called in the same order on every render
  const [track, setTrack] = useState<Audio.Sound>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [positionMs, setPosition] = useState(0)
  const [durationMs, setDuration] = useState<number>(metadata?.durationMs || 0)
  const [justFinished, setJustFinished] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false)
  const [showNoAudioMessage, setShowNoAudioMessage] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notesSheetOpenKey, setNotesSheetOpenKey] = useState(0)
  const notesSheetRef = useRef<BottomSheetModal>(null)
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
  const trackRef = useRef<Audio.Sound | undefined>(undefined)
  /** Reset when source/track changes so first loaded status always updates progress bar (no throttle). */
  const hasAppliedFirstStatusRef = useRef(false)

  useEffect(() => {
    trackRef.current = track
    hasAppliedFirstStatusRef.current = false
    return () => {
      trackRef.current = undefined
    }
  }, [track])

  // When store is empty, wait briefly before showing "No audio selected" so delayed setSourceWithPlaylist (180ms) can run
  useEffect(() => {
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
  }, [source, metadata, prefs])

  // Sync duration from metadata when we have source so progress bar shows total even before first status (e.g. Android durationMillis delay)
  useEffect(() => {
    if (!source || !metadata?.durationMs) return
    setDuration((prev) =>
      metadata.durationMs && metadata.durationMs > 0 && prev === 0
        ? metadata.durationMs
        : prev,
    )
  }, [source, metadata?.durationMs])

  // Define callbacks - safe to call even if source/metadata/prefs are null
  const seekToPosition = useCallback(
    async (newPositionMs: number, wasPlaying?: boolean) => {
      if (track) {
        await track.setPositionAsync(newPositionMs)
        setPosition(newPositionMs)
        if (Platform.OS === "android" && wasPlaying) {
          await track.playAsync()
          setIsPlaying(true)
          setPlaying(true)
        }
      }
    },
    [track, setPlaying],
  )

  // Completion and navigation are driven only by track end (didJustFinish). No progress threshold
  // affects audio or navigation. 80% is dot-only: mark day complete for homescreen.
  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!metadata) return

      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)

        // Hero duration guard: when metadata says long track (e.g. Master Embodiment 30–44 min) and file reports much shorter (e.g. 6:15), prefer metadata so UI never shows truncated duration
        const metaMs = metadata?.durationMs ?? 0
        const fileMs = status.durationMillis && status.durationMillis > 0 ? status.durationMillis : 0
        const TEN_MIN_MS = 10 * 60 * 1000
        const duration =
          metaMs >= TEN_MIN_MS && fileMs > 0 && fileMs < 0.6 * metaMs
            ? metaMs
            : fileMs > 0
              ? fileMs
              : metaMs || 0
        const playing = !!status.isPlaying

        // First loaded status always updates progress bar (no throttle); then throttle to reduce UI flicker (every 500ms)
        const now = Date.now()
        const isFirstStatus = !hasAppliedFirstStatusRef.current
        const shouldUpdateProgress =
          isFirstStatus ||
          status.didJustFinish ||
          playing !== lastAppliedStorePlayingRef.current ||
          now - lastStatusUpdateTimeRef.current >= PROGRESS_UPDATE_INTERVAL_MS
        if (shouldUpdateProgress) {
          if (isFirstStatus) hasAppliedFirstStatusRef.current = true
          lastStatusUpdateTimeRef.current = now
          setPosition(status.positionMillis)
          setDuration(duration)
        }

        if (status.didJustFinish) {
          setJustFinished(true)
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
      hasLifetimeAccess,
      prefs?.isIntroAudio,
      audioOrigin,
      dayIndex,
      markChakraCompleted,
    ],
  )

  const initializeTrack = useCallback(async () => {
    if (!source || !prefs) return
    if (initializingTrackRef.current) return
    initializingTrackRef.current = true
    setLoadError(null)

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
      stopAnuaAudio().catch(() => {})

      isLoadedRef.current = false
      setIsLoading(true)

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        ...(Platform.OS === "android" && { playThroughEarpieceAndroid: false }),
      })
      if (Platform.OS === "android") {
        const delayMs = isEmulatorOrSimulator() ? 100 : 50
        await new Promise((r) => setTimeout(r, delayMs))
      }

      const { sound } = await Audio.Sound.createAsync(
        source,
        {
          shouldPlay: false,
          isLooping: prefs.shouldLoop || false,
          ...(Platform.OS === "android" && { androidImplementation: "MediaPlayer" }),
        },
        onPlaybackStatusUpdate,
      )

      setTrack(sound)
      const progressIntervalMs = isEmulatorOrSimulator()
        ? 1000
        : PROGRESS_UPDATE_INTERVAL_MS
      await sound.setProgressUpdateIntervalAsync(progressIntervalMs)
      await sound.setIsLoopingAsync(prefs.shouldLoop || false)
      await sound.setVolumeAsync(1)
      await new Promise((resolve) => setTimeout(resolve, 100))

      const status = await sound.getStatusAsync()
      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)
        setLoadError(null)
        await sound.playAsync()
        if (Platform.OS === "android") {
          await sound.setVolumeAsync(1)
        }
        setIsPlaying(true)
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
      const friendly =
        msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")
          ? "Unable to load audio. Check your connection and try again."
          : "Unable to load audio. Try again or close."
      setLoadError(friendly)
    } finally {
      initializingTrackRef.current = false
    }
  }, [onPlaybackStatusUpdate, source, prefs])

  // Unload track when store is reset (e.g. mini player Close)
  useEffect(() => {
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

  // Only stop on user leave (screen revert). Trial: stop when leaving. Lifetime + non-intro: mini player continues.
  // CRITICAL: Await stop+unload before reset() so the track is actually stopped. Prevents two audios at once and "cannot turn off" on trial.
  useFocusEffect(
    useCallback(() => {
      return () => {
        const state = useCurrentAudioStore.getState()
        const isIntroAudio =
          (state.audioOrigin === "other" ||
            state.audioOrigin === "full-player") &&
          state.prefs?.isIntroAudio
        const trialMustStop = !hasLifetimeAccess
        if (isIntroAudio || trialMustStop) {
          stopAnuaAudio().catch(() => {})
          const currentTrack = trackRef.current
          if (currentTrack) {
            currentTrack
              .stopAsync()
              .then(() => currentTrack.unloadAsync().catch(() => {}))
              .then(() => reset())
              .catch(() => reset())
          } else {
            reset()
          }
        }
      }
    }, [reset, hasLifetimeAccess]),
  )

  /** Single path for closing player and navigating. Awaits stop+unload before reset+navigate to prevent double-play. */
  const closePlayerAndNavigate = useCallback(
    async (options?: { replaceToChakraHome?: boolean }) => {
      stopAnuaAudio().catch((e) => {
        if (__DEV__) console.warn("AudioPlayer: stopAnuaAudio on close:", e)
      })
      const currentTrack = trackRef.current
      if (currentTrack) {
        try {
          await currentTrack.stopAsync()
          await currentTrack.unloadAsync()
        } catch (e) {
          if (__DEV__)
            console.warn("AudioPlayer: closePlayerAndNavigate unload error:", e)
        }
        setTrack(undefined)
        setIsPlaying(false)
        setIsLoading(false)
        isLoadedRef.current = false
      }
      reset()
      if (options?.replaceToChakraHome) {
        router.replace("/(chakras)/ChakraHome")
      } else {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace("/(chakras)/ChakraHub")
        }
      }
    },
    [reset, router],
  )

  const storeIsPlaying = useCurrentAudioStore((state) => state.isPlaying)

  // AudioPlayer never routes to goodbye. Only mark day complete and close/back. Goodbye is shown only by the course page (ChakraHome).
  useEffect(() => {
    if (!prefs) return // Safe guard

    if (!prefs.shouldLoop && justFinished) {
      setJustFinished(false)
      const advanced = useCurrentAudioStore.getState().advanceToNext()
      if (!advanced) {
        const isOtherOrFullPlayer =
          audioOrigin === "other" || audioOrigin === "full-player"
        // Embodiment intro (isIntroAudio): close for both trial and lifetime. Course intro ritual never plays here — only in waiting room first Anua open.
        if (isOtherOrFullPlayer && prefs.isIntroAudio === true) {
          if (!hasLifetimeAccess) markChakraCompleted(dayIndex)
          closePlayerAndNavigate().catch((e) => {
            if (__DEV__) console.warn("AudioPlayer: closePlayerAndNavigate:", e)
          })
          return
        }
        // Single "other" / "full-player" track (e.g. Head to Heart): auto-close and return to previous screen
        if (isOtherOrFullPlayer && !prefs.isIntroAudio) {
          closePlayerAndNavigate().catch((e) => {
            if (__DEV__) console.warn("AudioPlayer: closePlayerAndNavigate:", e)
          })
          return
        }
        seekToPosition(0)
        track?.pauseAsync()
        setIsPlaying(false)
      }
      // If advanced, the store update triggers re-render and source effect loads next track
    }
  }, [
    justFinished,
    seekToPosition,
    track,
    prefs,
    audioOrigin,
    hasLifetimeAccess,
    dayIndex,
    markChakraCompleted,
    closePlayerAndNavigate,
  ])

  // Re-initialize whenever source or prefs change (critical for track switching).
  // Compare by URI/signature so we do not re-init when the same source is set with a new object reference (avoids double load/restart).
  useEffect(() => {
    if (!source || !prefs) return

    const sig = getSourceSignature(source)
    const sourceChanged = lastSourceSignatureRef.current !== sig
    if (sourceChanged) {
      lastSourceRef.current = source
      lastSourceSignatureRef.current = sig
      lastAppliedStorePlayingRef.current = null
      embodimentEightyPercentRef.current = false
      hasAppliedFirstStatusRef.current = false
      setLoadError(null)
    }

    const runInit = async () => {
      // Full-player (Master Embodiment, Head to Heart): always unload any existing track first so we never play two at once (echo).
      const mustUnload =
        track &&
        (sourceChanged || audioOrigin === "full-player")
      if (mustUnload) {
        try {
          await track.unloadAsync()
        } catch (e) {
          if (__DEV__) console.warn("AudioPlayer: Unload error:", e)
        }
        setTrack(undefined)
        setIsPlaying(false)
        setIsLoading(false)
        isLoadedRef.current = false
      }
      isLoadedRef.current = false

      if (audioOrigin === "other") {
        const ref = otherOriginTrackRef.current
        const sig = getSourceSignature(source)
        if (ref && ref.sourceSignature === sig) {
          otherOriginTrackRef.current = null
          setTrack(ref.sound)
          try {
            const status = await ref.sound.getStatusAsync()
            if (status.isLoaded) {
              isLoadedRef.current = true
              setIsLoading(false)
              setIsPlaying(status.isPlaying)
              setPosition(status.positionMillis)
              if (status.durationMillis) setDuration(status.durationMillis)
            }
          } catch (e) {
            if (__DEV__) console.warn("AudioPlayer: getStatusAsync (other) failed:", e)
            setIsLoading(true)
          }
          return
        }
      }

      if (initializingTrackRef.current) return
      setIsLoading(true)
      await initializeTrack()
    }

    if (!track || sourceChanged) {
      runInit()
    }

    return () => {
      if (track && audioOrigin === "other") {
        const sig = getSourceSignature(source)
        otherOriginTrackRef.current = { sound: track, sourceSignature: sig }
      } else if (track) {
        track.unloadAsync().catch((error) => {
          if (__DEV__) console.warn("AudioPlayer: Cleanup unload error:", error)
        })
        setTrack(undefined)
        setIsPlaying(false)
        setIsLoading(false)
        isLoadedRef.current = false
      }
    }
  }, [source, prefs, audioOrigin])

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

  const bottomBarOpacity = useSharedValue(1)
  useEffect(() => {
    bottomBarOpacity.value = withTiming(controlsVisible ? 1 : 0, {
      duration: 300,
    })
  }, [controlsVisible, bottomBarOpacity])

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

  const animatedBottomBarStyle = useAnimatedStyle(() => ({
    opacity: bottomBarOpacity.value,
  }))

  const performClose = useCallback(async () => {
    setShowExitConfirmModal(false)
    await closePlayerAndNavigate()
  }, [closePlayerAndNavigate])

  const handleCloseX = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    if (!hasLifetimeAccess && Platform.OS !== "android") {
      setShowExitConfirmModal(true)
    } else {
      performClose()
    }
  }, [hasLifetimeAccess, performClose])

  /** When there is no source (empty/error state), X always closes immediately — no exit confirm modal (modal is not rendered in that branch). */
  const handleCloseXNoSource = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    performClose()
  }, [performClose])

  const handleConfirmClose = useCallback(() => {
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {!showNoAudioMessage && (
            <ActivityIndicator
              size="large"
              color="rgba(255,255,255,0.8)"
              style={{ marginBottom: 16 }}
            />
          )}
          <AppText
            font={showNoAudioMessage ? "instrument-regular" : "cormorant-italic"}
            size="lg"
            className="text-white text-center px-4"
          >
            {showNoAudioMessage
              ? "No audio selected. Please select an audio file to play."
              : "Gathering Presence…"}
          </AppText>
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
    if (track) {
      const wasPlaying = isPlaying
      const newPosition = Math.max(positionMs - 10000, 0)
      await track.setPositionAsync(newPosition)
      setPosition(newPosition)
      if (Platform.OS === "android" && wasPlaying) {
        await track.playAsync()
        setIsPlaying(true)
        setPlaying(true)
      }
    }
  }

  const forward10 = async () => {
    if (track) {
      const wasPlaying = isPlaying
      const newPosition = Math.min(positionMs + 10000, durationMs)
      await track.setPositionAsync(newPosition)
      setPosition(newPosition)
      if (Platform.OS === "android" && wasPlaying) {
        await track.playAsync()
        setIsPlaying(true)
        setPlaying(true)
      }
    }
  }

  return (
    <>
    <View style={{ flex: 1, backgroundColor: "#000" }} pointerEvents="box-none">
      <ActionBar
        useXButton={true}
        xButtonPosition="left"
        onXPress={handleCloseX}
      />

      {/* Tap anywhere (or hover on web) to show play/pause and progress bar */}
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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <PulsingChakraBall
            source={
              dayIndex === 5
                ? require("@/assets/images/ajna.png")
                : getChakraImage(dayIndex)
            }
          />
          <AppText
            font="instrument-regular"
            size="xl"
            style={{ marginBottom: 8, color: "#ffffff", textAlign: "center" }}
          >
            {metadata.title}
          </AppText>
          <AppText
            font="fira-code"
            size="base"
            style={{ color: "rgba(255,255,255,0.9)", textAlign: "center" }}
          >
            {metadata.author}
          </AppText>
          {isLoading && (
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
          )}
        </View>
      </Pressable>

      {/* Bottom bar - play/pause, slider; always present, opacity shows/hides; tap bar or screen to reveal */}
      <Pressable
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
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: 100,
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 20,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
        }}
      >
        <Animated.View style={[{ width: "100%" }, animatedBottomBarStyle]}>
          <PlayerProgressBar
            durationMs={durationMs}
            positionMs={positionMs}
            seekToPosition={async (ms) => {
              showControls()
              await seekToPosition(ms, isPlaying)
            }}
          />
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
            >
              <Forward10
                width={ICON.skipControl}
                height={ICON.skipControl}
                color="white"
              />
            </TouchableHighlight>
          </View>
        </Animated.View>
      </Pressable>

      {/* Notes Along the Way (white feather) - toggles with player bar (same opacity + reasoning) */}
      {audioOrigin === "full-player" && (
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 16,
              bottom: Math.max(insets.bottom, 12),
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            },
            animatedBottomBarStyle,
          ]}
          pointerEvents={controlsVisible ? "auto" : "none"}
        >
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              setNotesSheetOpenKey((k) => k + 1)
              notesSheetRef.current?.present()
            }}
            style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center" }}
            accessibilityLabel="Notes Along the Way"
            accessibilityHint="Tap to jot down something from your healing session"
          >
            <Feather name="feather" size={17} color="#ffffff" />
          </Pressable>
        </Animated.View>
      )}
    </View>

    {/* Notes Along the Way - bottom sheet (full-player only) */}
    <BottomSheetModal
      ref={notesSheetRef}
      index={1}
      snapPoints={["50%", "90%"]}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} />
      )}
      backgroundStyle={{
        backgroundColor: "rgba(20, 20, 22, 0.98)",
      }}
      handleIndicatorStyle={{ backgroundColor: "rgba(255,255,255,0.4)" }}
    >
      <JourneyNotesView
        theme="player"
        sheetOpenKey={notesSheetOpenKey}
        contextChakraDay={dayIndex}
        onOpenFullPage={() => {
          notesSheetRef.current?.dismiss()
          setTimeout(
            () =>
              router.push(
                `/(chakras)/NotesAlongTheWay?contextDay=${dayIndex}`,
              ),
            300,
          )
        }}
        onSendToAnua={(content) => {
          notesSheetRef.current?.dismiss()
          setTimeout(
            () => useAnuaChatStore.getState().open({ initialMessage: content }),
            200,
          )
        }}
      />
    </BottomSheetModal>

    {/* Trial: exit confirmation modal */}
    <Modal
      visible={showExitConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowExitConfirmModal(false)}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.85)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
        onPress={() => setShowExitConfirmModal(false)}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "rgba(28, 32, 38, 0.98)",
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: "rgba(168, 201, 154, 0.35)",
            maxWidth: 320,
          }}
        >
          <AppText
            font="instrument-regular"
            size="base"
            style={{
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 24,
            }}
          >
            In your trial, audio stops when you leave this screen.
          </AppText>
          <View style={{ flexDirection: "row", gap: 12, justifyContent: "center" }}>
            <Pressable
              onPress={() => setShowExitConfirmModal(false)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(168, 201, 154, 0.5)",
                backgroundColor: "rgba(168, 201, 154, 0.15)",
                minHeight: 44,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AppText
                font="instrument-medium"
                size="sm"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                Stay in the moment
              </AppText>
            </Pressable>
            <Pressable
              onPress={handleConfirmClose}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(168, 201, 154, 0.5)",
                backgroundColor: "rgba(168, 201, 154, 0.35)",
                minHeight: 44,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AppText
                font="instrument-medium"
                size="sm"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                Move along
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
    </>
  )
}

export default AudioPlayer
