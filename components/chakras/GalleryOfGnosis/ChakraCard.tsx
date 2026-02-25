import React, { useState, useMemo, useEffect } from "react"
import { View, Image, ImageSourcePropType, Dimensions } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import { AppText } from "@/components/AppText"
import { Chakra } from "@/types/chakras/Chakra"
import { Content } from "@/types/chakras/Content"

const MIN_SCALE = 1
const MAX_SCALE = 4

/** Card uses ~98% * 1.07 (~105%) of screen width, capped at 99.5% for edge spacing */
const CARD_MAX_WIDTH = Math.min(
  Dimensions.get("window").width * 0.98 * 1.07,
  Dimensions.get("window").width * 0.995,
)

interface ChakraCardProps {
  chakra: Chakra
  content: Content
  isActive: boolean
  /** When true, title is hidden (e.g. Gallery shows it in header) */
  hideTitle?: boolean
}

const CHAKRA_NAMES: Record<Chakra, string> = {
  [Chakra.ROOT]: "Root Chakra",
  [Chakra.SACRAL]: "Sacral Chakra",
  [Chakra.SOLAR_PLEXUS]: "Solar Plexus Chakra",
  [Chakra.HEART]: "Heart Chakra",
  [Chakra.THROAT]: "Throat Chakra",
  [Chakra.THIRD_EYE]: "Third Eye Chakra",
  [Chakra.CROWN]: "Crown Chakra",
}

export const ChakraCard: React.FC<ChakraCardProps> = ({
  chakra,
  content,
  isActive,
  hideTitle = false,
}) => {
  const elements = content?.elements
  const imageSource = elements?.background
  const [imageError, setImageError] = useState(false)

  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)

  useEffect(() => {
    if (!isActive) {
      scale.value = withSpring(1)
      savedScale.value = 1
    }
  }, [isActive, scale, savedScale])

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((e) => {
          const next = savedScale.value * e.scale
          scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
        })
        .onEnd(() => {
          savedScale.value = scale.value
          if (scale.value <= MIN_SCALE) {
            scale.value = withSpring(MIN_SCALE)
            savedScale.value = MIN_SCALE
          }
        }),
    [],
  )

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  if (!imageSource) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <AppText
          font="instrument-regular"
          size="base"
          className="text-white/60 text-center"
        >
          This card is taking a moment to appear.
        </AppText>
      </View>
    )
  }

  return (
    <View
      style={{
        width: "100%",
        flex: 1,
        justifyContent: hideTitle ? "flex-start" : "center",
        alignItems: "center",
        paddingVertical: hideTitle ? 0 : 12,
        paddingHorizontal: hideTitle ? 0 : 8,
        overflow: "visible",
      }}
    >
      {!hideTitle && (
        <AppText
          font="instrument-semibold"
          size="lg"
          style={{
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            letterSpacing: 1,
            textShadowColor: "rgba(168, 201, 154, 0.2)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
            marginBottom: 28,
            zIndex: 10,
          }}
        >
          {CHAKRA_NAMES[chakra]}
        </AppText>
      )}

      {/* Card Image - Pinch to zoom */}
      <GestureDetector gesture={pinchGesture}>
        <Animated.View
          style={[
            animatedCardStyle,
            {
              width: "100%",
              maxWidth: CARD_MAX_WIDTH,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <View
            style={{
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: "rgba(0,0,0,0.5)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              width: "100%",
              maxWidth: CARD_MAX_WIDTH,
              aspectRatio: 3 / 4,
            }}
          >
            {imageError ? (
              <View className="flex-1 items-center justify-center p-8">
                <AppText
                  font="instrument-regular"
                  size="base"
                  className="text-white/60 text-center"
                >
                  This card is taking a moment to appear. Please try again.
                </AppText>
              </View>
            ) : (
              <Image
                source={imageSource as ImageSourcePropType}
                resizeMode="contain"
                style={{ width: "100%", height: "100%", borderRadius: 24 }}
                onError={() => {
                  if (__DEV__) {
                    console.warn(
                      "[ChakraCard] Image load failed for chakra:",
                      chakra,
                    )
                  }
                  setImageError(true)
                }}
                onLoad={() => {
                  if (__DEV__) {
                    console.log("[ChakraCard] Image loaded for chakra:", chakra)
                  }
                }}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}
