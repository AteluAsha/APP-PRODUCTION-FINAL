/**
 * Sentry Error Tracking Service
 *
 * Provides production error tracking and crash reporting.
 * Only initializes in production builds - disabled in development.
 *
 * Setup:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new project for your app
 * 3. Add SENTRY_DSN to your .env file
 * 4. Install: npx expo install @sentry/react-native
 *
 * Features:
 * - Automatic crash reporting
 * - Error boundary integration
 * - Performance monitoring (optional)
 * - User context tracking
 */

import Constants from "expo-constants"

// Lazy import Sentry to avoid bundling in dev if not installed
let Sentry: any = null
let isInitialized = false

/**
 * Initialize Sentry error tracking
 * Only initializes if:
 * - Not in development mode (or explicitly enabled)
 * - SENTRY_DSN is configured
 * - @sentry/react-native is installed
 */
export const initializeSentry = async () => {
  // Don't initialize in development unless explicitly enabled
  if (__DEV__ && !Constants.expoConfig?.extra?.sentry?.enableInDev) {
    if (__DEV__) {
      console.log("[Sentry] Skipping initialization in development mode")
    }
    return
  }

  // Check if Sentry DSN is configured
  const sentryConfig = Constants.expoConfig?.extra?.sentry
  if (!sentryConfig?.dsn) {
    if (__DEV__) {
      console.warn(
        "[Sentry] DSN not configured. Add SENTRY_DSN to .env and sentry config to app.config.js",
      )
    }
    return
  }

  try {
    // Dynamic import to avoid bundling if not installed
    Sentry = require("@sentry/react-native")

    Sentry.init({
      dsn: sentryConfig.dsn,
      enableInExpoDevelopment: sentryConfig.enableInDev || false,
      debug: __DEV__ && sentryConfig.debug,
      environment: __DEV__ ? "development" : "production",
      // Only track errors in production
      beforeSend(event: any, hint: any) {
        // Filter out development-only errors
        if (__DEV__ && !sentryConfig.enableInDev) {
          return null
        }
        return event
      },
      // Performance monitoring (optional, can be enabled later)
      enableAutoSessionTracking: true,
      // Sample rate for performance (1.0 = 100%, reduce for high traffic)
      tracesSampleRate: sentryConfig.tracesSampleRate || 0.1,
    })

    isInitialized = true

    if (__DEV__) {
      console.log("[Sentry] Error tracking initialized successfully")
    }
  } catch (error) {
    // Sentry not installed or initialization failed
    // Don't crash the app - just log in dev
    if (__DEV__) {
      console.warn(
        "[Sentry] Failed to initialize. Install with: npx expo install @sentry/react-native",
        error,
      )
    }
  }
}

/**
 * Capture an exception manually
 * Safe to call even if Sentry isn't initialized
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>,
) => {
  if (!isInitialized || !Sentry) {
    if (__DEV__) {
      // Use warn to avoid red error overlay for expected API/network issues
      console.warn(
        "[Sentry] Exception (not tracked):",
        error?.message || error,
        context,
      )
    }
    return
  }

  try {
    Sentry.captureException(error, {
      extra: context,
    })
  } catch (err) {
    // Don't let Sentry errors crash the app
    if (__DEV__) {
      console.error("[Sentry] Failed to capture exception:", err)
    }
  }
}

/**
 * Capture a message manually
 * Safe to call even if Sentry isn't initialized
 */
export const captureMessage = (
  message: string,
  level: "info" | "warning" | "error" = "info",
) => {
  if (!isInitialized || !Sentry) {
    if (__DEV__) {
      console.log(`[Sentry] Message (not tracked): [${level}] ${message}`)
    }
    return
  }

  try {
    Sentry.captureMessage(message, level)
  } catch (err) {
    if (__DEV__) {
      console.error("[Sentry] Failed to capture message:", err)
    }
  }
}

/**
 * Set user context for error tracking
 * Safe to call even if Sentry isn't initialized
 */
export const setUser = (user: {
  id?: string
  email?: string
  username?: string
}) => {
  if (!isInitialized || !Sentry) return

  try {
    Sentry.setUser(user)
  } catch (err) {
    if (__DEV__) {
      console.error("[Sentry] Failed to set user:", err)
    }
  }
}

/**
 * Add breadcrumb for debugging
 * Safe to call even if Sentry isn't initialized
 */
export const addBreadcrumb = (breadcrumb: {
  message: string
  category?: string
  level?: "info" | "warning" | "error"
  data?: Record<string, any>
}) => {
  if (!isInitialized || !Sentry) return

  try {
    Sentry.addBreadcrumb(breadcrumb)
  } catch (err) {
    if (__DEV__) {
      console.error("[Sentry] Failed to add breadcrumb:", err)
    }
  }
}

/**
 * Check if Sentry is initialized
 */
export const isSentryInitialized = () => isInitialized
