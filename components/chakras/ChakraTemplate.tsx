import React, { useState, useEffect, useCallback } from "react"
import { View, Image, useWindowDimensions, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { ActionBarAnimated } from "@/components/ActionBarAnimated"
import { HeaderSection } from "@/components/chakras/HeaderSection"
import { chakraContent } from "@/constants/chakras/content"
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
import ResponsiveImage from "@/components/ResponsiveImage"
import { AppText } from "@/components/AppText"
import { Chakra } from "@/types/chakras/Chakra"
import { useRouter } from "expo-router"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useEmbodimentAudio } from "@/hooks/useEmbodimentAudio"
import { useTuningForkAudio } from "@/hooks/useTuningForkAudio"
import { DropInButton } from "@/components/chakras/DropInButton"
// Social Sanctuary and Anua access handled globally by FloatingNavButtons
import { getChakraIndex } from "@/utils/chakraMapping"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { usePillBottomSheetStore } from "@/hooks/usePillBottomSheetStore"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const ChakraTemplate = ({ chakra }: { chakra: Chakra }) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
  const [currentPill, setCurrentPill] = useState<PillType | null>(null)
  // Note: Social Sanctuary and Anua access handled globally by FloatingNavButtons
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const router = useRouter()

  const setCompletedChakra = useCompletedChakraStore(
    (state) => state.setCompletedChakra,
  )

  const { markChakraCompleted, hasLifetimeAccess } = useChakraJourneyStore(
    useShallow((state) => ({
      markChakraCompleted: state.markChakraCompleted,
      hasLifetimeAccess: state.hasLifetimeAccess,
    })),
  )

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
      // Replace to correct home so GoodbyeModal shows (ChakraHub for lifetime, ChakraHome for trial)
      if (hasLifetimeAccess) {
        router.replace("/(chakras)/ChakraHub")
      } else {
        router.replace("/(chakras)/ChakraHome")
      }
    } else {
      router.back()
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
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <ActionBarAnimated
        scrollViewRef={scrollRef}
        headerImageSource={content.chakraHeaderImage}
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
          <HeaderBackground
            backgroundSource={content.header.headerBackground}
            chakraImageSource={content.chakraHeaderImage}
            chakraImageSizePx={content.header.chakraImageSizePx}
            height={screenWidth}
          />
        }
      >
        <View style={{ paddingBottom: 80 }}>
          <HeaderSection
            headerHeight={screenWidth}
            textLine1={content.header.textLine1}
            textLine2={content.header.textLine2}
            textLine3={content.header.textLine3}
            rightContent={
              hasLifetimeAccess ? (
                <DropInButton
                  audioUri={
                    tuningForkAudio.localUri ?? tuningForkAudio.url ?? null
                  }
                  disabled={tuningForkAudio.isLoading}
                />
              ) : undefined
            }
          />
          <View style={{ backgroundColor: "#000000" }}>
            {/* Embodiment Meditation Audio (audioIntro) - Using Firebase Storage URLs */}
            {embodimentAudio.isLoading ? (
              <View
                style={{
                  width: "83.33%",
                  alignSelf: "center",
                  marginTop: 24,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.75)",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={{ color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}
                >
                  Preparing your meditation space...
                </AppText>
              </View>
            ) : embodimentAudio.error ? (
              <View
                style={{
                  width: "83.33%",
                  alignSelf: "center",
                  marginTop: 24,
                  borderWidth: 1,
                  borderColor: "rgba(168,85,247,0.5)",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={{ color: "rgba(216,180,254,0.8)", fontStyle: "italic" }}
                >
                  The audio is taking a moment to arrive. Please try again, or
                  continue your journey.
                </AppText>
              </View>
            ) : chakra === Chakra.THIRD_EYE &&
              (embodimentAudio.localUriPartOne || embodimentAudio.partOne) &&
              (embodimentAudio.localUriPartTwo || embodimentAudio.partTwo) ? (
              // Day 6 (Third Eye) - Two buttons for Part One and Part Two
              <>
                <AudioRow
                  title="Part One: Ajna Embodiment"
                  author="Mother JJ"
                  durationMs={1750000} // 29:10 - Part One
                  audioSource={{
                    uri:
                      embodimentAudio.localUriPartOne ||
                      embodimentAudio.partOne ||
                      "",
                  }}
                  authorColor="#FFFFFF"
                  isIntroAudio={true}
                  chakraColor={getChakraColor(chakraDay)}
                />
                <AudioRow
                  title="Part Two: Somatic Healing"
                  author="Mother JJ"
                  durationMs={1257000} // 20:57 - Part Two
                  audioSource={{
                    uri:
                      embodimentAudio.localUriPartTwo ||
                      embodimentAudio.partTwo ||
                      "",
                  }}
                  authorColor="#FFFFFF"
                  isIntroAudio={true}
                  chakraColor={getChakraColor(chakraDay)}
                />
              </>
            ) : (embodimentAudio.localUri || embodimentAudio.single) ? (
              // Days 1-5, 7 - Single embodiment (use local when cached)
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
                isIntroAudio={true} // Mark as intro audio for Intro Ritual
                chakraColor={getChakraColor(chakraDay)}
              />
            ) : null}
            <View style={{ width: "100%" }}>
              <PillSection chakra={chakra} onPress={handlePillPress} />
            </View>
            <Divider style={{ marginHorizontal: 32, marginBottom: 16 }} />
            <TextSection title="OVERVIEW" content={content.overview} />
            <TextSection title="SANSKRIT" content={content.sanskrit} />
            <AffirmationSection affirmationText={content.affirmationText} />
            <ResponsiveImage
              source={content.locationImage}
              width={screenWidth}
              style={{ alignSelf: "center", marginTop: 40 }}
            />
            <Part2Section chakra={chakra} />
            <ElementsSection chakra={chakra} />
            <Part3Section chakra={chakra} />
          </View>
          <AudioRow
            title={content.audioOutro.title}
            author={content.audioOutro.author}
            durationMs={content.audioOutro.durationMs}
            audioSource={content.audioOutro.source}
            authorColor={"#C16061"}
            chakraColor={getChakraColor(chakraDay)}
          />
          {/* Mirror Of Embodiment Quiz Button - Earth tones, depth, gradient lighting */}
          <View style={{ marginTop: 32, marginBottom: 24, alignItems: "center" }}>
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, zIndex: 10 }}>
                  <Ionicons name="sparkles" size={16} color="#D4C5A9" />
                  <AppText
                    font="koh-santepheap"
                    size="lg"
                    style={{
                      textAlign: "center",
                      color: "#ffffff",
                      textShadowColor: "rgba(0, 0, 0, 0.5)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    Mirror Of Embodiment
                  </AppText>
                  <Ionicons name="sparkles" size={16} color="#D4C5A9" />
                </View>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{
                    textAlign: "center",
                    marginTop: 6,
                    color: "rgba(255,255,255,0.75)",
                    fontStyle: "italic",
                    zIndex: 10,
                    textShadowColor: "rgba(0, 0, 0, 0.4)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Test your understanding
                </AppText>
              </LinearGradient>
            </Pressable>
          </View>
          {/* Completion Ceremony - Chakra Ball on Black Background */}
          <View style={{ marginTop: 64, marginBottom: 32, alignItems: "center" }}>
            <Pressable
              style={{ alignItems: "center" }}
              onPress={() => {
                addHapticFeedback(HapticStrength.Medium)
                navigateBack(true)
              }}
            >
              <View style={{ alignItems: "center" }}>
                <AppText
                  font="koh-santepheap"
                  size="xl"
                  style={{ textAlign: "center", marginBottom: 16, color: "#ffffff" }}
                >
                  &#9634;{"  "} {content.goodbye.content}
                </AppText>
                <Image
                  source={content.goodbye.chakraImage}
                  resizeMode="contain"
                  style={{ width: 128, height: 128 }}
                />
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}
                >
                  I have completed today's journey
                </AppText>
              </View>
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

      {/* Note: Social Sanctuary and Anua access is handled globally by FloatingNavButtons */}
    </SafeAreaView>
  )
}

export default ChakraTemplate
