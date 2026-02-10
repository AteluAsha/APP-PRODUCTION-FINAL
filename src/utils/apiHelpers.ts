/**
 * API Helper Utilities
 *
 * Provides timeout, retry, and error handling utilities for all API calls.
 * Essential for high-traffic scenarios and production reliability.
 */

import { captureException } from "@/src/services/sentry"

/**
 * Timeout configuration for different API types
 */
export const API_TIMEOUTS = {
  gemini: 30000, // 30 seconds for AI responses
  elevenlabs: 60000, // 60 seconds for audio synthesis
  firebase: 15000, // 15 seconds for Firestore/Storage
  fetch: 10000, // 10 seconds for general fetch calls
} as const

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number
  retryDelay: number // milliseconds
  retryableErrors?: string[] // Error messages that should trigger retry
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableErrors: ["Network error", "timeout", "ECONNRESET", "ETIMEDOUT"],
}

/**
 * Wrap a promise with a timeout
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message
 * @returns Promise that rejects on timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Request timeout",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${errorMessage} (${timeoutMs}ms)`))
      }, timeoutMs)
    }),
  ])
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Function to retry (must return a Promise)
 * @param config - Retry configuration
 * @returns Promise that resolves with the function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Type assertion: lastError is always Error after assignment above
      const errorMessage = lastError.message

      // Check if error is retryable
      const isRetryable =
        config.retryableErrors?.some((retryableError) =>
          errorMessage.toLowerCase().includes(retryableError.toLowerCase()),
        ) ?? true

      // Don't retry if:
      // - Last attempt
      // - Error is not retryable
      // - Error is a 4xx client error (not retryable)
      if (attempt === config.maxRetries || !isRetryable) {
        throw lastError
      }

      // Check for 4xx errors (client errors - don't retry)
      if (
        errorMessage.includes("400") ||
        errorMessage.includes("401") ||
        errorMessage.includes("403") ||
        errorMessage.includes("404")
      ) {
        throw lastError
      }

      // Exponential backoff: delay = retryDelay * 2^attempt
      const delay = config.retryDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error("Retry failed")
}

/**
 * Combine timeout and retry for robust API calls
 *
 * @param fn - Function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param retryConfig - Retry configuration
 * @param errorContext - Context for error tracking
 * @returns Promise with timeout and retry protection
 */
export async function robustApiCall<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryConfig?: RetryConfig,
  errorContext?: Record<string, any>,
): Promise<T> {
  try {
    return await withRetry(
      () => withTimeout(fn(), timeoutMs, "API request timeout"),
      retryConfig,
    )
  } catch (error) {
    // Log to Sentry with context
    const errorToLog = error instanceof Error ? error : new Error(String(error))
    captureException(errorToLog, {
      ...errorContext,
      timeout: timeoutMs,
      retries: retryConfig?.maxRetries ?? DEFAULT_RETRY_CONFIG.maxRetries,
    })
    throw errorToLog
  }
}

/**
 * Request deduplication cache
 * Prevents duplicate concurrent requests for the same resource
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map()

  /**
   * Execute a request, deduplicating concurrent calls
   *
   * @param key - Unique key for the request
   * @param fn - Function to execute
   * @param ttl - Time to live for the cache (milliseconds)
   * @returns Promise result
   */
  async deduplicate<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 5000, // 5 seconds default
  ): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending as Promise<T>
    }

    // Create new request
    const request = fn()
      .then((result) => {
        // Remove from cache after TTL
        setTimeout(() => {
          this.pendingRequests.delete(key)
        }, ttl)
        return result
      })
      .catch((error) => {
        // Remove immediately on error
        this.pendingRequests.delete(key)
        throw error
      })

    this.pendingRequests.set(key, request)
    return request
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear()
  }

  /**
   * Clear a specific request
   */
  clearKey(key: string): void {
    this.pendingRequests.delete(key)
  }
}

export const requestDeduplicator = new RequestDeduplicator()

/**
 * AbortController wrapper for request cancellation
 */
export class RequestCanceller {
  private controllers: Map<string, AbortController> = new Map()

  /**
   * Create a new cancellable request
   *
   * @param key - Unique key for the request
   * @returns AbortSignal for the request
   */
  createSignal(key: string): AbortSignal {
    // Cancel any existing request with this key
    this.cancel(key)

    const controller = new AbortController()
    this.controllers.set(key, controller)
    return controller.signal
  }

  /**
   * Cancel a request
   *
   * @param key - Key of the request to cancel
   */
  cancel(key: string): void {
    const controller = this.controllers.get(key)
    if (controller) {
      controller.abort()
      this.controllers.delete(key)
    }
  }

  /**
   * Cancel all requests
   */
  cancelAll(): void {
    this.controllers.forEach((controller) => controller.abort())
    this.controllers.clear()
  }
}

export const requestCanceller = new RequestCanceller()
