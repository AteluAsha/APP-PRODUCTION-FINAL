import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Image,
  useWindowDimensions,
  Pressable,
  ImageBackground,
  StyleSheet,
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
import { SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
import { PillBottomSheet } from "@/components/chakras/PillBottomSheet"
import { PillSection } from "@/components/chakras/PillSection"
import { Divider } from "@/components/chakras/Divider"
import { AudioRow } from "@/components/chakras/AudioRow"
import { TextSection } from "@/components/chakras/TextSection"
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
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useEmbodimentAudio } from "@/hooks/useEmbodimentAudio"
import { useTuningForkAudio } from "@/hooks/useTuningForkAudio"
import { DropInButton } from "@/components/chakras/DropInButton"
// Social Sanctuary and Anua access handled globally by FloatingNavButtons
import { getChakraIndex } from "@/utils/chakraMapping"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { getIntegrationMomentContent } from "@/constants/chakras/integrationMomentContent"
import { IntegrationMomentModal } from "@/components/chakras/IntegrationMomentModal"

const INTEGRATION_BUTTON_BG = require("@/assets/images/DailyIntegration_BGB_utton_Image.png")
import { usePillBottomSheetStore } from "@/hooks/usePillBottomSheetStore"
import { LinearGradient } from "expo-linear-gradient"

const ChakraTemplate = ({ chakra }: { chakra: Chakra }) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
  const [currentPill, setCurrentPill] = useState<PillType | null>(null)
  const [integrationModalVisible, setIntegrationModalVisible] = useState(false)
  // Note: Social Sanctuary and Anua access handled globally by FloatingNavButtons
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
    hasLifetimeAccess,
    lifetimeChosenTimegateJourney,
    hasCompletedChakra,
  } = useChakraJourneyStore(
    useShallow((state) => ({
      markChakraCompleted: state.markChakraCompleted,
      hasLifetimeAccess: state.hasLifetimeAccess,
      lifetimeChosenTimegateJourney: state.lifetimeChosenTimegateJourney,
      hasCompletedChakra: state.hasCompletedChakra,
    })),
  )

  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false)

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
    } else {
      router.back()
    }
  }

  const handleGoodbyeNavigateHome = () => {
    clearCompletedChakra()
    setShowGoodbyeModal(false)
    if (hasLifetimeAccess && lifetimeChosenTimegateJourney) {
      router.replace("/(chakras)/ChakraHome")
    } else if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
    } else {
      router.replace("/(chakras)/ChakraHome")
    }
  }

  const content = chakraContent[chakra]

  const { width: screenWidth } = useWindowDimensions()

  // Fetch Firebase Storage URLs for embodiment audio files
  const embodimentAudio = useEmbodimentAudio(chakra)
  const tuningForkAudio = useTuningForkAudio(chakra)

  // Debug logging to verify correct chakra and audio mapping
  useEffect(() => {
    if (__DEV__) {
      console.log(
        `[ChakraTemplate] Rendering for chakra: ${chakra}, Day: ${chakraDay}, Name: ${chakraName}`,
      )
      console.log(`[ChakraTemplate] Embodiment audio state:`, {
        hasSingle: !!embodimentAudio.single,
        hasPartOne: !!embodimentAudio.partOne,
        hasPartTwo: !!embodimentAudio.partTwo,
        isLoading: embodimentAudio.isLoading,
        error: embodimentAudio.error?.message,
      })
      if (embodimentAudio.single) {
        console.log(
          `[ChakraTemplate] Single audio URL (first 50 chars):`,
          embodimentAudio.single.substring(0, 50),
        )
      }
      if (embodimentAudio.partOne) {
        console.log(
          `[ChakraTemplate] Part One audio URL (first 50 chars):`,
          embodimentAudio.partOne.substring(0, 50),
        )
      }
      if (embodimentAudio.partTwo) {
        console.log(
          `[ChakraTemplate] Part Two audio URL (first 50 chars):`,
          embodimentAudio.partTwo.substring(0, 50),
        )
      }
    }
  }, [chakra, chakraDay, chakraName, embodimentAudio])

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
        showBackButton={false}
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
        <View style={{ paddingBottom: 80 + SCROLL_BREATHING_BOTTOM_PADDING, paddingTop: 8 }}>
          <Animated.View
            style={{ backgroundColor: "#000000" }}
            entering={FadeIn.duration(520)
              .delay(80)
              .easing(Easing.out(Easing.ease))}
          >
            {/* Master meditation: baked layout so page and buttons appear in one paint (no "Preparing..." swap). */}
            <Animated.View
              entering={FadeIn.duration(460)
                .delay(40)
                .easing(Easing.out(Easing.ease))}
              style={{ marginBottom: 8 }}
            >
              {embodimentAudio.error ? (
                <View
                  style={{
                    marginHorizontal: 24,
                    marginBottom: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(168,85,247,0.4)",
                    backgroundColor: "rgba(168,85,247,0.08)",
                  }}
                >
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={{
                      color: "rgba(216,180,254,0.9)",
                      textAlign: "center",
                    }}
                  >
                    The audio is taking a moment to arrive. Please try again, or
                    continue your journey.
                  </AppText>
                </View>
              ) : null}
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <DropInButton
                  audioUri={
                    tuningForkAudio.localUri ?? tuningForkAudio.url ?? null
                  }
                  disabled={tuningForkAudio.isLoading}
                  compact
                />
              </View>
              {chakra === Chakra.THIRD_EYE ? (
                <>
                  <AudioRow
                    title="Part One: Ajna Embodiment"
                    author="Mother JJ"
                    durationMs={1750000}
                    audioSource={{
                      uri:
                        embodimentAudio.localUriPartOne ||
                        embodimentAudio.partOne ||
                        "",
                    }}
                    authorColor="#FFFFFF"
                    isIntroAudio={true}
                    chakraColor={getChakraColor(chakraDay)}
                    disabled={
                      embodimentAudio.isLoading || !!embodimentAudio.error
                    }
                  />
                  <AudioRow
                    title="Part Two: Somatic Healing"
                    author="Mother JJ"
                    durationMs={1257000}
                    audioSource={{
                      uri:
                        embodimentAudio.localUriPartTwo ||
                        embodimentAudio.partTwo ||
                        "",
                    }}
                    authorColor="#FFFFFF"
                    isIntroAudio={true}
                    chakraColor={getChakraColor(chakraDay)}
                    disabled={
                      embodimentAudio.isLoading || !!embodimentAudio.error
                    }
                  />
                </>
              ) : (
                <AudioRow
                  title={content.audioIntro.title}
                  author="Mother JJ"
                  durationMs={
                    chakra === Chakra.CROWN
                      ? 2684000
                      : content.audioIntro.durationMs
                  }
                  audioSource={{
                    uri:
                      embodimentAudio.localUri ||
                      embodimentAudio.single ||
                      "",
                  }}
                  authorColor="#FFFFFF"
                  isIntroAudio={true}
                  chakraColor={getChakraColor(chakraDay)}
                  disabled={
                    embodimentAudio.isLoading || !!embodimentAudio.error
                  }
                />
              )}
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(440)
                .delay(120)
                .easing(Easing.out(Easing.ease))}
            >
              <PillSection chakra={chakra} onPress={handlePillPress} />
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(420)
                .delay(180)
                .easing(Easing.out(Easing.ease))}
            >
              <Divider style={{ marginHorizontal: 32, marginBottom: 16 }} />
              <TextSection title="OVERVIEW" content={content.overview} />
              <TextSection title="SANSKRIT" content={content.sanskrit} />
              <AffirmationSection affirmationText={content.affirmationText} />
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(440)
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
          <Animated.View
            entering={FadeIn.duration(420)
              .delay(280)
              .easing(Easing.out(Easing.ease))}
          >
          <Pressable
            onPress={() => {
              setIntegrationModalVisible(true)
              addHapticFeedback(HapticStrength.Light)
            }}
            style={{
              width: "83.33%",
              alignSelf: "center",
              marginTop: 6,
              marginBottom: 28,
              borderRadius: 18,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <ImageBackground
              source={INTEGRATION_BUTTON_BG}
              resizeMode="cover"
              style={{
                borderRadius: 18,
                paddingVertical: 16,
                paddingHorizontal: 28,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Dark overlay so title and subtitle stay readable on all parts of the image */}
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 18,
                }}
              />
              <AppText
                font="cormorant-italic"
                size="base"
                style={{
                  marginBottom: 4,
                  fontSize: 20,
                  color: "#ffffff",
                  textAlign: "center",
                  textShadowColor: "rgba(0,0,0,0.8)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {getIntegrationMomentContent(chakraDay)?.title ??
                  "Bridge moment"}
              </AppText>
              <AppText
                font="instrument-italic"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.98)",
                  textAlign: "center",
                  textShadowColor: "rgba(0,0,0,0.8)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                A moment of Integration
              </AppText>
            </ImageBackground>
          </Pressable>
          <IntegrationMomentModal
            visible={integrationModalVisible}
            onClose={() => setIntegrationModalVisible(false)}
            dayIndex={chakraDay}
          />
          </Animated.View>
          {/* PART IV - Mirror of Embodiment: section header, divider, quiz button */}
          <Animated.View
            entering={FadeIn.duration(420)
              .delay(320)
              .easing(Easing.out(Easing.ease))}
            style={{ marginTop: 28, marginBottom: 24, alignItems: "center" }}
          >
            <SectionHeader
              subtitle="— PART IV —"
              title="Mirror of Embodiment"
            />
            <View
              style={{
                height: 1,
                width: 64,
                backgroundColor: "#8E8E8E",
                alignSelf: "center",
                marginBottom: 24,
              }}
            />
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                router.push(`/(chakras)/QuizScreen?day=${chakraDay + 1}`)
              }}
              style={{
                shadowColor: "#2a2520",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.7,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(212, 197, 169, 0.18)",
                  "rgba(168, 201, 154, 0.12)",
                  "rgba(139, 115, 85, 0.22)",
                  "rgba(90, 74, 58, 0.35)",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0, 0.35, 0.7, 1]}
                style={{
                  borderRadius: 20,
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  borderWidth: 1,
                  borderColor: "rgba(139, 115, 85, 0.45)",
                  alignItems: "center",
                  minWidth: 220,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.12)",
                    "rgba(255, 255, 255, 0.02)",
                    "transparent",
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "55%",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }}
                />
                <AppText
                  font="koh-santepheap"
                  size="lg"
                  style={{
                    textAlign: "center",
                    color: "#ffffff",
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                    zIndex: 10,
                  }}
                >
                  A Test of Remembrance
                </AppText>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          {/* Completion Ceremony - whole section tappable; checkbox fills when completed; resets Monday midnight via week transition */}
          <Animated.View
            entering={FadeIn.duration(440)
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
                style={{ width: 128, height: 128 }}
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
                    backgroundColor: hasCompletedChakra(chakraDay)
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
        onClose={() => setShowGoodbyeModal(false)}
        chakraDay={chakraDay}
        navigateToHubOnHome={!lifetimeChosenTimegateJourney}
        onNavigateHome={handleGoodbyeNavigateHome}
      />

      {/* Note: Social Sanctuary and Anua access is handled globally by FloatingNavButtons */}
    </SafeAreaView>
  )
}

export default ChakraTemplate
