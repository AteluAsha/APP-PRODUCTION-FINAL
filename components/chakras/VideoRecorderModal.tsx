/**
 * Video Recorder Modal
 *
 * Opens the phone's native camera to record video. When the user stops recording,
 * the system share sheet opens so they can save to phone, share to Instagram, etc.
 * No in-app camera—uses the device's own camera and share flow.
 */

import React, { useState } from "react"
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import * as Sharing from "expo-sharing"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

interface VideoRecorderModalProps {
  visible: boolean
  onClose: () => void
  onVideoRecorded?: (videoUri: string) => void
  /** Called when user has recorded and the share sheet was shown. */
  onComplete?: () => void
}

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({
  visible,
  onClose,
  onVideoRecorded,
  onComplete,
}) => {
  const [permission, setPermission] = useState<{
    granted: boolean | null
  }>({ granted: null })
  const [isLaunching, setIsLaunching] = useState(false)

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    setPermission({ granted: status === "granted" })
    return status === "granted"
  }

  const handleOpenCamera = async () => {
    const granted = permission.granted ?? (await requestPermissions())
    if (!granted) {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access to record a video with your phone camera.",
      )
      return
    }

    setIsLaunching(true)
    addHapticFeedback(HapticStrength.Medium)

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        videoMaxDuration: 60,
      })

      if (result.canceled || !result.assets?.[0]?.uri) {
        setIsLaunching(false)
        return
      }

      const videoUri = result.assets[0].uri
      onVideoRecorded?.(videoUri)

      const isAvailable = await Sharing.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device. Your video was saved.",
        )
        onComplete?.()
        onClose()
        setIsLaunching(false)
        return
      }

      await Sharing.shareAsync(videoUri, {
        mimeType: "video/mp4",
        dialogTitle: "Share your video",
        UTI: "public.movie",
      })

      onComplete?.()
      onClose()
    } catch (error) {
      if (__DEV__) {
        console.error("VideoRecorderModal error:", error)
      }
      Alert.alert("Error", "Could not open camera or share video. Please try again.")
    } finally {
      setIsLaunching(false)
    }
  }

  if (!visible) return null

  if (permission.granted === null) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A8C99A" />
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.loadingText}
            >
              Checking camera permission...
            </AppText>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  if (permission.granted === false) {
    return (
      <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color="#A8C99A" />
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
              We need access to your camera so you can record a video with your
              phone's camera. After you record, you can save or share it from
              your phone.
            </AppText>
            <Pressable
              onPress={async () => {
                const ok = await requestPermissions()
                if (!ok) {
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
            <Pressable onPress={onClose} style={styles.closeButton}>
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
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </Pressable>
          <AppText font="instrument-bold" size="xl" style={styles.headerTitle}>
            Post a Video to Social
          </AppText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Ionicons name="videocam-outline" size={72} color="#A8C99A" />
          <AppText
            font="instrument-regular"
            size="base"
            style={styles.instructionText}
          >
            Your phone's camera will open. Record your video, then save or share
            it (Instagram, Messages, etc.) from your phone.
          </AppText>

          <Pressable
            onPress={handleOpenCamera}
            disabled={isLaunching}
            style={[styles.recordButton, isLaunching && styles.recordButtonDisabled]}
          >
            {isLaunching ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="camera" size={28} color="#ffffff" />
                <AppText
                  font="instrument-bold"
                  size="lg"
                  style={styles.recordButtonText}
                >
                  Open phone camera to record
                </AppText>
              </>
            )}
          </Pressable>

          <AppText
            font="instrument-regular"
            size="xs"
            style={styles.footerText}
          >
            We do not store or keep any of your expressions. They only exist in
            this now moment.
          </AppText>
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
    backgroundColor: "#A8C99A",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#000000",
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
    borderBottomColor: "rgba(168, 201, 154, 0.2)",
  },
  headerTitle: {
    color: "#ffffff",
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  instructionText: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 32,
    lineHeight: 22,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A8C99A",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 12,
  },
  recordButtonDisabled: {
    opacity: 0.7,
  },
  recordButtonText: {
    color: "#000000",
  },
  footerText: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 32,
    fontStyle: "italic",
  },
})
