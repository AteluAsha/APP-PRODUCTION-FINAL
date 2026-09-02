/**
 * Android 14+ will kill background meditation unless a mediaPlayback
 * foreground service is declared. Play Asset Delivery is not used.
 *
 * EAS ignores android/ and regenerates it. Permissions AND the service
 * must be injected here so the Play AAB still has lock-screen playback.
 * The Kotlin class comes from modules/meditation-playback (autolinked).
 */
const {
    withAndroidManifest,
    AndroidConfig,
} = require('@expo/config-plugins')

const MEDIA_PLAYBACK_PERMISSIONS = [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    'android.permission.WAKE_LOCK',
    'android.permission.POST_NOTIFICATIONS',
]

const SERVICE_NAME =
    'expo.modules.meditationplayback.MeditationPlaybackService'

function withAndroidMediaPlayback(config) {
    config = AndroidConfig.Permissions.withPermissions(
        config,
        MEDIA_PLAYBACK_PERMISSIONS,
    )
    config = withAndroidManifest(config, (cfg) => {
        const app = AndroidConfig.Manifest.getMainApplicationOrThrow(
            cfg.modResults,
        )
        app.service = app.service || []
        const already = app.service.some(
            (entry) => entry.$?.['android:name'] === SERVICE_NAME,
        )
        if (!already) {
            app.service.push({
                $: {
                    'android:name': SERVICE_NAME,
                    'android:exported': 'false',
                    'android:foregroundServiceType': 'mediaPlayback',
                },
            })
        }
        return cfg
    })
    return config
}

module.exports = withAndroidMediaPlayback
