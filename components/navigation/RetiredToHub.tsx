/**
 * Retired routes bounce here so stale deep links never strand the user.
 * Course lives on ChakraHub.
 */
import React, { useEffect } from "react"
import { View } from "react-native"
import { useRouter } from "expo-router"

export function RetiredToHub() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/(chakras)/ChakraHub")
  }, [router])

  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
