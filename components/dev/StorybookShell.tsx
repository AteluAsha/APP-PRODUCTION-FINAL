/**
 * Storybook Shell - Sequential Flow Gallery
 *
 * A minimalist visual audit environment with index-based navigation.
 * Provides Previous/Next arrow controls to cycle through all screens sequentially.
 *
 * To Remove:
 * 1. Delete this file
 * 2. Remove import from DevGalleryTrigger.tsx
 * 3. Done - zero impact on production code
 *
 * Design:
 * - Floating navigation arrows (mid-left, mid-right)
 * - No sidebar - pure mobile frame focus
 * - Simple index-based state management
 * - Sequential flow through all screens
 */

import React, { useState, useEffect } from "react"
import { View, StyleSheet, Pressable, Platform, Modal } from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { Chakra } from "@/types/chakras/Chakra"
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Screen definition type
interface ScreenDef {
  id: string
  label: string
  type: "trial1" | "trial2" | "threshold" | "sanctuary"
  chakra?: Chakra
  thresholdName?: "welcome" | "waiting" | "goodbye" | "commitment-gate"
  sanctuaryName?: "chakra-hub" | "community"
}

const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
]
const CHAKRAS = [
  Chakra.ROOT,
  Chakra.SACRAL,
  Chakra.SOLAR_PLEXUS,
  Chakra.HEART,
  Chakra.THROAT,
  Chakra.THIRD_EYE,
  Chakra.CROWN,
]

// Build flat array of all screens in sequential order
const buildScreenList = (): ScreenDef[] => {
  const screens: ScreenDef[] = []

  // Trial 1: All 7 chakras
  CHAKRAS.forEach((chakra, index) => {
    screens.push({
      id: `trial1-${index}`,
      label: `Trial 1: ${CHAKRA_NAMES[index]} Chakra`,
      type: "trial1",
      chakra,
    })
  })

  // Trial 2: All 7 chakras
  CHAKRAS.forEach((chakra, index) => {
    screens.push({
      id: `trial2-${index}`,
      label: `Trial 2: ${CHAKRA_NAMES[index]} Chakra`,
      type: "trial2",
      chakra,
    })
  })

  // Thresholds
  screens.push(
    {
      id: "threshold-welcome",
      label: "Welcome Modal",
      type: "threshold",
      thresholdName: "welcome",
    },
    {
      id: "threshold-waiting",
      label: "Waiting Room",
      type: "threshold",
      thresholdName: "waiting",
    },
    {
      id: "threshold-goodbye",
      label: "Goodbye Modal",
      type: "threshold",
      thresholdName: "goodbye",
    },
    {
      id: "threshold-commitment",
      label: "Commitment Gate",
      type: "threshold",
      thresholdName: "commitment-gate",
    },
  )

  // Sanctuary
  screens.push(
    {
      id: "sanctuary-chakra-hub",
      label: "ChakraHub",
      type: "sanctuary",
      sanctuaryName: "chakra-hub",
    },
    {
      id: "sanctuary-community",
      label: "Community Halls",
      type: "sanctuary",
      sanctuaryName: "community",
    },
  )

  return screens
}

const ALL_SCREENS = buildScreenList()

interface StorybookShellProps {
  visible: boolean
  onClose: () => void
}

export const StorybookShell: React.FC<StorybookShellProps> = ({
  visible,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const currentScreen = ALL_SCREENS[activeIndex]

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    if (!visible || Platform.OS !== "web") return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        handlePrevious()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        handleNext()
      } else if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [visible, activeIndex])

  const handlePrevious = () => {
    addHapticFeedback(HapticStrength.Light)
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : ALL_SCREENS.length - 1))
  }

  const handleNext = () => {
    addHapticFeedback(HapticStrength.Light)
    setActiveIndex((prev) => (prev < ALL_SCREENS.length - 1 ? prev + 1 : 0))
  }

  const renderScreen = () => {
    if (!currentScreen) {
      return (
        <View style={styles.placeholderContainer}>
          <AppText
            font="instrument-medium"
            size="lg"
            style={styles.placeholderText}
          >
            No screen available
          </AppText>
        </View>
      )
    }

    // Safe Room: Wrap components in navigation context
    const SafeRoomWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="storybook-preview" />
            </Stack>
            {children}
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    )

    // Direct component injection - bypasses all auth/timers
    try {
      if (currentScreen.type === "trial1" || currentScreen.type === "trial2") {
        if (!currentScreen.chakra) return null
        const ChakraTemplate =
          require("@/components/chakras/ChakraTemplate").default
        return (
          <SafeRoomWrapper>
            <ChakraTemplate chakra={currentScreen.chakra} />
          </SafeRoomWrapper>
        )
      }

      if (currentScreen.type === "threshold") {
        if (currentScreen.thresholdName === "welcome") {
          const { WelcomeModal } = require("@/components/chakras/WelcomeModal")
          const { getCurrentDayOfWeek } = require("@/utils/date")
          return (
            <View style={styles.modalWrapper}>
              <WelcomeModal
                isVisible={true}
                onClose={() => {}}
                onBeginJourney={() => {}}
                currentDayOfWeek={getCurrentDayOfWeek()}
              />
            </View>
          )
        }
        if (currentScreen.thresholdName === "waiting") {
          const {
            WaitingScreen,
          } = require("@/components/chakras/WaitingScreen")
          return <WaitingScreen onPreviewPress={() => {}} />
        }
        if (currentScreen.thresholdName === "goodbye") {
          const GoodbyeModal =
            require("@/components/chakras/GoodbyeModal").default
          return (
            <View style={styles.modalWrapper}>
              <GoodbyeModal visible={true} onClose={() => {}} chakraDay={0} />
            </View>
          )
        }
        if (currentScreen.thresholdName === "commitment-gate") {
          const {
            CommitmentGate,
          } = require("@/components/chakras/CommitmentGate")
          return <CommitmentGate onComplete={() => {}} />
        }
      }

      if (currentScreen.type === "sanctuary") {
        if (currentScreen.sanctuaryName === "chakra-hub") {
          const ChakraHub = require("@/app/(chakras)/ChakraHub").default
          return (
            <SafeRoomWrapper>
              <ChakraHub />
            </SafeRoomWrapper>
          )
        }
        if (currentScreen.sanctuaryName === "community") {
          const CommunityHalls = require("@/app/CommunityHalls").default
          return (
            <SafeRoomWrapper>
              <CommunityHalls />
            </SafeRoomWrapper>
          )
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error("[StorybookShell] Error rendering screen:", error)
      }
      return (
        <View style={styles.errorContainer}>
          <AppText
            font="instrument-medium"
            size="base"
            style={styles.errorText}
          >
            Error loading screen
          </AppText>
        </View>
      )
    }

    return null
  }

  // EMERGENCY HALT: DISABLED - Live component rendering disabled
  // System restored to original state - no live injection
  // Preparing for static visual gallery approach
  return null

  // DISABLED CODE BELOW - DO NOT RENDER
  // All code below is disabled and commented out to prevent TypeScript errors
  /*
  if (!__DEV__) {
    return null
  }
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.frameContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((activeIndex + 1) / ALL_SCREENS.length) * 100}%` }]} />
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
          <View style={styles.labelContainer}>
            <AppText font="instrument-regular" size="sm" style={styles.labelText}>
              {activeIndex + 1} / {ALL_SCREENS.length}: {currentScreen?.label}
            </AppText>
          </View>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneContent}>
              {renderScreen()}
            </View>
          </View>
          <Pressable style={styles.navArrowLeft} onPress={handlePrevious}>
            <Ionicons name="chevron-back" size={32} color="#A8C99A" />
          </Pressable>
          <Pressable style={styles.navArrowRight} onPress={handleNext}>
            <Ionicons name="chevron-forward" size={32} color="#A8C99A" />
          </Pressable>
        </View>
      </View>
    </Modal>
  )
  */
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  frameContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  closeButton: {
    position: "absolute",
    top: 15,
    right: "50%",
    marginRight: -200,
    padding: 8,
    zIndex: 10,
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
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.5)",
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
  modalWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
})
