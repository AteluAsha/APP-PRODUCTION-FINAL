import { useState, useEffect } from "react"
import { View } from "react-native"
import ChakraTemplate from "@/components/chakras/ChakraTemplate"
import { ScreenCrashBoundary } from "@/components/ScreenCrashBoundary"
import { resolveCourseDayChakra } from "@/utils/chakraDayRoute"
import { useLocalSearchParams, useSegments } from "expo-router"

const ChakraScreen = () => {
  const params = useLocalSearchParams<{
    chakra?: string | string[]
    day?: string | string[]
  }>()
  const segments = useSegments()
  const raw = params.chakra
  const chakraParam = Array.isArray(raw) ? raw[0] : raw
  const chakra = resolveCourseDayChakra(chakraParam, segments, params.day)
  const [dayReady, setDayReady] = useState(false)

  useEffect(() => {
    if (!chakra) {
      setDayReady(false)
      return
    }
    const t = setTimeout(() => setDayReady(true), 50)
    return () => clearTimeout(t)
  }, [chakra])

  // No Hub bounce. A missing slug is still settling — for every day.
  if (!chakra || !dayReady) {
    return <View style={{ flex: 1, backgroundColor: "#000000" }} />
  }

  return (
    <ScreenCrashBoundary>
      <ChakraTemplate chakra={chakra} />
    </ScreenCrashBoundary>
  )
}

export default ChakraScreen
