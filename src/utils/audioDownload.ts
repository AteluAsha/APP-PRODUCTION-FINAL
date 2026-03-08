/**
 * Audio Download Utility
 *
 * PRODUCTION: Playback always prefers local file (getLocalAudioUri / localUri)
 * when available. Callers (prepareLongAudioForPlay, hooks) must check local first
 * so audio never cuts off once downloaded. Cache dir: FileSystem.cacheDirectory/audio/
 *
 * Bulletproof playback (Android + iOS): Same cache dir and logic on both platforms.
 * Waiting room starts head preload then full-file preload so once past waiting room
 * all course audio can be fully cached. Local-first + resumable for large files
 * = seamless, glitch-free somatic experience. Do not clear app cache if users
 * want offline/healing playback.
 */

import * as FileSystem from "expo-file-system"

const CACHE_DIR = `${FileSystem.cacheDirectory}audio/`
const HEAD_SUFFIX = "_head"

/** ~3 min of AAC at ~64–128 kbps: use 2.5 MB to be safe */
export const AUDIO_HEAD_BYTES = 2.5 * 1024 * 1024

/** Minimum head file size to accept; below this we throw or return null so callers fall back to full download or stream (avoids ~30s cutoff). */
const MIN_HEAD_BYTES = 500 * 1024

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

function bytesToBase64(bytes: Uint8Array): string {
  let result = ""
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    result += BASE64_CHARS[a >> 2]
    result += BASE64_CHARS[((a & 3) << 4) | ((b ?? 0) >> 4)]
    result +=
      b !== undefined ? BASE64_CHARS[((b & 15) << 2) | ((c ?? 0) >> 6)] : "="
    result += c !== undefined ? BASE64_CHARS[c & 63] : "="
  }
  return result
}

/** Extensions we treat as "has extension" so we don't append .aac (e.g. Day1 Hero2.mov, other .aac) */
const AUDIO_EXTENSIONS = [".aac", ".mov", ".m4a", ".mp3"]

function audioIdHasExtension(audioId: string): boolean {
  const lower = audioId.toLowerCase()
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function audioIdBaseWithoutExtension(audioId: string): string {
  const lower = audioId.toLowerCase()
  for (const ext of AUDIO_EXTENSIONS) {
    if (lower.endsWith(ext)) return audioId.slice(0, -ext.length)
  }
  return audioId
}

/** Full-file cache path: preserve .mov/.aac/etc so Day 1 Hero2.mov and others work. */
function getFullPath(audioId: string): string {
  return audioIdHasExtension(audioId)
    ? `${CACHE_DIR}${audioId}`
    : `${CACHE_DIR}${audioId}.aac`
}

/** Head cache: first ~3 min stored as .aac for consistent playback. */
function getHeadPath(audioId: string): string {
  const base = audioIdBaseWithoutExtension(audioId)
  return `${CACHE_DIR}${base}${HEAD_SUFFIX}.aac`
}

/**
 * Get local URI for a cached audio file (full file only)
 */
export async function getLocalAudioUri(
  audioId: string,
): Promise<string | null> {
  try {
    const fileUri = getFullPath(audioId)
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    if (fileInfo.exists) return fileUri
    return null
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[audioDownload] Error checking local audio for ${audioId}:`,
        error,
      )
    }
    return null
  }
}

/**
 * Get local URI for cached "head" (first ~3 min) of an audio file.
 * Used so playback never stutters at the start.
 */
export async function getLocalAudioHeadUri(
  audioId: string,
): Promise<string | null> {
  try {
    const fileUri = getHeadPath(audioId)
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    if (fileInfo.exists) return fileUri
    return null
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[audioDownload] Error checking local audio head for ${audioId}:`,
        error,
      )
    }
    return null
  }
}

/**
 * Like getLocalAudioHeadUri but returns null if head file is smaller than minBytes.
 * Use for long tracks (e.g. crystal bowl) so we never return a truncated head that would cut off early.
 */
export async function getLocalAudioHeadUriWithMinSize(
  audioId: string,
  minBytes: number = MIN_HEAD_BYTES,
): Promise<string | null> {
  try {
    const fileUri = getHeadPath(audioId)
    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true })
    if (!fileInfo.exists) return null
    const size = (fileInfo as { size?: number }).size ?? 0
    if (size < minBytes) return null
    return fileUri
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[audioDownload] Error checking local audio head size for ${audioId}:`,
        error,
      )
    }
    return null
  }
}

/**
 * Prefer full file; if not present, use head (first 3 min). Ensures smooth start.
 */
export async function getLocalAudioUriOrHead(
  audioId: string,
): Promise<string | null> {
  const full = await getLocalAudioUri(audioId)
  if (full) return full
  return getLocalAudioHeadUri(audioId)
}

/**
 * Download and cache an audio file (full).
 * For large files (~1 hr), use downloadAndCacheAudioResumable to avoid timeout.
 */
export async function downloadAndCacheAudio(
  audioUrl: string,
  audioId: string,
): Promise<string> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
    }

    const fileUri = getFullPath(audioId)
    const downloadResult = await FileSystem.downloadAsync(audioUrl, fileUri)

    if (__DEV__) {
      console.log(`[audioDownload] Audio cached: ${audioId}`)
    }

    return downloadResult.uri
  } catch (error) {
    if (__DEV__) {
      console.error(
        `[audioDownload] Error downloading audio ${audioId}:`,
        error,
      )
    }
    throw error
  }
}

/**
 * Download and cache a large audio file using resumable download.
 * Avoids iOS/Android timeout on full-file downloadAsync (~60s); use for crystal bowl (~1 hr).
 */
export async function downloadAndCacheAudioResumable(
  audioUrl: string,
  audioId: string,
): Promise<string> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
    }

    const fileUri = getFullPath(audioId)
    const resumable = FileSystem.createDownloadResumable(
      audioUrl,
      fileUri,
      {},
      (progress) => {
        if (__DEV__ && progress.totalBytesExpectedToWrite > 0) {
          const pct = Math.round(
            (100 * progress.totalBytesWritten) /
              progress.totalBytesExpectedToWrite,
          )
          if (pct % 20 === 0 || pct === 100) {
            console.log(`[audioDownload] Resumable ${audioId}: ${pct}%`)
          }
        }
      },
    )
    const result = await resumable.downloadAsync()

    if (!result?.uri) {
      throw new Error("Resumable download did not return a URI")
    }

    if (__DEV__) {
      console.log(`[audioDownload] Audio cached (resumable): ${audioId}`)
    }

    return result.uri
  } catch (error) {
    if (__DEV__) {
      console.error(
        `[audioDownload] Error downloading audio (resumable) ${audioId}:`,
        error,
      )
    }
    throw error
  }
}

/**
 * Download and cache only the first N bytes (first ~3 min) of an audio file.
 * Uses HTTP Range so playback can start instantly with no streaming glitches.
 * Critical for somatic/UX: the beginning of every track is always local.
 */
export async function downloadAudioHead(
  audioUrl: string,
  audioId: string,
  maxBytes: number = AUDIO_HEAD_BYTES,
): Promise<string> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
    }

    const fileUri = getHeadPath(audioId)

    const response = await fetch(audioUrl, {
      method: "GET",
      headers: { Range: `bytes=0-${maxBytes - 1}` },
    })

    if (!response.ok && response.status !== 206) {
      throw new Error(`Head download failed: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 =
      typeof globalThis.btoa !== "undefined"
        ? globalThis.btoa(binary)
        : bytesToBase64(bytes)
    if (!base64) {
      throw new Error("Base64 encode not available")
    }

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true })
    const size = (fileInfo as { size?: number })?.size ?? 0
    if (size < MIN_HEAD_BYTES) {
      try {
        await FileSystem.deleteAsync(fileUri)
      } catch (_) {
        /* ignore */
      }
      if (__DEV__) {
        console.warn(
          `[audioDownload] Head file too small (${size} bytes), rejecting so caller can use full download or stream`,
        )
      }
      throw new Error(
        `Head download too small (${size} bytes), need at least ${MIN_HEAD_BYTES}`,
      )
    }

    if (__DEV__) {
      console.log(`[audioDownload] Audio head cached: ${audioId} (${size} bytes)`)
    }

    return fileUri
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[audioDownload] Error downloading audio head ${audioId}:`,
        error,
      )
    }
    throw error
  }
}

/**
 * Clear a specific cached audio file (full and head)
 */
export async function clearCachedAudio(audioId: string): Promise<void> {
  try {
    for (const path of [getFullPath(audioId), getHeadPath(audioId)]) {
      const fileInfo = await FileSystem.getInfoAsync(path)
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(path)
        if (__DEV__) {
          console.log(`[audioDownload] Cleared cached audio: ${audioId}`)
        }
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[audioDownload] Error clearing cached audio ${audioId}:`,
        error,
      )
    }
  }
}

/**
 * Clear all cached audio files (full and head)
 */
export async function clearAllCachedAudio(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true })
      if (__DEV__) {
        console.log("[audioDownload] Cleared all cached audio files")
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("[audioDownload] Error clearing all cached audio:", error)
    }
  }
}
