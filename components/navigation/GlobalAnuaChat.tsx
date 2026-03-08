/**
 * Global Anua Chat - Opens Anua as a full-screen route
 *
 * When useAnuaChatStore.open() is called, we navigate to /(chakras)/AnuaChat so the
 * chat runs in the same view hierarchy (fixes Android Modal touch issues). Entry
 * points (Notes, Sanctuary, Quiz, etc.) only call open(); this component handles
 * navigation. Close is handled by the AnuaChat screen (router.back() + close()).
 */

import React, { useEffect, useRef } from "react"
import { useRouter } from "expo-router"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"

export const GlobalAnuaChat = () => {
  const isOpen = useAnuaChatStore((s) => s.isOpen)
  const router = useRouter()
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    if (isOpen && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true
      router.push("/(chakras)/AnuaChat")
    }
    if (!isOpen) {
      hasNavigatedRef.current = false
    }
  }, [isOpen, router])

  return null
}
