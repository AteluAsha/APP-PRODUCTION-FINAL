/**
 * Soul Journey Nudges — local notifications (iOS + Android) via expo-notifications.
 *
 * Pre-course A–D, trial engagement E–F, horizon G, lifetime sustenance (weekly rhythm, deep inquiry, cycle completion),
 * sporadic wisdom (Love Balm / Ancestral Gnosis — one rare local DATE nudge).
 * Android channel: single low-importance channel "Soul Journey Nudges".
 *
 * Expo Go (SDK 53+): module not loaded — all exports no-op safely.
 */

import { Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import {
  ANCESTRAL_GNOSIS,
  chakraDayFromDate,
  ENGAGEMENT_COPY,
  GNOSIS_DEEP_INQUIRY,
  HORIZON_COPY,
  LOVE_BALMS,
  PRE_COURSE_COPY,
  SUSTENANCE_COPY,
} from '@/constants/journeyNotificationCopy'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { shouldShowWaitingScreen } from '@/src/services/timegate'
import { getCurrentDayOfWeek, hasReachedCourseStartDate } from '@/utils/date'
import {
  ENTITLEMENT_ID,
  getCustomerInfo,
} from '@/src/services/revenuecat'

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

      Notifications.addNotificationReceivedListener((event) => {
        const kind = event.request.content.data?.kind
        if (kind === 'silent-integration') {
          useChakraJourneyStore
            .getState()
            .setEngagementSilentIntegrationDone(true)
          void cancelByPrefix(FLOW_RIVER_PREFIX)
        }
      })

      Notifications.addNotificationResponseReceivedListener((response) => {
        const kind = response.notification.request.content.data?.kind
        if (kind === 'silent-integration') {
          useChakraJourneyStore
            .getState()
            .setEngagementSilentIntegrationDone(true)
          void cancelByPrefix(FLOW_RIVER_PREFIX)
        }
      })
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

const MORNING_H = 9
const AFTERNOON_H = 15
const EVENING_H = 18

const PRE_PREFIX = 'pre-journey-'
const LEGACY_PRE_PREFIX = 'journey-reminder-'
const FLOW_RIVER_PREFIX = 'flow-river-'
const SILENT_INTEGRATION_ID = 'silent-integration'
const HORIZON_PREFIX = 'horizon-'

/** Lifetime / scholarship — weekly rhythm + deep inquiry + billing reminder */
const SUSTENANCE_SUNDAY_ID = 'sustenance-sunday-reset'
const SUSTENANCE_PULSE_PREFIX = 'sustenance-pulse-'
const SUSTENANCE_DEEP_INQUIRY_ID = 'sustenance-deep-inquiry'
const SUSTENANCE_CYCLE_PREFIX = 'sustenance-cycle-'

/** One-at-a-time rare whisper — Love Balm (weekday-mapped) or Ancestral Gnosis pool. */
const SPORADIC_WISDOM_ID = 'sporadic-wisdom'

/**
 * Lifetime user still in somatic pre-course waiting room — use trial Scenarios A–D only.
 */
export function isLifetimePreCourseWaitingRoomSync(): boolean {
  const state = useChakraJourneyStore.getState()
  if (!state.hasLifetimeAccess || !state.lifetimeChosenTimegateJourney) {
    return false
  }
  const hasReachedStartDate = state.courseStartDate
    ? hasReachedCourseStartDate(state.courseStartDate)
    : false
  const isMonday = getCurrentDayOfWeek() === 0
  const isFirstLaunch = useFirstLaunchStore.getState().isFirstLaunch
  return shouldShowWaitingScreen(
    state.hasLifetimeAccess,
    hasReachedStartDate,
    isMonday,
    state.journeyStarted,
    isFirstLaunch,
    state.courseStartDate,
    state.lifetimeChosenTimegateJourney,
  )
}

function shouldRunLifetimeSustenanceRhythm(): boolean {
  const s = useChakraJourneyStore.getState()
  if (!s.hasLifetimeAccess) return false
  if (isLifetimePreCourseWaitingRoomSync()) return false
  return true
}

/** Trial + lifetime: suppress sporadic whispers while waiting room (A–D-only stretch). */
function shouldSuppressSporadicWisdomSync(): boolean {
  const state = useChakraJourneyStore.getState()
  if (!state.courseStartDate) return true
  const hasReachedStartDate = hasReachedCourseStartDate(state.courseStartDate)
  const isMonday = getCurrentDayOfWeek() === 0
  const isFirstLaunch = useFirstLaunchStore.getState().isFirstLaunch
  return shouldShowWaitingScreen(
    state.hasLifetimeAccess,
    hasReachedStartDate,
    isMonday,
    state.journeyStarted,
    isFirstLaunch,
    state.courseStartDate,
    state.lifetimeChosenTimegateJourney,
  )
}

function sporadicTriggerFireMillis(trigger: unknown): number | null {
  if (!trigger || typeof trigger !== 'object') return null
  const t = trigger as { type?: string; date?: Date | number }
  if (t.type === 'date' && t.date != null) {
    return typeof t.date === 'number' ? t.date : new Date(t.date).getTime()
  }
  return null
}

async function hasFutureSporadicWisdomScheduled(): Promise<boolean> {
  if (!Notifications) return false
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const now = Date.now()
  for (const n of scheduled) {
    if (n.identifier !== SPORADIC_WISDOM_ID) continue
    const ms = sporadicTriggerFireMillis(n.trigger)
    if (ms != null && ms > now) return true
    await cancelNotificationId(SPORADIC_WISDOM_ID)
    break
  }
  return false
}

function parseLocalMidnight(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

function calendarDaysBetween(startISO: string, endISO: string): number {
  const a = parseLocalMidnight(startISO)
  const b = parseLocalMidnight(endISO)
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000))
}

/** Start of the calendar day after the 7-day index window (Mon–Sun) from course start. */
function courseCycleAnchorEnd(courseStartISO: string): Date {
  const d = parseLocalMidnight(courseStartISO)
  d.setDate(d.getDate() + 7)
  d.setHours(0, 0, 0, 0)
  return d
}

type PreCourseItem = {
  id: string
  date: Date
  title: string
  body: string
  data: Record<string, unknown>
}

export function buildPreCourseNotifications(
  signupDateISO: string,
  courseStartDateISO: string,
  now: Date,
): PreCourseItem[] {
  const startDay = parseLocalMidnight(courseStartDateISO)
  const items: PreCourseItem[] = []

  if (signupDateISO === courseStartDateISO) {
    const when = new Date(now.getTime() + 60 * 60 * 1000)
    items.push({
      id: `${PRE_PREFIX}d-welcome`,
      date: when,
      title: PRE_COURSE_COPY.dWelcome.title,
      body: PRE_COURSE_COPY.dWelcome.body,
      data: { kind: 'pre-course', scenario: 'D' },
    })
    return items
  }

  const delta = calendarDaysBetween(signupDateISO, courseStartDateISO)

  const addIfFuture = (id: string, d: Date, title: string, body: string, scenario: string) => {
    if (d > now) {
      items.push({
        id,
        date: d,
        title,
        body,
        data: { kind: 'pre-course', scenario },
      })
    }
  }

  const atDaysBeforeStart = (days: number, h: number, min: number): Date => {
    const t = new Date(startDay)
    t.setDate(t.getDate() - days)
    t.setHours(h, min, 0, 0)
    return t
  }

  if (delta >= 14) {
    addIfFuture(
      `${PRE_PREFIX}a-14`,
      atDaysBeforeStart(14, MORNING_H, 0),
      PRE_COURSE_COPY.a14.title,
      PRE_COURSE_COPY.a14.body,
      'A',
    )
    addIfFuture(
      `${PRE_PREFIX}a-7`,
      atDaysBeforeStart(7, AFTERNOON_H, 0),
      PRE_COURSE_COPY.a7.title,
      PRE_COURSE_COPY.a7.body,
      'A',
    )
  } else if (delta >= 3 && delta <= 6) {
    addIfFuture(
      `${PRE_PREFIX}b-3`,
      atDaysBeforeStart(3, MORNING_H, 0),
      PRE_COURSE_COPY.b3.title,
      PRE_COURSE_COPY.b3.body,
      'B',
    )
    addIfFuture(
      `${PRE_PREFIX}b-2`,
      atDaysBeforeStart(2, EVENING_H, 0),
      PRE_COURSE_COPY.b2.title,
      PRE_COURSE_COPY.b2.body,
      'B',
    )
  }

  addIfFuture(
    `${PRE_PREFIX}c-noon`,
    atDaysBeforeStart(1, 12, 0),
    PRE_COURSE_COPY.cNoon.title,
    PRE_COURSE_COPY.cNoon.body,
    'C',
  )
  addIfFuture(
    `${PRE_PREFIX}c-eve`,
    atDaysBeforeStart(1, 20, 0),
    PRE_COURSE_COPY.cEve.title,
    PRE_COURSE_COPY.cEve.body,
    'C',
  )

  const seen = new Set<string>()
  return items.filter((it) => {
    if (seen.has(it.id)) return false
    seen.add(it.id)
    return true
  })
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

async function cancelLifetimeSustenanceRhythmOnly(): Promise<void> {
  if (!Notifications) return
  await cancelNotificationId(SUSTENANCE_SUNDAY_ID)
  await cancelByPrefix(SUSTENANCE_PULSE_PREFIX)
  await cancelNotificationId(SUSTENANCE_DEEP_INQUIRY_ID)
}

async function cancelLifetimeSustenanceScheduled(): Promise<void> {
  if (!Notifications) return
  await cancelLifetimeSustenanceRhythmOnly()
  await cancelByPrefix(SUSTENANCE_CYCLE_PREFIX)
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
    description: 'Gentle, sparse reminders along your Soul School path',
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

/**
 * Cancel all pre-course nudges (current + legacy ids).
 */
export async function cancelPreCourseNudges(): Promise<void> {
  if (!Notifications) return
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const toCancel = scheduled.filter(
    (n) =>
      n.identifier.startsWith(PRE_PREFIX) ||
      n.identifier.startsWith(LEGACY_PRE_PREFIX),
  )
  await Promise.all(
    toCancel.map((n) =>
      Notifications!.cancelScheduledNotificationAsync(n.identifier),
    ),
  )
}

export async function cancelJourneyReminders(): Promise<void> {
  await cancelPreCourseNudges()
}

/**
 * Cancel every Soul Journey local notification we manage (pre, engagement, horizon, legacy).
 */
export async function cancelAllSoulJourneyScheduled(): Promise<void> {
  if (!Notifications) return
  await cancelPreCourseNudges()
  await cancelByPrefix(FLOW_RIVER_PREFIX)
  await cancelNotificationId(SILENT_INTEGRATION_ID)
  await cancelByPrefix(HORIZON_PREFIX)
  await cancelNotificationId(SPORADIC_WISDOM_ID)
  await cancelLifetimeSustenanceScheduled()
}

/**
 * Schedule pre-course scenarios A–C (and D when same-day). Requires permission already granted.
 */
export async function schedulePreCourseNudges(
  signupDateISO: string,
  courseStartDateISO: string,
): Promise<void> {
  if (!Notifications) return
  if (!areSoulJourneyNudgesEnabled()) return
  if (!(await hasNotificationPermission())) return
  await ensureAndroidChannel()
  await cancelPreCourseNudges()

  const items = buildPreCourseNotifications(
    signupDateISO,
    courseStartDateISO,
    new Date(),
  )
  const x = androidExtras()
  for (const it of items) {
    await Notifications.scheduleNotificationAsync({
      identifier: it.id,
      content: {
        title: it.title,
        body: it.body,
        data: it.data,
        ...x,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: it.date,
        ...(Platform.OS === 'android' ? x : {}),
      },
    })
  }
}

/**
 * Scenario G — horizon nudges after the 7-day structure ends.
 */
export async function scheduleHorizonNudges(
  courseStartDateISO: string,
): Promise<void> {
  if (!Notifications) return
  if (!areSoulJourneyNudgesEnabled()) return
  if (!(await hasNotificationPermission())) return
  await ensureAndroidChannel()
  await cancelByPrefix(HORIZON_PREFIX)

  const anchor = courseCycleAnchorEnd(courseStartDateISO)
  const now = new Date()

  const g1 = new Date(anchor)
  g1.setDate(g1.getDate() + 1)
  g1.setHours(MORNING_H, 0, 0, 0)

  const g2 = new Date(anchor)
  g2.setDate(g2.getDate() + 7)
  g2.setHours(AFTERNOON_H, 0, 0, 0)

  const x = androidExtras()

  if (g1 > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${HORIZON_PREFIX}plus-1`,
      content: {
        title: HORIZON_COPY.plus1.title,
        body: HORIZON_COPY.plus1.body,
        data: { kind: 'horizon', which: 1 },
        ...x,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: g1,
        ...(Platform.OS === 'android' ? x : {}),
      },
    })
  }

  if (g2 > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${HORIZON_PREFIX}plus-7`,
      content: {
        title: HORIZON_COPY.plus7.title,
        body: HORIZON_COPY.plus7.body,
        data: { kind: 'horizon', which: 7 },
        ...x,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: g2,
        ...(Platform.OS === 'android' ? x : {}),
      },
    })
  }
}

const SUSTENANCE_WEEKLY_PULSES: {
  idSuffix: string
  weekday: number
  title: string
  body: string
}[] = [
  {
    idSuffix: 'mon',
    weekday: 2,
    title: SUSTENANCE_COPY.pulseMon.title,
    body: SUSTENANCE_COPY.pulseMon.body,
  },
  {
    idSuffix: 'tue',
    weekday: 3,
    title: SUSTENANCE_COPY.pulseTue.title,
    body: SUSTENANCE_COPY.pulseTue.body,
  },
  {
    idSuffix: 'wed',
    weekday: 4,
    title: SUSTENANCE_COPY.pulseWed.title,
    body: SUSTENANCE_COPY.pulseWed.body,
  },
  {
    idSuffix: 'thu',
    weekday: 5,
    title: SUSTENANCE_COPY.pulseThu.title,
    body: SUSTENANCE_COPY.pulseThu.body,
  },
  {
    idSuffix: 'sat',
    weekday: 7,
    title: SUSTENANCE_COPY.pulseSat.title,
    body: SUSTENANCE_COPY.pulseSat.body,
  },
]

/**
 * Scholarship (store) or RevenueCat subscription — one DATE nudge three days before access ends.
 * Scholarship expiry is source of truth when paymentStatus === 'scholarship'.
 */
async function scheduleLifetimeAccessCycleCompletion(): Promise<void> {
  if (!Notifications) return
  await cancelByPrefix(SUSTENANCE_CYCLE_PREFIX)

  const state = useChakraJourneyStore.getState()
  const now = new Date()
  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}

  if (state.paymentStatus === 'scholarship' && state.scholarshipExpiryDate) {
    const exp = new Date(state.scholarshipExpiryDate)
    if (!Number.isNaN(exp.getTime()) && exp > now) {
      const triggerAt = new Date(exp)
      triggerAt.setDate(triggerAt.getDate() - 3)
      triggerAt.setHours(10, 0, 0, 0)
      if (triggerAt > now && triggerAt < exp) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${SUSTENANCE_CYCLE_PREFIX}scholarship`,
          content: {
            title: SUSTENANCE_COPY.cycleCompletes.title,
            body: SUSTENANCE_COPY.cycleCompletes.body,
            data: { kind: 'sustenance', band: 'cycle' },
            ...x,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerAt,
            ...triggerExtras,
          },
        })
      }
    }
    return
  }

  const info = await getCustomerInfo()
  const ent = info?.entitlements?.active?.[ENTITLEMENT_ID]
  if (ent?.expirationDate) {
    const exp = new Date(ent.expirationDate)
    if (!Number.isNaN(exp.getTime()) && exp > now) {
      const triggerAt = new Date(exp)
      triggerAt.setDate(triggerAt.getDate() - 3)
      triggerAt.setHours(10, 0, 0, 0)
      if (triggerAt > now && triggerAt < exp) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${SUSTENANCE_CYCLE_PREFIX}rc`,
          content: {
            title: SUSTENANCE_COPY.cycleCompletes.title,
            body: SUSTENANCE_COPY.cycleCompletes.body,
            data: { kind: 'sustenance', band: 'cycle' },
            ...x,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerAt,
            ...triggerExtras,
          },
        })
      }
    }
  }
}

/**
 * Weekly chakra pulses at 09:00 local (Mon, Tue, Wed, Thu, Sat). Lifetime / scholarship only — not in pre-course waiting room.
 */
export async function scheduleDailyChakraPulse(): Promise<void> {
  if (!Notifications) return
  if (!areSoulJourneyNudgesEnabled()) return
  if (!(await hasNotificationPermission())) return
  if (!shouldRunLifetimeSustenanceRhythm()) return
  await ensureAndroidChannel()
  await cancelByPrefix(SUSTENANCE_PULSE_PREFIX)

  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}

  for (const p of SUSTENANCE_WEEKLY_PULSES) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${SUSTENANCE_PULSE_PREFIX}${p.idSuffix}`,
      content: {
        title: p.title,
        body: p.body,
        data: { kind: 'sustenance', band: 'pulse', day: p.idSuffix },
        ...x,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: p.weekday,
        hour: 9,
        minute: 0,
        ...triggerExtras,
      },
    })
  }
}

/**
 * One future notification max: random day in 1…14, time 11:00–16:59 local, 50/50 Love Balm (weekday body) vs Ancestral Gnosis.
 * Skipped in waiting room; same channel as other Soul Journey nudges.
 */
export async function syncSporadicWisdomNotifications(): Promise<void> {
  if (!Notifications) return
  if (!areSoulJourneyNudgesEnabled()) {
    await cancelNotificationId(SPORADIC_WISDOM_ID)
    return
  }
  if (!(await hasNotificationPermission())) return

  const { courseStartDate } = useChakraJourneyStore.getState()
  if (!courseStartDate) return

  if (shouldSuppressSporadicWisdomSync()) {
    await cancelNotificationId(SPORADIC_WISDOM_ID)
    return
  }

  await ensureAndroidChannel()

  if (await hasFutureSporadicWisdomScheduled()) return

  if (ANCESTRAL_GNOSIS.length === 0) return

  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}
  const now = new Date()
  const daysAhead = 1 + Math.floor(Math.random() * 14)
  const fire = new Date(now)
  fire.setDate(fire.getDate() + daysAhead)
  fire.setHours(0, 0, 0, 0)
  const minuteOfDay = 11 * 60 + Math.floor(Math.random() * 360)
  fire.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0)
  if (fire.getTime() <= now.getTime()) {
    fire.setDate(fire.getDate() + 1)
  }

  const useLoveBalm = Math.random() < 0.5
  let title: string
  let body: string
  let variant: 'love-balm' | 'gnosis'

  if (useLoveBalm) {
    const day = chakraDayFromDate(fire)
    const entry = LOVE_BALMS[day]
    const pool = [...entry.affirmations, ...entry.loveBalms]
    if (pool.length === 0) return
    body = pool[Math.floor(Math.random() * pool.length)]!
    title = "Today's Love Balm"
    variant = 'love-balm'
  } else {
    title = 'Ancestral Gnosis'
    body =
      ANCESTRAL_GNOSIS[
        Math.floor(Math.random() * ANCESTRAL_GNOSIS.length)
      ]!
    variant = 'gnosis'
  }

  await Notifications.scheduleNotificationAsync({
    identifier: SPORADIC_WISDOM_ID,
    content: {
      title,
      body,
      data: { kind: 'sporadic-wisdom', variant },
      ...x,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fire,
      ...triggerExtras,
    },
  })
}

/**
 * Lifetime sustenance: cycle completion + (when not in somatic waiting room) Sunday 20:00, daily pulses, deep inquiry at 7d idle.
 */
export async function syncLifetimeSustenanceNotifications(): Promise<void> {
  if (!Notifications) return
  if (!areSoulJourneyNudgesEnabled()) {
    await cancelLifetimeSustenanceScheduled()
    return
  }
  if (!(await hasNotificationPermission())) return

  const state = useChakraJourneyStore.getState()
  if (!state.hasLifetimeAccess) {
    await cancelLifetimeSustenanceScheduled()
    return
  }

  await ensureAndroidChannel()
  await scheduleLifetimeAccessCycleCompletion()

  if (!shouldRunLifetimeSustenanceRhythm()) {
    await cancelLifetimeSustenanceRhythmOnly()
    return
  }

  await cancelNotificationId(SUSTENANCE_SUNDAY_ID)
  await cancelByPrefix(SUSTENANCE_PULSE_PREFIX)
  await cancelNotificationId(SUSTENANCE_DEEP_INQUIRY_ID)

  const x = androidExtras()
  const triggerExtras = Platform.OS === 'android' ? x : {}

  await Notifications.scheduleNotificationAsync({
    identifier: SUSTENANCE_SUNDAY_ID,
    content: {
      title: SUSTENANCE_COPY.sundayEve.title,
      body: SUSTENANCE_COPY.sundayEve.body,
      data: { kind: 'sustenance', band: 'sunday' },
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

  await scheduleDailyChakraPulse()

  const now = new Date()
  const base = state.lastAppActiveAt ? new Date(state.lastAppActiveAt) : now
  const d7 = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000)
  if (d7 > now && GNOSIS_DEEP_INQUIRY.length > 0) {
    const pick =
      GNOSIS_DEEP_INQUIRY[
        Math.floor(Math.random() * GNOSIS_DEEP_INQUIRY.length)
      ]
    await Notifications.scheduleNotificationAsync({
      identifier: SUSTENANCE_DEEP_INQUIRY_ID,
      content: {
        title: pick.title,
        body: pick.body,
        data: { kind: 'deep-inquiry' },
        ...x,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: d7,
        ...triggerExtras,
      },
    })
  }
}

/**
 * In-course re-engagement (E) and post-cycle drop-off (F). Reschedules on each app foreground.
 * Horizon (G) always refreshed when engagement is eligible so completion nudges still schedule
 * after silent integration is done.
 */
export async function syncEngagementNotifications(): Promise<void> {
  if (!Notifications) return
  if (!areSoulJourneyNudgesEnabled()) {
    await cancelAllSoulJourneyScheduled()
    return
  }

  const state = useChakraJourneyStore.getState()
  const {
    courseStartDate,
    journeyStarted,
    hasLifetimeAccess,
    lifetimeChosenTimegateJourney,
    allChakrasCompleted,
    lastAppActiveAt,
    engagementSilentIntegrationDone,
  } = state

  if (!courseStartDate) return
  if (hasLifetimeAccess && !lifetimeChosenTimegateJourney) return
  if (!(await hasNotificationPermission())) return

  await ensureAndroidChannel()

  await cancelByPrefix(FLOW_RIVER_PREFIX)
  await cancelNotificationId(SILENT_INTEGRATION_ID)

  if (!engagementSilentIntegrationDone) {
    const now = new Date()
    const cycleEnd = courseCycleAnchorEnd(courseStartDate)
    const base = lastAppActiveAt ? new Date(lastAppActiveAt) : now
    const x = androidExtras()

    if (journeyStarted && now < cycleEnd && !allChakrasCompleted) {
      const d24 = new Date(base.getTime() + 24 * 60 * 60 * 1000)
      const d48 = new Date(base.getTime() + 48 * 60 * 60 * 1000)

      if (d24 > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${FLOW_RIVER_PREFIX}24h`,
          content: {
            title: ENGAGEMENT_COPY.river24.title,
            body: ENGAGEMENT_COPY.river24.body,
            data: { kind: 'flow-river', step: 24 },
            ...x,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: d24,
            ...(Platform.OS === 'android' ? x : {}),
          },
        })
      }

      if (d48 > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${FLOW_RIVER_PREFIX}48h`,
          content: {
            title: ENGAGEMENT_COPY.river48.title,
            body: ENGAGEMENT_COPY.river48.body,
            data: { kind: 'flow-river', step: 48 },
            ...x,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: d48,
            ...(Platform.OS === 'android' ? x : {}),
          },
        })
      }
    }

    if (!hasLifetimeAccess && now >= cycleEnd) {
      const d7 = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000)
      if (d7 > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: SILENT_INTEGRATION_ID,
          content: {
            title: ENGAGEMENT_COPY.silentIntegration.title,
            body: ENGAGEMENT_COPY.silentIntegration.body,
            data: { kind: 'silent-integration' },
            ...x,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: d7,
            ...(Platform.OS === 'android' ? x : {}),
          },
        })
      }
    }
  }

  await scheduleHorizonNudges(courseStartDate)
}

/**
 * First day of the course week: stop pre-course nudges; sync engagement + horizon.
 */
export async function onJourneyWeekStarted(): Promise<void> {
  const cs = useChakraJourneyStore.getState().courseStartDate
  if (!cs) return
  await cancelPreCourseNudges()
  await syncEngagementNotifications()
  await syncLifetimeSustenanceNotifications()
  await syncSporadicWisdomNotifications()
}

/**
 * After user grants permission: pre-course (A–D), horizon (G), engagement sync (E–F).
 */
export async function scheduleSoulJourneyAfterPermission(
  signupDateISO: string,
  courseStartDateISO: string,
): Promise<void> {
  if (!areSoulJourneyNudgesEnabled()) return
  await schedulePreCourseNudges(signupDateISO, courseStartDateISO)
  await scheduleHorizonNudges(courseStartDateISO)
  await syncEngagementNotifications()
  await syncLifetimeSustenanceNotifications()
  await syncSporadicWisdomNotifications()
}

/**
 * @deprecated Prefer scheduleSoulJourneyAfterPermission when signup date is known.
 */
export async function scheduleJourneyReminders(
  courseStartDateISO: string,
): Promise<void> {
  if (!areSoulJourneyNudgesEnabled()) return
  const signup =
    useChakraJourneyStore.getState().initialOpenDate ?? courseStartDateISO
  const hasPermission = await requestNotificationPermissions()
  if (!hasPermission) {
    if (__DEV__)
      console.log(
        '[JourneyNotifications] Permission not granted, skipping reminders',
      )
    return
  }
  await scheduleSoulJourneyAfterPermission(signup, courseStartDateISO)
}

/** When permission is already granted (e.g. returning to waiting room). */
export async function scheduleWaitingRoomNudgesIfPermitted(): Promise<void> {
  if (!areSoulJourneyNudgesEnabled()) return
  const { initialOpenDate, courseStartDate } = useChakraJourneyStore.getState()
  if (!courseStartDate) return
  if (!(await hasNotificationPermission())) return
  const signup = initialOpenDate ?? courseStartDate
  await scheduleSoulJourneyAfterPermission(signup, courseStartDate)
}
