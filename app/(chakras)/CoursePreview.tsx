/**
 * Trial course preview is disconnected. Course lives on ChakraHub.
 */
import React, { useEffect } from "react"
import { View } from "react-native"
import { useRouter } from "expo-router"

export default function CoursePreview() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/(chakras)/ChakraHub")
  }, [router])

  return <View style={{ flex: 1, backgroundColor: "#000000" }} />
}
