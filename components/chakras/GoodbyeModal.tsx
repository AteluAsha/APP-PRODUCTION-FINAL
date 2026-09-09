/**
 * Goodbye – End-of-Day Completion Screen
 *
 * Sequential: word-on-screen presence, then goodbye. The closing transition
 * already showed the chakra and affirmation, so goodbye opens on the blessing
 * and buttons. After 7s the ball and mantra fade in as a quiet gift.
 */
import { AppText } from "@/components/AppText"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  withTiming,
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

const GIFT_REVEAL_DELAY_MS = 7000
const GIFT_REVEAL_FADE_MS = 1600

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
  const goodbyeOpacity = useSharedValue(0)
  const overlayOpacity = useSharedValue(0)
  const giftOpacity = useSharedValue(0)
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

  const handleClaimCard = () => {
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

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const goodbyeStyle = useAnimatedStyle(() => ({
    opacity: goodbyeOpacity.value,
  }))

  const giftStyle = useAnimatedStyle(() => ({
    opacity: giftOpacity.value,
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
      giftOpacity.value = 0
      setStage("presence")
      return
    }
    setStage("presence")
    goodbyeOpacity.value = 0
    giftOpacity.value = 0
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
  }, [isVisible, goodbyeOpacity, overlayOpacity, giftOpacity])

  useEffect(() => {
    if (!isVisible || stage !== "goodbye") return
    goodbyeOpacity.value = 0
    goodbyeOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.ease),
    })
    giftOpacity.value = 0
    const reveal = setTimeout(() => {
      if (!isVisibleRef.current) return
      giftOpacity.value = withTiming(1, {
        duration: GIFT_REVEAL_FADE_MS,
        easing: Easing.out(Easing.ease),
      })
    }, GIFT_REVEAL_DELAY_MS)
    return () => clearTimeout(reveal)
  }, [isVisible, stage, goodbyeOpacity, giftOpacity])

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

          <View
            style={[
              styles.goodbyeInner,
              {
                paddingTop: overlayTop + 48,
                paddingBottom: bottomInset + 24,
              },
            ]}
          >
            <Animated.View
              style={[styles.giftReveal, giftStyle]}
              pointerEvents="none"
            >
              {content?.goodbye?.chakraImage ? (
                <View style={styles.ballWrap}>
                  <SoftChakraBall
                    source={content.goodbye.chakraImage}
                    size={148}
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

            <View style={styles.goldLine} />

            <AppText font="cormorant-italic" style={styles.closing}>
              {closingMessage}
            </AppText>

            {chakraDay === 0 ? <DailyAlignmentToggleRow /> : null}

            <View style={styles.actions}>
              <Pressable
                onPress={handleClaimCard}
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}
                accessibilityLabel="Claim your chakra card"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={[
                    "rgba(168, 201, 154, 0.9)",
                    "rgba(107, 142, 90, 0.94)",
                    "rgba(212, 165, 116, 0.55)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.claimButton}
                >
                  <AppText
                    font="instrument-semibold"
                    size="sm"
                    style={styles.claimLabel}
                  >
                    Claim Your Chakra Card
                  </AppText>
                </LinearGradient>
              </Pressable>

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
          </View>
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
    width: 168,
    height: 168,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  giftReveal: {
    alignItems: "center",
    width: "100%",
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
  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(232, 201, 140, 0.45)",
    marginVertical: 22,
  },
  closing: {
    textAlign: "center",
    color: "rgba(255,255,255,0.86)",
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
    maxWidth: 360,
  },
  actions: {
    width: "100%",
    alignItems: "center",
    gap: 18,
  },
  claimButton: {
    paddingVertical: Platform.OS === "ios" ? 16 : 15,
    paddingHorizontal: 28,
    borderRadius: 16,
    minHeight: 52,
    minWidth: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  claimLabel: {
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
