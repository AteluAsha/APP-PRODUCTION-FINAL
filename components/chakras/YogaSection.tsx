import { Image, useWindowDimensions, View } from "react-native"
import { AppText } from "../AppText"
import React from "react"
import ResponsiveImage from "../ResponsiveImage"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"

interface YogaSectionProps {
  chakra: Chakra
}

const YogaSection: React.FC<YogaSectionProps> = ({ chakra }) => {
  const { width: screenWidth } = useWindowDimensions()
  const { chakraDay, pose, poseDescription } = chakraContent[chakra].yoga
  return (
    <View className="justify-center items-center">
      <Image
        source={require("@/assets/images/yoga-logo.png")}
        className={`w-10 h-10 object-cover self-center mb-2 z-10`}
      />
      <AppText font="instrument-regular" size="lg" className="mb-2">
        {chakraDay}{" "}
        <AppText font="instrument-bold">
          Yoga {chakra === Chakra.HEART ? "Practice" : "Pose"}
        </AppText>
      </AppText>
      <AppText font="instrument-regular" size="sm" className="mx-8">
        <AppText font="instrument-bold">{pose}.</AppText> {poseDescription}
      </AppText>
      <ResponsiveImage
        source={require("@/assets/images/rootyogapose.png")}
        width={screenWidth - 60}
        className="mt-4 rounded-xl opacity-70"
      />
      <View className="h-[1px] bg-[#8E8E8E] w-6 self-center mt-10"></View>
    </View>
  )
}

export default YogaSection
