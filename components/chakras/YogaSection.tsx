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
  const { chakraDay, pose, essence, body, somaticCue } =
    chakraContent[chakra].yoga
  return (
    <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 56 }}>
      <Image
        source={require("@/assets/images/yoga-logo.png")}
        style={{ width: 40, height: 40, alignSelf: "center", marginBottom: 8 }}
        resizeMode="cover"
      />
      <AppText font="instrument-regular" size="lg" style={{ marginBottom: 20, color: "#ffffff" }}>
        {chakraDay}{" "}
        <AppText font="instrument-bold" style={{ color: "#ffffff" }}>
          Yoga {chakra === Chakra.HEART ? "Practice" : "Pose"}
        </AppText>
      </AppText>
      <AppText font="instrument-bold" size="lg" style={{ marginHorizontal: 32, marginBottom: 16, color: "#ffffff" }}>
        {pose}.
      </AppText>
      <AppText
        font="instrument-italic"
        size="sm"
        style={{ marginHorizontal: 32, marginBottom: 16, color: "rgba(255,255,255,0.95)" }}
      >
        The Essence: "{essence}"
      </AppText>
      <AppText
        font="instrument-regular"
        size="sm"
        style={{ marginHorizontal: 32, marginBottom: 16, lineHeight: 24, color: "#ffffff" }}
      >
        {body}
      </AppText>
      <AppText
        font="instrument-medium"
        size="sm"
        style={{ marginHorizontal: 32, color: "rgba(251,191,36,0.9)" }}
      >
        Somatic Cue: {somaticCue}
      </AppText>
      <ResponsiveImage
        source={require("@/assets/images/rootyogapose.png")}
        width={screenWidth - 60}
        style={{ marginTop: 24, borderRadius: 12, opacity: 0.7 }}
      />
      <View
        style={{
          height: 1,
          backgroundColor: "#8E8E8E",
          width: 24,
          alignSelf: "center",
          marginTop: 48,
          marginBottom: 48,
        }}
      />
    </View>
  )
}

export default YogaSection
