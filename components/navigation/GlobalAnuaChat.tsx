/**
 * Global Anua Chat - Renders AnuaChatModal from store
 *
 * Single instance rendered in root layout. Opened from Notes, Sanctuary,
 * or anywhere via useAnuaChatStore.open({ initialMessage? })
 */

import React, { useCallback } from "react"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { AnuaChatModal } from "@/components/social/AnuaChatModal"
import { getCurrentDayOfWeek } from "@/utils/date"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import { stopAnuaAudio } from "@/src/services/elevenlabs"

export const GlobalAnuaChat = () => {
  const isOpen = useAnuaChatStore((s) => s.isOpen)
  const initialMessage = useAnuaChatStore((s) => s.initialMessage)
  const isWaitingRoom = useAnuaChatStore((s) => s.isWaitingRoom)
  const chakraDayOverride = useAnuaChatStore((s) => s.chakraDayOverride)
  const close = useAnuaChatStore((s) => s.close)

  const currentDay =
    chakraDayOverride !== null ? chakraDayOverride : getCurrentDayOfWeek()
  const chakraName = getChakraName(currentDay)

  const handleClose = useCallback(() => {
    stopAnuaAudio()
    close()
  }, [close])

  return (
    <AnuaChatModal
      visible={isOpen}
      onClose={handleClose}
      chakraDay={currentDay}
      chakraName={chakraName}
      isWaitingRoom={isWaitingRoom}
      initialMessage={initialMessage}
    />
  )
}
