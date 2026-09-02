import { View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "../../components/AppText"
import { ActionBarAnimated } from "@/components/ActionBarAnimated"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { chakraContent } from "@/constants/chakras/content"
import { AudioRow } from "@/components/chakras/AudioRow"
import { Chakra } from "@/types/chakras/Chakra"
import FormattedText from "@/components/FormattedText"
import {
  FLOATING_NAV_SCROLL_BOTTOM_PADDING,
  SCROLL_BREATHING_BOTTOM_PADDING,
} from "@/constants/layout"
import {
  useAncestralWisdomAudio,
  getHeadToHeartAudioId,
} from "@/hooks/useAncestralWisdomAudio"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { getDayFromChakra } from "@/utils/chakraMapping"
import ParallaxScrollView from "@/components/ParallaxScrollView"
import { HeaderSection } from "@/components/chakras/HeaderSection"
import { HeaderBackground } from "@/components/chakras/HeaderBackground"
import { isValidChakra } from "@/utils/validation"

const HeadToHeart = () => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const { width: screenWidth } = useWindowDimensions()
  const router = useRouter()

  const searchParams = useLocalSearchParams()
  const rawChakra = searchParams.chakra
  const chakraParam = Array.isArray(rawChakra) ? rawChakra[0] : rawChakra
  const hasChakraQuery =
    typeof chakraParam === "string" && chakraParam.trim().length > 0

  useEffect(() => {
    if (hasChakraQuery && !isValidChakra(chakraParam)) {
      router.replace("/(chakras)/ChakraHub")
    }
  }, [chakraParam, hasChakraQuery, router])

  const chakra = isValidChakra(chakraParam) ? chakraParam : Chakra.ROOT
  const chakraContentEntry = chakraContent[chakra]
  const content = chakraContentEntry.headtoheart
  useAncestralWisdomAudio(chakra)

  if (hasChakraQuery && !isValidChakra(chakraParam)) return null

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
            paddingBottom:
              FLOATING_NAV_SCROLL_BOTTOM_PADDING + SCROLL_BREATHING_BOTTOM_PADDING,
            paddingTop: 4,
          }}
        >
          <AudioRow
            title={content.audio.title}
            author={content.audio.author}
            durationMs={content.audio.duration}
            authorColor={content.audio.authorColor}
            isIntroAudio={false}
            chakraColor={getChakraColor(getDayFromChakra(chakra))}
            disabled={false}
            embodimentCacheKey={getHeadToHeartAudioId(chakra)}
          />

          <View style={{ marginHorizontal: 20, marginTop: 8 }}>
            <FormattedText
              font="cormorant-regular"
              size="base"
              segments={content.description}
              baseClassName="text-justify"
              textStyle={{
                textAlign: "justify",
                marginTop: 20,
                lineHeight: 28,
                color: "rgba(255, 248, 236, 0.88)",
              }}
            />

            <View
              style={{
                marginTop: 28,
                paddingVertical: 22,
                paddingHorizontal: 22,
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 1,
                borderColor: "rgba(232, 201, 140, 0.18)",
              }}
            >
              <AppText
                font="cormorant-regular"
                style={{
                  color: "rgba(232, 201, 140, 0.92)",
                  marginBottom: 10,
                  letterSpacing: 2.4,
                  fontSize: 13,
                  textTransform: "uppercase",
                }}
              >
                The Master Key
              </AppText>
              <AppText
                font="cormorant-italic"
                style={{
                  color: "rgba(255, 248, 236, 0.94)",
                  textAlign: "justify",
                  fontSize: 17,
                  lineHeight: 27,
                }}
              >
                {content.masterKey.text}
              </AppText>
            </View>
          </View>
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  )
}

export default HeadToHeart
