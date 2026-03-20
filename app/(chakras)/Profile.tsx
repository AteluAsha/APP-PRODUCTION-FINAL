/**
 * Profile-only route: SOUL SCHOOL ID, name, and profile photo (editable).
 * Opened from ChakraHub profile icon. Same card UI as ProfileSheet in profile-only mode.
 */

import React, { useEffect } from "react"
import { View, StyleSheet, BackHandler, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { ProfileSheet } from "@/components/profile/ProfileSheet"

export default function ProfileScreen() {
  const router = useRouter()
  const close = useProfileSheetStore((s) => s.close)

  const handleClose = () => {
    close()
    router.back()
  }

  useEffect(() => {
    return () => close()
  }, [close])

  useEffect(() => {
    if (Platform.OS !== "android") return
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose()
      return true
    })
    return () => sub.remove()
  }, [handleClose])

  return (
    <View style={styles.container}>
      <ProfileSheet asScreen profileOnly onClose={handleClose} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
})
