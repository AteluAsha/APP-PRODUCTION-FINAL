/**
 * Somatic Journey modal (lifetime only)
 *
 * Shown when a lifetime user in course mode taps "Return or new session" on ChakraHub. Offers:
 * - Return to course → ChakraHome (stay in course mode)
 * - New session → clear course, DateSelection (pick new start date)
 *
 * When not in course mode, ChakraHub shows "Begin Course Mode" and goes to DateSelection.
 *
 * Rebuilt so the card is always centered on-screen (iOS + Android): uses
 * Dimensions.get("window") for overlay size, View root with flex center, and
 * backdrop + card (no SafeAreaView wrapper that could push content off-screen).
 * statusBarTranslucent is set only on Android for correct modal presentation.
 */

import React from "react"
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { TOUCH } from "@/constants/layout"

interface ReturnToCourseModalProps {
  visible: boolean
  onClose: () => void
  onContinueCurrent: () => void
  onStartNew: () => void
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window")
const CARD_MAX_WIDTH = Math.min(WINDOW_WIDTH - 48, 320)

const styles = StyleSheet.create({
  overlay: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_MAX_WIDTH,
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
      statusBarTranslucent={Platform.OS === "android"}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <View style={styles.card} pointerEvents="box-none">
          <AppText font="instrument-bold" size="lg" style={styles.title}>
            Return or new session
          </AppText>
          <AppText font="instrument-regular" size="base" style={styles.body}>
            Return to your current 7-day course or start a new session with a
            different start date.
          </AppText>

          <View style={styles.buttonColumn}>
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.88 },
              ]}
              hitSlop={TOUCH.hitSlop}
              accessibilityLabel="Return to course"
              accessibilityRole="button"
            >
              <AppText
                font="instrument-semibold"
                size="base"
                style={styles.primaryLabel}
              >
                Return to course
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleStartNew}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.88 },
              ]}
              hitSlop={TOUCH.hitSlop}
              accessibilityLabel="New session"
              accessibilityHint="Clear current course and choose a new start date"
              accessibilityRole="button"
            >
              <AppText
                font="instrument-medium"
                size="base"
                style={styles.secondaryLabel}
              >
                New session
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
