/**
 * ActionBarAnimated – scroll-triggered header bar + standalone back arrow.
 *
 * CRITICAL: Back button is rendered as screen content (NOT in native header) to avoid
 * the grey circle that iOS applies to UIBarButtonItem-style elements. See
 * BACK_ARROW_GREY_CIRCLE_DIAGNOSIS.md.
 */

import { Ionicons } from "@expo/vector-icons"
import { Stack, useRouter } from "expo-router"
import {
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
} from "react-native"
import Animated, {
  AnimatedRef,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useAnimatedStyle } from "react-native-reanimated"
import { useScrollViewOffset } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export const ActionBarAnimated = ({
  scrollViewRef,
  headerImageSource,
  scrollThreshold = 200,
  onBackPress,
}: {
  scrollViewRef: AnimatedRef<Animated.ScrollView>
  headerImageSource?: ImageSourcePropType
  scrollThreshold?: number
  onBackPress?: () => void
}) => {
  const router = useRouter()
  const scrollHandler = useScrollViewOffset(scrollViewRef)
  const insets = useSafeAreaInsets()

  const animatedOpacity = useSharedValue(0)

  useDerivedValue(() => {
    if (scrollHandler.value >= scrollThreshold) {
      animatedOpacity.value = withTiming(1, { duration: 300 })
    } else {
      animatedOpacity.value = withTiming(0, { duration: 300 })
    }
  })

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }))

  const handleBack = () => {
    addHapticFeedback(HapticStrength.Light)
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Standalone back arrow – white arrow only, no background (avoids iOS grey circle) */}
      <TouchableOpacity
        onPress={handleBack}
        accessibilityLabel="Back"
        accessibilityHint="Tap to go back"
        style={{
          position: "absolute",
          top: Math.max(insets.top, 8) + 8,
          left: 16,
          zIndex: 1001,
          padding: 8,
          backgroundColor: "transparent",
          margin: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="rgba(255, 255, 255, 0.9)"
        />
      </TouchableOpacity>

      {/* Scroll-triggered header bar overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          headerAnimatedStyle,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            paddingTop: insets.top,
            backgroundColor: "#000000",
            borderBottomColor: "#232323",
            borderBottomWidth: 1,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          },
        ]}
      >
        {headerImageSource && (
          <Image
            source={headerImageSource}
            style={{ width: 48, height: 48, marginBottom: 8 }}
            resizeMode="contain"
          />
        )}
      </Animated.View>
    </>
  )
}
