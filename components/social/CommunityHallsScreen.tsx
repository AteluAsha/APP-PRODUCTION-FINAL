/**
 * Social Sanctuary (Community Halls) Screen
 *
 * ARCHITECTURE: "Two Apps in One"
 * - APP_1 (Trial): Available when journey starts (first Monday opens)
 * - APP_2 (Lifetime): Always available
 *
 * A holistic, safe space for community reflections with nested replies
 * Features: Nested replies (like YouTube), expand/collapse threads, earth tones
 */

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native"
import Animated, { FadeIn, FadeOut, Easing } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { AppText } from "@/components/AppText"
import {
  getReflectionsForDay,
  getReplies,
  addReflection,
  subscribeToReflections,
  reactToComment,
  type SanctuaryReflection,
} from "@/src/services/socialSanctuary"
import { uploadCommentImage } from "@/src/services/imageUpload"
import { getUserId } from "@/src/services/socialSanctuary"
import { moderateReflection } from "@/src/services/sentinel"
import { ImagePickerButton } from "./ImagePickerButton"
import { chakraContent } from "@/constants/chakras/content"
import { DAY_TO_CHAKRA } from "@/utils/chakraMapping"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import {
  DAY_NAMES,
  CHAKRA_NAMES,
  getDayName,
  getChakraName,
  getChakraColor,
  getChakraImage,
} from "@/constants/chakras/chakraConstants"
import { useJourneyNotesStore } from "@/hooks/useJourneyNotesStore"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { ReflectionDiaryModal } from "./ReflectionDiaryModal"
import { getUserProfile, type UserProfile } from "@/src/services/profileService"
import { LinearGradient } from "expo-linear-gradient"
import { ShareAppModal } from "@/components/sharing/ShareAppModal"
import { ENABLE_QR_CODE_SHARING } from "@/constants/sharing"

// Chakra colors for day selector tabs - Softer, calmer borders and glows
const CHAKRA_COLORS = [
  {
    bg: "rgba(220, 38, 38, 0.25)",
    border: "rgba(220, 38, 38, 0.28)",
    text: "#DC2626",
    glow: "rgba(220, 38, 38, 0.2)",
    frame: "rgba(220, 38, 38, 0.12)",
  }, // Root - Crimson red glows and frames
  {
    bg: "rgba(234, 88, 12, 0.25)",
    border: "rgba(234, 88, 12, 0.28)",
    text: "#EA580C",
    glow: "rgba(234, 88, 12, 0.2)",
    frame: "rgba(234, 88, 12, 0.12)",
  }, // Sacral - Terracotta orange hues
  {
    bg: "rgba(252, 211, 77, 0.25)",
    border: "rgba(252, 211, 77, 0.28)",
    text: "#FCD34D",
    glow: "rgba(252, 211, 77, 0.2)",
    frame: "rgba(252, 211, 77, 0.12)",
  }, // Solar Plexus - Sun fire gold
  {
    bg: "rgba(16, 185, 129, 0.25)",
    border: "rgba(16, 185, 129, 0.28)",
    text: "#10B981",
    glow: "rgba(16, 185, 129, 0.2)",
    frame: "rgba(16, 185, 129, 0.12)",
  }, // Heart - Emerald green
  {
    bg: "rgba(59, 130, 246, 0.25)",
    border: "rgba(59, 130, 246, 0.28)",
    text: "#3B82F6",
    glow: "rgba(59, 130, 246, 0.2)",
    frame: "rgba(59, 130, 246, 0.12)",
  }, // Throat - Cyan blue
  {
    bg: "rgba(99, 102, 241, 0.25)",
    border: "rgba(99, 102, 241, 0.28)",
    text: "#6366F1",
    glow: "rgba(99, 102, 241, 0.2)",
    frame: "rgba(99, 102, 241, 0.12)",
  }, // Third Eye - Deep purple and indigo
  {
    bg: "rgba(147, 51, 234, 0.25)",
    border: "rgba(147, 51, 234, 0.28)",
    text: "#9333EA",
    glow: "rgba(147, 51, 234, 0.2)",
    frame: "rgba(255, 255, 255, 0.08)",
  }, // Crown - White light, violet and silver (subtle)
]

// Earth tone colors for holistic, safe feeling - more transparent and alive
const EARTH_COLORS = {
  background: "#000000", // Pure black
  card: "rgba(255, 255, 255, 0.05)", // Very transparent white
  cardBorder: "rgba(255, 255, 255, 0.1)", // Subtle border
  text: "rgba(255, 255, 255, 0.9)", // Soft white
  textSecondary: "rgba(255, 255, 255, 0.6)", // Muted white
  accent: "#87AE73", // Sage green
  accentLight: "#A8C99A", // Light sage
  accentDark: "#6B8E5A", // Dark sage
  highlight: "#D4A574", // Warm earth tone
}

interface CommentWithReplies extends SanctuaryReflection {
  replies?: SanctuaryReflection[]
  showReplies?: boolean
  isLoadingReplies?: boolean
}

interface CommunityHallsScreenProps {
  initialDay?: number
}

export const CommunityHallsScreen: React.FC<CommunityHallsScreenProps> = ({
  initialDay,
}) => {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<number | "global">(
    initialDay ?? "global",
  )
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPreparingMessage, setShowPreparingMessage] = useState(true)

  // Show healing message briefly, then fade out (somatic timing - like a breath)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreparingMessage(false)
    }, 2000) // 2 seconds - enough to read and soften, not too long
    return () => clearTimeout(timer)
  }, [])
  const [message, setMessage] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Anonymous option removed - all posts are now attributed
  const isAnonymous = false
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const reflectionDiaryRef = useRef<BottomSheetModal>(null)
  const [selectedReflection, setSelectedReflection] = useState<{
    id: string
    chakraDay: number
    chakraName: string
  } | null>(null)
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {},
  )
  const [showShareModal, setShowShareModal] = useState(false)

  // Reaction system state - tracks user's reaction to each comment
  const [commentReactions, setCommentReactions] = useState<
    Record<string, "more" | "neutral" | "less">
  >({})
  const [hasSeenReactionTooltip, setHasSeenReactionTooltip] = useState(false)
  const [showReactionTooltip, setShowReactionTooltip] = useState<{
    commentId: string
    reactionType: "more" | "neutral" | "less"
  } | null>(null) // Store which reaction was clicked for tooltip
  const [isReacting, setIsReacting] = useState<Record<string, boolean>>({}) // Track loading state per comment

  // Load comments for selected day
  useEffect(() => {
    loadComments()

    // If no comments exist, populate placeholders (dev mode only)
    if (__DEV__) {
      setTimeout(async () => {
        try {
          // Dynamically import to avoid blocking
          const { populatePlaceholders } = await import(
            "@/src/services/communityPlaceholders"
          )
          await populatePlaceholders()
          // Reload comments after populating
          await loadComments()
        } catch (error) {
          // Silent fail
        }
      }, 1000)
    }
  }, [selectedDay])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      let loadedComments: CommentWithReplies[] = []

      if (selectedDay === "global") {
        // Load from all days
        for (let day = 0; day < 7; day++) {
          try {
            const dayComments = await getReflectionsForDay(day, 50)
            loadedComments.push(
              ...dayComments.map((c) => ({
                ...c,
                replies: [],
                showReplies: false,
              })),
            )
          } catch (err) {
            if (__DEV__) {
              console.error(`Error loading comments for day ${day}:`, err)
            }
          }
        }
        loadedComments.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
        )
      } else {
        const dayComments = await getReflectionsForDay(selectedDay, 50)
        loadedComments = dayComments.map((c) => ({
          ...c,
          replies: [],
          showReplies: false,
        }))
      }

      setComments(loadedComments)

      // Load profile images for all unique user IDs
      const uniqueUserIds = new Set(loadedComments.map((c) => c.userId))
      const profilePromises = Array.from(uniqueUserIds).map(async (userId) => {
        try {
          const profile = await getUserProfile(userId)
          if (profile) {
            return { userId, profile }
          }
        } catch (err) {
          // Silent fail
        }
        return null
      })

      const profiles = await Promise.all(profilePromises)
      const profileMap: Record<string, UserProfile> = {}
      profiles.forEach((result) => {
        if (result) {
          profileMap[result.userId] = result.profile
        }
      })
      setUserProfiles(profileMap)
    } catch (err) {
      if (__DEV__) {
        console.error("Error loading comments:", err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadReplies = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, isLoadingReplies: true } : c,
      ),
    )

    try {
      const replies = await getReplies(commentId)
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies, showReplies: true, isLoadingReplies: false }
            : c,
        ),
      )
    } catch (err) {
      if (__DEV__) {
        console.error("Error loading replies:", err)
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, isLoadingReplies: false } : c,
        ),
      )
    }
  }

  const toggleReplies = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return

    if (comment.showReplies) {
      // Collapse
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, showReplies: false } : c,
        ),
      )
    } else {
      // Expand - load replies if not loaded
      if (!comment.replies || comment.replies.length === 0) {
        loadReplies(commentId)
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, showReplies: true } : c,
          ),
        )
      }
    }
  }

  const handleSubmit = async () => {
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      // Moderate the message
      const moderation = await moderateReflection(message.trim())
      if (!moderation.isApproved) {
        setIsSubmitting(false)
        return
      }

      const chakraDay = selectedDay === "global" ? 0 : selectedDay
      await addReflection(chakraDay, message.trim(), isAnonymous)
      setMessage("")
      await loadComments() // Reload to show new comment
    } catch (err) {
      if (__DEV__) {
        console.error("Error submitting comment:", err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!replyMessage.trim()) return

    setIsSubmitting(true)
    try {
      const moderation = await moderateReflection(replyMessage.trim())
      if (!moderation.isApproved) {
        setIsSubmitting(false)
        return
      }

      const chakraDay = selectedDay === "global" ? 0 : selectedDay
      await addReflection(chakraDay, replyMessage.trim(), isAnonymous, parentId)
      setReplyMessage("")
      setReplyingTo(null)
      // Reload replies for this comment
      await loadReplies(parentId)
    } catch (err) {
      if (__DEV__) {
        console.error("Error submitting reply:", err)
      }
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

  const CommentItem = ({
    comment,
    level = 0,
  }: {
    comment: CommentWithReplies
    level?: number
  }) => {
    const isReply = level > 0
    const hasReplies =
      (comment.replyCount || 0) > 0 ||
      (comment.replies && comment.replies.length > 0)
    const chakra = DAY_TO_CHAKRA[comment.chakraDay]
    const chakraColor = CHAKRA_COLORS[comment.chakraDay]
    const chakraName = CHAKRA_NAMES[comment.chakraDay]
    const userProfile = userProfiles[comment.userId]

    // Use selected day's chakra color for theme (when viewing global, use comment's own chakra color)
    const themeChakraColor =
      selectedDay === "global"
        ? chakraColor
        : typeof selectedDay === "number"
          ? CHAKRA_COLORS[selectedDay]
          : chakraColor

    // Get current user's reaction for this comment
    const currentUserReaction = comment.id ? commentReactions[comment.id] : null
    const reactions = comment.reactions || { more: 0, neutral: 0, less: 0 }

    const handleFeatherPress = () => {
      setSelectedReflection({
        id: comment.id || "",
        chakraDay: comment.chakraDay,
        chakraName: chakraName,
      })
      reflectionDiaryRef.current?.present()
      addHapticFeedback(HapticStrength.Light)
    }

    const handleReaction = async (
      reactionType: "more" | "neutral" | "less",
    ) => {
      if (!comment.id) return

      addHapticFeedback(HapticStrength.Light)

      // Show tooltip on first interaction if not seen - store the reaction type clicked
      if (!hasSeenReactionTooltip) {
        setShowReactionTooltip({ commentId: comment.id, reactionType })
        setHasSeenReactionTooltip(true)
        setTimeout(() => setShowReactionTooltip(null), 3000) // Hide after 3 seconds
      }

      const previousReaction = currentUserReaction
      const newReaction =
        previousReaction === reactionType ? null : reactionType

      // Set loading state for this comment
      setIsReacting((prev) => ({ ...prev, [comment.id!]: true }))

      // Optimistically update UI and reaction counts
      setCommentReactions((prev) => {
        const updated = { ...prev }
        if (newReaction) {
          updated[comment.id!] = newReaction
        } else {
          delete updated[comment.id!]
        }
        return updated
      })

      // Update comment reactions count optimistically
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === comment.id) {
            const currentReactions = c.reactions || {
              more: 0,
              neutral: 0,
              less: 0,
            }
            const updatedReactions = { ...currentReactions }

            // Remove previous reaction count
            if (previousReaction) {
              updatedReactions[previousReaction] = Math.max(
                0,
                updatedReactions[previousReaction] - 1,
              )
            }

            // Add new reaction count
            if (newReaction) {
              updatedReactions[newReaction] =
                (updatedReactions[newReaction] || 0) + 1
            }

            return { ...c, reactions: updatedReactions }
          }
          return c
        }),
      )

      // Update in Firebase (without reloading all comments)
      try {
        if (newReaction) {
          await reactToComment(
            comment.id,
            newReaction,
            previousReaction || undefined,
          )
        } else {
          // Removing reaction
          await reactToComment(comment.id, reactionType, reactionType)
        }
      } catch (error) {
        // Revert on error
        setCommentReactions((prev) => {
          const updated = { ...prev }
          if (previousReaction) {
            updated[comment.id!] = previousReaction
          } else {
            delete updated[comment.id!]
          }
          return updated
        })
        // Revert reaction counts
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === comment.id) {
              const currentReactions = c.reactions || {
                more: 0,
                neutral: 0,
                less: 0,
              }
              const updatedReactions = { ...currentReactions }

              // Revert: add back previous, remove new
              if (previousReaction) {
                updatedReactions[previousReaction] =
                  (updatedReactions[previousReaction] || 0) + 1
              }
              if (newReaction) {
                updatedReactions[newReaction] = Math.max(
                  0,
                  updatedReactions[newReaction] - 1,
                )
              }

              return { ...c, reactions: updatedReactions }
            }
            return c
          }),
        )
        if (__DEV__) {
          console.error("Error reacting to comment:", error)
        }
      } finally {
        setIsReacting((prev) => {
          const updated = { ...prev }
          delete updated[comment.id!]
          return updated
        })
      }
    }

    return (
      <View style={{ marginLeft: level * 12, marginBottom: 12 }}>
        <View
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: chakraColor.frame || `${chakraColor.text}18`,
            overflow: "hidden",
          }}
        >
          {/* Gradient background overlay with chakra color hue */}
          <LinearGradient
            colors={[
              `${chakraColor.text}12`, // More visible chakra color hue
              `${chakraColor.text}06`,
              "rgba(0, 0, 0, 0.2)",
              "rgba(0, 0, 0, 0.4)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />

          {/* Comment Header - Minimal: Only timestamp and leaf icon */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            {selectedDay === "global" && !isReply && (
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                  backgroundColor: `${chakraColor.text}20`,
                }}
              >
                <AppText
                  font="instrument-regular"
                  style={{ color: chakraColor.text, fontSize: 10 }}
                >
                  {getDayName(comment.chakraDay).slice(0, 3)}
                </AppText>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <AppText
              font="instrument-regular"
              style={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: 11,
                marginRight: 8,
              }}
            >
              {formatTimestamp(comment.timestamp)}
            </AppText>
            {/* Feather icon for personal diary */}
            <Pressable
              onPress={handleFeatherPress}
              style={{
                padding: 4,
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              <Ionicons
                name="leaf-outline"
                size={14}
                color="rgba(255, 255, 255, 0.4)"
              />
            </Pressable>
          </View>

          {/* Comment Message - Hero Text - Large and Clear */}
          <AppText
            font="cormorant-regular"
            style={{
              color: "rgba(255, 255, 255, 0.98)",
              fontSize: 16,
              lineHeight: 26,
              marginBottom: 10,
            }}
          >
            {comment.message}
          </AppText>

          {/* Commenter Name and Reply Button - Same Line */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <AppText
              font="instrument-regular"
              style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 12 }}
            >
              {userProfile?.displayName || "Soul"}
            </AppText>
            <Pressable
              onPress={() => {
                if (replyingTo === comment.id) {
                  setReplyingTo(null)
                  setReplyMessage("")
                } else {
                  setReplyingTo(comment.id || null)
                }
                addHapticFeedback(HapticStrength.Light)
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor:
                  replyingTo === comment.id
                    ? `${themeChakraColor.text}20`
                    : "rgba(255, 255, 255, 0.05)",
              }}
            >
              <Ionicons
                name={
                  replyingTo === comment.id ? "close" : "chatbubble-outline"
                }
                size={12}
                color={
                  replyingTo === comment.id
                    ? themeChakraColor.text
                    : "rgba(255, 255, 255, 0.6)"
                }
              />
              <AppText
                font="instrument-regular"
                style={{
                  color:
                    replyingTo === comment.id
                      ? themeChakraColor.text
                      : "rgba(255, 255, 255, 0.6)",
                  fontSize: 11,
                }}
              >
                {replyingTo === comment.id ? "Cancel" : "Reply"}
              </AppText>
            </Pressable>
          </View>

          {/* Reaction Buttons - Heart (More), Equals (Neutral), Minus (Less) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              position: "relative",
            }}
          >
            {/* Heart/Plus - More of this energy */}
            <Pressable
              onPress={() => handleReaction("more")}
              disabled={isSubmitting || isReacting[comment.id || ""]}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor:
                  currentUserReaction === "more"
                    ? "rgba(220, 38, 38, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                borderWidth: currentUserReaction === "more" ? 1 : 0,
                borderColor: "rgba(220, 38, 38, 0.4)",
                opacity: isReacting[comment.id || ""] ? 0.6 : 1,
              }}
            >
              <Ionicons
                name="heart"
                size={14}
                color={
                  currentUserReaction === "more"
                    ? "#DC2626"
                    : "rgba(255, 255, 255, 0.5)"
                }
              />
              {reactions.more > 0 && (
                <AppText
                  font="instrument-regular"
                  style={{
                    color:
                      currentUserReaction === "more"
                        ? "#DC2626"
                        : "rgba(255, 255, 255, 0.5)",
                    fontSize: 11,
                  }}
                >
                  {reactions.more}
                </AppText>
              )}
            </Pressable>

            {/* Equals - Neutral */}
            <Pressable
              onPress={() => handleReaction("neutral")}
              disabled={isSubmitting || isReacting[comment.id || ""]}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor:
                  currentUserReaction === "neutral"
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(255, 255, 255, 0.05)",
                borderWidth: currentUserReaction === "neutral" ? 1 : 0,
                borderColor: "rgba(255, 255, 255, 0.3)",
                opacity: isReacting[comment.id || ""] ? 0.6 : 1,
              }}
            >
              <AppText
                font="instrument-bold"
                style={{
                  color:
                    currentUserReaction === "neutral"
                      ? "#FFFFFF"
                      : "rgba(255, 255, 255, 0.5)",
                  fontSize: 14,
                }}
              >
                =
              </AppText>
              {reactions.neutral > 0 && (
                <AppText
                  font="instrument-regular"
                  style={{
                    color:
                      currentUserReaction === "neutral"
                        ? "#FFFFFF"
                        : "rgba(255, 255, 255, 0.5)",
                    fontSize: 11,
                  }}
                >
                  {reactions.neutral}
                </AppText>
              )}
            </Pressable>

            {/* Minus - Less of this energy */}
            <Pressable
              onPress={() => handleReaction("less")}
              disabled={isSubmitting || isReacting[comment.id || ""]}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor:
                  currentUserReaction === "less"
                    ? "rgba(107, 114, 128, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                borderWidth: currentUserReaction === "less" ? 1 : 0,
                borderColor: "rgba(107, 114, 128, 0.4)",
                opacity: isReacting[comment.id || ""] ? 0.6 : 1,
              }}
            >
              <Ionicons
                name="remove"
                size={14}
                color={
                  currentUserReaction === "less"
                    ? "#6B7280"
                    : "rgba(255, 255, 255, 0.5)"
                }
              />
              {reactions.less > 0 && (
                <AppText
                  font="instrument-regular"
                  style={{
                    color:
                      currentUserReaction === "less"
                        ? "#6B7280"
                        : "rgba(255, 255, 255, 0.5)",
                    fontSize: 11,
                  }}
                >
                  {reactions.less}
                </AppText>
              )}
            </Pressable>

            {/* Tooltip on first interaction - Fixed to show based on clicked reaction, not current state */}
            {showReactionTooltip?.commentId === comment.id && (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: -50,
                  backgroundColor: "rgba(0, 0, 0, 0.95)",
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  zIndex: 1000,
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 10,
                }}
              >
                <AppText
                  font="instrument-regular"
                  style={{
                    color: "#FFFFFF",
                    fontSize: 11,
                    textAlign: "center",
                    lineHeight: 16,
                  }}
                >
                  {showReactionTooltip?.reactionType === "more" &&
                    "Heart means you want more of this energy"}
                  {showReactionTooltip?.reactionType === "neutral" &&
                    "Equals means you are neutral"}
                  {showReactionTooltip?.reactionType === "less" &&
                    "Minus means you want less of this energy"}
                </AppText>
              </View>
            )}
          </View>

          {/* Action Buttons - Compact Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 4,
            }}
          >
            {/* View Replies Button */}
            {hasReplies && (
              <Pressable
                onPress={() => {
                  if (comment.id) {
                    toggleReplies(comment.id)
                    addHapticFeedback(HapticStrength.Light)
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  backgroundColor: comment.showReplies
                    ? `${themeChakraColor.text}15`
                    : "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Ionicons
                  name={comment.showReplies ? "chevron-up" : "chevron-down"}
                  size={12}
                  color={
                    comment.showReplies
                      ? themeChakraColor.text
                      : "rgba(255, 255, 255, 0.6)"
                  }
                />
                <AppText
                  font="instrument-regular"
                  style={{
                    color: comment.showReplies
                      ? themeChakraColor.text
                      : "rgba(255, 255, 255, 0.6)",
                    fontSize: 12,
                  }}
                >
                  {comment.replyCount || comment.replies?.length || 0}{" "}
                  {comment.replyCount === 1 ? "reply" : "replies"}
                </AppText>
              </Pressable>
            )}
          </View>

          {/* Reply Input - Inline and Easy */}
          {replyingTo === comment.id && (
            <View
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 0.5,
                borderTopColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <TextInput
                value={replyMessage}
                onChangeText={setReplyMessage}
                placeholder="Write a reply..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline
                maxLength={500}
                autoFocus
                spellCheck={false}
                autoCorrect={false}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  padding: 12,
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: 15,
                  minHeight: 70,
                  borderWidth: 1,
                  borderColor: `${themeChakraColor.text}20`,
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Pressable
                  onPress={() => {
                    setReplyingTo(null)
                    setReplyMessage("")
                    addHapticFeedback(HapticStrength.Light)
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <AppText
                    style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}
                  >
                    Cancel
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (comment.id) {
                      handleReplySubmit(comment.id)
                      addHapticFeedback(HapticStrength.Medium)
                    }
                  }}
                  disabled={!replyMessage.trim() || isSubmitting}
                  style={{
                    backgroundColor: themeChakraColor.text,
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 8,
                    opacity: !replyMessage.trim() || isSubmitting ? 0.5 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <AppText
                      style={{
                        color: "white",
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      Send
                    </AppText>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Loading Replies */}
          {comment.isLoadingReplies && (
            <View style={{ marginTop: 12, alignItems: "center", padding: 12 }}>
              <ActivityIndicator size="small" color={EARTH_COLORS.accent} />
            </View>
          )}

          {/* Replies List */}
          {comment.showReplies &&
            comment.replies &&
            comment.replies.length > 0 && (
              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: EARTH_COLORS.cardBorder,
                }}
              >
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    level={level + 1}
                  />
                ))}
              </View>
            )}
        </View>
      </View>
    )
  }

  // All (global) uses white-violet light; individual days use their chakra color
  const ALL_FRAME = {
    text: "#E8E0F5",
    glow: "#E6DCFF",
    frame: "rgba(240, 235, 255, 0.12)",
  }
  const borderChakraColor =
    selectedDay === "global" ? ALL_FRAME : CHAKRA_COLORS[selectedDay]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: EARTH_COLORS.background }}>
      {/* Soft chakra border - thin, calming edge around screen */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: 1,
          borderColor: `${borderChakraColor.text}50`,
          borderRadius: 0,
          zIndex: 0,
          shadowColor: borderChakraColor.text,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 0,
        }}
      />
      {/* Inner soft glow */}
      <View
        style={{
          position: "absolute",
          top: 1,
          left: 1,
          right: 1,
          bottom: 1,
          borderWidth: 1,
          borderColor: `${borderChakraColor.glow}60`,
          borderRadius: 0,
          zIndex: 0,
          shadowColor: borderChakraColor.text,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 0,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, zIndex: 1 }}
      >
        {/* Compact Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 4,
            backgroundColor: EARTH_COLORS.background,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
              <Ionicons name="arrow-back" size={22} color={EARTH_COLORS.text} />
            </Pressable>
            <View
              style={{
                alignItems: "center",
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Image
                source={require("@/assets/images/Hero_tulip_LOGO_MASTER.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
              <View style={{ alignItems: "center" }}>
                <AppText
                  font="cormorant-italic"
                  style={{
                    color: EARTH_COLORS.text,
                    fontSize: 24,
                    textAlign: "center",
                    letterSpacing: 0.5,
                  }}
                >
                  Social Sanctuary
                </AppText>
                {selectedDay !== "global" && (
                  <AppText
                    font="instrument-regular"
                    style={{
                      color: CHAKRA_COLORS[selectedDay].text,
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: 2,
                      opacity: 0.8,
                    }}
                  >
                    {getChakraName(selectedDay)} Chakra
                  </AppText>
                )}
              </View>
            </View>
            {/* Share App Button - Only show if enabled */}
            {ENABLE_QR_CODE_SHARING && (
              <Pressable
                onPress={() => {
                  setShowShareModal(true)
                  addHapticFeedback(HapticStrength.Light)
                }}
                style={{
                  padding: 6,
                  marginRight: 8,
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="share-social" size={22} color="#87AE73" />
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push("/Profile")}
              style={{ padding: 6 }}
            >
              <Ionicons
                name="person-circle-outline"
                size={22}
                color={EARTH_COLORS.text}
              />
            </Pressable>
          </View>
        </View>

        {/* Day Selector - Compact Menu at Top */}
        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: "rgba(255, 255, 255, 0.05)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            paddingVertical: 4,
            paddingHorizontal: 8,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 4,
              alignItems: "center",
              paddingHorizontal: 4,
            }}
          >
            <Pressable
              onPress={() => setSelectedDay("global")}
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
                backgroundColor:
                  selectedDay === "global"
                    ? "rgba(232, 224, 245, 0.25)"
                    : "transparent",
                borderWidth: selectedDay === "global" ? 1 : 0,
                borderColor:
                  selectedDay === "global"
                    ? "rgba(232, 224, 245, 0.5)"
                    : "transparent",
              }}
            >
              <AppText
                font="instrument-regular"
                style={{
                  color:
                    selectedDay === "global"
                      ? "#E8E0F5"
                      : "rgba(255, 255, 255, 0.4)",
                  fontSize: 10,
                }}
              >
                All
              </AppText>
            </Pressable>
            {DAY_NAMES.map((dayName, index) => {
              const chakraColor = CHAKRA_COLORS[index] // Use object with text property, not getChakraColor which returns string
              const isSelected = selectedDay === index
              const chakraBallImage = getChakraImage(index)

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedDay(index)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isSelected
                      ? `${chakraColor.text}20`
                      : "transparent",
                    borderWidth: isSelected ? 1 : 0.5,
                    borderColor: isSelected
                      ? `${chakraColor.text}70`
                      : "rgba(255, 255, 255, 0.12)",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={chakraBallImage}
                    style={{
                      width: isSelected ? 22 : 18,
                      height: isSelected ? 22 : 18,
                      opacity: isSelected ? 1 : 0.5,
                    }}
                    resizeMode="contain"
                  />
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        {/* Comments List - Hero Section - Maximum Space for Connection */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <ActivityIndicator size="large" color={EARTH_COLORS.accent} />
              <AppText
                style={{ color: EARTH_COLORS.textSecondary, marginTop: 12 }}
              >
                Gathering community wisdom...
              </AppText>
            </View>
          ) : comments.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Ionicons
                name="people-outline"
                size={64}
                color={EARTH_COLORS.cardBorder}
              />
              <AppText
                style={{
                  color: EARTH_COLORS.textSecondary,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                {selectedDay === "global"
                  ? "No reflections yet.\nBe the first to share your experience."
                  : `No reflections yet for ${DAY_NAMES[selectedDay as number]}.\nBe the first to share your experience.`}
              </AppText>
            </View>
          ) : (
            <View>
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Section - Engaging and Easy to Use */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: 12,
            paddingBottom: Platform.OS === "ios" ? 20 : 12,
          }}
        >
          {selectedImage && (
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Image
                source={{ uri: selectedImage }}
                style={{ width: 50, height: 50, borderRadius: 8 }}
              />
              <Pressable
                onPress={() => setSelectedImage(null)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="rgba(255, 255, 255, 0.6)"
                />
              </Pressable>
            </View>
          )}
          <View
            style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}
          >
            <ImagePickerButton
              selectedImage={selectedImage}
              onImageSelected={setSelectedImage}
              isUploading={isUploadingImage}
              disabled={isSubmitting}
            />
            <TextInput
              value={message}
              onChangeText={(text) => {
                const sanitized = text.replace(/[<>]/g, "")
                if (sanitized.length <= 500) {
                  setMessage(sanitized)
                }
              }}
              placeholder="Share your reflection..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              maxLength={500}
              spellCheck={false}
              autoCorrect={false}
              style={{
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 20,
                padding: 14,
                paddingHorizontal: 16,
                color: EARTH_COLORS.text,
                fontSize: 15,
                minHeight: 50,
                maxHeight: 120,
                borderWidth: 1,
                borderColor: message.trim()
                  ? `${EARTH_COLORS.accent}40`
                  : "rgba(255, 255, 255, 0.15)",
              }}
            />
            <Pressable
              onPress={() => {
                handleSubmit()
                addHapticFeedback(HapticStrength.Medium)
              }}
              disabled={(!message.trim() && !selectedImage) || isSubmitting}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor:
                  message.trim() || selectedImage
                    ? EARTH_COLORS.accent
                    : "rgba(255, 255, 255, 0.1)",
                justifyContent: "center",
                alignItems: "center",
                opacity:
                  (!message.trim() && !selectedImage) || isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={22} color="white" />
              )}
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: 6,
            }}
          >
            <AppText
              style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: 11 }}
            >
              {message.length}/500
            </AppText>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Reflection Diary Modal */}
      {selectedReflection && (
        <ReflectionDiaryModal
          bottomSheetRef={reflectionDiaryRef}
          reflectionId={selectedReflection.id || ""}
          chakraDay={selectedReflection.chakraDay}
          chakraName={CHAKRA_NAMES[selectedReflection.chakraDay]}
        />
      )}

      {/* Share App Modal */}
      {ENABLE_QR_CODE_SHARING && (
        <ShareAppModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </SafeAreaView>
  )
}
