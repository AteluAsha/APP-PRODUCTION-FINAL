/**
 * Tribe Invites – direct "invite this person to your tribe"
 *
 * When user A taps "Create the Connection" on user B's profile, we create
 * an invite. User B sees it in Tribe Chat under "Pending invites" and can
 * Accept (join A's room) or Decline.
 */

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

const COLLECTION = "tribeInvites"
const DEFAULT_ROOM_ID = "global-trial-tribe"

export type TribeInviteStatus = "pending" | "accepted" | "declined"

export interface TribeInvite {
  id: string
  fromUserId: string
  toUserId: string
  fromDisplayName: string
  fromAvatarUrl?: string
  roomId: string
  status: TribeInviteStatus
  createdAt: Date
}

function toDate(v: unknown): Date {
  if (v == null) return new Date()
  if (v instanceof Date) return v
  const t = v as Timestamp
  return t?.toDate?.() ?? new Date()
}

/**
 * Create an invite from current user to another user (shows in their Tribe Chat as pending).
 */
export async function createTribeInvite(
  fromUserId: string,
  toUserId: string,
  fromDisplayName: string,
  fromAvatarUrl?: string,
  roomId: string = DEFAULT_ROOM_ID,
): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "Firebase not configured" }
  if (fromUserId === toUserId) return { ok: false, error: "Cannot invite yourself" }
  try {
    await addDoc(collection(db, COLLECTION), {
      fromUserId,
      toUserId,
      fromDisplayName: fromDisplayName || "A soul",
      fromAvatarUrl: fromAvatarUrl ?? null,
      roomId,
      status: "pending",
      createdAt: Timestamp.now(),
    })
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send invite"
    if (__DEV__) console.warn("[tribeInvites] createTribeInvite error:", err)
    return { ok: false, error: msg }
  }
}

/**
 * Subscribe to pending invites sent TO the given user (for Tribe Chat "Pending invites").
 */
export function subscribeTribeInvitesToUser(
  toUserId: string,
  onInvites: (invites: TribeInvite[]) => void,
): Unsubscribe | null {
  if (!db || !toUserId) return null
  try {
    const q = query(
      collection(db, COLLECTION),
      where("toUserId", "==", toUserId),
      where("status", "==", "pending"),
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: TribeInvite[] = []
        snap.forEach((d) => {
          const data = d.data()
          list.push({
            id: d.id,
            fromUserId: data.fromUserId ?? "",
            toUserId: data.toUserId ?? "",
            fromDisplayName: data.fromDisplayName ?? "A soul",
            fromAvatarUrl: data.fromAvatarUrl ?? undefined,
            roomId: data.roomId ?? DEFAULT_ROOM_ID,
            status: (data.status as TribeInviteStatus) ?? "pending",
            createdAt: toDate(data.createdAt),
          })
        })
        onInvites(list)
      },
      (err) => {
        if (__DEV__) console.warn("[tribeInvites] subscribe error:", err)
        onInvites([])
      },
    )
    return unsub
  } catch (err) {
    if (__DEV__) console.warn("[tribeInvites] subscribe setup error:", err)
    return null
  }
}

/**
 * Accept an invite: add the current user to the inviter's room and mark invite accepted.
 */
export async function acceptTribeInvite(
  inviteId: string,
  acceptedByUserId: string,
  acceptedByDisplayName: string,
  acceptedByAvatarUrl?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "Firebase not configured" }
  try {
    const inviteRef = doc(db, COLLECTION, inviteId)
    const inviteSnap = await getDoc(inviteRef)
    const roomId =
      (inviteSnap.exists() && inviteSnap.data()?.roomId) || DEFAULT_ROOM_ID
    await updateDoc(inviteRef, { status: "accepted" })
    const membersRef = collection(db, "tribeRooms", roomId, "members")
    await setDoc(
      doc(membersRef, acceptedByUserId),
      {
        displayName: acceptedByDisplayName || "Soul",
        profilePicUrl: acceptedByAvatarUrl ?? null,
        status: "connected",
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
      { merge: true },
    )
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to accept invite"
    if (__DEV__) console.warn("[tribeInvites] acceptTribeInvite error:", err)
    return { ok: false, error: msg }
  }
}

/**
 * Decline an invite.
 */
export async function declineTribeInvite(
  inviteId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "Firebase not configured" }
  try {
    await updateDoc(doc(db, COLLECTION, inviteId), { status: "declined" })
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to decline"
    if (__DEV__) console.warn("[tribeInvites] declineTribeInvite error:", err)
    return { ok: false, error: msg }
  }
}
