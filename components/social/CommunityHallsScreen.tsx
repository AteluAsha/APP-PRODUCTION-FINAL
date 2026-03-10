/**
 * Social Sanctuary (Community Halls) Screen
 *
 * TYPOGRAPHY: Comment/reflection body and input use normal site font (instrument-regular) for readability.
 * - Title "Social Sanctuary": CormorantGaramond (regular), letterSpacing 1.2
 * - Reflection body & author byline: instrument-regular
 * - Input "Share your reflection..." and reply input: instrument-regular
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
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  Linking,
  RefreshControl,
  useWindowDimensions,
} from "react-native"
import Animated, {
  FadeIn,
  FadeOut,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated"
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
  getSanctuaryUserData,
  addHiddenReflection,
  incrementMinusPopupShown,
  isUserBlockedFromSanctuary,
  followUserInSanctuary,
  unfollowUserInSanctuary,
  type SanctuaryReflection,
  type SanctuaryUserData,
} from "@/src/services/socialSanctuary"
import { uploadCommentImage } from "@/src/services/imageUpload"
import { getUserId } from "@/src/services/socialSanctuary"
import { moderateReflection } from "@/src/services/sentinel"
import { ImagePickerButton } from "./ImagePickerButton"
import { chakraContent } from "@/constants/chakras/content"
import { DAY_TO_CHAKRA } from "@/utils/chakraMapping"
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
import { getUserProfile, type UserProfile } from "@/src/services/profileService"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { LinearGradient } from "expo-linear-gradient"
import { ShareAppModal } from "@/components/sharing/ShareAppModal"
import { ENABLE_QR_CODE_SHARING } from "@/constants/sharing"
import { ProfilePreviewModal } from "@/components/profile/ProfilePreviewModal"

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

// Test/demo data: deterministic names, countries, and avatar URLs when profile is missing (for visual testing)
const TEST_NAMES = [
  "Jordan", "Sam", "Riley", "Morgan", "Quinn", "Alex", "Casey", "River",
  "Sage", "Phoenix", "Blake", "Avery", "Skyler", "Emery", "Finley", "Reese",
]
const TEST_COUNTRIES = [
  "USA", "Canada", "UK", "Australia", "Ireland", "New Zealand", "Germany", "Spain",
  "Japan", "Brazil", "Mexico", "India", "Netherlands", "Sweden", "Italy", "France",
]
function hashUserId(userId: string): number {
  let h = 0
  for (let i = 0; i < userId.length; i++) {
    h = (h << 5) - h + userId.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
function getTestProfileForUser(userId: string): {
  displayName: string
  location: string
  avatarUrl: string
} {
  const h = hashUserId(userId)
  const name = TEST_NAMES[h % TEST_NAMES.length]
  const country = TEST_COUNTRIES[(h >> 4) % TEST_COUNTRIES.length]
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=87AE6F&color=fff`
  return { displayName: name, location: country, avatarUrl }
}

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

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const

export const CommunityHallsScreen: React.FC<CommunityHallsScreenProps> = ({
  initialDay,
}) => {
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()
  const pagerRef = useRef<FlatList>(null)
  const dayScrollRefs = useRef<Record<number, ScrollView | null>>({})
  const [selectedDay, setSelectedDay] = useState<number>(
    typeof initialDay === "number" && initialDay >= 0 && initialDay <= 6
      ? initialDay
      : 0,
  )
  const [commentsByDay, setCommentsByDay] = useState<
    Record<number, CommentWithReplies[]>
  >(() => ({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }))
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
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {},
  )
  const [showShareModal, setShowShareModal] = useState(false)
  const [profilePreview, setProfilePreview] = useState<{
    userId: string
    displayName?: string
    avatarUrl?: string
    location?: string
  } | null>(null)

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

  // Self-governance: blocked from Sanctuary (30 minus received)
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null)
  // Sanctuary user data: hidden refs, popup count, followed list
  const [sanctuaryUserData, setSanctuaryUserData] = useState<SanctuaryUserData | null>(null)
  // Current user id (for follow button and hiding follow on own comments)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  // When set, show "Should we clean this from our community space, little shepherd?" modal for this comment
  const [shepherdModalReflectionId, setShepherdModalReflectionId] = useState<string | null>(null)
  const [shepherdModalDay, setShepherdModalDay] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const refreshRotation = useSharedValue(0)
  useEffect(() => {
    if (refreshing) {
      refreshRotation.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
      )
    } else {
      cancelAnimation(refreshRotation)
      refreshRotation.value = 0
    }
  }, [refreshing])
  const refreshIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${refreshRotation.value * 360}deg` }],
  }))

  // On mount: check if user is blocked from Sanctuary (self-governance)
  useEffect(() => {
    let cancelled = false
    getUserId()
      .then((userId) => isUserBlockedFromSanctuary(userId))
      .then((blocked) => {
        if (!cancelled) setIsBlocked(blocked)
      })
      .catch(() => {
        if (!cancelled) setIsBlocked(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Load comments for all 7 days (by-day feed; each day's comments on its own page)
  useEffect(() => {
    if (isBlocked === true) return
    loadAllDays()

    if (__DEV__) {
      const t = setTimeout(async () => {
        try {
          const { populatePlaceholders } =
            await import("@/src/services/communityPlaceholders")
          await populatePlaceholders()
          await loadAllDays()
        } catch {
          // Silent fail
        }
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [isBlocked])

  const setCommentsForDay = useCallback(
    (day: number, updater: (prev: CommentWithReplies[]) => CommentWithReplies[]) => {
      setCommentsByDay((prev) => ({
        ...prev,
        [day]: updater(prev[day] ?? []),
      }))
    },
    [],
  )

  const loadAllDays = async (silent?: boolean) => {
    if (!silent) setIsLoading(true)
    try {
      const uid = await getUserId().catch(() => undefined)
      if (uid) setCurrentUserId(uid)
      const userData = uid ? await getSanctuaryUserData(uid) : null
      setSanctuaryUserData(userData ?? null)
      const hiddenSet = new Set(userData?.hiddenReflectionIds ?? [])
      const followedSet = new Set(userData?.followedUserIds ?? [])

      const byDay: Record<number, CommentWithReplies[]> = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      }

      for (let day = 0; day < 7; day++) {
        try {
          const dayComments = await getReflectionsForDay(day, 50, uid)
          let list = dayComments
            .filter((c) => !c.id || !hiddenSet.has(c.id))
            .map((c) => ({
              ...c,
              replies: [] as SanctuaryReflection[],
              showReplies: false,
            }))
          const heartedUserIds = new Set(
            list.filter((c) => c.myReaction === "more").map((c) => c.userId),
          )
          list.sort((a, b) => {
            const aFollowed = followedSet.has(a.userId)
            const bFollowed = followedSet.has(b.userId)
            if (aFollowed && !bFollowed) return -1
            if (!aFollowed && bFollowed) return 1
            const aHearted = heartedUserIds.has(a.userId)
            const bHearted = heartedUserIds.has(b.userId)
            if (aHearted && !bHearted) return -1
            if (!aHearted && bHearted) return 1
            return a.timestamp.getTime() - b.timestamp.getTime()
          })
          byDay[day] = list
        } catch (err) {
          if (__DEV__) console.error(`Error loading comments for day ${day}:`, err)
        }
      }

      setCommentsByDay(byDay)

      const allComments = DAYS.flatMap((d) => byDay[d] ?? [])
      setCommentReactions((prev) => {
        const next = { ...prev }
        allComments.forEach((c) => {
          if (c.id && c.myReaction) next[c.id] = c.myReaction
        })
        return next
      })

      const uniqueUserIds = new Set(allComments.map((c) => c.userId))
      const profilePromises = Array.from(uniqueUserIds).map(async (userId) => {
        try {
          const profile = await getUserProfile(userId)
          if (profile) return { userId, profile }
        } catch {
          // silent
        }
        return null
      })
      const profiles = await Promise.all(profilePromises)
      const profileMap: Record<string, UserProfile> = {}
      profiles.forEach((r) => {
        if (r) profileMap[r.userId] = r.profile
      })
      try {
        const presence = usePresenceStore.getState()
        if (uid) {
          const existing = profileMap[uid]
          profileMap[uid] = {
            id: uid,
            displayName: presence.displayName ?? existing?.displayName,
            avatarUrl: presence.profileImageUri ?? existing?.avatarUrl,
            location: presence.location ?? existing?.location,
            createdAt: existing?.createdAt ?? new Date(),
            updatedAt: existing?.updatedAt ?? new Date(),
          }
        }
      } catch {
        // ignore
      }
      setUserProfiles(profileMap)
    } catch (err) {
      if (__DEV__) console.error("Error loading comments:", err)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadAllDays(true)
    } finally {
      setRefreshing(false)
    }
  }, [])

  const loadReplies = async (commentId: string, day: number) => {
    setCommentsForDay(day, (prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, isLoadingReplies: true } : c,
      ),
    )

    try {
      const replies = await getReplies(commentId)
      const replyUserIds = [...new Set(replies.map((r) => r.userId))]
      const currentProfiles = await Promise.all(
        replyUserIds.map(async (userId) => {
          try {
            const profile = await getUserProfile(userId)
            return profile ? { userId, profile } : null
          } catch {
            return null
          }
        }),
      )
      const merge: Record<string, UserProfile> = {}
      currentProfiles.forEach((r) => {
        if (r) merge[r.userId] = r.profile
      })
      const currentUserId = await getUserId().catch(() => null)
      const presence = currentUserId ? usePresenceStore.getState() : null
      if (currentUserId && presence) {
        merge[currentUserId] = {
          ...merge[currentUserId],
          id: currentUserId,
          displayName: presence.displayName ?? merge[currentUserId]?.displayName,
          avatarUrl: presence.profileImageUri ?? merge[currentUserId]?.avatarUrl,
          location: presence.location ?? merge[currentUserId]?.location,
          createdAt: merge[currentUserId]?.createdAt ?? new Date(),
          updatedAt: merge[currentUserId]?.updatedAt ?? new Date(),
        }
      }
      setUserProfiles((prev) => ({ ...prev, ...merge }))

      setCommentsForDay(day, (prev) =>
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
      setCommentsForDay(day, (prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, isLoadingReplies: false } : c,
        ),
      )
    }
  }

  const toggleReplies = (commentId: string, day: number) => {
    const comments = commentsByDay[day] ?? []
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return

    if (comment.showReplies) {
      setCommentsForDay(day, (prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, showReplies: false } : c,
        ),
      )
    } else {
      if (!comment.replies || comment.replies.length === 0) {
        loadReplies(commentId, day)
      } else {
        setCommentsForDay(day, (prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, showReplies: true } : c,
          ),
        )
      }
    }
  }

  const handleSubmit = async () => {
    const hasText = message.trim().length > 0
    const hasImage = !!selectedImage
    if (!hasText && !hasImage) return

    setIsSubmitting(true)
    try {
      // Anua monitor (Sentinel): every feed comment is moderated before Firestore
      const textToModerate = hasText ? message.trim() : "[Image shared with no caption]"
      const moderation = await moderateReflection(textToModerate)
      if (!moderation.isApproved) {
        setIsSubmitting(false)
        Alert.alert(
          "Reflection not posted",
          moderation.reason ?? "This doesn't meet our community guidelines. Please revise and try again from the heart.",
        )
        return
      }

      let imageUrl: string | undefined
      if (hasImage && selectedImage) {
        setIsUploadingImage(true)
        try {
          const userId = await getUserId()
          imageUrl = await uploadCommentImage(selectedImage, userId)
        } finally {
          setIsUploadingImage(false)
        }
      }

      await addReflection(selectedDay, message.trim(), isAnonymous, undefined, imageUrl)
      setMessage("")
      setSelectedImage(null)
      await loadAllDays()
      setTimeout(() => {
        dayScrollRefs.current[selectedDay]?.scrollToEnd({ animated: true })
      }, 150)
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
      // Anua monitor (Sentinel): replies are moderated before Firestore
      const moderation = await moderateReflection(replyMessage.trim())
      if (!moderation.isApproved) {
        setIsSubmitting(false)
        Alert.alert(
          "Reply not posted",
          moderation.reason ?? "This doesn't meet our community guidelines. Please revise and try again from the heart.",
        )
        return
      }

      await addReflection(selectedDay, replyMessage.trim(), isAnonymous, parentId)
      setReplyMessage("")
      setReplyingTo(null)
      await loadReplies(parentId, selectedDay)
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

  const borderChakraColor = CHAKRA_COLORS[selectedDay]

  const CommentItem = ({
    comment,
    day,
    level = 0,
  }: {
    comment: CommentWithReplies
    day: number
    level?: number
  }) => {
    const isReply = level > 0
    const hasReplies =
      (comment.replyCount || 0) > 0 ||
      (comment.replies && comment.replies.length > 0)
    const chakra = DAY_TO_CHAKRA[comment.chakraDay]
    const chakraColor = CHAKRA_COLORS[comment.chakraDay]
    const chakraName = CHAKRA_NAMES[comment.chakraDay]
    const fallbackProfile = getTestProfileForUser(comment.userId ?? "")
    const fromStore = userProfiles[comment.userId ?? ""]
    const displayProfile = {
      displayName: fromStore?.displayName ?? fallbackProfile.displayName,
      avatarUrl: fromStore?.avatarUrl ?? fallbackProfile.avatarUrl,
      location: fromStore?.location ?? fallbackProfile.location,
    }

    const themeChakraColor = CHAKRA_COLORS[day]

    // Get current user's reaction for this comment
    const currentUserReaction = comment.id ? commentReactions[comment.id] : null
    const reactions = comment.reactions || { more: 0, neutral: 0, less: 0 }

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

      setCommentsForDay(comment.chakraDay, (prev) =>
        prev.map((c) => {
          if (c.id === comment.id) {
            const currentReactions = c.reactions || {
              more: 0,
              neutral: 0,
              less: 0,
            }
            const updatedReactions = { ...currentReactions }
            if (previousReaction) {
              updatedReactions[previousReaction] = Math.max(
                0,
                updatedReactions[previousReaction] - 1,
              )
            }
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
          // Self-governance: show "little shepherd" modal on first 3 minus clicks
          if (
            newReaction === "less" &&
            (sanctuaryUserData?.minusPopupShownCount ?? 0) < 3
          ) {
            setShepherdModalReflectionId(comment.id ?? null)
            setShepherdModalDay(comment.chakraDay)
          }
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
        setCommentsForDay(comment.chakraDay, (prev) =>
          prev.map((c) => {
            if (c.id === comment.id) {
              const currentReactions = c.reactions || {
                more: 0,
                neutral: 0,
                less: 0,
              }
              const updatedReactions = { ...currentReactions }
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
          </View>

          {/* Reflection body - smaller, softer for easier reading */}
          {comment.message.length > 0 && (
            <AppText
              font="instrument-regular"
              style={{
                color: "rgba(255, 255, 255, 0.82)",
                fontSize: 14,
                lineHeight: 22,
                marginBottom: 10,
              }}
            >
              {comment.message}
            </AppText>
          )}
          {/* Reflection image - loaded from Firebase Storage */}
          {comment.imageUrl ? (
            <View style={{ marginBottom: 10, borderRadius: 12, overflow: "hidden", maxWidth: "100%" }}>
              <Image
                source={{ uri: comment.imageUrl }}
                style={{
                  width: "100%",
                  maxWidth: 280,
                  aspectRatio: 4 / 3,
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                }}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Commenter: avatar + name & location (or "Soul" when anonymous) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 10 }}>
              {/* Profile image - tappable to open preview (invite to tribe) */}
              {comment.isAnonymous ? (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={16} color="rgba(255, 255, 255, 0.4)" />
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    if (comment.userId) {
                      addHapticFeedback(HapticStrength.Light)
                      setProfilePreview({
                        userId: comment.userId,
                        displayName: displayProfile.displayName,
                        avatarUrl: displayProfile.avatarUrl,
                        location: displayProfile.location,
                      })
                    }
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  hitSlop={8}
                >
                  {displayProfile.avatarUrl ? (
                    <Image
                      source={{
                        uri: displayProfile.avatarUrl,
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="person" size={16} color="rgba(255, 255, 255, 0.4)" />
                    </View>
                  )}
                </Pressable>
              )}
              <View style={{ flex: 1 }}>
                <AppText
                  font="instrument-regular"
                  style={{
                    color: "rgba(255, 255, 255, 0.65)",
                    fontSize: 13,
                  }}
                >
                  {comment.isAnonymous
                    ? "Soul"
                    : displayProfile.displayName}
                </AppText>
                {!comment.isAnonymous ? (
                  <AppText
                    font="instrument-regular"
                    style={{
                      color: "rgba(255, 255, 255, 0.45)",
                      fontSize: 11,
                      marginTop: 1,
                    }}
                  >
                    {displayProfile.location}
                  </AppText>
                ) : null}
              </View>
              {/* Reply (left) and Follow / plus (right); plus lights up cyan when following */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
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
                {!comment.isAnonymous &&
                  comment.userId &&
                  currentUserId &&
                  comment.userId !== currentUserId && (
                    <Pressable
                      onPress={async () => {
                        addHapticFeedback(HapticStrength.Light)
                        const targetId = comment.userId!
                        const followed = sanctuaryUserData?.followedUserIds?.includes(targetId)
                        try {
                          if (followed) {
                            await unfollowUserInSanctuary(currentUserId, targetId)
                            setSanctuaryUserData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    followedUserIds: (prev.followedUserIds ?? []).filter(
                                      (id) => id !== targetId,
                                    ),
                                  }
                                : prev,
                            )
                          } else {
                            await followUserInSanctuary(currentUserId, targetId)
                            setSanctuaryUserData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    followedUserIds: [...(prev.followedUserIds ?? []), targetId],
                                  }
                                : prev,
                            )
                          }
                          setCommentsForDay(comment.chakraDay, (prev) => {
                            const followedSet = new Set(
                              followed
                                ? (sanctuaryUserData?.followedUserIds ?? []).filter((id) => id !== targetId)
                                : [...(sanctuaryUserData?.followedUserIds ?? []), targetId],
                            )
                            const heartedSet = new Set(
                              prev.filter((c) => commentReactions[c.id!] === "more").map((c) => c.userId),
                            )
                            return [...prev].sort((a, b) => {
                              const aF = followedSet.has(a.userId)
                              const bF = followedSet.has(b.userId)
                              if (aF && !bF) return -1
                              if (!aF && bF) return 1
                              const aH = heartedSet.has(a.userId)
                              const bH = heartedSet.has(b.userId)
                              if (aH && !bH) return -1
                              if (!aH && bH) return 1
                              return a.timestamp.getTime() - b.timestamp.getTime()
                            })
                          })
                        } catch (e) {
                          if (__DEV__) console.warn("Follow toggle error:", e)
                        }
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: sanctuaryUserData?.followedUserIds?.includes(comment.userId!)
                          ? "rgba(6, 182, 212, 0.25)"
                          : "rgba(255, 255, 255, 0.08)",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: sanctuaryUserData?.followedUserIds?.includes(comment.userId!)
                          ? "rgba(6, 182, 212, 0.6)"
                          : "rgba(255, 255, 255, 0.15)",
                      }}
                      accessibilityLabel={
                        sanctuaryUserData?.followedUserIds?.includes(comment.userId!)
                          ? "Unfollow"
                          : "Follow to see more from this person"
                      }
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={
                          sanctuaryUserData?.followedUserIds?.includes(comment.userId!)
                            ? "#06B6D4"
                            : "rgba(255, 255, 255, 0.6)"
                        }
                      />
                    </Pressable>
                  )}
              </View>
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

            {/* Minus - Remove this comment from your feed (no counter, just icon) */}
            <Pressable
              onPress={async () => {
                if (!comment.id) return
                addHapticFeedback(HapticStrength.Light)
                try {
                  const uid = currentUserId ?? (await getUserId().catch(() => null))
                  if (uid) {
                    await addHiddenReflection(uid, comment.id)
                    setCommentsForDay(comment.chakraDay, (prev) => prev.filter((c) => c.id !== comment.id))
                    setSanctuaryUserData((prev) =>
                      prev
                        ? {
                            ...prev,
                            hiddenReflectionIds: [...(prev.hiddenReflectionIds || []), comment.id!],
                          }
                        : prev,
                    )
                    if ((sanctuaryUserData?.minusPopupShownCount ?? 0) < 3) {
                      setShepherdModalReflectionId(comment.id)
                      setShepherdModalDay(comment.chakraDay)
                    }
                  }
                } catch (e) {
                  if (__DEV__) console.warn("Minus (hide) error:", e)
                }
              }}
              disabled={isSubmitting}
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 0,
                borderColor: "rgba(107, 114, 128, 0.4)",
              }}
              accessibilityLabel="Remove from your feed"
            >
              <Ionicons
                name="remove"
                size={14}
                color="rgba(255, 255, 255, 0.5)"
              />
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
                    "Remove this from your feed"}
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
                      toggleReplies(comment.id, day)
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
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                  fontSize: 16,
                  lineHeight: 24,
                  fontFamily: "InstrumentSansRegular",
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
                    day={day}
                    level={level + 1}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    )
  };

  // Self-governance: blocked from Sanctuary (30 minus received)
  if (isBlocked === true) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: EARTH_COLORS.background }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText
            font="cormorant-regular"
            size="2xl"
            style={{
              color: EARTH_COLORS.text,
              textAlign: "center",
              letterSpacing: 1.2,
              marginBottom: 24,
            }}
          >
            Social Sanctuary
          </AppText>
          <AppText
            font="instrument-regular"
            size="base"
            style={{
              color: EARTH_COLORS.textSecondary,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 16,
            }}
          >
            Social Sanctuary is monitored by the community itself. The collective decides the space.
          </AppText>
          <AppText
            font="instrument-regular"
            size="base"
            style={{
              color: EARTH_COLORS.textSecondary,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 24,
            }}
          >
            Don&apos;t let your head worry about it at all—you&apos;re in a healing space. Embrace this moment and get back into the course. We all walk through this together.
          </AppText>
          <Pressable
            onPress={() =>
              Linking.openURL(
                "mailto:support@soulschool.app?subject=Social Sanctuary - I feel this was a mistake",
              )
            }
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
              backgroundColor: "rgba(135, 174, 115, 0.25)",
              borderWidth: 1,
              borderColor: "rgba(135, 174, 115, 0.5)",
            }}
          >
            <AppText font="instrument-medium" size="base" style={{ color: EARTH_COLORS.accentLight }}>
              If you feel this was a mistake, email us
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={{ marginTop: 32, padding: 12 }}
          >
            <AppText font="instrument-regular" size="sm" style={{ color: EARTH_COLORS.textSecondary }}>
              Back to course
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

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
                  font="cormorant-regular"
                  size="2xl"
                  style={{
                    fontFamily: "CormorantGaramond",
                    color: EARTH_COLORS.text,
                    textAlign: "center",
                    letterSpacing: 1.2,
                  }}
                >
                  Social Sanctuary
                </AppText>
                <AppText
                  font="instrument-medium"
                  size="sm"
                  style={{
                    color: CHAKRA_COLORS[selectedDay].text,
                    textAlign: "center",
                    marginTop: 2,
                    opacity: 0.9,
                  }}
                >
                  {getChakraName(selectedDay)} Chakra
                </AppText>
              </View>
            </View>
            {/* Refresh feed - earth icon spins while refreshing */}
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                onRefresh()
              }}
              style={{ padding: 6, marginRight: 4 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Refresh feed"
              accessibilityHint="Pull down or tap to refresh sanctuary feed"
            >
              <Animated.View style={refreshIconAnimatedStyle}>
                <Ionicons
                  name="earth"
                  size={22}
                  color={refreshing ? "#06B6D4" : EARTH_COLORS.textSecondary}
                />
              </Animated.View>
            </Pressable>
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
            {DAY_NAMES.map((dayName, index) => {
              const chakraColor = CHAKRA_COLORS[index]
              const isSelected = selectedDay === index
              const chakraBallImage = getChakraImage(index)

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    setSelectedDay(index)
                    pagerRef.current?.scrollToOffset({
                      offset: index * screenWidth,
                      animated: true,
                    })
                  }}
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

        {/* Comments by day - swipeable horizontal pager (one page per chakra day) */}
        {isLoading ? (
          <View
            style={{
              flex: 1,
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
        ) : (
          <FlatList
            ref={pagerRef}
            data={DAYS}
            keyExtractor={(item) => String(item)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const x = e.nativeEvent.contentOffset.x
              const index = Math.round(x / screenWidth)
              setSelectedDay(Math.max(0, Math.min(6, index)))
            }}
            getItemLayout={(_: unknown, index: number) => ({
              length: screenWidth,
              offset: index * screenWidth,
              index,
            })}
            initialScrollIndex={Math.max(0, Math.min(6, selectedDay))}
            renderItem={({ item: day }) => {
              const dayComments = commentsByDay[day] ?? []
              return (
                <View style={{ width: screenWidth, flex: 1 }}>
                  <ScrollView
                    ref={(r) => {
                      dayScrollRefs.current[day] = r
                    }}
                    onContentSizeChange={() => {
                      dayScrollRefs.current[day]?.scrollToEnd({ animated: false })
                    }}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 12, paddingTop: 8, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={EARTH_COLORS.accent}
                      />
                    }
                  >
                    {dayComments.length === 0 ? (
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
                          No reflections yet for {DAY_NAMES[day]}.\nBe the first to share your experience.
                        </AppText>
                      </View>
                    ) : (
                      <View>
                        {dayComments.map((comment, index) => (
                          <Animated.View
                            key={comment.id}
                            entering={FadeIn.delay(Math.min(index * 80, 400)).duration(350)}
                          >
                            <CommentItem comment={comment} day={day} />
                          </Animated.View>
                        ))}
                      </View>
                    )}
                  </ScrollView>
                </View>
              )
            }}
          />
        )}

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
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
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
                fontSize: 17,
                lineHeight: 26,
                fontFamily: "InstrumentSansRegular",
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

      {/* Self-governance: "little shepherd" modal — show on first 3 minus clicks */}
      <Modal
        visible={!!shepherdModalReflectionId}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShepherdModalReflectionId(null)
          setShepherdModalDay(null)
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
          onPress={() => {
            setShepherdModalReflectionId(null)
            setShepherdModalDay(null)
          }}
        >
          <Pressable
            style={{
              backgroundColor: EARTH_COLORS.card,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: EARTH_COLORS.cardBorder,
              maxWidth: 320,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <AppText
              font="instrument-regular"
              size="base"
              style={{
                color: EARTH_COLORS.text,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 24,
              }}
            >
              Should we clean this from our community space, little shepherd?
            </AppText>
            <View style={{ flexDirection: "row", gap: 12, justifyContent: "center" }}>
              <Pressable
                onPress={async () => {
                  const id = shepherdModalReflectionId
                  const day = shepherdModalDay
                  setShepherdModalReflectionId(null)
                  setShepherdModalDay(null)
                  if (!id || day === null) return
                  try {
                    const userId = await getUserId()
                    await addHiddenReflection(userId, id)
                    await incrementMinusPopupShown(userId)
                    setCommentsForDay(day, (prev) => prev.filter((c) => c.id !== id))
                    setSanctuaryUserData((prev) =>
                      prev
                        ? {
                            ...prev,
                            minusPopupShownCount: Math.min(3, prev.minusPopupShownCount + 1),
                            hiddenReflectionIds: [...(prev.hiddenReflectionIds || []), id],
                          }
                        : prev,
                    )
                  } catch (e) {
                    if (__DEV__) console.warn("Shepherd modal Yes error:", e)
                  }
                  addHapticFeedback(HapticStrength.Light)
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: "rgba(135, 174, 115, 0.25)",
                  borderWidth: 1,
                  borderColor: "rgba(135, 174, 115, 0.5)",
                }}
              >
                <AppText font="instrument-medium" size="base" style={{ color: EARTH_COLORS.accentLight }}>
                  Yes
                </AppText>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setShepherdModalReflectionId(null)
                  setShepherdModalDay(null)
                  try {
                    const userId = await getUserId()
                    await incrementMinusPopupShown(userId)
                    setSanctuaryUserData((prev) =>
                      prev
                        ? { ...prev, minusPopupShownCount: Math.min(3, prev.minusPopupShownCount + 1) }
                        : prev,
                    )
                  } catch (e) {
                    if (__DEV__) console.warn("Shepherd modal No error:", e)
                  }
                  addHapticFeedback(HapticStrength.Light)
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderWidth: 1,
                  borderColor: EARTH_COLORS.cardBorder,
                }}
              >
                <AppText font="instrument-regular" size="base" style={{ color: EARTH_COLORS.text }}>
                  No
                </AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Share App Modal */}
      {ENABLE_QR_CODE_SHARING && (
        <ShareAppModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
      <ProfilePreviewModal
        visible={!!profilePreview}
        onClose={() => setProfilePreview(null)}
        userId={profilePreview?.userId ?? ""}
        displayName={profilePreview?.displayName}
        avatarUrl={profilePreview?.avatarUrl}
        location={profilePreview?.location}
      />
    </SafeAreaView>
  )
}
