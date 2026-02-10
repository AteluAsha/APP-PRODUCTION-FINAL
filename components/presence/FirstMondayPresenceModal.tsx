/**
 * First Monday Presence Modal
 *
 * Shown once when the user first sees the main home (no waiting) on or after
 * course start Monday. "Give yourself a sound" = name + optional visual expression (photo).
 * Depth, gradient lighting, transparency. Clear UX: labeled inputs, obvious actions.
 */

import React, { useState } from "react"
import {
  Modal,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as ImagePicker from "expo-image-picker"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { usePresenceStore } from "@/hooks/usePresenceStore"

export interface FirstMondayPresenceModalProps {
  visible: boolean
  onClose: () => void
  onComplete?: () => void
}

export function FirstMondayPresenceModal({
  visible,
  onClose,
  onComplete,
}: FirstMondayPresenceModalProps) {
  const setDisplayName = usePresenceStore((s) => s.setDisplayName)
  const setProfileImageUri = usePresenceStore((s) => s.setProfileImageUri)
  const setHasCompletedFirstMondayPresence = usePresenceStore(
    (s) => s.setHasCompletedFirstMondayPresence,
  )

  const [name, setName] = useState("")
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [isPickingPhoto, setIsPickingPhoto] = useState(false)

  const handleBegin = () => {
    addHapticFeedback(HapticStrength.Medium)
    const trimmed = name.trim()
    if (trimmed) setDisplayName(trimmed)
    if (photoUri) setProfileImageUri(photoUri)
    setHasCompletedFirstMondayPresence(true)
    onClose()
    onComplete?.()
  }

  const handleLater = () => {
    addHapticFeedback(HapticStrength.Light)
    setHasCompletedFirstMondayPresence(true)
    onClose()
  }

  const pickImage = async () => {
    addHapticFeedback(HapticStrength.Light)
    setIsPickingPhoto(true)
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        setIsPickingPhoto(false)
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri)
      }
    } catch (e) {
      if (__DEV__) console.warn("[FirstMondayPresenceModal] pickImage:", e)
    } finally {
      setIsPickingPhoto(false)
    }
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleLater}
    >
      <Pressable style={styles.overlay} onPress={handleLater}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <Pressable style={styles.cardWrap} onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={[
                "rgba(18, 22, 28, 0.97)",
                "rgba(14, 18, 24, 0.98)",
                "rgba(20, 26, 32, 0.97)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.headerRow}>
                  <AppText font="instrument-bold" size="xl" style={styles.title}>
                    Give yourself a sound
                  </AppText>
                  <Pressable onPress={handleLater} hitSlop={12} style={styles.closeBtn}>
                    <Ionicons name="close" size={26} color="rgba(255,255,255,0.8)" />
                  </Pressable>
                </View>

                <AppText font="instrument-regular" size="sm" style={styles.subtitle}>
                  Choose how you want to be called and add a visual expression. You can update this anytime from the menu.
                </AppText>

                {/* Name – clear label + input box */}
                <View style={styles.fieldWrap}>
                  <AppText font="instrument-semibold" size="sm" style={styles.label}>
                    Name
                  </AppText>
                  <View style={styles.inputBoxWrap}>
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.08)",
                        "rgba(135, 174, 115, 0.06)",
                        "rgba(6, 182, 212, 0.04)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.inputBoxGradient}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="What do you want to be called?"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={name}
                        onChangeText={setName}
                        maxLength={40}
                        autoCapitalize="words"
                      />
                    </LinearGradient>
                  </View>
                </View>

                {/* Visual expression – label + photo button */}
                <View style={styles.fieldWrap}>
                  <AppText font="instrument-semibold" size="sm" style={styles.label}>
                    Visual expression
                  </AppText>
                  <Pressable
                    onPress={pickImage}
                    disabled={isPickingPhoto}
                    style={styles.photoBtnWrap}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(135, 174, 115, 0.12)",
                        "rgba(6, 182, 212, 0.06)",
                        "rgba(255, 255, 255, 0.04)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.photoBtnGradient}
                    >
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                      ) : isPickingPhoto ? (
                        <ActivityIndicator size="small" color="rgba(168, 201, 154, 0.9)" />
                      ) : (
                        <>
                          <Ionicons
                            name="image-outline"
                            size={32}
                            color="rgba(168, 201, 154, 0.85)"
                            style={{ marginBottom: 8 }}
                          />
                          <AppText font="instrument-regular" size="sm" style={styles.photoBtnText}>
                            Add a photo (optional)
                          </AppText>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>

                {/* Begin – primary */}
                <Pressable
                  onPress={handleBegin}
                  style={({ pressed }) => [styles.primaryBtnWrap, pressed && styles.primaryBtnPressed]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(135, 174, 115, 0.4)",
                      "rgba(212, 165, 116, 0.25)",
                      "rgba(6, 182, 212, 0.12)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryBtn}
                  >
                    <AppText font="instrument-semibold" size="base" style={styles.primaryBtnText}>
                      Begin
                    </AppText>
                  </LinearGradient>
                </Pressable>

                {/* I'll do this later */}
                <Pressable
                  onPress={handleLater}
                  style={({ pressed }) => [styles.laterBtn, pressed && { opacity: 0.8 }]}
                >
                  <AppText font="instrument-regular" size="sm" style={styles.laterBtnText}>
                    I&apos;ll do this later
                  </AppText>
                </Pressable>
              </ScrollView>
            </LinearGradient>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  keyboardView: { width: "100%", maxWidth: 360 },
  cardWrap: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    shadowColor: "rgba(6, 182, 212, 0.25)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
  },
  cardGradient: {
    padding: 24,
    minHeight: 1,
  },
  scrollContent: { paddingBottom: 8 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: { color: "rgba(255,255,255,0.98)", flex: 1, paddingRight: 12 },
  closeBtn: { padding: 6 },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    lineHeight: 22,
    marginBottom: 24,
  },
  fieldWrap: { marginBottom: 20 },
  label: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  inputBoxWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
  },
  inputBoxGradient: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
  },
  input: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    fontFamily: "InstrumentSans_400Regular",
  },
  photoBtnWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.3)",
  },
  photoBtnGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 14,
    minHeight: 100,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoBtnText: { color: "rgba(255,255,255,0.8)" },
  primaryBtnWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.5)",
    shadowColor: "rgba(135, 174, 115, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "rgba(255,255,255,0.98)" },
  laterBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  laterBtnText: { color: "rgba(255,255,255,0.6)" },
})
