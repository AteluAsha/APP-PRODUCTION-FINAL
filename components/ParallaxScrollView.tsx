/**
 * ParallaxScrollView - Hero + content in normal flow (no overlay)
 *
 * Hero and main content are siblings in one ScrollView. No position:absolute,
 * no zIndex overlay, no spacer. Content flows naturally from top to bottom.
 * ActionBarAnimated still uses scrollRef for scroll-triggered header bar.
 */
import { type PropsWithChildren, type ReactElement } from "react"
import { View } from "react-native"
import Animated, {
  AnimatedRef,
  AnimatedScrollViewProps,
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
  headerHeight: _headerHeight,
  scrollRef,
  ...scrollViewProps
}: Props) {
  return (
    <View style={{ flex: 1 }}>
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
        {/* Hero - part of scroll, not overlay */}
        {headerImage}
        {/* Content - follows hero in normal flow */}
        {children}
      </Animated.ScrollView>
    </View>
  )
}
