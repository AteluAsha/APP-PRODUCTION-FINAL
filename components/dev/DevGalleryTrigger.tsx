/**
 * Dev Gallery Trigger - Hidden Triple-Tap Gesture (or Keyboard Shortcut on Web)
 *
 * A completely separate, removable component that opens DevGallery with triple-tap (mobile)
 * or Ctrl/Cmd + Shift + G keyboard shortcut (web - avoids browser conflict).
 *
 * To Remove:
 * 1. Delete DevGalleryTrigger.tsx
 * 2. Delete DevGallery.tsx
 * 3. Remove imports from app/_layout.tsx
 * 4. Done - zero impact on production code
 */

import React, { useState, useRef, useEffect } from "react"
import { View, Pressable, StyleSheet, Platform } from "react-native"
import { DevGallery } from "./DevGallery"
import { StorybookShell } from "./StorybookShell"

export const DevGalleryTrigger: React.FC = () => {
  const [showGallery, setShowGallery] = useState(false)
  const [showStorybook, setShowStorybook] = useState(false)
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Keyboard shortcut for web (Ctrl/Cmd + Shift + G for Storybook)
  useEffect(() => {
    if (Platform.OS === "web" && __DEV__) {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Ctrl/Cmd + Shift + G (Storybook) - avoids browser conflict with Cmd+Shift+D
        if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key === "G"
        ) {
          event.preventDefault()
          setShowStorybook(true)
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleTripleTap = () => {
    // Reset timer
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current)
    }

    tapCountRef.current += 1

    // Reset after 500ms if no more taps
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0
    }, 500)

    // Open gallery on triple tap
    if (tapCountRef.current === 3) {
      tapCountRef.current = 0
      setShowGallery(true)
    }
  }

  // EMERGENCY HALT: DISABLED - Live component rendering disabled
  // System restored to original state - no live injection
  return null

  // DISABLED CODE BELOW - DO NOT RENDER
  // All code below is disabled and commented out to prevent TypeScript errors
  /*
  if (!__DEV__) {
    return null
  }
  if (Platform.OS === 'web') {
    return (
      <View>
        <Pressable style={styles.webButton} onPress={() => setShowStorybook(true)}>
          <View style={styles.webButtonInner} />
        </Pressable>
        <StorybookShell visible={showStorybook} onClose={() => setShowStorybook(false)} />
      </View>
    )
  }
  return (
    <View>
      <Pressable style={styles.trigger} onPress={handleTripleTap} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
        <View style={styles.invisibleArea} />
      </Pressable>
      <DevGallery visible={showGallery} onClose={() => setShowGallery(false)} />
    </View>
  )
  */
}

const styles = StyleSheet.create({
  trigger: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    zIndex: 9999,
  },
  invisibleArea: {
    width: "100%",
    height: "100%",
    // Completely invisible - only for gesture detection
  },
  webButton: {
    position: "fixed",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    zIndex: 99999,
    borderRadius: 16,
    backgroundColor: "rgba(168, 201, 154, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  webButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(168, 201, 154, 0.6)",
  },
})
