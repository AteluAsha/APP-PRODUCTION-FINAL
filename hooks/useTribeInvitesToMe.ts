/**
 * Pending tribe invites sent TO the current user.
 * Used in Tribe Chat to show "X invited you" with Create the Connection / Decline.
 */

import { useEffect, useState, useCallback } from "react"
import { getUserId } from "@/src/services/userId"
import {
  subscribeTribeInvitesToUser,
  acceptTribeInvite,
  declineTribeInvite,
  type TribeInvite,
} from "@/src/services/tribeInvites"

export function useTribeInvitesToMe(enabled: boolean = true) {
  const [pendingInvites, setPendingInvites] = useState<TribeInvite[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) {
      setPendingInvites([])
      setLoading(false)
      return
    }
    let unsub: (() => void) | null = null
    getUserId()
      .then((uid) => {
        setCurrentUserId(uid)
        unsub = subscribeTribeInvitesToUser(uid, setPendingInvites) ?? null
      })
      .catch(() => setPendingInvites([]))
      .finally(() => setLoading(false))
    return () => {
      if (unsub) unsub()
    }
  }, [enabled])

  const accept = useCallback(
    async (
      inviteId: string,
      acceptedByDisplayName: string,
      acceptedByAvatarUrl?: string,
    ) => {
      if (!currentUserId) return { ok: false, error: "Not signed in" }
      return acceptTribeInvite(
        inviteId,
        currentUserId,
        acceptedByDisplayName,
        acceptedByAvatarUrl,
      )
    },
    [currentUserId],
  )

  const decline = useCallback(declineTribeInvite, [])

  return {
    pendingInvites,
    loading,
    accept,
    decline,
  }
}
