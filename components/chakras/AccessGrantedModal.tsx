/**
 * Access Granted Modal
 *
 * Celebration modal shown after successful payment or restore (not scholarship).
 * Scholarship path goes to Energy Exchange instead. Welcomes user to their
 * full sacred space and offers navigation to ChakraHub.
 */

import React from "react"
import { View, Modal, Pressable, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated"

interface AccessGrantedModalProps {
  visible: boolean
  onClose: () => void
  onGoToHub: () => void
  onContinueJourney: () => void
}

export const AccessGrantedModal: React.FC<AccessGrantedModalProps> = ({
  visible,
  onClose,
  onGoToHub,
  onContinueJourney,
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0)

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 500 })
      scale.value = withRepeat(
        withTiming(1.05, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      )
    } else {
      opacity.value = withTiming(0, { duration: 300 })
      scale.value = 1
    }
  }, [visible, opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {visible ? (
      <View className="flex-1 justify-center items-center bg-black/90" style={{ backgroundColor: "rgba(0,0,0,0.9)" }}>
        <Animated.View style={animatedStyle} className="w-[90%] max-w-md">
          <LinearGradient
            colors={[
              "rgba(18, 24, 26, 0.98)",
              "rgba(14, 22, 26, 0.98)",
              "rgba(12, 20, 24, 0.98)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 32,
              borderWidth: 2,
              borderColor: "rgba(168, 201, 154, 0.35)",
              alignItems: "center",
            }}
          >
            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(168, 201, 154, 0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="close"
                size={20}
                color="rgba(168, 201, 154, 0.9)"
              />
            </Pressable>

            {/* Celebration Icon */}
            <View className="mb-6">
              <Image
                source={require("@/assets/images/7chakras.png")}
                style={{ width: 96, height: 96 }}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <AppText
              font="instrument-bold"
              size="2xl"
              className="text-center mb-3 text-white"
            >
              Your Sacred Space is Open
            </AppText>

            {/* Message */}
            <AppText
              font="instrument-regular"
              size="base"
              className="text-center mb-6 text-white/90 leading-6"
            >
              All paths are now open to you. Your journey continues with
              unlimited access to all teachings, meditations, and sacred spaces.
            </AppText>

            {/* Buttons */}
            <View className="w-full gap-3">
              {/* Go to Hub Button */}
              <Pressable
                onPress={() => {
                  onGoToHub()
                  onClose()
                }}
                className="active:opacity-80"
              >
                <LinearGradient
                  colors={[
                    "rgba(168, 201, 154, 0.5)",
                    "rgba(107, 142, 90, 0.45)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <AppText
                    font="instrument-bold"
                    size="lg"
                    className="text-white"
                  >
                    Enter Your Sacred Space
                  </AppText>
                </LinearGradient>
              </Pressable>

              {/* Continue Journey Button */}
              <Pressable
                onPress={() => {
                  onContinueJourney()
                  onClose()
                }}
                className="active:opacity-80"
              >
                <View
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: "rgba(168, 201, 154, 0.4)",
                    alignItems: "center",
                  }}
                >
                  <AppText
                    font="instrument-medium"
                    size="base"
                    className="text-white"
                  >
                    Continue Weekly Journey
                  </AppText>
                </View>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
      ) : null}
    </Modal>
  )
}
