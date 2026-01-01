/**
 * Social Sanctuary Modal (Altar)
 *
 * A clean, modal interface where users can:
 * - Read reflections from others on the same chakra day
 * - Leave their own reflections
 * - Request Anua's Collective Blessing synthesis
 */

import React, { useState, useEffect } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '@/components/AppText'
import {
    getReflectionsForDay,
    addReflection,
    getRecentReflectionsForSynthesis,
    getTopReflections,
    subscribeToReflections,
    type SanctuaryReflection,
} from '@/src/services/socialSanctuary'
import { generateDailyTransmission, isWisdomEngineAvailable } from '@/src/services/wisdomEngine'
import { moderateReflection } from '@/src/services/sentinel'
import { AnuaChatModal } from './AnuaChatModal'
import { useRouter } from 'expo-router'
import { TreeOfLifeIcon } from './TreeOfLifeIcon'

interface SocialSanctuaryModalProps {
    visible: boolean
    onClose: () => void
    chakraDay: number // 0-6 (Monday-Sunday)
    chakraName: string // e.g., "Root Chakra", "Heart Chakra"
    onOpenAnuaChat?: () => void // Callback to open Anua chat
}

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

export const SocialSanctuaryModal: React.FC<SocialSanctuaryModalProps> = ({
    visible,
    onClose,
    chakraDay,
    chakraName,
    onOpenAnuaChat,
}) => {
    const router = useRouter()
    const [view, setView] = useState<'options' | 'community'>('options') // Track which view to show
    const [reflections, setReflections] = useState<SanctuaryReflection[]>([])
    const [topReflections, setTopReflections] = useState<SanctuaryReflection[]>([])
    const [dailyWisdom, setDailyWisdom] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingHighlights, setIsLoadingHighlights] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load daily wisdom and top reflections when modal opens
    useEffect(() => {
        if (visible) {
            loadDailyWisdom()
            loadTopReflections()
        } else if (!visible) {
            // Reset state when modal closes
            setView('options')
            setMessage('')
            setError(null)
            setTopReflections([])
            setDailyWisdom(null)
            setReflections([])
        }
    }, [visible, chakraDay])

    // Set up real-time subscription for community view
    useEffect(() => {
        if (visible && view === 'community') {
            // Set up real-time listener for reflections
            const unsubscribe = subscribeToReflections(chakraDay, (updatedReflections) => {
                setReflections(updatedReflections)
                setIsLoading(false)
            })

            // Initial load
            setIsLoading(true)

            return () => {
                if (unsubscribe) {
                    unsubscribe()
                }
            }
        }
    }, [visible, view, chakraDay])

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
                console.error('Error loading daily wisdom:', err)
            }
            // Don't show error to user, just leave dailyWisdom as null
        }
    }

    const loadTopReflections = async () => {
        setIsLoadingHighlights(true)
        try {
            const top = await getTopReflections(chakraDay)
            setTopReflections(top)
        } catch (err) {
            if (__DEV__) {
                console.error('Error loading top reflections:', err)
            }
            // Don't show error to user, just leave topReflections as empty
        } finally {
            setIsLoadingHighlights(false)
        }
    }

    const loadReflections = async () => {
        // Real-time subscription handles updates, but we can still use this for initial load
        setIsLoading(true)
        setError(null)
        try {
            const data = await getReflectionsForDay(chakraDay)
            setReflections(data)
        } catch (err) {
            if (__DEV__) {
                console.error('Error loading reflections:', err)
            }
            setError('Failed to load reflections. Please try again.')
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
                setError(moderation.reason || 'Your reflection does not meet community guidelines. Please revise and try again.')
                setIsSubmitting(false)
                return
            }

            // If approved, post the reflection
            await addReflection(chakraDay, message.trim(), isAnonymous)
            setMessage('')
            // Real-time subscription will automatically update the list
            // No need to manually reload
        } catch (err) {
            if (__DEV__) {
                console.error('Error submitting reflection:', err)
            }
            setError('Failed to submit reflection. Please try again.')
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

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-black">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
                        <View className="flex-1">
                            <AppText font="instrument-bold" size="xl" className="text-white">
                                Social Sanctuary
                            </AppText>
                            <AppText font="instrument-regular" size="sm" className="text-gray-400 mt-1">
                                {DAY_NAMES[chakraDay]} • {chakraName}
                            </AppText>
                        </View>
                        <Pressable onPress={onClose} className="p-2">
                            <Ionicons name="close" size={28} color="white" />
                        </Pressable>
                    </View>

                    {/* Options View - Show three buttons */}
                    {view === 'options' && (
                        <ScrollView 
                            className="flex-1 px-6" 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ 
                                paddingTop: 16,
                                paddingBottom: 24,
                                flexGrow: 1,
                            }}
                        >
                            <View className="gap-3">
                                {/* Anua's Daily Transmission - Compact */}
                                {dailyWisdom && (
                                    <View className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50 mb-1">
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="sparkles" size={16} color="#9333ea" />
                                            <AppText font="instrument-bold" size="sm" className="text-purple-300 ml-2">
                                                Anua's Daily Transmission
                                            </AppText>
                                        </View>
                                        <AppText font="instrument-regular" size="xs" className="text-white/90 leading-5 italic">
                                            "{dailyWisdom}"
                                        </AppText>
                                    </View>
                                )}

                                {/* Anua Placeholder Text - Compact */}
                                <View className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/30 mb-2">
                                    <AppText font="instrument-regular" size="xs" className="text-white/90 leading-5 text-center italic">
                                        "You have entered the realms of the path from self to soul, how are you feeling about this journey so far? What came up for you here?"
                                    </AppText>
                                </View>

                                {/* Three Buttons in Compact Layout */}
                                <View className="flex-row justify-around items-start mb-3">
                                    {/* Talk to Anua Button */}
                                    <View className="items-center flex-1">
                                        <Pressable
                                            onPress={() => {
                                                if (onOpenAnuaChat) {
                                                    onOpenAnuaChat()
                                                }
                                            }}
                                            className="active:opacity-80"
                                            style={{
                                                shadowColor: '#9333ea',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.4,
                                                shadowRadius: 12,
                                                elevation: 6,
                                            }}
                                        >
                                            <Image
                                                source={require('@/assets/images/Anua_Hero_Icon_Image.png')}
                                                className="w-20 h-20 rounded-full"
                                                resizeMode="cover"
                                                style={{
                                                    borderRadius: 9999,
                                                    borderWidth: 2,
                                                    borderColor: '#9333ea',
                                                }}
                                            />
                                        </Pressable>
                                        <AppText font="instrument-medium" size="xs" className="text-white/80 mt-1.5 text-center" numberOfLines={2}>
                                            Talk to Anua
                                        </AppText>
                                    </View>

                                    {/* Share with Community Button */}
                                    <View className="items-center flex-1">
                                        <Pressable
                                            onPress={() => setView('community')}
                                            className="active:opacity-80"
                                            style={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 9999,
                                                backgroundColor: '#87AE73',
                                                shadowColor: '#6B8E5A',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.4,
                                                shadowRadius: 12,
                                                elevation: 6,
                                                borderWidth: 2,
                                                borderColor: '#A8C99A',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <TreeOfLifeIcon size={35} color="#FFD700" />
                                        </Pressable>
                                        <AppText font="instrument-medium" size="xs" className="text-white/80 mt-1.5 text-center" numberOfLines={2}>
                                            Share with Community
                                        </AppText>
                                    </View>

                                    {/* Community Halls Button */}
                                    <View className="items-center flex-1">
                                        <Pressable
                                            onPress={() => {
                                                onClose()
                                                router.push('/CommunityHalls')
                                            }}
                                            className="active:opacity-80"
                                            style={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 9999,
                                                backgroundColor: '#87AE73',
                                                shadowColor: '#6B8E5A',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.4,
                                                shadowRadius: 12,
                                                elevation: 6,
                                                borderWidth: 2,
                                                borderColor: '#A8C99A',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                overflow: 'hidden',
                                            }}
                                        >
                                        <Image
                                            source={require('@/assets/images/Hero_tulip_LOGO_MASTER.png')}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                resizeMode: 'contain',
                                            }}
                                        />
                                        </Pressable>
                                        <AppText font="instrument-medium" size="xs" className="text-white/80 mt-1.5 text-center" numberOfLines={2}>
                                            Community Halls
                                        </AppText>
                                    </View>
                                </View>

                                {/* Community Highlights - Compact */}
                                <View className="mt-2">
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="people" size={18} color="#87AE73" />
                                        <AppText font="instrument-bold" size="sm" className="ml-2" style={{ color: '#87AE73' }}>
                                            Community Highlights
                                        </AppText>
                                    </View>
                                    <View className="gap-2">
                                        {/* Placeholder Quote 1 */}
                                        <View className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                                            <View className="flex-row items-center justify-between mb-1">
                                                <AppText font="instrument-medium" size="xs" className="text-gray-300">
                                                    Jenrah
                                                </AppText>
                                            </View>
                                            <AppText font="instrument-regular" size="xs" className="text-white/80 leading-4 italic">
                                                "I think I already had a massive awareness moment. Just planting into the Earth, and remembering the stars. That was enough for my soul"
                                            </AppText>
                                        </View>
                                        {/* Placeholder Quote 2 */}
                                        <View className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                                            <View className="flex-row items-center justify-between mb-1">
                                                <AppText font="instrument-medium" size="xs" className="text-gray-300">
                                                    Onyx
                                                </AppText>
                                            </View>
                                            <AppText font="instrument-regular" size="xs" className="text-white/80 leading-4 italic">
                                                "I am struggling with my root. I don't feel good at grounding. Anyone else feel this way"
                                            </AppText>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}

                    {/* Community View - Show reflections and input */}
                    {view === 'community' && (
                        <>
                            {/* Back Button */}
                            <View className="px-6 py-3 border-b border-gray-800">
                                <Pressable
                                    onPress={() => setView('options')}
                                    className="flex-row items-center"
                                >
                                    <Ionicons name="arrow-back" size={20} color="white" />
                                    <AppText font="instrument-medium" className="text-white ml-2">
                                        Back to Options
                                    </AppText>
                                </Pressable>
                            </View>

                            {/* Reflections List */}
                            <ScrollView 
                                className="flex-1 px-6 py-4"
                                contentContainerStyle={{ 
                                    flexGrow: 1,
                                    paddingBottom: 20,
                                }}
                                showsVerticalScrollIndicator={true}
                            >
                        {isLoading ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <ActivityIndicator size="large" color="#9333ea" />
                                <AppText font="instrument-regular" className="text-gray-400 mt-4">
                                    Loading reflections...
                                </AppText>
                            </View>
                        ) : error ? (
                            <View className="py-8">
                                <AppText font="instrument-regular" className="text-red-400 text-center">
                                    {error}
                                </AppText>
                                <Pressable
                                    onPress={loadReflections}
                                    className="mt-4 bg-purple-700/50 rounded-lg p-3 self-center"
                                >
                                    <AppText font="instrument-medium" className="text-white">
                                        Retry
                                    </AppText>
                                </Pressable>
                            </View>
                        ) : reflections.length === 0 ? (
                            <View className="py-20 items-center">
                                <Ionicons name="people-outline" size={64} color="#4b5563" />
                                <AppText font="instrument-regular" className="text-gray-400 mt-4 text-center">
                                    No reflections yet.{'\n'}Be the first to share your experience.
                                </AppText>
                            </View>
                        ) : (
                            <View className="gap-4">
                                {reflections.map((reflection) => (
                                    <View
                                        key={reflection.id}
                                        className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
                                    >
                                        <View className="flex-row items-center justify-between mb-2">
                                            <AppText font="instrument-medium" className="text-gray-300">
                                                {reflection.isAnonymous ? 'Anonymous Soul' : 'Soul'}
                                            </AppText>
                                            <AppText font="instrument-regular" size="xs" className="text-gray-500">
                                                {formatTimestamp(reflection.timestamp)}
                                            </AppText>
                                        </View>
                                        <AppText font="instrument-regular" className="text-white leading-6">
                                            {reflection.message}
                                        </AppText>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                            {/* Input Section */}
                            <View className="border-t border-gray-800 bg-black p-6">
                                <View className="flex-row items-center mb-3">
                                    <Pressable
                                        onPress={() => setIsAnonymous(!isAnonymous)}
                                        className="flex-row items-center"
                                    >
                                        <Ionicons
                                            name={isAnonymous ? 'checkbox-outline' : 'checkbox'}
                                            size={20}
                                            color={isAnonymous ? '#9333ea' : '#6b7280'}
                                        />
                                        <AppText font="instrument-regular" size="sm" className="text-gray-400 ml-2">
                                            Post anonymously
                                        </AppText>
                                    </Pressable>
                                </View>
                                <View className="flex-row items-end gap-2">
                                    <TextInput
                                        value={message}
                                        onChangeText={(text) => {
                                            // Sanitize input: remove potential XSS characters
                                            const sanitized = text.replace(/[<>]/g, '')
                                            if (sanitized.length <= 500) {
                                                setMessage(sanitized)
                                            }
                                        }}
                                        placeholder="Share your reflection..."
                                        placeholderTextColor="#6b7280"
                                        multiline
                                        maxLength={500}
                                        className="flex-1 bg-gray-900/50 rounded-lg p-4 text-white border border-gray-800 min-h-[80px]"
                                        style={{ textAlignVertical: 'top' }}
                                    />
                                    <Pressable
                                        onPress={handleSubmit}
                                        disabled={!message.trim() || isSubmitting}
                                        className="bg-purple-700 rounded-lg p-4 active:opacity-80 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Ionicons name="send" size={20} color="white" />
                                        )}
                                    </Pressable>
                                </View>
                                <AppText font="instrument-regular" size="xs" className="text-gray-500 mt-2 text-right">
                                    {message.length}/500
                                </AppText>
                            </View>
                        </>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    )
}

