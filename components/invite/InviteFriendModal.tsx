/**
 * Invite Friend Modal – "Build Your Tribe"
 *
 * Compact, heart-minded design: depth via gradients, soft framing on choice buttons,
 * subtle healing palette. Primary: system share; backup: Messages, WhatsApp, Mail, Copy, More.
 */

import React from "react"
import { Modal, View, Pressable, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { generateInviteMessage, generateReferralLink } from "@/utils/invite"
import { openSystemShare } from "@/utils/shareDestinations"
import { ShareDestinationList } from "@/components/sharing/ShareDestinationPicker"

const HERO_ICON = require("@/assets/images/ChakraWheel_ONBLACK_300DPI.png")

interface InviteFriendModalProps {
  visible: boolean
  onClose: () => void
  startDate?: string
  referralCode?: string
  onInviteSent?: () => void
}

export const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  visible,
  onClose,
  startDate,
  referralCode,
  onInviteSent,
}) => {
  const referralLink = generateReferralLink(referralCode)
  const inviteMessage = generateInviteMessage({
    startDate,
    referralLink,
  })

  const handleSystemShare = async () => {
    addHapticFeedback(HapticStrength.Medium)
    await openSystemShare({
      message: inviteMessage,
      url: referralLink,
      title: "Join me on Soul School",
    })
  }

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    onClose()
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityLabel="Close modal"
        />
        <View style={styles.cardWrap}>
          <LinearGradient
            colors={[
              "rgba(24, 28, 32, 0.99)",
              "rgba(18, 24, 28, 0.99)",
              "rgba(16, 26, 30, 0.99)",
              "rgba(22, 26, 32, 0.99)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardInner}
          >
            {/* Header: compact */}
            <View style={styles.header}>
              <Image
                source={HERO_ICON}
                style={styles.heroIcon}
                resizeMode="contain"
                accessibilityLabel="Soul School chakra icon"
              />
              <AppText font="instrument-semibold" size="lg" style={{ color: "#ffffff", flex: 1 }}>
                Build Your Tribe
              </AppText>
              <Pressable onPress={handleClose} hitSlop={12} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>

            {/* Description: tighter, one line + date */}
            <AppText
              font="instrument-regular"
              size="sm"
              style={{ color: "rgba(255,255,255,0.82)", lineHeight: 20, marginBottom: 4 }}
            >
              Send a current of connection—share the journey with someone you care about.
            </AppText>
            <AppText font="instrument-semibold" size="sm" style={{ color: "#ffffff", marginBottom: 12 }}>
              {startDate ? `They can join you ${startDate}` : "Your start date"}
            </AppText>

            {/* Invite preview: smaller, soft glow */}
            <View style={styles.invitePreview}>
              <AppText font="instrument-regular" size="xs" style={{ color: "rgba(6, 182, 212, 0.9)", marginBottom: 4 }}>
                Your invite
              </AppText>
              <AppText
                font="instrument-regular"
                size="xs"
                style={{ color: "rgba(255,255,255,0.78)", lineHeight: 16 }}
                numberOfLines={2}
              >
                Join me on a healing journey through the 7 chakras…
              </AppText>
              <AppText font="instrument-regular" size="xs" style={{ color: "rgba(255,255,255,0.5)", marginTop: 4 }} numberOfLines={1}>
                {referralLink}
              </AppText>
            </View>

            {/* Primary Share: smaller, gentle gradient */}
            <Pressable onPress={handleSystemShare} style={styles.primaryShareButton}>
              <LinearGradient
                colors={[
                  "rgba(135, 174, 115, 0.4)",
                  "rgba(135, 174, 115, 0.22)",
                  "rgba(6, 182, 212, 0.15)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryShareButtonInner}
              >
                <Ionicons name="share-social" size={18} color="rgba(184, 212, 168, 0.95)" style={{ marginRight: 8 }} />
                <AppText font="instrument-semibold" size="sm" style={{ color: "rgba(184, 212, 168, 0.95)" }}>
                  Share
                </AppText>
              </LinearGradient>
            </Pressable>

            <AppText font="instrument-regular" size="xs" style={{ color: "rgba(255,255,255,0.48)", marginBottom: 6 }}>
              Or copy link / choose app
            </AppText>
            <ShareDestinationList
              message={inviteMessage}
              url={referralLink}
              onSuccess={onInviteSent}
            />
          </LinearGradient>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    shadowColor: "rgba(6, 182, 212, 0.35)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  cardInner: {
    padding: 18,
    alignItems: "stretch",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  closeButton: {
    padding: 6,
  },
  invitePreview: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.28)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  primaryShareButton: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.45)",
  },
  primaryShareButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
})
