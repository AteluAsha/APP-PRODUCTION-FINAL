import { ImageBackground, Image, View, useWindowDimensions } from "react-native"
import { AppText } from "../../components/AppText"
import ResponsiveImage from "@/components/ResponsiveImage"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ActionBarAnimated } from "@/components/ActionBarAnimated"
import Animated, { useAnimatedRef } from "react-native-reanimated"

const Chakras101 = () => {
  const { width } = useWindowDimensions()
  const { top } = useSafeAreaInsets()
  const scrollRef = useAnimatedRef<Animated.ScrollView>()

  return (
    <View style={{ flex: 1 }}>
      {/* ActionBar stays fixed at the top */}
      <ActionBarAnimated scrollViewRef={scrollRef} scrollThreshold={100} />

      {/* ScrollView wraps all content except the ActionBar */}
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ marginTop: top * 2.2 }}
        contentContainerClassName={"mx-4 pb-10"}
      >
        {/* ImageBackground and other content */}
        <ImageBackground
          source={require("@/assets/images/part2bg.png")}
          resizeMode="cover" // This will zoom in the image to fill the container
          className="pb-8 w-full"
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark overlay for dimming
            }}
          />
          <View className="px-4">
            <AppText
              font="instrument-italic"
              size="sm"
              className="text-center mx-4 -mt-7"
            >
              "The whispers of your soul echo in the chambers of your chakras;
              listen deeply, and find the healing you have always carried
              within."
            </AppText>
            <Image
              source={require("@/assets/images/7chakras.png")}
              resizeMode="contain"
              className="self-center w-32 h-32 mt-8"
            />
            <AppText
              font="instrument-semibold"
              size="sm"
              className="mx-4 mt-12"
            >
              What is a chakra, and why does it matter to you?
            </AppText>
            <AppText
              font="instrument-semibold-italic"
              size="sm"
              className="text-justify mx-4 mt-4"
            >
              These swirling vortexes of energy, mapped along your spine,
              correlate to specific organs, emotions, and even stages of
              spiritual development.
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-justify mx-4 mt-4"
            >
              {"  "}Chakras are energy centers within your subtle body,
              understood as spinning wheels of light. They regulate the flow of
              prana (life force energy) throughout your system, influencing your
              physical, emotional, and spiritual well-being. Each chakra is
              associated with specific organs, glands, colors, and aspects of
              awareness. But the chakras are more than just energy centers; they
              hold the keys to unlocking your divine potential. Matias DeStefano
              describes them as pathways to embodying the qualities of a God. By
              understanding and activating your chakras, you're not just gaining
              knowledge; you're embodying divine concepts and becoming a more
              complete expression of your true self. For thousands of years,
              yogis and mystics have worked with the chakras to achieve higher
              states of consciousness, to heal physical ailments, and to
              manifest their deepest desires.
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              className="mx-4 mt-4 text-justify"
            >
              A wonderful system to integrate the 7 chakras into your life is to
              fold them into the 7 days of the week. From there you can start
              your own journey to discover more. For this, we start on Monday
              with your roots on Earth and work our way to Sunday where we spend
              time in the Soul Mind in the stars. The chakras are probably the
              most important aspects of your life and have everything to do with
              what you do, who you are, and how you feel. These spinning balls
              of energy act as the supercomputers of your soul. They each carry
              abilities and secrets, and they all have a direct impact on your
              life, well-being, and what you are able to create in this reality.
            </AppText>
          </View>
        </ImageBackground>
        <ResponsiveImage
          source={require("@/assets/images/chakraman.png")}
          className={`self-center mt-10`}
          width={width}
        />
      </Animated.ScrollView>
    </View>
  )
}

export default Chakras101
