import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 * Full-player bookmark key (must match AudioPlayer.closePlayerAndNavigate and entry points).
 */
export function getAudioBookmarkStorageKey(trackId: string): string {
  return `audio_position_${trackId}`
}

/**
 * Load saved playback position for a full-player track id. Returns undefined if none or invalid.
 */
export async function loadBookmarkPositionMs(
  trackId: string | undefined,
): Promise<number | undefined> {
  if (!trackId || trackId.length === 0) return undefined
  try {
    const saved = await AsyncStorage.getItem(getAudioBookmarkStorageKey(trackId))
    const ms =
      saved != null && Number.isFinite(Number(saved)) ? Number(saved) : 0
    return ms > 0 ? ms : undefined
  } catch {
    return undefined
  }
}

/** Persist last place so leaving the player (or pausing) resumes here. */
export async function saveAudioBookmark(
  trackId: string | null | undefined,
  positionMs: number,
  opts?: { force?: boolean },
): Promise<void> {
  if (!trackId || trackId.length === 0) return
  if (!Number.isFinite(positionMs) || positionMs <= 0) {
    if (opts?.force) await clearAudioBookmark(trackId)
    return
  }
  try {
    if (!opts?.force) {
      const existing = await loadBookmarkPositionMs(trackId)
      if (
        existing != null &&
        existing > positionMs + 2000 &&
        positionMs < existing * 0.5
      ) {
        return
      }
    }
    await AsyncStorage.setItem(
      getAudioBookmarkStorageKey(trackId),
      String(Math.floor(positionMs)),
    )
  } catch {
    // Persistence failure must not block pause/close
  }
}

/** Clear a bookmark after a finished listen or an explicit restart. */
export async function clearAudioBookmark(
  trackId: string | null | undefined,
): Promise<void> {
  if (!trackId || trackId.length === 0) return
  try {
    await AsyncStorage.removeItem(getAudioBookmarkStorageKey(trackId))
  } catch {
    // ignore
  }
}
