import React, { useCallback, useRef } from "react"
import { Pressable, View } from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { formatTime } from "@/utils/format"

interface SoundBathButtonProps {
  className?: string // Additional Tailwind classes for styling
  onPress: () => void // Callback when the button is pressed
  title: string // Main title for the button
  subtitle: string // Subtitle for the button
  isLoading?: boolean // Show loading state
  error?: Error | null // When set, show "Unable to load" and disable
  /** When true, show pause icon; otherwise play. For tuning fork play/pause. */
  isPlaying?: boolean
  /** When playing, show progress; optional seek (e.g. restart). */
  positionMs?: number
  durationMs?: number
  onSeek?: (positionMs: number) => void
}

const SoundBathButton: React.FC<SoundBathButtonProps> = ({
  className = "",
  onPress,
  title,
  subtitle,
  isLoading = false,
  error = null,
  isPlaying = false,
  positionMs = 0,
  durationMs = 0,
  onSeek,
}) => {
  const hasError = !!error
  const disabled = isLoading || hasError
  const subtitleText = hasError
    ? "Unable to load. Check connection."
    : isLoading
      ? "Preparing..."
      : subtitle

  const showProgress = isPlaying && durationMs > 0 && positionMs >= 0
  const progressFraction =
    durationMs > 0 ? Math.min(1, Math.max(0, positionMs / durationMs)) : 0
  const progressTrackWidthRef = useRef(0)
  const handleProgressLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      progressTrackWidthRef.current = e.nativeEvent.layout.width
    },
    [],
  )
  const handleProgressPress = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      if (!onSeek || durationMs <= 0) return
      const w = progressTrackWidthRef.current
      if (w <= 0) return
      const x = Math.max(0, Math.min(e.nativeEvent.locationX, w))
      const ms = Math.floor((x / w) * durationMs)
      onSeek(ms)
    },
    [onSeek, durationMs],
  )

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.38)",
        borderRadius: 16,
        paddingVertical: 16,
        width: 288,
        backgroundColor: "rgba(0,0,0,0.125)",
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginLeft: 32,
          paddingVertical: 8,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.82)",
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={isPlaying ? 14 : 12}
            color="white"
            style={!isPlaying ? { marginLeft: 2 } : undefined}
          />
        </View>

        <View
          style={{
            flexDirection: "column",
            marginLeft: 16,
            flex: 1,
            maxWidth: "70%",
          }}
        >
          <AppText
            font="koh-santepheap"
            size="sm"
            numberOfLines={1}
            style={{
              marginBottom: 4,
              letterSpacing: 1,
              fontSize: 13,
              color: "#ffffff",
            }}
          >
            {title}
          </AppText>
          <AppText
            font="instrument-italic"
            size="xs"
            numberOfLines={1}
            style={{
              opacity: disabled ? 0.7 : 1,
              fontSize: 11,
              color: hasError ? "rgba(251,191,36,0.95)" : "#ffffff",
            }}
          >
            {subtitleText}
          </AppText>
        </View>
      </Pressable>

      {showProgress && (
        <View style={{ marginTop: 8, marginHorizontal: 24 }}>
          <AppText
            font="instrument-regular"
            size="xs"
            style={{ color: "rgba(255,255,255,0.85)", marginBottom: 4 }}
          >
            {formatTime(positionMs)} / {formatTime(durationMs)}
          </AppText>
          <Pressable
            onLayout={handleProgressLayout}
            onPress={handleProgressPress}
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.2)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progressFraction * 100}%`,
                height: "100%",
                borderRadius: 3,
                backgroundColor: "rgba(251,191,36,0.9)",
              }}
            />
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default SoundBathButton
