/**
 * Dev Gallery - Modular Development Screen Navigator
 *
 * A completely separate, removable development tool for testing all app screens.
 *
 * Usage:
 * - Triple-tap the screen to open (hidden gesture)
 * - Navigate to any screen group for testing
 * - Completely isolated from core flow
 *
 * To Remove:
 * 1. Delete this file
 * 2. Remove import from app/_layout.tsx
 * 3. Done - zero impact on production code
 *
 * Structure:
 * - Trial 1 Gallery: All 7 chakra day screens
 * - Trial 2 Gallery: All 7 chakra day screens
 * - Thresholds: Splash, Welcome, Waiting, Goodbye, CommitmentGate
 * - Post-paywall: ChakraHub, CommunityHalls
 */

import React, { useState } from "react"
import { View, Modal, Pressable, ScrollView, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { Chakra } from "@/types/chakras/Chakra"
import { getCurrentWeekStartDateISO } from "@/utils/date"
import { onJourneyWeekStarted } from "@/src/services/journeyNotifications"

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

// Map Chakra enum to route strings (matches [chakra].tsx dynamic route)
const CHAKRA_TO_ROUTE: Record<Chakra, string> = {
  [Chakra.ROOT]: "root",
  [Chakra.SACRAL]: "sacral",
  [Chakra.SOLAR_PLEXUS]: "solar-plexus",
  [Chakra.HEART]: "heart",
  [Chakra.THROAT]: "throat",
  [Chakra.THIRD_EYE]: "third-eye",
  [Chakra.CROWN]: "crown",
}

interface DevGalleryProps {
  visible: boolean
  onClose: () => void
}

export const DevGallery: React.FC<DevGalleryProps> = ({ visible, onClose }) => {
  const router = useRouter()
  const { grantLifetimeAccess, resetJourney } = useChakraJourneyStore()

  const handleNavigateToChakra = (chakra: Chakra, trialNumber: 1 | 2) => {
    addHapticFeedback(HapticStrength.Light)
    const store = useChakraJourneyStore.getState()

    // Set trial context
    resetJourney()
    // Set completed trial courses (0 for Trial 1, 1 for Trial 2)
    useChakraJourneyStore.setState({
      completedTrialCourses: trialNumber === 1 ? 0 : 1,
    })

    // Navigate to chakra screen
    const route = CHAKRA_TO_ROUTE[chakra]
    router.push(`/(chakras)/${route}`)
    onClose()
  }

  const handleNavigateToThreshold = (route: string) => {
    addHapticFeedback(HapticStrength.Light)
    const store = useChakraJourneyStore.getState()

    if (route === "welcome") {
      // Reset to show welcome (first launch state)
      resetJourney()
      router.replace("/(chakras)")
    } else if (route === "waiting") {
      // Set journey started but before Monday (waiting room state)
      resetJourney()
      const weekStartDate = getCurrentWeekStartDateISO()
      store.startJourney(weekStartDate)
      void onJourneyWeekStarted()
      router.replace("/(chakras)")
    } else if (route === "goodbye") {
      // Navigate to a chakra day - user completes it to see goodbye modal
      router.push(`/(chakras)/${CHAKRA_TO_ROUTE[Chakra.ROOT]}`)
    } else if (route === "commitment-gate") {
      // Set to post-trial state (paywall)
      resetJourney()
      useChakraJourneyStore.setState({ completedTrialCourses: 2 })
      router.replace("/(chakras)")
    }
    onClose()
  }

  const handleNavigateToPostPaywall = (route: string) => {
    addHapticFeedback(HapticStrength.Light)
    // Grant lifetime access for post-paywall screens
    grantLifetimeAccess("paid")
    if (route === "chakra-hub") {
      router.push("/(chakras)/ChakraHub")
    } else if (route === "community") {
      router.push("/CommunityHalls")
    }
    onClose()
  }

  const renderSection = (
    title: string,
    items: { label: string; onPress: () => void }[],
  ) => (
    <View style={styles.section}>
      <AppText font="instrument-bold" size="lg" style={styles.sectionTitle}>
        {title}
      </AppText>
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.itemButton,
            pressed && styles.itemButtonPressed,
          ]}
        >
          <AppText font="instrument-medium" size="base" style={styles.itemText}>
            {item.label}
          </AppText>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.5)"
          />
        </Pressable>
      ))}
    </View>
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* Outer container - full screen overlay */}
      <View style={styles.modalOverlay}>
        {/* Physical Container - Mobile Shell Frame (375x812px, centered) */}
        <View style={styles.phoneContainer}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <AppText font="instrument-bold" size="2xl" style={styles.title}>
                Dev Gallery
              </AppText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Trial 1 Gallery */}
              {renderSection(
                "Trial 1: Chakra Days",
                CHAKRAS.map((chakra, index) => ({
                  label: `${index + 1}. ${CHAKRA_NAMES[index]} Chakra`,
                  onPress: () => handleNavigateToChakra(chakra, 1),
                })),
              )}

              {/* Trial 2 Gallery */}
              {renderSection(
                "Trial 2: Chakra Days",
                CHAKRAS.map((chakra, index) => ({
                  label: `${index + 1}. ${CHAKRA_NAMES[index]} Chakra`,
                  onPress: () => handleNavigateToChakra(chakra, 2),
                })),
              )}

              {/* Thresholds */}
              {renderSection("Thresholds & Gates", [
                {
                  label: "Welcome Modal",
                  onPress: () => handleNavigateToThreshold("welcome"),
                },
                {
                  label: "Waiting Room",
                  onPress: () => handleNavigateToThreshold("waiting"),
                },
                {
                  label: "Goodbye Modal",
                  onPress: () => handleNavigateToThreshold("goodbye"),
                },
                {
                  label: "Commitment Gate (Paywall)",
                  onPress: () => handleNavigateToThreshold("commitment-gate"),
                },
              ])}

              {/* Post-Paywall */}
              {renderSection("Post-Paywall", [
                {
                  label: "ChakraHub (Home)",
                  onPress: () => handleNavigateToPostPaywall("chakra-hub"),
                },
                {
                  label: "Community Halls",
                  onPress: () => handleNavigateToPostPaywall("community"),
                },
              ])}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  phoneContainer: {
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
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  title: {
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#A8C99A",
    marginBottom: 15,
  },
  itemButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  itemButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  itemText: {
    color: "#fff",
  },
})
