import { useEffect } from "react"
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import {
  consumeChakraHubRevealBreathIfPending,
  consumeHomeEntranceIfFirst,
} from "@/utils/homeSessionEntrance"
import {
  CHAKRA_HUB_REVEAL_BREATH_MS,
  SOMATIC_HOME_COLD_START_FADE_MS,
  SOMATIC_HOME_WARM_RETURN_MS,
} from "@/constants/layout"

/** Soft material-style curve: slow, imperceptible start; elegant finish (deep inhalation). */
const HOME_ENTRANCE_EASING = Easing.bezier(0.4, 0, 0.2, 1)

/**
 * Session-scoped opacity for home dashboards: 3000ms fade on first ready paint
 * after cold start; Chakra Home Reveal Breath (same duration) when
 * `requestChakraHubRevealBreath()` was called before navigating to ChakraHub;
 * 400ms warm return on other revisits in the same process.
 *
 * Pass **dashboardReady** only when the main dashboard UI is actually shown (not loading
 * logo, waiting room, or gates). While false, consumeHomeEntranceIfFirst is never called,
 * so the session ritual is not spent on loading states.
 */
export function useHomeSomaticEntrance(dashboardReady: boolean) {
  const opacity = useSharedValue(0)
  const contentOpacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  useEffect(() => {
    if (!dashboardReady) {
      opacity.value = 0
      return
    }
    if (consumeChakraHubRevealBreathIfPending()) {
      opacity.value = withTiming(1, {
        duration: CHAKRA_HUB_REVEAL_BREATH_MS,
        easing: HOME_ENTRANCE_EASING,
      })
    } else if (consumeHomeEntranceIfFirst()) {
      opacity.value = withTiming(1, {
        duration: SOMATIC_HOME_COLD_START_FADE_MS,
        easing: HOME_ENTRANCE_EASING,
      })
    } else {
      opacity.value = withTiming(1, {
        duration: SOMATIC_HOME_WARM_RETURN_MS,
        easing: HOME_ENTRANCE_EASING,
      })
    }
  }, [dashboardReady, opacity])

  return { contentOpacityStyle }
}
