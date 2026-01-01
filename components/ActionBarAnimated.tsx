import { MaterialCommunityIcons } from "@expo/vector-icons"
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

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity)

/**
 * Provides Stack.Screen options for a header that animates based on ScrollView offset.
 * Typically used to fade in a background or change appearance as the user scrolls down.
 * Includes an animated back button.
 */
export const ActionBarAnimated = ({
  scrollViewRef,
  headerImageSource,
  scrollThreshold = 200,
}: {
  scrollViewRef: AnimatedRef<Animated.ScrollView>
  headerImageSource?: ImageSourcePropType
  scrollThreshold?: number
}) => {
  const router = useRouter()
  const scrollHandler = useScrollViewOffset(scrollViewRef)

  const animatedOpacity = useSharedValue(0)

  useDerivedValue(() => {
    if (scrollHandler.value >= scrollThreshold) {
      animatedOpacity.value = withTiming(1, { duration: 300 })
    } else {
      animatedOpacity.value = withTiming(0, { duration: 300 })
    }
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
    }
  })

  const insets = useSafeAreaInsets()
  return (
    <View className="bg-red-100">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackground: () => (
            <Animated.View
              style={[
                headerAnimatedStyle,
                {
                  backgroundColor: "#000000",
                  height: 100,
                  borderColor: "#232323",
                  paddingTop: insets.top,
                },
              ]}
              className="justify-center items-center bg-white"
            >
              <Image
                source={headerImageSource}
                className={`w-12 h-12 object-cover self-center mb-2 z-10`}
              />
            </Animated.View>
          ),
          headerLeft: () => (
            <AnimatedTouchableOpacity
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                router.back()
              }}
            >
              <MaterialCommunityIcons
                name="keyboard-backspace"
                size={28}
                color="white"
              />
            </AnimatedTouchableOpacity>
          ),
        }}
      />
    </View>
  )
}
