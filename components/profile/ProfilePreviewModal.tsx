/**
 * Profile Preview Modal – tap on someone's avatar to see a simple preview.
 *
 * Shows: avatar, name, optional location. Primary CTA: "Create the Connection"
 * which sends a tribe invite so they see it in Tribe Chat as a pending invite.
 * Use globally wherever we show profile images (Social Sanctuary, etc.).
 */

import React, { useState, useCallback } from "react"
import {
  Modal,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { getUserId } from "@/src/services/userId"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { createTribeInvite } from "@/src/services/tribeInvites"

export interface ProfilePreviewModalProps {
  visible: boolean
  onClose: () => void
  userId: string
  displayName?: string
  avatarUrl?: string
  location?: string
}

export function ProfilePreviewModal({
  visible,
  onClose,
  userId,
  displayName,
  avatarUrl,
  location,
}: ProfilePreviewModalProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const displayNameVal = displayName || "Soul"
  const presenceDisplayName = usePresenceStore((s) => s.displayName)
  const presenceAvatarUrl = usePresenceStore((s) => s.profileImageUri)

  const handleCreateConnection = useCallback(async () => {
    addHapticFeedback(HapticStrength.Medium)
    setSending(true)
    setSent(false)
    try {
      const fromUserId = await getUserId()
      const result = await createTribeInvite(
        fromUserId,
        userId,
        presenceDisplayName || "A soul",
        presenceAvatarUrl ?? undefined,
      )
      if (result.ok) {
        setSent(true)
        addHapticFeedback(HapticStrength.Light)
      }
    } catch (e) {
      if (__DEV__) console.warn("[ProfilePreviewModal] create invite error:", e)
    } finally {
      setSending(false)
    }
  }, [userId, presenceDisplayName, presenceAvatarUrl])

  const handleClose = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    setSent(false)
    onClose()
  }, [onClose])

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
              "rgba(28, 28, 32, 0.98)",
              "rgba(22, 26, 28, 0.98)",
              "rgba(20, 28, 30, 0.98)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.headerRow}>
              <AppText font="instrument-regular" size="sm" style={styles.subtitle}>
                Profile
              </AppText>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            <View style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={40}
                    color="rgba(135, 174, 115, 0.7)"
                  />
                </View>
              )}
            </View>
            <AppText
              font="cormorant-regular"
              size="lg"
              style={styles.displayName}
              numberOfLines={1}
            >
              {displayNameVal}
            </AppText>
            {location ? (
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.location}
                numberOfLines={1}
              >
                {location}
              </AppText>
            ) : null}

            {sent ? (
              <View style={styles.sentWrap}>
                <Ionicons name="checkmark-circle" size={20} color="#87AE73" />
                <AppText font="instrument-regular" size="sm" style={styles.sentText}>
                  Invite sent. They’ll see it in Tribe.
                </AppText>
              </View>
            ) : (
              <Pressable
                onPress={handleCreateConnection}
                disabled={sending}
                style={({ pressed }) => [
                  styles.ctaBtn,
                  pressed && styles.ctaBtnPressed,
                  sending && styles.ctaBtnDisabled,
                ]}
              >
                <LinearGradient
                  colors={[
                    "rgba(135, 174, 115, 0.4)",
                    "rgba(135, 174, 115, 0.2)",
                    "rgba(6, 182, 212, 0.15)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaBtnInner}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#B8D4A8" />
                  ) : (
                    <>
                      <Ionicons
                        name="person-add"
                        size={20}
                        color="#B8D4A8"
                        style={{ marginRight: 8 }}
                      />
                      <AppText
                        font="instrument-semibold"
                        size="base"
                        style={styles.ctaBtnText}
                      >
                        Create the Connection
                      </AppText>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            )}
            <AppText font="instrument-regular" size="xs" style={styles.hint}>
              Invite them to your tribe. They’ll get a pending invite in Tribe chat.
            </AppText>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    overflow: "hidden",
  },
  gradient: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
  },
  avatarWrap: {
    alignSelf: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: {
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
  },
  location: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginBottom: 20,
  },
  ctaBtn: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  ctaBtnPressed: { opacity: 0.9 },
  ctaBtnDisabled: { opacity: 0.7 },
  ctaBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  ctaBtnText: {
    color: "#B8D4A8",
  },
  sentWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    paddingVertical: 12,
  },
  sentText: {
    color: "#87AE73",
  },
  hint: {
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
})
