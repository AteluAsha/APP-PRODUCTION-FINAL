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
  const h = Math.max(headerHeight, 1)

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-h, 0, h],
            [-h / 2, 0, h * 0.75],
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-h, 0, h], [2, 1, 1]),
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
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: h,
              zIndex: -1,
            },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>

        {/* Content: spacer so header (zIndex -1) is not covered; then children */}
        <View style={{ flex: 1 }}>
          <View style={{ width: "100%", height: h }} />
          {children}
        </View>
      </Animated.ScrollView>
    </View>
  )
}
