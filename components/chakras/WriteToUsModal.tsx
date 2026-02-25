/**
 * Write to Us Modal
 *
 * Styled email form that opens mailto:Asha@ProjectStarseed.org.
 * Gradient, transparent, earth-toned design.
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
const EMAIL = "Asha@ProjectStarseed.org"

interface WriteToUsModalProps {
  visible: boolean
  onClose: () => void
  /** Called when user taps Send (intent to complete). Use to navigate away. */
  onComplete?: () => void
}

export const WriteToUsModal: React.FC<WriteToUsModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const handleSend = async () => {
    addHapticFeedback(HapticStrength.Medium)
    const encodedSubject = encodeURIComponent(
      subject.trim() || "Soul School - Message",
    )
    const encodedBody = encodeURIComponent(message.trim() || "")
    const mailto = `mailto:${EMAIL}?subject=${encodedSubject}&body=${encodedBody}`
    await Linking.openURL(mailto)
    setSubject("")
    setMessage("")
    onComplete?.()
    onClose()
  }

  const handleClose = () => {
    setSubject("")
    setMessage("")
    onClose()
  }

  const canSend = message.trim().length > 0

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
                Write to Us
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}
              >
                Share your story, feedback, or connect with our community
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
                All messages go to Asha at Project Starseed. We read every
                message and respond with care.
              </AppText>
            </View>

            {/* Subject */}
            <AppText
              font="instrument-medium"
              size="sm"
              style={{ color: "#fff", marginBottom: 8 }}
            >
              Subject (optional)
            </AppText>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Feedback, Question, Story"
              placeholderTextColor="rgba(139,115,85,0.6)"
              style={{
                backgroundColor: "rgba(90,74,58,0.2)",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.3)",
                color: "#D4C5A9",
                fontSize: 16,
                marginBottom: 20,
              }}
            />

            {/* Message */}
            <AppText
              font="instrument-medium"
              size="sm"
              style={{ color: "#fff", marginBottom: 8 }}
            >
              Message
            </AppText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Share your reflection..."
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

            {/* Send Button */}
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={{
                paddingVertical: 20,
                paddingHorizontal: 32,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: canSend ? "#A8C99A" : "rgba(139,115,85,0.2)",
                backgroundColor: canSend
                  ? "rgba(168,201,154,0.2)"
                  : "rgba(90,74,58,0.2)",
              }}
            >
              <AppText
                font="instrument-bold"
                size="lg"
                style={{
                  textAlign: "center",
                  color: canSend ? "#A8C99A" : "rgba(255,255,255,0.4)",
                }}
              >
                Open Email
              </AppText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}
