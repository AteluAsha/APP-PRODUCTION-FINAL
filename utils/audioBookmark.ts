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
