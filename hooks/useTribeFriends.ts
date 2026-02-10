/**
 * Tribe Friends Hook
 *
 * Real-time Firestore listener for tribe room members.
 * Collection: tribeRooms / {roomId} / members / {memberId}
 * Fields: displayName, profilePicUrl?, status ('connected' | 'pending'), invitedAt, joinedAt?, lastActiveAt?
 */

import { useEffect, useState, useCallback } from "react"
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  type Unsubscribe,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/src/services/firebase"
import type { TribeFriend } from "@/types/tribe"

const DEFAULT_ROOM_ID = "global-trial-tribe"

export interface TribeRoomMemberDoc {
  displayName: string
  profilePicUrl?: string
  status: "connected" | "pending"
  invitedAt: string
  invitedBy?: string
  joinedAt?: string
  lastActiveAt?: string
}

export function useTribeFriends(roomId: string = DEFAULT_ROOM_ID, enabled: boolean = true) {
  const [connected, setConnected] = useState<TribeFriend[]>([])
  const [pending, setPending] = useState<TribeFriend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setError(null)
      setConnected([])
      setPending([])
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
      const membersRef = collection(db, "tribeRooms", roomId, "members")
      unsubscribe = onSnapshot(
        membersRef,
        (snapshot) => {
          const conn: TribeFriend[] = []
          const pend: TribeFriend[] = []
          snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            const invitedAt = toIso(data.invitedAt)
            const joinedAt = toIso(data.joinedAt)
            const lastActiveAt = toIso(data.lastActiveAt)
            const friend: TribeFriend = {
              id: docSnap.id,
              displayName: data.displayName ?? "Unknown",
              profilePicUrl: data.profilePicUrl,
              status: data.status === "connected" ? "connected" : "pending",
              invitedAt,
              joinedAt,
              lastActiveAt,
            }
            if (friend.status === "connected") conn.push(friend)
            else pend.push(friend)
          })
          setConnected(conn)
          setPending(pend)
          setLoading(false)
        },
        (err) => {
          if (__DEV__) {
            console.warn("[useTribeFriends] onSnapshot error:", err)
          }
          setError(err instanceof Error ? err.message : "Failed to load members")
          setLoading(false)
        },
      )
    } catch (err) {
      if (__DEV__) {
        console.warn("[useTribeFriends] Firestore init error:", err)
      }
      setError(err instanceof Error ? err.message : "Failed to connect")
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [roomId, enabled])

  const addPendingInvite = useCallback(
    async (displayName: string, invitedBy?: string): Promise<{ ok: boolean; error?: string }> => {
      if (!db) return { ok: false, error: "Firebase not configured" }
      try {
        const memberId = `pending-${Date.now()}`
        const membersRef = collection(db, "tribeRooms", roomId, "members")
        await setDoc(doc(membersRef, memberId), {
          displayName: displayName || "Pending invite",
          status: "pending",
          invitedAt: new Date().toISOString(),
          invitedBy: invitedBy ?? null,
        })
        return { ok: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to add invite"
        if (__DEV__) console.warn("[useTribeFriends] addPendingInvite error:", err)
        return { ok: false, error: msg }
      }
    },
    [roomId],
  )

  const setMemberConnected = useCallback(
    async (memberId: string, displayName: string, profilePicUrl?: string): Promise<{ ok: boolean; error?: string }> => {
      if (!db) return { ok: false, error: "Firebase not configured" }
      try {
        const membersRef = collection(db, "tribeRooms", roomId, "members")
        const now = new Date().toISOString()
        await setDoc(
          doc(membersRef, memberId),
          {
            displayName,
            profilePicUrl: profilePicUrl ?? null,
            status: "connected",
            joinedAt: now,
            lastActiveAt: now,
          },
          { merge: true },
        )
        return { ok: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update member"
        if (__DEV__) console.warn("[useTribeFriends] setMemberConnected error:", err)
        return { ok: false, error: msg }
      }
    },
    [roomId],
  )

  return {
    connected,
    pending,
    loading,
    error,
    addPendingInvite,
    setMemberConnected,
  }
}

function toIso(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === "string") return value
  const ts = value as Timestamp
  const d = ts.toDate?.()
  return d ? d.toISOString() : undefined
}
