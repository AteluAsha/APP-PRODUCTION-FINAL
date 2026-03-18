/**
 * Communication Reminder pre-prompt
 *
 * Shown before the system notification permission dialog. Dark, on-brand copy:
 * "We will remind you somatically as we get closer to the opening. We don't
 * send notifications, we communicate—and that is all."
 *
 * The system dialog (iOS/Android) cannot be styled or rewritten per platform rules;
 * this modal is the only place we can use our own language and design.
 */

import React from "react"
import { Modal, View, Pressable, StyleSheet, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { MODAL_CARD_MAX_WIDTH } from "@/constants/layout"

interface CommunicationReminderModalProps {
  visible: boolean
  onAllow: () => void
  onNotNow: () => void
}

export function CommunicationReminderModal({
  visible,
  onAllow,
  onNotNow,
}: CommunicationReminderModalProps) {
  if (!visible) return null

  const handleAllow = () => {
    addHapticFeedback(HapticStrength.Medium)
    onAllow()
  }

  const handleNotNow = () => {
    addHapticFeedback(HapticStrength.Light)
    onNotNow()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleNotNow}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleNotNow}
          accessibilityLabel="Dismiss"
        />
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
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="heart"
                  size={22}
                  color="rgba(135, 174, 115, 0.9)"
                />
              </View>
              <AppText
                font="instrument-semibold"
                size="lg"
                style={styles.title}
              >
                Gentle reminders
              </AppText>
            </View>

            <AppText font="instrument-regular" size="sm" style={styles.body}>
              We will remind you somatically as we get closer to the opening. We
              don't send notifications—we communicate, and that is all. Allowing
              also helps audio downloads finish when the app is in the background.
            </AppText>

            <Pressable
              onPress={handleAllow}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <LinearGradient
                colors={["rgba(135, 174, 115, 0.35)", "rgba(6, 182, 212, 0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.allowButton}
              >
                <AppText
                  font="instrument-semibold"
                  size="sm"
                  style={styles.allowButtonText}
                >
                  Allow communication
                </AppText>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleNotNow}
              style={styles.notNowWrap}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={styles.notNowText}
              >
                Not now
              </AppText>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(135, 174, 115, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    color: "#ffffff",
  },
  body: {
    color: "rgba(255, 255, 255, 0.88)",
    lineHeight: 22,
    marginBottom: 20,
  },
  allowButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    alignItems: "center",
    marginBottom: 10,
  },
  allowButtonText: {
    color: "rgba(184, 212, 168, 0.95)",
  },
  notNowWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  notNowText: {
    color: "rgba(255, 255, 255, 0.5)",
  },
})
