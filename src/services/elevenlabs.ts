/**
 * ElevenLabs Text-to-Speech Service
 *
 * Provides voice synthesis for Anua using ElevenLabs API.
 * Anua's voice is configured to be calm, wise, and guide-like.
 * 
 * Note: Anua's name is pronounced "Aw-Nu-uh" (not "Uh-nu-uh").
 * When generating text for Anua to speak, ensure her name is spelled phonetically
 * or with pronunciation hints if the voice synthesis needs guidance.
 */

import Constants from 'expo-constants'
import { Audio } from 'expo-av'
import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { checkRateLimit, waitForRateLimit, getTimeUntilNextRequest } from '@/src/utils/rateLimiter'
import { robustApiCall, API_TIMEOUTS, requestDeduplicator } from '@/src/utils/apiHelpers'
import { captureException } from '@/src/services/sentry'

/**
 * Get ElevenLabs API Key from environment variables via expo-constants
 */
const getElevenLabsApiKey = (): string => {
    const apiKey = Constants.expoConfig?.extra?.elevenlabs?.apiKey

    if (!apiKey || apiKey === '') {
        throw new Error(
            'ElevenLabs API key is not configured. Please add ELEVENLABS_API_KEY to your .env file and app.config.js',
        )
    }

    return apiKey
}

/**
 * Get Anua's Voice ID from environment variables via expo-constants
 */
const getAnuaVoiceId = (): string => {
    const voiceId = Constants.expoConfig?.extra?.elevenlabs?.anuaVoiceId

    if (!voiceId || voiceId === '') {
        throw new Error(
            'Anua Voice ID is not configured. Please add ANUA_VOICE_ID to your .env file and app.config.js',
        )
    }

    return voiceId
}

const ELEVENLABS_API_KEY = getElevenLabsApiKey()
const ANUA_VOICE_ID = getAnuaVoiceId()
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

/**
 * Voice configuration for Anua
 * Settings reflect a calm, wise guide
 */
const ANUA_VOICE_CONFIG = {
    model_id: 'eleven_multilingual_v2', // Stable multilingual model
    voice_settings: {
        stability: 0.75, // Higher stability for calm, consistent voice
        similarity_boost: 0.75, // Balanced similarity for natural voice
        style: 0.5, // Moderate style for wise, measured delivery
        use_speaker_boost: true, // Enhance voice clarity
    },
} as const

/**
 * Synthesize speech from text using Anua's voice
 *
 * @param text - The text to synthesize
 * @param options - Optional configuration overrides
 * @returns Promise that resolves to an Audio.Sound object ready to play
 */
export const synthesizeAnuaVoice = async (
    text: string,
    options?: {
        stability?: number
        similarity_boost?: number
        style?: number
    },
): Promise<Audio.Sound> => {
    try {
        // Check rate limit before making request
        if (!checkRateLimit('elevenlabs')) {
            const waitTime = getTimeUntilNextRequest('elevenlabs')
            if (waitTime > 0) {
                // Wait for rate limit window to open
                await waitForRateLimit('elevenlabs')
            }
        }

        const voiceSettings = {
            ...ANUA_VOICE_CONFIG.voice_settings,
            ...(options && {
                stability: options.stability ?? ANUA_VOICE_CONFIG.voice_settings.stability,
                similarity_boost:
                    options.similarity_boost ??
                    ANUA_VOICE_CONFIG.voice_settings.similarity_boost,
                style: options.style ?? ANUA_VOICE_CONFIG.voice_settings.style,
            }),
        }

        // Use deduplication for identical text requests
        const requestKey = `elevenlabs_${text.substring(0, 50)}_${voiceSettings.stability}_${voiceSettings.similarity_boost}`
        
        const response = await requestDeduplicator.deduplicate(
            requestKey,
            () => robustApiCall(
                async () => {
                    return await fetch(`${ELEVENLABS_API_URL}/${ANUA_VOICE_ID}`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'audio/mpeg',
                            'Content-Type': 'application/json',
                            'xi-api-key': ELEVENLABS_API_KEY,
                        },
                        body: JSON.stringify({
                            text,
                            model_id: ANUA_VOICE_CONFIG.model_id,
                            voice_settings: voiceSettings,
                        }),
                    })
                },
                API_TIMEOUTS.elevenlabs,
                {
                    maxRetries: 2,
                    retryDelay: 2000,
                    retryableErrors: ['Network error', 'timeout', 'ECONNRESET'],
                },
                {
                    service: 'elevenlabs',
                    operation: 'synthesizeAnuaVoice',
                    textLength: text.length,
                },
            ),
            10000, // 10 second cache for identical requests
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`,
            )
        }

        // Convert response to a format that expo-av can use
        // For web, use blob URL; for React Native (iOS/Android), save to temporary file
        let audioUri: string

        // Check if we're on web platform (not React Native)
        if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.URL !== 'undefined' && typeof window.URL.createObjectURL === 'function') {
            // Web platform - use blob URL
            const audioBlob = await response.blob()
            audioUri = window.URL.createObjectURL(audioBlob)
        } else {
            // React Native - save to temporary file using expo-file-system
            // Use response.arrayBuffer() directly (works in React Native)
            const fileUri = FileSystem.cacheDirectory + `anua_voice_${Date.now()}.mp3`
            
            try {
                // Get array buffer directly from response (works in React Native)
                const arrayBuffer = await response.arrayBuffer()
                const bytes = new Uint8Array(arrayBuffer)
                
                // Convert ArrayBuffer to base64 string
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
                let base64String = ''
                let i = 0
                const len = bytes.length
                
                while (i < len) {
                    const a = bytes[i++]
                    const b = i < len ? bytes[i++] : 0
                    const c = i < len ? bytes[i++] : 0
                    
                    const bitmap = (a << 16) | (b << 8) | c
                    
                    base64String += chars.charAt((bitmap >> 18) & 63)
                    base64String += chars.charAt((bitmap >> 12) & 63)
                    base64String += i - 2 < len ? chars.charAt((bitmap >> 6) & 63) : '='
                    base64String += i - 1 < len ? chars.charAt(bitmap & 63) : '='
                }
                
                // Write base64 string to file
                await FileSystem.writeAsStringAsync(fileUri, base64String, {
                    encoding: FileSystem.EncodingType.Base64,
                })
                audioUri = fileUri
            } catch (fileError) {
                if (__DEV__) {
                    console.error('Error writing audio file to cache:', fileError)
                }
                // If file write fails, try using document directory instead
                try {
                    const docUri = FileSystem.documentDirectory + `anua_voice_${Date.now()}.mp3`
                    // Retry with arrayBuffer
                    const arrayBuffer = await response.arrayBuffer()
                    const bytes = new Uint8Array(arrayBuffer)
                    
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
                    let base64String = ''
                    let i = 0
                    const len = bytes.length
                    
                    while (i < len) {
                        const a = bytes[i++]
                        const b = i < len ? bytes[i++] : 0
                        const c = i < len ? bytes[i++] : 0
                        
                        const bitmap = (a << 16) | (b << 8) | c
                        
                        base64String += chars.charAt((bitmap >> 18) & 63)
                        base64String += chars.charAt((bitmap >> 12) & 63)
                        base64String += i - 2 < len ? chars.charAt((bitmap >> 6) & 63) : '='
                        base64String += i - 1 < len ? chars.charAt(bitmap & 63) : '='
                    }
                    
                    await FileSystem.writeAsStringAsync(docUri, base64String, {
                        encoding: FileSystem.EncodingType.Base64,
                    })
                    audioUri = docUri
                } catch (docError) {
                    if (__DEV__) {
                        console.error('Error writing audio file to document directory:', docError)
                    }
                    throw new Error(`Failed to save audio file: ${docError instanceof Error ? docError.message : 'Unknown error'}`)
                }
            }
        }

        // Create and configure audio sound
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        })

        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            {
                shouldPlay: false,
                isLooping: false,
            },
        )

        return sound
    } catch (error) {
        const errorToLog = error instanceof Error ? error : new Error(String(error))
        
        // Log to Sentry with context
        captureException(errorToLog, {
            service: 'elevenlabs',
            operation: 'synthesizeAnuaVoice',
            textLength: text.length,
        })
        
        if (__DEV__) {
            console.error('Error synthesizing Anua voice:', error)
        }
        throw errorToLog
    }
}

/**
 * Play Anua's voice from text
 * Convenience function that synthesizes and plays in one call
 *
 * @param text - The text for Anua to speak
 * @param options - Optional voice configuration overrides
 * @returns Promise that resolves when playback completes
 */
export const speakAsAnua = async (
    text: string,
    options?: {
        stability?: number
        similarity_boost?: number
        style?: number
    },
): Promise<void> => {
    try {
        const sound = await synthesizeAnuaVoice(text, options)

        return new Promise((resolve, reject) => {
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    if (status.didJustFinish) {
                        sound.unloadAsync().then(() => resolve()).catch(reject)
                    }
                } else {
                    // Handle loading errors
                    sound.unloadAsync().then(() => {
                        reject(new Error('Failed to load audio'))
                    }).catch(reject)
                }
            })

            sound.playAsync().catch(reject)
        })
    } catch (error) {
        if (__DEV__) {
            console.error('Error speaking as Anua:', error)
        }
        throw error
    }
}

/**
 * Check if ElevenLabs is configured
 */
export const isElevenLabsAvailable = (): boolean => {
    try {
        const apiKey = Constants.expoConfig?.extra?.elevenlabs?.apiKey
        const voiceId = Constants.expoConfig?.extra?.elevenlabs?.anuaVoiceId
        return !!apiKey && !!voiceId && apiKey !== '' && voiceId !== ''
    } catch {
        return false
    }
}

/**
 * Anua's first vow - her greeting message
 */
export const ANUA_FIRST_VOW =
    'The bridge is built, Professor. I am Anua, and I am ready to guide our students from head to heart.'

