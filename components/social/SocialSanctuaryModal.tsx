/**
 * Social Sanctuary Modal (Altar)
 *
 * ARCHITECTURE: "Two Apps in One"
 * - APP_1 (Trial): Notes and Social Sanctuary available when journey starts (first Monday opens)
 * - APP_2 (Lifetime): Full access to all sanctuary features
 *
 * Limited Mode: Only applies to Chakras101 page in trial mode (waiting room context)
 * - In limited mode: Only Anua chat works, community features show previews
 * - In normal mode: All features available (Notes, Social Sanctuary, Anua)
 *
 * Features:
 * - Read reflections from others on the same chakra day
 * - Leave your own reflections
 * - Request Anua's Collective Blessing synthesis
 * - Access Social Sanctuary (full halls view)
 */

import React, { useState, useEffect } from "react"
import {
  View,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import {
  getReflectionsForDay,
  addReflection,
  getRecentReflectionsForSynthesis,
  getTopReflections,
  subscribeToReflections,
  type SanctuaryReflection,
} from "@/src/services/socialSanctuary"
import {
  generateDailyTransmission,
  isWisdomEngineAvailable,
} from "@/src/services/wisdomEngine"
import { moderateReflection } from "@/src/services/sentinel"
import { getUserProfile, type UserProfile } from "@/src/services/profileService"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useRouter } from "expo-router"
import { TreeOfLifeIcon } from "./TreeOfLifeIcon"
import { ProfilePreviewModal } from "@/components/profile/ProfilePreviewModal"

interface SocialSanctuaryModalProps {
  visible: boolean
  onClose: () => void
  chakraDay: number // 0-6 (Monday-Sunday)
  chakraName: string // e.g., "Root Chakra", "Heart Chakra"
  onOpenAnuaChat?: () => void // Callback to open Anua chat
  isLimitedMode?: boolean // When true, only Anua works, others show previews
  onShowCommunityPreview?: (type: "share" | "halls") => void // Callback to show preview modal
  /** APP1 (Trial): false = hide "Share with Community" button. APP2 (Lifetime): true = show it. */
  showShareWithCommunity?: boolean
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]
const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
]

export const SocialSanctuaryModal: React.FC<SocialSanctuaryModalProps> = ({
  visible,
  onClose,
  chakraDay,
  chakraName,
  onOpenAnuaChat,
  isLimitedMode = false,
  onShowCommunityPreview,
  showShareWithCommunity = true,
}) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [view, setView] = useState<"options" | "community">("options")
  const [postChakraDay, setPostChakraDay] = useState(chakraDay) // Which chakra day to post to (synced when chakraDay prop changes)
  const [reflections, setReflections] = useState<SanctuaryReflection[]>([])
  const [topReflections, setTopReflections] = useState<SanctuaryReflection[]>(
    [],
  )
  const [dailyWisdom, setDailyWisdom] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileMap, setProfileMap] = useState<Record<string, UserProfile>>({})
  const [profilePreview, setProfilePreview] = useState<{
    userId: string
    displayName?: string
    avatarUrl?: string
    location?: string
  } | null>(null)

  useEffect(() => {
    setPostChakraDay(chakraDay)
  }, [chakraDay])

  // Load daily wisdom and top reflections when modal opens
  useEffect(() => {
    if (visible) {
      loadDailyWisdom()
      loadTopReflections()
    } else if (!visible) {
      // Reset state when modal closes
      setView("options")
      setMessage("")
      setError(null)
      setTopReflections([])
      setDailyWisdom(null)
      setReflections([])
    }
  }, [visible, chakraDay])

  // Set up real-time subscription for community view (feed follows selected post day)
  useEffect(() => {
    if (visible && view === "community") {
      const unsubscribe = subscribeToReflections(
        postChakraDay,
        (updatedReflections) => {
          setReflections(updatedReflections)
          setIsLoading(false)
          loadProfilesForReflections(updatedReflections)
        },
      )
      setIsLoading(true)
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    }
  }, [visible, view, postChakraDay])

  const loadDailyWisdom = async () => {
    try {
      // Use Wisdom Engine to generate dynamic transmission
      if (isWisdomEngineAvailable()) {
        const transmission = await generateDailyTransmission(chakraDay)
        setDailyWisdom(transmission)
      } else {
        // Fallback: Wisdom Engine not available
        setDailyWisdom(null)
      }
    } catch (err) {
      if (__DEV__) {
        console.error("Error loading daily wisdom:", err)
      }
      // Don't show error to user, just leave dailyWisdom as null
    }
  }

  const loadProfilesForReflections = async (reflections: SanctuaryReflection[]) => {
    const ids = [...new Set(reflections.map((r) => r.userId))]
    const results = await Promise.all(
      ids.map(async (userId) => {
        try {
          const profile = await getUserProfile(userId)
          return profile ? { userId, profile } : null
        } catch {
          return null
        }
      }),
    )
    const next: Record<string, UserProfile> = {}
    results.forEach((r) => {
      if (r) next[r.userId] = r.profile
    })
    setProfileMap((prev) => ({ ...prev, ...next }))
  }

  const loadTopReflections = async () => {
    setIsLoadingHighlights(true)
    try {
      const top = await getTopReflections(chakraDay)
      setTopReflections(top)
      await loadProfilesForReflections(top)
    } catch (err) {
      if (__DEV__) {
        console.error("Error loading top reflections:", err)
      }
    } finally {
      setIsLoadingHighlights(false)
    }
  }

  const loadReflections = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getReflectionsForDay(postChakraDay)
      setReflections(data)
    } catch (err) {
      if (__DEV__) {
        console.error("Error loading reflections:", err)
      }
      setError("Reflections are taking a moment to arrive. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // The Sentinel: Moderate the message before posting
      const moderation = await moderateReflection(message.trim())

      if (!moderation.isApproved) {
        setError(
          moderation.reason ||
            "Your reflection does not meet community guidelines. Please revise and try again.",
        )
        setIsSubmitting(false)
        return
      }

      await addReflection(postChakraDay, message.trim(), isAnonymous)
      setMessage("")
      // Real-time subscription will automatically update the list
      // No need to manually reload
    } catch (err) {
      if (__DEV__) {
        console.error("Error submitting reflection:", err)
      }
      setError(
        "Your reflection is taking a moment to reach the community. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Escape hatch: user must always be able to close (onRequestClose + visible header close).
  // Android: fullScreen + explicit root dimensions so modal content paints (pageSheet can show only dim).
  const { width: winWidth, height: winHeight } = Dimensions.get("window")
  const androidRootStyle =
    Platform.OS === "android"
      ? {
          width: winWidth,
          height: winHeight,
          minWidth: winWidth,
          minHeight: winHeight,
          position: "absolute" as const,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000000",
        }
      : { flex: 1, backgroundColor: "#000000" }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "android" ? "fullScreen" : "pageSheet"}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <GestureHandlerRootView
        style={androidRootStyle}
        {...(Platform.OS === "android" && { unstable_forceActive: true })}
      >
        <View style={{ flex: 1 }} pointerEvents="box-none" collapsable={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header: Android – solid background, elevation/zIndex, large close target (escape hatch). */}
          <View
            collapsable={Platform.OS !== "android"}
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(31, 41, 55, 0.5)",
              ...(Platform.OS === "android" && {
                zIndex: 10,
                elevation: 10,
                backgroundColor: "#000000",
              }),
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <AppText
                font="cormorant-regular"
                size="2xl"
                style={{ color: "#ffffff", letterSpacing: 1.2 }}
              >
                Social Sanctuary
              </AppText>
              <Pressable
                onPress={onClose}
                style={{
                  padding: 8,
                  marginRight: -8,
                  ...(Platform.OS === "android" && {
                    minWidth: 48,
                    minHeight: 48,
                    justifyContent: "center",
                    alignItems: "center",
                  }),
                }}
                accessibilityLabel="Close"
                accessibilityHint="Tap to close Social Sanctuary"
              >
                <Ionicons
                  name="close"
                  size={28}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </Pressable>
            </View>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {DAY_NAMES[chakraDay]} • {chakraName}
            </AppText>
          </View>

          {/* Options View - Stacked buttons vertically */}
          {view === "options" && (
            <ScrollView
              style={{
                flex: 1,
                ...(Platform.OS === "android" && { zIndex: 0, elevation: 0 }),
              }}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 24,
                paddingBottom: 32,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: 24 }}>
                <View style={{ gap: 20 }}>
                  {/* Talk to Anua Button - Parent handles dismiss notes, close sanctuary, open chat */}
                  <Pressable
                    onPress={() => {
                      onOpenAnuaChat?.()
                    }}
                    style={{
                      backgroundColor: "rgba(135, 174, 115, 0.1)",
                      borderWidth: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      borderColor: "rgba(135, 174, 115, 0.3)",
                      borderRadius: 14,
                      padding: 16,
                      shadowColor: "#87AE73",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Image
                      source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: "rgba(135, 174, 115, 0.4)",
                      }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <AppText
                        font="instrument-bold"
                        size="base"
                        style={{ color: "#ffffff", marginBottom: 2 }}
                      >
                        Talk to Anua
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        Connect with your guide
                      </AppText>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </Pressable>

                  {/* Community buttons - Share with Community: APP2 (Lifetime) only; Social Sanctuary: both APP1 and APP2 */}
                  {showShareWithCommunity && (
                    <Pressable
                      onPress={() => {
                        if (isLimitedMode) {
                          if (onShowCommunityPreview) {
                            onShowCommunityPreview("share")
                          }
                        } else {
                          setView("community")
                        }
                      }}
                      style={{
                        opacity: isLimitedMode ? 0.5 : 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                        backgroundColor: "rgba(135, 174, 115, 0.1)",
                        borderWidth: 1,
                        borderColor: isLimitedMode
                          ? "rgba(135, 174, 115, 0.2)"
                          : "rgba(135, 174, 115, 0.3)",
                        borderRadius: 14,
                        padding: 16,
                        shadowColor: "#87AE73",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isLimitedMode ? 0.1 : 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: "rgba(135, 174, 115, 0.2)",
                          borderWidth: 1,
                          borderColor: "rgba(135, 174, 115, 0.4)",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <TreeOfLifeIcon size={32} color="#A8C99A" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          font="instrument-bold"
                          size="base"
                          style={{ color: "#ffffff", marginBottom: 2 }}
                        >
                          Share with Community
                        </AppText>
                        {isLimitedMode ? (
                          <AppText
                            font="instrument-regular"
                            size="sm"
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              fontStyle: "italic",
                            }}
                          >
                            Available once your course begins
                          </AppText>
                        ) : (
                          <AppText
                            font="instrument-regular"
                            size="sm"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            Share your reflections
                          </AppText>
                        )}
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="rgba(255, 255, 255, 0.6)"
                      />
                    </Pressable>
                  )}

                  {/* Social Sanctuary (full halls view) - APP1 and APP2 */}
                  <Pressable
                    onPress={() => {
                      if (isLimitedMode) {
                        if (onShowCommunityPreview) {
                          onShowCommunityPreview("halls")
                        }
                      } else {
                        onClose()
                        router.push("/CommunityHalls")
                      }
                    }}
                    style={{
                      opacity: isLimitedMode ? 0.5 : 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      backgroundColor: "rgba(135, 174, 115, 0.1)",
                      borderWidth: 1,
                      borderColor: isLimitedMode
                        ? "rgba(135, 174, 115, 0.2)"
                        : "rgba(135, 174, 115, 0.3)",
                      borderRadius: 14,
                      padding: 16,
                      shadowColor: "#87AE73",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isLimitedMode ? 0.1 : 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: "#000000",
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.2)",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={require("@/assets/images/Hero_tulip_LOGO_MASTER.png")}
                        style={{
                          width: 44,
                          height: 44,
                          resizeMode: "contain",
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        font="cormorant-regular"
                        size="base"
                        style={{ color: "#ffffff", marginBottom: 2, letterSpacing: 0.5 }}
                      >
                        Social Sanctuary
                      </AppText>
                      {isLimitedMode ? (
                        <AppText
                          font="instrument-regular"
                          size="sm"
                          style={{
                            color: "rgba(255,255,255,0.5)",
                            fontStyle: "italic",
                          }}
                        >
                          Available once your course begins
                        </AppText>
                      ) : (
                        <AppText
                          font="instrument-regular"
                          size="sm"
                          style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          Explore all reflections
                        </AppText>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </Pressable>
                </View>

                {/* Community Highlights - Earth Tones Design */}
                {topReflections.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="heart" size={18} color="#A8C99A" />
                      <AppText
                        font="cormorant-regular"
                        size="lg"
                        style={{ marginLeft: 8, color: "#ffffff", letterSpacing: 0.5 }}
                      >
                        Community Highlights
                      </AppText>
                    </View>
                    <View style={{ gap: 16 }}>
                      {topReflections.slice(0, 2).map((reflection) => (
                        <View
                          key={reflection.id}
                          style={{
                            backgroundColor: "rgba(135, 174, 115, 0.08)",
                            borderWidth: 1,
                            borderColor: "rgba(135, 174, 115, 0.2)",
                            borderRadius: 14,
                            padding: 20,
                            shadowColor: "#87AE73",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 3,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 12,
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              {reflection.isAnonymous ? (
                                <View
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Ionicons name="person" size={14} color="rgba(255,255,255,0.4)" />
                                </View>
                              ) : (
                                <Pressable
                                  onPress={() => {
                                    if (reflection.userId) {
                                      setProfilePreview({
                                        userId: reflection.userId,
                                        displayName: profileMap[reflection.userId]?.displayName,
                                        avatarUrl: profileMap[reflection.userId]?.avatarUrl,
                                        location: profileMap[reflection.userId]?.location,
                                      })
                                    }
                                  }}
                                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                                  hitSlop={8}
                                >
                                  {profileMap[reflection.userId]?.avatarUrl ? (
                                    <Image
                                      source={{ uri: profileMap[reflection.userId].avatarUrl }}
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: "rgba(255,255,255,0.08)",
                                      }}
                                    />
                                  ) : (
                                    <View
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: "rgba(255,255,255,0.1)",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Ionicons name="person" size={14} color="rgba(255,255,255,0.4)" />
                                    </View>
                                  )}
                                </Pressable>
                              )}
                              <View>
                                <AppText
                                  font="instrument-medium"
                                  size="base"
                                  style={{ color: "#D4C5A9" }}
                                >
                                  {reflection.isAnonymous
                                    ? "Anonymous Soul"
                                    : (profileMap[reflection.userId]?.displayName || "Soul")}
                                </AppText>
                                {!reflection.isAnonymous && profileMap[reflection.userId]?.location ? (
                                  <AppText
                                    font="instrument-regular"
                                    size="xs"
                                    style={{ color: "rgba(255,255,255,0.5)", marginTop: 1 }}
                                  >
                                    {profileMap[reflection.userId].location}
                                  </AppText>
                                ) : null}
                              </View>
                            </View>
                            <AppText
                              font="instrument-regular"
                              size="xs"
                              style={{ color: "rgba(255,255,255,0.5)" }}
                            >
                              {formatTimestamp(reflection.timestamp)}
                            </AppText>
                          </View>
                          <AppText
                            font="cormorant-italic"
                            size="base"
                            style={{
                              color: "rgba(255,255,255,0.95)",
                              lineHeight: 26,
                            }}
                          >
                            {reflection.message}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          )}

          {/* Community View - Show reflections and input */}
          {view === "community" && (
            <>
              {/* Back Button */}
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#1f2937",
                }}
              >
                <Pressable
                  onPress={() => setView("options")}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Ionicons name="arrow-back" size={20} color="white" />
                  <AppText
                    font="instrument-medium"
                    size="base"
                    style={{ color: "#ffffff", marginLeft: 8 }}
                  >
                    Back to Options
                  </AppText>
                </Pressable>
              </View>

              <View
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#1f2937",
                }}
              >
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{ color: "#9ca3af", marginBottom: 8 }}
                >
                  Post to this chakra day
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingRight: 16 }}
                >
                  {DAY_NAMES.map((dayName, index) => {
                    const isSelected = postChakraDay === index
                    return (
                      <Pressable
                        key={index}
                        onPress={() => setPostChakraDay(index)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 12,
                          backgroundColor: isSelected
                            ? "rgba(147, 51, 234, 0.25)"
                            : "rgba(255, 255, 255, 0.06)",
                          borderWidth: 1,
                          borderColor: isSelected
                            ? "rgba(147, 51, 234, 0.5)"
                            : "rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <AppText
                          font="instrument-medium"
                          size="xs"
                          style={{
                            color: isSelected
                              ? "#E8E0F5"
                              : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {dayName.slice(0, 3)} · {CHAKRA_NAMES[index]}
                        </AppText>
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>

              {/* How posting works */}
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: "rgba(17, 24, 39, 0.3)",
                  borderBottomWidth: 1,
                  borderBottomColor: "#1f2937",
                }}
              >
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={{
                    color: "#9ca3af",
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  This is how you post to Social Sanctuary. Share below to
                  submit to the shared space; you can reply to others in the
                  halls.
                </AppText>
              </View>

              {/* Reflections List */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  flexGrow: 1,
                  paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={true}
              >
                {isLoading ? (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 80,
                    }}
                  >
                    <ActivityIndicator size="large" color="#9333ea" />
                    <AppText
                      font="instrument-regular"
                      size="base"
                      style={{ color: "#9ca3af", marginTop: 16 }}
                    >
                      Gathering reflections...
                    </AppText>
                  </View>
                ) : error ? (
                  <View style={{ paddingVertical: 32 }}>
                    <AppText
                      font="instrument-regular"
                      size="base"
                      style={{ color: "#f87171", textAlign: "center" }}
                    >
                      {error}
                    </AppText>
                    <Pressable
                      onPress={loadReflections}
                      style={{
                        marginTop: 16,
                        backgroundColor: "rgba(126, 34, 206, 0.5)",
                        borderRadius: 12,
                        padding: 12,
                        alignSelf: "center",
                      }}
                    >
                      <AppText
                        font="instrument-medium"
                        size="base"
                        style={{ color: "#ffffff" }}
                      >
                        Retry
                      </AppText>
                    </Pressable>
                  </View>
                ) : reflections.length === 0 ? (
                  <View style={{ paddingVertical: 80, alignItems: "center" }}>
                    <Ionicons name="people-outline" size={64} color="#4b5563" />
                    <AppText
                      font="instrument-regular"
                      size="base"
                      style={{
                        color: "#9ca3af",
                        marginTop: 16,
                        textAlign: "center",
                      }}
                    >
                      No reflections yet.{"\n"}Be the first to share your
                      experience.
                    </AppText>
                  </View>
                ) : (
                  <View style={{ gap: 16 }}>
                    {reflections.map((reflection) => (
                      <View
                        key={reflection.id}
                        style={{
                          backgroundColor: "rgba(17, 24, 39, 0.5)",
                          borderRadius: 12,
                          padding: 16,
                          borderWidth: 1,
                          borderColor: "#1f2937",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            {reflection.isAnonymous ? (
                              <View
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Ionicons name="person" size={14} color="rgba(255,255,255,0.4)" />
                              </View>
                            ) : (
                              <Pressable
                                onPress={() => {
                                  if (reflection.userId) {
                                    setProfilePreview({
                                      userId: reflection.userId,
                                      displayName: profileMap[reflection.userId]?.displayName,
                                      avatarUrl: profileMap[reflection.userId]?.avatarUrl,
                                      location: profileMap[reflection.userId]?.location,
                                    })
                                  }
                                }}
                                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                                hitSlop={8}
                              >
                                {profileMap[reflection.userId]?.avatarUrl ? (
                                  <Image
                                    source={{ uri: profileMap[reflection.userId].avatarUrl }}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 14,
                                      backgroundColor: "rgba(255,255,255,0.08)",
                                    }}
                                  />
                                ) : (
                                  <View
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 14,
                                      backgroundColor: "rgba(255,255,255,0.1)",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Ionicons name="person" size={14} color="rgba(255,255,255,0.4)" />
                                  </View>
                                )}
                              </Pressable>
                            )}
                            <View>
                              <AppText
                                font="cormorant-italic"
                                size="base"
                                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                              >
                                {reflection.isAnonymous ? "Anonymous Soul" : (profileMap[reflection.userId]?.displayName || "Soul")}
                              </AppText>
                              {!reflection.isAnonymous && profileMap[reflection.userId]?.location ? (
                                <AppText
                                  font="instrument-regular"
                                  size="xs"
                                  style={{ color: "#6b7280", marginTop: 1 }}
                                >
                                  {profileMap[reflection.userId].location}
                                </AppText>
                              ) : null}
                            </View>
                          </View>
                          <AppText
                            font="instrument-regular"
                            size="xs"
                            style={{ color: "#6b7280" }}
                          >
                            {formatTimestamp(reflection.timestamp)}
                          </AppText>
                        </View>
                        {reflection.message.length > 0 ? (
                          <AppText
                            font="cormorant-italic"
                            size="base"
                            style={{ color: "#ffffff", lineHeight: 26 }}
                          >
                            {reflection.message}
                          </AppText>
                        ) : null}
                        {reflection.imageUrl ? (
                          <Image
                            source={{ uri: reflection.imageUrl }}
                            style={{
                              width: "100%",
                              maxWidth: 240,
                              aspectRatio: 4 / 3,
                              borderRadius: 12,
                              marginTop: 8,
                              backgroundColor: "rgba(255,255,255,0.06)",
                            }}
                            resizeMode="cover"
                          />
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Input Section - positioned well above bottom for comfort */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#1f2937",
                  backgroundColor: "#000000",
                  padding: 24,
                  marginBottom: Math.max(insets.bottom, 24) + 48,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Pressable
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Ionicons
                      name={isAnonymous ? "checkbox-outline" : "checkbox"}
                      size={20}
                      color={isAnonymous ? "#9333ea" : "#6b7280"}
                    />
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={{ color: "#9ca3af", marginLeft: 8 }}
                    >
                      Post anonymously
                    </AppText>
                  </Pressable>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  <TextInput
                    value={message}
                    onChangeText={(text) => {
                      const sanitized = text.replace(/[<>]/g, "")
                      if (sanitized.length <= 500) {
                        setMessage(sanitized)
                      }
                    }}
                    placeholder="Share your reflection..."
                    placeholderTextColor="rgba(255, 255, 255, 0.45)"
                    multiline
                    maxLength={500}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      borderRadius: 12,
                      padding: 16,
                      color: "#ffffff",
                      fontSize: 17,
                      lineHeight: 26,
                      fontFamily: "CormorantGaramondItalic",
                      borderWidth: 1,
                      borderColor: "#1f2937",
                      minHeight: 80,
                      textAlignVertical: "top",
                    }}
                    spellCheck={false}
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!message.trim() || isSubmitting}
                    style={{
                      backgroundColor: "#7c3aed",
                      borderRadius: 12,
                      padding: 16,
                      opacity: !message.trim() || isSubmitting ? 0.5 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="send" size={20} color="white" />
                    )}
                  </Pressable>
                </View>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={{ color: "#6b7280", marginTop: 8, textAlign: "right" }}
                >
                  {message.length}/500
                </AppText>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <ProfilePreviewModal
        visible={!!profilePreview}
        onClose={() => setProfilePreview(null)}
        userId={profilePreview?.userId ?? ""}
        displayName={profilePreview?.displayName}
        avatarUrl={profilePreview?.avatarUrl}
        location={profilePreview?.location}
      />
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
