/**
 * Mini Audio Player
 * 
 * Compact audio player that appears at the bottom of ChakraTemplate
 * Only shows for non-meditation audio (outro audio, not embodiment meditations)
 * Acts as a UI indicator and navigation to full audio player
 * Does not manage audio playback itself (audio is managed by AudioPlayer screen)
 */

import React from 'react'
import { View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { getMinutesString } from '@/utils/format'
import { LinearGradient } from 'expo-linear-gradient'

export const MiniAudioPlayer = () => {
  const router = useRouter()
  const source = useCurrentAudioStore((state) => state.source)
  const metadata = useCurrentAudioStore((state) => state.metadata)
  const prefs = useCurrentAudioStore((state) => state.prefs)
  
  // Only show if audio is set and it's NOT intro audio (embodiment meditations)
  // This indicates the user has started playing outro audio and may want to continue reading
  const shouldShow = source && metadata && prefs && !prefs.isIntroAudio
  
  const openFullPlayer = () => {
    router.push('/AudioPlayer')
  }
  
  if (!shouldShow || !metadata) {
    return null
  }
  
  return (
    <Pressable
      onPress={openFullPlayer}
      className="absolute bottom-20 left-4 right-4 z-40 active:opacity-90"
      style={{
        shadowColor: '#9D4EDD',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={['rgba(157, 78, 221, 0.9)', 'rgba(123, 44, 191, 0.85)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: '#FFD700',
        }}
      >
        <View className="flex-row items-center">
          {/* Audio Icon */}
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
            <Ionicons
              name="musical-notes"
              size={18}
              color="#FFFFFF"
            />
          </View>
          
          {/* Track Info */}
          <View className="flex-1 mr-3">
            <AppText font="instrument-medium" size="sm" className="text-white" numberOfLines={1}>
              {metadata.title}
            </AppText>
            <AppText font="instrument-regular" size="xs" className="text-white/80 mt-1">
              Tap to open audio player
            </AppText>
          </View>
          
          {/* Expand Icon */}
          <Ionicons name="expand" size={20} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </Pressable>
  )
}

