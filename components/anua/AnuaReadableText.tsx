/**
 * Anua Readable Text Component
 *
 * Wraps text content to make it readable by Anua's voice.
 * When the user interacts with this component, Anua can read it aloud.
 */

import React from 'react'
import { Pressable, View } from 'react-native'
import { AppText } from '@/components/AppText'
import { readAsAnua, useAnuaReader } from '@/src/services/anuaReader'
import { Ionicons } from '@expo/vector-icons'

interface AnuaReadableTextProps {
    text: string
    sectionType?: 'chakra' | 'sound_healing' | 'chakra_study' | 'shadow_work' | 'head_to_heart' | 'general'
    includeReflection?: boolean
    children: React.ReactNode
    className?: string
    showReadButton?: boolean // Whether to show a "Read Aloud" button
}

export const AnuaReadableText: React.FC<AnuaReadableTextProps> = ({
    text,
    sectionType = 'general',
    includeReflection = false,
    children,
    className,
    showReadButton = true,
}) => {
    const { read, isAvailable } = useAnuaReader()

    const handleRead = async () => {
        try {
            await read(text, {
                includeReflection,
                sectionType,
            })
        } catch (error) {
            console.error('Error reading text:', error)
        }
    }

    if (!isAvailable) {
        // If Anua Reader is not available, just render children
        return <View className={className}>{children}</View>
    }

    return (
        <View className={className}>
            {children}
            {showReadButton && (
                <Pressable
                    onPress={handleRead}
                    className="mt-2 flex-row items-center self-start px-3 py-2 bg-purple-600/20 border border-purple-400/50 rounded-lg active:opacity-80"
                >
                    <Ionicons name="volume-high" size={16} color="#a78bfa" />
                    <AppText font="instrument-medium" size="sm" className="ml-2 text-purple-300">
                        Anua Read Aloud
                    </AppText>
                </Pressable>
            )}
        </View>
    )
}

