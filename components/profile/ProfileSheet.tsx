/**
 * Profile Sheet - Waffle menu content
 *
 * Shows profile name, picture (from presence store), and Soul School ID.
 * Edit: update name and photo anytime. Opened from ChakraHub and ChakraHome via hamburger.
 */

import React, { useEffect, useState } from "react"
import {
  Modal,
  View,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as ImagePicker from "expo-image-picker"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { getUserId } from "@/src/services/userId"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export const ProfileSheet: React.FC = () => {
  const { isOpen, close } = useProfileSheetStore()
  const displayName = usePresenceStore((s) => s.displayName)
  const profileImageUri = usePresenceStore((s) => s.profileImageUri)
  const setDisplayName = usePresenceStore((s) => s.setDisplayName)
  const setProfileImageUri = usePresenceStore((s) => s.setProfileImageUri)

  const [userId, setUserId] = useState<string>("")
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhotoUri, setEditPhotoUri] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getUserId().then(setUserId)
      setEditName(displayName ?? "")
      setEditPhotoUri(profileImageUri)
      setEditing(false)
    }
  }, [isOpen, displayName, profileImageUri])

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    close()
  }

  const handleSaveEdit = () => {
    addHapticFeedback(HapticStrength.Medium)
    const trimmed = editName.trim()
    setDisplayName(trimmed || null)
    setProfileImageUri(editPhotoUri)
    setEditing(false)
  }

  const pickPhoto = async () => {
    addHapticFeedback(HapticStrength.Light)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]?.uri) {
      setEditPhotoUri(result.assets[0].uri)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={[
              "rgba(28, 28, 32, 0.98)",
              "rgba(22, 26, 28, 0.98)",
              "rgba(20, 26, 32, 0.97)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <AppText font="instrument-semibold" size="lg" style={styles.title}>
                Profile
              </AppText>
              <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {!editing ? (
                <>
                  <View style={styles.avatarWrap}>
                    {profileImageUri ? (
                      <Image source={{ uri: profileImageUri }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons
                          name="person"
                          size={36}
                          color="rgba(135, 174, 115, 0.8)"
                        />
                      </View>
                    )}
                  </View>
                  <AppText font="instrument-medium" size="base" style={styles.displayName}>
                    {displayName || "You"}
                  </AppText>
                  <AppText font="instrument-regular" size="xs" style={styles.hint}>
                    {displayName ? "Tap Edit to update" : "Add your name and photo"}
                  </AppText>
                  <Pressable
                    onPress={() => {
                      addHapticFeedback(HapticStrength.Light)
                      setEditing(true)
                      setEditName(displayName ?? "")
                      setEditPhotoUri(profileImageUri)
                    }}
                    style={styles.editBtn}
                  >
                    <Ionicons name="pencil" size={18} color="rgba(168, 201, 154, 0.95)" />
                    <AppText font="instrument-medium" size="sm" style={styles.editBtnText}>
                      Edit name & photo
                    </AppText>
                  </Pressable>
                </>
              ) : (
                <>
                  <AppText font="instrument-semibold" size="sm" style={styles.label}>
                    Name
                  </AppText>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      placeholder="What do you want to be called?"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={editName}
                      onChangeText={setEditName}
                      maxLength={40}
                    />
                  </View>
                  <AppText font="instrument-semibold" size="sm" style={[styles.label, { marginTop: 12 }]}>
                    Photo
                  </AppText>
                  <Pressable onPress={pickPhoto} style={styles.photoBtn}>
                    {editPhotoUri ? (
                      <Image source={{ uri: editPhotoUri }} style={styles.photoPreview} />
                    ) : (
                      <>
                        <Ionicons name="image-outline" size={28} color="rgba(168, 201, 154, 0.85)" />
                        <AppText font="instrument-regular" size="sm" style={styles.photoBtnText}>
                          Add photo
                        </AppText>
                      </>
                    )}
                  </Pressable>
                  <Pressable onPress={handleSaveEdit} style={styles.saveBtn}>
                    <AppText font="instrument-semibold" size="sm" style={styles.saveBtnText}>
                      Save
                    </AppText>
                  </Pressable>
                  <Pressable
                    onPress={() => setEditing(false)}
                    style={styles.cancelBtn}
                  >
                    <AppText font="instrument-regular" size="sm" style={styles.cancelBtnText}>
                      Cancel
                    </AppText>
                  </Pressable>
                </>
              )}

              <View style={styles.idBlock}>
                <AppText font="instrument-regular" size="xs" style={styles.idLabel}>
                  Soul School ID
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={styles.idValue}
                  numberOfLines={2}
                  selectable
                >
                  {userId || "Loading…"}
                </AppText>
              </View>
            </ScrollView>
          </LinearGradient>
        </Pressable>
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
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.25)",
  },
  gradient: { padding: 24 },
  scrollContent: { alignItems: "center", paddingBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  title: { color: "rgba(255,255,255,0.98)" },
  closeBtn: { padding: 8 },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(135, 174, 115, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  displayName: { color: "rgba(255,255,255,0.95)" },
  hint: { color: "rgba(255,255,255,0.5)", marginTop: 4, marginBottom: 16 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editBtnText: { color: "rgba(168, 201, 154, 0.95)" },
  label: { color: "rgba(255,255,255,0.9)", alignSelf: "stretch", marginBottom: 6 },
  inputWrap: {
    alignSelf: "stretch",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  input: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  photoBtn: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.3)",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 12,
  },
  photoPreview: { width: 64, height: 64, borderRadius: 32 },
  photoBtnText: { color: "rgba(255,255,255,0.7)", marginTop: 8 },
  saveBtn: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(135, 174, 115, 0.3)",
    marginBottom: 8,
  },
  saveBtnText: { color: "rgba(255,255,255,0.98)" },
  cancelBtn: { alignSelf: "stretch", alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { color: "rgba(255,255,255,0.6)" },
  idBlock: {
    width: "100%",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  idLabel: { color: "rgba(255,255,255,0.5)", marginBottom: 4 },
  idValue: { color: "rgba(255,255,255,0.8)" },
})
