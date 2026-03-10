/**
 * Crystal Bowl & Long Audio Playback Utility
 *
 * PRODUCTION RULE: Once a file is on device (localUri or getLocalAudioUri),
 * playback uses it only. Never stream from URL when local file exists — prevents
 * cutoff under high traffic or network drop. Audio should never cut off once downloaded.
 *
 * Long audio (Crystal Bowl ~1 hr, Embodiment) causes choppy playback when streamed.
 * We always play from a local file: full file preferred, then "head" (first ~3 min)
 * so the start is never stuttery. Critical for somatic/UX.
 */

import { AVPlaybackSource } from "expo-av"
import {
  getLocalAudioUri,
  getLocalAudioHeadUri,
  getLocalAudioHeadUriWithMinSize,
  downloadAndCacheAudio,
  downloadAndCacheAudioResumable,
  downloadAndCacheAudioResumableWithTimeout,
  downloadAudioHead,
  MEDITATION_DOWNLOAD_TIMEOUT_MS,
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
  /** Timeout for full-file download when requireFullDownload (meditation-length content). */
  downloadTimeoutMs?: number
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
    downloadTimeoutMs = MEDITATION_DOWNLOAD_TIMEOUT_MS,
  } = options

  // Local-first: once downloaded, always use local — no stream, no cutoff
  if (localUri) return { uri: localUri }
  const full = await getLocalAudioUri(audioId)
  if (full) return { uri: full }

  const startBackgroundFullDownload = (): void => {
    if (!url) return
    if (useResumableForBackgroundFull) {
      downloadAndCacheAudioResumable(url, audioId).catch(() => {})
    } else {
      downloadAndCacheAudio(url, audioId).catch(() => {})
    }
  }

  if (requireFullDownload) {
    if (url) {
      try {
        const localPath = await downloadAndCacheAudioResumableWithTimeout(
          url,
          audioId,
          downloadTimeoutMs,
        )
        return { uri: localPath }
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[prepareLongAudioForPlay] Resumable download failed or timed out:",
            error,
          )
        }
        if (!allowStreamingFallback) {
          downloadAndCacheAudioResumable(url, audioId).catch(() => {})
          throw error
        }
        return { uri: url }
      }
    }
    // Never return empty fallback — store would reject and user sees "No audio selected". Throw so caller can handle (retry/close).
    const fallbackUri =
      typeof fallback === "object" && fallback !== null && "uri" in fallback
        ? (fallback as { uri?: string }).uri
        : ""
    if (!fallbackUri || String(fallbackUri).trim() === "") {
      throw new Error("No audio URL available for playback")
    }
    return fallback
  }

  // Master Embodiment and Head to Heart must call with requireFullDownload: true so this head path is never used for them (avoids 1:05 truncated playback).
  // Use min size so we never return a truncated head (~30s cutoff); matches prepareCrystalBowlForPlay.
  let head = await getLocalAudioHeadUriWithMinSize(audioId)
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
 * Prefer local file (full or head) so playback is seamless when downloaded.
 * When full is not cached: try head (cached or download) so the start is never
 * streamed; start full resumable download in background. Fall back to stream only
 * if head is unavailable.
 */
export async function prepareCrystalBowlForPlay(
  input: CrystalBowlSourceInput,
): Promise<AVPlaybackSource> {
  const { url, localUri, audioId, fallback } = input

  // Local-first: once downloaded, never stream (no cutoff)
  if (localUri) return { uri: localUri }
  const full = await getLocalAudioUri(audioId)
  if (full) return { uri: full }

  // Prefer head (first ~3 min) so start is local – no stream stutter. Use min size so we never return a truncated head (~30s cutoff).
  let head = await getLocalAudioHeadUriWithMinSize(audioId)
  if (head) {
    if (url) downloadAndCacheAudioResumable(url, audioId).catch(() => {})
    return { uri: head }
  }
  if (url) {
    try {
      head = await downloadAudioHead(url, audioId)
      downloadAndCacheAudioResumable(url, audioId).catch(() => {})
      return { uri: head }
    } catch (e) {
      if (__DEV__) {
        console.warn(
          "[prepareCrystalBowlForPlay] Head failed, streaming from URL:",
          e,
        )
      }
      return { uri: url }
    }
  }

  return fallback
}
