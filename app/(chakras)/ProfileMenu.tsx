/**
 * Profile Menu Route (Android ChakraHub)
 *
 * Full-screen profile menu as a stack screen so touches work on Android (Modal
 * overlay was blocking the screen). Opened from ChakraHubHeader on Android via
 * router.push. Same content as ProfileSheet; escape: close button and hardware
 * back call router.back() + store.close().
 */

import React, { useEffect } from "react"
import { View, StyleSheet, BackHandler, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { ProfileSheet } from "@/components/profile/ProfileSheet"

export default function ProfileMenuScreen() {
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
      <ProfileSheet asScreen onClose={handleClose} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
})
