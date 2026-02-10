import { ActionBar } from "@/components/ActionBar"
import { useCallback, useEffect, useRef } from "react"
import { useState } from "react"
import { View, TouchableHighlight } from "react-native"
import {
  Audio,
  AVPlaybackStatus,
  AVPlaybackSource,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from "expo-av"
import { useRouter } from "expo-router"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { PlayerProgressBar } from "@/components/chakras/PlayerProgressBar"
import RadialGradientAnimation from "@/components/chakras/RadialGradientAnimation"
import Rewind10 from "@/assets/svg/rewind10.svg"
import Forward10 from "@/assets/svg/forward10.svg"
import { performIntroRitual } from "@/src/services/anuaRitualService"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { ICON } from "@/constants/layout"
import {
  otherOriginTrackRef,
  getSourceSignature,
} from "@/src/services/otherOriginTrackRef"

/** Hz → chakra color (hex) for audio player visual */
const HERTZ_TO_CHAKRA_COLOR: Record<number, string> = {
  396: "#DC2626", // Root – red
  417: "#EA580C", // Sacral – orange
  528: "#FCD34D", // Solar Plexus – yellow
  639: "#10B981", // Heart – green
  741: "#3B82F6", // Throat – blue
  852: "#6366F1", // Third Eye – indigo
  963: "#9333EA", // Crown – purple
}

const FALLBACK_COLOR = "#6366F1" // Third Eye – neutral when Hz unknown

function parseHzFromMetadata(metadata: {
  title: string
  author: string
}): string {
  const text = `${metadata.title} ${metadata.author}`
  const match = text.match(/(\d{3})\s*[Hh]z/i)
  if (!match) return FALLBACK_COLOR
  const hz = parseInt(match[1], 10)
  return HERTZ_TO_CHAKRA_COLOR[hz] ?? FALLBACK_COLOR
}

const AudioPlayer = () => {
  const router = useRouter()
  const source = useCurrentAudioStore((state) => state.source)
  const metadata = useCurrentAudioStore((state) => state.metadata)
  const prefs = useCurrentAudioStore((state) => state.prefs)
  const audioOrigin = useCurrentAudioStore((state) => state.audioOrigin)
  const reset = useCurrentAudioStore((state) => state.reset)

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // This ensures React hooks are always called in the same order on every render
  const [track, setTrack] = useState<Audio.Sound>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [positionMs, setPosition] = useState(0)
  const [durationMs, setDuration] = useState<number>(metadata?.durationMs || 0)
  const [justFinished, setJustFinished] = useState(false)
  const introRitualTriggered = useRef(false)
  const isLoadedRef = useRef(false)
  const lastSourceRef = useRef<AVPlaybackSource | null>(null)
  const lastAppliedStorePlayingRef = useRef<boolean | null>(null)

  // Define callbacks - safe to call even if source/metadata/prefs are null
  const seekToPosition = useCallback(
    async (newPositionMs: number) => {
      if (track) {
        await track.setPositionAsync(newPositionMs)
        setPosition(newPositionMs)
      }
    },
    [track],
  )

  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!metadata) return // Safe guard

      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)

        const duration =
          status.durationMillis && status.durationMillis > 0
            ? status.durationMillis
            : metadata?.durationMs || 0
        setPosition(status.positionMillis)
        setDuration(duration)

        if (status.didJustFinish) {
          setJustFinished(true)
        }

        // Keep store in sync for mini player (origin "other")
        const playing = !!status.isPlaying
        setPlaying(playing)
        lastAppliedStorePlayingRef.current = playing

        // Auto-play when loaded if we're in loading state
        // This handles the case where audio finishes loading after initialization
        if (isLoading && track && !isPlaying && isLoadedRef.current) {
          await track.playAsync()
          setIsPlaying(true)
          setIsLoading(false)
        }
      } else {
        if (status.error) {
          if (__DEV__) {
            console.error("AudioPlayer: Loading error:", status.error)
          }
        }
      }
    },
    [metadata, isLoading, track, isPlaying, setPlaying],
  )

  const initializeTrack = useCallback(async () => {
    if (!source || !prefs) return // Safe guard

    try {
      isLoadedRef.current = false
      setIsLoading(true)

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      })

      const { sound } = await Audio.Sound.createAsync(
        source,
        {
          shouldPlay: false,
          isLooping: prefs.shouldLoop || false,
        },
        onPlaybackStatusUpdate,
      )

      setTrack(sound)
      await sound.setIsLoopingAsync(prefs.shouldLoop || false)
      await sound.setVolumeAsync(1)
      await new Promise((resolve) => setTimeout(resolve, 100))

      const status = await sound.getStatusAsync()
      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)
        await sound.playAsync()
        setIsPlaying(true)
      } else {
        setIsLoading(true)
      }
    } catch (error) {
      const errorToLog =
        error instanceof Error ? error : new Error(String(error))

      // Log to Sentry
      const { captureException } = require("@/src/services/sentry")
      captureException(errorToLog, {
        component: "AudioPlayer",
        operation: "initializeTrack",
        hasSource: !!source,
        hasPrefs: !!prefs,
      })

      if (__DEV__) {
        console.error("AudioPlayer: Error creating sound:", error)
      }
      setTrack(undefined)
      setIsPlaying(false)
      setIsLoading(false)
      isLoadedRef.current = false
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

  // When origin is "other" (embodiment etc.), do NOT reset on leave so the mini player
  // can show and user can close/pause from there. Reset only when they tap Close in mini player.
  const setPlaying = useCurrentAudioStore((state) => state.setPlaying)
  const storeIsPlaying = useCurrentAudioStore((state) => state.isPlaying)

  useEffect(() => {
    if (!prefs) return // Safe guard

    if (!prefs.shouldLoop && justFinished) {
      setJustFinished(false)
      const advanced = useCurrentAudioStore.getState().advanceToNext()
      if (!advanced) {
        seekToPosition(0)
        track?.pauseAsync()
        setIsPlaying(false)

        if (prefs.isIntroAudio && !introRitualTriggered.current) {
          introRitualTriggered.current = true
          performIntroRitual().catch((error) => {
            if (__DEV__) {
              console.error(
                "AudioPlayer: Error performing Intro Ritual:",
                error,
              )
            }
          })
        }
      }
      // If advanced, the store update triggers re-render and source effect loads next track
    }
  }, [justFinished, seekToPosition, track, prefs])

  // Re-initialize whenever source or prefs change (critical for track switching)
  useEffect(() => {
    if (!source || !prefs) return

    const sourceChanged = lastSourceRef.current !== source
    if (sourceChanged) {
      lastSourceRef.current = source
      lastAppliedStorePlayingRef.current = null
    }

    const runInit = async () => {
      if (track && sourceChanged) {
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
      introRitualTriggered.current = false
      isLoadedRef.current = false

      if (audioOrigin === "other") {
        const ref = otherOriginTrackRef.current
        const sig = getSourceSignature(source)
        if (ref && ref.sourceSignature === sig) {
          otherOriginTrackRef.current = null
          setTrack(ref.sound)
          const status = await ref.sound.getStatusAsync()
          if (status.isLoaded) {
            isLoadedRef.current = true
            setIsLoading(false)
            setIsPlaying(status.isPlaying)
            setPosition(status.positionMillis)
            if (status.durationMillis) setDuration(status.durationMillis)
          }
          return
        }
      }

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
        introRitualTriggered.current = false
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

  // NOW we can check for missing data and return early
  // All hooks have been declared above, so React's hook order is preserved
  if (!source || !metadata || !prefs) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ActionBar useXButton={true} xButtonPosition="left" onXPress={() => { addHapticFeedback(HapticStrength.Light); router.replace("/(chakras)") }} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <AppText
            font="instrument-regular"
            size="lg"
            className="text-white text-center px-4"
          >
            No audio selected. Please select an audio file to play.
          </AppText>
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
      const newPosition = Math.max(positionMs - 10000, 0)
      await track.setPositionAsync(newPosition)
      setPosition(newPosition)
    }
  }

  const forward10 = async () => {
    if (track) {
      const newPosition = Math.min(positionMs + 10000, durationMs)
      await track.setPositionAsync(newPosition)
      setPosition(newPosition)
    }
  }

  // Use explicit chakra color when set (e.g. embodiment from chakra day); else derive from metadata Hz
  const storeChakraColor = useCurrentAudioStore((state) => state.chakraColor)
  const chakraColor = storeChakraColor ?? parseHzFromMetadata(metadata)

  const handleCloseX = useCallback(() => {
    if (audioOrigin !== "other") {
      reset()
    }
    router.replace("/(chakras)")
  }, [audioOrigin, reset, router])

  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      <RadialGradientAnimation primaryColor={chakraColor} />
      <ActionBar useXButton={true} xButtonPosition="left" onXPress={handleCloseX} />
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-end",
          marginTop: 4,
          marginHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
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
        </View>
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <PlayerProgressBar
            durationMs={durationMs}
            positionMs={positionMs}
            seekToPosition={seekToPosition}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 48,
              gap: ICON.controlsGap,
            }}
          >
            <TouchableHighlight
              style={{ padding: 8 }}
              onPress={rewind10}
              underlayColor="transparent"
            >
              <Rewind10
                width={ICON.skipControl}
                height={ICON.skipControl}
                color="white"
              />
            </TouchableHighlight>
            <TouchableHighlight
              onPress={togglePlayPause}
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
              onPress={forward10}
              underlayColor="transparent"
            >
              <Forward10
                width={ICON.skipControl}
                height={ICON.skipControl}
                color="white"
              />
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AudioPlayer
