/**
 * Invite Friend Modal – "Build Your Tribe"
 *
 * Same clarity and layout as Add to Room: clear opening, visible invite message/link,
 * primary Share, embedded share list. Heart-minded design.
 *
 * Product note: In lifetime → trial course → lifetime trial waiting room, when the
 * user has friends, the entry point should show Tribe Chat (friends + conversations)
 * instead of this modal; see WaitingScreen.
 */

import React, { useState, useEffect } from "react"
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import {
  generateInviteMessage,
  generateReferralLink,
  INVITE_OPENING_COPY,
  INVITE_PREVIEW_LABEL,
  INVITE_PREVIEW_HINT,
  openSystemShare,
} from "@/utils/shareDestinations"
import { ShareDestinationList } from "@/components/sharing/ShareDestinationPicker"
import { getUserId } from "@/src/services/userId"
import { useTribeFriends } from "@/hooks/useTribeFriends"

const HERO_ICON = require("@/assets/images/ChakraWheel_ONBLACK_300DPI.png")

interface InviteFriendModalProps {
  visible: boolean
  onClose: () => void
  startDate?: string
  referralCode?: string
  onInviteSent?: () => void
}

const TRIAL_TRIBE_ROOM_ID = "global-trial-tribe"

export const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  visible,
  onClose,
  startDate,
  referralCode,
  onInviteSent,
}) => {
  const [senderSoulSchoolId, setSenderSoulSchoolId] = useState<string | null>(
    null,
  )
  const { addPendingInvite } = useTribeFriends(TRIAL_TRIBE_ROOM_ID, visible)

  useEffect(() => {
    if (visible) {
      getUserId().then(setSenderSoulSchoolId)
    } else {
      setSenderSoulSchoolId(null)
    }
  }, [visible])

  const effectiveRefCode = referralCode ?? senderSoulSchoolId ?? undefined
  const referralLink = generateReferralLink(effectiveRefCode)
  const inviteMessage = generateInviteMessage({
    startDate,
    referralLink,
    senderSoulSchoolId: senderSoulSchoolId ?? undefined,
  })

  const handlePendingInviteAndCallback = async () => {
    if (senderSoulSchoolId) {
      await addPendingInvite("Pending invite", senderSoulSchoolId)
    }
    onInviteSent?.()
  }

  const handleSystemShare = async () => {
    addHapticFeedback(HapticStrength.Medium)
    await openSystemShare({
      message: inviteMessage,
      url: referralLink,
      title: "Join me on Soul School",
    })
    await handlePendingInviteAndCallback()
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
              "rgba(24, 28, 32, 0.88)",
              "rgba(18, 24, 28, 0.9)",
              "rgba(16, 26, 30, 0.9)",
              "rgba(22, 26, 32, 0.88)",
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
              <AppText
                font="instrument-semibold"
                size="lg"
                style={{ color: "#ffffff", flex: 1 }}
              >
                Build Your Tribe
              </AppText>
              <Pressable
                onPress={handleClose}
                hitSlop={12}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              </Pressable>
            </View>

            {/* Opening: same as Add to Room for consistency */}
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.openingCopy}
            >
              {INVITE_OPENING_COPY}
            </AppText>

            {/* Your invite: Soul School ID (gold), Use this code, message + link */}
            <View style={styles.invitePreview}>
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.previewLabel}
              >
                {INVITE_PREVIEW_LABEL}
              </AppText>
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.previewHint}
              >
                {INVITE_PREVIEW_HINT}
              </AppText>
              {senderSoulSchoolId ? (
                <>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.soulSchoolIdLabel}
                  >
                    Soul School ID
                  </AppText>
                  <AppText
                    font="instrument-bold"
                    style={styles.soulSchoolIdValue}
                    numberOfLines={2}
                    selectable
                  >
                    {senderSoulSchoolId}
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.useThisCodeLine}
                  >
                    Use this code to join them in Tribe Chat.
                  </AppText>
                </>
              ) : null}
              <ScrollView
                style={styles.previewScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={styles.previewText}
                >
                  {inviteMessage}
                </AppText>
              </ScrollView>
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.previewLink}
              >
                {referralLink}
              </AppText>
            </View>

            {/* Primary Share */}
            <Pressable
              onPress={handleSystemShare}
              style={styles.primaryShareButton}
            >
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
                <Ionicons
                  name="share-social"
                  size={18}
                  color="rgba(184, 212, 168, 0.95)"
                  style={{ marginRight: 8 }}
                />
                <AppText
                  font="instrument-semibold"
                  size="sm"
                  style={{ color: "rgba(184, 212, 168, 0.95)" }}
                >
                  Share
                </AppText>
              </LinearGradient>
            </Pressable>

            <ShareDestinationList
              message={inviteMessage}
              url={referralLink}
              onSuccess={handlePendingInviteAndCallback}
              variant="embedded"
              sectionLabel="Share via"
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  cardInner: {
    padding: 24,
    alignItems: "stretch",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  openingCopy: {
    color: "rgba(255,255,255,0.88)",
    lineHeight: 22,
    marginBottom: 22,
  },
  invitePreview: {
    backgroundColor: "rgba(184, 212, 168, 0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(184, 212, 168, 0.22)",
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 22,
    minHeight: 100,
  },
  previewLabel: {
    color: "rgba(184, 212, 168, 0.85)",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  previewHint: {
    color: "rgba(255,255,255,0.55)",
    marginBottom: 12,
    fontSize: 12,
  },
  soulSchoolIdLabel: {
    color: "rgba(255,255,255,0.45)",
    marginBottom: 6,
    fontSize: 11,
  },
  soulSchoolIdValue: {
    color: "#F5D547",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
    textShadowColor: "rgba(245, 213, 71, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  useThisCodeLine: {
    color: "rgba(184, 212, 168, 0.9)",
    marginBottom: 12,
  },
  previewScroll: {
    maxHeight: 140,
    marginBottom: 12,
  },
  previewText: {
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
  },
  previewLink: {
    color: "rgba(184, 212, 168, 0.7)",
    marginTop: 4,
    lineHeight: 20,
  },
  primaryShareButton: {
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.5)",
  },
  primaryShareButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
})
