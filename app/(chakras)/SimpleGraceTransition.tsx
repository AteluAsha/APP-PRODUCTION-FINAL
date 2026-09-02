/**
 * Trial grace / paywall-bridge screen is disconnected. Course lives on ChakraHub.
 */
import React, { useEffect } from "react"
import { View } from "react-native"
import { useRouter } from "expo-router"

export default function SimpleGraceTransitionScreen() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/(chakras)/ChakraHub")
  }, [router])

  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
