/**
 * Shared ref for "other" origin audio (e.g. crystal bowl from SoundBath).
 * OtherOriginAudioManager creates the track and stores it here when user is not on AudioPlayer.
 * When user opens AudioPlayer from mini player, AudioPlayer takes the track from here.
 * When user closes AudioPlayer, AudioPlayer puts the track back here so playback continues
 * and the mini player can control it.
 */

import { Audio } from "expo-av"

export interface OtherOriginTrackRef {
  sound: Audio.Sound
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
