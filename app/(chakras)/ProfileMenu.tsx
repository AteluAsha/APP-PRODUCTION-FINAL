/**
 * Profile Menu Route (Android ChakraHub)
 *
 * Full-screen profile menu as a stack screen so touches work on Android (Modal
 * overlay was blocking the screen). Opened from ChakraHubHeader on Android via
 * router.push. Same content as ProfileSheet; escape: close button and hardware
 * back call router.back() + store.close().
 */

import React, { useCallback, useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { ProfileSheet } from "@/components/profile/ProfileSheet"
import { registerAndroidBackCleanup } from "@/utils/androidBackCleanup"
import { closeStackToHub } from "@/utils/navigationHelpers"

export default function ProfileMenuScreen() {
  const close = useProfileSheetStore((s) => s.close)

  const handleClose = () => {
    closeStackToHub(() => close())
  }

  useEffect(() => {
    return () => close()
  }, [close])

  useFocusEffect(
    useCallback(() => {
      return registerAndroidBackCleanup(() => {
        close()
      })
    }, [close]),
  )

  return (
    <View style={styles.container}>
      <ProfileSheet asScreen onClose={handleClose} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
})
