import {
  ImageBackground,
  Platform,
  useWindowDimensions,
  View,
  Pressable,
} from "react-native"
import { AppText } from "../AppText"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import { getChakraColor } from "@/constants/chakras/chakraConstants"
import { getChakraIndex } from "@/utils/chakraMapping"

const HORIZONTAL_MARGIN = 24
const CARD_HEIGHT = 148

export function RemembranceButton({
  chakra,
  onPress,
}: {
  chakra: Chakra
  onPress: () => void
}) {
  const { width: screenWidth } = useWindowDimensions()
  const content = chakraContent[chakra]
  const boxWidth = screenWidth - HORIZONTAL_MARGIN * 2
  const accent = getChakraColor(getChakraIndex(chakra))

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Reflection of Remembrance"
      accessibilityHint="Open today's reflection quiz"
      style={({ pressed }) => ({
        width: boxWidth,
        alignSelf: "center",
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View
        style={{
          width: boxWidth,
          height: CARD_HEIGHT,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: accent,
          ...(Platform.OS === "android"
            ? { elevation: 8 }
            : {
                shadowColor: accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 12,
              }),
        }}
      >
        <ImageBackground
          source={content.header.headerBackground}
          style={{
            width: boxWidth,
            height: CARD_HEIGHT,
            justifyContent: "center",
          }}
          imageStyle={{ resizeMode: "cover" }}
          resizeMode="cover"
        >
          <View
            style={{
              ...{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.46)",
              },
            }}
          />
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 22,
              paddingVertical: 16,
            }}
          >
            <AppText
              font="cormorant-italic"
              style={{
                color: "#ffffff",
                fontSize: 22,
                lineHeight: 26,
                textAlign: "center",
                textShadowColor: "rgba(0,0,0,0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              Reflection of Remembrance
            </AppText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 8,
                gap: 6,
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Sit with this day's remembering
              </AppText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  )
}
