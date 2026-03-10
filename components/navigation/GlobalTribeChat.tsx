/**
 * Global Tribe Chat - Opens Tribe Chat as a full-screen route
 *
 * When useTribeChatStore.open() is called (e.g. from Notes "Send to Tribe"),
 * we navigate to /(chakras)/TribeChat so the chat opens with optional
 * initial message. Close is handled by the TribeChat screen (router.back() + close()).
 */

import React, { useEffect, useRef } from "react"
import { useRouter } from "expo-router"
import { useTribeChatStore } from "@/hooks/useTribeChatStore"

export const GlobalTribeChat = () => {
  const isOpen = useTribeChatStore((s) => s.isOpen)
  const router = useRouter()
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    if (isOpen && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true
      router.push("/(chakras)/TribeChat")
    }
    if (!isOpen) {
      hasNavigatedRef.current = false
    }
  }, [isOpen, router])

  return null
}
