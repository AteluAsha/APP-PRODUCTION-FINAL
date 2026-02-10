/**
 * Journey reminder notifications
 *
 * Schedules heart-minded local notifications to support users as they await
 * their 7-day somatic journey start. Messages are preloaded and matched to
 * their specific countdown (course start date).
 *
 * Notifications: 3 days out, 2 days out, 1 day before (eve of start).
 * All at 9:00 AM local time. Kept light - no more than 3 reminders.
 *
 * Safe fallback: If expo-notifications native module is unavailable (Expo Go,
 * stale build), all functions no-op. Requires development build with native
 * rebuild after adding expo-notifications.
 */

import { Platform } from "react-native"
import { formatDate } from "@/utils/date"

let Notifications: typeof import("expo-notifications") | null = null
try {
  Notifications = require("expo-notifications")
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
} catch (e) {
  if (__DEV__) {
    console.warn(
      "[JourneyNotifications] expo-notifications not available (rebuild native app):",
      (e as Error)?.message,
    )
  }
}

const CHANNEL_ID = "journey-reminders"
const NOTIFICATION_HOUR = 9
const NOTIFICATION_MINUTE = 0

/** Identifier prefix for journey notifications - allows canceling all at once */
const JOURNEY_PREFIX = "journey-reminder-"

/** Preloaded heart-minded messages, keyed by days until start */
const MESSAGES: Record<number, { title: string; body: string }> = {
  3: {
    title: "Your path is opening soon",
    body: "In 3 days, your 7-day somatic journey begins. Your heart is preparing. We'll be here when you're ready.",
  },
  2: {
    title: "Two days until your journey",
    body: "The eve of your path draws near. Rest well—your Root chakra day awaits.",
  },
  1: {
    title: "Tomorrow, your journey begins",
    body: "Monday awaits. Open the app when you're ready—your first day of somatic alignment is here.",
  },
}

/**
 * Returns true if notification permission is already granted (no system dialog needed).
 */
export async function hasNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false
  const { status } = await Notifications.getPermissionsAsync()
  return status === "granted"
}

/**
 * Request notification permissions (shows system dialog). Call after user accepts our in-app pre-prompt.
 * Returns true if granted, false otherwise. Gracefully handles denial.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  if (existingStatus === "granted") return true
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  })
  return status === "granted"
}

/**
 * Ensure Android notification channel exists (required for Android 8+)
 */
async function ensureAndroidChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== "android") return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Journey Reminders",
    description: "Gentle reminders for your 7-day somatic journey start",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#9D4EDD",
  })
}

/**
 * Cancel all journey reminder notifications
 */
export async function cancelJourneyReminders(): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const toCancel = scheduled.filter((n) =>
    n.identifier.startsWith(JOURNEY_PREFIX),
  )
  await Promise.all(
    toCancel.map((n) =>
      Notifications.cancelScheduledNotificationAsync(n.identifier),
    ),
  )
}

/**
 * Schedule heart-minded reminder notifications for the given course start date.
 * Schedules: 3 days out, 2 days out, 1 day before. All at 9:00 AM local.
 *
 * Call after user confirms date selection. Cancels any existing journey
 * reminders before scheduling new ones. No-ops if expo-notifications unavailable.
 */
export async function scheduleJourneyReminders(
  courseStartDateISO: string,
): Promise<void> {
  if (!Notifications) return
  await ensureAndroidChannel()
  await cancelJourneyReminders()

  const hasPermission = await requestNotificationPermissions()
  if (!hasPermission) {
    if (__DEV__)
      console.log(
        "[JourneyNotifications] Permission not granted, skipping reminders",
      )
    return
  }

  const startDate = new Date(courseStartDateISO + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDayStart = new Date(startDate)
  startDayStart.setHours(0, 0, 0, 0)

  const dayName = formatDate(startDate).split(",")[0]

  const triggerExtras =
    Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}

  for (let daysBefore = 3; daysBefore >= 1; daysBefore--) {
    const notifyDate = new Date(startDayStart)
    notifyDate.setDate(notifyDate.getDate() - daysBefore)
    notifyDate.setHours(NOTIFICATION_HOUR, NOTIFICATION_MINUTE, 0, 0)

    if (notifyDate <= today) continue

    const message = MESSAGES[daysBefore]
    if (!message) continue

    const body =
      daysBefore === 1
        ? `${dayName} awaits. Open the app when you're ready—your first day of somatic alignment is here.`
        : message.body

    await Notifications.scheduleNotificationAsync({
      identifier: `${JOURNEY_PREFIX}${daysBefore}`,
      content: {
        title: message.title,
        body,
        data: { courseStartDate: courseStartDateISO, daysBefore },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifyDate,
        ...triggerExtras,
      },
    })
  }
}
