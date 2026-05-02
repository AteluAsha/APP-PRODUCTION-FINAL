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
 *
 * requireFullDownload: must verify local size vs remote before trusting cache — partial
 * writes must never play (~1min cutoff bug).
 */

import { AVPlaybackSource } from "expo-av"
import {
  getLocalAudioUri,
  getLocalAudioHeadUri,
  getLocalAudioHeadUriWithMinSize,
  downloadAndCacheAudio,
  downloadAndCacheAudioResumable,
  downloadAudioHead,
  isCachedFullFileComplete,
  clearCachedFullAudioOnly,
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

  if (requireFullDownload) {
    if (url) {
      const existingPath = localUri || (await getLocalAudioUri(audioId))
      if (existingPath) {
        const complete = await isCachedFullFileComplete(audioId, url)
        if (complete) {
          return { uri: existingPath }
        }
        await clearCachedFullAudioOnly(audioId)
      }
      try {
        const localPath = await downloadAndCacheAudioResumable(url, audioId)
        return { uri: localPath }
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[prepareLongAudioForPlay] Resumable download failed:",
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
    const fallbackUri =
      typeof fallback === "object" && fallback !== null && "uri" in fallback
        ? (fallback as { uri?: string }).uri
        : ""
    if (!fallbackUri || String(fallbackUri).trim() === "") {
      throw new Error("No audio URL available for playback")
    }
    return fallback
  }

  if (localUri) return { uri: localUri }
  const full = await getLocalAudioUri(audioId)
  if (full) return { uri: full }

  // Master Embodiment and Head to Heart use requireFullDownload above (never this head path for them).
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

  if (localUri) return { uri: localUri }
  const full = await getLocalAudioUri(audioId)
  if (full) return { uri: full }

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
