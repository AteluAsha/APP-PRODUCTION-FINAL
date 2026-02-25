import React from "react"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { View } from "react-native"

export const HeaderSection = ({
  headerHeight,
  textLine1,
  textLine2,
  textLine3,
  rightContent,
}: {
  headerHeight: number
  textLine1: string
  textLine2: string
  textLine3: string
  rightContent?: React.ReactNode
}) => {
  return (
    <View style={{ flexDirection: "column", height: headerHeight }}>
      <LinearGradient
        colors={["transparent", "#000000"]}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 100,
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginLeft: 24,
          marginBottom: 12,
          paddingBottom: 8,
        }}
      >
        <AppText
          font="cormorant-regular"
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#ffffff",
            letterSpacing: 0.3,
            textShadowColor: "rgba(0,0,0,0.75)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {textLine1}
        </AppText>
        <AppText
          font="cormorant-regular"
          style={{
            marginTop: 4,
            fontSize: 26,
            lineHeight: 32,
            fontWeight: "600",
            color: "#ffffff",
            textShadowColor: "rgba(0,0,0,0.75)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 4,
          }}
        >
          {textLine2}
        </AppText>
        <AppText
          font="cormorant-italic"
          style={{
            marginTop: 4,
            fontSize: 13,
            letterSpacing: 0.3,
            color: "rgba(255,255,255,0.95)",
            textShadowColor: "rgba(0,0,0,0.75)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {textLine3}
        </AppText>
      </View>
      {rightContent != null ? (
        <View
          style={{ position: "absolute", right: 24, bottom: 12 }}
          pointerEvents="box-none"
        >
          {rightContent}
        </View>
      ) : null}
    </View>
  )
}
