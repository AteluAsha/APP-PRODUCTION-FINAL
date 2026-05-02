/**
 * Resume course full-file preload when the app returns to foreground (Android/iOS).
 * Non-blocking: never gates navigation or waiting room UI.
 */

import { AppState, type AppStateStatus } from "react-native"
import { storage } from "@/src/services/firebase"

export function subscribeResumeCourseFullPreload(): () => void {
  const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
    if (next !== "active" || !storage) return
    import("@/src/utils/audioPreloadManifest")
      .then(({ preloadAllAudioFullFiles }) => {
        preloadAllAudioFullFiles(storage).catch(() => {})
      })
      .catch(() => {})
  })
  return () => sub.remove()
}
