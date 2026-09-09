/**
 * Shared ref for "other" origin audio (e.g. crystal bowl from SoundBath).
 * OtherOriginAudioManager creates the track and stores it here when user is not on AudioPlayer.
 * When user opens AudioPlayer from mini player, AudioPlayer takes the track from here.
 * Closing AudioPlayer always stops healing audio. This ref is only a handoff
 * while the full player is opening — never a license to keep playing after close.
 */

import type { HealingSound } from "@/src/utils/singleActiveSound"

export interface OtherOriginTrackRef {
  sound: HealingSound
  sourceSignature: string
}

export const otherOriginTrackRef: { current: OtherOriginTrackRef | null } = {
  current: null,
}

export function getSourceSignature(source: unknown): string {
  if (source && typeof source === "object" && "uri" in source) {
    return String((source as { uri: string }).uri)
  }
  return JSON.stringify(source)
}
