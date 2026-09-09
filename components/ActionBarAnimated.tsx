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
  Platform,
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
import { goToChakraHubRoot } from "@/utils/navigationHelpers"
import { runAndroidBackCleanup } from "@/utils/androidBackCleanup"
import { ICON, safeOverlayTop } from "@/constants/layout"

export const ActionBarAnimated = ({
  scrollViewRef,
  headerImageSource,
  scrollThreshold = 200,
  onBackPress,
  showBackButton = true,
}: {
  scrollViewRef: AnimatedRef<Animated.ScrollView>
  headerImageSource?: ImageSourcePropType
  scrollThreshold?: number
  onBackPress?: () => void
  /** When false, back arrow is hidden. Default true. */
  showBackButton?: boolean
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
    if (Platform.OS === "android") {
      runAndroidBackCleanup()
    }
    addHapticFeedback(HapticStrength.Light)
    if (onBackPress) {
      onBackPress()
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {showBackButton && (
        <TouchableOpacity
          onPress={handleBack}
          accessibilityLabel="Back"
          accessibilityHint="Tap to go back"
          style={{
            position: "absolute",
            top: safeOverlayTop(insets.top),
            left: 16,
            width: ICON.homeButton,
            height: ICON.homeButton,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
            backgroundColor: "transparent",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.5,
            shadowRadius: 3,
            elevation: 4,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={ICON.actionBar}
            color="rgba(255, 255, 255, 0.95)"
          />
        </TouchableOpacity>
      )}

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
