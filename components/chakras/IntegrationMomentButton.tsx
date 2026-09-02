import React from "react"
import { View, Pressable, ImageBackground, StyleSheet } from "react-native"
import { AppText } from "@/components/AppText"
import { getIntegrationMomentContent } from "@/constants/chakras/integrationMomentContent"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const INTEGRATION_BUTTON_BG = require("@/assets/images/DailyIntegration_BGB_utton_Image.png")

export function IntegrationMomentButton({
  dayIndex,
  onPress,
}: {
  dayIndex: number
  onPress: () => void
}) {
  const title =
    getIntegrationMomentContent(dayIndex)?.title ?? "Bridge moment"

  return (
    <Pressable
      onPress={() => {
        onPress()
        addHapticFeedback(HapticStrength.Light)
      }}
      accessibilityLabel={title}
      accessibilityHint="Opens integration reflection for today"
      style={{
        width: "83.33%",
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 28,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
      }}
    >
      <ImageBackground
        source={INTEGRATION_BUTTON_BG}
        resizeMode="cover"
        style={{
          borderRadius: 18,
          paddingVertical: 16,
          paddingHorizontal: 28,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: 18,
          }}
        />
        <AppText
          font="cormorant-italic"
          size="base"
          style={{
            marginBottom: 4,
            fontSize: 20,
            color: "#ffffff",
            textAlign: "center",
            textShadowColor: "rgba(0,0,0,0.8)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {title}
        </AppText>
        <AppText
          font="instrument-italic"
          size="sm"
          style={{
            color: "rgba(255,255,255,0.98)",
            textAlign: "center",
            textShadowColor: "rgba(0,0,0,0.8)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          A moment of Integration
        </AppText>
      </ImageBackground>
    </Pressable>
  )
}
