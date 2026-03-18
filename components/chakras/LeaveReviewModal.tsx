/**
 * Leave a Review Modal
 *
 * Energy Exchange "Leave a Review" option. Opens the soulschool.app review page
 * in the device browser. User posts their comment on the site, closes the
 * browser to return to the app, then taps Done to close the modal and return
 * to the Energy Exchange screen (and can tap Enter Path).
 */

import React from "react"
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { REVIEW_URL } from "@/constants/sharing"

interface LeaveReviewModalProps {
  visible: boolean
  onClose: () => void
  /** Called when user taps Done (return to Energy Exchange). Caller marks review complete and closes. */
  onComplete?: () => void
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const handleOpenReviewPage = () => {
    addHapticFeedback(HapticStrength.Medium)
    Linking.openURL(REVIEW_URL).catch((err) => {
      if (__DEV__) console.warn("[LeaveReviewModal] open URL failed:", err)
    })
  }

  const handleDone = () => {
    addHapticFeedback(HapticStrength.Light)
    onComplete?.()
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
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
              Share your experience on soulschool.app
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
              Your words help others discover this path. We'll open the review
              page on soulschool.app—post your comment there, then close the
              browser and tap Done below to return to your path.
            </AppText>
          </View>

          <Pressable
            onPress={handleOpenReviewPage}
            style={{
              paddingVertical: 20,
              paddingHorizontal: 32,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#A8C99A",
              backgroundColor: "rgba(168,201,154,0.2)",
              marginBottom: 16,
            }}
          >
            <AppText
              font="instrument-bold"
              size="lg"
              style={{ textAlign: "center", color: "#A8C99A" }}
            >
              Open review page on soulschool.app
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleDone}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(139,115,85,0.4)",
              backgroundColor: "rgba(90,74,58,0.2)",
            }}
          >
            <AppText
              font="instrument-regular"
              size="base"
              style={{ textAlign: "center", color: "rgba(255,255,255,0.9)" }}
            >
              Done — return to Energy Exchange
            </AppText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}
