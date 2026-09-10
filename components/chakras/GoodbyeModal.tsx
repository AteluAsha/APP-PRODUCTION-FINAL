/**
 * Goodbye – End-of-Day Completion Screen
 *
 * Sequential: word-on-screen presence, then goodbye. The closing holds the
 * blessing and mantra at center, ball below. Home rests. The Gallery door
 * line sits above the plate so the hero stands alone.
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
  withDelay,
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
import { markDayCompleteDeparture } from "@/utils/goodbyeDeparture"
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
import { ANDROID_PRESS_DELAY_MS, ICON, safeOverlayTop, TOUCH } from "@/constants/layout"
import { DailyAlignmentToggleRow } from "@/components/chakras/DailyAlignmentToggleRow"
import { GALLERY_GOODBYE_DOOR } from "@/constants/galleryChambersCopy"

const DOOR_FADE_DELAY_MS = 480
const DOOR_FADE_MS = 3600
const BLESSING_HOLD_MS = 7000
const BLESSING_FADE_MS = 4800
const BLESSING_MANTRA_STAGGER_MS = 1600
const MAGICAL_EASE = Easing.bezier(0.22, 0.61, 0.36, 1)
const HERO_SLOT_HEIGHT =
  HERO_AFFIRMATION_LINE_HEIGHT * HERO_AFFIRMATION_MAX_LINES

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

  const handleEnterGallery = () => {
    addHapticFeedback(HapticStrength.Light)
    markDayCompleteDeparture(chakraDay ?? 0)
    useCompletedChakraStore.getState().clearCompletedChakra()
    router.replace(
      `/(chakras)/GalleryOfGnosis?chakra=${currentChakra}` as const,
    )
    onClose()
  }

  const handleNavigateHome = () => {
    addHapticFeedback(HapticStrength.Light)
    markDayCompleteDeparture(chakraDay ?? 0)
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
  const doorOpacity = useSharedValue(0)
  const blessingOpacity = useSharedValue(0)
  const mantraOpacity = useSharedValue(0)

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const goodbyeStyle = useAnimatedStyle(() => ({
    opacity: goodbyeOpacity.value,
  }))

  const platePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: platePulse.value }],
  }))

  const doorStyle = useAnimatedStyle(() => ({
    opacity: doorOpacity.value,
  }))

  const blessingStyle = useAnimatedStyle(() => ({
    opacity: blessingOpacity.value,
  }))

  const mantraStyle = useAnimatedStyle(() => ({
    opacity: mantraOpacity.value,
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
      doorOpacity.value = 0
      blessingOpacity.value = 0
      mantraOpacity.value = 0
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
    doorOpacity.value = 0
    blessingOpacity.value = 0
    mantraOpacity.value = 0
    setBlessingReady(false)
    doorOpacity.value = withDelay(
      DOOR_FADE_DELAY_MS,
      withTiming(1, {
        duration: DOOR_FADE_MS,
        easing: MAGICAL_EASE,
      }),
    )
    const blessingReveal = setTimeout(() => {
      if (!isVisibleRef.current) return
      setBlessingReady(true)
      blessingOpacity.value = withTiming(1, {
        duration: BLESSING_FADE_MS,
        easing: MAGICAL_EASE,
      })
      mantraOpacity.value = withDelay(
        BLESSING_MANTRA_STAGGER_MS,
        withTiming(1, {
          duration: BLESSING_FADE_MS,
          easing: MAGICAL_EASE,
        }),
      )
    }, BLESSING_HOLD_MS)
    return () => clearTimeout(blessingReveal)
  }, [isVisible, stage, goodbyeOpacity, platePulse, doorOpacity, blessingOpacity, mantraOpacity])

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
        pointerEvents="auto"
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
            hitSlop={TOUCH.hitSlop}
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
            style={styles.goodbyeScroll}
            contentContainerStyle={[
              styles.goodbyeInner,
              {
                paddingTop: overlayTop + 48,
              },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
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
                  style={[styles.galleryDoorLabelSlot, doorStyle]}
                  pointerEvents="none"
                >
                  <AppText
                    font="cormorant-italic"
                    style={styles.galleryDoorLabel}
                  >
                    {GALLERY_GOODBYE_DOOR}
                  </AppText>
                </Animated.View>
                <Animated.View
                  style={[
                    styles.plateHalo,
                    {
                      width: plateWidth,
                      height: plateHeight,
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
                    style={styles.plateImage}
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
                <Animated.View
                  style={[styles.galleryDoorLabelSlot, doorStyle]}
                  pointerEvents="none"
                >
                  <AppText
                    font="cormorant-italic"
                    style={styles.galleryDoorLabel}
                  >
                    {GALLERY_GOODBYE_DOOR}
                  </AppText>
                </Animated.View>
              </Pressable>
            )}

            <AppText font="cormorant-italic" style={styles.closing}>
              {closingMessage}
            </AppText>

            <View style={styles.heroCenter} pointerEvents="none">
              <Animated.View
                style={[styles.heroSlot, mantraStyle]}
              >
                <AppText
                  font="cormorant-italic"
                  numberOfLines={HERO_AFFIRMATION_MAX_LINES}
                  style={styles.heroMantra}
                >
                  {heroMantra}
                </AppText>
              </Animated.View>
            </View>

            <View style={styles.giftSlot} pointerEvents="none">
              <Animated.View style={[styles.giftReveal, blessingStyle]}>
                {content?.goodbye?.chakraImage ? (
                  <View style={styles.ballWrap}>
                    <SoftChakraBall
                      source={content.goodbye.chakraImage}
                      size={108}
                      glowColor={hexToRgba(chakraColor, 0.28)}
                    />
                  </View>
                ) : (
                  <View style={styles.ballWrap} />
                )}
              </Animated.View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.homeFooter,
              { paddingBottom: bottomInset + 12 },
            ]}
            pointerEvents="auto"
          >
            {chakraDay === 0 ? (
              <View style={styles.alignmentSlot}>
                <DailyAlignmentToggleRow
                  style={styles.alignmentToggle}
                />
              </View>
            ) : null}
            <Pressable
              onPress={handleNavigateHome}
              delayPressIn={
                Platform.OS === "android" ? ANDROID_PRESS_DELAY_MS : undefined
              }
              hitSlop={TOUCH.hitSlop}
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
        </Animated.View>
    )
  }

  return (
    <Animated.View
      pointerEvents={isVisible ? "auto" : "none"}
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
  goodbyeScroll: {
    flex: 1,
  },
  goodbyeInner: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  ballWrap: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  giftSlot: {
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    minHeight: 128 + 16,
  },
  giftReveal: {
    alignItems: "center",
    width: "100%",
  },
  heroCenter: {
    flexGrow: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    minHeight: HERO_SLOT_HEIGHT + 24,
    paddingVertical: 12,
  },
  heroSlot: {
    width: "100%",
    minHeight: HERO_SLOT_HEIGHT,
    justifyContent: "center",
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
    marginTop: 10,
    marginBottom: 4,
    maxWidth: 360,
  },
  homeFooter: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 8,
    zIndex: 20,
  },
  alignmentSlot: {
    width: "100%",
    marginBottom: 36,
    paddingTop: 10,
  },
  alignmentToggle: {
    marginTop: 0,
    marginBottom: 0,
  },
  galleryDoor: {
    marginTop: 4,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  galleryDoorFallback: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: 360,
    marginTop: 18,
  },
  galleryDoorLabelSlot: {
    width: "100%",
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryDoorLabel: {
    color: "rgba(232, 201, 140, 0.92)",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    maxWidth: 280,
    paddingHorizontal: 8,
  },
  plateHalo: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 28,
    // Android elevation paints a bottom-right shadow that pulls the plate
    // off the optical center. The glow behind the card is the bloom.
    ...Platform.select({
      ios: {},
      android: { elevation: 0 },
    }),
  },
  plateImage: {
    width: "100%",
    height: "100%",
  },
  plateGlow: {
    position: "absolute",
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 999,
    transform: [{ scaleX: 0.86 }, { scaleY: 0.9 }],
  },
  homeButton: {
    paddingVertical: 18,
    paddingHorizontal: 56,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.5)",
    backgroundColor: "rgba(168, 201, 154, 0.2)",
    minWidth: 220,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
})

export default GoodbyeModal
