/**
 * Tribe Room Invite Modal – "Add to Room"
 *
 * Clear opening copy, visible invite message/link, primary Share, embedded share list.
 */

import React from "react"
import { Modal, View, Pressable, ScrollView } from "react-native"
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
  referralCode,
  onInviteSent,
  onFindFriends,
}: TribeRoomInviteModalProps) {
  const referralLink = generateReferralLink(referralCode, courseStartDateISO)
  const inviteMessage = generateInviteMessage({ startDate, referralLink })

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

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={modalOverlay} onPress={handleClose}>
        <Pressable style={modalCard} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={[
              "rgba(28, 28, 32, 0.98)",
              "rgba(22, 26, 28, 0.98)",
              "rgba(20, 28, 30, 0.98)",
              "rgba(26, 28, 32, 0.98)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={gradientInner}
          >
            <View style={headerRow}>
              <AppText font="instrument-semibold" size="xl" style={headerTitle}>
                Add to Room
              </AppText>
              <Pressable onPress={handleClose} hitSlop={12} style={closeBtn}>
                <Ionicons
                  name="close"
                  size={24}
                  color="rgba(255,255,255,0.7)"
                />
              </Pressable>
            </View>

            <AppText font="instrument-regular" size="base" style={subtitle}>
              {INVITE_OPENING_COPY}
            </AppText>

            {/* What they'll receive: full message + link, scroll if needed */}
            <View style={previewBox}>
              <AppText font="instrument-regular" size="sm" style={previewLabel}>
                {INVITE_PREVIEW_LABEL}
              </AppText>
              <AppText font="instrument-regular" size="xs" style={previewHint}>
                {INVITE_PREVIEW_HINT}
              </AppText>
              <ScrollView
                style={previewScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={previewText}
                >
                  {inviteMessage}
                </AppText>
              </ScrollView>
              <AppText font="instrument-regular" size="sm" style={previewLink}>
                {referralLink}
              </AppText>
            </View>

            <Pressable onPress={handleSystemShare} style={primaryBtn}>
              <LinearGradient
                colors={[
                  "rgba(135, 174, 115, 0.35)",
                  "rgba(135, 174, 115, 0.2)",
                  "rgba(6, 182, 212, 0.12)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={primaryBtnInner}
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
                  style={primaryBtnText}
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
              <Pressable onPress={handleFindFriends} style={findFriendsBtn}>
                <LinearGradient
                  colors={[
                    "rgba(6, 182, 212, 0.15)",
                    "rgba(135, 174, 115, 0.1)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={findFriendsBtnInner}
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
                    style={findFriendsBtnText}
                  >
                    Find friends on Soul School
                  </AppText>
                </LinearGradient>
              </Pressable>
            )}
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const modalOverlay = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  justifyContent: "center" as const,
  alignItems: "center" as const,
  padding: 24,
}
const modalCard = {
  width: "100%" as const,
  maxWidth: 340,
  borderRadius: 20,
  overflow: "hidden" as const,
  borderWidth: 1,
  borderColor: "rgba(135, 174, 115, 0.4)",
  shadowColor: "rgba(6, 182, 212, 0.2)",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.6,
  shadowRadius: 16,
  elevation: 12,
}
const gradientInner = {
  padding: 24,
  alignItems: "stretch" as const,
  minHeight: 1,
}
const headerRow = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: 20,
}
const headerTitle = { color: "rgba(255,255,255,0.98)" }
const closeBtn = { padding: 8 }
const subtitle = {
  color: "rgba(255,255,255,0.88)",
  lineHeight: 22,
  marginBottom: 22,
}
const previewBox = {
  backgroundColor: "rgba(0, 0, 0, 0.35)",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(6, 182, 212, 0.2)",
  paddingVertical: 16,
  paddingHorizontal: 16,
  marginBottom: 22,
  minHeight: 100,
}
const previewLabel = {
  color: "rgba(6, 182, 212, 0.9)",
  marginBottom: 4,
}
const previewHint = {
  color: "rgba(255,255,255,0.6)",
  marginBottom: 10,
  fontSize: 12,
}
const previewScroll = {
  maxHeight: 140,
  marginBottom: 10,
}
const previewText = {
  color: "rgba(255,255,255,0.82)",
  lineHeight: 22,
}
const previewLink = {
  color: "rgba(255,255,255,0.65)",
  marginTop: 4,
  lineHeight: 20,
}
const primaryBtn = {
  borderRadius: 14,
  marginBottom: 20,
  overflow: "hidden" as const,
  borderWidth: 1,
  borderColor: "rgba(135, 174, 115, 0.5)",
}
const primaryBtnInner = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  paddingVertical: 14,
  paddingHorizontal: 20,
}
const primaryBtnText = { color: "#B8D4A8" }
const findFriendsBtn = {
  marginTop: 20,
  borderRadius: 14,
  overflow: "hidden" as const,
  borderWidth: 1,
  borderColor: "rgba(6, 182, 212, 0.3)",
}
const findFriendsBtnInner = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  paddingVertical: 14,
  paddingHorizontal: 20,
}
const findFriendsBtnText = { color: "rgba(168, 201, 154, 0.95)" }
