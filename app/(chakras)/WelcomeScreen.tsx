/**
 * Path-selection / trial entry is disconnected. Splash already routes to ChakraHub.
 */
import React, { useEffect } from "react"
import { View } from "react-native"
import { useRouter } from "expo-router"

export default function WelcomeScreen() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/(chakras)/ChakraHub")
  }, [router])

  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
