package expo.modules.meditationplayback

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat as MediaNotificationCompat

/**
 * Media playback foreground service.
 *
 * expo-av / expo-audio 0.4 on SDK 53 do not start a mediaPlayback FGS.
 * Android 14+ stops background audio after ~1–3 minutes unless this
 * service is running with type mediaPlayback and a MediaStyle notification.
 *
 * Never call startForeground when notifications are disabled — that
 * throws on Android 14+ (targetSdk 34+).
 */
class MeditationPlaybackService : Service() {
  private var mediaSession: MediaSessionCompat? = null

  override fun onCreate() {
    super.onCreate()
    ensureChannel()
    mediaSession = MediaSessionCompat(this, SESSION_TAG).apply {
      isActive = true
      setPlaybackState(
        PlaybackStateCompat.Builder()
          .setActions(
            PlaybackStateCompat.ACTION_PLAY or
              PlaybackStateCompat.ACTION_PAUSE or
              PlaybackStateCompat.ACTION_PLAY_PAUSE,
          )
          .setState(PlaybackStateCompat.STATE_PLAYING, 0L, 1f)
          .build(),
      )
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
      return START_NOT_STICKY
    }

    if (!canPostNotifications()) {
      stopSelf()
      return START_NOT_STICKY
    }

    val title = intent?.getStringExtra(EXTRA_TITLE) ?: "Awakening Soul"
    val artist = intent?.getStringExtra(EXTRA_ARTIST) ?: "Meditation"
    val notification = buildNotification(title, artist)
    try {
      if (Build.VERSION.SDK_INT >= 34) {
        startForeground(
          NOTIFICATION_ID,
          notification,
          ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
        )
      } else {
        startForeground(NOTIFICATION_ID, notification)
      }
    } catch (_: Exception) {
      stopSelf()
      return START_NOT_STICKY
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    mediaSession?.isActive = false
    mediaSession?.release()
    mediaSession = null
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun canPostNotifications(): Boolean {
    val manager = getSystemService(NotificationManager::class.java) ?: return false
    return manager.areNotificationsEnabled()
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java) ?: return
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Meditation playback",
      NotificationManager.IMPORTANCE_LOW,
    )
    channel.setShowBadge(false)
    channel.description = "Keeps sanctuary audio playing when the screen is locked"
    manager.createNotificationChannel(channel)
  }

  private fun buildNotification(title: String, artist: String): Notification {
    val style = MediaNotificationCompat.MediaStyle()
      .setMediaSession(mediaSession?.sessionToken)
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle(title)
      .setContentText(artist)
      .setSmallIcon(android.R.drawable.ic_media_play)
      .setOngoing(true)
      .setSilent(true)
      .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setStyle(style)
      .build()
  }

  companion object {
    const val ACTION_STOP = "expo.modules.meditationplayback.STOP"
    const val EXTRA_TITLE = "title"
    const val EXTRA_ARTIST = "artist"
    private const val CHANNEL_ID = "awakening_soul_meditation_playback"
    private const val NOTIFICATION_ID = 7714
    private const val SESSION_TAG = "AwakeningSoulMeditation"
  }
}
