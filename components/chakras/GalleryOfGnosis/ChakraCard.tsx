import React, { useState, useMemo, useEffect } from "react"
import { View, Image, ImageSourcePropType } from "react-native"
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

interface ChakraCardProps {
  chakra: Chakra
  content: Content
  isActive: boolean
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
      className="w-full items-center justify-center"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        marginTop: -48,
        overflow: "visible",
      }}
    >
      {/* Title above the card */}
      <AppText
        font="instrument-regular"
        size="lg"
        className="text-white/85 text-center"
        style={{
          letterSpacing: 1,
          textShadowColor: "rgba(168, 201, 154, 0.2)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 6,
          marginBottom: 12,
        }}
      >
        {CHAKRA_NAMES[chakra]}
      </AppText>

      {/* Card Image - Pinch to zoom */}
      <GestureDetector gesture={pinchGesture}>
        <Animated.View
          style={[
            animatedCardStyle,
            {
              width: "100%",
              maxWidth: 420,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <View
            className="rounded-3xl overflow-hidden bg-black/50"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              width: "100%",
              maxWidth: 420,
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
