/**
 * MenuBarMiniPlayer
 *
 * Tiny bar above the Music icon on the menu bar. Play, Pause, Close only.
 * Shown when Music Room audio is playing and user has left the Music Room.
 * Stays visible when the menu bar toggles closed.
 * Draggable: user can move it; position resets when navigating to a new page.
 */

import React, { useEffect, useMemo } from "react"
import { View, Pressable, StyleSheet, Text, Dimensions } from "react-native"
import { usePathname, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { silenceAllAudio } from "@/src/utils/singleActiveSound"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const BAR_WIDTH = 220
const BAR_HEIGHT = 36
const MARGIN = 12

function getShortTitle(metadata: { title: string; author: string }): string {
  const text = `${metadata.title} ${metadata.author}`
  const hzMatch = text.match(/(\d{3})\s*Hz/i)
  const hz = hzMatch ? hzMatch[1] : ""
  if (metadata.title.includes("Tuning Fork"))
    return hz ? `Tuning - ${hz} Hz` : "Tuning Fork"
  if (metadata.title.includes("Crystal Bowl"))
    return hz ? `Crystal - ${hz} Hz` : "Crystal Bowl"
  if (
    metadata.title.includes("Part One") ||
    metadata.title.includes("Part Two")
  )
    return hz ? `Meditation - ${hz} Hz` : "Meditation"
  if (
    metadata.title.includes("Good Morning") ||
    metadata.title.includes("Hello") ||
    metadata.title.includes("Meadow") ||
    metadata.title.includes("Ajna")
  ) {
    if (hz) return `Meditation - ${hz} Hz`
    const short =
      metadata.title.replace(/^Good Morning\s*/i, "").replace(/\s*!$/, "") ||
      "Meditation"
    return short.length > 18 ? `${short.slice(0, 15)}…` : short
  }
  return hz ? `Meditation - ${hz} Hz` : metadata.title.slice(0, 18) || "Playing"
}

export function MenuBarMiniPlayer() {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const router = useRouter()
  const source = useCurrentAudioStore((s) => s.source)
  const metadata = useCurrentAudioStore((s) => s.metadata)
  const prefs = useCurrentAudioStore((s) => s.prefs)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const currentTrackKey = useCurrentAudioStore((s) => s.currentTrackKey)
  const isPlaying = useCurrentAudioStore((s) => s.isPlaying)
  const setPlaying = useCurrentAudioStore((s) => s.setPlaying)
  const reset = useCurrentAudioStore((s) => s.reset)

  const isOnAudioLibrary = pathname?.includes("AudioLibrary")
  const isOnAudioPlayer = pathname?.includes("AudioPlayer")
  const isOnSoundBath = pathname?.includes("SoundBath")
  const isGoodbyeVisible = useGoodbyeModalStore((s) => s.isGoodbyeVisible)
  const shouldShowMusicRoom = !!(
    source &&
    metadata &&
    audioOrigin === "music-room" &&
    !isOnAudioLibrary &&
    !isOnAudioPlayer
  )
  const shouldShowOther = !!(
    source &&
    metadata &&
    audioOrigin === "other" &&
    !isOnAudioPlayer &&
    !isOnSoundBath &&
    !prefs?.isIntroAudio
  )
  const shouldShow = !isGoodbyeVisible && (shouldShowMusicRoom || shouldShowOther)

  const baseLeft = 16
  const baseBottom = Math.max(insets.bottom, 4) + 58

  const offsetX = useSharedValue(0)
  const offsetY = useSharedValue(0)
  const gestureX = useSharedValue(0)
  const gestureY = useSharedValue(0)

  useEffect(() => {
    if (!shouldShow) return
    offsetX.value = 0
    offsetY.value = 0
    gestureX.value = 0
    gestureY.value = 0
  }, [pathname, shouldShow])

  const minOffsetX = MARGIN - baseLeft
  const maxOffsetX = SCREEN_WIDTH - BAR_WIDTH - MARGIN - baseLeft
  const minOffsetY = baseBottom - (SCREEN_HEIGHT - BAR_HEIGHT - MARGIN)
  const maxOffsetY = baseBottom - MARGIN

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(10)
        .activeOffsetX([-10, 10])
        .activeOffsetY([-10, 10])
        .onUpdate((e) => {
          gestureX.value = e.translationX
          gestureY.value = e.translationY
        })
        .onEnd(() => {
          const nextX = offsetX.value + gestureX.value
          const nextY = offsetY.value + gestureY.value
          offsetX.value = withSpring(
            Math.min(maxOffsetX, Math.max(minOffsetX, nextX)),
            { damping: 18, stiffness: 180 },
          )
          offsetY.value = withSpring(
            Math.min(maxOffsetY, Math.max(minOffsetY, nextY)),
            { damping: 18, stiffness: 180 },
          )
          gestureX.value = withSpring(0, { damping: 18, stiffness: 180 })
          gestureY.value = withSpring(0, { damping: 18, stiffness: 180 })
        }),
    [minOffsetX, maxOffsetX, minOffsetY, maxOffsetY],
  )

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value + gestureX.value },
      { translateY: offsetY.value + gestureY.value },
    ],
  }))

  if (!shouldShow) return null

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            left: baseLeft,
            bottom: baseBottom,
          },
          animatedStyle,
        ]}
        pointerEvents="box-none"
      >
        <View style={[styles.bar, { width: BAR_WIDTH }]}>
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              setPlaying(!isPlaying)
            }}
            style={styles.button}
            accessibilityLabel={isPlaying ? "Pause" : "Play"}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={16}
              color="rgba(255,255,255,0.95)"
            />
          </Pressable>
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              if (audioOrigin === "other") {
                router.push("/AudioPlayer")
              } else {
                const params = currentTrackKey
                  ? { scrollTo: currentTrackKey }
                  : undefined
                router.push({
                  pathname: "/(chakras)/AudioLibrary",
                  params,
                })
              }
            }}
            style={styles.titleTouchable}
            accessibilityLabel={
              audioOrigin === "other" ? "Open full player" : "Go to Music Room"
            }
            accessibilityHint={
              audioOrigin === "other"
                ? "Opens the meditation play screen"
                : "Opens the Frequency of Gnosis screen and scrolls to the playing track"
            }
          >
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {getShortTitle(metadata)}
            </Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              void silenceAllAudio().finally(() => reset())
            }}
            style={styles.button}
            accessibilityLabel="Close and stop audio"
          >
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.95)" />
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 55,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  button: {
    padding: 6,
  },
  titleTouchable: {
    flex: 1,
    marginLeft: 4,
    marginRight: 4,
    justifyContent: "center",
    minWidth: 80,
  },
  title: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    alignSelf: "stretch",
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 6,
  },
})
