import { ActionBar } from "@/components/ActionBar"
import { MusicRoomTrackButton } from "@/components/chakras/MusicRoomTrackButton"
import { SoundBathClosingSection } from "@/components/chakras/SoundBathClosingSection"
import { SanctuaryFieldLayer } from "@/components/chakras/SanctuaryFieldLayer"
import { AppText } from "@/components/AppText"
import { HapticStrength } from "@/utils/haptic"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { addHapticFeedback } from "@/utils/haptic"
import { useLocalSearchParams, useRouter, usePathname } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  ScrollView,
  Platform,
  Dimensions,
  StyleSheet,
  AppState,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import BackgroundOpacity from "@/components/BackgroundOpacity"
import { isValidChakra } from "@/utils/validation"
import { getCrystalBowlFileName } from "@/hooks/useCrystalBowlAudio"
import { getTuningForkHertz, getTuningForkFileName } from "@/hooks/useTuningForkAudio"
import { toAbsoluteFileUri } from "@/src/utils/crystalBowlPlayback"
import {
  peekSanctuaryTrack,
  rushSanctuaryTrack,
  useSanctuaryVaultStore,
} from "@/src/services/sanctuaryVaultDownloader"
import {
  createSoundAsyncOffUiThread,
  waitForSoundLoaded,
  waitForSoundReadyForSeek,
} from "@/src/utils/audioStreamInit"
import { clampSeekMs } from "@/src/utils/playerControls"
import { SOUND_BATH_CLOSING_QUOTE } from "@/constants/soundBathClosingQuote"
import { playSanctuaryTrack } from "@/utils/sanctuaryPlayback"
import { showHealingToast } from "@/utils/healingToast"
import type { HealingSound } from "@/src/utils/singleActiveSound"
import { registerAndroidBackCleanup } from "@/utils/androidBackCleanup"
import { navigateBackWithCleanup } from "@/utils/navigationHelpers"
import { pinRecoveryRoute } from "@/utils/appErrorRecovery"
import {
  FLOATING_NAV_SCROLL_BOTTOM_PADDING,
  SCROLL_BREATHING_BOTTOM_PADDING,
  SCROLL_ANDROID_SMOOTH_PROPS,
  SOMATIC_HERO_IMAGE_FADE_MS,
} from "@/constants/layout"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { getDayFromChakra } from "@/utils/chakraMapping"
import { getSoundHealingTrackDefs } from "@/constants/musicRoomLibrary"
import { useTuningForkAudio } from "@/hooks/useTuningForkAudio"
import { useCrystalBowlAudio } from "@/hooks/useCrystalBowlAudio"
import { LinearGradient } from "expo-linear-gradient"

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "")
  const n = parseInt(raw, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const SoundBath = () => {
  const searchParams = useLocalSearchParams()
  const rawChakra = searchParams.chakra
  const chakraParam = Array.isArray(rawChakra) ? rawChakra[0] : rawChakra
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const mountedRef = useRef(true)

  const hasChakraQuery =
    typeof chakraParam === "string" && chakraParam.trim().length > 0
  const chakra = isValidChakra(chakraParam) ? chakraParam : Chakra.ROOT

  useEffect(() => {
    if (hasChakraQuery && !isValidChakra(chakraParam)) {
      router.replace("/(chakras)/ChakraHub")
    }
  }, [chakraParam, hasChakraQuery, router])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (isValidChakra(chakraParam)) {
      pinRecoveryRoute(`/(chakras)/${chakraParam}`)
    }
  }, [chakraParam])

  const soundBathContent = chakraContent[chakra].soundBath
  const chakraDayTitle = chakraContent[chakra].yoga.chakraDay
  const soundBathBgOpacity = useSharedValue(0)
  const soundBathBgFadeStyle = useAnimatedStyle(() => ({
    opacity: soundBathBgOpacity.value,
  }))

  useEffect(() => {
    soundBathBgOpacity.value = withTiming(1, {
      duration: SOMATIC_HERO_IMAGE_FADE_MS,
    })
  }, [chakra, soundBathBgOpacity])

  const [tuningForkPreparing, setTuningForkPreparing] = useState(false)
  const [crystalBowlPreparing, setCrystalBowlPreparing] = useState(false)

  // Tuning fork: play/pause only on page, no player. One local Sound ref.
  const tuningForkSoundRef = useRef<HealingSound | null>(null)
  const [tuningForkPlaying, setTuningForkPlaying] = useState(false)
  const [tuningForkPositionMs, setTuningForkPositionMs] = useState(0)
  const [tuningForkDurationMs, setTuningForkDurationMs] = useState(0)

  const tuningForkHertz = getTuningForkHertz(chakra)

  const fullPlayerTrackId = useCurrentAudioStore((s) => s.fullPlayerTrackId)
  const isFullPlayerPlaying = useCurrentAudioStore((s) => s.isPlaying)

  const tuningForkFilename = getTuningForkFileName(chakra)
  const crystalBowlFilename = getCrystalBowlFileName(chakra)
  const crystalBowlAudioId = crystalBowlFilename
    ? `crystal_bowl_${chakra}_${crystalBowlFilename}`
    : null
  const tuningForkAudioId = tuningForkFilename
    ? `tuning_fork_${chakra}_${tuningForkFilename}`
    : null
  const tuningForkAudio = useTuningForkAudio(chakra)
  const crystalBowlAudio = useCrystalBowlAudio(chakra)
  const vaultReadyIds = useSanctuaryVaultStore((s) => s.readyIds)
  const vaultDownloadingId = useSanctuaryVaultStore((s) => s.downloadingAudioId)
  const vaultRushedId = useSanctuaryVaultStore((s) => s.rushedAudioId)
  const vaultReadySet = useMemo(
    () =>
      new Set(
        Object.entries(vaultReadyIds)
          .filter(([, ready]) => ready)
          .map(([id]) => id),
      ),
    [vaultReadyIds],
  )
  const soundHealingTracks = useMemo(
    () => getSoundHealingTrackDefs(chakra),
    [chakra],
  )

  const handleDownload = useCallback(
    (audioId: string) => {
      if (vaultReadyIds[audioId]) {
        showHealingToast("alreadyDownloaded")
        return
      }
      if (vaultDownloadingId === audioId || vaultRushedId === audioId) {
        return
      }
      rushSanctuaryTrack(audioId)
      addHapticFeedback(HapticStrength.Light)
      showHealingToast("downloadQueued")
    },
    [vaultReadyIds, vaultDownloadingId, vaultRushedId],
  )

  const crystalBowlPlaying =
    crystalBowlAudioId != null &&
    fullPlayerTrackId === crystalBowlAudioId &&
    isFullPlayerPlaying

  const chakraDayIndex = getDayFromChakra(chakra)
  const chakraAccentColor = getChakraColor(chakraDayIndex)

  const stopInlineTuningFork = useCallback(async () => {
    const s = tuningForkSoundRef.current
    if (!s) return
    try {
      await s.stopAsync()
      await s.unloadAsync()
    } catch {
      // already stopped
    }
    tuningForkSoundRef.current = null
    if (!mountedRef.current) return
    setTuningForkPlaying(false)
    setTuningForkPositionMs(0)
    setTuningForkDurationMs(0)
  }, [])

  useEffect(() => {
    return registerAndroidBackCleanup(() => {
      void stopInlineTuningFork()
    })
  }, [stopInlineTuningFork])

  const handleCloseSoundBath = useCallback(() => {
    navigateBackWithCleanup(() => {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace("/(chakras)/ChakraHub")
      }
    })
  }, [router])

  // On leave: unload tuning fork. Sleep/lock blurs the route while the
  // app is already inactive — keep playing. Real navigation stays active.
  useFocusEffect(
    useCallback(() => {
      return () => {
        const snapshot = AppState.currentState
        const s = tuningForkSoundRef.current
        if (!s) return
        setTimeout(() => {
          if (
            snapshot !== "active" ||
            AppState.currentState !== "active"
          ) {
            return
          }
          if (tuningForkSoundRef.current !== s) return
          void s.stopAsync()
            .then(() => s.unloadAsync().catch(() => {}))
            .catch(() => {})
          tuningForkSoundRef.current = null
          // Never setState here — Android back may have already unmounted this screen.
        }, 150)
      }
    }, []),
  )

  const handleTuningForkSeek = useCallback((ms: number) => {
    const s = tuningForkSoundRef.current
    if (!s) return
    const clamped = clampSeekMs(ms, tuningForkDurationMs)
    setTuningForkPositionMs(clamped)
    void (async () => {
      try {
        if (Platform.OS === "android") {
          await waitForSoundReadyForSeek(s)
        }
        await s.setPositionAsync(clamped)
        if (tuningForkPlaying) {
          await s.playAsync()
        }
      } catch {
        // keep UI at clamped place
      }
    })()
  }, [tuningForkDurationMs, tuningForkPlaying])

  const handleTuningForkPress = useCallback(async () => {
    addHapticFeedback(HapticStrength.Light)

    if (useCurrentAudioStore.getState().isPlaying) {
      useCurrentAudioStore.getState().setPlaying(false)
    }

    const s = tuningForkSoundRef.current
    if (!s && tuningForkPreparing) return
    if (s) {
      const status = await s.getStatusAsync()
      if (status.isLoaded && status.isPlaying) {
        await s.pauseAsync()
        setTuningForkPlaying(false)
      } else if (status.isLoaded) {
        await s.playAsync()
        setTuningForkPlaying(true)
        if (status.durationMillis && status.durationMillis > 0) {
          setTuningForkDurationMs(status.durationMillis)
        }
      }
      return
    }

    useCurrentAudioStore.getState().reset()
    const audioId = `tuning_fork_${chakra}_${getTuningForkFileName(chakra)}`
    setTuningForkPreparing(true)
    try {
      const uri = await peekSanctuaryTrack(audioId)
      if (!uri) {
        rushSanctuaryTrack(audioId)
        return
      }
      const sound = await createSoundAsyncOffUiThread(
        { uri: toAbsoluteFileUri(uri) },
        {
          initialStatus: {
            shouldPlay: false,
          },
          keepPlayingInBackground: true,
          lockScreen: {
            title: `Tuning Fork ${getTuningForkHertz(chakra)} Hz`,
            artist: "Sound Healing",
          },
        },
      )
      await waitForSoundLoaded(sound)
      await sound.setVolumeAsync(1)
      const loaded = await sound.getStatusAsync()
      const duration =
        loaded.isLoaded && loaded.durationMillis && loaded.durationMillis > 0
          ? loaded.durationMillis
          : 0
      setTuningForkDurationMs(duration)
      setTuningForkPositionMs(
        loaded.isLoaded ? loaded.positionMillis ?? 0 : 0,
      )
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || !mountedRef.current) return
        if (status.positionMillis != null) {
          setTuningForkPositionMs(status.positionMillis)
        }
        if (status.durationMillis != null && status.durationMillis > 0) {
          setTuningForkDurationMs(status.durationMillis)
        }
        if (status.didJustFinish && !status.isLooping) {
          setTuningForkPlaying(false)
          setTuningForkPositionMs(0)
          sound.setPositionAsync(0).catch(() => {})
        }
      })
      tuningForkSoundRef.current = sound
      await sound.playAsync()
      setTuningForkPlaying(true)
    } catch (e) {
      console.warn("[SoundBath] Tuning fork play failed:", e)
      if (mountedRef.current) setTuningForkPlaying(false)
    } finally {
      if (mountedRef.current) setTuningForkPreparing(false)
    }
  }, [chakra, tuningForkPreparing])

  const handleCrystalBowlPress = useCallback(async () => {
    if (crystalBowlPreparing || !crystalBowlAudioId) return
    addHapticFeedback(HapticStrength.Light)
    void stopInlineTuningFork()
    showHealingToast("gatheringPresence")
    setCrystalBowlPreparing(true)
    try {
      await playSanctuaryTrack({
        audioId: crystalBowlAudioId,
        title: soundBathContent.title,
        author: "Crystal Bowl Sound Bath",
        durationMs: soundBathContent.durationMs,
        chakraColor: chakraAccentColor,
        returnPath: pathname,
      })
    } catch (e) {
      console.warn("[SoundBath] Crystal bowl play failed:", e)
    } finally {
      if (mountedRef.current) setCrystalBowlPreparing(false)
    }
  }, [
    chakraAccentColor,
    crystalBowlAudioId,
    crystalBowlPreparing,
    pathname,
    soundBathContent.durationMs,
    soundBathContent.title,
    stopInlineTuningFork,
  ])

  // Invalid chakra redirects in useEffect; keep rendering with fallback chakra so
  // Android back never skips hooks when route params clear during pop.
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
      <Animated.View
        style={[backgroundLayerStyle, soundBathBgFadeStyle]}
        pointerEvents="none"
      >
        <SanctuaryFieldLayer dayIndex={chakraDayIndex} />
      </Animated.View>
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
              paddingBottom:
                FLOATING_NAV_SCROLL_BOTTOM_PADDING +
                SCROLL_BREATHING_BOTTOM_PADDING +
                (Platform.OS === "android" ? 72 : 0),
            }}
          >
          <LinearGradient
            colors={[
              "rgba(255, 248, 236, 0.08)",
              hexToRgba(chakraAccentColor, 0.12),
              "rgba(8, 6, 10, 0.55)",
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              marginTop: 8,
              marginHorizontal: 28,
              marginBottom: 22,
              paddingVertical: 30,
              paddingHorizontal: 22,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(232, 201, 140, 0.22)",
              alignItems: "center",
              overflow: "hidden",
              backgroundColor: "rgba(10, 8, 12, 0.78)",
            }}
          >
            <AppText
              font="cormorant-italic"
              style={{
                textAlign: "center",
                color: "rgba(255, 244, 228, 0.78)",
                fontSize: 16,
                lineHeight: 22,
                letterSpacing: 3.4,
              }}
            >
              Sound Healing
            </AppText>
            <View
              style={{
                width: 48,
                height: StyleSheet.hairlineWidth,
                marginTop: 14,
                marginBottom: 16,
                backgroundColor: "rgba(232, 201, 140, 0.5)",
              }}
            />
            <AppText
              font="cormorant-italic"
              style={{
                textAlign: "center",
                color: "rgba(255, 248, 236, 0.96)",
                fontSize: Platform.OS === "android" ? 30 : 28,
                lineHeight: Platform.OS === "android" ? 38 : 36,
                letterSpacing: 0.3,
              }}
            >
              {chakraDayTitle}
            </AppText>
            <AppText
              font="cormorant-regular"
              style={{
                textAlign: "center",
                marginTop: 8,
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: 13,
                lineHeight: 18,
                letterSpacing: 2.2,
                textTransform: "lowercase",
              }}
            >
              {soundBathContent.subtitle}
            </AppText>
            <AppText
              font="cormorant-italic"
              style={{
                textAlign: "center",
                marginTop: 18,
                color: "rgba(232, 201, 140, 0.95)",
                fontSize: Platform.OS === "android" ? 44 : 42,
                lineHeight: Platform.OS === "android" ? 52 : 50,
                letterSpacing: 1.4,
              }}
            >
              {tuningForkHertz} Hz
            </AppText>
          </LinearGradient>
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
              width: "100%",
              marginBottom: 16,
              marginTop: 16,
              paddingHorizontal: 12,
            }}
          >
            {soundHealingTracks.map((def) => {
              const vaultReady = vaultReadyIds[def.audioId] === true
              const media =
                def.trackKind === "tuning_fork"
                  ? tuningForkAudio
                  : crystalBowlAudio
              const activeVaultDownloadId = vaultReady
                ? null
                : (vaultDownloadingId ?? vaultRushedId)
              const isTuningFork = def.trackKind === "tuning_fork"
              const isLoading = isTuningFork
                ? tuningForkPreparing
                : crystalBowlPreparing
              const isActiveTrack = isTuningFork
                ? tuningForkPlaying || tuningForkPreparing
                : crystalBowlPlaying
              const isPlaying = isTuningFork
                ? tuningForkPlaying
                : crystalBowlPlaying

              return (
                <MusicRoomTrackButton
                  key={def.audioId}
                  def={def}
                  accentColor={chakraAccentColor}
                  isLoading={isLoading}
                  isConnected={!!(media.url || media.localUri || vaultReady)}
                  isActiveTrack={isActiveTrack}
                  isPlaying={isPlaying}
                  downloadedIds={vaultReadySet}
                  downloadingId={activeVaultDownloadId}
                  isQueued={
                    !vaultReady &&
                    activeVaultDownloadId != null &&
                    activeVaultDownloadId !== def.audioId
                  }
                  localUri={media.localUri}
                  url={media.url}
                  hideDownload={false}
                  onPlay={() => {
                    if (isTuningFork) {
                      void handleTuningForkPress()
                    } else {
                      void handleCrystalBowlPress()
                    }
                  }}
                  onDownload={() => handleDownload(def.audioId)}
                />
              )
            })}
          </View>

          <SoundBathClosingSection
            body={soundBathContent.body}
            closingQuote={SOUND_BATH_CLOSING_QUOTE}
          />
          </ScrollView>
        </View>
        <ActionBar
          useXButton={true}
          xButtonPosition="left"
          onXPress={handleCloseSoundBath}
        />
      </SafeAreaView>
    </View>
  )
}

export default SoundBath
