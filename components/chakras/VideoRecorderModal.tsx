/**
 * Video Recorder Modal
 *
 * Allows users to record a video and share it to social media.
 * The video is recorded locally and shared directly - no hosting required.
 */

import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native"
import {
  CameraView,
  useCameraPermissions,
  type CameraViewProps,
} from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Sharing from "expo-sharing"
import * as FileSystem from "expo-file-system"
import * as Clipboard from "expo-clipboard"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

interface VideoRecorderModalProps {
  visible: boolean
  onClose: () => void
  onVideoRecorded?: (videoUri: string) => void
  /** Called when user completes share flow (e.g. after Sharing.shareAsync). Use to navigate away. */
  onComplete?: () => void
}

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({
  visible,
  onClose,
  onVideoRecorded,
  onComplete,
}) => {
  const [permission, requestPermission] = useCameraPermissions()
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [showLinkOption, setShowLinkOption] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setRecordedVideoUri(null)
      setIsRecording(false)
      setShowLinkOption(false)
    }
  }, [visible])

  const handleStartRecording = async () => {
    if (!cameraRef.current) return

    try {
      // Request permission if needed
      if (!permission?.granted) {
        const result = await requestPermission()
        if (!result.granted) {
          Alert.alert(
            "Camera Permission Required",
            "Please allow camera access to record a video.",
          )
          return
        }
      }

      addHapticFeedback(HapticStrength.Medium)
      setIsRecording(true)

      // Start recording
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // 60 seconds max
        // Note: quality option removed - not supported in expo-camera
      })

      if (video && video.uri) {
        setRecordedVideoUri(video.uri)
        setIsRecording(false)
        addHapticFeedback(HapticStrength.Medium)

        if (onVideoRecorded) {
          onVideoRecorded(video.uri)
        }
      } else {
        throw new Error("Video recording failed - no video returned")
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error recording video:", error)
      }
      setIsRecording(false)
      Alert.alert("Error", "Failed to record video. Please try again.")
    }
  }

  const handleStopRecording = async () => {
    if (!cameraRef.current) return

    try {
      await cameraRef.current.stopRecording()
      setIsRecording(false)
      addHapticFeedback(HapticStrength.Medium)
    } catch (error) {
      if (__DEV__) {
        console.error("Error stopping recording:", error)
      }
      setIsRecording(false)
    }
  }

  const handleRetake = () => {
    setRecordedVideoUri(null)
    setShowLinkOption(false)
    addHapticFeedback(HapticStrength.Light)
  }

  const handleCopyLink = async () => {
    const appStoreLink = Platform.select({
      ios: "https://apps.apple.com/app/soul-school-7-chakras", // PENDING: replace when published
      android:
        "https://play.google.com/store/apps/details?id=com.sevenchakras.SevenChakras", // PENDING: replace when published
      default: "https://www.soulschool.app/community",
    })

    await Clipboard.setStringAsync(appStoreLink || "")
    addHapticFeedback(HapticStrength.Light)

    // Show brief confirmation
    Alert.alert("Link Copied", "App link copied to clipboard.", [
      { text: "OK" },
    ])
  }

  const handleShare = async () => {
    if (!recordedVideoUri) return

    try {
      setIsSharing(true)
      addHapticFeedback(HapticStrength.Medium)

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device.",
        )
        setIsSharing(false)
        return
      }

      // Prepare share message with app link
      // TODO: Replace with actual app store links when available
      const appStoreLink = Platform.select({
        ios: "https://apps.apple.com/app/soul-school-7-chakras", // Placeholder
        android:
          "https://play.google.com/store/apps/details?id=com.sevenchakras.SevenChakras", // Placeholder
        default: "https://soulschool.app", // Placeholder
      })

      const shareMessage = `I'm on a healing journey through the 7 chakras with Soul School! 🌟

Join me on this path from self to soul:
${appStoreLink}

#SoulSchool #7Chakras #HealingJourney`

      // Share the video
      // Note: Some platforms may not support sharing video + text together
      // The share dialog will allow users to add text/caption manually
      await Sharing.shareAsync(recordedVideoUri, {
        mimeType: "video/mp4",
        dialogTitle: "Share Your Journey",
        UTI: "public.movie", // iOS
      })

      // After sharing, show subtle link option and notify completion
      setIsSharing(false)
      setShowLinkOption(true)
      onComplete?.()
    } catch (error) {
      if (__DEV__) {
        console.error("Error sharing video:", error)
      }
      setIsSharing(false)
      Alert.alert("Error", "Failed to share video. Please try again.")
    }
  }

  const handleClose = () => {
    // Clean up recorded video if user closes without sharing
    if (recordedVideoUri) {
      FileSystem.deleteAsync(recordedVideoUri, { idempotent: true }).catch(
        () => {
          // Silent fail - file may already be deleted
        },
      )
    }
    setShowLinkOption(false)
    onClose()
  }

  if (!visible) return null

  // Request permission on mount
  if (!permission) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a855f7" />
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.loadingText}
            >
              Checking camera permissions...
            </AppText>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  if (!permission.granted) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color="#a855f7" />
            <AppText
              font="instrument-bold"
              size="xl"
              style={styles.permissionTitle}
            >
              Camera Permission Required
            </AppText>
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.permissionText}
            >
              We need access to your camera to record a video for sharing.
            </AppText>
            <Pressable
              onPress={async () => {
                const result = await requestPermission()
                if (!result.granted) {
                  Alert.alert(
                    "Permission Denied",
                    "Camera access is required to record a video.",
                  )
                }
              }}
              style={styles.permissionButton}
            >
              <AppText
                font="instrument-bold"
                size="lg"
                style={styles.permissionButtonText}
              >
                Grant Permission
              </AppText>
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
      </Modal>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </Pressable>
          <AppText font="instrument-bold" size="xl" style={styles.headerTitle}>
            Record Your Journey
          </AppText>
          <View style={styles.placeholder} />
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          {!recordedVideoUri ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front" // Front-facing camera for selfie videos
            >
              {/* Recording Indicator */}
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.recordingText}
                  >
                    Recording...
                  </AppText>
                </View>
              )}

              {/* Instructions */}
              {!isRecording && (
                <View style={styles.instructionsContainer}>
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.instructions}
                  >
                    Share your experience with the 7 chakras journey!
                  </AppText>
                </View>
              )}
            </CameraView>
          ) : (
            <View style={styles.previewContainer}>
              <AppText
                font="instrument-regular"
                size="base"
                style={styles.previewText}
              >
                Video recorded! Ready to share.
              </AppText>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {!recordedVideoUri ? (
            <>
              {/* Record Button */}
              <Pressable
                onPress={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                disabled={isSharing}
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonRecording,
                ]}
              >
                {isRecording ? (
                  <View style={styles.stopIcon} />
                ) : (
                  <View style={styles.recordIcon} />
                )}
              </Pressable>

              {/* Instructions */}
              <AppText
                font="instrument-regular"
                size="sm"
                style={styles.instructionText}
              >
                {isRecording
                  ? "Tap to stop recording (max 60 seconds)"
                  : "Tap to start recording"}
              </AppText>
            </>
          ) : showLinkOption ? (
            <>
              {/* Link Option Screen - After Sharing */}
              <View style={styles.linkOptionContainer}>
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={styles.linkOptionMessage}
                >
                  Being Vulnerable is a Superpower.
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={styles.linkOptionSubtext}
                >
                  If you feel like sharing this experience, here's the app link
                  to add to your post.
                </AppText>

                <Pressable
                  onPress={handleCopyLink}
                  style={styles.copyLinkButton}
                >
                  <Ionicons name="copy-outline" size={20} color="#a855f7" />
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.copyLinkText}
                  >
                    Copy App Link
                  </AppText>
                </Pressable>

                <Pressable onPress={handleClose} style={styles.doneButton}>
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.doneButtonText}
                  >
                    Done
                  </AppText>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={handleRetake}
                  disabled={isSharing}
                  style={styles.retakeButton}
                >
                  <Ionicons name="refresh" size={24} color="#ffffff" />
                  <AppText
                    font="instrument-regular"
                    size="sm"
                    style={styles.retakeButtonText}
                  >
                    Retake
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={handleShare}
                  disabled={isSharing}
                  style={styles.shareButton}
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="share-social" size={24} color="#ffffff" />
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        style={styles.shareButtonText}
                      >
                        Share
                      </AppText>
                    </>
                  )}
                </Pressable>
              </View>
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  textAlign: "center",
                  marginTop: 16,
                  fontStyle: "italic",
                }}
              >
                We do not store or keep any of your expressions. They only exist
                in this now moment.
              </AppText>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: "#ffffff",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    color: "#d1d5db",
    textAlign: "center",
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#a855f7",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#ffffff",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#9ca3af",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTitle: {
    color: "#ffffff",
  },
  placeholder: {
    width: 28,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  recordingIndicator: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  recordingText: {
    color: "#ffffff",
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 16,
    borderRadius: 12,
  },
  instructions: {
    color: "#ffffff",
    textAlign: "center",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  previewText: {
    color: "#ffffff",
    textAlign: "center",
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  recordButtonRecording: {
    backgroundColor: "#dc2626",
  },
  recordIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  stopIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  instructionText: {
    color: "#9ca3af",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  retakeButtonText: {
    color: "#ffffff",
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a855f7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shareButtonText: {
    color: "#ffffff",
    marginLeft: 8,
  },
  shareInstructionText: {
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
  },
  linkOptionContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  linkOptionMessage: {
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  linkOptionSubtext: {
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a855f7",
    marginBottom: 16,
  },
  copyLinkText: {
    color: "#a855f7",
    marginLeft: 8,
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneButtonText: {
    color: "#9ca3af",
  },
})
