/**
 * User ID Service
 *
 * Manages user identification for RevenueCat and other services
 */

/**
 * Get or create a unique user ID
 * Uses AsyncStorage to persist user ID across app sessions
 */
export async function getUserId(): Promise<string> {
  try {
    const { default: AsyncStorage } = await import(
      "@react-native-async-storage/async-storage"
    )

    // Try to get existing user ID
    let userId = await AsyncStorage.getItem("userId")

    if (!userId) {
      // Generate new user ID (simple UUID-like string)
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      await AsyncStorage.setItem("userId", userId)
    }

    return userId
  } catch (error) {
    // Fallback to timestamp-based ID if AsyncStorage fails
    if (__DEV__) {
      console.warn("[userId] Error getting user ID, using fallback:", error)
    }
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }
}
