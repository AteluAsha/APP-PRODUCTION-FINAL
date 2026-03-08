/**
 * Anua Chat Route
 *
 * Full-screen Anua chat as a stack screen so touches work on Android (Modal in a
 * separate window does not receive touch events). Opened via useAnuaChatStore.open();
 * GlobalAnuaChat navigates here when isOpen becomes true.
 * Escape: onClose and hardware back call router.back() + store.close().
 */

import React, { useEffect } from "react"
import { View, StyleSheet, BackHandler, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { AnuaChatPage } from "@/components/social/AnuaChatModal"
import { getCurrentDayOfWeek } from "@/utils/date"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import { stopAnuaAudio } from "@/src/services/elevenlabs"

export default function AnuaChatScreen() {
  const router = useRouter()
  const close = useAnuaChatStore((s) => s.close)
  const chakraDayOverride = useAnuaChatStore((s) => s.chakraDayOverride)
  const initialMessage = useAnuaChatStore((s) => s.initialMessage)
  const isWaitingRoom = useAnuaChatStore((s) => s.isWaitingRoom)

  const currentDay =
    chakraDayOverride !== null ? chakraDayOverride : getCurrentDayOfWeek()
  const chakraName = getChakraName(currentDay)

  const handleClose = () => {
    stopAnuaAudio()
    close()
    router.back()
  }

  useEffect(() => {
    return () => {
      close()
    }
  }, [close])

  // Android: hardware back closes chat (escape hatch so user is never stuck)
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
      <AnuaChatPage
        onClose={handleClose}
        chakraDay={currentDay}
        chakraName={chakraName}
        isWaitingRoom={isWaitingRoom}
        initialMessage={initialMessage}
        androidModalHeight={null}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
})
