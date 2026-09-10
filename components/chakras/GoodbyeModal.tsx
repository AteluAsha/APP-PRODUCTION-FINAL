/**
 * Goodbye – End-of-Day Completion Screen
 *
 * Sequential: word-on-screen presence, then goodbye. The closing holds the
 * blessing, mantra, and ball together. Home rests. The Gallery is a quiet door.
 */
import { AppText } from "@/components/AppText"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  View,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { Chakra } from "@/types/chakras/Chakra"
import { useRouter } from "expo-router"
import { getChakraFromDay } from "@/utils/chakraMapping"
import { chakraContent } from "@/constants/chakras/content"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import {
  getChakraName,
  getChakraColor,
} from "@/constants/chakras/chakraConstants"
import { BreathIntegrationScreen } from "@/components/chakras/BreathIntegrationScreen"
import { SoftChakraBall } from "@/components/chakras/SoftChakraBall"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { goToChakraHubRoot } from "@/utils/navigationHelpers"
import { useTomorrowAwakeningStore } from "@/hooks/useTomorrowAwakeningStore"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getGoodbyeField } from "@/constants/sanctuaryFields"
import { mantraForDay } from "@/constants/endOfDayPresenceCopy"
import { silenceAllAudio } from "@/src/utils/singleActiveSound"
import { persistResumeBookmark } from "@/utils/audioBookmark"
import { sliderDurationMs } from "@/src/utils/playerControls"
import { useEmbodimentDurationCacheStore } from "@/hooks/useEmbodimentDurationCacheStore"
import { registerAndroidHardwareBackOverride } from "@/utils/androidBackCleanup"
import {
  formatHeroAffirmationText,
  HERO_AFFIRMATION_FONT_SIZE,
  HERO_AFFIRMATION_LINE_HEIGHT,
  HERO_AFFIRMATION_MAX_LINES,
} from "@/constants/heroAffirmation"
import { ICON, safeOverlayTop } from "@/constants/layout"
import { DailyAlignmentToggleRow } from "@/components/chakras/DailyAlignmentToggleRow"
import { GALLERY_GOODBYE_DOOR } from "@/constants/galleryChambersCopy"

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "")
  const n = parseInt(raw, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const GoodbyeModal = ({
  isVisible,
  onClose,
  chakraDay,
  onNavigateHome,
}: {
  isVisible: boolean
  onClose: () => void
  chakraDay?: number
  navigateToHubOnHome?: boolean
  onNavigateHome?: () => void
}) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const overlayTop = safeOverlayTop(insets.top)
  const bottomInset = Math.max(insets.bottom, 24)
  const [stage, setStage] = useState<"presence" | "goodbye">("presence")
  const [blessingReady, setBlessingReady] = useState(false)
  const goodbyeOpacity = useSharedValue(0)
  const overlayOpacity = useSharedValue(0)
  const currentChakra =
    chakraDay !== undefined ? getChakraFromDay(chakraDay) : Chakra.ROOT

  const content = chakraContent[currentChakra]
  const heroMantra = formatHeroAffirmationText(mantraForDay(chakraDay ?? 0))
  const chakraColor = getChakraColor(chakraDay ?? 0)

  const queueTomorrow = () => {
    useTomorrowAwakeningStore
      .getState()
      .queueTomorrowAwakening(chakraDay ?? 0)
  }

  const handleEnterGallery = () => {
    addHapticFeedback(HapticStrength.Light)
    queueTomorrow()
    useCompletedChakraStore.getState().clearCompletedChakra()
    onClose()
    requestAnimationFrame(() => {
      setTimeout(() => {
        router.replace(
          `/(chakras)/GalleryOfGnosis?chakra=${currentChakra}` as const,
        )
      }, 200)
    })
  }

  const handleNavigateHome = () => {
    addHapticFeedback(HapticStrength.Light)
    queueTomorrow()
    useCompletedChakraStore.getState().clearCompletedChakra()
    if (onNavigateHome) {
      onNavigateHome()
      return
    }
    onClose()
    requestAnimationFrame(() => {
      setTimeout(() => {
        goToChakraHubRoot()
      }, 200)
    })
  }

  const { width: windowWidth } = useWindowDimensions()
  const plateWidth = Math.min(windowWidth * 0.56, 208)
  const plateHeight = plateWidth * (4 / 3)
  const platePulse = useSharedValue(1)
  const blessingOpacity = useSharedValue(0)

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const goodbyeStyle = useAnimatedStyle(() => ({
    opacity: goodbyeOpacity.value,
  }))

  const platePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: platePulse.value }],
  }))

  const blessingStyle = useAnimatedStyle(() => ({
    opacity: blessingOpacity.value,
  }))

  const isVisibleRef = useRef(isVisible)
  isVisibleRef.current = isVisible

  const revealGoodbye = useCallback(() => {
    if (!isVisibleRef.current) return
    setStage("goodbye")
  }, [])

  useEffect(() => {
    if (!isVisible) {
      overlayOpacity.value = withTiming(0, { duration: 280 })
      goodbyeOpacity.value = 0
      blessingOpacity.value = 0
      setBlessingReady(false)
      setStage("presence")
      return
    }
    setStage("presence")
    goodbyeOpacity.value = 0
    overlayOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.ease),
    })
    const audio = useCurrentAudioStore.getState()
    const cached =
      audio.fullPlayerTrackId != null
        ? (useEmbodimentDurationCacheStore
            .getState()
            .getDuration(audio.fullPlayerTrackId) ?? 0)
        : 0
    void persistResumeBookmark(
      audio.fullPlayerTrackId,
      audio.positionMs,
      sliderDurationMs(cached, audio.metadata?.durationMs ?? 0),
    )
    void silenceAllAudio().then(() => {
      useCurrentAudioStore.getState().reset()
    })
    const safety = setTimeout(() => {
      setStage((current) => (current === "presence" ? "goodbye" : current))
    }, 40000)
    return () => clearTimeout(safety)
  }, [isVisible, goodbyeOpacity, overlayOpacity])

  useEffect(() => {
    if (!isVisible || stage !== "goodbye") return
    goodbyeOpacity.value = 0
    goodbyeOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.ease),
    })
    platePulse.value = withTiming(1, { duration: 0 })
    platePulse.value = withRepeat(
      withTiming(1.035, {
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
    blessingOpacity.value = 0
    setBlessingReady(false)
    const blessingReveal = setTimeout(() => {
      if (!isVisibleRef.current) return
      setBlessingReady(true)
      blessingOpacity.value = withTiming(1, {
        duration: 900,
        easing: Easing.out(Easing.ease),
      })
    }, 7000)
    return () => clearTimeout(blessingReveal)
  }, [isVisible, stage, goodbyeOpacity, platePulse, blessingOpacity])

  const setGoodbyeVisible = useGoodbyeModalStore((s) => s.setGoodbyeVisible)
  useEffect(() => {
    setGoodbyeVisible(isVisible)
    return () => setGoodbyeVisible(false)
  }, [isVisible, setGoodbyeVisible])

  useEffect(() => {
    if (Platform.OS !== "android" || !isVisible) return
    return registerAndroidHardwareBackOverride(() => {
      addHapticFeedback(HapticStrength.Light)
      onClose()
      return true
    })
  }, [isVisible, onClose])

  const closingMessage =
    chakraDay === 6
      ? `Wonderful work, lovely soul. Your ${getChakraName(chakraDay ?? 0)} chakra is awakening.\n\nWelcome to The Era of The Heart.`
      : `Wonderful work, lovely soul. Your ${getChakraName(chakraDay ?? 0)} chakra is awakening. Remember to send it some love.`

  let stageView: React.ReactNode = null
  if (isVisible && stage === "presence") {
    stageView = (
      <BreathIntegrationScreen
        chakraDay={chakraDay}
        onComplete={revealGoodbye}
      />
    )
  } else if (isVisible) {
    stageView = (
      <Animated.View
        style={[styles.goodbyeWrap, goodbyeStyle]}
        pointerEvents="box-none"
      >
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              router.replace(`/(chakras)/${currentChakra}` as const)
              onClose()
            }}
            style={{
              position: "absolute",
              top: overlayTop,
              left: 16,
              zIndex: 10003,
              width: ICON.homeButton,
              height: ICON.homeButton,
              justifyContent: "center",
              alignItems: "center",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Back"
            accessibilityHint="Return to chakra day"
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color="rgba(255, 255, 255, 0.9)"
            />
          </Pressable>

          <ScrollView
            style={styles.goodbyeWrap}
            contentContainerStyle={[
              styles.goodbyeInner,
              {
                paddingTop: overlayTop + 48,
                paddingBottom: bottomInset + 24,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {content?.elements?.background ? (
              <Pressable
                onPress={handleEnterGallery}
                style={({ pressed }) => [
                  styles.galleryDoor,
                  { opacity: pressed ? 0.92 : 1 },
                ]}
                accessibilityLabel={GALLERY_GOODBYE_DOOR}
                accessibilityRole="button"
              >
                <Animated.View
                  style={[
                    styles.plateHalo,
                    {
                      width: plateWidth + 28,
                      height: plateHeight + 28,
                      shadowColor: hexToRgba(chakraColor, 0.8),
                    },
                    platePulseStyle,
                  ]}
                >
                  <View
                    pointerEvents="none"
                    style={[
                      styles.plateGlow,
                      { backgroundColor: hexToRgba(chakraColor, 0.26) },
                    ]}
                  />
                  <Image
                    source={content.elements.background}
                    style={{
                      width: plateWidth,
                      height: plateHeight,
                    }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleEnterGallery}
                style={({ pressed }) => [
                  styles.galleryDoorFallback,
                  { opacity: pressed ? 0.88 : 1 },
                ]}
                accessibilityLabel={GALLERY_GOODBYE_DOOR}
                accessibilityRole="button"
              >
                <AppText font="cormorant-italic" style={styles.galleryDoorLabel}>
                  {GALLERY_GOODBYE_DOOR}
                </AppText>
              </Pressable>
            )}

            <AppText font="cormorant-italic" style={styles.closing}>
              {closingMessage}
            </AppText>

            {blessingReady ? (
              <Animated.View
                style={[styles.giftReveal, blessingStyle]}
                pointerEvents="none"
              >
                {content?.goodbye?.chakraImage ? (
                  <View style={styles.ballWrap}>
                    <SoftChakraBall
                      source={content.goodbye.chakraImage}
                      size={108}
                      glowColor={hexToRgba(chakraColor, 0.28)}
                    />
                  </View>
                ) : null}

                <AppText
                  font="cormorant-italic"
                  numberOfLines={HERO_AFFIRMATION_MAX_LINES}
                  style={styles.heroMantra}
                >
                  {heroMantra}
                </AppText>
              </Animated.View>
            ) : null}

            {chakraDay === 0 ? <DailyAlignmentToggleRow /> : null}

            <View style={styles.actions}>
              <Pressable
                onPress={handleNavigateHome}
                style={({ pressed }) => [
                  styles.homeButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                accessibilityLabel="Home"
                accessibilityRole="button"
              >
                <AppText
                  font="instrument-medium"
                  size="base"
                  style={{ color: "#fff" }}
                >
                  Home
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
    )
  }

  return (
    <Animated.View
      pointerEvents={isVisible ? "box-none" : "none"}
      style={[
        overlayStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000",
          zIndex: 10001,
        },
      ]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={getGoodbyeField(chakraDay)}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.46)",
            "rgba(0,0,0,0.58)",
            "rgba(0,0,0,0.78)",
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {stageView}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  goodbyeWrap: {
    flex: 1,
  },
  goodbyeInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  ballWrap: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  giftReveal: {
    alignItems: "center",
    width: "100%",
    marginTop: 22,
  },
  heroMantra: {
    fontSize: HERO_AFFIRMATION_FONT_SIZE,
    lineHeight: HERO_AFFIRMATION_LINE_HEIGHT,
    color: "rgba(255, 248, 236, 0.98)",
    textAlign: "center",
    paddingHorizontal: 8,
    textShadowColor: "rgba(232, 201, 140, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  closing: {
    textAlign: "center",
    color: "rgba(255,255,255,0.86)",
    fontSize: 18,
    lineHeight: 28,
    marginTop: 18,
    marginBottom: 20,
    maxWidth: 360,
  },
  actions: {
    width: "100%",
    alignItems: "center",
    gap: 18,
  },
  galleryDoor: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryDoorFallback: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: 360,
    marginTop: 18,
  },
  galleryDoorLabel: {
    color: "rgba(232, 201, 140, 0.92)",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
  },
  plateHalo: {
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 28,
    elevation: 14,
  },
  plateGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    transform: [{ scaleX: 0.86 }, { scaleY: 0.9 }],
  },
  homeButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.5)",
    backgroundColor: "rgba(168, 201, 154, 0.2)",
    minWidth: 160,
    alignItems: "center",
  },
})

export default GoodbyeModal
