/**
 * Clarity Moment – entry modal for the waiting room
 *
 * Shown once when the user first enters the waiting room. Contains the
 * "For Deepest Embodiment" somatic copy; user taps "Present" to dismiss and enter.
 */

import React from "react"
import { Modal, View, Pressable, StyleSheet, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { MODAL_CARD_MAX_WIDTH } from "@/constants/layout"

interface ClarityMomentModalProps {
  visible: boolean
  onPresent: () => void
}

export function ClarityMomentModal({
  visible,
  onPresent,
}: ClarityMomentModalProps) {
  if (!visible) return null

  const handlePresent = () => {
    addHapticFeedback(HapticStrength.Medium)
    onPresent()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handlePresent}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <View
          style={[styles.card, Platform.OS === "android" && { elevation: 24, zIndex: 1 }]}
          pointerEvents="box-none"
          collapsable={false}
        >
          <LinearGradient
            colors={[
              "rgba(24, 28, 32, 0.99)",
              "rgba(18, 24, 28, 0.99)",
              "rgba(16, 26, 30, 0.99)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <AppText
              font="instrument-semibold"
              size="lg"
              style={styles.title}
            >
              Clarity Moment
            </AppText>

            <View style={styles.blueBox}>
              <View style={styles.blueBoxHeader}>
                <Ionicons
                  name="headset"
                  size={16}
                  color="rgba(6, 182, 212, 0.8)"
                  style={{ marginRight: 6 }}
                />
                <AppText
                  font="instrument-medium"
                  size="xs"
                  style={styles.blueBoxHeading}
                >
                  For Deepest Embodiment
                </AppText>
              </View>
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.blueBoxBody}
              >
                This course is designed for somatic gnosis that works best when
                you awaken 1 hour before your day and sit with your
                earphones and remove all distractions.
              </AppText>
            </View>

            <Pressable
              onPress={handlePresent}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <LinearGradient
                colors={["rgba(135, 174, 115, 0.35)", "rgba(6, 182, 212, 0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.presentButton}
              >
                <AppText
                  font="instrument-semibold"
                  size="sm"
                  style={styles.presentButtonText}
                >
                  Present
                </AppText>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: MODAL_CARD_MAX_WIDTH,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.3)",
    shadowColor: "rgba(6, 182, 212, 0.25)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    padding: 20,
  },
  title: {
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  blueBox: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.5)",
    shadowColor: "rgba(6, 182, 212, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    marginBottom: 20,
  },
  blueBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  blueBoxHeading: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  blueBoxBody: {
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
  presentButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    alignItems: "center",
  },
  presentButtonText: {
    color: "rgba(184, 212, 168, 0.95)",
  },
})
