/**
 * Voice Recording Modal
 *
 * Audio-only recording interface for The Voice Sanctuary.
 * Users create responses with their voice - no text input option.
 *
 * Philosophy: "Speak from the heart, not from the mind"
 * - Audio-only input (no "Type" button)
 * - Transcription is for READING, not creating
 * - We maintain the boundary - the ego defaults to the path of least resistance
 */

import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Audio } from "expo-av"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { isSpeechToTextAvailable } from "@/src/services/speechToText"

interface VoiceRecordingModalProps {
  visible: boolean
  onClose: () => void
  onRecordingComplete?: (audioUri: string, duration: number) => void
  maxDurationSeconds?: number // Default: 300 (5 minutes)
}

const MAX_DURATION_SECONDS = 300 // 5 minutes default

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  visible,
  onClose,
  onRecordingComplete,
  maxDurationSeconds = MAX_DURATION_SECONDS,
}) => {
  const [permission, setPermission] = useState<{ granted: boolean } | null>(
    null,
  )
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Animation for pulsing recording circle
  const pulseScale = useSharedValue(1)
  const pulseOpacity = useSharedValue(1)

  // Request audio permissions on mount
  useEffect(() => {
    if (visible) {
      requestAudioPermission()
    }
  }, [visible])

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setRecordedAudioUri(null)
      setIsRecording(false)
      setRecordingDuration(0)
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {
          // Silent fail - recording may already be stopped
        })
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      pulseScale.value = 1
      pulseOpacity.value = 1
    }
  }, [visible])

  // Start pulsing animation when recording
  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      )
      pulseOpacity.value = withRepeat(
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      )
    } else {
      pulseScale.value = withTiming(1, { duration: 300 })
      pulseOpacity.value = withTiming(1, { duration: 300 })
    }
  }, [isRecording])

  const requestAudioPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      setPermission({ granted: status === "granted" })

      if (status === "granted") {
        // Configure audio mode for recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        })
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error requesting audio permission:", error)
      }
      setPermission({ granted: false })
    }
  }

  const startRecording = async () => {
    try {
      if (!permission?.granted) {
        await requestAudioPermission()
        if (!permission?.granted) {
          Alert.alert(
            "Microphone Permission Required",
            "Please allow microphone access to record your voice response.",
          )
          return
        }
      }

      addHapticFeedback(HapticStrength.Medium)

      // Create new recording
      const recording = new Audio.Recording()

      // Prepare recording with compression settings (AAC, mono, 64kbps for voice)
      await recording.prepareToRecordAsync({
        android: {
          extension: ".aac",
          outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for voice (smaller file size)
          bitRate: 64000, // 64kbps sufficient for voice
        },
        ios: {
          extension: ".aac",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for voice
          bitRate: 64000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/aac",
          bitsPerSecond: 64000,
        },
      })

      // Start recording
      await recording.startAsync()
      recordingRef.current = recording
      setIsRecording(true)
      setRecordingDuration(0)

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1

          // Auto-stop at max duration
          if (newDuration >= maxDurationSeconds) {
            stopRecording()
          }

          return newDuration
        })
      }, 1000)
    } catch (error) {
      if (__DEV__) {
        console.error("Error starting recording:", error)
      }
      Alert.alert("Error", "Failed to start recording. Please try again.")
      setIsRecording(false)
    }
  }

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return

      addHapticFeedback(HapticStrength.Medium)

      // Stop recording and get URI
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()

      if (uri) {
        setRecordedAudioUri(uri)
        setIsRecording(false)

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
          durationIntervalRef.current = null
        }

        if (onRecordingComplete) {
          onRecordingComplete(uri, recordingDuration)
        }
      } else {
        throw new Error("Recording failed - no audio URI returned")
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error stopping recording:", error)
      }
      Alert.alert("Error", "Failed to stop recording. Please try again.")
      setIsRecording(false)
    }
  }

  const handleRetake = () => {
    setRecordedAudioUri(null)
    setRecordingDuration(0)
    addHapticFeedback(HapticStrength.Light)
  }

  const handleClose = () => {
    // Clean up if recording in progress
    if (isRecording && recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {
        // Silent fail
      })
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
    onClose()
  }

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Animated styles for pulsing circle
  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    }
  })

  if (!visible) return null

  // Safety Lock: If Speech-to-Text API is not available, show disabled message
  // Check if speech-to-text is available (synchronous check)
  const isFeatureAvailable = isSpeechToTextAvailable()

  if (!isFeatureAvailable) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.disabledContainer}>
              <Pressable onPress={handleClose} style={styles.closeIconButton}>
                <Ionicons name="close" size={24} color="#D4C5A9" />
              </Pressable>
              <Ionicons name="lock-closed" size={64} color="#8B7355" />
              <AppText
                font="instrument-bold"
                size="xl"
                style={styles.disabledTitle}
              >
                Voice Sanctuary Unavailable
              </AppText>
              <AppText
                font="instrument-regular"
                size="base"
                style={styles.disabledText}
              >
                The Voice Sanctuary feature requires Speech-to-Text API
                configuration for moderation.
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={styles.disabledSubtext}
              >
                This feature will be available once the API key is configured.
              </AppText>
              <Pressable onPress={handleClose} style={styles.disabledButton}>
                <AppText
                  font="instrument-medium"
                  size="base"
                  style={styles.disabledButtonText}
                >
                  Close
                </AppText>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    )
  }

  // Request permission state
  if (!permission) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A8C99A" />
              <AppText
                font="instrument-regular"
                size="base"
                style={styles.loadingText}
              >
                Checking microphone permissions...
              </AppText>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    )
  }

  // Permission denied state
  if (!permission.granted) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.permissionContainer}>
              <Ionicons name="mic-outline" size={64} color="#A8C99A" />
              <AppText
                font="instrument-bold"
                size="xl"
                style={styles.permissionTitle}
              >
                Microphone Permission Required
              </AppText>
              <AppText
                font="instrument-regular"
                size="base"
                style={styles.permissionText}
              >
                We need access to your microphone to record your voice response.
              </AppText>
              <Pressable
                onPress={requestAudioPermission}
                style={styles.permissionButton}
              >
                <LinearGradient
                  colors={["#8B7355", "#A8C99A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <AppText
                    font="instrument-bold"
                    size="lg"
                    style={styles.permissionButtonText}
                  >
                    Grant Permission
                  </AppText>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={styles.closeButtonText}
                >
                  Cancel
                </AppText>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    )
  }

  // Recording interface
  if (!recordedAudioUri) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.recordingContainer}>
              {/* Close button */}
              <Pressable onPress={handleClose} style={styles.closeIconButton}>
                <Ionicons name="close" size={24} color="#D4C5A9" />
              </Pressable>

              {/* Title */}
              <AppText font="instrument-bold" size="xl" style={styles.title}>
                Record Your Response
              </AppText>

              {/* Guidance text */}
              <AppText
                font="instrument-regular"
                size="sm"
                style={styles.guidanceText}
              >
                Speak from the heart
              </AppText>

              {/* Pulsing recording circle */}
              <View style={styles.circleContainer}>
                <Animated.View
                  style={[styles.pulseCircle, animatedCircleStyle]}
                >
                  <View style={styles.recordingCircle}>
                    {isRecording ? (
                      <Ionicons name="mic" size={48} color="#D4C5A9" />
                    ) : (
                      <Ionicons name="mic-outline" size={48} color="#A8C99A" />
                    )}
                  </View>
                </Animated.View>
              </View>

              {/* Duration display */}
              <AppText
                font="instrument-bold"
                size="2xl"
                style={styles.durationText}
              >
                {formatDuration(recordingDuration)}
              </AppText>

              {/* Max duration indicator */}
              <AppText
                font="instrument-regular"
                size="xs"
                style={styles.maxDurationText}
              >
                Max {formatDuration(maxDurationSeconds)}
              </AppText>

              {/* Recording button */}
              <Pressable
                onPress={isRecording ? stopRecording : startRecording}
                style={styles.recordButton}
                onLongPress={startRecording}
                delayLongPress={0}
              >
                <LinearGradient
                  colors={
                    isRecording
                      ? ["#DC2626", "#B91C1C"]
                      : ["#8B7355", "#A8C99A"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <AppText
                    font="instrument-bold"
                    size="lg"
                    style={styles.recordButtonText}
                  >
                    {isRecording ? "Release to Stop" : "Hold to Record"}
                  </AppText>
                </LinearGradient>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    )
  }

  // Recorded audio preview
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.previewContainer}>
            {/* Close button */}
            <Pressable onPress={handleClose} style={styles.closeIconButton}>
              <Ionicons name="close" size={24} color="#D4C5A9" />
            </Pressable>

            {/* Title */}
            <AppText font="instrument-bold" size="xl" style={styles.title}>
              Recording Complete
            </AppText>

            {/* Duration display */}
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.previewDuration}
            >
              Duration: {formatDuration(recordingDuration)}
            </AppText>

            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <Pressable onPress={handleRetake} style={styles.secondaryButton}>
                <AppText
                  font="instrument-medium"
                  size="base"
                  style={styles.secondaryButtonText}
                >
                  Retake
                </AppText>
              </Pressable>

              <Pressable onPress={handleClose} style={styles.primaryButton}>
                <LinearGradient
                  colors={["#8B7355", "#A8C99A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <AppText
                    font="instrument-bold"
                    size="lg"
                    style={styles.primaryButtonText}
                  >
                    Use This Recording
                  </AppText>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#A8C99A",
    overflow: "hidden",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#D4C5A9",
    textAlign: "center",
  },
  permissionContainer: {
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  permissionTitle: {
    color: "#D4C5A9",
    textAlign: "center",
    marginTop: 8,
  },
  permissionText: {
    color: "#A8C99A",
    textAlign: "center",
    opacity: 0.8,
  },
  permissionButton: {
    width: "100%",
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButton: {
    padding: 12,
    marginTop: 8,
  },
  closeButtonText: {
    color: "#8B7355",
    textAlign: "center",
  },
  disabledContainer: {
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  disabledTitle: {
    color: "#D4C5A9",
    textAlign: "center",
    marginTop: 8,
  },
  disabledText: {
    color: "#A8C99A",
    textAlign: "center",
    opacity: 0.8,
    marginTop: 8,
  },
  disabledSubtext: {
    color: "#8B7355",
    textAlign: "center",
    opacity: 0.6,
    fontStyle: "italic",
    marginTop: 4,
  },
  disabledButton: {
    marginTop: 16,
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8B7355",
  },
  disabledButtonText: {
    color: "#D4C5A9",
  },
  recordingContainer: {
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  closeIconButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  title: {
    color: "#D4C5A9",
    textAlign: "center",
    marginTop: 8,
  },
  guidanceText: {
    color: "#A8C99A",
    textAlign: "center",
    opacity: 0.8,
    fontStyle: "italic",
  },
  circleContainer: {
    marginVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(168, 201, 154, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#5A4A3A",
    borderWidth: 2,
    borderColor: "#A8C99A",
    alignItems: "center",
    justifyContent: "center",
  },
  durationText: {
    color: "#D4C5A9",
    marginTop: 8,
  },
  maxDurationText: {
    color: "#8B7355",
    opacity: 0.6,
  },
  recordButton: {
    width: "100%",
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  previewContainer: {
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  previewDuration: {
    color: "#A8C99A",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8B7355",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#D4C5A9",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonText: {
    color: "#000000",
  },
  permissionButtonText: {
    color: "#000000",
  },
  primaryButtonText: {
    color: "#000000",
  },
})
