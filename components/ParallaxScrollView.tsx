import { type PropsWithChildren, type ReactElement } from "react"
import { View } from "react-native"
import Animated, {
  AnimatedRef,
  AnimatedScrollViewProps,
  interpolate,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated"

type Props = PropsWithChildren<{
  headerImage: ReactElement
  headerHeight: number
  scrollRef: AnimatedRef<Animated.ScrollView>
}> &
  AnimatedScrollViewProps

export default function ParallaxScrollView({
  children,
  headerImage,
  headerHeight,
  scrollRef,
  ...scrollViewProps
}: Props) {
  const scrollOffset = useScrollViewOffset(scrollRef)

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [2, 1, 1],
          ),
        },
      ],
    }
  })

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollEnabled={true}
        bounces={true}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}
      >
        {/* Overlapping Header */}
        <Animated.View
          style={[
            {
              position: "absolute", // Position the header over the content
              top: 0,
              left: 0,
              right: 0,
              zIndex: -1, // Ensure the header is below other content
            },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>

        {/* Content */}
        <View style={{ flex: 1 }}>{children}</View>
      </Animated.ScrollView>
    </View>
  )
}
