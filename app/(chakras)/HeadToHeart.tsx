import { View, Image } from "react-native"
import { AppText } from "../../components/AppText"
import { ActionBarAnimated } from "@/components/ActionBarAnimated"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams } from "expo-router"
import { chakraContent } from "@/constants/chakras/content"
import { AudioRowWithBackground } from "@/components/chakras/AudioRowWithBackground"
import { Chakra } from "@/types/chakras/Chakra"
import FormattedText from "@/components/FormattedText"
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING } from "@/constants/layout"

const HeadToHeart = () => {
  const { top } = useSafeAreaInsets()
  const scrollRef = useAnimatedRef<Animated.ScrollView>()

  const searchParams = useLocalSearchParams()
  const chakra = searchParams.chakra as Chakra
  const content = chakraContent[chakra].headtoheart

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky Action Bar */}
      <ActionBarAnimated scrollViewRef={scrollRef} scrollThreshold={50} />

      {/* Animated ScrollView */}
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginTop: top + 40,
          marginHorizontal: 16,
          paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING,
        }}
      >
        {/* Content Container */}
        <View style={{ marginBottom: 16 }}>
          <AppText
            font="instrument-regular"
            size="lg"
            style={{ textAlign: "center", marginTop: 16, color: "#ffffff" }}
          >
            {content.title}
          </AppText>
          <AppText
            font="instrument-medium"
            size="xl"
            style={{ textAlign: "center", marginTop: 4, color: "#ffffff" }}
          >
            {content.subtitle}
          </AppText>

          <FormattedText
            font="instrument-regular"
            size="sm"
            segments={content.description}
            baseClassName="text-justify mt-8"
            textStyle={{ textAlign: "justify", marginTop: 32, lineHeight: 24 }}
          />

          <View
            style={{
              marginTop: 32,
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
              style={{ color: "rgba(251,191,36,0.9)", marginBottom: 8, letterSpacing: 0.5 }}
            >
              THE MASTER KEY
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{ color: "rgba(255,255,255,0.95)", textAlign: "justify", fontStyle: "italic" }}
            >
              {content.masterKey.text}
            </AppText>
          </View>
        </View>

        {/* Audio Player */}
        <AudioRowWithBackground
          title={content.audio.title}
          author={content.audio.author}
          durationMs={content.audio.duration}
          audioSource={content.audio.source}
          authorColor={content.audio.authorColor}
        />

        <View
          style={{
            height: 1,
            backgroundColor: "#ffffff",
            width: 32,
            alignSelf: "center",
            marginTop: 40,
          }}
        />
        <Image
          source={require("@/assets/images/meditationlogotemp.png")}
          style={{ width: 48, height: 48, alignSelf: "center", marginTop: 40 }}
          resizeMode="cover"
        />
        <AppText
          font="instrument-semibold"
          size="lg"
          style={{ textAlign: "center", marginTop: 4, letterSpacing: 0.4, color: "#ffffff" }}
        >
          DAILY ACTIVITY
        </AppText>

        <View style={{ marginTop: 16, alignItems: "center" }}>
          <AppText
            font="instrument-medium"
            size="sm"
            style={{ textAlign: "center", color: "rgba(255,255,255,0.95)" }}
          >
            "{content.dailyActivityTitle}"
          </AppText>
          <AppText
            font="instrument-regular"
            size="xs"
            style={{ textAlign: "center", marginTop: 4, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}
          >
            {content.dailyActivitySubline}
          </AppText>
        </View>

        <View
          style={{
            borderRadius: 12,
            paddingVertical: 28,
            paddingHorizontal: 20,
            marginTop: 24,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.25)",
          }}
        >
          <FormattedText
            font="instrument-regular"
            size="sm"
            segments={content.dailyActivity}
            baseClassName="text-justify"
            renderAsParagraphs={true}
            paragraphSpacingClassName="mb-5"
          />
        </View>
      </Animated.ScrollView>
    </View>
  )
}

export default HeadToHeart
