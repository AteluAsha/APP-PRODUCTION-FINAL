import React from "react"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { View } from "react-native"

/** Shared hero title styles – used by all 7 chakra day screens (ChakraTemplate → HeaderSection) */
const heroShadow = {
  textShadowColor: "rgba(0, 0, 0, 0.6)" as const,
  textShadowOffset: { width: 0, height: 1 } as const,
  textShadowRadius: 4,
}
const heroLine1 = { color: "#ffffff" as const, ...heroShadow }
const heroLine2 = { color: "#ffffff" as const, marginTop: 4, ...heroShadow, textShadowRadius: 5 }
const heroLine3 = {
  color: "rgba(255, 255, 255, 0.92)" as const,
  marginTop: 2,
  textShadowColor: "rgba(0, 0, 0, 0.5)" as const,
  textShadowOffset: { width: 0, height: 1 } as const,
  textShadowRadius: 3,
}

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
      {/* Hero title – explicit style so all 7 days render consistently (no className reliance) */}
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginLeft: 24,
          marginBottom: 12,
          marginRight: rightContent != null ? 56 : 16,
          maxWidth: "100%",
        }}
      >
        <AppText
          font="koh-santepheap"
          size="xl"
          numberOfLines={1}
          style={heroLine1}
        >
          {textLine1}
        </AppText>
        <AppText
          font="koh-santepheap"
          size="2xl"
          numberOfLines={1}
          style={heroLine2}
        >
          {textLine2}
        </AppText>
        <AppText
          font="koh-santepheap"
          size="sm"
          numberOfLines={1}
          style={heroLine3}
        >
          {textLine3}
        </AppText>
      </View>
      {/* Drop In – App2 only, popped in on the right */}
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
