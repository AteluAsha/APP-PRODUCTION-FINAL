import { View, ActivityIndicator, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "../../components/AppText"
import { ActionBarAnimated } from "@/components/ActionBarAnimated"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { useLocalSearchParams } from "expo-router"
import { chakraContent } from "@/constants/chakras/content"
import { AudioRowWithBackground } from "@/components/chakras/AudioRowWithBackground"
import { Chakra } from "@/types/chakras/Chakra"
import FormattedText from "@/components/FormattedText"
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING, SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
import { useAncestralWisdomAudio, getHeadToHeartAudioId } from "@/hooks/useAncestralWisdomAudio"
import { prepareLongAudioForPlay } from "@/src/utils/crystalBowlPlayback"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { getDayFromChakra } from "@/utils/chakraMapping"
import ParallaxScrollView from "@/components/ParallaxScrollView"
import { HeaderSection } from "@/components/chakras/HeaderSection"
import { HeaderBackground } from "@/components/chakras/HeaderBackground"

const HeadToHeart = () => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const { width: screenWidth } = useWindowDimensions()

  const searchParams = useLocalSearchParams()
  const chakra = searchParams.chakra as Chakra
  const chakraContentEntry = chakraContent[chakra]
  const content = chakraContentEntry.headtoheart
  const { source, url, localUri, isLoading } = useAncestralWisdomAudio(chakra)

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ActionBarAnimated
        scrollViewRef={scrollRef}
        headerImageSource={chakraContentEntry.chakraHeaderImage}
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
              backgroundSource={chakraContentEntry.header.headerBackground}
              chakraImageSource={chakraContentEntry.chakraHeaderImage}
              chakraImageSizePx={chakraContentEntry.header.chakraImageSizePx}
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
                textLine1={content.title}
                textLine2={content.subtitle}
                textLine3=""
              />
            </View>
          </View>
        }
      >
        <View
          style={{
            paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING + SCROLL_BREATHING_BOTTOM_PADDING,
            paddingTop: 16,
          }}
        >
          <View style={{ backgroundColor: "#000000", marginHorizontal: 16 }}>
            <FormattedText
              font="instrument-regular"
              size="sm"
              segments={content.description}
              baseClassName="text-justify"
              textStyle={{
                textAlign: "justify",
                marginTop: 24,
                lineHeight: 24,
              }}
            />

            <View
              style={{
                marginTop: 24,
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderLeftWidth: 3,
                borderLeftColor: "rgba(255, 215, 0, 0.6)",
              }}
            >
              <AppText
                font="instrument-semibold"
                size="sm"
                style={{
                  color: "rgba(251,191,36,0.9)",
                  marginBottom: 8,
                  letterSpacing: 0.5,
                }}
              >
                THE MASTER KEY
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  color: "rgba(255,255,255,0.95)",
                  textAlign: "justify",
                  fontStyle: "italic",
                }}
              >
                {content.masterKey.text}
              </AppText>
            </View>

            {/* Audio Player – Power of Creation (Ancestral Wisdom) from Firebase */}
            {isLoading && source === null ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 24,
                  paddingVertical: 20,
                  paddingHorizontal: 24,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  width: "83.33%",
                  alignSelf: "center",
                }}
              >
                <ActivityIndicator size="small" color="#FFDEBA" />
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={{ color: "rgba(255,255,255,0.7)", marginLeft: 12 }}
                >
                  Loading audio…
                </AppText>
              </View>
            ) : source ? (
              <AudioRowWithBackground
                title={content.audio.title}
                author={content.audio.author}
                durationMs={content.audio.duration}
                audioSource={source}
                getAudioSource={
                  url ?? localUri
                    ? async () =>
                        prepareLongAudioForPlay(
                          {
                            url: url ?? null,
                            localUri: localUri ?? null,
                            audioId: getHeadToHeartAudioId(chakra),
                            fallback: { uri: url ?? localUri ?? "" },
                          },
                          {
                            requireFullDownload: true,
                            allowStreamingFallback: false,
                          },
                        )
                    : undefined
                }
                authorColor={content.audio.authorColor}
                isIntroAudio={false}
                chakraColor={getChakraColor(getDayFromChakra(chakra))}
                fullPlayerTrackId={getHeadToHeartAudioId(chakra)}
              />
            ) : null}
          </View>
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  )
}

export default HeadToHeart
