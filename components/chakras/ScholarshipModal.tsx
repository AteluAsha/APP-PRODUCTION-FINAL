/**
 * Scholarship Modal
 *
 * A healing, heart-minded space for users to request free access.
 * SOUL SCHOOL is operated by Project Starseed (501(c)(3)); scholarships are
 * gifts, not barter. Honest, transparent, inviting.
 *
 * Uses StyleSheet (not NativeWind) for reliable rendering in Modal context.
 */

import React, { useState } from "react"
import {
  View,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

interface ScholarshipModalProps {
  visible: boolean
  onClose: () => void
  onContinue: (reason: string) => void
}

export const ScholarshipModal: React.FC<ScholarshipModalProps> = ({
  visible,
  onClose,
  onContinue,
}) => {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = () => {
    if (!reason.trim()) return
    addHapticFeedback(HapticStrength.Medium)
    setIsSubmitting(true)
    setTimeout(() => {
      onContinue(reason.trim())
      setIsSubmitting(false)
      setReason("")
    }, 100)
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaProvider>
        <View style={styles.wrapper}>
          <LinearGradient
            colors={[
              "rgba(18, 24, 26, 0.99)",
              "rgba(14, 22, 26, 0.99)",
              "rgba(12, 20, 24, 0.99)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerTextWrap}>
                    <View style={styles.iconWrap}>
                      <Ionicons
                        name="heart"
                        size={24}
                        color="rgba(168, 201, 154, 0.95)"
                      />
                    </View>
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      style={styles.title}
                    >
                      A Sacred Invitation
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.subtitle}
                    >
                      Free access for those who need it
                    </AppText>
                  </View>
                  <Pressable
                    onPress={handleClose}
                    style={styles.closeButton}
                    hitSlop={12}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color="rgba(168, 201, 154, 0.7)"
                    />
                  </Pressable>
                </View>

                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Heart-minded copy */}
                  <View style={styles.infoSection}>
                    <AppText
                      font="instrument-regular"
                      size="base"
                      style={styles.bodyTextAlt}
                    >
                      A scholarship is a gift, not an exchange. There is no
                      expectation of anything in return. We simply want to meet
                      you where you are.
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={styles.hint}
                    >
                      Energy exchange (free) – refreshes monthly, reapply when
                      grant ends.
                    </AppText>
                    <AppText
                      font="instrument-medium"
                      size="base"
                      style={styles.question}
                    >
                      What brings you here?
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.hint}
                    >
                      A few words help us understand how to serve our community.
                      Your story is held with care.
                    </AppText>
                  </View>

                  {/* Input */}
                  <TextInput
                    value={reason}
                    onChangeText={(text) => {
                      const sanitized = text.replace(/[<>]/g, "")
                      if (sanitized.length <= 500) setReason(sanitized)
                    }}
                    placeholder="Share what feels right to share..."
                    placeholderTextColor="rgba(168, 201, 154, 0.4)"
                    multiline
                    maxLength={500}
                    style={styles.input}
                  />
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.charCount}
                  >
                    {reason.length}/500
                  </AppText>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                  <Pressable
                    onPress={handleContinue}
                    disabled={!reason.trim() || isSubmitting}
                    style={({ pressed }) => [
                      styles.continueButtonWrap,
                      (pressed || !reason.trim() || isSubmitting) &&
                        styles.continueButtonDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        reason.trim() && !isSubmitting
                          ? [
                              "rgba(168, 201, 154, 0.5)",
                              "rgba(107, 142, 90, 0.45)",
                            ]
                          : [
                              "rgba(168, 201, 154, 0.2)",
                              "rgba(107, 142, 90, 0.18)",
                            ]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.continueButton}
                    >
                      <AppText
                        font="instrument-bold"
                        size="base"
                        style={styles.continueText}
                      >
                        Enter Energy Exchange
                      </AppText>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="rgba(255, 255, 255, 0.95)"
                        style={styles.arrowIcon}
                      />
                    </LinearGradient>
                  </Pressable>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.footerHint}
                  >
                    Next, you'll see simple ways to stay connected—no
                    obligation, only invitation.
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.disclaimer}
                  >
                    SOUL SCHOOL is offered by Project Starseed, an
                    IRS-recognized 501(c)(3) nonprofit. We believe healing
                    belongs to everyone—and that means access without barriers.
                  </AppText>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </SafeAreaProvider>
    </Modal>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(168, 201, 154, 0.12)",
  },
  headerTextWrap: {
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(168, 201, 154, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  subtitle: {
    color: "rgba(168, 201, 154, 0.8)",
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  bodyText: {
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 24,
    marginBottom: 16,
  },
  bodyTextAlt: {
    color: "rgba(212, 220, 210, 0.85)",
    lineHeight: 24,
    marginBottom: 20,
  },
  question: {
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: 8,
  },
  hint: {
    color: "rgba(168, 201, 154, 0.75)",
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(168, 201, 154, 0.06)",
    borderRadius: 14,
    padding: 18,
    color: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.2)",
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 16,
  },
  charCount: {
    color: "rgba(168, 201, 154, 0.5)",
    marginTop: 10,
    textAlign: "right",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(168, 201, 154, 0.1)",
    padding: 24,
  },
  continueButtonWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.35)",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  arrowIcon: {
    marginLeft: 10,
  },
  footerHint: {
    color: "rgba(168, 201, 154, 0.6)",
    marginTop: 14,
    textAlign: "center",
    lineHeight: 18,
  },
  disclaimer: {
    color: "rgba(168, 201, 154, 0.5)",
    marginTop: 20,
    textAlign: "center",
    lineHeight: 18,
    fontSize: 11,
  },
})
