/**
 * Crystal Bowl Button Component
 *
 * Displays a button for crystal bowl meditation audio.
 * variant="layered" gives a glossy, inset, beveled pill-shaped design.
 */

import React from "react"
import { Pressable, View, ActivityIndicator, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"

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
  const progressFraction =
    durationMs > 0 ? Math.min(1, Math.max(0, positionMs / durationMs)) : 0

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 24,
        paddingVertical: 8,
        paddingRight: rightContent ? 8 : 24,
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
      <View style={{ flexDirection: "column", marginLeft: 16, flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <AppText
            font="koh-santepheap"
            size="sm"
            numberOfLines={1}
            style={{ letterSpacing: 1, fontSize: 14, color: "#ffffff" }}
          >
            {isLoading ? "Preparing..." : label}
          </AppText>
          {showHeart && !isLoading && (
            <Ionicons
              name="heart"
              size={14}
              color="rgba(255,255,255,0.9)"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
        {subtitle && !isLoading && (
          <AppText
            font="instrument-regular"
            size="xs"
            style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}
          >
            {subtitle}
          </AppText>
        )}
      </View>
      {rightContent != null ? <View>{rightContent}</View> : null}
    </View>
  )

  if (isLayered) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={{
          paddingVertical: 16,
          width: 320,
          maxWidth: "92%",
          borderRadius: 9999,
          overflow: "hidden",
          ...(Platform.OS === "ios"
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 6,
              }
            : { elevation: 8 }),
        }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.4)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
            paddingVertical: 16,
          }}
        >
          {/* Glossy highlight strip - top edge */}
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
              borderTopLeftRadius: 9999,
              borderTopRightRadius: 9999,
            }}
            pointerEvents="none"
          />
          {content}
          {showProgress && (
            <View
              style={{
                marginTop: 10,
                marginHorizontal: 24,
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.2)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progressFraction * 100}%`,
                  height: "100%",
                  borderRadius: 2,
                  backgroundColor: "rgba(251,191,36,0.9)",
                }}
              />
            </View>
          )}
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <Pressable
      style={{
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.38)",
        borderRadius: 16,
        paddingVertical: 16,
        width: 320,
        maxWidth: "92%",
        backgroundColor: "rgba(0,0,0,0.125)",
      }}
      onPress={onPress}
      disabled={isLoading}
    >
      {content}
      {showProgress && (
        <View
          style={{
            marginTop: 10,
            marginHorizontal: 24,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progressFraction * 100}%`,
              height: "100%",
              borderRadius: 2,
              backgroundColor: "rgba(251,191,36,0.9)",
            }}
          />
        </View>
      )}
    </Pressable>
  )
}

export default CrystalBowlButton
