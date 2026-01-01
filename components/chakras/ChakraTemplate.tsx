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
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useEmbodimentAudio } from "@/hooks/useEmbodimentAudio"
import { SocialSanctuaryIcon } from "@/components/social/SocialSanctuaryIcon"
import { SocialSanctuaryModal } from "@/components/social/SocialSanctuaryModal"
import { AnuaChatModal } from "@/components/social/AnuaChatModal"
import { getChakraIndex } from "@/utils/chakraMapping"
import { MiniAudioPlayer } from "@/components/chakras/MiniAudioPlayer"
import { LinearGradient } from "expo-linear-gradient"

const ChakraTemplate = ({ chakra }: { chakra: Chakra }) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)
  const [currentPill, setCurrentPill] = useState<PillType | null>(null)
  const [isSanctuaryModalVisible, setIsSanctuaryModalVisible] = useState(false)
  const [isAnuaChatVisible, setIsAnuaChatVisible] = useState(false)
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const router = useRouter()

  const setCompletedChakra = useCompletedChakraStore(
    (state) => state.setCompletedChakra,
  )

  const markChakraCompleted = useChakraJourneyStore(
    (state) => state.markChakraCompleted,
  )

  const getChakraName = (chakraName: Chakra): string => {
    switch (chakraName) {
      case Chakra.ROOT:
        return 'Root Chakra'
      case Chakra.SACRAL:
        return 'Sacral Chakra'
      case Chakra.SOLAR_PLEXUS:
        return 'Solar Plexus Chakra'
      case Chakra.HEART:
        return 'Heart Chakra'
      case Chakra.THROAT:
        return 'Throat Chakra'
      case Chakra.THIRD_EYE:
        return 'Third Eye Chakra'
      case Chakra.CROWN:
        return 'Crown Chakra'
      default:
        return 'Chakra'
    }
  }

  const chakraDay = getChakraIndex(chakra)
  const chakraName = getChakraName(chakra)

  useEffect(() => {
    const chakraIndex = getChakraIndex(chakra)

    markChakraCompleted(chakraIndex)
  }, [chakra, markChakraCompleted])

  const navigateBack = async (isCompleted: boolean) => {
    if (isCompleted) {
      // Mark chakra as completed in journey store
      const chakraIndex = getChakraIndex(chakra)
      markChakraCompleted(chakraIndex)
      
      // Integration pause - allow user to feel what they've received
      // Show brief "Integrating..." message before transitioning
      // This creates a ceremonial moment of completion
      
      // Set completed chakra in store to trigger GoodbyeModal in ChakraHome
      setCompletedChakra(chakra)
      
      // Integration pause: 2-3 seconds to allow integration
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Navigate back to ChakraHome, which will show GoodbyeModal
      router.back()
    } else {
      router.back()
    }
  }

  const content = chakraContent[chakra]

  const { width: screenWidth } = useWindowDimensions()

  // Fetch Firebase Storage URLs for embodiment audio files
  const embodimentAudio = useEmbodimentAudio(chakra)
  
  // Debug logging to verify correct chakra and audio mapping
  useEffect(() => {
    if (__DEV__) {
      console.log(`[ChakraTemplate] Rendering for chakra: ${chakra}, Day: ${chakraDay}, Name: ${chakraName}`)
      console.log(`[ChakraTemplate] Embodiment audio state:`, {
        hasSingle: !!embodimentAudio.single,
        hasPartOne: !!embodimentAudio.partOne,
        hasPartTwo: !!embodimentAudio.partTwo,
        isLoading: embodimentAudio.isLoading,
        error: embodimentAudio.error?.message,
      })
      if (embodimentAudio.single) {
        console.log(`[ChakraTemplate] Single audio URL (first 50 chars):`, embodimentAudio.single.substring(0, 50))
      }
      if (embodimentAudio.partOne) {
        console.log(`[ChakraTemplate] Part One audio URL (first 50 chars):`, embodimentAudio.partOne.substring(0, 50))
      }
      if (embodimentAudio.partTwo) {
        console.log(`[ChakraTemplate] Part Two audio URL (first 50 chars):`, embodimentAudio.partTwo.substring(0, 50))
      }
    }
  }, [chakra, chakraDay, chakraName, embodimentAudio])

  const handlePillPress = useCallback(
    (pill: PillType) => {
      addHapticFeedback(HapticStrength.Light)
      switch (pill) {
        case PillType.CHAKRAS:
          router.push("/(chakras)/Chakras101")
          break
        case PillType.FREQUENCY:
          router.push(`/(chakras)/SoundBath?chakra=${chakra}`)
          break
        default: // Handles IDENTITY_STATEMENT and SEED_MANTRA
          setCurrentPill(pill)
          setIsBottomSheetVisible(true)
          break
      }
    },
    [chakra, router, setCurrentPill, setIsBottomSheetVisible],
  )

  const handleBottomSheetClose = useCallback(() => {
    setIsBottomSheetVisible(false)
    setCurrentPill(null) // Resetting pill when sheet closes
  }, [setIsBottomSheetVisible, setCurrentPill])

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
          />
        }
      >
        <View className="pb-20">
          <HeaderSection
            headerHeight={screenWidth}
            textLine1={content.header.textLine1}
            textLine2={content.header.textLine2}
            textLine3={content.header.textLine3}
          />
          <View className="bg-black">
            {/* Embodiment Meditation Audio (audioIntro) - Using Firebase Storage URLs */}
            {embodimentAudio.isLoading ? (
              <View className="w-10/12 mt-6 border border-[#ffffffc0] self-center rounded-lg p-4 items-center">
                <AppText font="instrument-regular" size="base" className="text-white/80 italic">
                  Preparing your meditation space...
                </AppText>
              </View>
            ) : embodimentAudio.error ? (
              <View className="w-10/12 mt-6 border border-purple-500/50 self-center rounded-lg p-4 items-center">
                <AppText font="instrument-regular" size="base" className="text-purple-300/80 italic">
                  The audio is taking a moment to arrive. Please try again, or continue your journey.
                </AppText>
              </View>
            ) : chakra === Chakra.THIRD_EYE && embodimentAudio.partOne && embodimentAudio.partTwo ? (
              // Day 6 (Third Eye) - Two buttons for Part One and Part Two
              // Each AudioRow handles its own spacing (mt-6) and width (w-10/12)
              <>
                <AudioRow
                  title="Part One: Ajna Embodiment"
                  author="Mother JJ"
                  durationMs={1750000} // 29:10 - Part One
                  audioSource={{ uri: embodimentAudio.partOne }}
                  authorColor="#FFFFFF"
                  isIntroAudio={true} // Mark as intro audio for Intro Ritual
                />
                <AudioRow
                  title="Part Two: Somatic Healing"
                  author="Mother JJ"
                  durationMs={1257000} // 20:57 - Part Two
                  audioSource={{ uri: embodimentAudio.partTwo }}
                  authorColor="#FFFFFF"
                  isIntroAudio={true} // Mark as intro audio for Intro Ritual
                />
              </>
            ) : embodimentAudio.single ? (
              // Days 1-5 - Single embodiment meditation audio file (replaces audioIntro)
              <AudioRow
                title={content.audioIntro.title}
                author={content.audioIntro.author}
                durationMs={content.audioIntro.durationMs}
                audioSource={{ uri: embodimentAudio.single }}
                authorColor="#FFFFFF"
                isIntroAudio={true} // Mark as intro audio for Intro Ritual
              />
            ) : null}
            <PillSection chakra={chakra} onPress={handlePillPress} />
            <Divider className="mx-8 mb-4" />
            <TextSection title="OVERVIEW" content={content.overview} />
            <TextSection title="SANSKRIT" content={content.sanskrit} />
            <AffirmationSection affirmationText={content.affirmationText} />
            <ResponsiveImage
              source={content.locationImage}
              width={screenWidth}
              className={`self-center mt-10`}
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
          />
          {/* Completion Ceremony - More Prominent and Ceremonial */}
          <View className="mt-16 mb-8 items-center">
            <Pressable
              className="active:scale-95 active:opacity-90 items-center"
              onPress={() => {
                navigateBack(true)
              }}
              style={{
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['rgba(157, 78, 221, 0.3)', 'rgba(123, 44, 191, 0.2)', 'rgba(106, 27, 154, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: '#FFD700',
                  alignItems: 'center',
                  minWidth: 280,
                }}
              >
                <AppText
                  font="koh-santepheap"
                  size="xl"
                  className="text-center mb-4 text-white"
                >
                  &#9634;{"  "} {content.goodbye.content}
                </AppText>
                <Image
                  source={content.goodbye.chakraImage}
                  resizeMode="contain"
                  className="w-32 h-32"
                />
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-center mt-4 text-white/70 italic"
                >
                  I have completed today's journey
                </AppText>
              </LinearGradient>
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

      {/* Social Sanctuary Floating Icon */}
      <SocialSanctuaryIcon onPress={() => setIsSanctuaryModalVisible(true)} />

      {/* Social Sanctuary Modal */}
      <SocialSanctuaryModal
        visible={isSanctuaryModalVisible}
        onClose={() => setIsSanctuaryModalVisible(false)}
        chakraDay={chakraDay}
        chakraName={chakraName}
        onOpenAnuaChat={() => {
          setIsSanctuaryModalVisible(false)
          setIsAnuaChatVisible(true)
        }}
      />

      {/* Anua Chat Modal */}
      <AnuaChatModal
        visible={isAnuaChatVisible}
        onClose={() => setIsAnuaChatVisible(false)}
        chakraDay={chakraDay}
        chakraName={chakraName}
      />

      {/* Mini Audio Player - Only for non-meditation audio (outro) */}
      <MiniAudioPlayer />
    </SafeAreaView>
  )
}

export default ChakraTemplate
