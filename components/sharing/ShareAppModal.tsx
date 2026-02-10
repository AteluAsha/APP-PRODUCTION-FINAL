/**
 * Share App Modal
 *
 * Primary: system share sheet (user's phone, their usual apps). Backup: our
 * in-app picker (Copy link, Messages, WhatsApp, Mail, More…).
 */

import React, { useState, useEffect } from "react"
import { View, Modal, Pressable, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { generateReferralLink, generateInviteMessage } from "@/utils/invite"
import { openSystemShare } from "@/utils/shareDestinations"
import { ShareDestinationPicker } from "@/components/sharing/ShareDestinationPicker"

const HERO_ICON = require("@/assets/images/ChakraWheel_ONBLACK_300DPI.png")

interface ShareAppModalProps {
  visible: boolean
  onClose: () => void
  referralCode?: string
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  visible,
  onClose,
  referralCode,
}) => {
  const [showBackupPicker, setShowBackupPicker] = useState(false)

  useEffect(() => {
    if (!visible) setShowBackupPicker(false)
  }, [visible])

  const referralLink = generateReferralLink(referralCode)
  const inviteMessage = generateInviteMessage({ referralLink })

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
    setShowBackupPicker(false)
    onClose()
  }

  if (!visible) return null

  return (
    <>
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
                "rgba(28, 28, 32, 0.98)",
                "rgba(22, 26, 28, 0.98)",
                "rgba(20, 28, 30, 0.98)",
                "rgba(26, 28, 32, 0.98)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardInner}
            >
              <View style={styles.header}>
                <Image
                  source={HERO_ICON}
                  style={styles.heroIcon}
                  resizeMode="contain"
                  accessibilityLabel="Soul School chakra icon"
                />
                <View style={styles.headerTextWrap}>
                  <AppText
                    font="instrument-semibold"
                    size="xl"
                    className="text-white"
                  >
                    Share Soul School
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    className="text-white/70"
                  >
                    Share with your favorite apps
                  </AppText>
                </View>
                <Pressable
                  onPress={handleClose}
                  hitSlop={12}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color="rgba(255,255,255,0.7)"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={handleSystemShare}
                style={styles.primaryButton}
                className="active:opacity-90"
              >
                <LinearGradient
                  colors={[
                    "rgba(135, 174, 115, 0.35)",
                    "rgba(135, 174, 115, 0.2)",
                    "rgba(6, 182, 212, 0.12)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonInner}
                >
                  <Ionicons
                    name="share-social"
                    size={24}
                    color="#B8D4A8"
                    style={{ marginRight: 10 }}
                  />
                  <AppText
                    font="instrument-semibold"
                    size="base"
                    className="text-[#B8D4A8]"
                  >
                    Share
                  </AppText>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => {
                  addHapticFeedback(HapticStrength.Light)
                  setShowBackupPicker(true)
                }}
                style={styles.backupButton}
                className="active:opacity-80"
              >
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-white/70"
                >
                  Copy link or choose app
                </AppText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(255,255,255,0.5)"
                />
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      <ShareDestinationPicker
        visible={showBackupPicker}
        onClose={() => setShowBackupPicker(false)}
        message={inviteMessage}
        url={referralLink}
        modalTitle="Share Soul School"
        modalSubtitle="Copy link or choose app"
      />
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    shadowColor: "rgba(6, 182, 212, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  cardInner: {
    padding: 24,
    alignItems: "stretch",
    minHeight: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerTextWrap: { flex: 1 },
  closeButton: { padding: 8 },
  primaryButton: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.5)",
  },
  primaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
})
