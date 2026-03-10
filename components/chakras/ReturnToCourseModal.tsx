/**
 * Somatic Journey modal (lifetime only)
 *
 * Shown when a lifetime user taps "Start a new 7 Day Journey" and a course is
 * already scheduled (courseStartDate set). Offers:
 * - Continue current course → ChakraHome
 * - Start a new one → clear course, DateSelection
 *
 * When no course is active, ChakraHub does not show this modal; it goes
 * straight to DateSelection (single "Start new course" path).
 */

import React from "react"
import {
  Modal,
  View,
  Pressable,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { TOUCH } from "@/constants/layout"

interface ReturnToCourseModalProps {
  visible: boolean
  onClose: () => void
  onContinueCurrent: () => void
  onStartNew: () => void
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },
  safeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: "rgba(18, 18, 18, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.25)",
    alignItems: "center",
  },
  title: {
    color: "rgba(255, 255, 255, 0.98)",
    textAlign: "center",
    marginBottom: 10,
  },
  body: {
    color: "rgba(255, 255, 255, 0.72)",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  buttonColumn: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "rgba(168, 201, 154, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 52,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 52,
  },
  primaryLabel: {
    color: "rgba(255, 255, 255, 0.98)",
  },
  secondaryLabel: {
    color: "rgba(255, 255, 255, 0.82)",
  },
})

export const ReturnToCourseModal: React.FC<ReturnToCourseModalProps> = ({
  visible,
  onClose,
  onContinueCurrent,
  onStartNew,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  const overlayStyle =
    Platform.OS === "android"
      ? [styles.overlay, { width: screenWidth, height: screenHeight }]
      : styles.overlay

  const handleContinue = () => {
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
      <Pressable
        style={overlayStyle}
        onPress={onClose}
        accessible={false}
      >
        <SafeAreaView
          style={styles.safeContent}
          edges={["top", "left", "right", "bottom"]}
        >
          <Pressable
            style={styles.card}
            onPress={(e) => e.stopPropagation()}
            accessibilityRole="none"
          >
            <AppText font="instrument-bold" size="lg" style={styles.title}>
              You have a journey in progress
            </AppText>
            <AppText font="instrument-regular" size="base" style={styles.body}>
              Continue your current 7-day course or clear it and choose a new start date.
            </AppText>

            <View style={styles.buttonColumn}>
              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { opacity: 0.88 },
                ]}
                hitSlop={TOUCH.hitSlop}
                accessibilityLabel="Continue current course"
                accessibilityRole="button"
              >
                <AppText
                  font="instrument-semibold"
                  size="base"
                  style={styles.primaryLabel}
                >
                  Continue current course
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleStartNew}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { opacity: 0.88 },
                ]}
                hitSlop={TOUCH.hitSlop}
                accessibilityLabel="Start a new one"
                accessibilityHint="Clears current course and opens date picker"
                accessibilityRole="button"
              >
                <AppText
                  font="instrument-medium"
                  size="base"
                  style={styles.secondaryLabel}
                >
                  Start a new one
                </AppText>
              </Pressable>
            </View>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  )
}
