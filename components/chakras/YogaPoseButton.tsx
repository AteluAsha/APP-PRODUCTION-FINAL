import {
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  Pressable,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
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
        height: boxHeight + 8,
        alignSelf: "center",
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.978 : 1 }, { translateY: pressed ? 2 : 0 }],
      })}
    >
      <View
        style={[
          styles.lift,
          {
            width: boxWidth,
            height: boxHeight,
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 248, 236, 0.55)",
            "rgba(232, 201, 140, 0.28)",
            "rgba(40, 28, 18, 0.9)",
          ]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.chrome}
        />
        <View style={styles.inner}>
          <Image
            source={require("@/assets/images/DailyYogaButtonBG.png")}
            resizeMode="cover"
            style={styles.photo}
          />
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.18)",
              "rgba(0,0,0,0.42)",
              "rgba(0,0,0,0.62)",
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.28)", "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.45 }}
            style={styles.shine}
            pointerEvents="none"
          />
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
            <View style={styles.ctaPill}>
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
                color="rgba(255,255,255,0.95)"
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  lift: {
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.55,
        shadowRadius: 16,
      },
      android: { elevation: 14 },
    }),
  },
  chrome: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
    margin: 2,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
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
  ctaPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  cta: {
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.4,
  },
})
