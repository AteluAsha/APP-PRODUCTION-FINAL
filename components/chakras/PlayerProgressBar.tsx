/**
 * PlayerProgressBar - Custom progress bar for AudioPlayer
 *
 * Full-width, tappable, draggable. Visible white thumb; drag updates only local
 * state (thumb follows finger); seek runs once on release for responsive Android UX.
 */

import React, { useCallback, useRef, useState } from "react"
import { View, Pressable, StyleSheet, LayoutChangeEvent } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { runOnJS } from "react-native-reanimated"
import { formatTime } from "@/utils/format"
import { AppText } from "../AppText"

const TRACK_HEIGHT = 8
const TRACK_BG = "rgba(255,255,255,0.2)"
const FILL_BG = "#ffffff"
const THUMB_SIZE = 14
const THUMB_SIZE_DRAGGING = 18
const TOUCH_AREA_MIN_HEIGHT = 36

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
  const [trackWidth, setTrackWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragFraction, setDragFraction] = useState<number | null>(null)

  const isValidDuration = durationMs > 0
  const progressFromPlayback = isValidDuration
    ? Math.min(1, Math.max(0, positionMs / durationMs))
    : 0
  const displayProgress = dragFraction ?? progressFromPlayback

  const seekFromX = useCallback(
    (x: number) => {
      if (!isValidDuration || trackWidthRef.current <= 0) return
      const fraction = Math.min(1, Math.max(0, x / trackWidthRef.current))
      seekToPosition(fraction * durationMs)
    },
    [durationMs, isValidDuration, seekToPosition],
  )

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    trackWidthRef.current = w
    setTrackWidth(w)
  }, [])

  const onPress = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      seekFromX(e.nativeEvent.locationX)
    },
    [seekFromX],
  )

  const updateDragFraction = useCallback((x: number) => {
    const w = trackWidthRef.current
    if (w <= 0) return
    const fraction = Math.min(1, Math.max(0, x / w))
    setDragFraction(fraction)
  }, [])

  const seekFromDragEnd = useCallback(
    (x: number) => {
      const w = trackWidthRef.current
      if (isValidDuration && w > 0) {
        const fraction = Math.min(1, Math.max(0, x / w))
        seekToPosition(fraction * durationMs)
      }
    },
    [durationMs, isValidDuration, seekToPosition],
  )

  const clearDragState = useCallback(() => {
    setIsDragging(false)
    setDragFraction(null)
  }, [])

  const panGesture = Gesture.Pan()
    .onStart(() => {
      "worklet"
      runOnJS(setIsDragging)(true)
    })
    .onUpdate((e) => {
      "worklet"
      runOnJS(updateDragFraction)(e.x)
    })
    .onEnd((e) => {
      "worklet"
      runOnJS(seekFromDragEnd)(e.x)
    })
    .onFinalize(() => {
      "worklet"
      runOnJS(clearDragState)()
    })

  const thumbSize = isDragging ? THUMB_SIZE_DRAGGING : THUMB_SIZE
  const thumbLeft =
    trackWidth > 0
      ? Math.max(
          0,
          Math.min(
            trackWidth - thumbSize,
            displayProgress * trackWidth - thumbSize / 2,
          ),
        )
      : 0

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        <AppText
          font="instrument-medium"
          size="sm"
          style={styles.timeLeft}
          numberOfLines={1}
        >
          {isValidDuration ? formatTime(positionMs) : "0:00"}
        </AppText>
        <GestureDetector gesture={panGesture}>
          <Pressable
            onPress={onPress}
            style={styles.trackWrap}
            delayPressIn={0}
          >
            <View style={styles.touchArea} onLayout={onLayout}>
              <View style={[styles.track, { backgroundColor: TRACK_BG }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${displayProgress * 100}%`,
                      backgroundColor: FILL_BG,
                    },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.thumb,
                  {
                    width: thumbSize,
                    height: thumbSize,
                    borderRadius: thumbSize / 2,
                    left: thumbLeft,
                    top: (TRACK_HEIGHT - thumbSize) / 2,
                  },
                ]}
              />
            </View>
          </Pressable>
        </GestureDetector>
        <AppText
          font="instrument-medium"
          size="sm"
          style={styles.timeRight}
          numberOfLines={1}
        >
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
    flexWrap: "nowrap",
  },
  trackWrap: {
    flex: 1,
    minWidth: 0,
    minHeight: TOUCH_AREA_MIN_HEIGHT,
    justifyContent: "center",
  },
  touchArea: {
    position: "relative",
    width: "100%",
    height: TRACK_HEIGHT,
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
  thumb: {
    position: "absolute",
    backgroundColor: "#ffffff",
  },
  timeLeft: {
    minWidth: 48,
    flexShrink: 0,
    textAlign: "left",
    color: "rgba(255,255,255,0.9)",
    marginRight: 8,
  },
  timeRight: {
    minWidth: 48,
    flexShrink: 0,
    textAlign: "right",
    color: "rgba(255,255,255,0.9)",
    marginLeft: 8,
  },
})
