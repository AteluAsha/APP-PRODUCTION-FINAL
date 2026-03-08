/**
 * Invite ref storage – persist ref from invite deep link for post-signup activation.
 *
 * When the user opens soulschool.app/invite?ref=INVITER_ID we store the ref.
 * When the app has a current user (after signup/open), we apply it: update the
 * pending member doc (pending-${ref}) to connected and clear the stored ref.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { collection, doc, setDoc } from "firebase/firestore"
import { db } from "./firebase"

const KEY_PENDING_INVITE_REF = "pending_invite_ref"
const KEY_PENDING_INVITE_START = "pending_invite_start"
const DEFAULT_ROOM_ID = "global-trial-tribe"

export async function setPendingInviteRef(ref: string): Promise<void> {
  await AsyncStorage.setItem(KEY_PENDING_INVITE_REF, ref)
}

export async function getPendingInviteRef(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PENDING_INVITE_REF)
}

export async function clearPendingInviteRef(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PENDING_INVITE_REF)
}

/** Store inviter's journey start date (ISO YYYY-MM-DD) from invite link so invitee can sync to same week. */
export async function setPendingInviteStartDate(startDateISO: string): Promise<void> {
  await AsyncStorage.setItem(KEY_PENDING_INVITE_START, startDateISO)
}

export async function getPendingInviteStartDate(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PENDING_INVITE_START)
}

export async function clearPendingInviteStartDate(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PENDING_INVITE_START)
}

/**
 * If a pending invite ref is stored, update the inviter's pending member doc
 * to connected with the current user's display name and avatar, then clear the ref.
 * Call when the app has a current user (e.g. after getUserId() and presence are ready).
 */
export async function applyPendingInviteRef(
  displayName: string,
  profilePicUrl?: string,
): Promise<boolean> {
  const ref = await getPendingInviteRef()
  if (!ref || !db) return false
  try {
    const memberId = `pending-${ref}`
    const membersRef = collection(db, "tribeRooms", DEFAULT_ROOM_ID, "members")
    const now = new Date().toISOString()
    await setDoc(
      doc(membersRef, memberId),
      {
        displayName: displayName || "Soul",
        profilePicUrl: profilePicUrl ?? null,
        status: "connected",
        joinedAt: now,
        lastActiveAt: now,
      },
      { merge: true },
    )
    await clearPendingInviteRef()
    return true
  } catch (err) {
    if (__DEV__)
      console.warn("[inviteRefStorage] applyPendingInviteRef error:", err)
    return false
  }
}
