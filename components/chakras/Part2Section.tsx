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
      className="flex rounded-3xl pb-8 pt-8 mt-4"
      style={{
        alignItems: "center",
      }}
    >
      <BackgroundOpacity
        backgroundOpacity={0.7}
        topGradientHeight={30}
        bottomGradientHeight={30}
      />

      <View className="flex-1 px-10 mt-6 mb-2">
        <SectionHeader subtitle={"— PART II —"} title={"GOING WITHIN"} />
        <TextButtonSection
          heading="HEAD TO HEART"
          description="Each chakra holds one of the 7 Divine Laws of the Universe. This ancestral knowledge acts as a roadmap for identifying your authentic self."
          buttonText="Path 1"
          buttonSubText="Ancestral Knowledge"
          onPress={() => {
            router.push(`/(chakras)/HeadToHeart?chakra=${chakra}`)
            addHapticFeedback(HapticStrength.Medium)
          }}
        />

        <TextButtonSection
          heading="SOUND HEALING"
          description="Specific frequencies vibrate the chakras into alignment for energetic equilibrium, well-being, and emotional healing."
          buttonText="Path 2"
          buttonSubText="Frequency"
          onPress={() => {
            router.push(`/(chakras)/SoundBath?chakra=${chakra}`)
            addHapticFeedback(HapticStrength.Medium)
          }}
        />
      </View>
    </ImageBackground>
  )
}

export default Part2Section
