/**
 * Profile-only route: SOUL SCHOOL ID, name, and profile photo (editable).
 * Opened from ChakraHub profile icon. Cosmic field + soft healing presence UI.
 */

import React, { useCallback, useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useProfileSheetStore } from "@/hooks/useProfileSheetStore"
import { ProfileSheet } from "@/components/profile/ProfileSheet"
import { HubCosmicField } from "@/components/chakras/HubCosmicField"
import { registerAndroidBackCleanup } from "@/utils/androidBackCleanup"
import { closeStackToHub } from "@/utils/navigationHelpers"

export default function ProfileScreen() {
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
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <HubCosmicField />
        <View style={styles.fieldVeil} />
      </View>
      <ProfileSheet asScreen profileOnly onClose={handleClose} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  fieldVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
  },
})
