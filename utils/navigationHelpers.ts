/**
 * Unified Navigation Helpers
 *
 * Master unification: Single pattern for all navigation operations.
 * Eliminates scattered router.push/replace/back calls.
 */

import { router } from "expo-router"
import { addHapticFeedback, HapticStrength } from "./haptic"

/**
 * Navigate to a route with haptic feedback
 */
export const navigateTo = (
  route: string,
  options?: { replace?: boolean; haptic?: boolean },
) => {
  const { replace = false, haptic = true } = options || {}

  if (haptic) {
    addHapticFeedback(HapticStrength.Light)
  }

  if (replace) {
    router.replace(route as any)
  } else {
    router.push(route as any)
  }
}

/**
 * Navigate back with haptic feedback
 */
export const navigateBack = (haptic = true) => {
  if (haptic) {
    addHapticFeedback(HapticStrength.Light)
  }
  router.back()
}

/**
 * Common navigation routes
 */
export const ROUTES = {
  home: "/(chakras)/",
  hub: "/(chakras)/ChakraHub",
  gallery: "/(chakras)/GalleryOfGnosis",
  community: "/CommunityHalls",
  audioLibrary: "/(chakras)/AudioLibrary",
  accountability: "/(chakras)/AccountabilityOfAwakening",
  divineLaws: "/(chakras)/DivineLaws",
  soundBath: "/(chakras)/SoundBath",
  headToHeart: "/(chakras)/HeadToHeart",
  chakras101: "/(chakras)/Chakras101",
  audioPlayer: "/AudioPlayer",
  chakra: (chakra: string) => `/(chakras)/${chakra}`,
} as const
