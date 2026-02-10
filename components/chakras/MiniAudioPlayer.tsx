/**
 * @deprecated Replaced by MenuBarMiniPlayer (above Music icon in PermanentMenuBar).
 * Music Room now uses inline play/pause; mini bar shows when leaving Music Room.
 * Kept for reference only.
 */

import React from "react"
import { View, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export const MiniAudioPlayer = () => {
  const router = useRouter()
  const source = useCurrentAudioStore((state) => state.source)
  const metadata = useCurrentAudioStore((state) => state.metadata)
  const prefs = useCurrentAudioStore((state) => state.prefs)
  const reset = useCurrentAudioStore((state) => state.reset)

  const shouldShow = source && metadata && prefs && !prefs.isIntroAudio

  const openFullPlayer = () => {
    addHapticFeedback(HapticStrength.Light)
    router.push("/AudioPlayer")
  }

  const goToMusicRoom = () => {
    addHapticFeedback(HapticStrength.Light)
    reset()
    router.push("/(chakras)/AudioLibrary")
  }

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    reset()
  }

  if (!shouldShow || !metadata) {
    return null
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: 96,
        left: 16,
        right: 16,
        zIndex: 40,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Pressable
        onPress={openFullPlayer}
        className="mr-3 p-1.5 rounded-full active:opacity-70"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        accessibilityLabel="Open audio player"
      >
        <Ionicons name="play" size={18} color="#fff" />
      </Pressable>

      <Pressable
        onPress={openFullPlayer}
        className="flex-1 mr-2 active:opacity-70"
        accessibilityLabel="Open audio player"
      >
        <AppText
          font="instrument-medium"
          size="xs"
          className="text-white"
          numberOfLines={1}
        >
          {metadata.title}
        </AppText>
      </Pressable>

      <Pressable
        onPress={goToMusicRoom}
        className="p-2 mx-1 active:opacity-70"
        accessibilityLabel="Go to Music Room"
      >
        <Ionicons
          name="musical-notes"
          size={18}
          color="rgba(255,255,255,0.8)"
        />
      </Pressable>

      <Pressable
        onPress={handleClose}
        className="p-2 active:opacity-70"
        accessibilityLabel="Close and stop audio"
      >
        <Ionicons name="close" size={20} color="rgba(255,255,255,0.9)" />
      </Pressable>
    </View>
  )
}
