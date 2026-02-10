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
  isLoading?: boolean
  audioId?: string
  firebaseUrl?: string | null
  firebasePath?: string
  variant?: "default" | "layered"
  /** Show heart icon next to label (e.g. for day/chakra) */
  showHeart?: boolean
}

const CrystalBowlButton: React.FC<CrystalBowlButtonProps> = ({
  className = "",
  onPress,
  title,
  isLoading = false,
  audioId,
  firebaseUrl,
  firebasePath,
  variant = "default",
  showHeart = false,
}) => {
  const isLayered = variant === "layered"
  const label = title === "Crystal Bowl" ? "Crystal Bowl" : title

  const content = (
    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 24, paddingVertical: 8, paddingRight: 24 }}>
      <View
        style={{
          borderRadius: 9999,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderWidth: 1,
          borderColor: isLayered ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.82)",
          backgroundColor: isLayered ? "rgba(0,0,0,0.3)" : undefined,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
        )}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16, flex: 1, flexWrap: "wrap" }}>
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
    </Pressable>
  )
}

export default CrystalBowlButton
