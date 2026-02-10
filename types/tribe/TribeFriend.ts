/**
 * Tribe Friend – friend in a tribe room (connected, pending, or suggested)
 */

export type TribeFriendStatus = "connected" | "pending" | "suggested"

export interface TribeFriend {
  id: string
  displayName: string
  profilePicUrl?: string
  phoneHash?: string
  emailHash?: string
  status: TribeFriendStatus
  invitedAt?: string
  joinedAt?: string
  lastActiveAt?: string
}

export interface TribeRoomMember {
  userId: string
  displayName: string
  profilePicUrl?: string
  status: "connected" | "pending"
  invitedBy?: string
  invitedAt: string
  joinedAt?: string
  lastActiveAt?: string
}
