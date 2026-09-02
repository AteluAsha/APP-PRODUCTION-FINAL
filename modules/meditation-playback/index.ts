import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'
import * as Notifications from 'expo-notifications'

type MeditationPlaybackNative = {
    start: (title: string, artist: string) => void
    stop: () => void
}

const native = requireOptionalNativeModule<MeditationPlaybackNative>(
    'MeditationPlayback',
)

async function androidNotificationsAreGranted(): Promise<boolean> {
    try {
        const current = await Notifications.getPermissionsAsync()
        if (current.granted || current.status === 'granted') {
            return true
        }
        if (current.status === 'denied') {
            return false
        }
        const requested = await Notifications.requestPermissionsAsync()
        return requested.granted || requested.status === 'granted'
    } catch {
        return false
    }
}

/**
 * Starts the Android mediaPlayback foreground service so a locked
 * screen cannot kill a 45-minute embodiment or 1-hour crystal bowl.
 * Awaits POST_NOTIFICATIONS first. If denied, skips the service so
 * Android 14+ cannot crash on startForeground. Foreground playback
 * still starts; lock-screen survival needs the grant.
 * No-op on iOS (UIBackgroundModes audio is enough).
 */
export async function startMeditationPlaybackService(
    title: string,
    artist?: string,
): Promise<void> {
    if (Platform.OS !== 'android') return
    const allowed = await androidNotificationsAreGranted()
    if (!allowed) return
    try {
        native?.start(title, artist ?? 'Awakening Soul')
    } catch {
        // Native module is missing until a production/dev native install.
    }
}

export function stopMeditationPlaybackService(): void {
    if (Platform.OS !== 'android') return
    try {
        native?.stop()
    } catch {
        // ignore
    }
}
