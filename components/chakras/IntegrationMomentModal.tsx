/**
 * Integration Bridge Moment Modal
 *
 * Full-screen modal shown when the user taps the integration card on a chakra day.
 * Black background, one unique image per day (location/scenic), title in Hero Affirmation style.
 * X close on left for UX consistency. Content sized to fit one phone screen when possible.
 *
 * Performance (Android): Shell (background + close button) renders immediately when visible;
 * heavy content (image + text) is deferred by one frame so the modal feels instant.
 */

import React, { useState, useEffect } from "react"
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Image,
  Platform,
} from "react-native"
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { getIntegrationMomentContent } from "@/constants/chakras/integrationMomentContent"
import { chakraContent } from "@/constants/chakras/content"
import { getChakraFromDay } from "@/utils/chakraMapping"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const CONTENT_PADDING_H = 24
const IMAGE_MAX_HEIGHT_RATIO = 0.2
const TITLE_FONT_SIZE = 26
const TITLE_LINE_HEIGHT = 34
const BODY_LINE_HEIGHT = 22
const BODY_FONT_SIZE = 14
/** Defer content so modal shell paints first (reduces perceived slow load on Android). */
const CONTENT_DEFER_MS = Platform.OS === "android" ? 48 : 32

export function IntegrationMomentModal({
  visible,
  onClose,
  dayIndex,
}: {
  visible: boolean
  onClose: () => void
  dayIndex: number
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShowContent(true), CONTENT_DEFER_MS)
      return () => clearTimeout(t)
    }
    setShowContent(false)
  }, [visible])

  const content = showContent ? getIntegrationMomentContent(dayIndex) : null
  const chakra = getChakraFromDay(dayIndex)
  const imageSource = chakraContent[chakra]?.locationImage

  const topInset = Math.max(insets.top, 12)

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    onClose()
  }

  if (!visible) return null

  const imageMaxHeight = screenHeight * IMAGE_MAX_HEIGHT_RATIO

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
      transparent={false}
    >
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: CONTENT_PADDING_H,
              paddingTop: topInset,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                paddingTop: 8,
                paddingBottom: 12,
              }}
            >
              <Pressable
                onPress={handleClose}
                hitSlop={16}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.9)" />
              </Pressable>
            </View>

            {showContent && content ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingBottom: 24,
                }}
              >
                {imageSource ? (
                  <View
                    style={{
                      alignItems: "center",
                      marginBottom: 16,
                      maxHeight: imageMaxHeight,
                    }}
                  >
                    <View
                      style={{
                        width: screenWidth - CONTENT_PADDING_H * 2,
                        maxHeight: imageMaxHeight,
                        backgroundColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Image
                        source={imageSource}
                        resizeMode="contain"
                        style={{
                          width: screenWidth - CONTENT_PADDING_H * 2,
                          maxHeight: imageMaxHeight,
                        }}
                      />
                    </View>
                  </View>
                ) : null}

                <AppText
                  font="cormorant-italic"
                  style={{
                    color: "rgba(255,255,255,0.88)",
                    fontSize: TITLE_FONT_SIZE,
                    lineHeight: TITLE_LINE_HEIGHT,
                    marginBottom: 16,
                    textAlign: "center",
                    paddingHorizontal: 8,
                  }}
                >
                  {content.title}
                </AppText>

                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={{
                    color: "rgba(255,255,255,0.82)",
                    fontSize: BODY_FONT_SIZE,
                    lineHeight: BODY_LINE_HEIGHT,
                    letterSpacing: 0.15,
                    paddingHorizontal: 4,
                  }}
                >
                  {content.body}
                </AppText>
              </ScrollView>
            ) : null}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}
