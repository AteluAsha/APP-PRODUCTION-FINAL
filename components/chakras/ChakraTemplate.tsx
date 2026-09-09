import React, { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  useWindowDimensions,
  Pressable,
  RefreshControl,
  Platform,
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
import { Part4BridgeSection } from "@/components/chakras/Part4BridgeSection"
import { BridgeCueModal } from "@/components/chakras/BridgeCueModal"
import ResponsiveImage from "@/components/ResponsiveImage"
import { AppText } from "@/components/AppText"
import { Chakra } from "@/types/chakras/Chakra"
import { usePathname, useRouter } from "expo-router"
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
import { SoftChakraBall } from "@/components/chakras/SoftChakraBall"
// Social Sanctuary and Anua access handled globally by PermanentMenuBar
import { getChakraIndex } from "@/utils/chakraMapping"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { usePillBottomSheetStore } from "@/hooks/usePillBottomSheetStore"
import { useAncestralBridgeStore } from "@/hooks/useAncestralBridgeStore"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { openAshaSpeaks } from "@/utils/openAshaSpeaks"

const ChakraTemplate = ({ chakra }: { chakra: Chakra }) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
  const [currentPill, setCurrentPill] = useState<PillType | null>(null)
  // Note: Social Sanctuary and Anua access handled globally by PermanentMenuBar
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const router = useRouter()
  const pathname = usePathname()

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
  const [bridgeCueVisible, setBridgeCueVisible] = useState(false)
  const [contentKey, setContentKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const isFirstFocusRef = useRef(true)
  const openAshaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const chakraDay = getChakraIndex(chakra)
  const pendingBridgeCue = useAncestralBridgeStore((s) => s.pendingBridgeCue)

  useEffect(() => {
    const offer = pendingBridgeCue === chakra && !showGoodbyeModal
    if (!offer) {
      setBridgeCueVisible(false)
      return
    }
    const t = setTimeout(() => setBridgeCueVisible(true), 640)
    return () => clearTimeout(t)
  }, [pendingBridgeCue, chakra, showGoodbyeModal])

  const finishBridgeCue = useCallback(
    (openAsha: boolean) => {
      setBridgeCueVisible(false)
      useFirstLaunchStore.getState().markBridgeCueOffered(chakraDay)
      useAncestralBridgeStore.getState().setPendingBridgeCue(null)
      if (!openAsha) return
      if (openAshaTimerRef.current) clearTimeout(openAshaTimerRef.current)
      const delay = Platform.OS === "android" ? 360 : 80
      openAshaTimerRef.current = setTimeout(() => {
        openAshaTimerRef.current = null
        openAshaSpeaks(chakra, pathname)
      }, delay)
    },
    [chakra, chakraDay, pathname],
  )

  useEffect(() => {
    return () => {
      if (openAshaTimerRef.current) clearTimeout(openAshaTimerRef.current)
    }
  }, [])

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
    if (
      chakraDay === 6 &&
      !useFirstLaunchStore.getState().hasSeenCrownReminderNotice
    ) {
      useFirstLaunchStore.getState().setPendingCrownReminderNotice(true)
    }
    setShowGoodbyeModal(false)
    clearCompletedChakra()
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
  useEmbodimentAudio(chakra)
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
            {/* Drop In above master meditation — tuning fork somatic entrance */}
            <Animated.View
              entering={FadeIn.duration(SOMATIC_CONTENT_FADE_MS)
                .delay(40)
                .easing(Easing.out(Easing.ease))}
              style={{ marginBottom: 8 }}
            >
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
                style={{ alignSelf: "center", marginTop: 12 }}
              />
              <Part2Section chakra={chakra} />
              <ElementsSection chakra={chakra} />
              <Part3Section chakra={chakra} />
            </Animated.View>
          </Animated.View>
          <Part4BridgeSection chakra={chakra} />
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
              <SoftChakraBall
                source={content.goodbye.chakraImage}
                size={102}
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

      <BridgeCueModal
        visible={bridgeCueVisible}
        onContinue={() => finishBridgeCue(true)}
        onDismiss={() => finishBridgeCue(false)}
      />

      {/* Note: Social Sanctuary and Anua access is handled globally by PermanentMenuBar */}
    </SafeAreaView>
  )
}

export default ChakraTemplate
