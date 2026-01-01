import ResponsiveImage from "@/components/ResponsiveImage"
import { AppText } from "@/components/AppText"
import React, { useState } from "react"
import {
  View,
  Image,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native"
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { GiftIcon } from "./GiftIcon"
import { ChakraCardRevealModal } from "./ChakraCardRevealModal"
import { Chakra } from "@/types/chakras/Chakra"
import { useRouter } from "expo-router"
import { getChakraFromDay } from "@/utils/chakraMapping"

const GoodbyeModal = ({
  isVisible,
  onClose,
  chakraDay,
}: {
  isVisible: boolean
  onClose: () => void
  chakraDay?: number
}) => {
  const router = useRouter()
  const [showCardReveal, setShowCardReveal] = useState(false)

  const currentChakra = chakraDay !== undefined ? getChakraFromDay(chakraDay) : Chakra.ROOT
  const isDayOne = chakraDay === 0
  const { width } = useWindowDimensions()
  const opacity = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  React.useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 })
    } else {
      opacity.value = withTiming(0, { duration: 300 })
    }
  }, [isVisible, opacity])

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          className="absolute inset-0 bg-black/80 flex justify-center items-center"
          style={animatedStyle}
        >
          <View className="w-11/12 bg-black rounded-2xl p-6 pt-24 pb-16 items-center relative border-[1px] border-[#2e2e2e]">
            {/* "X" Button (Top Right) */}
            {/* <TouchableOpacity
              onPress={onClose}
              className="absolute top-5 right-5"
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity> */}

            {/* Header Text */}
            <AppText font="instrument-regular" size="sm" className="text-center">
              {"Wonderful work lovely soul.\n Have a beautiful day."}
            </AppText>
            {/* Centered Quote */}
            <AppText
              font="instrument-italic"
              size="base"
              className="text-center mt-8 px-4"
            >
              "In the stillness of the Earth, find your grounding, your sanctuary,
              your belonging."
            </AppText>

            <View className="relative w-full flex items-center justify-center mt-8">
              {/* Heart Icon (Positioned Behind the Text) */}
              <Image
                source={require("@/assets/images/heartoutline.png")}
                className="absolute w-14 h-14"
              />

              {/* "See you tomorrow" Text (Centered Above the Heart) */}
              <AppText font="instrument-italic" size="sm" className="text-center">
                We will see you tomorrow.
              </AppText>
            </View>

            <ResponsiveImage
              source={require("@/assets/images/ibelong.png")}
              width={(width * 4) / 5}
              className="mt-8"
            />

            {/* Chakra Symbol */}
            <Image
              source={require("@/assets/images/7chakras.png")}
              className="w-8 h-8 mt-8"
              resizeMode="contain"
            />

            {/* Gift Button - Open Your Gift */}
            <Pressable
              onPress={() => setShowCardReveal(true)}
              className="mt-8 active:opacity-80"
              style={{
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']} // Gold gradient for gift
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 180,
                }}
              >
                <View className="flex-row items-center">
                  <GiftIcon size={32} animated={true} />
                  <AppText font="instrument-medium" size="base" className="text-white ml-3">
                    Open Your Gift
                  </AppText>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Gallery of Gnosis info on Day One */}
            {isDayOne && (
              <View className="mt-6 px-4">
                <AppText font="instrument-regular" size="sm" className="text-center text-white/70">
                  Your chakra cards will be collected in the
                </AppText>
              <Pressable
                onPress={() => {
                  onClose()
                  // Small delay for smooth transition
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      router.push('/(chakras)/GalleryOfGnosis')
                    }, 300)
                  })
                }}
                className="mt-2"
              >
                  <AppText font="instrument-bold" size="lg" className="text-center text-[#9D4EDD] underline">
                    Gallery of Gnosis
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Chakra Card Reveal Modal - Outside TouchableWithoutFeedback */}
      <ChakraCardRevealModal
        visible={showCardReveal}
        chakra={currentChakra}
        onClose={() => setShowCardReveal(false)}
      />
    </>
  )
}

export default GoodbyeModal
