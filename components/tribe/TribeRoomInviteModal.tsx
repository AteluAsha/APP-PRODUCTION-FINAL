/**
 * Tribe Room Invite Modal – "Add to Room"
 *
 * Clear opening copy, visible invite message/link, primary Share, embedded share list.
 */

import React, { useState, useEffect, useMemo } from "react"
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
  StyleSheet,
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

export interface TribeRoomInviteModalProps {
  visible: boolean
  onClose: () => void
  roomId?: string
  /** Formatted for message (e.g. "Monday, March 3, 2025"). */
  startDate?: string
  /** ISO YYYY-MM-DD for invite link so invitee syncs to same journey week. */
  courseStartDateISO?: string
  referralCode?: string
  onInviteSent?: () => void
  onFindFriends?: () => void
}

export function TribeRoomInviteModal({
  visible,
  onClose,
  startDate,
  courseStartDateISO,
  referralCode: referralCodeProp,
  onInviteSent,
  onFindFriends,
}: TribeRoomInviteModalProps) {
  const { width: windowWidth } = useWindowDimensions()
  const [resolvedReferralCode, setResolvedReferralCode] = useState<string | null>(null)
  // When closed, keep Modal in tree with visible={false} briefly so native layer releases touches, then unmount so we don't leave a Modal blocking taps (e.g. hamburger/profile in Tribe Chat).
  const [shouldRenderModal, setShouldRenderModal] = useState(visible)

  const cardWidth = useMemo(() => {
    const padding = 32
    const max = 520
    return Math.min(windowWidth - padding * 2, max)
  }, [windowWidth])
  useEffect(() => {
    if (visible) {
      setShouldRenderModal(true)
      return
    }
    const t = setTimeout(() => setShouldRenderModal(false), 280)
    return () => clearTimeout(t)
  }, [visible])

  useEffect(() => {
    if (visible && !referralCodeProp) {
      getUserId().then(setResolvedReferralCode).catch(() => setResolvedReferralCode(null))
    } else if (!visible) {
      setResolvedReferralCode(null)
    }
  }, [visible, referralCodeProp])

  const referralCode = referralCodeProp ?? resolvedReferralCode ?? undefined
  const referralLink = generateReferralLink(referralCode, courseStartDateISO)
  const inviteMessage = generateInviteMessage({
    startDate,
    referralLink,
    senderSoulSchoolId: referralCode,
  })

  const handleSystemShare = async () => {
    addHapticFeedback(HapticStrength.Medium)
    await openSystemShare({
      message: inviteMessage,
      url: referralLink,
      title: "Join me in the room – Soul School",
    })
  }

  const handleFindFriends = () => {
    addHapticFeedback(HapticStrength.Medium)
    onClose()
    onFindFriends?.()
  }

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    onClose()
  }

  if (!shouldRenderModal) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      {visible ? (
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.card, { width: cardWidth }]}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient
            colors={[
              "rgba(28, 28, 32, 0.98)",
              "rgba(22, 26, 28, 0.98)",
              "rgba(20, 28, 30, 0.98)",
              "rgba(26, 28, 32, 0.98)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientInner}
          >
            <View style={styles.headerRow}>
              <AppText font="instrument-semibold" size="xl" style={styles.headerTitle}>
                Add to Room
              </AppText>
              <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons
                  name="close"
                  size={24}
                  color="rgba(255,255,255,0.7)"
                />
              </Pressable>
            </View>

            <AppText font="instrument-regular" size="base" style={styles.subtitle}>
              {INVITE_OPENING_COPY}
            </AppText>

            <View style={styles.previewBox}>
              <AppText font="instrument-regular" size="sm" style={styles.previewLabel}>
                {INVITE_PREVIEW_LABEL}
              </AppText>
              <AppText font="instrument-regular" size="xs" style={styles.previewHint}>
                {INVITE_PREVIEW_HINT}
              </AppText>
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
              <AppText font="instrument-regular" size="sm" style={styles.previewLink}>
                {referralLink}
              </AppText>
            </View>

            <Pressable onPress={handleSystemShare} style={styles.primaryBtn}>
              <LinearGradient
                colors={[
                  "rgba(135, 174, 115, 0.35)",
                  "rgba(135, 174, 115, 0.2)",
                  "rgba(6, 182, 212, 0.12)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnInner}
              >
                <Ionicons
                  name="share-social"
                  size={22}
                  color="#B8D4A8"
                  style={{ marginRight: 8 }}
                />
                <AppText
                  font="instrument-semibold"
                  size="base"
                  style={styles.primaryBtnText}
                >
                  Share
                </AppText>
              </LinearGradient>
            </Pressable>

            <ShareDestinationList
              message={inviteMessage}
              url={referralLink}
              title="Join me in the room – Soul School"
              onSuccess={onInviteSent}
              variant="embedded"
              sectionLabel="Share via"
            />

            {onFindFriends && (
              <Pressable onPress={handleFindFriends} style={styles.findFriendsBtn}>
                <LinearGradient
                  colors={[
                    "rgba(6, 182, 212, 0.15)",
                    "rgba(135, 174, 115, 0.1)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.findFriendsBtnInner}
                >
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color="rgba(168, 201, 154, 0.95)"
                    style={{ marginRight: 8 }}
                  />
                  <AppText
                    font="instrument-medium"
                    size="sm"
                    style={styles.findFriendsBtnText}
                  >
                    Find friends on Soul School
                  </AppText>
                </LinearGradient>
              </Pressable>
            )}
          </LinearGradient>
        </Pressable>
      </Pressable>
      ) : null}
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  card: {
    maxWidth: 520,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(135, 174, 115, 0.38)",
    shadowColor: "rgba(6, 182, 212, 0.18)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  gradientInner: {
    paddingHorizontal: 28,
    paddingVertical: 26,
    alignItems: "stretch",
    minHeight: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitle: {
    color: "rgba(255,255,255,0.98)",
    flex: 1,
  },
  closeBtn: {
    padding: 8,
    marginRight: -8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.88)",
    lineHeight: 24,
    marginBottom: 20,
    paddingRight: 8,
  },
  previewBox: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.22)",
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    minHeight: 100,
  },
  previewLabel: {
    color: "rgba(6, 182, 212, 0.92)",
    marginBottom: 6,
  },
  previewHint: {
    color: "rgba(255,255,255,0.62)",
    marginBottom: 12,
    fontSize: 12,
  },
  previewScroll: {
    maxHeight: 160,
    marginBottom: 12,
  },
  previewText: {
    color: "rgba(255,255,255,0.84)",
    lineHeight: 22,
  },
  previewLink: {
    color: "rgba(255,255,255,0.68)",
    marginTop: 6,
    lineHeight: 20,
    fontSize: 13,
  },
  primaryBtn: {
    borderRadius: 16,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(135, 174, 115, 0.48)",
  },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryBtnText: {
    color: "#B8D4A8",
  },
  findFriendsBtn: {
    marginTop: 18,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.28)",
  },
  findFriendsBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  findFriendsBtnText: {
    color: "rgba(168, 201, 154, 0.95)",
  },
})
