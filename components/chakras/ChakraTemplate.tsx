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
  scrollTo,
  runOnUI,
} from "react-native-reanimated"
import { ActionBar } from "@/components/ActionBar"
import { HeaderSection } from "@/components/chakras/HeaderSection"
import { chakraContent } from "@/constants/chakras/content"
import { SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
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
import Part3Section from "@/components/chakras/Part3Section"
import { Part4BridgeSection } from "@/components/chakras/Part4BridgeSection"
import { BridgeCueModal } from "@/components/chakras/BridgeCueModal"
import { DayEmbodimentGateModal } from "@/components/chakras/DayEmbodimentGateModal"
import { openAshaSpeaks } from "@/utils/openAshaSpeaks"
import { useDayAudioOpenedStore, waitForDayAudioOpenedHydration } from "@/hooks/useDayAudioOpenedStore"
import { type DayAudioKind } from "@/src/utils/dayAudioEmbodiment"
import { DAY_EMBODIED_CHECKBOX_LABEL } from "@/constants/dayEmbodimentCopy"
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
import { Ionicons } from "@expo/vector-icons"

const ChakraTemplate = ({ chakra }: { chakra: Chakra }) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
  const [currentPill, setCurrentPill] = useState<PillType | null>(null)
  // Note: Social Sanctuary and Anua access handled globally by PermanentMenuBar
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const { width: screenWidth } = useWindowDimensions()
  const router = useRouter()
  const pathname = usePathname()

  const { setCompletedChakra, clearCompletedChakra } = useCompletedChakraStore(
    useShallow((state) => ({
      setCompletedChakra: state.setCompletedChakra,
      clearCompletedChakra: state.clearCompletedChakra,
    })),
  )

  const markChakraCompleted = useChakraJourneyStore(
    (state) => state.markChakraCompleted,
  )
  const hasEmbodiedToday = useDayAudioOpenedStore((s) =>
    s.hasCeremonyClosed(chakra),
  )

  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false)
  const [bridgeCueVisible, setBridgeCueVisible] = useState(false)
  const [embodimentGateVisible, setEmbodimentGateVisible] = useState(false)
  const [embodimentRemaining, setEmbodimentRemaining] = useState<
    DayAudioKind[]
  >([])
  const [contentKey, setContentKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [courseSurfaceReady, setCourseSurfaceReady] = useState(false)
  const isFirstFocusRef = useRef(true)
  const openAshaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const embodimentClosingRef = useRef(false)

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

  useEffect(() => {
    const t = setTimeout(
      () => setCourseSurfaceReady(true),
      Platform.OS === "android" ? 480 : 240,
    )
    return () => clearTimeout(t)
  }, [])

  // CRITICAL: Do NOT mark completion on mount - only mark when user actually completes
  // Completion should only be marked in navigateBack when isCompleted is true,
  // or when the completion is triggered from the goodbye modal

  const navigateBack = (isCompleted: boolean) => {
    if (isCompleted) {
      const chakraIndex = getChakraIndex(chakra)
      useDayAudioOpenedStore.getState().markCeremonyClosed(chakra)
      markChakraCompleted(chakraIndex)
      setCompletedChakra(chakra)
      setShowGoodbyeModal(true)
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }

  const handleEmbodimentCompletePress = () => {
    addHapticFeedback(HapticStrength.Medium)
    if (embodimentClosingRef.current) return
    embodimentClosingRef.current = true
    void (async () => {
      try {
        await waitForDayAudioOpenedHydration()
        const audioOpened = useDayAudioOpenedStore.getState()
        if (audioOpened.hasCeremonyClosed(chakra)) {
          navigateBack(true)
          return
        }
        const missing = audioOpened.missingKinds(chakra)
        if (missing.length > 0) {
          setEmbodimentRemaining(missing)
          setEmbodimentGateVisible(true)
          return
        }
        navigateBack(true)
      } finally {
        embodimentClosingRef.current = false
      }
    })()
  }

  const handleOpenRemainingPath = (kind: DayAudioKind) => {
    setEmbodimentGateVisible(false)
    if (kind === "bridge") {
      openAshaSpeaks(chakra, pathname)
      return
    }
    const y =
      kind === "sound-bath"
        ? Math.max(0, screenWidth + 220)
        : Math.max(0, screenWidth - 24)
    runOnUI(() => {
      "worklet"
      scrollTo(scrollRef, 0, y, true)
    })()
  }

  const handleCloseDayInMyTiming = () => {
    setEmbodimentGateVisible(false)
    navigateBack(true)
  }

  const handleBackToHub = () => {
    addHapticFeedback(HapticStrength.Light)
    goToChakraHubRoot()
  }

  const handleGoodbyeNavigateHome = () => {
    setShowGoodbyeModal(false)
    clearCompletedChakra()
    goToChakraHubRoot()
  }

  const content = chakraContent[chakra]

  // Backup cache: when day opens, trigger full-file download of all this day's audio one at a time (in case waiting room was bypassed).
  useEffect(() => {
    if (!storage) return
    preloadFullFilesForChakra(storage, chakra).catch(() => {})
  }, [chakra])

  // Backup cache: when user presses any audio on this day, trigger same so rest of day's audio is cached after that track loads.
  const triggerBackupCacheForDay = useCallback(() => {
    useDayAudioOpenedStore.getState().markOpened(chakra, "meditation")
    if (!storage) return
    preloadFullFilesForChakra(storage, chakra).catch(() => {})
  }, [chakra])

  // Master Embodiment: on-device pack / ODR only. Miss = local error.
  useEmbodimentAudio(chakra)
  const tuningForkAudio = useTuningForkAudio(chakra)

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

  if (!content) return null

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ActionBar onBackPress={handleBackToHub} />

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
          <View style={{ backgroundColor: "#000000" }}>
            {/* Drop In above master meditation — tuning fork somatic entrance */}
            <View style={{ marginBottom: 8 }}>
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
                durationMs={content.audioIntro.durationMs}
                authorColor="#FFFFFF"
                isIntroAudio={true}
                chakraColor={getChakraColor(chakraDay)}
                disabled={false}
                embodimentCacheKey={getEmbodimentAudioId(chakra)}
                onPlayTriggered={triggerBackupCacheForDay}
              />
            </View>
            <View>
              <PillSection chakra={chakra} onPress={handlePillPress} />
            </View>
            <View>
              <Divider style={{ marginHorizontal: 32, marginBottom: 16 }} />
              <WisdomOverviewSection
                overview={content.overview}
                sanskrit={content.sanskrit}
              />
              <AffirmationSection affirmationText={content.affirmationText} />
            </View>
            <View>
              <ResponsiveImage
                source={content.locationImage}
                width={screenWidth}
                style={{ alignSelf: "center", marginTop: 12 }}
              />
              <Part2Section chakra={chakra} />
              <Part3Section chakra={chakra} />
            </View>
          </View>
          <Part4BridgeSection chakra={chakra} />
          {/* Completion Ceremony - whole section tappable; checkbox fills when completed; resets Monday midnight via week transition */}
          <View
            style={{ marginTop: 48, marginBottom: 24, alignItems: "center" }}
          >
            <Pressable
              onPress={handleEmbodimentCompletePress}
              style={{ alignItems: "center" }}
              accessibilityLabel={DAY_EMBODIED_CHECKBOX_LABEL}
              accessibilityHint="Opens the close when this day's sounds have been opened"
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
                    width: 28,
                    height: 28,
                    marginRight: 12,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: hasEmbodiedToday
                      ? "rgba(232, 201, 140, 0.9)"
                      : "rgba(255, 248, 236, 0.55)",
                    backgroundColor: hasEmbodiedToday
                      ? "rgba(232, 201, 140, 0.22)"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {hasEmbodiedToday ? (
                    <Ionicons
                      name="heart"
                      size={14}
                      color="rgba(232, 201, 140, 0.95)"
                    />
                  ) : (
                    <Ionicons
                      name="heart-outline"
                      size={14}
                      color="rgba(255, 248, 236, 0.55)"
                    />
                  )}
                </View>
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
                font="cormorant-italic"
                style={{
                  textAlign: "center",
                  color: "rgba(255, 248, 236, 0.78)",
                  fontSize: 17,
                  lineHeight: 24,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
              >
                {DAY_EMBODIED_CHECKBOX_LABEL}
              </AppText>
            </Pressable>
          </View>
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

      {courseSurfaceReady ? (
        <>
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

          <DayEmbodimentGateModal
            visible={embodimentGateVisible}
            remaining={embodimentRemaining}
            onOpenPath={handleOpenRemainingPath}
            onCloseInMyTiming={handleCloseDayInMyTiming}
            onStay={() => setEmbodimentGateVisible(false)}
          />
        </>
      ) : null}

      {/* Note: Social Sanctuary and Anua access is handled globally by PermanentMenuBar */}
    </SafeAreaView>
  )
}

export default ChakraTemplate
