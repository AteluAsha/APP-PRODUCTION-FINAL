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
  getPendingInviteStartDate,
  clearPendingInviteStartDate,
} from "@/src/services/inviteRefStorage"
import { usePresenceStore } from "@/hooks/usePresenceStore"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { onJourneyWeekStarted } from "@/src/services/journeyNotifications"

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

      if (cancelled) return
      const startDateISO = await getPendingInviteStartDate()
      if (!startDateISO) return
      const parsed = new Date(startDateISO + "T00:00:00")
      if (Number.isNaN(parsed.getTime())) return
      const { setCourseStartDate, startJourney } =
        useChakraJourneyStore.getState()
      setCourseStartDate(startDateISO)
      startJourney(startDateISO)
      void onJourneyWeekStarted()
      await clearPendingInviteStartDate()
    })()
    return () => {
      cancelled = true
    }
  }, [displayName, profileImageUri])

  return null
}
