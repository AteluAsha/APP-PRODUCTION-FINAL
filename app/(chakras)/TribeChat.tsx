/**
 * Tribe Chat Route
 *
 * Renders TribeChatContent. Single entry point – all tribe buttons navigate here.
 * Source of truth: components/tribe/TribeChatContent.tsx
 */

import React from "react"
import { View, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { TribeChatContent } from "@/components/tribe/TribeChatContent"

export default function TribeChatScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <TribeChatContent onClose={() => router.back()} enabled={true} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
})
