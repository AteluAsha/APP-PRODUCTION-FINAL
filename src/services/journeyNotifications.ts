/**
 * Soul Journey Nudges — local notifications (iOS + Android) via expo-notifications.
 *
 * Production schedule:
 *   • Sunday 20:00 — earth-cycle reminder (eligible users, even before journey start)
 *   • Wednesday 10:00 — energy-body check-in (only after journeyStarted)
 *   • Daily 09:00 Mon–Sun — optional alignment nudges (dailyAlignmentRemindersEnabled)
 *
 * Legacy ids are cancelled on every sync.
 */

import { Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import {
  LOVE_BALMS,
  SUNDAY_EARTH_CYCLE_COPY,
  WEDNESDAY_ENERGY_BODY_COPY,
  type LoveBalmDay,
} from '@/constants/journeyNotificationCopy'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'

/** Persisted user preference; missing / undefined treated as on (backward compatible). */
export function areSoulJourneyNudgesEnabled(): boolean {
  const v = useChakraJourneyStore.getState().soulJourneyNudgesEnabled
  return v !== false
}

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient

let Notifications: typeof import('expo-notifications') | null = null
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications')
    if (Notifications) {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: false,
            shouldShowBanner: false,
            shouldShowList: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        })
      } catch (handlerErr) {
        if (__DEV__) {
          console.warn(
            '[JourneyNotifications] setNotificationHandler failed:',
            (handlerErr as Error)?.message,
          )
        }
      }
    }
  } catch (e) {
    Notifications = null
    if (__DEV__) {
      console.warn(
        '[JourneyNotifications] expo-notifications not available:',
        (e as Error)?.message,
      )
    }
  }
}

/** Must match app.config.js defaultChannel + AndroidManifest FCM meta-data after prebuild. */
export const SOUL_JOURNEY_CHANNEL_ID = 'soul-journey-nudges'

const SUNDAY_HEART_REMINDER_ID = 'heart-reminder-sunday'
const WEDNESDAY_HEART_REMINDER_ID = 'heart-reminder-wednesday'
const DAILY_ALIGN_PREFIX = 'daily-align-'

const DAILY_ALIGN_SCHEDULE: {
  idSuffix: string
  loveBalmDay: LoveBalmDay
  expoWeekday: number
}[] = [
  { idSuffix: 'mon', loveBalmDay: 1, expoWeekday: 2 },
  { idSuffix: 'tue', loveBalmDay: 2, expoWeekday: 3 },
  { idSuffix: 'wed', loveBalmDay: 3, expoWeekday: 4 },
  { idSuffix: 'thu', loveBalmDay: 4, expoWeekday: 5 },
  { idSuffix: 'fri', loveBalmDay: 5, expoWeekday: 6 },
  { idSuffix: 'sat', loveBalmDay: 6, expoWeekday: 7 },
  { idSuffix: 'sun', loveBalmDay: 7, expoWeekday: 1 },
]

/** Legacy ids — cancelled on sync so older builds stop firing extra nudges. */
const LEGACY_PREFIXES = [
  'pre-journey-',
  'journey-reminder-',
  'flow-river-',
  'horizon-',
  'sustenance-pulse-',
  'sustenance-cycle-',
] as const
const LEGACY_IDS = [
  'silent-integration',
  'sustenance-sunday-reset',
  'sustenance-deep-inquiry',
  'sporadic-wisdom',
  'trial-sunday-earth-cycle',
] as const

/** @deprecated Waiting rooms retired — kept for call-site compatibility. */
export function isLifetimePreCourseWaitingRoomSync(): boolean {
  return false
}

function shouldReceiveHeartReminders(): boolean {
  const s = useChakraJourneyStore.getState()
  return s.hasLifetimeAccess || !!s.courseStartDate
}

async function cancelByPrefix(prefix: string): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const toCancel = scheduled.filter((n) =>
    typeof n.identifier === 'string' ? n.identifier.startsWith(prefix) : false,
  )
  await Promise.all(
    toCancel.map((n) =>
      Notifications!.cancelScheduledNotificationAsync(n.identifier),
    ),
  )
}

async function cancelNotificationId(id: string): Promise<void> {
  if (!Notifications) return
  try {
    await Notifications.cancelScheduledNotificationAsync(id)
  } catch {
    /* noop */
  }
}

async function cancelAllLegacySoulJourneyNotifications(): Promise<void> {
  if (!Notifications) return
  for (const prefix of LEGACY_PREFIXES) {
    await cancelByPrefix(prefix)
  }
  for (const id of LEGACY_IDS) {
    await cancelNotificationId(id)
  }
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  if (existingStatus === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  })
  return status === 'granted'
}

async function ensureAndroidChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(SOUL_JOURNEY_CHANNEL_ID, {
    name: 'Soul Journey Nudges',
    description: 'Gentle, sparse reminders along your Awakening Soul path',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0, 220, 160, 220],
    lightColor: '#9D4EDD',
  })
}

function androidExtras() {
  return Platform.OS === 'android'
    ? { channelId: SOUL_JOURNEY_CHANNEL_ID }
    : {}
}

async function scheduleWeeklySundayReminder(): Promise<void> {
  if (!Notifications) return
  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}
  await Notifications.scheduleNotificationAsync({
    identifier: SUNDAY_HEART_REMINDER_ID,
    content: {
      title: SUNDAY_EARTH_CYCLE_COPY.title,
      body: SUNDAY_EARTH_CYCLE_COPY.body,
      data: { kind: 'sunday-earth-cycle' },
      ...x,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 20,
      minute: 0,
      ...triggerExtras,
    },
  })
}

async function scheduleWeeklyWednesdayReminder(): Promise<void> {
  if (!Notifications) return
  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}
  await Notifications.scheduleNotificationAsync({
    identifier: WEDNESDAY_HEART_REMINDER_ID,
    content: {
      title: WEDNESDAY_ENERGY_BODY_COPY.title,
      body: WEDNESDAY_ENERGY_BODY_COPY.body,
      data: { kind: 'wednesday-energy-body' },
      ...x,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 4,
      hour: 10,
      minute: 0,
      ...triggerExtras,
    },
  })
}

async function scheduleDailyAlignmentReminders(): Promise<void> {
  if (!Notifications) return
  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}

  for (const row of DAILY_ALIGN_SCHEDULE) {
    const entry = LOVE_BALMS[row.loveBalmDay]
    const title = entry.affirmations[0] ?? 'Align with today'
    const body = entry.loveBalms[0] ?? 'A gentle nudge from the heart mind.'

    await Notifications.scheduleNotificationAsync({
      identifier: `${DAILY_ALIGN_PREFIX}${row.idSuffix}`,
      content: {
        title,
        body,
        data: { kind: 'daily-alignment', day: row.idSuffix },
        ...x,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: row.expoWeekday,
        hour: 9,
        minute: 0,
        ...triggerExtras,
      },
    })
  }
}

function isDailyAlignmentEnabled(): boolean {
  return useChakraJourneyStore.getState().dailyAlignmentRemindersEnabled === true
}

/**
 * Opt in to daily alignment + weekly heart reminders. Requests permission if needed.
 */
export async function activateDailyAlignmentReminders(): Promise<boolean> {
  const store = useChakraJourneyStore.getState()
  if (!areSoulJourneyNudgesEnabled()) {
    store.setSoulJourneyNudgesEnabled(true)
  }
  store.setDailyAlignmentRemindersEnabled(true)

  const granted = await requestNotificationPermissions()
  if (!granted) {
    store.setDailyAlignmentRemindersEnabled(false)
    return false
  }

  await syncWeeklyHeartReminders()
  return true
}

/**
 * Single sync for weekly heart reminders + optional daily alignment.
 */
export async function syncWeeklyHeartReminders(): Promise<void> {
  if (!Notifications) return

  await cancelAllLegacySoulJourneyNotifications()
  await cancelNotificationId(SUNDAY_HEART_REMINDER_ID)
  await cancelNotificationId(WEDNESDAY_HEART_REMINDER_ID)
  await cancelByPrefix(DAILY_ALIGN_PREFIX)

  if (!areSoulJourneyNudgesEnabled()) return
  if (!(await hasNotificationPermission())) return
  if (!shouldReceiveHeartReminders()) return

  await ensureAndroidChannel()
  await scheduleWeeklySundayReminder()

  const { journeyStarted } = useChakraJourneyStore.getState()
  if (journeyStarted) {
    await scheduleWeeklyWednesdayReminder()
  }

  if (isDailyAlignmentEnabled()) {
    await scheduleDailyAlignmentReminders()
  }
}

export async function cancelPreCourseNudges(): Promise<void> {
  await cancelByPrefix('pre-journey-')
  await cancelByPrefix('journey-reminder-')
}

export async function cancelJourneyReminders(): Promise<void> {
  await cancelPreCourseNudges()
}

/** Cancel every Soul Journey local notification (legacy + current heart reminders). */
export async function cancelAllSoulJourneyScheduled(): Promise<void> {
  if (!Notifications) return
  await cancelAllLegacySoulJourneyNotifications()
  await cancelNotificationId(SUNDAY_HEART_REMINDER_ID)
  await cancelNotificationId(WEDNESDAY_HEART_REMINDER_ID)
  await cancelByPrefix(DAILY_ALIGN_PREFIX)
}

/** @deprecated Legacy export — use syncWeeklyHeartReminders. */
export async function schedulePreCourseNudges(
  _signupDateISO: string,
  _courseStartDateISO: string,
): Promise<void> {
  await syncWeeklyHeartReminders()
}

/** @deprecated Legacy export — use syncWeeklyHeartReminders. */
export async function scheduleHorizonNudges(
  _courseStartDateISO: string,
): Promise<void> {
  await syncWeeklyHeartReminders()
}

/** @deprecated Legacy export — use syncWeeklyHeartReminders. */
export async function scheduleDailyChakraPulse(): Promise<void> {
  await syncWeeklyHeartReminders()
}

/** @deprecated Legacy export — use syncWeeklyHeartReminders. */
export async function syncSporadicWisdomNotifications(): Promise<void> {
  await syncWeeklyHeartReminders()
}

/** @deprecated Legacy export — use syncWeeklyHeartReminders. */
export async function syncLifetimeSustenanceNotifications(): Promise<void> {
  await syncWeeklyHeartReminders()
}

/** @deprecated Legacy export — use syncWeeklyHeartReminders. */
export async function syncEngagementNotifications(): Promise<void> {
  await syncWeeklyHeartReminders()
}

export async function onJourneyWeekStarted(): Promise<void> {
  await cancelPreCourseNudges()
  await syncWeeklyHeartReminders()
}

export async function scheduleSoulJourneyAfterPermission(
  _signupDateISO: string,
  _courseStartDateISO: string,
): Promise<void> {
  await syncWeeklyHeartReminders()
}

/** @deprecated Prefer scheduleSoulJourneyAfterPermission when signup date is known. */
export async function scheduleJourneyReminders(
  courseStartDateISO: string,
): Promise<void> {
  if (!areSoulJourneyNudgesEnabled()) return
  const signup =
    useChakraJourneyStore.getState().initialOpenDate ?? courseStartDateISO
  const hasPermission = await requestNotificationPermissions()
  if (!hasPermission) {
    if (__DEV__) {
      console.log(
        '[JourneyNotifications] Permission not granted, skipping reminders',
      )
    }
    return
  }
  await scheduleSoulJourneyAfterPermission(signup, courseStartDateISO)
}

export async function scheduleWaitingRoomNudgesIfPermitted(): Promise<void> {
  if (!areSoulJourneyNudgesEnabled()) return
  const { initialOpenDate, courseStartDate } = useChakraJourneyStore.getState()
  if (!courseStartDate) return
  if (!(await hasNotificationPermission())) return
  const signup = initialOpenDate ?? courseStartDate
  await scheduleSoulJourneyAfterPermission(signup, courseStartDate)
}
