/**
 * Audio Cache Utility
 *
 * Provides caching for audio URLs and metadata using AsyncStorage
 * This reduces Firebase Storage API calls and improves performance
 */

/**
 * Get a cached audio URL by key
 * @param key - Cache key (e.g., "tuning_fork_ROOT_Day1.aac")
 * @returns Cached URL string or null if not found
 */
export async function getCachedAudioUrl(key: string): Promise<string | null> {
  try {
    const { default: AsyncStorage } = await import(
      "@react-native-async-storage/async-storage"
    )
    const cached = await AsyncStorage.getItem(`audio_cache_${key}`)
    return cached
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[audioCache] Error getting cached URL for key ${key}:`,
        error,
      )
    }
    return null
  }
}

/**
 * Set a cached audio URL
 * @param key - Cache key (e.g., "tuning_fork_ROOT_Day1.aac")
 * @param url - Audio URL to cache
 */
export async function setCachedAudioUrl(
  key: string,
  url: string,
): Promise<void> {
  try {
    const { default: AsyncStorage } = await import(
      "@react-native-async-storage/async-storage"
    )
    await AsyncStorage.setItem(`audio_cache_${key}`, url)

    if (__DEV__) {
      console.log(`[audioCache] Cached URL for key: ${key}`)
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[audioCache] Error caching URL for key ${key}:`, error)
    }
    // Don't throw - caching failures shouldn't break the app
  }
}

/**
 * Clear a specific cached audio URL
 * @param key - Cache key to clear
 */
export async function clearCachedAudioUrl(key: string): Promise<void> {
  try {
    const { default: AsyncStorage } = await import(
      "@react-native-async-storage/async-storage"
    )
    await AsyncStorage.removeItem(`audio_cache_${key}`)

    if (__DEV__) {
      console.log(`[audioCache] Cleared cache for key: ${key}`)
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[audioCache] Error clearing cache for key ${key}:`, error)
    }
  }
}

/**
 * Clear all cached audio URLs
 * Useful for debugging or when cache becomes stale
 */
export async function clearAllCachedAudioUrls(): Promise<void> {
  try {
    const { default: AsyncStorage } = await import(
      "@react-native-async-storage/async-storage"
    )
    const keys = await AsyncStorage.getAllKeys()
    const audioCacheKeys = keys.filter((key) => key.startsWith("audio_cache_"))

    if (audioCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(audioCacheKeys)

      if (__DEV__) {
        console.log(
          `[audioCache] Cleared ${audioCacheKeys.length} cached audio URLs`,
        )
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("[audioCache] Error clearing all cached audio URLs:", error)
    }
  }
}
