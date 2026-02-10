/**
 * Crystal Bowl & Long Audio Playback Utility
 *
 * Long audio (Crystal Bowl ~1 hr, Embodiment) causes choppy playback when
 * streamed. We always play from a local file: full file preferred, then
 * "head" (first ~3 min) so the start is never stuttery. Critical for somatic/UX.
 */

import { AVPlaybackSource } from "expo-av"
import {
  getLocalAudioUri,
  getLocalAudioHeadUri,
  downloadAndCacheAudio,
  downloadAndCacheAudioResumable,
  downloadAudioHead,
} from "./audioDownload"

export interface CrystalBowlSourceInput {
  url: string | null
  localUri: string | null
  audioId: string
  fallback: AVPlaybackSource
}

interface LongAudioOptions {
  requireFullDownload?: boolean
  allowStreamingFallback?: boolean
  /** When playing from head, start full download in background using resumable (for 1hr files) */
  useResumableForBackgroundFull?: boolean
}

/**
 * Prepare long audio for playback: prefer full file, then head (first 3 min).
 * If only URL: download head first (fast), play head; optionally start full
 * download in background. Ensures no playback glitches at start.
 */
export async function prepareLongAudioForPlay(
  input: CrystalBowlSourceInput,
  options: LongAudioOptions = {},
): Promise<AVPlaybackSource> {
  const { url, localUri, audioId, fallback } = input
  const {
    requireFullDownload = false,
    allowStreamingFallback = true,
    useResumableForBackgroundFull = false,
  } = options

  const startBackgroundFullDownload = (): void => {
    if (!url) return
    if (useResumableForBackgroundFull) {
      downloadAndCacheAudioResumable(url, audioId).catch(() => {})
    } else {
      downloadAndCacheAudio(url, audioId).catch(() => {})
    }
  }

  if (localUri) {
    return { uri: localUri }
  }

  const full = await getLocalAudioUri(audioId)
  if (full) {
    return { uri: full }
  }

  if (requireFullDownload) {
    if (url) {
      try {
        const localPath = await downloadAndCacheAudioResumable(url, audioId)
        return { uri: localPath }
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[prepareLongAudioForPlay] Resumable download failed, fallback to stream:",
            error,
          )
        }
        return { uri: url }
      }
    }
    return fallback
  }

  let head = await getLocalAudioHeadUri(audioId)
  if (head) {
    startBackgroundFullDownload()
    return { uri: head }
  }

  if (url) {
    try {
      head = await downloadAudioHead(url, audioId)
      startBackgroundFullDownload()
      return { uri: head }
    } catch (error) {
      if (__DEV__) {
        console.warn(
          "[prepareLongAudioForPlay] Head download failed, trying full:",
          error,
        )
      }
      try {
        const localPath = useResumableForBackgroundFull
          ? await downloadAndCacheAudioResumable(url, audioId)
          : await downloadAndCacheAudio(url, audioId)
        return { uri: localPath }
      } catch (fullError) {
        if (__DEV__) {
          console.warn(
            "[prepareLongAudioForPlay] Full download failed, fallback to stream:",
            fullError,
          )
        }
        if (allowStreamingFallback && url) {
          return { uri: url }
        }
        return fallback
      }
    }
  }

  return fallback
}

/**
 * Prepare Crystal Bowl audio for playback (all 7 chakras).
 * Stream-first: if we have a Firebase URL, play from URL immediately so playback
 * always works. Use cached full file when present. Start full resumable download
 * in background for next time. Avoids head/truncated-AAC issues on iOS.
 */
export async function prepareCrystalBowlForPlay(
  input: CrystalBowlSourceInput,
): Promise<AVPlaybackSource> {
  const { url, localUri, audioId, fallback } = input

  if (localUri) {
    return { uri: localUri }
  }

  const full = await getLocalAudioUri(audioId)
  if (full) {
    return { uri: full }
  }

  if (url) {
    downloadAndCacheAudioResumable(url, audioId).catch(() => {})
    return { uri: url }
  }

  return fallback
}
