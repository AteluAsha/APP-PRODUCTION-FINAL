import {
  Image,
  ImageBackground,
  useWindowDimensions,
  View,
  Pressable,
  Linking,
  Alert,
} from "react-native"
import { AppText } from "../AppText"
import React from "react"
import ResponsiveImage from "../ResponsiveImage"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"

const HORIZONTAL_MARGIN = 24

interface YogaSectionProps {
  chakra: Chakra
}

const YogaSection: React.FC<YogaSectionProps> = ({ chakra }) => {
  const { width: screenWidth } = useWindowDimensions()
  const { chakraDay, pose, essence, body, somaticCue, poseUrl } =
    chakraContent[chakra].yoga
  const boxWidth = screenWidth - HORIZONTAL_MARGIN * 2

  const handleOpenPoseLink = () => {
    if (!poseUrl) return
    Linking.canOpenURL(poseUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(poseUrl!)
        } else {
          Alert.alert(
            "Cannot open link",
            "This link could not be opened on your device.",
          )
        }
      })
      .catch(() => {
        Alert.alert(
          "Something went wrong",
          "The pose link could not be opened.",
        )
      })
  }

  return (
    <View
      style={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
      }}
    >
      <Image
        source={require("@/assets/images/yoga-logo.png")}
        style={{ width: 40, height: 40, alignSelf: "center", marginBottom: 16 }}
        resizeMode="cover"
      />
      <AppText
        font="instrument-regular"
        size="lg"
        style={{ marginBottom: 20, color: "#ffffff" }}
      >
        {chakraDay}{" "}
        <AppText font="instrument-bold" style={{ color: "#ffffff" }}>
          Yoga {chakra === Chakra.HEART ? "Practice" : "Pose"}
        </AppText>
      </AppText>
      <Pressable
        onPress={handleOpenPoseLink}
        disabled={!poseUrl}
        style={{ width: boxWidth, alignSelf: "center", marginBottom: 32 }}
      >
        <ImageBackground
          source={require("@/assets/images/DailyYogaButtonBG.png")}
          style={{
            width: boxWidth,
            minHeight: 64,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.85)",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            paddingHorizontal: 24,
          }}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              paddingHorizontal: 20,
              paddingVertical: 6,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText
              font="instrument-bold"
              size="4xl"
              style={{
                color: "#ffffff",
                textAlign: "center",
                textShadowColor: "rgba(0,0,0,0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              {pose.replace(/\.$/, "")}
            </AppText>
          </View>
        </ImageBackground>
      </Pressable>
      <View style={{ marginHorizontal: 32, marginTop: 16, marginBottom: 16, alignItems: "center" }}>
        <AppText
          font="cormorant-regular"
          size="xs"
          style={{
            letterSpacing: 1.2,
            color: "rgba(255,255,255,0.72)",
            marginBottom: 8,
            textShadowColor: "rgba(255,255,255,0.7)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 14,
          }}
        >
          The Essence
        </AppText>
        <AppText
          font="cormorant-italic"
          size="lg"
          style={{
            textAlign: "center",
            lineHeight: 28,
            color: "rgba(255,255,255,0.9)",
            fontStyle: "italic",
          }}
        >
          "{essence}"
        </AppText>
      </View>
      <AppText
        font="instrument-regular"
        size="sm"
        style={{
          marginHorizontal: 32,
          marginBottom: 16,
          lineHeight: 24,
          color: "#ffffff",
        }}
      >
        {body}
      </AppText>
      <View
        style={{
          marginHorizontal: 24,
          marginTop: 8,
          paddingVertical: 20,
          paddingHorizontal: 24,
          borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.04)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          alignSelf: "stretch",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppText
          font="cormorant-italic"
          style={{
            fontFamily: "CormorantGaramondItalic",
            fontWeight: "400",
            fontSize: 18,
            lineHeight: 24,
            color: "rgba(255,255,255,0.97)",
            textAlign: "center",
            letterSpacing: 0.4,
          }}
        >
          Somatic Cue: {somaticCue}
        </AppText>
      </View>
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
          marginTop: 32,
          marginBottom: 32,
        }}
      />
    </View>
  )
}

export default YogaSection
