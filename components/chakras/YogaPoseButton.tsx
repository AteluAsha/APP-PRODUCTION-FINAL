import {
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  Pressable,
} from "react-native"
import { AppText } from "../AppText"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Chakra } from "@/types/chakras/Chakra"
import { YOGA_STUDIO } from "@/constants/yogaStudio"

const HORIZONTAL_MARGIN = 24
/** Landscape banner — keep this a rectangle, never a square. */
const CARD_ASPECT = 2.45

export function YogaPoseButton({
  chakra,
  onPress,
}: {
  chakra: Chakra
  onPress: () => void
}) {
  const { width: screenWidth } = useWindowDimensions()
  const poseName = YOGA_STUDIO[chakra].poseName
  const boxWidth = screenWidth - HORIZONTAL_MARGIN * 2
  const boxHeight = Math.round(boxWidth / CARD_ASPECT)

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={poseName}
      accessibilityHint="Opens today's integration practice"
      style={({ pressed }) => ({
        width: boxWidth,
        height: boxHeight,
        alignSelf: "center",
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View
        style={{
          width: boxWidth,
          height: boxHeight,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.88)",
          ...(Platform.OS === "android"
            ? { elevation: 8 }
            : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 10,
              }),
        }}
      >
        <Image
          source={require("@/assets/images/DailyYogaButtonBG.png")}
          resizeMode="cover"
          style={styles.photo}
        />
        <View style={styles.veil} />
        <View style={styles.copy}>
          <AppText
            font="instrument-regular"
            size="xs"
            style={styles.kicker}
          >
            BODY HEALING
          </AppText>
          <AppText
            font="instrument-bold"
            size="xl"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={styles.poseName}
          >
            {poseName}
          </AppText>
          <View style={styles.ctaRow}>
            <AppText
              font="instrument-regular"
              size="sm"
              style={styles.cta}
            >
              Open the studio
            </AppText>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="rgba(255,255,255,0.9)"
            />
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  copy: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  kicker: {
    color: "rgba(232, 201, 140, 0.92)",
    letterSpacing: 1.8,
    textAlign: "center",
    marginBottom: 6,
  },
  poseName: {
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 28,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  cta: {
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.4,
  },
})
