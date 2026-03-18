/**
 * Preview screen (waiting room entry)
 *
 * Renders PreviewJourney with Stack fade transition. Back goes to ChakraHome (waiting room).
 */

import React from "react"
import { useRouter } from "expo-router"
import { PreviewJourney } from "@/components/chakras/PreviewJourney"

export default function Preview() {
  const router = useRouter()
  return <PreviewJourney onBackPress={() => router.back()} />
}
