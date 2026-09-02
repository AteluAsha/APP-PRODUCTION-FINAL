/**
 * Find Friends Modal – Add a friend on Awakening Soul
 *
 * Primary: Awakening Soul ID input → lookup → profile card → Connect (tribe invite).
 * Secondary: Copy link / Share invite link.
 * Recipient sees invite in Tribe Chat and can accept the transmission.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  TextInput,
  Image,
  KeyboardAvoidingView,
} from "react-native"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import {
  generateInviteMessage,
  generateReferralLink,
  openSystemShare,
} from "@/utils/shareDestinations"
import { ShareDestinationPicker } from "@/components/sharing/ShareDestinationPicker"
import { getUserId } from "@/src/services/userId"
import { getUserProfile, type UserProfile } from "@/src/services/profileService"
import { createTribeInvite } from "@/src/services/tribeInvites"
import { usePresenceStore } from "@/hooks/usePresenceStore"

const ROOM_ID = "global-trial-tribe"

export interface FindFriendsModalProps {
  visible: boolean
  onClose: () => void
  /** Formatted for message (e.g. "Monday, March 3, 2025"). */
  startDate?: string
  /** ISO YYYY-MM-DD for invite link so invitee syncs to same journey week. */
  courseStartDateISO?: string
  referralCode?: string
}

type LookupStatus = "idle" | "loading" | "found" | "not_found" | "self" | "error"
type ConnectStatus = "idle" | "sending" | "sent" | "error"

export function FindFriendsModal({
  visible,
  onClose,
  startDate,
  courseStartDateISO,
  referralCode: referralCodeProp,
}: FindFriendsModalProps) {
  const insets = useSafeAreaInsets()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const cardWidth = useMemo(
    () => Math.min(windowWidth - insets.left - insets.right - 48, 520),
    [windowWidth, insets.left, insets.right],
  )

  const presenceDisplayName = usePresenceStore((s) => s.displayName)
  const presenceAvatarUrl = usePresenceStore((s) => s.profileImageUri)

  const [soulSchoolIdInput, setSoulSchoolIdInput] = useState("")
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle")
  const [lookupProfile, setLookupProfile] = useState<UserProfile | null>(null)
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("idle")
  const [connectError, setConnectError] = useState<string | null>(null)
  const [showCopied, setShowCopied] = useState(false)
  const [showSharePicker, setShowSharePicker] = useState(false)
  const [resolvedReferralCode, setResolvedReferralCode] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [shouldRenderModal, setShouldRenderModal] = useState(visible)

  useEffect(() => {
    if (visible) {
      setShouldRenderModal(true)
      getUserId().then(setCurrentUserId).catch(() => setCurrentUserId(null))
    } else {
      const t = setTimeout(() => setShouldRenderModal(false), 280)
      return () => clearTimeout(t)
    }
  }, [visible])

  useEffect(() => {
    if (visible && !referralCodeProp) {
      getUserId().then(setResolvedReferralCode).catch(() => setResolvedReferralCode(null))
    } else if (!visible) {
      setResolvedReferralCode(null)
      setSoulSchoolIdInput("")
      setLookupStatus("idle")
      setLookupProfile(null)
      setConnectStatus("idle")
      setConnectError(null)
      setShowCopied(false)
      setShowSharePicker(false)
    }
  }, [visible, referralCodeProp])

  const referralCode = referralCodeProp ?? resolvedReferralCode ?? undefined
  const referralLink = generateReferralLink(referralCode, courseStartDateISO)
  const inviteMessage = generateInviteMessage({
    startDate,
    referralLink,
    senderSoulSchoolId: referralCode,
  })

  const handleLookup = useCallback(async () => {
    const trimmed = soulSchoolIdInput.trim()
    if (!trimmed) return
    addHapticFeedback(HapticStrength.Light)
    setLookupStatus("loading")
    setLookupProfile(null)
    setConnectStatus("idle")
    setConnectError(null)
    const myId = currentUserId ?? (await getUserId().catch(() => ""))
    if (trimmed === myId) {
      setLookupStatus("self")
      return
    }
    try {
      const profile = await getUserProfile(trimmed)
      if (profile) {
        setLookupProfile(profile)
        setLookupStatus("found")
      } else {
        setLookupStatus("not_found")
      }
    } catch {
      setLookupStatus("error")
    }
  }, [soulSchoolIdInput, currentUserId])

  const handleConnect = useCallback(async () => {
    if (!lookupProfile || connectStatus === "sending") return
    addHapticFeedback(HapticStrength.Medium)
    setConnectStatus("sending")
    setConnectError(null)
    try {
      const fromUserId = await getUserId()
      const result = await createTribeInvite(
        fromUserId,
        lookupProfile.id,
        presenceDisplayName || "A soul",
        presenceAvatarUrl ?? undefined,
        ROOM_ID,
      )
      if (result.ok) {
        setConnectStatus("sent")
      } else {
        setConnectStatus("error")
        setConnectError(result.error ?? "Could not send invite")
      }
    } catch (e) {
      setConnectStatus("error")
      setConnectError("Could not send invite")
      if (__DEV__) console.warn("[FindFriendsModal] createTribeInvite:", e)
    }
  }, [lookupProfile, connectStatus, presenceDisplayName, presenceAvatarUrl])

  const handleCopyLink = useCallback(async () => {
    addHapticFeedback(HapticStrength.Medium)
    setShowCopied(true)
    try {
      await Clipboard.setStringAsync(referralLink)
      setTimeout(() => setShowCopied(false), 2000)
    } catch {
      setShowCopied(false)
    }
  }, [referralLink])

  const handleSystemShare = useCallback(async () => {
    addHapticFeedback(HapticStrength.Medium)
    await openSystemShare({
      message: inviteMessage,
      url: referralLink,
      title: "Join me on Awakening Soul",
    })
  }, [inviteMessage, referralLink])

  const handleClose = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    onClose()
  }, [onClose])

  if (!shouldRenderModal) return null

  const overlayWrapStyle = [
    styles.overlayWrap,
    {
      paddingTop: Math.max(insets.top, 24),
      paddingBottom: Math.max(insets.bottom, 24),
      paddingLeft: Math.max(insets.left, 32),
      paddingRight: Math.max(insets.right, 32),
    },
  ]
  const rootStyle = [
    styles.overlayWrapRoot,
    { backgroundColor: Platform.OS === "android" ? "rgba(0, 0, 0, 0.92)" : "rgba(0, 0, 0, 0.85)" },
  ]

  const androidModalRootStyle =
    Platform.OS === "android"
      ? [styles.overlayWrapRoot, { width: windowWidth, height: windowHeight, backgroundColor: "rgba(0, 0, 0, 0.92)" }]
      : null

  const modalContent = (
    <>
      <View style={rootStyle}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
        <View style={overlayWrapStyle} pointerEvents="box-none">
          <Pressable
            style={[styles.card, { width: cardWidth }]}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
                  colors={
                    Platform.OS === "android"
                      ? ["#1e2022", "#1a1c1e", "#181c1e", "#1c1e22"]
                      : [
                          "rgba(28, 28, 32, 0.98)",
                          "rgba(22, 26, 28, 0.98)",
                          "rgba(20, 28, 30, 0.98)",
                          "rgba(26, 28, 32, 0.98)",
                        ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
              <View style={styles.headerRow}>
                <AppText font="instrument-semibold" size="xl" style={styles.title}>
                  Find friends on Awakening Soul
                </AppText>
                <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
                </Pressable>
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
              >
                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Section 1: Add by Awakening Soul ID */}
                  <AppText font="instrument-medium" size="sm" style={styles.sectionLabel}>
                    Add by Awakening Soul ID
                  </AppText>
                  <AppText font="instrument-regular" size="xs" style={styles.sectionHint}>
                    Ask your friend for their Awakening Soul ID or Soul Signature from Profile.
                  </AppText>
                  <TextInput
                    value={soulSchoolIdInput}
                    onChangeText={(t) => {
                      setSoulSchoolIdInput(t)
                      if (lookupStatus !== "idle") setLookupStatus("idle")
                    }}
                    placeholder="Soul Signature or Awakening Soul ID"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                  />
                  <Pressable
                    onPress={handleLookup}
                    disabled={!soulSchoolIdInput.trim() || lookupStatus === "loading"}
                    style={[
                      styles.lookupBtn,
                      (!soulSchoolIdInput.trim() || lookupStatus === "loading") &&
                        styles.lookupBtnDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        soulSchoolIdInput.trim() && lookupStatus !== "loading"
                          ? ["rgba(135, 174, 115, 0.4)", "rgba(107, 142, 90, 0.25)"]
                          : ["rgba(135, 174, 115, 0.15)", "rgba(107, 142, 90, 0.1)"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.lookupBtnInner}
                    >
                      {lookupStatus === "loading" ? (
                        <ActivityIndicator size="small" color="rgba(168, 201, 154, 0.95)" />
                      ) : (
                        <>
                          <Ionicons
                            name="search"
                            size={18}
                            color={
                              soulSchoolIdInput.trim() && lookupStatus !== "loading"
                                ? "#B8D4A8"
                                : "rgba(168, 201, 154, 0.5)"
                            }
                            style={{ marginRight: 8 }}
                          />
                          <AppText
                            font="instrument-semibold"
                            size="sm"
                            style={[
                              styles.lookupBtnText,
                              (!soulSchoolIdInput.trim() || lookupStatus === "loading") &&
                                styles.lookupBtnTextDisabled,
                            ]}
                          >
                            Look up
                          </AppText>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  {lookupStatus === "self" && (
                    <AppText font="instrument-regular" size="sm" style={styles.errorMsg}>
                      You can&apos;t invite yourself.
                    </AppText>
                  )}
                  {lookupStatus === "not_found" && (
                    <AppText font="instrument-regular" size="sm" style={styles.errorMsg}>
                      No Awakening Soul member found with this ID.
                    </AppText>
                  )}
                  {lookupStatus === "error" && (
                    <AppText font="instrument-regular" size="sm" style={styles.errorMsg}>
                      Could not look up. Try again.
                    </AppText>
                  )}

                  {lookupStatus === "found" && lookupProfile && (
                    <View style={styles.profileCard}>
                      <View style={styles.profileRow}>
                        {lookupProfile.avatarUrl ? (
                          <Image
                            source={{ uri: lookupProfile.avatarUrl }}
                            style={styles.profileAvatar}
                          />
                        ) : (
                          <View style={[styles.profileAvatar, styles.profileAvatarPlaceholder]}>
                            <Ionicons name="person" size={24} color="rgba(255,255,255,0.5)" />
                          </View>
                        )}
                        <View style={styles.profileInfo}>
                          <AppText
                            font="instrument-semibold"
                            size="base"
                            style={styles.profileName}
                            numberOfLines={1}
                          >
                            {lookupProfile.displayName || "Soul"}
                          </AppText>
                          {lookupProfile.location ? (
                            <AppText
                              font="instrument-regular"
                              size="xs"
                              style={styles.profileLocation}
                              numberOfLines={1}
                            >
                              {lookupProfile.location}
                            </AppText>
                          ) : null}
                        </View>
                      </View>
                      {connectStatus === "sent" ? (
                        <View style={styles.sentRow}>
                          <Ionicons name="checkmark-circle" size={20} color="rgba(135, 174, 115, 0.95)" />
                          <AppText font="instrument-regular" size="sm" style={styles.sentText}>
                            Invite sent. They&apos;ll see it in Tribe Chat to accept the transmission.
                          </AppText>
                        </View>
                      ) : (
                        <>
                          <Pressable
                            onPress={handleConnect}
                            disabled={connectStatus === "sending"}
                            style={[
                              styles.connectBtn,
                              connectStatus === "sending" && styles.connectBtnDisabled,
                            ]}
                          >
                            <LinearGradient
                              colors={
                                connectStatus === "sending"
                                  ? ["rgba(135, 174, 115, 0.15)", "rgba(107, 142, 90, 0.1)"]
                                  : ["rgba(135, 174, 115, 0.35)", "rgba(6, 182, 212, 0.12)"]
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.connectBtnInner}
                            >
                              {connectStatus === "sending" ? (
                                <ActivityIndicator size="small" color="rgba(168, 201, 154, 0.9)" />
                              ) : (
                                <>
                                  <Ionicons
                                    name="person-add"
                                    size={18}
                                    color="#B8D4A8"
                                    style={{ marginRight: 8 }}
                                  />
                                  <AppText font="instrument-semibold" size="sm" style={styles.connectBtnText}>
                                    Connect
                                  </AppText>
                                </>
                              )}
                            </LinearGradient>
                          </Pressable>
                          {connectStatus === "error" && connectError && (
                            <AppText font="instrument-regular" size="xs" style={styles.errorMsg}>
                              {connectError}
                            </AppText>
                          )}
                        </>
                      )}
                    </View>
                  )}

                  {/* Section 2: Or share your invite link */}
                  <View style={styles.divider} />
                  <AppText font="instrument-medium" size="sm" style={styles.sectionLabel}>
                    Or share your invite link
                  </AppText>
                  <View style={styles.shareRow}>
                    <Pressable
                      onPress={handleCopyLink}
                      disabled={showCopied}
                      style={styles.copyBtn}
                    >
                      <LinearGradient
                        colors={
                          showCopied
                            ? ["rgba(135, 174, 115, 0.2)", "rgba(107, 142, 90, 0.12)"]
                            : ["rgba(135, 174, 115, 0.28)", "rgba(6, 182, 212, 0.08)"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.copyBtnInner}
                      >
                        <Ionicons
                          name={showCopied ? "checkmark" : "copy-outline"}
                          size={18}
                          color="#B8D4A8"
                          style={{ marginRight: 6 }}
                        />
                        <AppText font="instrument-medium" size="xs" style={styles.copyBtnText}>
                          {showCopied ? "Copied!" : "Copy link"}
                        </AppText>
                      </LinearGradient>
                    </Pressable>
                    <Pressable onPress={handleSystemShare} style={styles.shareBtn}>
                      <LinearGradient
                        colors={["rgba(255,255,255,0.1)", "rgba(6, 182, 212, 0.04)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.shareBtnInner}
                      >
                        <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.9)" style={{ marginRight: 6 }} />
                        <AppText font="instrument-regular" size="xs" style={styles.shareBtnText}>
                          Share
                        </AppText>
                      </LinearGradient>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => setShowSharePicker(true)} style={styles.chooseAppLink}>
                    <AppText font="instrument-regular" size="xs" style={styles.chooseAppText}>
                      Copy link or choose app
                    </AppText>
                  </Pressable>
                </ScrollView>
              </KeyboardAvoidingView>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      {visible ? (
        Platform.OS === "android" ? (
          <View style={androidModalRootStyle}>
            <SafeAreaProvider style={styles.safeAreaProviderFill}>
              {modalContent}
            </SafeAreaProvider>
          </View>
        ) : (
          <SafeAreaProvider style={styles.safeAreaProviderFill}>
            {modalContent}
          </SafeAreaProvider>
        )
      ) : null}

      <ShareDestinationPicker
        visible={showSharePicker}
        onClose={() => setShowSharePicker(false)}
        message={inviteMessage}
        url={referralLink}
        modalTitle="Invite to Awakening Soul"
        modalSubtitle="Choose where to share"
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  safeAreaProviderFill: { flex: 1 },
  overlayWrapRoot: {
    flex: 1,
    width: "100%",
  },
  overlayWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  card: {
    maxWidth: 520,
    maxHeight: "88%",
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
  gradient: {
    flex: 1,
    minHeight: 200,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingVertical: 26,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "rgba(255,255,255,0.98)",
    flex: 1,
  },
  closeBtn: {
    padding: 8,
    marginRight: -8,
  },
  sectionLabel: {
    color: "rgba(212, 197, 169, 0.95)",
    marginBottom: 6,
  },
  sectionHint: {
    color: "rgba(255,255,255,0.58)",
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.28)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 15,
    marginBottom: 14,
  },
  lookupBtn: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.45)",
    marginBottom: 16,
  },
  lookupBtnDisabled: {
    opacity: 0.7,
  },
  lookupBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lookupBtnText: {
    color: "#B8D4A8",
  },
  lookupBtnTextDisabled: {
    color: "rgba(168, 201, 154, 0.6)",
  },
  errorMsg: {
    color: "rgba(251, 191, 36, 0.9)",
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.22)",
    padding: 18,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  profileAvatarPlaceholder: {
    backgroundColor: "rgba(135, 174, 115, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: "rgba(255,255,255,0.95)",
  },
  profileLocation: {
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  connectBtn: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.5)",
  },
  connectBtnDisabled: {
    opacity: 0.8,
  },
  connectBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  connectBtnText: {
    color: "#B8D4A8",
  },
  sentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  sentText: {
    color: "rgba(135, 174, 115, 0.95)",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 22,
  },
  shareRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  copyBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
  },
  copyBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  copyBtnText: {
    color: "#B8D4A8",
  },
  shareBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  shareBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  shareBtnText: {
    color: "rgba(255,255,255,0.9)",
  },
  chooseAppLink: {
    paddingVertical: 8,
    alignItems: "center",
  },
  chooseAppText: {
    color: "rgba(255,255,255,0.5)",
  },
})
