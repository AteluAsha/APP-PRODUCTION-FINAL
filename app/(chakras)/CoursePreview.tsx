/**
 * Course Preview Screen
 *
 * Displays the course preview image with subtle back navigation
 */

import React from "react"
import { View, Image, Pressable, ScrollView, Dimensions } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

export default function CoursePreview() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    addHapticFeedback(HapticStrength.Light)
    router.back()
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View className="flex-1 bg-black">
        {/* Subtle back arrow - Top left */}
        <Pressable
          onPress={handleBack}
          className="absolute z-50 active:opacity-70"
          style={{
            top: Math.max(insets.top, 8) + 8,
            left: 16,
            padding: 8,
            backgroundColor: "transparent",
            justifyContent: "center",
            alignItems: "center",
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="rgba(255, 255, 255, 0.9)"
          />
        </Pressable>

        {/* Preview Image - Centered, scrollable */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Image
            source={require("@/assets/images/7Chakras_CoursePreview.png")}
            style={{
              width: SCREEN_WIDTH,
              height: undefined,
              aspectRatio: undefined, // Let it maintain natural aspect
              maxWidth: "100%",
            }}
            resizeMode="contain"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
