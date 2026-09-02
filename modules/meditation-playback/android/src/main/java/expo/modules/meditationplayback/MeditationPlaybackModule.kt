package expo.modules.meditationplayback

import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MeditationPlaybackModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MeditationPlayback")

    Function("start") { title: String, artist: String ->
      val context = appContext.reactContext?.applicationContext ?: return@Function
      if (Build.VERSION.SDK_INT >= 33) {
        val manager = context.getSystemService(NotificationManager::class.java)
        if (manager != null && !manager.areNotificationsEnabled()) {
          return@Function
        }
      }
      val intent = Intent(context, MeditationPlaybackService::class.java).apply {
        putExtra(MeditationPlaybackService.EXTRA_TITLE, title)
        putExtra(MeditationPlaybackService.EXTRA_ARTIST, artist)
      }
      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
      } catch (_: Exception) {
        // Android 14+ can reject FGS start if notifications were just denied.
      }
    }

    Function("stop") {
      val context = appContext.reactContext?.applicationContext ?: return@Function
      val intent = Intent(context, MeditationPlaybackService::class.java).apply {
        action = MeditationPlaybackService.ACTION_STOP
      }
      try {
        context.startService(intent)
        context.stopService(Intent(context, MeditationPlaybackService::class.java))
      } catch (_: Exception) {
        // ignore
      }
    }
  }
}
