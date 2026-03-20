/**
 * Tribe Friends Menu
 *
 * Slide-out panel: Your profile, Connected / Pending / Suggested friends,
 * + Invite More, Find Friends. Hamburger in Tribe Chat header opens this.
 */

import React, { useState, useEffect } from "react"
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  Platform,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import * as Clipboard from "expo-clipboard"
import type { TribeFriend } from "@/types/tribe"
import { createTribeInvite } from "@/src/services/tribeInvites"

const TABS = ["Connected", "Pending", "Suggested"] as const
type TabKey = (typeof TABS)[number]

export interface TribeFriendsMenuProps {
  visible: boolean
  onClose: () => void
  onInviteMore: () => void
  onFindFriends?: () => void
  onEditProfile?: () => void
  connected: TribeFriend[]
  pending: TribeFriend[]
  suggested: TribeFriend[]
  currentUserId?: string
  currentDisplayName?: string
  currentProfilePicUrl?: string
  roomId?: string
  onRemoveMember?: (memberId: string) => Promise<void>
}

export function TribeFriendsMenu({
  visible,
  onClose,
  onInviteMore,
  onFindFriends,
  onEditProfile,
  connected,
  pending,
  suggested,
  currentUserId = "soul-school-guest",
  currentDisplayName = "You",
  currentProfilePicUrl,
  roomId,
  onRemoveMember,
}: TribeFriendsMenuProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Connected")
  const [copied, setCopied] = useState(false)
  const [connectIdInput, setConnectIdInput] = useState("")
  const [connectStatus, setConnectStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")
  const [connectError, setConnectError] = useState<string | null>(null)
  const [shouldRenderModal, setShouldRenderModal] = useState(visible)
  useEffect(() => {
    if (visible) {
      setShouldRenderModal(true)
      return
    }
    const t = setTimeout(() => setShouldRenderModal(false), 280)
    return () => clearTimeout(t)
  }, [visible])
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const horizontalPadding = Math.max(insets.left, 20) + Math.max(insets.right, 20)
  const panelWidth = Math.min(width - horizontalPadding, 520)

  const handleConnectById = async () => {
    const trimmed = connectIdInput.trim()
    if (!trimmed) return
    if (currentUserId && trimmed === currentUserId) {
      setConnectError("That's your own ID. Enter your friend's SOUL SCHOOL ID.")
      setConnectStatus("error")
      return
    }
    if (!currentUserId || currentUserId === "soul-school-guest") {
      setConnectError("Your SOUL SCHOOL ID is not ready. Try again in a moment.")
      setConnectStatus("error")
      return
    }
    addHapticFeedback(HapticStrength.Medium)
    setConnectStatus("sending")
    setConnectError(null)
    const result = await createTribeInvite(
      currentUserId,
      trimmed,
      currentDisplayName || "A soul",
    )
    if (result.ok) {
      setConnectStatus("sent")
      setConnectIdInput("")
      setTimeout(() => setConnectStatus("idle"), 2000)
    } else {
      setConnectStatus("error")
      setConnectError(result.error || "Could not send request. Try again.")
    }
  }

  const handleCopyId = () => {
    addHapticFeedback(HapticStrength.Light)
    Clipboard.setStringAsync(currentUserId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const list =
    activeTab === "Connected"
      ? connected
      : activeTab === "Pending"
        ? pending
        : suggested

  if (!shouldRenderModal) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      {visible ? (
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.panel, { width: panelWidth }]}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient
            colors={[
              "rgba(12, 14, 18, 0.98)",
              "rgba(8, 12, 16, 0.98)",
              "rgba(10, 14, 20, 0.98)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { paddingTop: Math.max(insets.top, 20) }]}
          >
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <AppText
                  font="instrument-bold"
                  size="lg"
                  style={styles.headerTitle}
                >
                  My Tribe
                </AppText>
                <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                  <Ionicons
                    name="close"
                    size={26}
                    color="rgba(255,255,255,0.9)"
                  />
                </Pressable>
              </View>
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.sovereignCopy}
              >
                Your sacred space. You decide the energy in your tribe.
              </AppText>
            </View>

            {/* Your profile */}
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatarPlaceholder}>
                  {currentProfilePicUrl ? (
                    <View style={styles.avatarPlaceholder} />
                  ) : (
                    <Ionicons
                      name="person"
                      size={28}
                      color="rgba(135, 174, 115, 0.8)"
                    />
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <AppText
                    font="instrument-semibold"
                    size="base"
                    style={styles.profileName}
                  >
                    {currentDisplayName}
                  </AppText>
                  <Pressable onPress={handleCopyId} style={styles.idRow}>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={styles.idLabel}
                    >
                      ID: {currentUserId}
                    </AppText>
                    <Ionicons
                      name="copy-outline"
                      size={14}
                      color="rgba(168, 201, 154, 0.7)"
                    />
                  </Pressable>
                  {copied && (
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={styles.copiedText}
                    >
                      Copied!
                    </AppText>
                  )}
                </View>
                {onEditProfile && (
                  <Pressable onPress={onEditProfile} style={styles.editBtn}>
                    <Ionicons
                      name="pencil"
                      size={18}
                      color="rgba(168, 201, 154, 0.9)"
                    />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Connect by SOUL SCHOOL ID */}
            <View style={styles.connectByIdSection}>
              <AppText
                font="instrument-semibold"
                size="sm"
                style={styles.connectByIdLabel}
              >
                Connect with a SOUL SCHOOL ID
              </AppText>
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.connectByIdHint}
              >
                Enter your friend's SOUL SCHOOL ID to connect.
              </AppText>
              <TextInput
                value={connectIdInput}
                onChangeText={(text) => {
                  setConnectIdInput(text)
                  setConnectStatus("idle")
                  setConnectError(null)
                }}
                placeholder="e.g. Starseed | 1212:88"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.connectByIdInput}
                autoCapitalize="none"
                autoCorrect={false}
                editable={connectStatus !== "sending"}
              />
              {connectError ? (
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={styles.connectByIdError}
                >
                  {connectError}
                </AppText>
              ) : null}
              <Pressable
                onPress={handleConnectById}
                disabled={
                  !connectIdInput.trim() ||
                  connectStatus === "sending" ||
                  !currentUserId ||
                  currentUserId === "soul-school-guest"
                }
                style={[
                  styles.connectByIdBtn,
                  (connectStatus === "sending" ||
                    !connectIdInput.trim() ||
                    !currentUserId ||
                    currentUserId === "soul-school-guest") &&
                    styles.connectByIdBtnDisabled,
                ]}
              >
                <AppText
                  font="instrument-semibold"
                  size="sm"
                  style={styles.connectByIdBtnText}
                >
                  {connectStatus === "sending"
                    ? "Sending…"
                    : connectStatus === "sent"
                      ? "Request sent"
                      : "Connect"}
                </AppText>
              </Pressable>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {TABS.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    setActiveTab(tab)
                  }}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                >
                  <AppText
                    font={
                      activeTab === tab
                        ? "instrument-semibold"
                        : "instrument-regular"
                    }
                    size="sm"
                    style={
                      activeTab === tab ? styles.tabTextActive : styles.tabText
                    }
                  >
                    {tab}
                  </AppText>
                </Pressable>
              ))}
            </View>

            {/* List */}
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {list.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name={
                      activeTab === "Suggested"
                        ? "people-outline"
                        : "person-add-outline"
                    }
                    size={40}
                    color="rgba(135, 174, 115, 0.35)"
                  />
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.emptyText}
                  >
                    {activeTab === "Connected" &&
                      "No one in the room yet. Invite friends to get started."}
                    {activeTab === "Pending" && "No pending invites."}
                    {activeTab === "Suggested" &&
                      "Find friends to see who's on SOUL SCHOOL."}
                  </AppText>
                </View>
              ) : (
                list.map((f) => (
                  <View key={f.id} style={styles.friendRow}>
                    <View style={styles.friendAvatar}>
                      <Ionicons
                        name="person"
                        size={20}
                        color="rgba(168, 201, 154, 0.8)"
                      />
                    </View>
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={styles.friendName}
                      numberOfLines={1}
                    >
                      {f.displayName}
                    </AppText>
                    {f.status === "pending" && (
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={styles.pendingLabel}
                      >
                        Pending
                      </AppText>
                    )}
                    {activeTab === "Connected" &&
                      roomId &&
                      onRemoveMember && (
                        <Pressable
                          onPress={() => {
                            addHapticFeedback(HapticStrength.Light)
                            Alert.alert(
                              "Remove from tribe",
                              `Remove ${f.displayName} from your tribe? This is your sacred space—you decide who is present.`,
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Remove",
                                  style: "destructive",
                                  onPress: () => onRemoveMember(f.id),
                                },
                              ]
                            )
                          }}
                          style={({ pressed }) => [
                            styles.removeFromTribeBtn,
                            pressed && { opacity: 0.8 },
                          ]}
                        >
                          <Ionicons
                            name="person-remove-outline"
                            size={18}
                            color="rgba(248, 113, 113, 0.95)"
                          />
                          <AppText
                            font="instrument-regular"
                            size="xs"
                            style={styles.removeFromTribeText}
                          >
                            Remove
                          </AppText>
                        </Pressable>
                      )}
                  </View>
                ))
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  addHapticFeedback(HapticStrength.Medium)
                  onClose()
                  onInviteMore()
                }}
                style={styles.inviteBtnWrap}
              >
                <LinearGradient
                  colors={[
                    "rgba(135, 174, 115, 0.35)",
                    "rgba(6, 182, 212, 0.2)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inviteBtn}
                >
                  <Ionicons
                    name="person-add"
                    size={20}
                    color="rgba(255,255,255,0.95)"
                  />
                  <AppText
                    font="instrument-semibold"
                    size="sm"
                    style={styles.inviteBtnText}
                  >
                    + Invite more
                  </AppText>
                </LinearGradient>
              </Pressable>
              {onFindFriends && (
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Medium)
                    onClose()
                    onFindFriends()
                  }}
                  style={styles.findBtnWrap}
                >
                  <LinearGradient
                    colors={[
                      "rgba(6, 182, 212, 0.2)",
                      "rgba(135, 174, 115, 0.15)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.findBtn}
                  >
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color="rgba(168, 201, 154, 0.95)"
                    />
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={styles.findBtnText}
                    >
                      Find friends on SOUL SCHOOL
                    </AppText>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    flex: 1,
    maxWidth: 520,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(135, 174, 115, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  gradient: { flex: 1, paddingHorizontal: 24, paddingVertical: 20 },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "rgba(255,255,255,0.98)" },
  closeBtn: { padding: 6 },
  sovereignCopy: {
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 6,
    fontStyle: "italic",
  },
  profileCard: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.2)",
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(135, 174, 115, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  profileInfo: { flex: 1 },
  profileName: { color: "rgba(255,255,255,0.98)" },
  idRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  idLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  copiedText: { color: "rgba(135, 174, 115, 0.9)", marginTop: 2, fontSize: 11 },
  editBtn: { padding: 8 },
  connectByIdSection: {
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.2)",
  },
  connectByIdLabel: { color: "rgba(255,255,255,0.95)", marginBottom: 6 },
  connectByIdHint: {
    color: "rgba(255,255,255,0.5)",
    marginBottom: 12,
  },
  connectByIdInput: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.25)",
  },
  connectByIdError: {
    color: "rgba(220, 100, 100, 0.95)",
    marginBottom: 8,
  },
  connectByIdBtn: {
    backgroundColor: "rgba(135, 174, 115, 0.3)",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
  },
  connectByIdBtnDisabled: { opacity: 0.5 },
  connectByIdBtnText: { color: "rgba(255,255,255,0.95)" },
  tabRow: { flexDirection: "row", marginBottom: 16, gap: 6 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tabActive: {
    backgroundColor: "rgba(135, 174, 115, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
  },
  tabText: { color: "rgba(255,255,255,0.7)" },
  tabTextActive: { color: "rgba(255,255,255,0.98)" },
  listScroll: { flex: 1 },
  listContent: { paddingBottom: 24 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 28,
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 14,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(135, 174, 115, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  friendName: { flex: 1, color: "rgba(255,255,255,0.9)" },
  pendingLabel: { color: "rgba(212, 165, 116, 0.9)", marginLeft: 8 },
  removeFromTribeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  removeFromTribeText: { color: "rgba(248, 113, 113, 0.95)" },
  actions: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(135, 174, 115, 0.15)",
  },
  inviteBtnWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  inviteBtnText: { color: "rgba(255,255,255,0.95)" },
  findBtnWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  findBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  findBtnText: { color: "rgba(168, 201, 154, 0.95)" },
})
