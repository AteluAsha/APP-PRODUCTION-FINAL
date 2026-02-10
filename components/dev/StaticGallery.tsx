/**
 * Static Gallery - Simple Image Viewer
 *
 * A dead-simple static gallery showing all 20 screens as images.
 * No logic, no functions, no interactivity - just static images in an iPhone frame.
 *
 * To Remove:
 * 1. Delete this file
 * 2. Remove from app/_layout.tsx or entry point
 * 3. Done - zero impact on production code
 */

import React, { useState, useEffect } from "react"
import { View, StyleSheet, Image, Pressable, Platform } from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { GALLERY_SCREENS } from "@/assets/dev-gallery/gallery-config"

// Helper to get image URI for web (Metro doesn't support dynamic require)
// For web, we'll use a public path to the snapshots directory
function getImageUri(fileName: string): string | null {
  // On web, images in assets/dev-gallery/snapshots/ will be accessible via public path
  // This avoids Metro's dynamic require restriction
  if (Platform.OS === "web") {
    // Use public path - screenshots will be accessible at /assets/dev-gallery/snapshots/
    return `/assets/dev-gallery/snapshots/${fileName}`
  }
  // For native, would need static require mapping (not needed for web capture)
  return null
}

interface StaticGalleryProps {
  visible?: boolean
}

export const StaticGallery: React.FC<StaticGalleryProps> = ({
  visible = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentScreen = GALLERY_SCREENS[currentIndex]

  if (!visible || Platform.OS !== "web") {
    return null
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : GALLERY_SCREENS.length - 1,
    )
  }

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < GALLERY_SCREENS.length - 1 ? prev + 1 : 0,
    )
  }

  // Get image URI (static path - no dynamic require)
  const imageUri = getImageUri(currentScreen.expectedFileName)

  // Check if image exists (for web, test loading the URI)
  const [imageExists, setImageExists] = useState(false)

  useEffect(() => {
    if (Platform.OS === "web" && imageUri && typeof window !== "undefined") {
      // Test if image exists by attempting to load it
      const img = new (window as any).Image() as HTMLImageElement
      img.onload = () => setImageExists(true)
      img.onerror = () => setImageExists(false)
      img.src = imageUri
    } else {
      setImageExists(false)
    }
  }, [currentIndex, imageUri])

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentIndex + 1) / GALLERY_SCREENS.length) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Screen Label */}
      <View style={styles.labelContainer}>
        <AppText font="instrument-regular" size="sm" style={styles.labelText}>
          {currentIndex + 1} / {GALLERY_SCREENS.length}: {currentScreen.label}
        </AppText>
      </View>

      {/* iPhone Frame */}
      <View style={styles.phoneFrame}>
        <View style={styles.phoneContent}>
          {/* Try to show screenshot, fallback to placeholder */}
          {imageExists && imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.screenshotImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imageContainer}>
              <AppText
                font="instrument-medium"
                size="base"
                style={styles.placeholderText}
              >
                {currentScreen.label}
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={styles.placeholderSubtext}
              >
                Screenshot: {currentScreen.expectedFileName}
              </AppText>
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.placeholderHint}
              >
                (Placeholder - add screenshots to assets/dev-gallery/snapshots/)
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* Navigation Arrows */}
      <Pressable style={styles.navArrowLeft} onPress={handlePrevious}>
        <Ionicons name="chevron-back" size={32} color="#A8C99A" />
      </Pressable>

      <Pressable style={styles.navArrowRight} onPress={handleNext}>
        <Ionicons name="chevron-forward" size={32} color="#A8C99A" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    width: 375,
    height: 2,
    backgroundColor: "rgba(168, 201, 154, 0.2)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#A8C99A",
    borderRadius: 1,
  },
  labelContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    width: 375,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 10,
  },
  labelText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  phoneFrame: {
    width: 375,
    height: 812,
    borderWidth: 1,
    borderColor: "#A8C99A",
    borderStyle: "solid",
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    marginTop: 40,
  },
  phoneContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  screenshotImage: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  placeholderText: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  placeholderSubtext: {
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: 5,
  },
  placeholderHint: {
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  navArrowLeft: {
    position: "absolute",
    left: 40,
    top: "50%",
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  navArrowRight: {
    position: "absolute",
    right: 40,
    top: "50%",
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
})
