/**
 * Community Halls Screen
 *
 * A holistic, safe space for community reflections with nested replies
 * Features: Nested replies (like YouTube), expand/collapse threads, earth tones
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    ScrollView,
    Pressable,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '@/components/AppText'
import {
    getReflectionsForDay,
    getReplies,
    addReflection,
    subscribeToReflections,
    type SanctuaryReflection,
} from '@/src/services/socialSanctuary'
import { moderateReflection } from '@/src/services/sentinel'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const CHAKRA_NAMES = [
    'Root',
    'Sacral',
    'Solar Plexus',
    'Heart',
    'Throat',
    'Third Eye',
    'Crown',
]

// Earth tone colors for holistic, safe feeling
const EARTH_COLORS = {
    background: '#1a1f1a', // Deep forest green-black
    card: '#2d352d', // Sage green-dark
    cardBorder: '#4a5a4a', // Muted sage
    text: '#e8e8d8', // Soft cream
    textSecondary: '#b8b8a8', // Muted cream
    accent: '#87AE73', // Sage green
    accentLight: '#A8C99A', // Light sage
    accentDark: '#6B8E5A', // Dark sage
    highlight: '#D4A574', // Warm earth tone
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
    const [selectedDay, setSelectedDay] = useState<number | 'global'>(initialDay ?? 'global')
    const [comments, setComments] = useState<CommentWithReplies[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAnonymous, setIsAnonymous] = useState(true)

    // Load comments for selected day
    useEffect(() => {
        loadComments()
        
        // If no comments exist, populate placeholders (dev mode only)
        if (__DEV__) {
            setTimeout(async () => {
                try {
                    const { populatePlaceholders } = await import('@/src/services/communityPlaceholders')
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
            if (selectedDay === 'global') {
                // Load from all days
                const allComments: CommentWithReplies[] = []
                for (let day = 0; day < 7; day++) {
                    try {
                        const dayComments = await getReflectionsForDay(day, 50)
                        allComments.push(...dayComments.map(c => ({ ...c, replies: [], showReplies: false })))
                    } catch (err) {
                        if (__DEV__) {
                            console.error(`Error loading comments for day ${day}:`, err)
                        }
                    }
                }
                allComments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                setComments(allComments)
            } else {
                const dayComments = await getReflectionsForDay(selectedDay, 50)
                setComments(dayComments.map(c => ({ ...c, replies: [], showReplies: false })))
            }
        } catch (err) {
            if (__DEV__) {
                console.error('Error loading comments:', err)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const loadReplies = async (commentId: string) => {
        setComments(prev => prev.map(c => 
            c.id === commentId ? { ...c, isLoadingReplies: true } : c
        ))

        try {
            const replies = await getReplies(commentId)
            setComments(prev => prev.map(c => 
                c.id === commentId 
                    ? { ...c, replies, showReplies: true, isLoadingReplies: false }
                    : c
            ))
        } catch (err) {
            if (__DEV__) {
                console.error('Error loading replies:', err)
            }
            setComments(prev => prev.map(c => 
                c.id === commentId ? { ...c, isLoadingReplies: false } : c
            ))
        }
    }

    const toggleReplies = (commentId: string) => {
        const comment = comments.find(c => c.id === commentId)
        if (!comment) return

        if (comment.showReplies) {
            // Collapse
            setComments(prev => prev.map(c => 
                c.id === commentId ? { ...c, showReplies: false } : c
            ))
        } else {
            // Expand - load replies if not loaded
            if (!comment.replies || comment.replies.length === 0) {
                loadReplies(commentId)
            } else {
                setComments(prev => prev.map(c => 
                    c.id === commentId ? { ...c, showReplies: true } : c
                ))
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

            const chakraDay = selectedDay === 'global' ? 0 : selectedDay
            await addReflection(chakraDay, message.trim(), isAnonymous)
            setMessage('')
            await loadComments() // Reload to show new comment
        } catch (err) {
            if (__DEV__) {
                console.error('Error submitting comment:', err)
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

            const chakraDay = selectedDay === 'global' ? 0 : selectedDay
            await addReflection(chakraDay, replyMessage.trim(), isAnonymous, parentId)
            setReplyMessage('')
            setReplyingTo(null)
            // Reload replies for this comment
            await loadReplies(parentId)
        } catch (err) {
            if (__DEV__) {
                console.error('Error submitting reply:', err)
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

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const CommentItem = ({ comment, level = 0 }: { comment: CommentWithReplies; level?: number }) => {
        const isReply = level > 0
        const hasReplies = (comment.replyCount || 0) > 0 || (comment.replies && comment.replies.length > 0)

        return (
            <View style={{ marginLeft: level * 20, marginBottom: 12 }}>
                <View
                    style={{
                        backgroundColor: EARTH_COLORS.card,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: EARTH_COLORS.cardBorder,
                    }}
                >
                    {/* Comment Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <AppText
                                font="instrument-medium"
                                style={{ color: EARTH_COLORS.text, fontSize: 14 }}
                            >
                                {comment.isAnonymous ? 'Anonymous Soul' : 'Soul'}
                            </AppText>
                            {selectedDay === 'global' && !isReply && (
                                <AppText
                                    font="instrument-regular"
                                    style={{ color: EARTH_COLORS.accent, fontSize: 11 }}
                                >
                                    {DAY_NAMES[comment.chakraDay]}
                                </AppText>
                            )}
                        </View>
                        <AppText
                            font="instrument-regular"
                            style={{ color: EARTH_COLORS.textSecondary, fontSize: 11 }}
                        >
                            {formatTimestamp(comment.timestamp)}
                        </AppText>
                    </View>

                    {/* Comment Message */}
                    <AppText
                        font="instrument-regular"
                        style={{ color: EARTH_COLORS.text, fontSize: 14, lineHeight: 20, marginBottom: 8 }}
                    >
                        {comment.message}
                    </AppText>

                    {/* Reply Button */}
                    <Pressable
                        onPress={() => {
                            if (replyingTo === comment.id) {
                                setReplyingTo(null)
                                setReplyMessage('')
                            } else {
                                setReplyingTo(comment.id || null)
                            }
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
                    >
                        <Ionicons
                            name="chatbubble-outline"
                            size={16}
                            color={EARTH_COLORS.accent}
                        />
                        <AppText
                            font="instrument-medium"
                            style={{ color: EARTH_COLORS.accent, fontSize: 13 }}
                        >
                            Reply
                        </AppText>
                    </Pressable>

                    {/* View Replies Button */}
                    {hasReplies && (
                        <Pressable
                            onPress={() => comment.id && toggleReplies(comment.id)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}
                        >
                            <Ionicons
                                name={comment.showReplies ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={EARTH_COLORS.highlight}
                            />
                            <AppText
                                font="instrument-medium"
                                style={{ color: EARTH_COLORS.highlight, fontSize: 13 }}
                            >
                                {comment.showReplies ? 'Hide' : 'View'} {comment.replyCount || comment.replies?.length || 0} {comment.replyCount === 1 ? 'reply' : 'replies'}
                            </AppText>
                        </Pressable>
                    )}

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: EARTH_COLORS.cardBorder }}>
                            <TextInput
                                value={replyMessage}
                                onChangeText={setReplyMessage}
                                placeholder="Write a reply..."
                                placeholderTextColor={EARTH_COLORS.textSecondary}
                                multiline
                                maxLength={500}
                                style={{
                                    backgroundColor: EARTH_COLORS.background,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: EARTH_COLORS.text,
                                    fontSize: 14,
                                    minHeight: 60,
                                    borderWidth: 1,
                                    borderColor: EARTH_COLORS.cardBorder,
                                    marginBottom: 8,
                                }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                                <Pressable
                                    onPress={() => {
                                        setReplyingTo(null)
                                        setReplyMessage('')
                                    }}
                                    style={{ padding: 8 }}
                                >
                                    <AppText style={{ color: EARTH_COLORS.textSecondary }}>Cancel</AppText>
                                </Pressable>
                                <Pressable
                                    onPress={() => comment.id && handleReplySubmit(comment.id)}
                                    disabled={!replyMessage.trim() || isSubmitting}
                                    style={{
                                        backgroundColor: EARTH_COLORS.accent,
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 8,
                                        opacity: (!replyMessage.trim() || isSubmitting) ? 0.5 : 1,
                                    }}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <AppText style={{ color: 'white', fontWeight: '600' }}>Reply</AppText>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Loading Replies */}
                    {comment.isLoadingReplies && (
                        <View style={{ marginTop: 12, alignItems: 'center', padding: 12 }}>
                            <ActivityIndicator size="small" color={EARTH_COLORS.accent} />
                        </View>
                    )}

                    {/* Replies List */}
                    {comment.showReplies && comment.replies && comment.replies.length > 0 && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: EARTH_COLORS.cardBorder }}>
                            {comment.replies.map((reply) => (
                                <CommentItem key={reply.id} comment={reply} level={level + 1} />
                            ))}
                        </View>
                    )}
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: EARTH_COLORS.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: EARTH_COLORS.cardBorder,
                }}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={EARTH_COLORS.text} />
                    </Pressable>
                    <AppText font="instrument-bold" style={{ color: EARTH_COLORS.text, fontSize: 20 }}>
                        Community Halls
                    </AppText>
                    <View style={{ width: 24 }} />
                </View>

                {/* Day Selector */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ borderBottomWidth: 1, borderBottomColor: EARTH_COLORS.cardBorder }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
                >
                    <Pressable
                        onPress={() => setSelectedDay('global')}
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            backgroundColor: selectedDay === 'global' ? EARTH_COLORS.accent : EARTH_COLORS.card,
                        }}
                    >
                        <AppText
                            font="instrument-medium"
                            style={{ color: selectedDay === 'global' ? 'white' : EARTH_COLORS.textSecondary }}
                        >
                            Global
                        </AppText>
                    </Pressable>
                    {DAY_NAMES.map((dayName, index) => (
                        <Pressable
                            key={index}
                            onPress={() => setSelectedDay(index)}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: selectedDay === index ? EARTH_COLORS.accent : EARTH_COLORS.card,
                            }}
                        >
                            <AppText
                                font="instrument-medium"
                                style={{ color: selectedDay === index ? 'white' : EARTH_COLORS.textSecondary }}
                            >
                                {dayName}
                            </AppText>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Comments List */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                    {isLoading ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                            <ActivityIndicator size="large" color={EARTH_COLORS.accent} />
                            <AppText style={{ color: EARTH_COLORS.textSecondary, marginTop: 12 }}>
                                Gathering community wisdom...
                            </AppText>
                        </View>
                    ) : comments.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <Ionicons name="people-outline" size={64} color={EARTH_COLORS.cardBorder} />
                            <AppText style={{ color: EARTH_COLORS.textSecondary, marginTop: 16, textAlign: 'center' }}>
                                {selectedDay === 'global'
                                    ? 'No reflections yet.\nBe the first to share your experience.'
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

                {/* Input Section */}
                <View style={{
                    borderTopWidth: 1,
                    borderTopColor: EARTH_COLORS.cardBorder,
                    backgroundColor: EARTH_COLORS.background,
                    padding: 16,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Pressable
                            onPress={() => setIsAnonymous(!isAnonymous)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                        >
                            <Ionicons
                                name={isAnonymous ? 'checkbox-outline' : 'checkbox'}
                                size={20}
                                color={isAnonymous ? EARTH_COLORS.accent : EARTH_COLORS.textSecondary}
                            />
                            <AppText style={{ color: EARTH_COLORS.textSecondary, fontSize: 13 }}>
                                Post anonymously
                            </AppText>
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                        <TextInput
                            value={message}
                            onChangeText={(text) => {
                                const sanitized = text.replace(/[<>]/g, '')
                                if (sanitized.length <= 500) {
                                    setMessage(sanitized)
                                }
                            }}
                            placeholder="Share your reflection..."
                            placeholderTextColor={EARTH_COLORS.textSecondary}
                            multiline
                            maxLength={500}
                            style={{
                                flex: 1,
                                backgroundColor: EARTH_COLORS.card,
                                borderRadius: 12,
                                padding: 12,
                                color: EARTH_COLORS.text,
                                fontSize: 14,
                                minHeight: 60,
                                borderWidth: 1,
                                borderColor: EARTH_COLORS.cardBorder,
                            }}
                        />
                        <Pressable
                            onPress={handleSubmit}
                            disabled={!message.trim() || isSubmitting}
                            style={{
                                backgroundColor: EARTH_COLORS.accent,
                                paddingHorizontal: 20,
                                paddingVertical: 12,
                                borderRadius: 12,
                                opacity: (!message.trim() || isSubmitting) ? 0.5 : 1,
                            }}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="send" size={20} color="white" />
                            )}
                        </Pressable>
                    </View>
                    <AppText style={{ color: EARTH_COLORS.textSecondary, fontSize: 11, textAlign: 'right', marginTop: 4 }}>
                        {message.length}/500
                    </AppText>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
