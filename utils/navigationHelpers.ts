/**
 * Unified Navigation Helpers
 *
 * Master unification: Single pattern for all navigation operations.
 * Eliminates scattered router.push/replace/back calls.
 */

import { router } from "expo-router"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { addHapticFeedback, HapticStrength } from "./haptic"
import { isChakraHubPath } from "@/utils/courseFocusScreen"
import { runAndroidBackCleanup, runAndroidHardwareBackOverrides } from "@/utils/androidBackCleanup"
import {
    closeFullPlayerAndLeave,
    isAudioPlayerPath,
    isClosingFullPlayer,
} from "@/utils/openFullPlayer"
import { pinRecoveryRoute } from "@/utils/appErrorRecovery"
import { closeMusicRoomPlayer } from "@/utils/musicRoomPlayback"

/**
 * Gift / Gallery / goodbye Home must land on ChakraHub with the day
 * stack dismissed. Leaving completedChakra set re-opens the transition
 * + final course-day screen on the hub.
 */
export function goToChakraHubRoot() {
  useCompletedChakraStore.getState().clearCompletedChakra()
  try {
    if (router.canDismiss()) {
      router.dismissTo("/(chakras)/ChakraHub")
      return
    }
  } catch {
    // Fall through to replace
  }
  router.replace("/(chakras)/ChakraHub")
}

/**
 * Android hardware back: pop when there is history, otherwise land on
 * ChakraHub. Never exits the app. Full-player back stops audio first.
 * Goodbye overlays intercept first.
 */
export function handleAndroidHardwareBack(pathname?: string): boolean {
  runAndroidBackCleanup()
  if (runAndroidHardwareBackOverrides()) {
    return true
  }
  if (isAudioPlayerPath(pathname)) {
    if (isClosingFullPlayer()) return true
    // Let AudioPlayer beforeRemove own teardown; pop triggers that listener.
    try {
      if (router.canGoBack()) {
        router.back()
        return true
      }
    } catch {
      // Fall through to origin-specific replace
    }
    const origin = useCurrentAudioStore.getState().audioOrigin
    const returnPath =
      useCurrentAudioStore.getState().playerReturnPath ??
      (origin === "music-room" ? "/(chakras)/AudioLibrary" : null)
    pinRecoveryRoute(returnPath)
    if (origin === "music-room") {
      void closeMusicRoomPlayer()
    } else {
      void closeFullPlayerAndLeave()
    }
    return true
  }
  try {
    if (router.canGoBack()) {
      router.back()
      return true
    }
  } catch {
    // Fall through to hub
  }
  if (!isChakraHubPath(pathname)) {
    goToChakraHubRoot()
  }
  return true
}

/** ActionBar / screen back — same cleanup path as hardware back on Android. */
export function navigateBackWithCleanup(onBackPress?: () => void): void {
  runAndroidBackCleanup()
  addHapticFeedback(HapticStrength.Light)
  if (onBackPress) {
    onBackPress()
    return
  }
  try {
    if (router.canGoBack()) {
      router.back()
      return
    }
  } catch {
    // Fall through to hub
  }
  goToChakraHubRoot()
}

/** Close a stack screen (Anua, Profile). Never leave the user with a no-op back. */
export function closeStackToHub(beforeLeave?: () => void): void {
  beforeLeave?.()
  try {
    if (router.canGoBack()) {
      router.back()
      return
    }
  } catch {
    // Fall through to hub
  }
  goToChakraHubRoot()
}

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
  home: "/(chakras)/ChakraHub",
  hub: "/(chakras)/ChakraHub",
  gallery: "/(chakras)/GalleryOfGnosis",
  audioLibrary: "/(chakras)/AudioLibrary",
  notes: "/(chakras)/NotesAlongTheWay",
  soundBath: "/(chakras)/SoundBath",
  headToHeart: "/(chakras)/HeadToHeart",
  chakras101: "/(chakras)/Chakras101",
  audioPlayer: "/AudioPlayer",
  chakra: (chakra: string) => `/(chakras)/${chakra}`,
} as const
