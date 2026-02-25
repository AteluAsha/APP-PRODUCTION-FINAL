/**
 * Applies a stored invite ref (from /invite?ref=) after the current user is ready.
 * When we have a pending ref and the app has a user, we update the inviter's
 * pending member doc to connected and clear the ref.
 */

import { useEffect, useRef } from "react"
import { getUserId } from "@/src/services/userId"
import {
  getPendingInviteRef,
  applyPendingInviteRef,
} from "@/src/services/inviteRefStorage"
import { usePresenceStore } from "@/hooks/usePresenceStore"

export function InviteRefApplier() {
  const applied = useRef(false)
  const displayName = usePresenceStore((s) => s.displayName)
  const profileImageUri = usePresenceStore((s) => s.profileImageUri)

  useEffect(() => {
    if (applied.current) return
    let cancelled = false
    ;(async () => {
      const ref = await getPendingInviteRef()
      if (cancelled || !ref) return
      await getUserId()
      if (cancelled) return
      const { displayName: name, profileImageUri: avatar } =
        usePresenceStore.getState()
      const ok = await applyPendingInviteRef(
        name || "Soul",
        avatar ?? undefined,
      )
      if (ok) applied.current = true
    })()
    return () => {
      cancelled = true
    }
  }, [displayName, profileImageUri])

  return null
}
