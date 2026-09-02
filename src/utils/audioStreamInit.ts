/**
 * Async audio stream initialization (Android-safe)
 *
 * On Android, Audio.Sound.createAsync with a remote Firebase HTTPS URL can block
 * the native UI thread during DNS, TLS, and MediaPlayer prepare. Local file://
 * playback is unaffected. This module:
 * 1. Yields to the UI thread before/after network work (InteractionManager + rAF)
 * 2. Pre-warms remote streams with a lightweight HEAD/Range probe off the interactive path
 * 3. Defers createAsync until after the player shell has painted
 * 4. Polls load/seek readiness via setTimeout (never tight await loops on the JS thread)
 */

import { InteractionManager, Platform } from "react-native"
import {
  AVPlaybackSource,
  AVPlaybackStatus,
  AVPlaybackStatusToSet,
} from "expo-av"
import {
  createExclusiveSound,
  type HealingLockScreen,
  type HealingSound,
} from "@/src/utils/singleActiveSound"

const REMOTE_URI_RE = /^https?:\/\//i

/** Yield so React Native can flush layout, animations, and touch handling. */
export function yieldToUiThread(extraDelayMs = 0): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        if (extraDelayMs > 0) {
          setTimeout(resolve, extraDelayMs)
        } else if (Platform.OS === "android") {
          setTimeout(resolve, 0)
        } else {
          resolve()
        }
      })
    })
  })
}

export function getSourceUri(source: AVPlaybackSource): string | null {
  if (typeof source === "number") return null
  if (typeof source === "object" && source !== null && "uri" in source) {
    const uri = (source as { uri?: unknown }).uri
    return typeof uri === "string" ? uri : null
  }
  return null
}

export function isRemoteStreamUri(uri: string): boolean {
  return REMOTE_URI_RE.test(uri.trim())
}

/**
 * Warm DNS/TLS for a remote audio URL without downloading the body on the JS thread.
 * Failures are non-fatal — createAsync may still succeed.
 */
export async function warmRemoteAudioStream(uri: string): Promise<void> {
  if (!isRemoteStreamUri(uri)) return

  await yieldToUiThread()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  try {
    const headRes = await fetch(uri, {
      method: "HEAD",
      signal: controller.signal,
    })
    if (headRes.ok || headRes.status === 206) return

    await fetch(uri, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      signal: controller.signal,
    })
  } catch {
    // Non-fatal — streaming init will retry via MediaPlayer
  } finally {
    clearTimeout(timeoutId)
    await yieldToUiThread()
  }
}

export interface CreateSoundAsyncOptions {
  initialStatus: AVPlaybackStatusToSet
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void
  /** Android pre-create delay after audio mode (ms). Default: emulator 100, device 50. */
  androidPreCreateDelayMs?: number
  keepPlayingInBackground?: boolean
  lockScreen?: HealingLockScreen
}

/**
 * Create the exclusive healing player without blocking the UI thread.
 * Local file:// sources skip network warm-up. Playback is expo-audio.
 */
export async function createSoundAsyncOffUiThread(
  source: AVPlaybackSource,
  options: CreateSoundAsyncOptions,
): Promise<HealingSound> {
  const {
    initialStatus,
    onPlaybackStatusUpdate,
    androidPreCreateDelayMs,
    keepPlayingInBackground,
    lockScreen,
  } = options

  await yieldToUiThread()

  const uri = getSourceUri(source)
  if (uri && isRemoteStreamUri(uri)) {
    await warmRemoteAudioStream(uri)
  }

  if (Platform.OS === "android") {
    const delayMs = androidPreCreateDelayMs ?? 50
    await yieldToUiThread(delayMs)
  }

  // Local PAD/ODR files: ExoPlayer sniffs ADTS and MPEG-4 even when the name is .aac.
  // MediaPlayer often keys off the extension and goes mute on Pixel for M4A-in-.aac.
  let status = initialStatus
  if (Platform.OS === "android" && uri && !isRemoteStreamUri(uri)) {
    status = { ...initialStatus }
    delete (status as AVPlaybackStatusToSet & { androidImplementation?: string })
      .androidImplementation
  }

  const sound = await createExclusiveSound(
    source,
    status,
    onPlaybackStatusUpdate,
    { keepPlayingInBackground, lockScreen },
  )
  if (!sound) {
    throw new Error("Playback was replaced by another track")
  }

  return sound
}

/**
 * Poll until sound reports isLoaded, yielding between attempts so the UI stays responsive.
 */
export function waitForSoundLoaded(
  sound: HealingSound,
  options?: { maxWaitMs?: number; pollMs?: number },
): Promise<boolean> {
  const maxWaitMs =
    options?.maxWaitMs ?? (Platform.OS === "android" ? 2500 : 800)
  const pollMs = options?.pollMs ?? (Platform.OS === "android" ? 80 : 25)

  return new Promise((resolve) => {
    let elapsed = 0

    const tick = async () => {
      try {
        const st = await sound.getStatusAsync()
        if (st.isLoaded) {
          resolve(true)
          return
        }
      } catch {
        resolve(false)
        return
      }

      if (elapsed >= maxWaitMs) {
        resolve(false)
        return
      }

      elapsed += pollMs
      setTimeout(tick, pollMs)
    }

    setTimeout(tick, 0)
  })
}

/**
 * Android: setPositionAsync often fails if native player is not status-ready.
 * Poll with setTimeout yields (not a tight await loop) until loaded.
 */
export function waitForSoundReadyForSeek(
  sound: HealingSound,
  options?: { maxWaitMs?: number; pollMs?: number },
): Promise<boolean> {
  const maxWaitMs =
    options?.maxWaitMs ?? (Platform.OS === "android" ? 2000 : 400)
  const pollMs = options?.pollMs ?? (Platform.OS === "android" ? 40 : 20)

  return new Promise((resolve) => {
    let elapsed = 0
    let attempt = 0

    const tick = async () => {
      attempt += 1
      try {
        const st = await sound.getStatusAsync()
        if (st.isLoaded) {
          if (Platform.OS === "android") {
            const dur = st.durationMillis
            const durationKnown = dur == null || dur > 0
            if (durationKnown || attempt >= 15) {
              if (__DEV__) {
                console.log(
                  `[audioStreamInit] Seek-ready: attempt ${attempt} durationMillis=${dur ?? "null"}`,
                )
              }
              resolve(true)
              return
            }
          } else {
            resolve(true)
            return
          }
        }
      } catch {
        resolve(false)
        return
      }

      if (elapsed >= maxWaitMs) {
        if (__DEV__) {
          sound.getStatusAsync().then((last) => {
            console.warn("[audioStreamInit] Seek-ready poll exhausted:", last)
          })
        }
        resolve(false)
        return
      }

      elapsed += pollMs
      setTimeout(tick, pollMs)
    }

    setTimeout(tick, 0)
  })
}
