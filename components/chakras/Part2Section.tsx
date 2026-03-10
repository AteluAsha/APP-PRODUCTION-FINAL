import React from "react"
import { ImageBackground, View } from "react-native"
import { useRouter } from "expo-router"
import SectionHeader from "./SectionHeader"
import TextButtonSection from "./TextButtonSection"
import { Chakra } from "@/types/chakras/Chakra"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import BackgroundOpacity from "../BackgroundOpacity"

const Part2Section = ({ chakra }: { chakra: Chakra }) => {
  const router = useRouter()
  return (
    <ImageBackground
      source={require("@/assets/images/part2bg.png")}
      resizeMode="cover"
      style={{
        flex: 1,
        borderRadius: 24,
        overflow: "hidden",
        paddingBottom: 32,
        paddingTop: 32,
        marginTop: 32,
        alignItems: "center",
      }}
    >
      <BackgroundOpacity
        backgroundOpacity={0.7}
        topGradientHeight={30}
        bottomGradientHeight={30}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 40,
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        <SectionHeader subtitle={"— PART II —"} title={"GOING WITHIN"} />
        <TextButtonSection
          heading="SOUND HEALING"
          description="Specific frequencies vibrate the chakras into alignment for energetic equilibrium, well-being, and emotional healing."
          buttonText="Path 1"
          buttonSubText="Frequency"
          onPress={() => {
            router.push(`/(chakras)/SoundBath?chakra=${chakra}`)
            addHapticFeedback(HapticStrength.Medium)
          }}
        />

        <TextButtonSection
          heading="HEAD TO HEART"
          description="Each chakra holds one of the 7 Divine Laws of the Universe. This ancestral knowledge acts as a roadmap for identifying your authentic self."
          buttonText="Path 2"
          buttonSubText="Ancestral Knowledge"
          onPress={() => {
            router.push(`/(chakras)/HeadToHeart?chakra=${chakra}`)
            addHapticFeedback(HapticStrength.Medium)
          }}
        />
      </View>
    </ImageBackground>
  )
}

export default Part2Section
