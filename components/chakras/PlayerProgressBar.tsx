/**
 * PlayerProgressBar - Custom progress bar for AudioPlayer
 *
 * Replaces react-native-awesome-slider with a simple View-based implementation
 * to avoid layout bugs (tiny bar, wrong position). Full-width, tappable, draggable.
 */

import React, { useCallback, useRef } from "react"
import { View, Pressable, StyleSheet, LayoutChangeEvent } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { runOnJS } from "react-native-reanimated"
import { formatTime } from "@/utils/format"
import { AppText } from "../AppText"

const TRACK_HEIGHT = 8
const TRACK_BG = "rgba(255,255,255,0.2)"
const FILL_BG = "#ffffff"

export const PlayerProgressBar = ({
  positionMs,
  durationMs,
  seekToPosition,
}: {
  positionMs: number
  durationMs: number
  seekToPosition: (newPositionMs: number) => Promise<void>
}) => {
  const trackWidthRef = useRef(0)
  const isValidDuration = durationMs > 0
  const progress = isValidDuration
    ? Math.min(1, Math.max(0, positionMs / durationMs))
    : 0

  const seekFromX = useCallback(
    (x: number) => {
      if (!isValidDuration || trackWidthRef.current <= 0) return
      const fraction = Math.min(1, Math.max(0, x / trackWidthRef.current))
      seekToPosition(fraction * durationMs)
    },
    [durationMs, isValidDuration, seekToPosition],
  )

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width
  }, [])

  const onPress = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      seekFromX(e.nativeEvent.locationX)
    },
    [seekFromX],
  )

  const panGesture = Gesture.Pan().onUpdate((e) => {
    "worklet"
    runOnJS(seekFromX)(e.x)
  })

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        <AppText font="instrument-medium" size="sm" style={styles.timeLeft}>
          {isValidDuration ? formatTime(positionMs) : "0:00"}
        </AppText>
        <GestureDetector gesture={panGesture}>
          <Pressable
            onPress={onPress}
            onLayout={onLayout}
            style={styles.trackWrap}
          >
            <View style={[styles.track, { backgroundColor: TRACK_BG }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: FILL_BG,
                  },
                ]}
              />
            </View>
          </Pressable>
        </GestureDetector>
        <AppText font="instrument-medium" size="sm" style={styles.timeRight}>
          {isValidDuration ? formatTime(durationMs) : "0:00"}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  trackWrap: {
    flex: 1,
    height: TRACK_HEIGHT,
    justifyContent: "center",
  },
  track: {
    width: "100%",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: TRACK_HEIGHT / 2,
  },
  timeLeft: {
    width: 40,
    textAlign: "left",
    color: "rgba(255,255,255,0.9)",
    marginRight: 8,
  },
  timeRight: {
    width: 40,
    textAlign: "right",
    color: "rgba(255,255,255,0.9)",
    marginLeft: 8,
  },
})
