/**
 * Share Destination Picker – Single source of truth for "where to share"
 *
 * One modal, SOUL SCHOOL design (chakra icon, gradient card), linear list of
 * destinations: Messages, WhatsApp, Mail, Copy link, More…. Used by
 * ShareAppModal, InviteFriendModal, TribeRoomInviteModal, FindFriendsModal.
 * High traffic safe: no heavy deps, try/catch in utils, canOpenURL for WhatsApp.
 */

import React, { useState } from "react"
import { View, Modal, Pressable, StyleSheet, Image } from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import {
  SHARE_DESTINATION_IDS,
  ShareDestinationId,
  shareToDestination,
  SHARE_TITLE,
} from "@/utils/shareDestinations"

export interface ShareDestinationPickerProps {
  visible: boolean
  onClose: () => void
  message: string
  url: string
  title?: string
  /** Called after a successful share action (including copy). Optional close after. */
  onSuccess?: () => void
  /** Modal title override */
  modalTitle?: string
  /** Subtitle override */
  modalSubtitle?: string
}

const HERO_ICON = require("@/assets/images/ChakraWheel_ONBLACK_300DPI.png")

const DESTINATION_CONFIG: Record<
  ShareDestinationId,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  messages: { label: "Messages", icon: "chatbubble-outline" },
  whatsapp: { label: "WhatsApp", icon: "logo-whatsapp" },
  mail: { label: "Mail", icon: "mail-outline" },
  copy: { label: "Copy link", icon: "copy-outline" },
  more: { label: "More…", icon: "share-social" },
}

/** Props for the list-only variant (embed in Build Your Tribe, etc.) */
export interface ShareDestinationListProps {
  message: string
  url: string
  title?: string
  onSuccess?: () => void
  /** When "embedded", used inside invite modals: no chevrons, more spacing, optional section label. */
  variant?: "default" | "embedded"
  /** Label above the list when variant="embedded", e.g. "Share via". */
  sectionLabel?: string
}

/** Inline list of share destinations; use inside your own modal/card. */
export function ShareDestinationList({
  message,
  url,
  title = SHARE_TITLE,
  onSuccess,
  variant = "default",
  sectionLabel,
}: ShareDestinationListProps) {
  const [copyJustDone, setCopyJustDone] = useState(false)
  const [loadingId, setLoadingId] = useState<ShareDestinationId | null>(null)
  const isEmbedded = variant === "embedded"

  const handleDestination = async (destinationId: ShareDestinationId) => {
    addHapticFeedback(HapticStrength.Medium)
    setLoadingId(destinationId)
    const success = await shareToDestination(destinationId, {
      message,
      url,
      title,
    })
    setLoadingId(null)
    if (success) {
      if (destinationId === "copy") {
        setCopyJustDone(true)
        setTimeout(() => setCopyJustDone(false), 1500)
      }
      onSuccess?.()
    }
  }

  const listStyle = isEmbedded ? styles.listEmbedded : styles.list
  const rowStyle = isEmbedded ? styles.rowEmbedded : styles.row
  const rowIconStyle = isEmbedded ? styles.rowIconEmbedded : styles.rowIcon

  if (isEmbedded) {
    return (
      <View>
        {sectionLabel && (
          <AppText
            font="instrument-regular"
            size="xs"
            style={styles.sectionLabel}
          >
            {sectionLabel}
          </AppText>
        )}
        <View style={styles.embeddedDepthFrame}>
          <View style={styles.embeddedRow}>
            {SHARE_DESTINATION_IDS.map((id) => {
              const config = DESTINATION_CONFIG[id]
              const isCopy = id === "copy"
              const showDone = isCopy && copyJustDone
              const isLoading = loadingId === id
              return (
                <Pressable
                  key={id}
                  onPress={() => handleDestination(id)}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.embeddedIconWrap,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityLabel={showDone ? "Link copied" : config.label}
                >
                  <Ionicons
                    name={config.icon}
                    size={22}
                    color={
                      showDone
                        ? "rgba(184, 212, 168, 0.95)"
                        : "rgba(255,255,255,0.9)"
                    }
                  />
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View>
      <View style={listStyle}>
        {SHARE_DESTINATION_IDS.map((id) => {
          const config = DESTINATION_CONFIG[id]
          const isCopy = id === "copy"
          const showDone = isCopy && copyJustDone
          const isLoading = loadingId === id
          return (
            <Pressable
              key={id}
              onPress={() => handleDestination(id)}
              disabled={isLoading}
              style={({ pressed }) => [rowStyle, pressed && { opacity: 0.85 }]}
            >
              <View style={rowIconStyle}>
                <Ionicons
                  name={config.icon}
                  size={20}
                  color={
                    showDone
                      ? "rgba(184, 212, 168, 0.95)"
                      : "rgba(255,255,255,0.88)"
                  }
                />
              </View>
              <AppText
                font="instrument-regular"
                size="sm"
                style={{
                  flex: 1,
                  color: showDone
                    ? "rgba(184, 212, 168, 0.95)"
                    : "rgba(255,255,255,0.92)",
                }}
              >
                {showDone ? "Link copied!" : config.label}
              </AppText>
              {!showDone && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.35)"
                />
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export function ShareDestinationPicker({
  visible,
  onClose,
  message,
  url,
  title = SHARE_TITLE,
  onSuccess,
  modalTitle = "Share SOUL SCHOOL",
  modalSubtitle = "Choose where to share",
}: ShareDestinationPickerProps) {
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
                accessibilityLabel="SOUL SCHOOL chakra icon"
              />
              <View style={styles.headerTextWrap}>
                <AppText
                  font="instrument-semibold"
                  size="xl"
                  className="text-white"
                >
                  {modalTitle}
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-white/70"
                >
                  {modalSubtitle}
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

            <ShareDestinationList
              message={message}
              url={url}
              title={title}
              onSuccess={onSuccess}
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 360,
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
  headerTextWrap: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  list: {
    gap: 6,
  },
  listEmbedded: {
    gap: 10,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.6)",
    marginBottom: 10,
  },
  embeddedDepthFrame: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.2)",
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  embeddedRow: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    gap: 4,
  },
  embeddedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.18)",
    shadowColor: "rgba(6, 182, 212, 0.12)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  rowEmbedded: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.12)",
  },
  rowIcon: {
    marginRight: 10,
    width: 24,
    alignItems: "center",
  },
  rowIconEmbedded: {
    marginRight: 12,
    width: 24,
    alignItems: "center",
  },
})
