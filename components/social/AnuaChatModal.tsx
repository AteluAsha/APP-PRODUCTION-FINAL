/**
 * Anua Chat Modal
 *
 * A chat interface for talking to Anua via text or voice
 * Uses Gemini AI for responses and ElevenLabs for voice synthesis
 */

import React, { useState, useRef, useEffect } from 'react'
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
import { askAnua, isAnuaAvailable } from '@/src/services/gemini'
import { speakAsAnua, isElevenLabsAvailable } from '@/src/services/elevenlabs'

interface AnuaChatModalProps {
    visible: boolean
    onClose: () => void
    chakraDay: number // 0-6 (Monday-Sunday)
    chakraName: string // e.g., "Root Chakra", "Heart Chakra"
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface ChatMessage {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
}

export const AnuaChatModal: React.FC<AnuaChatModalProps> = ({
    visible,
    onClose,
    chakraDay,
    chakraName,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [useVoice, setUseVoice] = useState(true)
    const scrollViewRef = useRef<ScrollView>(null)

    // Initialize with Anua's greeting when modal opens
    useEffect(() => {
        if (visible && messages.length === 0) {
            const greeting: ChatMessage = {
                id: 'greeting',
                text: `Hello, beautiful soul. I'm Anua, your guide for this ${chakraName} journey. How are you feeling today on this ${DAY_NAMES[chakraDay]}?`,
                isUser: false,
                timestamp: new Date(),
            }
            setMessages([greeting])
            
            // Speak the greeting if voice is enabled
            if (useVoice && isElevenLabsAvailable()) {
                speakAsAnua(greeting.text).catch((err) => {
                    if (__DEV__) {
                        console.error('Error speaking greeting:', err)
                    }
                })
            }
        } else if (!visible) {
            // Reset when modal closes
            setMessages([])
            setInputText('')
            setError(null)
        }
    }, [visible, chakraDay, chakraName, useVoice])

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0 && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true })
            }, 100)
        }
    }, [messages])

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) {
            return
        }

        // Check if Anua is available
        if (!isAnuaAvailable()) {
            setError('Anua is taking a moment to arrive. Please try again.')
            return
        }

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputText('')
        setIsLoading(true)
        setError(null)

        try {
            // Ask Anua with context about the current chakra day
            const response = await askAnua(
                inputText.trim(),
                {
                    temperature: 0.9,
                    maxTokens: 500,
                    enableVoice: false, // We'll handle voice separately
                },
                {
                    currentDay: chakraDay,
                    currentChakra: chakraName.toLowerCase(),
                    chakraName,
                },
            )

            const anuaMessage: ChatMessage = {
                id: `anua-${Date.now()}`,
                text: response,
                isUser: false,
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, anuaMessage])

            // Speak the response if voice is enabled
            if (useVoice && isElevenLabsAvailable()) {
                speakAsAnua(response).catch((err) => {
                    if (__DEV__) {
                        console.error('Error speaking Anua response:', err)
                    }
                })
            }
        } catch (err) {
            if (__DEV__) {
                console.error('Error talking to Anua:', err)
            }

            let errorMessage = 'Anua is having trouble connecting. Please try again, or continue your journey.'
            if (err instanceof Error) {
                if (err.message.includes('API key') || err.message.includes('not configured')) {
                    errorMessage = 'Anua is taking a moment to arrive. Please try again.'
                } else if (err.message.includes('network') || err.message.includes('fetch')) {
                    errorMessage = 'The connection is taking a moment. Please try again, or continue your journey.'
                } else if (err.message.includes('quota') || err.message.includes('limit')) {
                    errorMessage = 'Anua is resting. Please try again in a moment.'
                } else {
                    errorMessage = 'Anua is having trouble connecting. Please try again, or continue your journey.'
                }
            }

            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                        <View className="flex-1 flex-row items-center">
                            <Image
                                source={require('@/assets/images/Anua_Hero_Icon_Image.png')}
                                className="w-12 h-12 mr-3"
                                resizeMode="contain"
                                style={{ width: 48, height: 48 }}
                            />
                            <View className="flex-1">
                                <AppText font="instrument-bold" size="xl" className="text-white">
                                    Talk to Anua
                                </AppText>
                                <AppText font="instrument-regular" size="sm" className="text-gray-400 mt-1">
                                    {DAY_NAMES[chakraDay]} • {chakraName}
                                </AppText>
                            </View>
                        </View>
                        <Pressable onPress={onClose} className="p-2">
                            <Ionicons name="close" size={28} color="white" />
                        </Pressable>
                    </View>

                    {/* Voice Toggle */}
                    {isElevenLabsAvailable() && (
                        <View className="px-6 py-3 border-b border-gray-800">
                            <Pressable
                                onPress={() => setUseVoice(!useVoice)}
                                className="flex-row items-center"
                            >
                                <Ionicons
                                    name={useVoice ? 'volume-high' : 'volume-mute'}
                                    size={20}
                                    color={useVoice ? '#9333ea' : '#6b7280'}
                                />
                                <AppText font="instrument-regular" size="sm" className="text-gray-400 ml-2">
                                    {useVoice ? 'Voice enabled' : 'Voice disabled'}
                                </AppText>
                            </Pressable>
                        </View>
                    )}

                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-6 py-4"
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {messages.map((message) => (
                            <View
                                key={message.id}
                                className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
                            >
                                <View
                                    className={`max-w-[80%] rounded-lg p-4 ${
                                        message.isUser
                                            ? 'bg-purple-700/80'
                                            : 'bg-gray-900/80 border border-gray-800'
                                    }`}
                                >
                                    <AppText
                                        font="instrument-regular"
                                        className={message.isUser ? 'text-white' : 'text-white'}
                                    >
                                        {message.text}
                                    </AppText>
                                    <AppText
                                        font="instrument-regular"
                                        size="xs"
                                        className={`mt-2 ${message.isUser ? 'text-purple-200' : 'text-gray-500'}`}
                                    >
                                        {formatTime(message.timestamp)}
                                    </AppText>
                                </View>
                            </View>
                        ))}

                        {isLoading && (
                            <View className="mb-4 items-start">
                                <View className="bg-gray-900/80 border border-gray-800 rounded-lg p-4">
                                    <ActivityIndicator size="small" color="#9333ea" />
                                    <AppText font="instrument-regular" size="sm" className="text-gray-400 mt-2">
                                        Anua is thinking...
                                    </AppText>
                                </View>
                            </View>
                        )}

                        {error && (
                            <View className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
                                <AppText font="instrument-regular" className="text-red-400">
                                    {error}
                                </AppText>
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Section */}
                    <View className="border-t border-gray-800 bg-black p-6">
                        <View className="flex-row items-end gap-2">
                            <TextInput
                                value={inputText}
                                onChangeText={(text) => {
                                    const sanitized = text.replace(/[<>]/g, '')
                                    if (sanitized.length <= 500) {
                                        setInputText(sanitized)
                                    }
                                }}
                                placeholder="Ask Anua anything..."
                                placeholderTextColor="#6b7280"
                                multiline
                                maxLength={500}
                                className="flex-1 bg-gray-900/50 rounded-lg p-4 text-white border border-gray-800 min-h-[60px]"
                                style={{ textAlignVertical: 'top' }}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                            <Pressable
                                onPress={handleSend}
                                disabled={!inputText.trim() || isLoading}
                                className="bg-purple-700 rounded-lg p-4 active:opacity-80 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="send" size={20} color="white" />
                                )}
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    )
}

