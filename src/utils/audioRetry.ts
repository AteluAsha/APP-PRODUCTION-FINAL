/**
 * Audio Retry Utility
 *
 * Provides retry logic with exponential backoff for audio-related operations
 * Handles transient network errors and Firebase Storage failures gracefully
 */

export interface RetryConfig {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Function to retry (must return a Promise)
 * @param config - Retry configuration
 * @returns Promise that resolves with the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {},
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on last attempt
      if (attempt === finalConfig.maxRetries) {
        throw lastError
      }

      // Don't retry if error is not retryable (4xx client errors)
      if (!isRetryableError(lastError)) {
        throw lastError
      }

      // Calculate exponential backoff delay
      // Delay increases exponentially: initialDelay * 2^attempt
      // But capped at maxDelayMs
      const exponentialDelay = finalConfig.initialDelayMs * Math.pow(2, attempt)
      const delay = Math.min(exponentialDelay, finalConfig.maxDelayMs)

      if (__DEV__) {
        console.log(
          `[audioRetry] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          lastError.message,
        )
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error("Retry failed")
}

/**
 * Check if an error is retryable
 *
 * Network errors, timeouts, and 5xx server errors are retryable
 * 4xx client errors (400, 401, 403, 404) are not retryable
 *
 * @param error - Error to check
 * @returns true if error should be retried, false otherwise
 */
export function isRetryableError(error: Error | unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const errorMessage = error.message.toLowerCase()
  const errorString = String(error).toLowerCase()

  // Don't retry client errors (4xx)
  if (
    errorMessage.includes("400") ||
    errorMessage.includes("401") ||
    errorMessage.includes("403") ||
    errorMessage.includes("404") ||
    errorMessage.includes("permission-denied") ||
    errorMessage.includes("not-found") ||
    errorMessage.includes("object-not-found") ||
    errorString.includes("400") ||
    errorString.includes("401") ||
    errorString.includes("403") ||
    errorString.includes("404")
  ) {
    return false
  }

  // Retry network errors, timeouts, and server errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("econnreset") ||
    errorMessage.includes("enotfound") ||
    errorMessage.includes("eai_again") ||
    errorMessage.includes("500") ||
    errorMessage.includes("502") ||
    errorMessage.includes("503") ||
    errorMessage.includes("504") ||
    errorMessage.includes("unavailable") ||
    errorString.includes("network") ||
    errorString.includes("timeout")
  ) {
    return true
  }

  // Default to retryable for unknown errors (better to retry than fail)
  return true
}
