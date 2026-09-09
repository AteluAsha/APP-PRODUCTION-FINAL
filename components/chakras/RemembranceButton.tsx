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

const HORIZONTAL_MARGIN = 40
const CARD_HEIGHT = 88

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
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.22)",
          ...(Platform.OS === "android"
            ? { elevation: 3 }
            : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.28,
                shadowRadius: 6,
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
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.52)",
            }}
          />
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 18,
              paddingVertical: 10,
            }}
          >
            <AppText
              font="cormorant-italic"
              style={{
                color: "#ffffff",
                fontSize: 18,
                lineHeight: 22,
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
                marginTop: 4,
                gap: 4,
              }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                Sit with this day's remembering
              </AppText>
              <Ionicons
                name="chevron-forward"
                size={13}
                color="rgba(255,255,255,0.82)"
              />
            </View>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  )
}
