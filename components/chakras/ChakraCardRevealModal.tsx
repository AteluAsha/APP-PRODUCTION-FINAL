import React, { useEffect, useCallback } from "react"
import { View, Modal, Pressable, Dimensions } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { ChakraCard } from "@/components/chakras/GalleryOfGnosis/ChakraCard"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import { ActionBar } from "@/components/ActionBar"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface ChakraCardRevealModalProps {
  visible: boolean
  chakra: Chakra
  onClose: () => void
}

/**
 * Chakra Card Reveal Modal
 *
 * Reveals the chakra card reward when user opens their gift
 * Shows a beautiful animation and then displays the card
 */
export const ChakraCardRevealModal: React.FC<ChakraCardRevealModalProps> = ({
  visible,
  chakra,
  onClose,
}) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const content = chakraContent[chakra]

  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)
  const cardOpacity = useSharedValue(0)
  const cardScale = useSharedValue(0.8)

  useEffect(() => {
    if (visible) {
      // Reset animations
      scale.value = 0
      opacity.value = 0
      cardOpacity.value = 0
      cardScale.value = 0.8

      // Animate gift opening
      scale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.exp) }),
        withSpring(1, { damping: 10, stiffness: 100 }),
      )
      opacity.value = withTiming(1, { duration: 300 })

      // Reveal card after a delay - cleanup timeout on unmount
      const timeoutId = setTimeout(() => {
        cardOpacity.value = withTiming(1, { duration: 500 })
        cardScale.value = withSpring(1, { damping: 8, stiffness: 100 })
      }, 600)

      return () => {
        clearTimeout(timeoutId)
      }
    } else {
      scale.value = 0
      opacity.value = 0
      cardOpacity.value = 0
      cardScale.value = 0.8
    }
  }, [visible, scale, opacity, cardOpacity, cardScale])

  const giftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }))

  // Ensure onClose is always callable - fix for day 7 X button issue
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }
  }, [onClose])

  const handleViewInGallery = useCallback(() => {
    handleClose()
    // Delay for modal to fully dismiss before navigation (avoids glitch screen)
    setTimeout(() => {
      router.replace("/(chakras)/GalleryOfGnosis" as const)
    }, 550)
  }, [handleClose, router])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.95)",
            }}
          >
            <ActionBar useXButton={true} onXPress={handleClose} />

            <View
              style={{
                flex: 1,
                alignItems: "center",
                paddingHorizontal: 16,
                justifyContent: "space-between",
                paddingTop: insets.top + 32,
                paddingBottom: 24,
              }}
            >
              {/* Title block: lower so it doesn't run off screen on any device */}
              <Animated.View
                style={[
                  giftStyle,
                  {
                    width: "100%",
                    paddingTop: 24,
                    paddingBottom: 16,
                    zIndex: 1,
                    alignItems: "center",
                  },
                ]}
              >
                <AppText
                  font="instrument-regular"
                  size="xl"
                  style={{
                    letterSpacing: 1,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 8,
                    textAlign: "center",
                    textShadowColor: "rgba(168, 201, 154, 0.3)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 8,
                  }}
                >
                  Your Gift Awaits
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={{
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.75)",
                    textAlign: "center",
                    textShadowColor: "rgba(168, 201, 154, 0.2)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 6,
                  }}
                >
                  You've unlocked a Chakra Card!
                </AppText>
              </Animated.View>

              {/* Card reveal - CENTERED with maximum size while maintaining spacing */}
              <Animated.View
                style={[
                  cardStyle,
                  {
                    width: "100%",
                    maxWidth: 420,
                    flex: 1,
                    minHeight: 200,
                    maxHeight: 400,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 20,
                  },
                ]}
              >
                <View
                  style={{
                    width: "100%",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChakraCard
                    chakra={chakra}
                    content={content}
                    isActive={true}
                  />
                </View>
              </Animated.View>

              {/* Action buttons - positioned at bottom */}
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "center",
                  paddingBottom: 16,
                  gap: 16,
                }}
              >
                <Pressable
                  onPress={handleClose}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    borderRadius: 9999,
                  }}
                >
                  <AppText
                    font="instrument-regular"
                    size="base"
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      textShadowColor: "rgba(0, 0, 0, 0.5)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 4,
                    }}
                  >
                    Close
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={handleViewInGallery}
                  style={{
                    borderRadius: 24,
                    overflow: "hidden",
                    shadowColor: "rgba(168, 201, 154, 0.4)",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.6,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <LinearGradient
                    colors={[
                      "rgba(0, 0, 0, 0.6)",
                      "rgba(139, 115, 85, 0.25)",
                      "rgba(168, 201, 154, 0.15)",
                      "rgba(0, 0, 0, 0.5)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    locations={[0, 0.3, 0.7, 1]}
                    style={{
                      borderRadius: 24,
                      paddingVertical: 14,
                      paddingHorizontal: 28,
                      borderWidth: 1,
                      borderColor: "rgba(168, 201, 154, 0.3)",
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Subtle gradient light overlay */}
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.1)",
                        "rgba(168, 201, 154, 0.08)",
                        "transparent",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 24,
                      }}
                    />
                    {/* Subtle inner glow hint */}
                    <View
                      style={{
                        position: "absolute",
                        top: "40%",
                        left: "25%",
                        right: "25%",
                        height: "20%",
                        backgroundColor: "rgba(168, 201, 154, 0.2)",
                        borderRadius: 12,
                        opacity: 0.5,
                      }}
                    />
                    <AppText
                      font="instrument-medium"
                      size="base"
                      style={{
                        color: "rgba(255,255,255,0.95)",
                        zIndex: 10,
                        letterSpacing: 0.8,
                        textShadowColor: "rgba(168, 201, 154, 0.5)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 8,
                      }}
                    >
                      View in Gallery
                    </AppText>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  )
}
