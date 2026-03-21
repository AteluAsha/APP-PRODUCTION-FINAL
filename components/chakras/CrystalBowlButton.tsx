/**
 * Crystal Bowl Button Component
 *
 * Displays a button for crystal bowl meditation audio.
 * variant="layered" gives a glossy, inset, beveled pill-shaped design.
 * When playing, shows time passed / total and a seekable progress bar with thumb (tap + drag).
 * Play/pause is only triggered by the main content row; progress bar touches do not trigger play/pause.
 */

import React, { useCallback, useRef, useState } from "react"
import {
  Pressable,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  LayoutChangeEvent,
  StyleSheet,
} from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { runOnJS } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { formatTime } from "@/utils/format"

const SLIDER_TRACK_HEIGHT = 8
const SLIDER_THUMB_SIZE = 14
const SLIDER_THUMB_DRAGGING = 18
const SLIDER_TOUCH_MIN_HEIGHT = 36

/** Android Sound Bath: flatter container than full pill; iOS keeps soft capsule */
const LAYERED_RADIUS_ANDROID = 28
const LAYERED_RADIUS_IOS = 9999

interface CrystalBowlButtonProps {
  className?: string
  onPress: () => void | Promise<void>
  title: string
  /** Hz value to display below title (e.g. "396 Hz") */
  subtitle?: string
  isLoading?: boolean
  audioId?: string
  firebaseUrl?: string | null
  firebasePath?: string
  variant?: "default" | "layered"
  /** Show heart icon next to label (e.g. for day/chakra) */
  showHeart?: boolean
  /** When true, show pause icon; otherwise play icon. Clearer UX than music note. */
  isPlaying?: boolean
  /** Optional content to render on the right (e.g. Drop In button) */
  rightContent?: React.ReactNode
  /** When playing, show progress slider. Position in ms. */
  positionMs?: number
  /** Duration in ms (e.g. metadata.durationMs). Required with positionMs to show slider. */
  durationMs?: number
  /** Called when user seeks (slider value change). */
  onSeek?: (positionMs: number) => void
}

const CrystalBowlButton: React.FC<CrystalBowlButtonProps> = ({
  className = "",
  onPress,
  title,
  subtitle,
  isLoading = false,
  audioId,
  firebaseUrl,
  firebasePath,
  variant = "default",
  showHeart = false,
  isPlaying = false,
  rightContent,
  positionMs = 0,
  durationMs = 0,
  onSeek,
}) => {
  const isLayered = variant === "layered"
  const label = title
  const showProgress =
    isPlaying && durationMs > 0 && positionMs >= 0
  const isValidDuration = durationMs > 0
  const progressFromPlayback = isValidDuration
    ? Math.min(1, Math.max(0, positionMs / durationMs))
    : 0
  const [trackWidth, setTrackWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragFraction, setDragFraction] = useState<number | null>(null)
  const progressTrackWidthRef = useRef(0)
  const displayProgress = dragFraction ?? progressFromPlayback

  const onSliderLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    progressTrackWidthRef.current = w
    setTrackWidth(w)
  }, [])

  const seekFromX = useCallback(
    (x: number) => {
      if (!isValidDuration || progressTrackWidthRef.current <= 0 || !onSeek) return
      const fraction = Math.min(1, Math.max(0, x / progressTrackWidthRef.current))
      onSeek(fraction * durationMs)
    },
    [durationMs, isValidDuration, onSeek],
  )

  const onSliderPress = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      seekFromX(e.nativeEvent.locationX)
    },
    [seekFromX],
  )

  const updateDragFraction = useCallback((x: number) => {
    const w = progressTrackWidthRef.current
    if (w <= 0) return
    setDragFraction(Math.min(1, Math.max(0, x / w)))
  }, [])

  const seekFromDragEnd = useCallback(
    (x: number) => {
      if (isValidDuration && progressTrackWidthRef.current > 0 && onSeek) {
        const fraction = Math.min(1, Math.max(0, x / progressTrackWidthRef.current))
        onSeek(fraction * durationMs)
      }
    },
    [durationMs, isValidDuration, onSeek],
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

  const layeredRadius =
    Platform.OS === "android" ? LAYERED_RADIUS_ANDROID : LAYERED_RADIUS_IOS
  const contentRowPadH = Platform.OS === "android" ? 20 : 24
  const titleLineHeight =
    Platform.OS === "android" ? 22 : undefined

  const thumbSize = isDragging ? SLIDER_THUMB_DRAGGING : SLIDER_THUMB_SIZE
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

  const progressBlock = showProgress && (
    <View style={styles.progressBlock}>
      <AppText
        font="instrument-regular"
        size="xs"
        style={styles.progressTime}
      >
        {formatTime(positionMs)} / {formatTime(durationMs)}
      </AppText>
      <GestureDetector gesture={panGesture}>
        <Pressable
          onLayout={onSliderLayout}
          onPress={onSliderPress}
          style={styles.sliderTouchArea}
        >
          <View style={styles.sliderTrackWrap}>
            <View style={[styles.sliderTrack, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <View
                style={[
                  styles.sliderFill,
                  {
                    width: `${displayProgress * 100}%`,
                    backgroundColor: "rgba(251,191,36,0.9)",
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.sliderThumb,
                {
                  width: thumbSize,
                  height: thumbSize,
                  borderRadius: thumbSize / 2,
                  left: thumbLeft,
                  top: (SLIDER_TRACK_HEIGHT - thumbSize) / 2,
                },
              ]}
            />
          </View>
        </Pressable>
      </GestureDetector>
    </View>
  )

  const labelBlock =
    showHeart && subtitle && !isLoading ? (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginLeft: 16,
          flex: 1,
          minWidth: 0,
        }}
      >
        <AppText
          font="koh-santepheap"
          size="sm"
          numberOfLines={1}
          style={{
            letterSpacing: 1,
            fontSize: 14,
            color: "#ffffff",
            flexShrink: 1,
            ...(titleLineHeight != null ? { lineHeight: titleLineHeight } : {}),
          }}
        >
          {label}
        </AppText>
        <Ionicons
          name="heart"
          size={14}
          color="rgba(255,255,255,0.9)"
          style={{ marginLeft: 8, marginRight: 6, flexShrink: 0 }}
        />
        <AppText
          font="instrument-regular"
          size="xs"
          numberOfLines={1}
          style={{
            color: "rgba(255,255,255,0.85)",
            flexShrink: 0,
            ...(Platform.OS === "android" ? { lineHeight: 18 } : {}),
          }}
        >
          {subtitle}
        </AppText>
      </View>
    ) : (
      <View style={{ flexDirection: "column", marginLeft: 16, flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: Platform.OS === "android" ? "nowrap" : "wrap",
          }}
        >
          <AppText
            font="koh-santepheap"
            size="sm"
            numberOfLines={1}
            style={{
              letterSpacing: 1,
              fontSize: 14,
              color: "#ffffff",
              flexShrink: 1,
              ...(titleLineHeight != null ? { lineHeight: titleLineHeight } : {}),
            }}
          >
            {isLoading ? "Preparing..." : label}
          </AppText>
          {showHeart && !isLoading && (
            <Ionicons
              name="heart"
              size={14}
              color="rgba(255,255,255,0.9)"
              style={{ marginLeft: 6, flexShrink: 0 }}
            />
          )}
        </View>
        {subtitle && !isLoading && !(showHeart && subtitle) && (
          <AppText
            font="instrument-regular"
            size="xs"
            style={{
              color: "rgba(255,255,255,0.8)",
              marginTop: Platform.OS === "android" ? 4 : 2,
              ...(Platform.OS === "android" ? { lineHeight: 18 } : {}),
            }}
          >
            {subtitle}
          </AppText>
        )}
      </View>
    )

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: contentRowPadH,
        paddingVertical: Platform.OS === "android" ? 10 : 8,
        paddingRight: rightContent ? 8 : contentRowPadH,
        flex: 1,
      }}
    >
      <View
        style={{
          borderRadius: 9999,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderWidth: 1,
          borderColor: isLayered
            ? "rgba(255,255,255,0.2)"
            : "rgba(255,255,255,0.82)",
          backgroundColor: isLayered ? "rgba(0,0,0,0.3)" : undefined,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color="#FFFFFF"
          />
        )}
      </View>
      {labelBlock}
      {rightContent != null ? <View>{rightContent}</View> : null}
    </View>
  )

  const layeredStyle = {
    paddingVertical: Platform.OS === "android" ? 14 : 16,
    width: Platform.OS === "android" ? ("100%" as const) : 360,
    maxWidth: Platform.OS === "android" ? ("100%" as const) : ("95%" as const),
    alignSelf: Platform.OS === "android" ? ("stretch" as const) : undefined,
    borderRadius: layeredRadius,
    overflow: "hidden" as const,
    ...(Platform.OS === "android" && isLayered ? { paddingHorizontal: 8 } : {}),
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 6,
        }
      : { elevation: 8 }),
  }

  const contentPressable = (
    <View style={{ flex: 1 }}>
      {Platform.OS === "android" ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={isLoading}
          activeOpacity={0.85}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ flex: 1 }}
        >
          {content}
        </TouchableOpacity>
      ) : (
        <Pressable onPress={onPress} disabled={isLoading} style={{ flex: 1 }}>
          {content}
        </Pressable>
      )}
      {progressBlock}
    </View>
  )

  if (isLayered) {
    return (
      <View style={layeredStyle}>
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.4)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flex: 1,
            borderRadius: layeredRadius,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
            paddingVertical: Platform.OS === "android" ? 14 : 16,
          }}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "35%",
              borderTopLeftRadius: layeredRadius,
              borderTopRightRadius: layeredRadius,
            }}
            pointerEvents="none"
          />
          {contentPressable}
        </LinearGradient>
      </View>
    )
  }

  const defaultStyle = {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
    borderRadius: Platform.OS === "android" ? 28 : 16,
    paddingVertical: 16,
    width: Platform.OS === "android" ? ("100%" as const) : 360,
    maxWidth: Platform.OS === "android" ? ("100%" as const) : ("95%" as const),
    alignSelf: Platform.OS === "android" ? ("stretch" as const) : undefined,
    backgroundColor: "rgba(0,0,0,0.125)",
  }

  return (
    <View style={defaultStyle}>
      {Platform.OS === "android" ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={isLoading}
          activeOpacity={0.85}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ flex: 1 }}
        >
          {content}
        </TouchableOpacity>
      ) : (
        <Pressable onPress={onPress} disabled={isLoading} style={{ flex: 1 }}>
          {content}
        </Pressable>
      )}
      {progressBlock}
    </View>
  )
}

const styles = StyleSheet.create({
  progressBlock: {
    marginTop: 10,
    marginHorizontal: Platform.OS === "android" ? 22 : 28,
  },
  progressTime: {
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  sliderTouchArea: {
    width: "100%",
    minHeight: SLIDER_TOUCH_MIN_HEIGHT,
    justifyContent: "center",
  },
  sliderTrackWrap: {
    position: "relative",
    width: "100%",
    height: SLIDER_TRACK_HEIGHT,
  },
  sliderTrack: {
    width: "100%",
    height: SLIDER_TRACK_HEIGHT,
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
  },
  sliderThumb: {
    position: "absolute",
    backgroundColor: "#ffffff",
  },
})

export default CrystalBowlButton
