/**
 * Soul Journey Nudges — local notifications (iOS + Android) via expo-notifications.
 *
 * Production schedule (local only — no server, safe at high traffic):
 *   • Daily alignment ON (default): rolling 7-day DATE nudges. Noon = today's
 *     chakra. 20:00 = tomorrow's chakra (night before). Opening the app drops
 *     remaining slots for that calendar day.
 *   • Sunday 20:00 weekly ALWAYS (course / Monday Root) when permission is on —
 *     even if they opened the app that day, even after a fresh install.
 *   • Daily alignment OFF: Wednesday 10:00 solar check-in after journeyStarted.
 *
 * Permission: never required to use the app. Prompted once after entering
 * Sanctuary. Opt out in Profile / system settings. No marketing. No badges.
 *
 * Legacy ids are cancelled on every sync.
 */

import { AppState, Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import {
  SUNDAY_EARTH_CYCLE_COPY,
  WEDNESDAY_ENERGY_BODY_COPY,
  copyForDailySlot,
} from '@/constants/journeyNotificationCopy'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import {
  COURSE_DAILY_PREFIX,
  WEEK1_ID_PREFIX,
  buildWeek1ReminderSlots,
} from '@/src/utils/week1JourneyReminders'

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
          handleNotification: async () => {
            const inApp = AppState.currentState === 'active'
            return {
              shouldShowAlert: !inApp,
              shouldShowBanner: !inApp,
              shouldShowList: true,
              shouldPlaySound: !inApp,
              shouldSetBadge: false,
            }
          },
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
/** Legacy repeating 9 AM ids from older builds. */
const DAILY_ALIGN_PREFIX = 'daily-align-'

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
    description:
      'Chakra check-ins when you have not opened the app. Turn off anytime in Profile.',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 220, 160, 220],
    lightColor: '#9D4EDD',
  })
}

function androidExtras() {
  return Platform.OS === 'android'
    ? { channelId: SOUL_JOURNEY_CHANNEL_ID }
    : {}
}

async function scheduleOrSkip(
  request: Parameters<
    NonNullable<typeof Notifications>['scheduleNotificationAsync']
  >[0],
): Promise<void> {
  if (!Notifications) return
  try {
    await Notifications.scheduleNotificationAsync(request)
  } catch (e) {
    if (__DEV__) {
      console.warn(
        '[JourneyNotifications] schedule failed:',
        (e as Error)?.message,
      )
    }
  }
}

async function scheduleWeeklySundayReminder(): Promise<void> {
  if (!Notifications) return
  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}
  await scheduleOrSkip({
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
  await scheduleOrSkip({
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
  const slots = buildWeek1ReminderSlots({ now: new Date() })
  for (const slot of slots) {
    const copy = copyForDailySlot(slot.kind, slot.fireAt)
    await scheduleOrSkip({
      identifier: slot.id,
      content: {
        title: copy.title,
        body: copy.body,
        data: {
          kind: 'course-daily',
          slot: slot.kind,
          day: slot.dateKey,
        },
        ...x,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: slot.fireAt,
        ...triggerExtras,
      },
    })
  }
}

function isDailyAlignmentEnabled(): boolean {
  return (
    useChakraJourneyStore.getState().dailyAlignmentRemindersEnabled !== false
  )
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
  await cancelByPrefix(WEEK1_ID_PREFIX)
  await cancelByPrefix(COURSE_DAILY_PREFIX)

  if (!areSoulJourneyNudgesEnabled()) return
  if (!(await hasNotificationPermission())) return

  await ensureAndroidChannel()

  if (isDailyAlignmentEnabled()) {
    await scheduleDailyAlignmentReminders()
  } else {
    const { journeyStarted } = useChakraJourneyStore.getState()
    if (journeyStarted) {
      await scheduleWeeklyWednesdayReminder()
    }
  }

  await scheduleWeeklySundayReminder()
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
  await cancelByPrefix(WEEK1_ID_PREFIX)
  await cancelByPrefix(COURSE_DAILY_PREFIX)
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

export async function scheduleWaitingRoomNudgesIfPermitted(): Promise<void> {
  if (!areSoulJourneyNudgesEnabled()) return
  const { initialOpenDate, courseStartDate } = useChakraJourneyStore.getState()
  if (!courseStartDate) return
  if (!(await hasNotificationPermission())) return
  const signup = initialOpenDate ?? courseStartDate
  await scheduleSoulJourneyAfterPermission(signup, courseStartDate)
}
