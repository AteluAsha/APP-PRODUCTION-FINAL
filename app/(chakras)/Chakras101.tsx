import { useEffect } from "react"
import { ImageBackground, Image, View, useWindowDimensions } from "react-native"
import { AppText } from "../../components/AppText"
import ResponsiveImage from "@/components/ResponsiveImage"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ActionBarAnimated } from "@/components/ActionBarAnimated"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { useRouter } from "expo-router"
import { FLOATING_NAV_SCROLL_BOTTOM_PADDING, SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { shouldOfferWeek1JourneyNotice } from "@/src/utils/week1JourneyReminders"

const Chakras101 = () => {
  const { width } = useWindowDimensions()
  const { top } = useSafeAreaInsets()
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const router = useRouter()

  const markPendingWeek1Notice = () => {
    const firstLaunch = useFirstLaunchStore.getState()
    if (
      shouldOfferWeek1JourneyNotice({
        hasSeen: firstLaunch.hasSeenWeek1JourneyNotice,
        initialOpenDate: useChakraJourneyStore.getState().initialOpenDate,
      })
    ) {
      firstLaunch.setPendingWeek1JourneyNotice(true)
    }
  }

  useEffect(() => {
    return () => {
      markPendingWeek1Notice()
    }
  }, [])

  // Always use router.back() to return to the previous screen.
  // From pill (ChakraTemplate): back → chakra day page. From home/waiting: back → ChakraHome.
  // Replace was wrong UX: it always sent trial users to homepage, even when they came from a chakra page.
  const handleBack = () => {
    markPendingWeek1Notice()
    if (router.canGoBack()) {
      router.back()
    } else {
      // Fallback when no history (e.g. deep link)
      router.replace("/(chakras)/ChakraHub")
    }
  }

  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      {/* ScrollView first so ActionBar overlay receives touches on Android */}
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginTop: top * 2.2,
          paddingHorizontal: 16,
          paddingBottom: FLOATING_NAV_SCROLL_BOTTOM_PADDING + SCROLL_BREATHING_BOTTOM_PADDING,
        }}
      >
        {/* ImageBackground and other content */}
        <ImageBackground
          source={require("@/assets/images/part2bg.png")}
          resizeMode="cover"
          style={{ width: "100%", minHeight: 400, paddingBottom: 32 }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
          />
          <View style={{ paddingHorizontal: 16 }}>
            <Image
              source={require("@/assets/images/7chakras.png")}
              resizeMode="contain"
              style={{
                alignSelf: "center",
                width: 128,
                height: 128,
                marginTop: 32,
              }}
            />
            <AppText
              font="instrument-italic"
              size="sm"
              style={{
                textAlign: "center",
                marginHorizontal: 16,
                marginTop: 24,
                lineHeight: 22,
              }}
            >
              "The whispers of your soul echo in the chambers of your chakras;
              listen deeply, and find the healing you have always carried
              within."
            </AppText>
            <AppText
              font="instrument-semibold"
              size="sm"
              style={{ marginHorizontal: 16, marginTop: 48 }}
            >
              What is a chakra, and why does it matter to you?
            </AppText>
            <AppText
              font="instrument-semibold-italic"
              size="sm"
              style={{
                textAlign: "justify",
                marginHorizontal: 16,
                marginTop: 16,
                lineHeight: 22,
              }}
            >
              These swirling vortexes of energy, mapped along your spine,
              correlate to specific organs, emotions, and even stages of
              spiritual development.
            </AppText>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{
                textAlign: "justify",
                marginHorizontal: 16,
                marginTop: 16,
                lineHeight: 24,
              }}
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
              style={{
                marginHorizontal: 16,
                marginTop: 16,
                textAlign: "justify",
                lineHeight: 24,
              }}
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
          style={{ alignSelf: "center", marginTop: 40 }}
          width={width}
        />
      </Animated.ScrollView>

      <ActionBarAnimated
        scrollViewRef={scrollRef}
        scrollThreshold={100}
        onBackPress={handleBack}
      />
    </View>
  )
}

export default Chakras101
