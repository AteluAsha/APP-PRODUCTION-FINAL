/**
 * Emulator / Simulator detection for dev-only workarounds.
 *
 * SAFETY: Only used when __DEV__ is true. Production builds (release) have
 * __DEV__ === false, so isEmulatorOrSimulator() is always false in prod.
 * No emulator-specific code runs in final app builds.
 */

import Constants from "expo-constants"

/**
 * True when running in development on an emulator or simulator (not a physical device).
 * Use for optional workarounds that improve emulator UX (e.g. audio) without affecting
 * production or real-device behavior.
 */
export function isEmulatorOrSimulator(): boolean {
  if (!__DEV__) return false
  try {
    return Constants.isDevice === false
  } catch {
    return false
  }
}
