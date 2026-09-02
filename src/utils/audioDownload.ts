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
import { isSanctuaryVaultFsPath } from "@/src/utils/sanctuaryAudioVault"

const CACHE_DIR = `${FileSystem.cacheDirectory}audio/`

function assertNotVaultPath(path: string): void {
  if (isSanctuaryVaultFsPath(path)) {
    throw new Error("Refusing to mutate sanctuary vault from cache audio layer")
  }
}
const HEAD_SUFFIX = "_head"

/** ~3 min of AAC at ~64–128 kbps: use 2.5 MB to be safe */
export const AUDIO_HEAD_BYTES = 2.5 * 1024 * 1024

/** Minimum head file size to accept; below this we throw or return null so callers fall back to full download or stream (avoids ~30s cutoff). */
const MIN_HEAD_BYTES = 500 * 1024

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
export function getFullAudioCachePath(audioId: string): string {
  return audioIdHasExtension(audioId)
    ? `${CACHE_DIR}${audioId}`
    : `${CACHE_DIR}${audioId}.aac`
}

function getFullPath(audioId: string): string {
  return getFullAudioCachePath(audioId)
}

/** Head cache: first ~3 min stored as .aac for consistent playback. */
function getHeadPath(audioId: string): string {
  const base = audioIdBaseWithoutExtension(audioId)
  return `${CACHE_DIR}${base}${HEAD_SUFFIX}.aac`
}

/**
 * Get local URI for a cached audio file (full file only)
 */
/**
 * Remote byte length for a Firebase/GCS signed URL (HEAD, then Content-Range fallback).
 */
export async function getRemoteAssetByteLength(
  audioUrl: string,
): Promise<number | null> {
  try {
    const headRes = await fetch(audioUrl, { method: "HEAD" })
    const cl = headRes.headers.get("Content-Length")
    if (cl && /^\d+$/.test(cl.trim())) {
      const n = parseInt(cl, 10)
      if (n > 0) return n
    }
    const rangeRes = await fetch(audioUrl, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    })
    const cr = rangeRes.headers.get("Content-Range")
    const m = cr?.match(/\/(\d+)\s*$/)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > 0) return n
    }
    return null
  } catch {
    return null
  }
}

/**
 * True if a full-file cache exists and matches remote size (when known).
 * Prevents playing a partial write that was mistaken for a complete download.
 * When remote length cannot be determined, trust existing cache (avoid deleting short legit tracks).
 */
export async function isCachedFullFileComplete(
  audioId: string,
  remoteUrl: string,
): Promise<boolean> {
  const localUri = await getLocalAudioUri(audioId)
  if (!localUri) return false
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri, { size: true })
    const localSize = (fileInfo as { size?: number }).size ?? 0
    const remoteSize = await getRemoteAssetByteLength(remoteUrl)
    if (remoteSize != null && remoteSize > 0) {
      return localSize >= remoteSize * 0.97
    }
    return true
  } catch {
    return false
  }
}

/**
 * Remove only the full-file cache (keeps head slice if present).
 */
export async function clearCachedFullAudioOnly(audioId: string): Promise<void> {
  try {
    const path = getFullPath(audioId)
    assertNotVaultPath(path)
    const fileInfo = await FileSystem.getInfoAsync(path)
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(path)
      if (__DEV__) {
        console.log(`[audioDownload] Cleared partial/incomplete full file: ${audioId}`)
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[audioDownload] Error clearing full cache for ${audioId}:`,
        error,
      )
    }
  }
}

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
    assertNotVaultPath(fileUri)
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
 * Wi-Fi drops keep the partial file and resumeData so the next attempt continues.
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
    assertNotVaultPath(fileUri)
    const snapshotUri = `${fileUri}.resume.json`
    let resumeData: string | undefined
    try {
      const snapInfo = await FileSystem.getInfoAsync(snapshotUri)
      if (snapInfo.exists) {
        const parsed = JSON.parse(
          await FileSystem.readAsStringAsync(snapshotUri),
        ) as { resumeData?: string }
        if (parsed?.resumeData) resumeData = parsed.resumeData
      }
    } catch {
      // Start fresh if the snapshot is unreadable; do not delete fileUri.
    }

    let lastSnap = 0
    let resumable: ReturnType<typeof FileSystem.createDownloadResumable>
    resumable = FileSystem.createDownloadResumable(
      audioUrl,
      fileUri,
      {},
      () => {
        const now = Date.now()
        if (now - lastSnap < 2000) return
        lastSnap = now
        try {
          const savable = resumable.savable()
          void FileSystem.writeAsStringAsync(
            snapshotUri,
            JSON.stringify(savable),
          )
        } catch {
          // ignore
        }
      },
      resumeData,
    )
    let result: Awaited<ReturnType<typeof resumable.downloadAsync>>
    try {
      result = await resumable.downloadAsync()
    } catch (downloadError) {
      try {
        const savable = await resumable.pauseAsync()
        await FileSystem.writeAsStringAsync(
          snapshotUri,
          JSON.stringify(savable),
        )
      } catch {
        // keep whatever snapshot we already have
      }
      throw downloadError
    }

    if (!result?.uri) {
      try {
        const savable = await resumable.pauseAsync()
        await FileSystem.writeAsStringAsync(
          snapshotUri,
          JSON.stringify(savable),
        )
      } catch {
        // keep whatever snapshot we already have
      }
      throw new Error("Resumable download did not return a URI")
    }

    try {
      await FileSystem.deleteAsync(snapshotUri, { idempotent: true })
    } catch {
      // ignore
    }

    if (__DEV__) {
      console.log(`[audioDownload] Audio cached (resumable): ${audioId}`)
    }

    return result.uri
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : String(error)
    const isNetworkError =
      /connection abort|software caused|ECONNRESET|ECONNABORTED|network|ETIMEDOUT|ENOTFOUND|resolve host/i.test(
        errMsg,
      )
    if (__DEV__) {
      if (isNetworkError) {
        console.warn(
          `[audioDownload] Network error (resumable) ${audioId}, retry later:`,
          error,
        )
      } else {
        console.error(
          `[audioDownload] Error downloading audio (resumable) ${audioId}:`,
          error,
        )
      }
    }
    throw error
  }
}

/** Default timeout for resumable download (avoid indefinite hang on slow networks). */
export const RESUMABLE_DOWNLOAD_TIMEOUT_MS = 60 * 1000

/** Longer timeout for meditation-length audio (Head to Heart, Master Embodiment) so full file can download. */
export const MEDITATION_DOWNLOAD_TIMEOUT_MS = 180 * 1000

/**
 * Resumable download with timeout. Rejects with Error('Download timeout') after timeoutMs.
 * Partial bytes are kept so a later retry can continue. Never delete on timeout.
 * Prefer bare `downloadAndCacheAudioResumable` for hero meditations (no truncation risk from race).
 */
export async function downloadAndCacheAudioResumableWithTimeout(
  audioUrl: string,
  audioId: string,
  timeoutMs: number = RESUMABLE_DOWNLOAD_TIMEOUT_MS,
): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error("Download timeout")),
      timeoutMs,
    )
  })
  return await Promise.race([
    downloadAndCacheAudioResumable(audioUrl, audioId),
    timeoutPromise,
  ])
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

    // Native downloadAsync with Range — avoids ~2.5MB sync base64 encode on the JS thread
    // (that encode blocked Android UI when Wi‑Fi reconnected during preload/play).
    const downloadResult = await FileSystem.downloadAsync(audioUrl, fileUri, {
      headers: { Range: `bytes=0-${maxBytes - 1}` },
    })

    if (
      downloadResult.status !== 200 &&
      downloadResult.status !== 206
    ) {
      try {
        assertNotVaultPath(fileUri)
        await FileSystem.deleteAsync(fileUri, { idempotent: true })
      } catch {
        /* ignore */
      }
      throw new Error(`Head download failed: ${downloadResult.status}`)
    }

    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true })
    const size = (fileInfo as { size?: number })?.size ?? 0
    if (size < MIN_HEAD_BYTES) {
      try {
        assertNotVaultPath(fileUri)
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
      assertNotVaultPath(path)
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
    assertNotVaultPath(CACHE_DIR)
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
