/**
 * Tribe Chat Content – single source of truth
 *
 * Standard iOS/Android chat: primary user (Guest) bubbles on RIGHT, friends on LEFT.
 * Newest messages at bottom, auto-scroll to newest. Input at bottom. Tulip icon for send.
 * Rendered by app/(chakras)/TribeChat.tsx route only.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { useTribeChat, type TribeMessage } from "@/hooks/useTribeChat"
import { useTribeFriends } from "@/hooks/useTribeFriends"
import { useTribeInvitesToMe } from "@/hooks/useTribeInvitesToMe"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { TribeRoomInviteModal } from "@/components/tribe/TribeRoomInviteModal"
import { TribeFriendsMenu } from "@/components/tribe/TribeFriendsMenu"
import { FindFriendsModal } from "@/components/tribe/FindFriendsModal"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { formatDate } from "@/utils/date"
import type { TribeFriend } from "@/types/tribe"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"

const SENDER_NAME = "Guest"

function getSenderGradient(senderName: string): [string, string] {
  const n = senderName.toLowerCase()
  if (n === "system")
    return ["rgba(212, 165, 116, 0.95)", "rgba(180, 140, 100, 0.9)"]
  if (n === SENDER_NAME.toLowerCase() || n === "guest")
    return ["rgba(135, 174, 115, 0.95)", "rgba(107, 142, 90, 0.9)"]
  if (n.includes("a"))
    return ["rgba(180, 140, 100, 0.95)", "rgba(150, 115, 85, 0.9)"]
  if (n.includes("e"))
    return ["rgba(212, 165, 116, 0.95)", "rgba(168, 130, 95, 0.9)"]
  if (n.includes("i"))
    return ["rgba(168, 201, 154, 0.95)", "rgba(135, 174, 115, 0.9)"]
  return ["rgba(135, 174, 115, 0.95)", "rgba(107, 142, 90, 0.9)"]
}

function MessageRow({
  item,
  isPrimaryUser,
}: {
  item: TribeMessage
  isPrimaryUser: boolean
}) {
  const [c1, c2] = getSenderGradient(item.senderName)
  return (
    <View
      style={[
        styles.messageRow,
        isPrimaryUser ? styles.messageRowRight : styles.messageRowLeft,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isPrimaryUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
        ]}
      >
        <LinearGradient
          colors={[c1, c2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.senderNameWrap}
        >
          <AppText
            font="instrument-semibold"
            size="xs"
            style={styles.senderText}
          >
            {item.senderName}
          </AppText>
        </LinearGradient>
        <AppText font="instrument-regular" size="sm" style={styles.messageText}>
          {item.text}
        </AppText>
      </View>
    </View>
  )
}

export interface TribeChatContentProps {
  onClose: () => void
  enabled?: boolean
}

export function TribeChatContent({
  onClose,
  enabled = true,
}: TribeChatContentProps) {
  const courseStartDate = useChakraJourneyStore((s) => s.courseStartDate)
  const invitedFriends = useChakraJourneyStore((s) => s.invitedFriends)
  const addInvitedFriend = useChakraJourneyStore((s) => s.addInvitedFriend)
  const roomId = "global-trial-tribe"
  const { messages, sendMessage, loading, error } = useTribeChat(
    roomId,
    enabled,
  )
  const { connected: firestoreConnected, pending: firestorePending } =
    useTribeFriends(roomId, enabled)
  const {
    pendingInvites,
    accept: acceptTribeInvite,
    decline: declineTribeInvite,
  } = useTribeInvitesToMe(enabled)
  const presenceDisplayName = usePresenceStore((s) => s.displayName)
  const presenceAvatarUrl = usePresenceStore((s) => s.profileImageUri)
  const [inputText, setInputText] = useState("")
  const [sending, setSending] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showFriendsMenu, setShowFriendsMenu] = useState(false)
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const formattedDate = useMemo(() => {
    if (!courseStartDate) return undefined
    return formatDate(new Date(courseStartDate + "T00:00:00"))
  }, [courseStartDate])

  const hasInvited = (invitedFriends?.length ?? 0) > 0
  const hasConnectedFriend = useMemo(
    () =>
      messages.some(
        (m) =>
          m.senderName !== SENDER_NAME &&
          m.senderName.toLowerCase() !== "system",
      ),
    [messages],
  )
  const hasPendingInvitesToMe = pendingInvites.length > 0
  const showDescription =
    !hasInvited && !hasConnectedFriend && !hasPendingInvitesToMe
  const showPending = hasInvited && !hasConnectedFriend && !hasPendingInvitesToMe
  const showChat = hasConnectedFriend

  useEffect(() => {
    if (showChat && messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [showChat, messages.length])

  const connectedList: TribeFriend[] = useMemo(() => {
    const fromMessages = new Set(
      messages
        .filter(
          (m) =>
            m.senderName !== SENDER_NAME &&
            m.senderName.toLowerCase() !== "system",
        )
        .map((m) => m.senderName),
    )
    const fromMsgList: TribeFriend[] = Array.from(fromMessages).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      displayName: name,
      status: "connected" as const,
    }))
    const byId = new Map<string, TribeFriend>()
    firestoreConnected.forEach((f) => byId.set(f.id, f))
    fromMsgList.forEach((f) => byId.set(f.id, f))
    return Array.from(byId.values())
  }, [messages, firestoreConnected])
  const pendingList: TribeFriend[] = useMemo(() => {
    const fromStore = (invitedFriends ?? []).map((name) => ({
      id: name,
      displayName: name === "invited" ? "Pending invite" : name,
      status: "pending" as const,
    }))
    const byId = new Map<string, TribeFriend>()
    firestorePending.forEach((f) => byId.set(f.id, f))
    fromStore.forEach((f) => byId.set(f.id, f))
    return Array.from(byId.values())
  }, [invitedFriends, firestorePending])
  const suggestedList: TribeFriend[] = useMemo(() => [], [])

  const handleInvitePress = useCallback(() => {
    addHapticFeedback(HapticStrength.Medium)
    setShowInviteModal(true)
  }, [])

  const handleInviteSent = useCallback(() => {
    addInvitedFriend("invited")
    setShowInviteModal(false)
  }, [addInvitedFriend])

  const displayNameForSend = presenceDisplayName || SENDER_NAME

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim()
    if (!trimmed || sending) return
    addHapticFeedback(HapticStrength.Light)
    setSending(true)
    const result = await sendMessage(trimmed, displayNameForSend)
    setSending(false)
    if (result.ok) setInputText("")
  }, [inputText, sendMessage, sending, displayNameForSend])

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom", "left", "right"]}
      >
        <ImageBackground
          source={require("@/assets/images/root.png")}
          style={styles.bgImage}
          resizeMode="cover"
          imageStyle={styles.bgImageStyle}
        >
          <LinearGradient
            colors={[
              "rgba(0, 0, 0, 0.85)",
              "rgba(8, 12, 16, 0.88)",
              "rgba(12, 18, 24, 0.9)",
              "rgba(0, 0, 0, 0.85)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.headerBar}>
              <View style={styles.headerLeft}>
                <Pressable
                  onPress={onClose}
                  hitSlop={12}
                  style={styles.backBtn}
                >
                  <Ionicons
                    name="close"
                    size={26}
                    color="rgba(255,255,255,0.9)"
                  />
                </Pressable>
                <View style={styles.titleStack}>
                  <AppText
                    font="instrument-bold"
                    size="2xl"
                    style={styles.titleTribe}
                  >
                    Tribe
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.titleChat}
                  >
                    chat
                  </AppText>
                </View>
              </View>
              <View style={styles.headerRight}>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    useProfileSheetStore.getState().open()
                  }}
                  hitSlop={12}
                  style={styles.menuBtnWrap}
                >
                  <Ionicons
                    name="menu"
                    size={24}
                    color="rgba(255,255,255,0.9)"
                  />
                </Pressable>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    setShowFriendsMenu(true)
                  }}
                  hitSlop={12}
                  style={styles.addBtnWrap}
                >
                  <LinearGradient
                    colors={[
                      "rgba(135, 174, 115, 0.35)",
                      "rgba(6, 182, 212, 0.2)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addBtnGradient}
                  >
                    <Ionicons
                      name="people-outline"
                      size={22}
                      color="rgba(255,255,255,0.95)"
                    />
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            <KeyboardAvoidingView
              style={styles.chatContainer}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
              {hasPendingInvitesToMe && (
                <ScrollView
                  style={styles.emptyScroll}
                  contentContainerStyle={styles.emptyContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AppText
                    font="instrument-bold"
                    size="xl"
                    style={styles.descriptionTitle}
                  >
                    Pending invites
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="base"
                    style={styles.descriptionBody}
                  >
                    Someone invited you to their tribe. Create the connection to
                    join and chat together.
                  </AppText>
                  {pendingInvites.map((inv) => (
                    <View
                      key={inv.id}
                      style={{
                        marginTop: 16,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: "rgba(135, 174, 115, 0.12)",
                        borderWidth: 1,
                        borderColor: "rgba(135, 174, 115, 0.25)",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                          gap: 10,
                        }}
                      >
                        {inv.fromAvatarUrl ? (
                          <Image
                            source={{ uri: inv.fromAvatarUrl }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: "rgba(255,255,255,0.08)",
                            }}
                          />
                        ) : (
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: "rgba(255,255,255,0.1)",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Ionicons
                              name="person"
                              size={20}
                              color="rgba(255,255,255,0.5)"
                            />
                          </View>
                        )}
                        <AppText
                          font="instrument-medium"
                          size="base"
                          style={{ color: "#fff", flex: 1 }}
                        >
                          {inv.fromDisplayName} invited you to their tribe
                        </AppText>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                        }}
                      >
                        <Pressable
                          onPress={async () => {
                            addHapticFeedback(HapticStrength.Medium)
                            const res = await acceptTribeInvite(
                              inv.id,
                              presenceDisplayName || "Soul",
                              presenceAvatarUrl ?? undefined,
                            )
                            if (!res.ok && __DEV__)
                              console.warn("[TribeChat] accept invite:", res.error)
                          }}
                          style={({ pressed }) => ({
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 10,
                            backgroundColor: "rgba(135, 174, 115, 0.35)",
                            alignItems: "center",
                            opacity: pressed ? 0.9 : 1,
                          })}
                        >
                          <AppText
                            font="instrument-semibold"
                            size="sm"
                            style={{ color: "#B8D4A8" }}
                          >
                            Create the Connection
                          </AppText>
                        </Pressable>
                        <Pressable
                          onPress={async () => {
                            addHapticFeedback(HapticStrength.Light)
                            await declineTribeInvite(inv.id)
                          }}
                          style={({ pressed }) => ({
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            backgroundColor: "rgba(255,255,255,0.08)",
                            justifyContent: "center",
                            opacity: pressed ? 0.9 : 1,
                          })}
                        >
                          <AppText
                            font="instrument-regular"
                            size="sm"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            Decline
                          </AppText>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              {showDescription && (
                <ScrollView
                  style={styles.emptyScroll}
                  contentContainerStyle={styles.emptyContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AppText
                    font="instrument-bold"
                    size="xl"
                    style={styles.descriptionTitle}
                  >
                    The Shared Experience
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="base"
                    style={styles.descriptionBody}
                  >
                    Connect with friends on the same 7-day journey. Share
                    insights, hold space for each other, and grow together.
                  </AppText>
                  {error && (
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.errorText}
                    >
                      We&apos;re having trouble connecting. You can still invite
                      friends!
                    </AppText>
                  )}
                  <LinearGradient
                    colors={[
                      "rgba(135, 174, 115, 0.15)",
                      "rgba(212, 165, 116, 0.2)",
                      "rgba(6, 182, 212, 0.15)",
                      "rgba(135, 174, 115, 0.1)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.colorLines}
                  />
                  <Pressable
                    onPress={handleInvitePress}
                    style={({ pressed }) => [
                      styles.inviteBtnWrap,
                      pressed && styles.inviteBtnPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(135, 174, 115, 0.4)",
                        "rgba(212, 165, 116, 0.2)",
                        "rgba(6, 182, 212, 0.1)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.inviteBtn}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color="rgba(255,255,255,0.95)"
                        style={{ marginRight: 8 }}
                      />
                      <AppText
                        font="instrument-semibold"
                        size="base"
                        style={styles.inviteBtnText}
                      >
                        Invite a Friend
                      </AppText>
                    </LinearGradient>
                  </Pressable>
                </ScrollView>
              )}

              {showPending && (
                <ScrollView
                  style={styles.emptyScroll}
                  contentContainerStyle={styles.emptyContent}
                  showsVerticalScrollIndicator={false}
                >
                  <AppText
                    font="instrument-bold"
                    size="xl"
                    style={styles.descriptionTitle}
                  >
                    The Shared Experience
                  </AppText>
                  <AppText
                    font="instrument-regular"
                    size="base"
                    style={styles.descriptionBody}
                  >
                    Your invite is pending. When your friend joins Soul School,
                    you&apos;ll see them here and can start chatting.
                  </AppText>
                  <LinearGradient
                    colors={[
                      "rgba(135, 174, 115, 0.15)",
                      "rgba(212, 165, 116, 0.2)",
                      "rgba(6, 182, 212, 0.15)",
                      "rgba(135, 174, 115, 0.1)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.colorLines}
                  />
                  <Pressable
                    onPress={handleInvitePress}
                    style={({ pressed }) => [
                      styles.inviteBtnWrap,
                      pressed && styles.inviteBtnPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(135, 174, 115, 0.25)",
                        "rgba(212, 165, 116, 0.15)",
                        "rgba(6, 182, 212, 0.08)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.inviteBtn}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color="rgba(255,255,255,0.9)"
                        style={{ marginRight: 8 }}
                      />
                      <AppText
                        font="instrument-medium"
                        size="sm"
                        style={styles.inviteBtnText}
                      >
                        Invite Another
                      </AppText>
                    </LinearGradient>
                  </Pressable>
                </ScrollView>
              )}

              {showChat && (
                <ScrollView
                  ref={scrollRef}
                  style={styles.messageScroll}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() =>
                    scrollRef.current?.scrollToEnd({ animated: false })
                  }
                >
                  {loading ? (
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.loadingText}
                    >
                      Loading…
                    </AppText>
                  ) : (
                    messages.map((item) => (
                      <MessageRow
                        key={item.id}
                        item={item}
                        isPrimaryUser={item.senderName === (presenceDisplayName || SENDER_NAME)}
                      />
                    ))
                  )}
                </ScrollView>
              )}

              {showChat && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Message…"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline={false}
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    spellCheck={false}
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={handleSend}
                    disabled={!inputText.trim() || sending}
                    style={({ pressed }) => [
                      styles.sendBtn,
                      pressed && styles.sendBtnPressed,
                      (!inputText.trim() || sending) && styles.sendBtnDisabled,
                    ]}
                  >
                    {sending ? (
                      <AppText
                        font="instrument-semibold"
                        size="sm"
                        style={styles.sendBtnText}
                      >
                        …
                      </AppText>
                    ) : (
                      <Image
                        source={require("@/assets/images/Hero_tulip_LOGO_MASTER.png")}
                        style={styles.tulipIcon}
                        resizeMode="contain"
                      />
                    )}
                  </Pressable>
                </View>
              )}

              {(showDescription || showPending) && (
                <View style={styles.footerAdd}>
                  <Pressable
                    onPress={handleInvitePress}
                    style={({ pressed }) => [
                      styles.footerAddBtnWrap,
                      pressed && styles.footerAddBtnPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(135, 174, 115, 0.2)",
                        "rgba(6, 182, 212, 0.08)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.footerAddBtn}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color="rgba(168, 201, 154, 0.95)"
                      />
                      <AppText
                        font="instrument-medium"
                        size="sm"
                        style={styles.footerAddText}
                      >
                        Add someone & invite to connect
                      </AppText>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </KeyboardAvoidingView>
          </LinearGradient>
        </ImageBackground>
      </SafeAreaView>

      <TribeRoomInviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        startDate={formattedDate}
        courseStartDateISO={courseStartDate ?? undefined}
        onInviteSent={handleInviteSent}
        onFindFriends={() => {
          setShowInviteModal(false)
          setShowFindFriendsModal(true)
        }}
      />
      <FindFriendsModal
        visible={showFindFriendsModal}
        onClose={() => setShowFindFriendsModal(false)}
        startDate={formattedDate}
        courseStartDateISO={courseStartDate ?? undefined}
      />
      <TribeFriendsMenu
        visible={showFriendsMenu}
        onClose={() => setShowFriendsMenu(false)}
        onInviteMore={() => setShowInviteModal(true)}
        onFindFriends={() => {
          setShowFriendsMenu(false)
          setShowFindFriendsModal(true)
        }}
        connected={connectedList}
        pending={pendingList}
        suggested={suggestedList}
        currentDisplayName={presenceDisplayName || SENDER_NAME}
      />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  bgImage: { flex: 1 },
  bgImageStyle: { opacity: 0.12 },
  gradient: { flex: 1, padding: 16 },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 12,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(135, 174, 115, 0.15)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 6 },
  titleStack: { flexDirection: "column", alignItems: "flex-start", gap: 0 },
  titleTribe: {
    color: "rgba(255, 255, 255, 0.98)",
    letterSpacing: 1,
    lineHeight: 32,
  },
  titleChat: {
    color: "rgba(168, 201, 154, 0.85)",
    letterSpacing: 2,
    marginTop: -2,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuBtnWrap: { padding: 8 },
  addBtnWrap: { borderRadius: 22, overflow: "hidden" },
  addBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
  },
  chatContainer: { flex: 1, minHeight: 180 },
  emptyScroll: { flex: 1 },
  emptyContent: { flexGrow: 1, paddingVertical: 24, paddingHorizontal: 8 },
  descriptionTitle: {
    color: "rgba(255, 255, 255, 0.98)",
    lineHeight: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  descriptionBody: {
    color: "rgba(255, 255, 255, 0.82)",
    lineHeight: 26,
    marginBottom: 24,
    textAlign: "center",
  },
  colorLines: {
    height: 3,
    marginVertical: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  errorText: {
    color: "rgba(251, 191, 36, 0.95)",
    lineHeight: 22,
    marginBottom: 20,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    paddingVertical: 24,
  },
  inviteBtnWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    alignSelf: "center",
    shadowColor: "rgba(6, 182, 212, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  inviteBtnPressed: { opacity: 0.85 },
  inviteBtnText: { color: "rgba(255, 255, 255, 0.95)" },
  messageScroll: { flex: 1 },
  listContent: { paddingVertical: 8, paddingBottom: 16 },
  messageRow: { marginBottom: 14, paddingHorizontal: 8, flexDirection: "row" },
  messageRowLeft: { justifyContent: "flex-start" },
  messageRowRight: { justifyContent: "flex-end" },
  messageBubble: {
    maxWidth: "80%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  messageBubbleLeft: {
    borderColor: "rgba(135, 174, 115, 0.25)",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    borderColor: "rgba(168, 201, 154, 0.3)",
    backgroundColor: "rgba(135, 174, 115, 0.12)",
    borderBottomRightRadius: 4,
  },
  senderNameWrap: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  senderText: { color: "rgba(255, 255, 255, 0.98)" },
  messageText: { color: "rgba(255, 255, 255, 0.98)", marginTop: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(135, 174, 115, 0.25)",
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.3)",
    color: "#fff",
    fontSize: 16,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(135, 174, 115, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  tulipIcon: { width: 28, height: 28 },
  sendBtnPressed: { opacity: 0.8 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: "rgba(255, 255, 255, 0.95)" },
  footerAdd: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(135, 174, 115, 0.2)",
  },
  footerAddBtnWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    shadowColor: "rgba(6, 182, 212, 0.15)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  footerAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  footerAddBtnPressed: { opacity: 0.8 },
  footerAddText: { color: "rgba(135, 174, 115, 0.95)" },
})
