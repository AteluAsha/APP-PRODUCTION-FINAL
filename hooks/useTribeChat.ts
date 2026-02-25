/**
 * Tribe Chat Hook
 *
 * Real-time Firestore listener for tribe messages.
 * Collection: tribes / {tribeId} / messages
 * Fields: text, senderName, createdAt (timestamp).
 */

import { useEffect, useState, useCallback } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/src/services/firebase"

export interface TribeMessage {
  id: string
  text: string
  senderName: string
  createdAt: Date
}

const DEFAULT_TRIBE_ID = "global-trial-tribe"

export function useTribeChat(
  tribeId: string = DEFAULT_TRIBE_ID,
  enabled: boolean = true,
) {
  const [messages, setMessages] = useState<TribeMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setError(null)
      setMessages([])
      return
    }
    if (!db) {
      setError("Firebase not configured")
      setLoading(false)
      return
    }

    setError(null)
    setLoading(true)

    let unsubscribe: Unsubscribe | undefined
    try {
      const messagesRef = collection(db, "tribes", tribeId, "messages")
      const q = query(messagesRef, orderBy("createdAt", "asc"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: TribeMessage[] = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            const createdAt = data.createdAt as Timestamp | undefined
            list.push({
              id: doc.id,
              text: data.text ?? "",
              senderName: data.senderName ?? "Unknown",
              createdAt: createdAt?.toDate?.() ?? new Date(),
            })
          })
          setMessages(list)
          setLoading(false)
        },
        (err) => {
          if (__DEV__) {
            console.warn("[useTribeChat] onSnapshot error:", err)
          }
          setError(
            err instanceof Error ? err.message : "Failed to load messages",
          )
          setLoading(false)
        },
      )
    } catch (err) {
      if (__DEV__) {
        console.warn("[useTribeChat] Firestore init error:", err)
      }
      setError(err instanceof Error ? err.message : "Failed to connect")
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [tribeId, enabled])

  const sendMessage = useCallback(
    async (
      text: string,
      senderName: string = "Guest",
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!db) return { ok: false, error: "Firebase not configured" }
      const trimmed = text.trim()
      if (!trimmed) return { ok: false, error: "Message cannot be empty" }

      try {
        const messagesRef = collection(db, "tribes", tribeId, "messages")
        await addDoc(messagesRef, {
          text: trimmed,
          senderName,
          createdAt: serverTimestamp(),
        })
        return { ok: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to send"
        if (__DEV__) {
          console.warn("[useTribeChat] sendMessage error:", err)
        }
        return { ok: false, error: msg }
      }
    },
    [tribeId],
  )

  return { messages, sendMessage, loading, error }
}
