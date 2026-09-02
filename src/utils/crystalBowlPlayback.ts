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
  downloadAndCacheAudio,
  downloadAndCacheAudioResumable,
  downloadAudioHead,
} from "./audioDownload"
import { isSanctuaryVaultAudioId } from "@/constants/sanctuaryVaultTracks"
import { peekSanctuaryTrack } from "@/src/services/sanctuaryVaultDownloader"

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
 * expo-av on Android and iOS needs file:/// (three slashes). Native File.toURI()
 * can emit file:/ (one slash). Normalize so createAsync always gets an absolute
 * file:/// URI for on-device playback.
 */
export function toAbsoluteFileUri(uri: string): string {
  const trimmed = uri.trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith("file:///")) return trimmed
  if (trimmed.startsWith("content:")) return trimmed
  if (trimmed.startsWith("file:/")) {
    const afterScheme = trimmed.slice("file:".length)
    const path = afterScheme.replace(/^\/+/, "/")
    return `file://${path}`
  }
  if (trimmed.startsWith("/")) return `file://${trimmed}`
  return trimmed
}

export function isLocalPlaybackUri(uri: string | null | undefined): boolean {
  if (!uri) return false
  return (
    uri.startsWith("file:") ||
    uri.startsWith("content:") ||
    uri.startsWith("/")
  )
}

function playbackSourceForUri(uri: string): AVPlaybackSource {
  if (isLocalPlaybackUri(uri)) {
    return { uri: toAbsoluteFileUri(uri) }
  }
  return { uri }
}

export async function prepareLongAudioForPlay(
  input: CrystalBowlSourceInput,
  options: LongAudioOptions = {},
): Promise<AVPlaybackSource> {
  const { url, localUri, audioId, fallback } = input
  const {
    requireFullDownload = false,
    allowStreamingFallback = false,
    useResumableForBackgroundFull = false,
  } = options

  if (isSanctuaryVaultAudioId(audioId)) {
    const vaultUri = await peekSanctuaryTrack(audioId)
    if (!vaultUri) {
      throw new Error("This track is not on this device")
    }
    return playbackSourceForUri(vaultUri)
  }

  if (isLocalPlaybackUri(localUri)) return playbackSourceForUri(localUri as string)
  if (isLocalPlaybackUri(url)) return playbackSourceForUri(url as string)

  const cached = await getLocalAudioUri(audioId)
  if (cached && isLocalPlaybackUri(cached)) return playbackSourceForUri(cached)

  const fallbackUri =
    typeof fallback === "object" && fallback !== null && "uri" in fallback
      ? (fallback as { uri?: string }).uri
      : ""
  if (isLocalPlaybackUri(fallbackUri)) {
    return playbackSourceForUri(fallbackUri as string)
  }

  if (!allowStreamingFallback) {
    throw new Error("This track is not on this device")
  }

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
        const localPath = await downloadAndCacheAudioResumable(url, audioId)
        return playbackSourceForUri(localPath)
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[prepareLongAudioForPlay] Resumable download failed:",
            error,
          )
        }
        throw error
      }
    }
    throw new Error("No audio URL available for playback")
  }

  if (url) {
    try {
      const head = await downloadAudioHead(url, audioId)
      startBackgroundFullDownload()
      return playbackSourceForUri(head)
    } catch (error) {
      if (__DEV__) {
        console.warn(
          "[prepareLongAudioForPlay] Head download failed, trying full:",
          error,
        )
      }
      const localPath = useResumableForBackgroundFull
        ? await downloadAndCacheAudioResumable(url, audioId)
        : await downloadAndCacheAudio(url, audioId)
      return playbackSourceForUri(localPath)
    }
  }

  throw new Error("This track is not on this device")
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

  if (isSanctuaryVaultAudioId(audioId)) {
    const vaultUri = await peekSanctuaryTrack(audioId)
    if (!vaultUri) {
      throw new Error("This track is not on this device")
    }
    return playbackSourceForUri(vaultUri)
  }

  if (isLocalPlaybackUri(localUri)) return playbackSourceForUri(localUri as string)
  if (isLocalPlaybackUri(url)) return playbackSourceForUri(url as string)

  const cached = await getLocalAudioUri(audioId)
  if (cached && isLocalPlaybackUri(cached)) return playbackSourceForUri(cached)

  const fallbackUri =
    typeof fallback === "object" && fallback !== null && "uri" in fallback
      ? (fallback as { uri?: string }).uri
      : ""
  if (isLocalPlaybackUri(fallbackUri)) {
    return playbackSourceForUri(fallbackUri as string)
  }

  throw new Error("Crystal bowl is not on this device")
}
