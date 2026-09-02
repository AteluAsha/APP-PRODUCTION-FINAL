/**
 * PlayerProgressBar - Custom progress bar for AudioPlayer
 *
 * Full-width, tappable, draggable. Thumb follows the finger; seek runs on
 * release using window coordinates so Android does not snap back to 0:00.
 */

import React, { useCallback, useRef, useState } from "react"
import { View, StyleSheet, LayoutChangeEvent } from "react-native"
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
  const trackOriginXRef = useRef(0)
  const trackViewRef = useRef<View>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragFraction, setDragFraction] = useState<number | null>(null)

  const isValidDuration = durationMs > 0
  const progressFromPlayback = isValidDuration
    ? Math.min(1, Math.max(0, positionMs / durationMs))
    : 0
  const displayProgress = dragFraction ?? progressFromPlayback
  const displayMs =
    dragFraction != null && isValidDuration
      ? dragFraction * durationMs
      : positionMs

  const measureTrack = useCallback(() => {
    trackViewRef.current?.measureInWindow((x, _y, width) => {
      if (width > 0) {
        trackOriginXRef.current = x
        trackWidthRef.current = width
        setTrackWidth(width)
      }
    })
  }, [])

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width
      trackWidthRef.current = w
      setTrackWidth(w)
      measureTrack()
    },
    [measureTrack],
  )

  const fractionFromAbsoluteX = useCallback((absoluteX: number) => {
    const w = trackWidthRef.current
    if (w <= 0) return 0
    return Math.min(1, Math.max(0, (absoluteX - trackOriginXRef.current) / w))
  }, [])

  const updateDragFromAbsoluteX = useCallback(
    (absoluteX: number) => {
      setDragFraction(fractionFromAbsoluteX(absoluteX))
    },
    [fractionFromAbsoluteX],
  )

  const seekFromAbsoluteX = useCallback(
    (absoluteX: number) => {
      if (!isValidDuration || trackWidthRef.current <= 0) {
        setIsDragging(false)
        return
      }
      const fraction = fractionFromAbsoluteX(absoluteX)
      setDragFraction(fraction)
      void seekToPosition(fraction * durationMs).finally(() => {
        setTimeout(() => {
          setIsDragging(false)
          setDragFraction(null)
        }, 180)
      })
    },
    [durationMs, fractionFromAbsoluteX, isValidDuration, seekToPosition],
  )

  const panGesture = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .failOffsetY([-28, 28])
    .onStart((e) => {
      "worklet"
      runOnJS(setIsDragging)(true)
      runOnJS(updateDragFromAbsoluteX)(e.absoluteX)
    })
    .onUpdate((e) => {
      "worklet"
      runOnJS(updateDragFromAbsoluteX)(e.absoluteX)
    })
    .onEnd((e) => {
      "worklet"
      runOnJS(seekFromAbsoluteX)(e.absoluteX)
    })

  const tapGesture = Gesture.Tap().onEnd((e) => {
    "worklet"
    runOnJS(seekFromAbsoluteX)(e.absoluteX)
  })

  const composed = Gesture.Exclusive(panGesture, tapGesture)

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
          {isValidDuration ? formatTime(displayMs) : "0:00"}
        </AppText>
        <GestureDetector gesture={composed}>
          <View style={styles.trackWrap} collapsable={false}>
            <View
              ref={trackViewRef}
              style={styles.touchArea}
              onLayout={onLayout}
            >
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
          </View>
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
