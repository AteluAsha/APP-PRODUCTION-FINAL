import React, { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  Image,
  useWindowDimensions,
  Pressable,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, {
  useAnimatedRef,
  FadeIn,
  Easing,
} from "react-native-reanimated"
import { ActionBarAnimated } from "@/components/ActionBarAnimated"
import { HeaderSection } from "@/components/chakras/HeaderSection"
import { chakraContent } from "@/constants/chakras/content"
import {
  SCROLL_BREATHING_BOTTOM_PADDING,
  SOMATIC_CONTENT_FADE_MS,
} from "@/constants/layout"
import { PillBottomSheet } from "@/components/chakras/PillBottomSheet"
import { PillSection } from "@/components/chakras/PillSection"
import { Divider } from "@/components/chakras/Divider"
import { AudioRow } from "@/components/chakras/AudioRow"
import { WisdomOverviewSection } from "@/components/chakras/WisdomOverviewSection"
import { AffirmationSection } from "@/components/chakras/AffirmationSection"
import { PillType } from "@/types/chakras/PillType"
import ParallaxScrollView from "@/components/ParallaxScrollView"
import { HeaderBackground } from "@/components/chakras/HeaderBackground"
import Part2Section from "@/components/chakras/Part2Section"
import ElementsSection from "@/components/chakras/ElementsSection"
import Part3Section from "@/components/chakras/Part3Section"
import SectionHeader from "@/components/chakras/SectionHeader"
import ResponsiveImage from "@/components/ResponsiveImage"
import { AppText } from "@/components/AppText"
import { Chakra } from "@/types/chakras/Chakra"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import { goToChakraHubRoot } from "@/utils/navigationHelpers"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useEmbodimentAudio, getEmbodimentAudioId } from "@/hooks/useEmbodimentAudio"
import { useEmbodimentDurationCacheStore } from "@/hooks/useEmbodimentDurationCacheStore"
import { useTuningForkAudio, getTuningForkFileName } from "@/hooks/useTuningForkAudio"
import { hasSanctuaryTuningFork } from "@/constants/sanctuaryAudioManifest"
import { storage } from "@/src/services/firebase"
import { preloadFullFilesForChakra } from "@/src/utils/audioPreloadManifest"
import { DropInButton } from "@/components/chakras/DropInButton"
// Social Sanctuary and Anua access handled globally by PermanentMenuBar
import { getChakraIndex } from "@/utils/chakraMapping"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { usePillBottomSheetStore } from "@/hooks/usePillBottomSheetStore"
import { RemembranceButton } from "@/components/chakras/RemembranceButton"

const ChakraTemplate = ({ chakra }: { chakra: Chakra }) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
  const [currentPill, setCurrentPill] = useState<PillType | null>(null)
  // Note: Social Sanctuary and Anua access handled globally by PermanentMenuBar
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const router = useRouter()

  const { setCompletedChakra, clearCompletedChakra } = useCompletedChakraStore(
    useShallow((state) => ({
      setCompletedChakra: state.setCompletedChakra,
      clearCompletedChakra: state.clearCompletedChakra,
    })),
  )

  const {
    markChakraCompleted,
    completedChakras,
  } = useChakraJourneyStore(
    useShallow((state) => ({
      markChakraCompleted: state.markChakraCompleted,
      completedChakras: state.completedChakras,
    })),
  )

  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false)
  const [contentKey, setContentKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const isFirstFocusRef = useRef(true)

  // Android (and safe for iOS): When returning to this screen via back button, Reanimated entering
  // animations may not re-run and content can stay blank. Remount scroll content on focus so FadeIn runs again.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false
        return
      }
      setContentKey((k) => k + 1)
    }, []),
  )

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setContentKey((k) => k + 1)
    setTimeout(() => setRefreshing(false), 400)
  }, [])

  const getChakraName = (chakraName: Chakra): string => {
    switch (chakraName) {
      case Chakra.ROOT:
        return "Root Chakra"
      case Chakra.SACRAL:
        return "Sacral Chakra"
      case Chakra.SOLAR_PLEXUS:
        return "Solar Plexus Chakra"
      case Chakra.HEART:
        return "Heart Chakra"
      case Chakra.THROAT:
        return "Throat Chakra"
      case Chakra.THIRD_EYE:
        return "Third Eye Chakra"
      case Chakra.CROWN:
        return "Crown Chakra"
      default:
        return "Chakra"
    }
  }

  const chakraDay = getChakraIndex(chakra)
  const chakraName = getChakraName(chakra)

  // CRITICAL: Do NOT mark completion on mount - only mark when user actually completes
  // Completion should only be marked in navigateBack when isCompleted is true,
  // or when the completion is triggered from the goodbye modal

  const navigateBack = (isCompleted: boolean) => {
    if (isCompleted) {
      const chakraIndex = getChakraIndex(chakra)
      markChakraCompleted(chakraIndex)
      setCompletedChakra(chakra)
      setShowGoodbyeModal(true)
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }

  const handleBackToHub = () => {
    addHapticFeedback(HapticStrength.Light)
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }

  const handleGoodbyeNavigateHome = () => {
    setShowGoodbyeModal(false)
    goToChakraHubRoot()
  }

  const content = chakraContent[chakra]

  const { width: screenWidth } = useWindowDimensions()

  // Backup cache: when day opens, trigger full-file download of all this day's audio one at a time (in case waiting room was bypassed).
  useEffect(() => {
    if (!storage) return
    preloadFullFilesForChakra(storage, chakra).catch(() => {})
  }, [chakra])

  // Backup cache: when user presses any audio on this day, trigger same so rest of day's audio is cached after that track loads.
  const triggerBackupCacheForDay = useCallback(() => {
    if (!storage) return
    preloadFullFilesForChakra(storage, chakra).catch(() => {})
  }, [chakra])

  // Master Embodiment: on-device pack / ODR only. Miss = local error.
  const embodimentAudio = useEmbodimentAudio(chakra)
  const tuningForkAudio = useTuningForkAudio(chakra)
  const embodimentDurations = useEmbodimentDurationCacheStore((s) => s.durations)

  // Track pill bottom sheet visibility globally
  const setIsPillBottomSheetVisible = usePillBottomSheetStore(
    (state) => state.setIsVisible,
  )

  const handlePillPress = useCallback(
    (pill: PillType) => {
      addHapticFeedback(HapticStrength.Light)
      switch (pill) {
        case PillType.CHAKRAS:
          router.push("/(chakras)/Chakras101")
          break
        case PillType.FREQUENCY:
        case PillType.IDENTITY_STATEMENT:
        case PillType.SEED_MANTRA:
          setCurrentPill(pill)
          setIsBottomSheetVisible(true)
          setIsPillBottomSheetVisible(true) // Update global store
          break
      }
    },
    [
      chakra,
      router,
      setCurrentPill,
      setIsBottomSheetVisible,
      setIsPillBottomSheetVisible,
    ],
  )

  const handleBottomSheetClose = useCallback(() => {
    setIsBottomSheetVisible(false)
    setCurrentPill(null) // Resetting pill when sheet closes
    setIsPillBottomSheetVisible(false) // Update global store
  }, [setIsBottomSheetVisible, setCurrentPill, setIsPillBottomSheetVisible])

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ActionBarAnimated
        scrollViewRef={scrollRef}
        headerImageSource={content.chakraHeaderImage}
        onBackPress={handleBackToHub}
      />

      <ParallaxScrollView
        scrollRef={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        headerHeight={screenWidth}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="rgba(135, 174, 115, 0.9)"
          />
        }
        headerImage={
          <View style={{ width: "100%", height: screenWidth }}>
            <HeaderBackground
              backgroundSource={content.header.headerBackground}
              chakraImageSource={content.chakraHeaderImage}
              chakraImageSizePx={content.header.chakraImageSizePx}
              headerHeight={screenWidth}
              chakra={chakra}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "flex-end",
              }}
              pointerEvents="box-none"
            >
              <HeaderSection
                headerHeight={screenWidth}
                textLine1={content.header.textLine1}
                textLine2={content.header.textLine2}
                textLine3={content.header.textLine3}
              />
            </View>
          </View>
        }
      >
        <View
          key={contentKey}
          style={{ paddingBottom: 80 + SCROLL_BREATHING_BOTTOM_PADDING, paddingTop: 8 }}
        >
          <Animated.View
            style={{ backgroundColor: "#000000" }}
            entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
              .delay(80)
              .easing(Easing.out(Easing.ease))}
          >
            {/* Master meditation: baked layout so page and buttons appear in one paint (no "Preparing..." swap). */}
            <Animated.View
              entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
                .delay(40)
                .easing(Easing.out(Easing.ease))}
              style={{ marginBottom: 8 }}
            >
            {/* Drop In above master meditation — tuning fork somatic entrance */}
            {hasSanctuaryTuningFork(chakra) ? (
                <View style={{ alignItems: "center", marginTop: 8, marginBottom: 14 }}>
                  <DropInButton
                    audioUri={
                      tuningForkAudio.localUri ?? tuningForkAudio.url ?? null
                    }
                    audioId={`tuning_fork_${chakra}_${getTuningForkFileName(chakra)}`}
                    disabled={false}
                    compact
                  />
                </View>
              ) : null}
              <AudioRow
                title={content.audioIntro.title}
                author="Mother JJ"
                durationMs={
                  embodimentDurations[getEmbodimentAudioId(chakra)] ??
                  content.audioIntro.durationMs
                }
                authorColor="#FFFFFF"
                isIntroAudio={true}
                chakraColor={getChakraColor(chakraDay)}
                disabled={false}
                embodimentCacheKey={getEmbodimentAudioId(chakra)}
                onPlayTriggered={triggerBackupCacheForDay}
              />
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
                .delay(120)
                .easing(Easing.out(Easing.ease))}
            >
              <PillSection chakra={chakra} onPress={handlePillPress} />
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
                .delay(180)
                .easing(Easing.out(Easing.ease))}
            >
              <Divider style={{ marginHorizontal: 32, marginBottom: 16 }} />
              <WisdomOverviewSection
                overview={content.overview}
                sanskrit={content.sanskrit}
              />
              <AffirmationSection affirmationText={content.affirmationText} />
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
                .delay(220)
                .easing(Easing.out(Easing.ease))}
            >
              <ResponsiveImage
                source={content.locationImage}
                width={screenWidth}
                style={{ alignSelf: "center", marginTop: 40 }}
              />
              <Part2Section chakra={chakra} />
              <ElementsSection chakra={chakra} />
              <Part3Section chakra={chakra} />
            </Animated.View>
          </Animated.View>
          {/* PART IV - Reflection of Remembrance */}
          <Animated.View
            entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
              .delay(320)
              .easing(Easing.out(Easing.ease))}
            style={{
              marginTop: 48,
              marginHorizontal: 12,
              marginBottom: 32,
              paddingTop: 28,
              paddingBottom: 32,
              paddingHorizontal: 16,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(232, 201, 140, 0.14)",
              backgroundColor: "rgba(8, 6, 5, 0.42)",
              alignItems: "center",
              width: undefined,
              alignSelf: "stretch",
            }}
          >
            <SectionHeader
              variant="healing"
              subtitle="— PART IV —"
              title="Reflection of Remembrance"
            />
            <View
              style={{
                height: 1,
                width: 64,
                backgroundColor: "rgba(142, 142, 142, 0.65)",
                alignSelf: "center",
                marginBottom: 24,
              }}
            />
            <RemembranceButton
              chakra={chakra}
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                router.push(`/(chakras)/QuizScreen?day=${chakraDay + 1}`)
              }}
            />
          </Animated.View>
          {/* Completion Ceremony - whole section tappable; checkbox fills when completed; resets Monday midnight via week transition */}
          <Animated.View
            entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
              .delay(360)
              .easing(Easing.out(Easing.ease))}
            style={{ marginTop: 48, marginBottom: 24, alignItems: "center" }}
          >
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                navigateBack(true)
              }}
              style={{ alignItems: "center" }}
              accessibilityLabel="Mark day complete"
              accessibilityHint="Tap to complete today's journey"
            >
              <Image
                source={content.goodbye.chakraImage}
                resizeMode="contain"
                style={{ width: 102, height: 102 }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    marginRight: 10,
                    borderRadius: 3,
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.75)",
                    backgroundColor: completedChakras.includes(chakraDay)
                      ? "#ffffff"
                      : "transparent",
                  }}
                />
                <AppText
                  font="koh-santepheap"
                  size="xl"
                  style={{
                    textAlign: "center",
                    color: "#ffffff",
                  }}
                >
                  {content.goodbye.content}
                </AppText>
              </View>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.7)",
                  fontStyle: "italic",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
              >
                I have completed today's journey
              </AppText>
            </Pressable>
          </Animated.View>
        </View>
      </ParallaxScrollView>

      {currentPill && (
        <PillBottomSheet
          pill={currentPill}
          isVisible={isBottomSheetVisible}
          onClose={handleBottomSheetClose}
          chakra={chakra}
        />
      )}

      <GoodbyeModal
        isVisible={showGoodbyeModal}
        onClose={() => {
          setShowGoodbyeModal(false)
          clearCompletedChakra()
        }}
        chakraDay={chakraDay}
        onNavigateHome={handleGoodbyeNavigateHome}
      />

      {/* Note: Social Sanctuary and Anua access is handled globally by PermanentMenuBar */}
    </SafeAreaView>
  )
}

export default ChakraTemplate
