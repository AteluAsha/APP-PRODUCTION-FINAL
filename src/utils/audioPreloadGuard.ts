/**
 * Audio preload guard
 *
 * Ensures we only run the full head preload once when the user reaches
 * the waiting room. Persisted so it stays "done forever" across sessions.
 */

const KEY_PRELOAD_STARTED = "audio_preload_started"

export async function getAudioPreloadStarted(): Promise<boolean> {
  try {
    const { default: AsyncStorage } =
      await import("@react-native-async-storage/async-storage")
    const value = await AsyncStorage.getItem(KEY_PRELOAD_STARTED)
    return value === "true"
  } catch {
    return false
  }
}

export async function setAudioPreloadStarted(): Promise<void> {
  try {
    const { default: AsyncStorage } =
      await import("@react-native-async-storage/async-storage")
    await AsyncStorage.setItem(KEY_PRELOAD_STARTED, "true")
  } catch {
    // Non-critical
  }
}
