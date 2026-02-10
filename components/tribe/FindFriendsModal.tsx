/**
 * Find Friends Modal
 *
 * Primary: system share. Backup: ShareDestinationPicker (Copy link, choose app).
 */

import React, { useState, useEffect, useCallback } from "react"
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import {
  isContactsAvailable,
  requestContactsPermission,
  getDeviceContacts,
  type ContactInfo,
} from "@/src/services/contactSync"
import { generateInviteMessage, generateReferralLink } from "@/utils/invite"
import { openSystemShare } from "@/utils/shareDestinations"
import { ShareDestinationPicker } from "@/components/sharing/ShareDestinationPicker"

export interface FindFriendsModalProps {
  visible: boolean
  onClose: () => void
  startDate?: string
}

export function FindFriendsModal({
  visible,
  onClose,
  startDate,
}: FindFriendsModalProps) {
  const [status, setStatus] = useState<"idle" | "requesting" | "loading" | "ready" | "denied" | "unavailable" | "error">("idle")
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showCopied, setShowCopied] = useState(false)
  const [showSharePicker, setShowSharePicker] = useState(false)

  const referralLink = generateReferralLink()
  const inviteMessage = generateInviteMessage({ startDate, referralLink })

  const loadContacts = useCallback(async () => {
    if (!visible) return
    setStatus("requesting")
    setErrorMessage(null)
    const available = await isContactsAvailable()
    if (!available) {
      setStatus("unavailable")
      return
    }
    const granted = await requestContactsPermission()
    if (!granted) {
      setStatus("denied")
      return
    }
    setStatus("loading")
    try {
      const list = await getDeviceContacts()
      setContacts(list)
      setStatus("ready")
    } catch (e) {
      if (__DEV__) console.warn("[FindFriendsModal] getDeviceContacts:", e)
      setErrorMessage("Could not load contacts.")
      setStatus("error")
    }
  }, [visible])

  useEffect(() => {
    if (visible && status === "idle") {
      loadContacts()
    }
    if (!visible) {
      setStatus("idle")
      setContacts([])
      setErrorMessage(null)
      setShowCopied(false)
      setShowSharePicker(false)
    }
  }, [visible, status, loadContacts])

  const handleCopyLink = async () => {
    addHapticFeedback(HapticStrength.Medium)
    setShowCopied(true)
    try {
      await Clipboard.setStringAsync(referralLink)
      setTimeout(() => setShowCopied(false), 2000)
    } catch {
      setShowCopied(false)
    }
  }

  const handleSystemShare = async () => {
    addHapticFeedback(HapticStrength.Medium)
    await openSystemShare({
      message: inviteMessage,
      url: referralLink,
      title: "Join me on Soul School",
    })
  }

  const handleOpenBackupPicker = () => {
    addHapticFeedback(HapticStrength.Light)
    setShowSharePicker(true)
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
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={[
              "rgba(18, 22, 28, 0.97)",
              "rgba(14, 18, 24, 0.98)",
              "rgba(20, 26, 32, 0.97)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <AppText font="instrument-bold" size="lg" style={styles.title}>
                Find friends
              </AppText>
              <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={26} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </View>

            {status === "requesting" || status === "loading" ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="rgba(135, 174, 115, 0.9)" />
                <AppText font="instrument-regular" size="sm" style={styles.hint}>
                  {status === "requesting" ? "Checking permission…" : "Loading contacts…"}
                </AppText>
              </View>
            ) : status === "unavailable" ? (
              <View style={styles.shareFallback}>
                <AppText font="instrument-regular" size="base" style={styles.fallbackLead}>
                  Share your invite via Messages, WhatsApp, Instagram, or any app.
                </AppText>
                <Pressable onPress={handleCopyLink} disabled={showCopied} style={styles.primaryBtn}>
                  <LinearGradient
                    colors={["rgba(135, 174, 115, 0.28)", "rgba(135, 174, 115, 0.18)", "rgba(6, 182, 212, 0.08)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryBtnInner}
                  >
                    {showCopied ? (
                      <AppText font="instrument-medium" size="base" style={styles.primaryBtnText}>Link copied!</AppText>
                    ) : (
                      <>
                        <Ionicons name="copy-outline" size={20} color="#B8D4A8" style={{ marginRight: 8 }} />
                        <AppText font="instrument-medium" size="base" style={styles.primaryBtnText}>Copy link</AppText>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={handleSystemShare} style={styles.secondaryBtn}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)", "rgba(6, 182, 212, 0.04)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.secondaryBtnInner}
                  >
                    <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.9)" style={{ marginRight: 8 }} />
                    <AppText font="instrument-regular" size="sm" style={styles.secondaryBtnText}>
                      Share to Messages, WhatsApp, Instagram…
                    </AppText>
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={handleOpenBackupPicker} style={styles.backupLink}>
                  <AppText font="instrument-regular" size="xs" style={styles.backupLinkText}>
                    Copy link or choose app
                  </AppText>
                </Pressable>
              </View>
            ) : status === "denied" ? (
              <View style={styles.centered}>
                <Ionicons name="people-outline" size={48} color="rgba(135, 174, 115, 0.5)" />
                <AppText font="instrument-regular" size="base" style={styles.deniedText}>
                  Contacts access was denied. You can invite friends by sharing the link below or from Add to Room.
                </AppText>
                <Pressable onPress={handleSystemShare} style={[styles.secondaryBtn, { marginTop: 16 }]}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.1)", "rgba(6, 182, 212, 0.04)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.secondaryBtnInner}
                  >
                    <AppText font="instrument-regular" size="sm" style={styles.secondaryBtnText}>Share to Messages, WhatsApp…</AppText>
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={handleOpenBackupPicker} style={styles.backupLink}>
                  <AppText font="instrument-regular" size="xs" style={styles.backupLinkText}>Copy link or choose app</AppText>
                </Pressable>
              </View>
            ) : status === "error" ? (
              <View style={styles.centered}>
                <AppText font="instrument-regular" size="sm" style={styles.errorText}>
                  {errorMessage}
                </AppText>
              </View>
            ) : status === "ready" ? (
              <>
                <AppText font="instrument-regular" size="sm" style={styles.subtitle}>
                  Invite your contacts to Soul School. They can join you in the room once they have the app.
                </AppText>
                <ScrollView
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {contacts.length === 0 ? (
                    <AppText font="instrument-regular" size="sm" style={styles.emptyText}>
                      No contacts with phone or email found.
                    </AppText>
                  ) : (
                    contacts.slice(0, 100).map((contact) => (
                      <Pressable
                        key={contact.id}
                        onPress={handleSystemShare}
                        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                      >
                        <View style={styles.avatar}>
                          <Ionicons name="person" size={20} color="rgba(168, 201, 154, 0.8)" />
                        </View>
                        <AppText font="instrument-medium" size="sm" style={styles.rowName} numberOfLines={1}>
                          {contact.displayName}
                        </AppText>
                        <Ionicons name="share-outline" size={20} color="rgba(135, 174, 115, 0.9)" />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
                {contacts.length > 100 && (
                  <AppText font="instrument-regular" size="xs" style={styles.cappedHint}>
                    Showing first 100. Use search in your messages to invite others.
                  </AppText>
                )}
                <Pressable onPress={handleOpenBackupPicker} style={styles.backupLink}>
                  <AppText font="instrument-regular" size="xs" style={styles.backupLinkText}>
                    Copy link or choose app
                  </AppText>
                </Pressable>
              </>
            ) : null}
          </LinearGradient>
        </Pressable>
      </Pressable>

      <ShareDestinationPicker
        visible={showSharePicker}
        onClose={() => setShowSharePicker(false)}
        message={inviteMessage}
        url={referralLink}
        modalTitle="Invite to Soul School"
        modalSubtitle="Choose where to share"
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "80%",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    shadowColor: "rgba(6, 182, 212, 0.2)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: { padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: "rgba(255,255,255,0.98)" },
  closeBtn: { padding: 6 },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  hint: { color: "rgba(255,255,255,0.7)", marginTop: 12 },
  deniedText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  errorText: { color: "rgba(251, 191, 36, 0.9)" },
  shareFallback: { paddingVertical: 8 },
  fallbackLead: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  primaryBtn: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.5)",
  },
  primaryBtnInner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryBtnText: { color: "#B8D4A8" },
  secondaryBtn: {
    borderRadius: 14,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  secondaryBtnInner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  secondaryBtnText: { color: "rgba(255,255,255,0.9)" },
  backupLink: { paddingVertical: 8, alignItems: "center" as const },
  backupLinkText: { color: "rgba(255,255,255,0.5)" },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    marginBottom: 16,
  },
  list: { maxHeight: 320 },
  listContent: { paddingBottom: 16 },
  emptyText: { color: "rgba(255,255,255,0.6)" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  rowPressed: { opacity: 0.8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(135, 174, 115, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowName: { flex: 1, color: "rgba(255,255,255,0.9)" },
  cappedHint: { color: "rgba(255,255,255,0.5)", marginTop: 8 },
})
