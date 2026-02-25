/**
 * Rate Limiter Utility
 *
 * Implements rate limiting for API calls to prevent quota exhaustion
 * and ensure fair usage under high traffic scenarios.
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  /**
   * Check if a request is allowed based on rate limit
   *
   * @param key - Unique identifier for the rate limit (e.g., 'gemini', 'elevenlabs')
   * @param config - Rate limit configuration
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Remove requests outside the time window
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < config.windowMs,
    )

    // Check if we've exceeded the limit
    if (validRequests.length >= config.maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)

    return true
  }

  /**
   * Get time until next request is allowed
   *
   * @param key - Unique identifier for the rate limit
   * @param config - Rate limit configuration
   * @returns Milliseconds until next request is allowed, or 0 if allowed now
   */
  getTimeUntilNextRequest(key: string, config: RateLimitConfig): number {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < config.windowMs,
    )

    if (validRequests.length < config.maxRequests) {
      return 0
    }

    // Find the oldest request in the window
    const oldestRequest = Math.min(...validRequests)
    return config.windowMs - (now - oldestRequest)
  }

  /**
   * Clear rate limit data for a key
   *
   * @param key - Unique identifier for the rate limit
   */
  clear(key: string): void {
    this.requests.delete(key)
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.requests.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Rate limit configurations for different services
export const RATE_LIMITS = {
  gemini: {
    maxRequests: 60, // 60 requests
    windowMs: 60 * 1000, // per minute
  },
  elevenlabs: {
    maxRequests: 30, // 30 requests
    windowMs: 60 * 1000, // per minute
  },
  firebase: {
    maxRequests: 150, // 150 requests per minute (Firestore reads are cheap)
    windowMs: 60 * 1000, // per minute
  },
} as const

/**
 * Check if a request is allowed for a service
 *
 * @param service - Service name ('gemini', 'elevenlabs', 'firebase')
 * @returns true if allowed, false if rate limited
 */
export const checkRateLimit = (service: keyof typeof RATE_LIMITS): boolean => {
  const config = RATE_LIMITS[service]
  return rateLimiter.isAllowed(service, config)
}

/**
 * Get time until next request is allowed
 *
 * @param service - Service name
 * @returns Milliseconds until next request, or 0 if allowed now
 */
export const getTimeUntilNextRequest = (
  service: keyof typeof RATE_LIMITS,
): number => {
  const config = RATE_LIMITS[service]
  return rateLimiter.getTimeUntilNextRequest(service, config)
}

/**
 * Wait until rate limit allows a request
 *
 * @param service - Service name
 * @returns Promise that resolves when request is allowed
 */
export const waitForRateLimit = async (
  service: keyof typeof RATE_LIMITS,
): Promise<void> => {
  const waitTime = getTimeUntilNextRequest(service)
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
}

/**
 * Clear rate limit for a service
 *
 * @param service - Service name
 */
export const clearRateLimit = (service: keyof typeof RATE_LIMITS): void => {
  rateLimiter.clear(service)
}

export default rateLimiter
