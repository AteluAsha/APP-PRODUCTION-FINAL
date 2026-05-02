/**
 * Capture All - One-Time Snapshot Generator
 *
 * Renders each screen and captures it as a high-resolution PNG.
 * This is a ONE-TIME capture utility - use it, then disable it.
 *
 * To Use:
 * 1. Temporarily enable this component in app/_layout.tsx (web only)
 * 2. It will automatically capture all 20 screens
 * 3. Saves PNGs to assets/dev-gallery/snapshots/
 * 4. Disable after capture is complete
 *
 * To Remove:
 * 1. Delete this file
 * 2. Remove from app/_layout.tsx
 * 3. Done - zero impact on production code
 */

import React, { useRef, useEffect, useState } from "react"
import { View, StyleSheet, Platform } from "react-native"
import { GALLERY_SCREENS } from "@/assets/dev-gallery/gallery-config"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { AppText } from "@/components/AppText"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface CaptureAllProps {
  onComplete?: () => void
}

export const CaptureAll: React.FC<CaptureAllProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const captureRef = useRef<View>(null)

  const currentScreen = GALLERY_SCREENS[currentIndex]

  useEffect(() => {
    if (Platform.OS !== "web" || !__DEV__) {
      return
    }

    // Web-based capture using html2canvas (browser API)
    const startCapture = async () => {
      setIsCapturing(true)

      // Load html2canvas dynamically (for web only)
      let html2canvas: any = null
      try {
        // @ts-ignore - html2canvas is a web-only library
        html2canvas = (await import("html2canvas")).default
      } catch (error) {
        console.error(
          "[CaptureAll] html2canvas not available. Install with: npm install html2canvas",
        )
        console.error(
          "[CaptureAll] For now, using manual capture instructions.",
        )
        setIsCapturing(false)
        return
      }

      // Capture all screens sequentially
      for (let i = 0; i < GALLERY_SCREENS.length; i++) {
        setCurrentIndex(i)

        // Wait for component to render
        await new Promise((resolve) => setTimeout(resolve, 1500))

        try {
          // Get the DOM element for the capture container
          const element = captureRef.current
          if (!element) {
            console.error(
              `❌ No element to capture for: ${GALLERY_SCREENS[i].label}`,
            )
            continue
          }

          // For React Native Web, we need to get the actual DOM node
          // @ts-ignore - accessing internal React Native Web node
          const domNode = element._nativeNode || element

          if (!domNode) {
            console.error(
              `❌ Could not find DOM node for: ${GALLERY_SCREENS[i].label}`,
            )
            continue
          }

          // Capture using html2canvas
          const canvas = await html2canvas(domNode, {
            width: 375,
            height: 812,
            scale: 2, // High resolution
            backgroundColor: "#000000",
            logging: false,
          })

          // Convert canvas to blob, then to file
          canvas.toBlob(async (blob: Blob) => {
            const fileName = GALLERY_SCREENS[i].expectedFileName
            const reader = new FileReader()

            reader.onloadend = async () => {
              try {
                // Convert blob to base64
                const base64 = reader.result as string
                const base64Data = base64.split(",")[1] // Remove data:image/png;base64, prefix

                // Save using FileSystem (for web, this will download)
                // Note: For web, we'll need to use a different approach
                // The file will be downloaded to user's Downloads folder
                const link = document.createElement("a")
                link.download = fileName
                link.href = base64
                link.click()

                console.log(
                  `✅ Captured ${i + 1}/${GALLERY_SCREENS.length}: ${fileName} (downloaded)`,
                )
              } catch (error) {
                console.error(`❌ Failed to save ${fileName}:`, error)
              }
            }

            reader.readAsDataURL(blob)
          }, "image/png")
        } catch (error) {
          console.error(
            `❌ Error capturing ${GALLERY_SCREENS[i].label}:`,
            error,
          )
        }
      }

      setIsCapturing(false)
      console.log(
        "✅ Capture complete! Check your Downloads folder for screenshots.",
      )
      console.log("📝 Next: Move screenshots to assets/dev-gallery/snapshots/")
      if (onComplete) {
        onComplete()
      }
    }

    // Start capture after a brief delay
    const timer = setTimeout(() => {
      startCapture()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const renderCurrentScreen = () => {
    // Render the current screen component for capture
    // This bypasses navigation context by rendering in isolation
    // Navigation errors are expected but won't affect visual capture
    try {
      if (currentScreen.type === "trial1" || currentScreen.type === "trial2") {
        const ChakraTemplate =
          require("@/components/chakras/ChakraTemplate").default
        // Wrap in ErrorBoundary to catch navigation errors (setOptions) without breaking capture
        // Navigation errors are expected but won't affect visual capture
        return (
          <ErrorBoundary>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <ChakraTemplate
                    chakra={currentScreen.props?.chakra || "root"}
                  />
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ErrorBoundary>
        )
      }

      if (currentScreen.type === "threshold") {
        if (currentScreen.id === "threshold-waiting") {
          const {
            WaitingScreen,
          } = require("@/components/chakras/WaitingScreen")
          return <WaitingScreen {...currentScreen.props} />
        }
        if (currentScreen.id === "threshold-goodbye") {
          const GoodbyeModal =
            require("@/components/chakras/GoodbyeModal").default
          return (
            <View style={{ flex: 1, backgroundColor: "#000" }}>
              <GoodbyeModal {...currentScreen.props} />
            </View>
          )
        }
        if (currentScreen.id === "threshold-commitment-gate") {
          const {
            CommitmentGate,
          } = require("@/components/chakras/CommitmentGate")
          return <CommitmentGate {...currentScreen.props} />
        }
      }

      if (currentScreen.type === "sanctuary") {
        if (currentScreen.id === "sanctuary-chakra-hub") {
          const ChakraHub = require("@/app/(chakras)/ChakraHub").default
          return (
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <ChakraHub />
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          )
        }
        if (currentScreen.id === "sanctuary-community") {
          const CommunityHalls = require("@/app/CommunityHalls").default
          return (
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <CommunityHalls />
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          )
        }
      }

      if (currentScreen.type === "entry") {
        const wrap = (C: React.ComponentType<any>) => (
          <ErrorBoundary>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <C {...currentScreen.props} />
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ErrorBoundary>
        )
        if (currentScreen.id === "entry-welcome") {
          const WelcomeScreen = require("@/app/(chakras)/WelcomeScreen").default
          return wrap(WelcomeScreen)
        }
        if (currentScreen.id === "entry-date-selection") {
          const DateSelection = require("@/app/(chakras)/DateSelection").default
          return wrap(DateSelection)
        }
        if (currentScreen.id === "entry-chakra-home") {
          const ChakraHome = require("@/app/(chakras)/ChakraHome").default
          return wrap(ChakraHome)
        }
      }

      if (currentScreen.type === "lifetime") {
        const wrap = (C: React.ComponentType<any>) => (
          <ErrorBoundary>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <C {...currentScreen.props} />
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ErrorBoundary>
        )
        if (currentScreen.id === "lifetime-audio-player") {
          const AudioPlayer = require("@/app/AudioPlayer").default
          return wrap(AudioPlayer)
        }
        if (currentScreen.id === "lifetime-audio-library") {
          const AudioLibrary = require("@/app/(chakras)/AudioLibrary").default
          return wrap(AudioLibrary)
        }
        if (currentScreen.id === "lifetime-sound-bath") {
          const SoundBath = require("@/app/(chakras)/SoundBath").default
          return wrap(SoundBath)
        }
        if (currentScreen.id === "lifetime-head-to-heart") {
          const HeadToHeart = require("@/app/(chakras)/HeadToHeart").default
          return wrap(HeadToHeart)
        }
        if (currentScreen.id === "lifetime-chakras101") {
          const Chakras101 = require("@/app/(chakras)/Chakras101").default
          return wrap(Chakras101)
        }
        if (currentScreen.id === "lifetime-energy-exchange") {
          const EnergyExchange =
            require("@/app/(chakras)/EnergyExchange").default
          return wrap(EnergyExchange)
        }
        if (currentScreen.id === "lifetime-gallery") {
          const GalleryOfGnosis =
            require("@/app/(chakras)/GalleryOfGnosis").default
          return wrap(GalleryOfGnosis)
        }
        if (currentScreen.id === "lifetime-notes") {
          const NotesAlongTheWay =
            require("@/app/(chakras)/NotesAlongTheWay").default
          return wrap(NotesAlongTheWay)
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return (
        <View style={styles.errorContainer}>
          <AppText
            font="instrument-medium"
            size="base"
            style={styles.errorText}
          >
            Error rendering: {errorMessage}
          </AppText>
        </View>
      )
    }

    return null
  }

  if (Platform.OS !== "web" || !__DEV__) {
    return null
  }

  return (
    <View style={styles.container}>
      <View
        ref={captureRef}
        style={styles.captureContainer}
        collapsable={false}
      >
        {renderCurrentScreen()}
      </View>

      {isCapturing && (
        <View style={styles.statusContainer}>
          <AppText
            font="instrument-medium"
            size="base"
            style={styles.statusText}
          >
            Capturing {currentIndex + 1} / {GALLERY_SCREENS.length}:{" "}
            {currentScreen.label}
          </AppText>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  captureContainer: {
    width: 375,
    height: 812,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  statusContainer: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 8,
  },
  statusText: {
    color: "#A8C99A",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
  },
})
