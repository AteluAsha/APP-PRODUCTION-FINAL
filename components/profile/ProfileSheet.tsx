/**
 * Profile Sheet - Hamburger menu with three sections: Profile, Account, Awakening Soul.
 *
 * Profile: name, photo, Energy Exchange (RevenueCat), delete account (Play/App Store).
 */

import React, { useEffect, useState, useMemo, useCallback } from "react"
import {
  Modal,
  View,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  useWindowDimensions,
  Switch,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as ImagePicker from "expo-image-picker"
import * as Clipboard from "expo-clipboard"
import { useRouter } from "expo-router"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { useRevenueCat } from "@/hooks/useRevenueCat"
import { getUserId, requestNewUserId } from "@/src/services/userId"
import { linkUserId, ENTITLEMENT_ID, KNOWN_PRODUCT_IDS_FOR_LABEL, syncAccessFromStoreReceipts } from "@/src/services/revenuecat"
import { uploadProfileImage } from "@/src/services/imageUpload"
import { updateUserProfile, getUserProfile } from "@/src/services/profileService"
import { deleteAccountAndClearLocalState } from "@/src/services/deleteAccount"
import {
  addCommunityEmail,
  isValidEmail,
  FIREBASE_NOT_INITIALIZED,
  isCommunityEmailStorageAvailable,
} from "@/src/services/communityEmailList"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { showHealingToast } from "@/utils/healingToast"
import { PROJECT_STARSEED_URL, CONTRIBUTE_URL, SUPPORT_EMAIL } from "@/constants/sharing"
import {
  activateDailyAlignmentReminders,
  cancelAllSoulJourneyScheduled,
  requestNotificationPermissions,
  scheduleSoulJourneyAfterPermission,
  syncWeeklyHeartReminders,
} from "@/src/services/journeyNotifications"

type MenuSection = "profile" | "account" | "help" | "soulschool" | null

function getAccountStatusLabel(
  hasLifetimeAccess: boolean,
  customerInfo: { entitlements: { active: Record<string, { productIdentifier?: string }> } } | null,
): string {
  if (!hasLifetimeAccess) return "Awakening Soul"
  const entitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]
  const productId = entitlement?.productIdentifier
  if (!productId) return "Lifetime"
  if (
    (KNOWN_PRODUCT_IDS_FOR_LABEL.MONTHLY as readonly string[]).includes(
      productId,
    )
  )
    return "New Awakenings"
  if (
    (KNOWN_PRODUCT_IDS_FOR_LABEL.ANNUAL as readonly string[]).includes(productId)
  )
    return "Full Sanctuary"
  return "Lifetime"
}

export interface ProfileSheetProps {
  /** When true, render as full-screen content (no Modal). Used by ProfileMenu route on Android. */
  asScreen?: boolean
  /** Called when user closes the menu in asScreen mode (e.g. router.back() + close()). */
  onClose?: () => void
  /** When true with asScreen, show only profile view: Awakening Soul ID, name, photo (editable). */
  profileOnly?: boolean
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  asScreen = false,
  onClose,
  profileOnly = false,
}) => {
  const router = useRouter()
  const { isOpen, close } = useProfileSheetStore()
  const effectiveOpen = isOpen || asScreen
  const displayName = usePresenceStore((s) => s.displayName)
  const profileImageUri = usePresenceStore((s) => s.profileImageUri)
  const location = usePresenceStore((s) => s.location)
  const setDisplayName = usePresenceStore((s) => s.setDisplayName)
  const setProfileImageUri = usePresenceStore((s) => s.setProfileImageUri)
  const setLocation = usePresenceStore((s) => s.setLocation)
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
  const {
    soulJourneyNudgesEnabled,
    setSoulJourneyNudgesEnabled,
    dailyAlignmentRemindersEnabled,
    setDailyAlignmentRemindersEnabled,
  } = useChakraJourneyStore(
    useShallow((s) => ({
      soulJourneyNudgesEnabled: s.soulJourneyNudgesEnabled,
      setSoulJourneyNudgesEnabled: s.setSoulJourneyNudgesEnabled,
      dailyAlignmentRemindersEnabled: s.dailyAlignmentRemindersEnabled,
      setDailyAlignmentRemindersEnabled: s.setDailyAlignmentRemindersEnabled,
    })),
  )
  const journeyNudgesSwitchValue = soulJourneyNudgesEnabled !== false
  const dailyAlignmentSwitchValue = dailyAlignmentRemindersEnabled === true
  const { customerInfo } = useRevenueCat()

  const openEnergyExchange = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    close()
    if (hasLifetimeAccess) {
      router.push("/(chakras)/EnergyExchange")
    } else {
      router.push("/(chakras)/Paywall")
    }
  }, [close, hasLifetimeAccess, router])

  const [section, setSection] = useState<MenuSection>(null)
  const [userId, setUserId] = useState<string>("")
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhotoUri, setEditPhotoUri] = useState<string | null>(null)
  const [editLocation, setEditLocation] = useState("")
  const [isPickingPhoto, setIsPickingPhoto] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isRequestingNewId, setIsRequestingNewId] = useState(false)
  const [isRestoringAccess, setIsRestoringAccess] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [androidContentVisible, setAndroidContentVisible] = useState(false)
  const [communityEmail, setCommunityEmail] = useState("")
  const [isSubmittingCommunityEmail, setIsSubmittingCommunityEmail] =
    useState(false)
  const [communityEmailSuccess, setCommunityEmailSuccess] = useState(false)
  const [communityEmailError, setCommunityEmailError] = useState<string | null>(
    null,
  )

  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const cardMaxWidth = useMemo(() => {
    const padding = 48
    const max = 520
    return Math.min(windowWidth - insets.left - insets.right - padding, max)
  }, [windowWidth, insets.left, insets.right])

  useEffect(() => {
    if (isOpen && Platform.OS === "android") {
      setAndroidContentVisible(false)
      const t = setTimeout(() => setAndroidContentVisible(true), 80)
      return () => clearTimeout(t)
    }
    if (!isOpen && Platform.OS === "android") {
      setAndroidContentVisible(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (effectiveOpen) {
      setSection(null)
      getUserId().then(async (id) => {
        setUserId(id)
        // Sync local presence to Firestore so Social Sanctuary can show name/avatar/location
        if (id && (displayName || profileImageUri || location)) {
          try {
            const existing = await getUserProfile(id)
            const updates: { displayName?: string; avatarUrl?: string; location?: string } = {}
            if (displayName && !existing?.displayName) updates.displayName = displayName
            if (profileImageUri && !existing?.avatarUrl) updates.avatarUrl = profileImageUri
            if (location && !existing?.location) updates.location = location
            if (Object.keys(updates).length > 0) {
              await updateUserProfile(id, updates)
            }
          } catch {
            // ignore
          }
        }
      })
      setEditName(displayName ?? "")
      setEditPhotoUri(profileImageUri)
      setEditLocation(location ?? "")
      setEditing(false)
    }
  }, [effectiveOpen, displayName, profileImageUri, location])

  const handleJourneyNudgesToggle = useCallback(
    async (next: boolean) => {
      addHapticFeedback(HapticStrength.Light)
      setSoulJourneyNudgesEnabled(next)
      if (!next) {
        setDailyAlignmentRemindersEnabled(false)
        await cancelAllSoulJourneyScheduled()
        return
      }
      const granted = await requestNotificationPermissions()
      if (!granted) {
        Alert.alert(
          "Allow notifications",
          "To hear from us along your journey, turn on notifications for Awakening Soul in Settings. You can change this anytime.",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                void Linking.openSettings()
              },
            },
          ],
        )
        return
      }
      const cs = useChakraJourneyStore.getState().courseStartDate
      const io = useChakraJourneyStore.getState().initialOpenDate
      if (cs) {
        const signup = io ?? cs
        await scheduleSoulJourneyAfterPermission(signup, cs)
      } else {
        await syncWeeklyHeartReminders()
      }
    },
    [setSoulJourneyNudgesEnabled, setDailyAlignmentRemindersEnabled],
  )

  const handleDailyAlignmentToggle = useCallback(
    async (next: boolean) => {
      addHapticFeedback(HapticStrength.Light)
      if (!next) {
        setDailyAlignmentRemindersEnabled(false)
        await syncWeeklyHeartReminders()
        return
      }
      if (!journeyNudgesSwitchValue) {
        setSoulJourneyNudgesEnabled(true)
      }
      const granted = await activateDailyAlignmentReminders()
      if (!granted) {
        Alert.alert(
          "Allow notifications",
          "To receive daily alignment reminders, turn on notifications for Awakening Soul in Settings.",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                void Linking.openSettings()
              },
            },
          ],
        )
      }
    },
    [
      journeyNudgesSwitchValue,
      setDailyAlignmentRemindersEnabled,
      setSoulJourneyNudgesEnabled,
    ],
  )

  const handleClose = () => {
    addHapticFeedback(HapticStrength.Light)
    setSection(null)
    close()
  }

  const handleBackToMenu = () => {
    addHapticFeedback(HapticStrength.Light)
    setSection(null)
  }

  const handleCloseFinal = onClose ?? handleClose

  const handleDeleteAccount = () => {
    addHapticFeedback(HapticStrength.Light)
    Alert.alert(
      "Remove my data and start fresh",
      "This will remove your progress and account from this device. You can start again with a new course selection. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            setIsDeletingAccount(true)
            try {
              await deleteAccountAndClearLocalState()
              close()
              router.replace("/(chakras)/ChakraHub")
            } catch (e) {
              if (__DEV__) console.warn("[ProfileSheet] deleteAccount:", e)
            } finally {
              setIsDeletingAccount(false)
            }
          },
        },
      ],
    )
  }

  const handleCopyId = async () => {
    if (!userId) return
    addHapticFeedback(HapticStrength.Medium)
    await Clipboard.setStringAsync(userId)
    showHealingToast("idCopied")
  }

  const handleSubscribeCommunityEmail = async () => {
    const trimmed = communityEmail.trim()
    if (!trimmed) {
      setCommunityEmailError("Enter your email")
      return
    }
    if (!isValidEmail(trimmed)) {
      setCommunityEmailError("Please enter a valid email")
      return
    }
    if (!isCommunityEmailStorageAvailable()) {
      setCommunityEmailError(
        "Email signup isn't available in this build. Use the full app when connected to add your email.",
      )
      return
    }
    addHapticFeedback(HapticStrength.Light)
    setCommunityEmailError(null)
    setIsSubmittingCommunityEmail(true)
    try {
      await addCommunityEmail(trimmed)
      setCommunityEmailSuccess(true)
      setCommunityEmail("")
      setTimeout(() => setCommunityEmailSuccess(false), 4000)
    } catch (e) {
      if (__DEV__) console.warn("[ProfileSheet] addCommunityEmail:", e)
      const msg =
        e instanceof Error && e.message === FIREBASE_NOT_INITIALIZED
          ? "Email signup isn't available in this build. Use the full app when connected to add your email."
          : "Couldn't add email. Try again later."
      setCommunityEmailError(msg)
    } finally {
      setIsSubmittingCommunityEmail(false)
    }
  }

  const handleRestoreAccess = () => {
    addHapticFeedback(HapticStrength.Light)
    void (async () => {
      setIsRestoringAccess(true)
      try {
        const restored = await syncAccessFromStoreReceipts()
        if (restored) {
          showHealingToast("Your sanctuary access is restored.")
        } else {
          Alert.alert(
            "No purchases found",
            Platform.OS === "android"
              ? "If you bought on another device, sign in with the same Google account and try again. Scholarships restore on the same phone."
              : "If you bought on another device, sign in with the same Apple ID and try again. Scholarships restore on the same phone.",
          )
        }
      } catch (e) {
        if (__DEV__) console.warn("[ProfileSheet] restore access:", e)
        Alert.alert(
          "Restore failed",
          "Please check your connection and try again.",
        )
      } finally {
        setIsRestoringAccess(false)
      }
    })()
  }

  const handleRequestNewId = () => {
    addHapticFeedback(HapticStrength.Light)
    Alert.alert(
      "Request New Awakening Soul ID",
      "This will give you a new Awakening Soul ID. Your old ID will no longer work. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            setIsRequestingNewId(true)
            try {
              const newId = await requestNewUserId()
              setUserId(newId)
              await linkUserId(newId)
            } catch (e) {
              if (__DEV__) console.warn("[ProfileSheet] requestNewUserId:", e)
            } finally {
              setIsRequestingNewId(false)
            }
          },
        },
      ],
    )
  }

  const handleRemovePhoto = () => {
    addHapticFeedback(HapticStrength.Light)
    if (editing) {
      setEditPhotoUri(null)
    } else {
      setProfileImageUri(null)
    }
  }

  const handleSaveEdit = async () => {
    addHapticFeedback(HapticStrength.Medium)
    setPhotoError(null)
    const trimmed = editName.trim()
    const locationTrimmed = editLocation.trim() || null
    setDisplayName(trimmed || null)
    setLocation(locationTrimmed)

    let finalAvatarUrl: string | null = null
    if (editPhotoUri) {
      const isLocalUri =
        editPhotoUri.startsWith("file://") || editPhotoUri.startsWith("ph://")
      if (isLocalUri && userId) {
        setIsSaving(true)
        try {
          const downloadUrl = await uploadProfileImage(editPhotoUri, userId)
          setProfileImageUri(downloadUrl)
          finalAvatarUrl = downloadUrl
        } catch (e) {
          if (__DEV__) console.warn("[ProfileSheet] Upload failed:", e)
          setPhotoError("Photo upload failed. Saving locally.")
          setProfileImageUri(editPhotoUri)
          finalAvatarUrl = editPhotoUri
        } finally {
          setIsSaving(false)
        }
      } else {
        setProfileImageUri(editPhotoUri)
        finalAvatarUrl = editPhotoUri
      }
    } else {
      setProfileImageUri(null)
    }

    if (userId) {
      try {
        await updateUserProfile(userId, {
          displayName: trimmed || undefined,
          avatarUrl: editPhotoUri ? (finalAvatarUrl ?? editPhotoUri) : null,
          location: locationTrimmed ?? undefined,
        })
      } catch (e) {
        if (__DEV__) console.warn("[ProfileSheet] Firestore profile update failed:", e)
      }
    }

    setEditing(false)
    showHealingToast("profileSaved")
  }

  const pickPhoto = async () => {
    addHapticFeedback(HapticStrength.Light)
    setPhotoError(null)
    setIsPickingPhoto(true)
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        setPhotoError("Photo access denied")
        return
      }

      let hasCropper = false
      try {
        await import("@bsky.app/expo-image-crop-tool")
        hasCropper = true
      } catch {
        hasCropper = false
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !hasCropper,
        aspect: hasCropper ? undefined : [1, 1],
        quality: 0.9,
      })
      if (result.canceled || !result.assets?.[0]?.uri) return

      const pickedUri = result.assets[0].uri

      if (hasCropper) {
        try {
          const ExpoImageCropTool = (
            await import("@bsky.app/expo-image-crop-tool")
          ).default
          const cropped = await ExpoImageCropTool.openCropperAsync({
            imageUri: pickedUri,
            shape: "circle",
            aspectRatio: 1,
            format: "jpeg",
            compressImageQuality: 0.85,
            doneButtonText: "Use Photo",
            cancelButtonText: "Cancel",
          })
          const uri = cropped.path.startsWith("file://")
            ? cropped.path
            : cropped.path.startsWith("/")
              ? `file://${cropped.path}`
              : cropped.path
          setEditPhotoUri(uri)
        } catch (cropperError) {
          // Any cropper failure (e.g. iOS ph:// URI, native module): use picked image without crop so app never crashes
          if (__DEV__) {
            console.warn("[ProfileSheet] pickPhoto cropper fallback:", cropperError)
          }
          setEditPhotoUri(pickedUri)
        }
      } else {
        setEditPhotoUri(pickedUri)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.toLowerCase().includes("cancel")) {
        if (__DEV__) console.warn("[ProfileSheet] pickPhoto:", e)
        setPhotoError("Could not load photo")
      }
    } finally {
      setIsPickingPhoto(false)
    }
  }

  if (!isOpen && !asScreen) return null

  const sectionTitle = profileOnly
    ? "Your Presence"
    : section === "profile"
      ? "Profile"
      : section === "account"
        ? "Account"
        : section === "help"
          ? "Help"
          : section === "soulschool"
            ? "Awakening Soul"
            : null

  const innerContent = (
    <Pressable
      style={[
        profileOnly ? styles.profileOnlyCard : styles.card,
        { maxWidth: cardMaxWidth },
      ]}
      onPress={(e) => e.stopPropagation()}
    >
      {(Platform.OS !== "android" || androidContentVisible || asScreen) && (
          <LinearGradient
            colors={
              profileOnly
                ? [
                    "rgba(0,0,0,0)",
                    "rgba(0,0,0,0)",
                    "rgba(0,0,0,0)",
                  ]
                : [
                    "rgba(28, 28, 32, 0.92)",
                    "rgba(22, 26, 28, 0.90)",
                    "rgba(20, 26, 32, 0.88)",
                  ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={profileOnly ? styles.profileOnlyGradient : styles.gradient}
          >
            <View style={styles.header}>
              {profileOnly && asScreen ? (
                <Pressable
                  onPress={handleCloseFinal}
                  hitSlop={12}
                  style={styles.backBtn}
                >
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color="rgba(255,255,255,0.85)"
                  />
                </Pressable>
              ) : !profileOnly && section ? (
                <Pressable
                  onPress={handleBackToMenu}
                  hitSlop={12}
                  style={styles.backBtn}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color="rgba(255,255,255,0.7)"
                  />
                </Pressable>
              ) : (
                <View style={styles.headerSpacer} />
              )}
              <AppText
                font="cormorant-italic"
                size="2xl"
                style={[
                  styles.title,
                  profileOnly && styles.profileOnlyTitle,
                ]}
              >
                {sectionTitle ?? "I am"}
              </AppText>
              {!(profileOnly && asScreen) ? (
              <Pressable
                onPress={handleCloseFinal}
                hitSlop={12}
                style={styles.closeBtn}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="rgba(255,255,255,0.7)"
                />
              </Pressable>
              ) : (
                <View style={styles.headerSpacer} />
              )}
            </View>

            {profileOnly ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.profileOnlyScrollContent}
              >
                <View style={styles.profileOnlyIdBlock}>
                  <AppText
                    font="cormorant-italic"
                    style={styles.profileOnlySectionLabel}
                  >
                    Awakening Soul ID
                  </AppText>
                  <View style={styles.idKeyBox}>
                    <AppText
                      font="instrument-bold"
                      style={styles.idValue}
                      numberOfLines={2}
                      selectable
                    >
                      {userId || "Loading…"}
                    </AppText>
                    <Pressable
                      onPress={handleCopyId}
                      style={styles.copyBtn}
                      hitSlop={8}
                      disabled={!userId}
                    >
                      <Ionicons name="copy-outline" size={18} color="rgba(212, 175, 55, 0.9)" />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={handleRequestNewId}
                    style={styles.requestNewIdBtn}
                    disabled={isRequestingNewId || !userId}
                  >
                    {isRequestingNewId ? (
                      <ActivityIndicator size="small" color="rgba(212, 175, 55, 0.8)" />
                    ) : (
                      <AppText font="instrument-regular" size="xs" style={styles.requestNewIdText}>
                        Request new ID
                      </AppText>
                    )}
                  </Pressable>
                </View>
                {!editing ? (
                  <>
                    <View style={styles.profileOnlyAvatarWrap}>
                      {profileImageUri ? (
                        <Image
                          source={{ uri: profileImageUri }}
                          style={styles.profileOnlyAvatar}
                        />
                      ) : (
                        <View style={styles.profileOnlyAvatarPlaceholder}>
                          <Ionicons
                            name="person"
                            size={48}
                            color="rgba(135, 174, 115, 0.8)"
                          />
                        </View>
                      )}
                    </View>
                    {displayName ? (
                      <AppText
                        font="instrument-medium"
                        size="xl"
                        style={styles.profileOnlyDisplayName}
                      >
                        {displayName}
                      </AppText>
                    ) : (
                      <View style={styles.profileOnlyNamePlaceholder} />
                    )}
                    {location ? (
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        style={styles.profileOnlyLocation}
                      >
                        {location}
                      </AppText>
                    ) : null}
                    <View style={styles.profileOnlyEditRow}>
                      <Pressable
                        onPress={() => {
                          addHapticFeedback(HapticStrength.Light)
                          setEditing(true)
                          setEditName(displayName ?? "")
                          setEditPhotoUri(profileImageUri)
                        }}
                        style={({ pressed }) => [
                          styles.profileOnlyPillBtn,
                          pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
                        ]}
                      >
                        <Ionicons
                          name="pencil"
                          size={18}
                          color="rgba(168, 201, 154, 0.95)"
                        />
                        <AppText
                          font="instrument-medium"
                          size="sm"
                          style={styles.editBtnText}
                        >
                          Edit name & photo
                        </AppText>
                      </Pressable>
                      {profileImageUri ? (
                        <Pressable
                          onPress={handleRemovePhoto}
                          style={styles.removePhotoBtn}
                        >
                          <AppText
                            font="instrument-regular"
                            size="xs"
                            style={styles.removePhotoText}
                          >
                            Remove photo
                          </AppText>
                        </Pressable>
                      ) : null}
                    </View>
                  </>
                ) : (
                  <>
                    <AppText
                      font="instrument-semibold"
                      size="sm"
                      style={[styles.label, styles.profileOnlyLabel]}
                    >
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
                    <AppText
                      font="instrument-semibold"
                      size="sm"
                      style={[styles.label, { marginTop: 16 }]}
                    >
                      Location (optional)
                    </AppText>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        placeholder="City, region, or country"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={editLocation}
                        onChangeText={setEditLocation}
                        maxLength={60}
                      />
                    </View>
                    <AppText
                      font="instrument-semibold"
                      size="sm"
                      style={[styles.label, { marginTop: 16 }]}
                    >
                      Photo
                    </AppText>
                    <Pressable
                      onPress={pickPhoto}
                      style={styles.photoBtn}
                      disabled={isPickingPhoto}
                    >
                      {isPickingPhoto ? (
                        <ActivityIndicator
                          size="small"
                          color="rgba(255,255,255,0.7)"
                        />
                      ) : editPhotoUri ? (
                        <Image
                          source={{ uri: editPhotoUri }}
                          style={styles.photoPreview}
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="person"
                            size={28}
                            color="rgba(255, 255, 255, 0.5)"
                          />
                          <AppText
                            font="instrument-regular"
                            size="sm"
                            style={styles.photoBtnText}
                          >
                            Add photo
                          </AppText>
                        </>
                      )}
                    </Pressable>
                    {editPhotoUri ? (
                      <Pressable
                        onPress={handleRemovePhoto}
                        style={[styles.removePhotoBtn, { marginBottom: 8 }]}
                      >
                        <AppText
                          font="instrument-regular"
                          size="xs"
                          style={styles.removePhotoText}
                        >
                          Remove photo
                        </AppText>
                      </Pressable>
                    ) : null}
                    {photoError ? (
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={styles.errorText}
                      >
                        {photoError}
                      </AppText>
                    ) : null}
                    <Pressable
                      onPress={handleSaveEdit}
                      style={[styles.saveBtn, { marginTop: 8 }]}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <AppText
                          font="instrument-semibold"
                          size="sm"
                          style={styles.saveBtnText}
                        >
                          Save
                        </AppText>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => setEditing(false)}
                      style={styles.cancelBtn}
                      disabled={isSaving}
                    >
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        style={styles.cancelBtnText}
                      >
                        Cancel
                      </AppText>
                    </Pressable>
                  </>
                )}
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={styles.profileOnlyDisclaimer}
                >
                  We do not share your information with anyone. It all stays
                  right here, with you.
                </AppText>
                <Pressable
                  onPress={openEnergyExchange}
                  style={({ pressed }) => [
                    styles.profileOnlyPillBtn,
                    styles.profileOnlyPillBtnGold,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
                  ]}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={20}
                    color="rgba(212, 175, 55, 0.95)"
                  />
                  <AppText
                    font="instrument-medium"
                    size="sm"
                    style={styles.upgradeRowText}
                  >
                    Energy Exchange
                  </AppText>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </Pressable>
                <Pressable
                  onPress={handleDeleteAccount}
                  style={styles.deleteAccountBtn}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                  ) : (
                    <AppText font="instrument-regular" size="sm" style={styles.deleteAccountText}>
                      Remove my data and start fresh
                    </AppText>
                  )}
                </Pressable>
              </ScrollView>
            ) : section === null ? (
              <View style={styles.menuRows}>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    setSection("profile")
                  }}
                  style={styles.menuRow}
                >
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color="rgba(168, 201, 154, 0.95)"
                  />
                  <AppText font="instrument-medium" size="base" style={styles.menuRowText}>
                    Profile
                  </AppText>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    setSection("account")
                  }}
                  style={styles.menuRow}
                >
                  <Ionicons
                    name="card-outline"
                    size={22}
                    color="rgba(168, 201, 154, 0.95)"
                  />
                  <AppText font="instrument-medium" size="base" style={styles.menuRowText}>
                    Account
                  </AppText>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </Pressable>
                <View style={styles.menuRowSwitch} accessibilityRole="none">
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="rgba(168, 201, 154, 0.95)"
                  />
                  <View style={styles.menuRowSwitchTextCol}>
                    <AppText
                      font="instrument-medium"
                      size="base"
                      style={styles.menuRowSwitchTitle}
                    >
                      Journey reminders
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={styles.menuRowSubtextMuted}
                    >
                      Weekly heart reminders — Sunday evening, and Wednesday
                      once your journey has started. No marketing; turn off
                      anytime in system settings.
                    </AppText>
                  </View>
                  <Switch
                    value={journeyNudgesSwitchValue}
                    onValueChange={(v) => {
                      void handleJourneyNudgesToggle(v)
                    }}
                    trackColor={{
                      false: "rgba(255,255,255,0.2)",
                      true: "rgba(168, 201, 154, 0.45)",
                    }}
                    thumbColor={
                      Platform.OS === "android"
                        ? journeyNudgesSwitchValue
                          ? "rgba(230, 245, 220, 0.95)"
                          : "rgba(200, 200, 200, 0.95)"
                        : undefined
                    }
                    ios_backgroundColor="rgba(255,255,255,0.2)"
                    accessibilityLabel="Journey reminders"
                  />
                </View>
                <View style={styles.menuRowSwitch} accessibilityRole="none">
                  <Ionicons
                    name="sunny-outline"
                    size={22}
                    color="rgba(232, 201, 140, 0.88)"
                  />
                  <View style={styles.menuRowSwitchTextCol}>
                    <AppText
                      font="instrument-medium"
                      size="base"
                      style={styles.menuRowSwitchTitle}
                    >
                      Daily alignment reminders
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={styles.menuRowSubtextMuted}
                    >
                      Noon and night-before check-ins when you have not opened
                      the app that day. Requires journey reminders above. Also
                      on Root day.
                    </AppText>
                  </View>
                  <Switch
                    value={dailyAlignmentSwitchValue}
                    onValueChange={(v) => {
                      void handleDailyAlignmentToggle(v)
                    }}
                    disabled={!journeyNudgesSwitchValue}
                    trackColor={{
                      false: "rgba(255,255,255,0.2)",
                      true: "rgba(232, 201, 140, 0.42)",
                    }}
                    thumbColor={
                      Platform.OS === "android"
                        ? dailyAlignmentSwitchValue
                          ? "rgba(255, 248, 236, 0.95)"
                          : "rgba(200, 200, 200, 0.95)"
                        : undefined
                    }
                    ios_backgroundColor="rgba(255,255,255,0.2)"
                    accessibilityLabel="Daily alignment reminders"
                  />
                </View>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    setSection("help")
                  }}
                  style={styles.menuRow}
                >
                  <Ionicons
                    name="help-buoy-outline"
                    size={22}
                    color="rgba(168, 201, 154, 0.95)"
                  />
                  <AppText font="instrument-medium" size="base" style={styles.menuRowText}>
                    Help
                  </AppText>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    setSection("soulschool")
                  }}
                  style={styles.menuRow}
                >
                  <Ionicons
                    name="school-outline"
                    size={22}
                    color="rgba(168, 201, 154, 0.95)"
                  />
                  <AppText font="instrument-medium" size="base" style={styles.menuRowText}>
                    Awakening Soul
                  </AppText>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </Pressable>
              </View>
            ) : section === "help" ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={styles.helpBlurb}
                >
                  We are not a corporation—we are healers and humans. Please let us know if
                  there is any way we can help. We will hear you.
                </AppText>
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    Linking.openURL(`mailto:${SUPPORT_EMAIL}`)
                  }}
                  style={styles.helpContactRow}
                >
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color="rgba(168, 201, 154, 0.95)"
                  />
                  <AppText font="instrument-medium" size="sm" style={styles.helpContactText}>
                    Contact us
                  </AppText>
                  <Ionicons name="open-outline" size={18} color="rgba(168, 201, 154, 0.95)" />
                </Pressable>
              </ScrollView>
            ) : section === "soulschool" ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={styles.soulSchoolBlurb}
                >
                  7 Chakras: The Map from Self to Soul. Return home anytime. More paths are coming.
                </AppText>
                {!hasLifetimeAccess ? (
                  <Pressable
                    onPress={openEnergyExchange}
                    style={styles.upgradeRow}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={20}
                      color="rgba(212, 175, 55, 0.95)"
                    />
                    <AppText
                      font="instrument-medium"
                      size="sm"
                      style={styles.upgradeRowText}
                    >
                      Energy Exchange
                    </AppText>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    close()
                    router.replace("/(chakras)/ChakraHub")
                  }}
                  style={styles.courseSelectionRow}
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color="rgba(168, 201, 154, 0.95)"
                  />
                  <AppText
                    font="instrument-medium"
                    size="sm"
                    style={styles.courseSelectionText}
                  >
                    Return to Sanctuary Home
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(PROJECT_STARSEED_URL)}
                  style={styles.linkRow}
                >
                  <AppText font="instrument-medium" size="sm" style={styles.linkRowText}>
                    Visit Project Starseed
                  </AppText>
                  <Ionicons name="open-outline" size={18} color="rgba(168, 201, 154, 0.95)" />
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(CONTRIBUTE_URL)}
                  style={styles.secondaryLinkRow}
                >
                  <AppText font="instrument-regular" size="xs" style={styles.secondaryLinkText}>
                    To support more scholarships, click here
                  </AppText>
                </Pressable>
              </ScrollView>
            ) : section === "account" ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <AppText font="instrument-regular" size="xs" style={styles.idLabel}>
                  Status
                </AppText>
                <AppText font="instrument-medium" size="sm" style={styles.statusValue}>
                  {getAccountStatusLabel(hasLifetimeAccess, customerInfo)}
                </AppText>
                {!hasLifetimeAccess ? (
                  <Pressable
                    onPress={openEnergyExchange}
                    style={styles.upgradeRow}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={20}
                      color="rgba(212, 175, 55, 0.95)"
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <AppText
                        font="instrument-medium"
                        size="sm"
                        style={styles.upgradeRowText}
                      >
                        Open Energy Exchange
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={[styles.upgradeRowText, { opacity: 0.8, marginTop: 2 }]}
                      >
                        Continue with RevenueCat
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                ) : null}
                {!hasLifetimeAccess ? (
                  <Pressable
                    onPress={handleRestoreAccess}
                    disabled={isRestoringAccess}
                    style={styles.upgradeRow}
                    accessibilityLabel="Restore purchases"
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={20}
                      color="rgba(232, 201, 140, 0.95)"
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <AppText
                        font="instrument-medium"
                        size="sm"
                        style={styles.upgradeRowText}
                      >
                        Restore Purchases
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={[styles.upgradeRowText, { opacity: 0.8, marginTop: 2 }]}
                      >
                        Paid access and same-phone scholarships
                      </AppText>
                    </View>
                    {isRestoringAccess ? (
                      <ActivityIndicator
                        size="small"
                        color="rgba(232, 201, 140, 0.95)"
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="rgba(255,255,255,0.4)"
                      />
                    )}
                  </Pressable>
                ) : null}
                <View style={styles.idBlock}>
                  <AppText font="instrument-regular" size="xs" style={styles.idLabel}>
                    Awakening Soul ID
                  </AppText>
                  <View style={styles.idKeyBox}>
                    <AppText
                      font="instrument-bold"
                      style={styles.idValue}
                      numberOfLines={2}
                      selectable
                    >
                      {userId || "Loading…"}
                    </AppText>
                    <Pressable
                      onPress={handleCopyId}
                      style={styles.copyBtn}
                      hitSlop={8}
                      disabled={!userId}
                    >
                      <Ionicons name="copy-outline" size={18} color="rgba(212, 175, 55, 0.9)" />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={handleRequestNewId}
                    style={styles.requestNewIdBtn}
                    disabled={isRequestingNewId || !userId}
                  >
                    {isRequestingNewId ? (
                      <ActivityIndicator size="small" color="rgba(212, 175, 55, 0.8)" />
                    ) : (
                      <AppText font="instrument-regular" size="xs" style={styles.requestNewIdText}>
                        Request new ID
                      </AppText>
                    )}
                  </Pressable>
                </View>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={[styles.idLabel, { marginTop: 24 }]}
                >
                  Awakening Soul updates and new offerings
                </AppText>
                <View style={styles.communityEmailRow}>
                  <TextInput
                    value={communityEmail}
                    onChangeText={(t) => {
                      setCommunityEmail(t)
                      setCommunityEmailError(null)
                    }}
                    placeholder="Your email"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmittingCommunityEmail}
                    style={styles.communityEmailInput}
                  />
                  <Pressable
                    onPress={handleSubscribeCommunityEmail}
                    style={styles.communityEmailBtn}
                    disabled={isSubmittingCommunityEmail}
                  >
                    {isSubmittingCommunityEmail ? (
                      <ActivityIndicator size="small" color="rgba(212, 175, 55, 0.9)" />
                    ) : (
                      <AppText font="instrument-medium" size="xs" style={styles.communityEmailBtnText}>
                        Add my email
                      </AppText>
                    )}
                  </Pressable>
                </View>
                {communityEmailSuccess && (
                  <AppText font="instrument-regular" size="xs" style={styles.communityEmailSuccess}>
                    You’re on the list for Awakening Soul Community updates.
                  </AppText>
                )}
                {communityEmailError && (
                  <AppText font="instrument-regular" size="xs" style={styles.communityEmailError}>
                    {communityEmailError}
                  </AppText>
                )}
                <Pressable
                  onPress={openEnergyExchange}
                  style={styles.linkRow}
                >
                  <AppText font="instrument-medium" size="sm" style={styles.linkRowText}>
                    Energy Exchange
                  </AppText>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </Pressable>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={styles.cacheNote}
                >
                  Audio is downloaded for offline listening; avoid clearing app cache for the best experience.
                </AppText>
                <Pressable
                  onPress={handleDeleteAccount}
                  style={styles.deleteAccountBtn}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                  ) : (
                    <AppText font="instrument-regular" size="sm" style={styles.deleteAccountText}>
                      Remove my data and start fresh
                    </AppText>
                  )}
                </Pressable>
              </ScrollView>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {!editing ? (
                <>
                  <View style={styles.avatarWrap}>
                    {profileImageUri ? (
                      <Image
                        source={{ uri: profileImageUri }}
                        style={styles.avatar}
                      />
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
                  {displayName ? (
                    <AppText
                      font="instrument-medium"
                      size="base"
                      style={styles.displayName}
                    >
                      {displayName}
                    </AppText>
                  ) : (
                    <View style={styles.namePlaceholder} />
                  )}
                  {location ? (
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={[styles.hint, { marginTop: 2 }]}
                    >
                      {location}
                    </AppText>
                  ) : null}
                  <AppText
                    font="instrument-regular"
                    size="xs"
                    style={[styles.hint, { marginTop: 4 }]}
                  >
                    {displayName
                      ? "Tap Edit to update"
                      : "Add your profile name and visual expression."}
                  </AppText>
                  <View style={styles.editRow}>
                    <Pressable
                      onPress={() => {
                        addHapticFeedback(HapticStrength.Light)
                        setEditing(true)
                        setEditName(displayName ?? "")
                        setEditPhotoUri(profileImageUri)
                      }}
                      style={styles.editBtn}
                    >
                      <Ionicons
                        name="pencil"
                        size={18}
                        color="rgba(168, 201, 154, 0.95)"
                      />
                      <AppText
                        font="instrument-medium"
                        size="sm"
                        style={styles.editBtnText}
                      >
                        Edit name & photo
                      </AppText>
                    </Pressable>
                    {profileImageUri ? (
                      <Pressable
                        onPress={handleRemovePhoto}
                        style={styles.removePhotoBtn}
                      >
                        <AppText
                          font="instrument-regular"
                          size="xs"
                          style={styles.removePhotoText}
                        >
                          Remove photo
                        </AppText>
                      </Pressable>
                    ) : null}
                  </View>
                </>
              ) : (
                <>
                  <AppText
                    font="instrument-semibold"
                    size="sm"
                    style={styles.label}
                  >
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
                  <AppText
                    font="instrument-semibold"
                    size="sm"
                    style={[styles.label, { marginTop: 12 }]}
                  >
                    Location (optional)
                  </AppText>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      placeholder="City, region, or country"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={editLocation}
                      onChangeText={setEditLocation}
                      maxLength={60}
                    />
                  </View>
                  <AppText
                    font="instrument-semibold"
                    size="sm"
                    style={[styles.label, { marginTop: 12 }]}
                  >
                    Photo
                  </AppText>
                  <Pressable
                    onPress={pickPhoto}
                    style={styles.photoBtn}
                    disabled={isPickingPhoto}
                  >
                    {isPickingPhoto ? (
                      <ActivityIndicator
                        size="small"
                        color="rgba(255,255,255,0.7)"
                      />
                    ) : editPhotoUri ? (
                      <Image
                        source={{ uri: editPhotoUri }}
                        style={styles.photoPreview}
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="person"
                          size={28}
                          color="rgba(255, 255, 255, 0.5)"
                        />
                        <AppText
                          font="instrument-regular"
                          size="sm"
                          style={styles.photoBtnText}
                        >
                          Add photo
                        </AppText>
                      </>
                    )}
                  </Pressable>
                  {editPhotoUri ? (
                    <Pressable
                      onPress={handleRemovePhoto}
                      style={[styles.removePhotoBtn, { marginBottom: 8 }]}
                    >
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        style={styles.removePhotoText}
                      >
                        Remove photo
                      </AppText>
                    </Pressable>
                  ) : null}
                  {photoError ? (
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={styles.errorText}
                    >
                      {photoError}
                    </AppText>
                  ) : null}
                  <Pressable
                    onPress={handleSaveEdit}
                    style={styles.saveBtn}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <AppText
                        font="instrument-semibold"
                        size="sm"
                        style={styles.saveBtnText}
                      >
                        Save
                      </AppText>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => setEditing(false)}
                    style={styles.cancelBtn}
                    disabled={isSaving}
                  >
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.cancelBtnText}
                    >
                      Cancel
                    </AppText>
                  </Pressable>
                </>
              )}
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={styles.disclaimer}
                >
                  We do not share your information with anyone. It all stays
                  right here, with you.
                </AppText>
              </ScrollView>
            )}
          </LinearGradient>
          )}
    </Pressable>
  )
  if (asScreen) {
    return (
      <View
        style={[
          styles.overlay,
          Platform.OS === "android" && styles.overlayAndroid,
          profileOnly && styles.profileOnlyScreenOverlay,
        ]}
      >
        {innerContent}
      </View>
    )
  }
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      {...(Platform.OS === "android" && { statusBarTranslucent: true })}
    >
      <Pressable style={[styles.overlay, Platform.OS === "android" && styles.overlayAndroid]} onPress={handleClose}>
        {innerContent}
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  overlayAndroid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileOnlyOverlay: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  profileOnlyScreenOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 0,
  },
  profileOnlyTitle: {
    fontSize: 26,
    letterSpacing: 0.6,
    color: "rgba(255,248,236,0.96)",
  },
  profileOnlySectionLabel: {
    color: "rgba(232, 201, 140, 0.78)",
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.2)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: { elevation: 24 },
    }),
  },
  profileOnlyCard: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
    borderRadius: 0,
    overflow: "hidden",
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  gradient: { padding: 24 },
  profileOnlyGradient: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 8 : 4,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  scrollContent: { alignItems: "center", paddingBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerSpacer: { width: 40 },
  title: { color: "rgba(255,255,255,0.98)", flex: 1, textAlign: "center" },
  closeBtn: { padding: 8 },
  menuRows: {
    width: "100%",
    gap: 4,
    paddingBottom: 16,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.2)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  menuRowText: { color: "rgba(255,255,255,0.95)", flex: 1 },
  menuRowSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.2)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  menuRowSwitchTextCol: {
    flex: 1,
    paddingRight: 4,
    minWidth: 0,
  },
  menuRowSwitchTitle: {
    color: "rgba(255,255,255,0.95)",
  },
  menuRowSubtextMuted: {
    color: "rgba(255,255,255,0.48)",
    marginTop: 6,
    lineHeight: 18,
  },
  soulSchoolBlurb: {
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  helpBlurb: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  helpContactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  helpContactText: {
    color: "rgba(168, 201, 154, 0.95)",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    backgroundColor: "rgba(135, 174, 115, 0.08)",
  },
  linkRowText: { color: "rgba(168, 201, 154, 0.95)" },
  secondaryLinkRow: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  secondaryLinkText: {
    color: "rgba(255,255,255,0.7)",
    textDecorationLine: "underline",
  },
  statusValue: { color: "rgba(255,255,255,0.9)", marginBottom: 20 },
  deleteAccountBtn: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  deleteAccountText: { color: "rgba(255,255,255,0.6)" },
  profileOnlyScrollContent: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  profileOnlyIdBlock: {
    width: "100%",
    marginBottom: 28,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    borderBottomColor: "rgba(0,0,0,0.32)",
    borderLeftColor: "rgba(232, 201, 140, 0.2)",
    borderRightColor: "rgba(0,0,0,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  profileOnlyAvatarWrap: {
    alignSelf: "center",
    marginBottom: 16,
    padding: 4,
    borderRadius: 76,
    borderWidth: 2,
    borderTopColor: "rgba(232, 201, 140, 0.45)",
    borderBottomColor: "rgba(0,0,0,0.35)",
    borderLeftColor: "rgba(135, 174, 115, 0.35)",
    borderRightColor: "rgba(0,0,0,0.25)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  profileOnlyAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  profileOnlyAvatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(135, 174, 115, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileOnlyDisplayName: {
    color: "rgba(255,248,236,0.96)",
    textAlign: "center",
    marginBottom: 6,
    fontSize: 22,
  },
  profileOnlyNamePlaceholder: { height: 32, marginBottom: 6 },
  profileOnlyLocation: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 24,
  },
  profileOnlyEditRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  profileOnlyDisclaimer: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 28,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  profileOnlyLabel: { marginTop: 0 },
  profileOnlyPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.16)",
    borderBottomColor: "rgba(0,0,0,0.32)",
    borderLeftColor: "rgba(135, 174, 115, 0.28)",
    borderRightColor: "rgba(0,0,0,0.22)",
    backgroundColor: "rgba(135, 174, 115, 0.12)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  profileOnlyPillBtnGold: {
    marginTop: 8,
    borderLeftColor: "rgba(232, 201, 140, 0.35)",
    backgroundColor: "rgba(232, 201, 140, 0.1)",
  },
  avatarWrap: {
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  displayName: { color: "rgba(255,255,255,0.95)" },
  namePlaceholder: { height: 24, marginBottom: 0 },
  hint: { color: "rgba(255,255,255,0.78)", marginTop: 4, textAlign: "center" },
  disclaimer: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editBtnText: { color: "rgba(168, 201, 154, 0.95)" },
  removePhotoBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  removePhotoText: {
    color: "rgba(255,255,255,0.75)",
    textDecorationLine: "underline",
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    alignSelf: "stretch",
    marginBottom: 6,
  },
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
  errorText: { color: "rgba(255,180,100,0.9)", marginTop: 4, marginBottom: 4 },
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
  upgradeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  upgradeRowText: { color: "rgba(245, 213, 71, 0.95)", flex: 1, marginLeft: 10 },
  courseSelectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.35)",
    backgroundColor: "rgba(135, 174, 115, 0.08)",
  },
  courseSelectionText: { color: "rgba(168, 201, 154, 0.95)" },
  idBlock: {
    width: "100%",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  idLabel: { color: "rgba(255,255,255,0.45)", marginBottom: 8, fontSize: 11 },
  cacheNote: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 8,
  },
  requestNewIdBtn: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "center",
  },
  requestNewIdText: {
    color: "rgba(212, 175, 55, 0.85)",
    textDecorationLine: "underline",
    fontSize: 10,
  },
  idKeyBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  idValue: {
    flex: 1,
    color: "#F5D547",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
    textShadowColor: "rgba(245, 213, 71, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  copyBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  communityEmailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginTop: 8,
    marginBottom: 4,
  },
  communityEmailInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 14,
  },
  communityEmailBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    minWidth: 100,
    alignItems: "center",
  },
  communityEmailBtnText: { color: "rgba(245, 213, 71, 0.95)" },
  communityEmailSuccess: {
    color: "rgba(135, 174, 115, 0.95)",
    marginTop: 6,
    marginBottom: 4,
  },
  communityEmailError: {
    color: "rgba(255, 180, 100, 0.95)",
    marginTop: 6,
    marginBottom: 4,
  },
})
