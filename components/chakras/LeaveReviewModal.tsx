/**
 * Leave a Review Modal
 *
 * In-app form for the Energy Exchange "Leave a Review" option.
 * User writes a comment; Submit sends via mailto and marks complete. Close returns without marking complete.
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
  Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

const REVIEW_EMAIL = "Asha@ProjectStarseed.org"

interface LeaveReviewModalProps {
  visible: boolean
  onClose: () => void
  /** Called when user taps Submit (review sent). Caller marks review complete and closes. */
  onComplete?: () => void
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    if (!message.trim()) return
    addHapticFeedback(HapticStrength.Medium)
    const encodedSubject = encodeURIComponent("Soul School - Review")
    const encodedBody = encodeURIComponent(message.trim())
    const mailto = `mailto:${REVIEW_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`
    await Linking.openURL(mailto)
    setMessage("")
    onComplete?.()
    onClose()
  }

  const handleClose = () => {
    setMessage("")
    onClose()
  }

  const canSubmit = message.trim().length > 0

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(139,115,85,0.3)",
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText
                font="instrument-bold"
                size="xl"
                style={{ color: "#fff" }}
              >
                Leave a Review
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}
              >
                Share your experience and help others find their path
              </AppText>
            </View>
            <Pressable onPress={handleClose} style={{ padding: 8 }}>
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                backgroundColor: "rgba(90,74,58,0.2)",
                borderRadius: 12,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.3)",
                marginBottom: 24,
              }}
            >
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "rgba(255,255,255,0.8)", lineHeight: 22 }}
              >
                Your words help others discover this path. We read every review
                with care.
              </AppText>
            </View>

            <AppText
              font="instrument-medium"
              size="sm"
              style={{ color: "#fff", marginBottom: 8 }}
            >
              Your review or comment
            </AppText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Share your experience with the 7 chakras journey..."
              placeholderTextColor="rgba(139,115,85,0.6)"
              multiline
              numberOfLines={6}
              style={{
                backgroundColor: "rgba(90,74,58,0.2)",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.3)",
                color: "#D4C5A9",
                fontSize: 16,
                minHeight: 140,
                textAlignVertical: "top",
                marginBottom: 24,
              }}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={{
                paddingVertical: 20,
                paddingHorizontal: 32,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: canSubmit ? "#A8C99A" : "rgba(139,115,85,0.2)",
                backgroundColor: canSubmit
                  ? "rgba(168,201,154,0.2)"
                  : "rgba(90,74,58,0.2)",
              }}
            >
              <AppText
                font="instrument-bold"
                size="lg"
                style={{
                  textAlign: "center",
                  color: canSubmit ? "#A8C99A" : "rgba(255,255,255,0.4)",
                }}
              >
                Submit & Send
              </AppText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}
