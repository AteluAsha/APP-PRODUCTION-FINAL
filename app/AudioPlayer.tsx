import { ActionBar } from "@/components/ActionBar"
import { useCallback, useEffect, useRef } from "react"
import { useState } from "react"
import { View, TouchableHighlight } from "react-native"
import { Audio, AVPlaybackStatus } from "expo-av"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { PlayerProgressBar } from "@/components/chakras/PlayerProgressBar"
import RadialGradientAnimation from "@/components/chakras/RadialGradientAnimation"
import Rewind10 from "@/assets/svg/rewind10.svg"
import Forward10 from "@/assets/svg/forward10.svg"
import { performIntroRitual } from "@/src/services/anuaRitualService"

const AudioPlayer = () => {
  // Subscribe to store changes to get current values
  const source = useCurrentAudioStore((state) => state.source)
  const metadata = useCurrentAudioStore((state) => state.metadata)
  const prefs = useCurrentAudioStore((state) => state.prefs)

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // This ensures React hooks are always called in the same order on every render
  const [track, setTrack] = useState<Audio.Sound>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [positionMs, setPosition] = useState(0)
  const [durationMs, setDuration] = useState<number>(metadata?.durationMs || 0)
  const [justFinished, setJustFinished] = useState(false)
  const introRitualTriggered = useRef(false)
  const isLoadedRef = useRef(false)

  // Define callbacks - safe to call even if source/metadata/prefs are null
  const seekToPosition = useCallback(
    async (newPositionMs: number) => {
      if (track) {
        await track.setPositionAsync(newPositionMs)
        setPosition(newPositionMs)
      }
    },
    [track],
  )

  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!metadata) return // Safe guard
      
      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)
        
        const duration =
          status.durationMillis && status.durationMillis > 0
            ? status.durationMillis
            : (metadata?.durationMs || 0)
        setPosition(status.positionMillis)
        setDuration(duration)

        if (status.didJustFinish) {
          setJustFinished(true)
        }
        
        // Auto-play when loaded if we're in loading state
        // This handles the case where audio finishes loading after initialization
        if (isLoading && track && !isPlaying && isLoadedRef.current) {
          await track.playAsync()
          setIsPlaying(true)
          setIsLoading(false)
        }
      } else {
        if (status.error) {
          if (__DEV__) {
            console.error("AudioPlayer: Loading error:", status.error)
          }
        }
      }
    },
    [metadata, isLoading, track, isPlaying],
  )

  const initializeTrack = useCallback(async () => {
    if (!source || !prefs) return // Safe guard
    
    try {
      isLoadedRef.current = false
      setIsLoading(true)
      
      await Audio.setAudioModeAsync({ 
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      })
      
      const { sound } = await Audio.Sound.createAsync(
        source,
        { 
          shouldPlay: false,
          isLooping: prefs.shouldLoop || false,
        },
        onPlaybackStatusUpdate
      )
      
      setTrack(sound)
      await sound.setIsLoopingAsync(prefs.shouldLoop || false)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const status = await sound.getStatusAsync()
      if (status.isLoaded) {
        isLoadedRef.current = true
        setIsLoading(false)
        await sound.playAsync()
        setIsPlaying(true)
      } else {
        setIsLoading(true)
      }
    } catch (error) {
      const errorToLog = error instanceof Error ? error : new Error(String(error))
      
      // Log to Sentry
      const { captureException } = require('@/src/services/sentry')
      captureException(errorToLog, {
        component: 'AudioPlayer',
        operation: 'initializeTrack',
        hasSource: !!source,
        hasPrefs: !!prefs,
      })
      
      if (__DEV__) {
        console.error("AudioPlayer: Error creating sound:", error)
      }
      setTrack(undefined)
      setIsPlaying(false)
      setIsLoading(false)
      isLoadedRef.current = false
    }
  }, [onPlaybackStatusUpdate, source, prefs])

  useEffect(() => {
    if (!prefs) return // Safe guard
    
    if (!prefs.shouldLoop && justFinished) {
      seekToPosition(0)
      track?.pauseAsync()
      setIsPlaying(false)
      setJustFinished(false)

      if (prefs.isIntroAudio && !introRitualTriggered.current) {
        introRitualTriggered.current = true
        performIntroRitual().catch((error) => {
          if (__DEV__) {
            console.error('AudioPlayer: Error performing Intro Ritual:', error)
          }
        })
      }
    }
  }, [justFinished, seekToPosition, track, prefs])

  useEffect(() => {
    if (!source || !prefs) return // Safe guard - don't initialize if data missing
    
    if (!track) {
      isLoadedRef.current = false
      setIsLoading(false)
      initializeTrack()
      introRitualTriggered.current = false
    }
    return () => {
      if (track) {
        track.unloadAsync().catch((error) => {
          if (__DEV__) {
            console.error("AudioPlayer: Error unloading sound:", error)
          }
        })
        setTrack(undefined)
        setIsPlaying(false)
        setIsLoading(false)
        isLoadedRef.current = false
        useCurrentAudioStore.getState().reset()
        introRitualTriggered.current = false
      }
    }
  }, [initializeTrack, track, source, prefs])

  // NOW we can check for missing data and return early
  // All hooks have been declared above, so React's hook order is preserved
  if (!source || !metadata || !prefs) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <AppText font="instrument-regular" size="lg" className="text-white text-center px-4">
          No audio selected. Please select an audio file to play.
        </AppText>
      </View>
    )
  }

  async function togglePlayPause() {
    if (!track) {
      await initializeTrack()
    } else if (isPlaying) {
      await track.pauseAsync()
      setIsPlaying(false)
    } else {
      if (isLoadedRef.current) {
        await track.playAsync()
        setIsPlaying(true)
      } else {
        setIsLoading(true)
      }
    }
  }

  const rewind10 = async () => {
    if (track) {
      const newPosition = Math.max(positionMs - 10000, 0)
      await track.setPositionAsync(newPosition)
      setPosition(newPosition)
    }
  }

  const forward10 = async () => {
    if (track) {
      const newPosition = Math.min(positionMs + 10000, durationMs)
      await track.setPositionAsync(newPosition)
      setPosition(newPosition)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <RadialGradientAnimation />
      <ActionBar useXButton={true} />
      <View className="flex-1 flex-col justify-end mt-1 mx-4">
        <View className="flex-col items-center mb-12">
          <AppText font="instrument-regular" size="2xl" className="mb-2">
            {metadata.title}
          </AppText>
          <AppText font="fira-code" size="lg">
            {metadata.author}
          </AppText>
        </View>
        <View className="flex-col items-center">
          <PlayerProgressBar
            durationMs={durationMs}
            positionMs={positionMs}
            seekToPosition={seekToPosition}
          />
          <View className="flex-row items-center mb-16">
            <TouchableHighlight
              className="flex items-center justify-center"
              onPress={rewind10}
            >
              <Rewind10 width={32} height={32} color="white" />
            </TouchableHighlight>
            <TouchableHighlight
              className="mx-14 w-16 h-16 border border-white rounded-full flex items-center justify-center"
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={18}
                color="white"
                className={isPlaying ? "" : "ml-0.5"}
              />
            </TouchableHighlight>
            <TouchableHighlight
              className="flex items-center justify-center"
              onPress={forward10}
            >
              <Forward10 width={32} height={32} color="white" />
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AudioPlayer
