/**
 * Tribe Chat Route
 *
 * Renders TribeChatContent. Single entry point – all tribe buttons navigate here.
 * Can be opened with initial message from Notes via useTribeChatStore.
 * Escape: onClose calls store.close() + router.back(); hardware back pops this screen.
 */

import React, { useEffect } from "react"
import { View, StyleSheet, BackHandler, Platform } from "react-native"
import { useRouter } from "expo-router"
import { TribeChatContent } from "@/components/tribe/TribeChatContent"
import { useTribeChatStore } from "@/hooks/useTribeChatStore"

export default function TribeChatScreen() {
  const router = useRouter()
  const close = useTribeChatStore((s) => s.close)
  const initialMessage = useTribeChatStore((s) => s.initialMessage)

  const handleClose = () => {
    close()
    router.back()
  }

  useEffect(() => {
    return () => {
      close()
    }
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
      <TribeChatContent
        onClose={handleClose}
        enabled={true}
        initialMessage={initialMessage}
        onClearInitialMessage={() => useTribeChatStore.getState().clearInitialMessage()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
})
