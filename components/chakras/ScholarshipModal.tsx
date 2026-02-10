/**
 * Scholarship Modal
 *
 * Allows users to request a free scholarship by stating why they need it.
 * This is NOT a barter - it's a free access grant for those who need it.
 * After stating their reason, they proceed to Energy Exchange for connection options.
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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
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
    if (!reason.trim()) {
      return
    }

    addHapticFeedback(HapticStrength.Medium)
    setIsSubmitting(true)
    // Small delay for haptic feedback
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
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
            <View className="flex-1">
              <AppText font="instrument-bold" size="xl" className="text-white">
                Scholarship Request
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                className="text-gray-400 mt-1"
              >
                Free access for those who need it
              </AppText>
            </View>
            <Pressable onPress={handleClose} className="p-2">
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 px-6 py-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Info Section */}
            <View className="mb-6">
              <AppText
                font="instrument-regular"
                size="base"
                className="text-white leading-6 mb-4"
              >
                Soul School is operated by Project Starseed, an IRS-recognized
                501(c)(3) tax-exempt organization committed to making spiritual
                growth accessible to all.
              </AppText>
              <AppText
                font="instrument-regular"
                size="base"
                className="text-gray-300 leading-6 mb-4"
              >
                We offer free scholarships to those who need them. This is not a
                barter or exchange—it's a gift of access.
              </AppText>
              <AppText
                font="instrument-medium"
                size="base"
                className="text-white mb-2"
              >
                Why do you need a scholarship?
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                className="text-gray-400 mb-4"
              >
                Share your reason below. Your response helps us understand how
                to best serve our community.
              </AppText>
            </View>

            {/* Input */}
            <TextInput
              value={reason}
              onChangeText={(text) => {
                // Sanitize input: remove potential XSS characters
                const sanitized = text.replace(/[<>]/g, "")
                if (sanitized.length <= 500) {
                  setReason(sanitized)
                }
              }}
              placeholder="Share your reason for requesting a scholarship..."
              placeholderTextColor="#6b7280"
              multiline
              maxLength={500}
              className="bg-gray-900/50 rounded-lg p-4 text-white border border-gray-800 min-h-[120px]"
              style={{ textAlignVertical: "top", color: "#ffffff" }}
            />
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-gray-500 mt-2 text-right"
            >
              {reason.length}/500
            </AppText>
          </ScrollView>

          {/* Footer */}
          <View className="border-t border-gray-800 bg-black p-6">
            <Pressable
              onPress={handleContinue}
              disabled={!reason.trim() || isSubmitting}
              className="bg-purple-700 rounded-lg p-4 flex-row items-center justify-center active:opacity-80 disabled:opacity-50"
            >
              <AppText
                font="instrument-bold"
                size="base"
                className="text-white"
              >
                Continue to Energy Exchange
              </AppText>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                style={{ marginLeft: 8 }}
              />
            </Pressable>
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-gray-500 mt-3 text-center"
            >
              Next, you'll see connection options—not a barter, but ways to stay
              connected with our community.
            </AppText>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}
