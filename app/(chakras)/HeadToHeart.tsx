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
        contentContainerStyle={{ marginTop: top + 40 }}
        contentContainerClassName={"mx-4 pb-20"}
      >
        {/* Content Container */}
        <View className="mb-4">
          {/* Title */}
          <AppText
            font="instrument-regular"
            size="lg"
            className="text-center mt-4"
          >
            {content.title}
          </AppText>
          <AppText
            font="instrument-medium"
            size="xl"
            className="text-center mt-1"
          >
            {content.subtitle}
          </AppText>

          {/* Description */}
          <FormattedText
            font="instrument-regular"
            size="sm"
            segments={content.description}
            baseClassName="text-justify mt-8"
          />
        </View>

        {/* Audio Player */}
        <AudioRowWithBackground
          title={content.audio.title}
          author={content.audio.author}
          durationMs={content.audio.duration}
          audioSource={content.audio.source}
          authorColor={content.audio.authorColor}
        />

        <View className="h-[1px] bg-white w-8 self-center mt-10"></View>
        <Image
          source={require("@/assets/images/meditationlogotemp.png")}
          className="w-12 h-12 object-cover self-center mt-10 z-10"
        />
        <AppText
          font="instrument-semibold"
          size="lg"
          className="text-center mt-1"
          style={{ letterSpacing: 0.4 }}
        >
          DAILY ACTIVITY
        </AppText>

        {/* Daily Activity */}
        <View className="bg-black border border-white rounded-xl py-7 px-5 mt-6">
          <FormattedText
            font="instrument-regular"
            size="sm"
            segments={content.dailyActivity}
            baseClassName="text-justify"
            renderAsParagraphs={true}
          />
        </View>
      </Animated.ScrollView>
    </View>
  )
}

export default HeadToHeart
