/**
 * Return to course modal (lifetime + existing trial)
 *
 * When a lifetime user with a course already scheduled taps "Start a new 7 Day Journey",
 * this modal offers: Continue current course | Start a new one.
 * Button styling matches DateConfirmationModal (green gradient, fallback bg, border).
 */

import React from "react"
import { Modal, View, Pressable, StyleSheet, useWindowDimensions } from "react-native"
import { AppText } from "@/components/AppText"
import { LinearGradient } from "expo-linear-gradient"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

interface ReturnToCourseModalProps {
  visible: boolean
  onClose: () => void
  onContinueCurrent: () => void
  onStartNew: () => void
}

const buttonBorder = "rgba(135, 174, 115, 0.7)"
const buttonFallbackBg = "rgba(135, 174, 115, 0.35)"
const buttonGradientColors = [
  "rgba(168, 201, 154, 0.5)",
  "rgba(135, 174, 115, 0.35)",
  "rgba(100, 130, 90, 0.2)",
] as const

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 340,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    backgroundColor: "rgba(20, 20, 20, 0.98)",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: buttonBorder,
    backgroundColor: buttonFallbackBg,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
    overflow: "hidden",
  },
  buttonSecondary: {
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  buttonLabel: {
    color: "#ffffff",
    textAlign: "center",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
})

export const ReturnToCourseModal: React.FC<ReturnToCourseModalProps> = ({
  visible,
  onClose,
  onContinueCurrent,
  onStartNew,
}) => {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = Math.min(screenWidth - 48, 320)

  const handleContinueCurrent = () => {
    addHapticFeedback(HapticStrength.Medium)
    onClose()
    onContinueCurrent()
  }

  const handleStartNew = () => {
    addHapticFeedback(HapticStrength.Medium)
    onClose()
    onStartNew()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { width: cardWidth }]}>
          <AppText font="instrument-bold" size="lg" style={styles.title}>
            Start a new 7 Day Somatic Journey
          </AppText>
          <AppText font="instrument-regular" size="base" style={styles.body}>
            You have a 7-day journey in progress. Continue it or start a new one?
          </AppText>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleContinueCurrent}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={styles.button}>
                <LinearGradient
                  colors={[...buttonGradientColors]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.gradient}
                />
                <AppText
                  font="instrument-semibold"
                  size="base"
                  style={styles.buttonLabel}
                >
                  Continue current course
                </AppText>
              </View>
            </Pressable>
            <Pressable
              onPress={handleStartNew}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.button, styles.buttonSecondary]}>
                <AppText
                  font="instrument-medium"
                  size="base"
                  style={styles.buttonLabel}
                >
                  Start a new one
                </AppText>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
