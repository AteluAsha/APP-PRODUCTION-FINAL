/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import {
    buildWeek1ReminderSlots,
    COURSE_DAILY_PREFIX,
    isWithinFirstJourneyWeek,
    WEEK1_EVENING_HOUR,
    WEEK1_NOON_HOUR,
} from '../src/utils/week1JourneyReminders'
import { WEEK1_JOURNEY_NOTICE_COPY } from '../constants/journeyNotificationCopy'

describe('week 1 journey reminders', () => {
    it('covers the next seven local days and excludes the open day', () => {
        const now = new Date('2026-09-08T10:00:00')
        const slots = buildWeek1ReminderSlots({
            anchorDateKey: '2026-09-08',
            now,
        })
        const days = new Set(slots.map((s) => s.dateKey))
        expect(days.has('2026-09-08')).toBe(false)
        expect(days.has('2026-09-09')).toBe(true)
        expect(days.has('2026-09-15')).toBe(true)
        expect(days.has('2026-09-16')).toBe(false)
        expect(slots).toHaveLength(14)
        expect(slots.every((s) => s.fireAt > now)).toBe(true)
        expect(slots.every((s) => s.id.startsWith(COURSE_DAILY_PREFIX))).toBe(
            true,
        )
        expect(
            slots.filter((s) => s.kind === 'noon').every(
                (s) => s.fireAt.getHours() === WEEK1_NOON_HOUR,
            ),
        ).toBe(true)
        expect(
            slots.filter((s) => s.kind === 'evening').every(
                (s) => s.fireAt.getHours() === WEEK1_EVENING_HOUR,
            ),
        ).toBe(true)
        expect(WEEK1_EVENING_HOUR).toBe(20)
    })

    it('drops remaining same-day slots after a later open', () => {
        const slots = buildWeek1ReminderSlots({
            anchorDateKey: '2026-09-08',
            now: new Date('2026-09-10T15:30:00'),
        })
        expect(slots.some((s) => s.dateKey === '2026-09-10')).toBe(false)
        expect(slots.some((s) => s.dateKey === '2026-09-09')).toBe(false)
        expect(slots.filter((s) => s.dateKey === '2026-09-11')).toHaveLength(2)
        expect(slots).toHaveLength(14)
    })

    it('keeps a rolling 7-day horizon after the first journey week', () => {
        expect(
            isWithinFirstJourneyWeek(
                '2026-09-08',
                new Date('2026-09-14T23:00:00'),
            ),
        ).toBe(true)
        expect(
            isWithinFirstJourneyWeek(
                '2026-09-08',
                new Date('2026-09-15T00:00:00'),
            ),
        ).toBe(false)
        const slots = buildWeek1ReminderSlots({
            anchorDateKey: '2026-09-08',
            now: new Date('2026-09-15T09:00:00'),
        })
        expect(slots.some((s) => s.dateKey === '2026-09-15')).toBe(false)
        expect(slots.some((s) => s.dateKey === '2026-09-16')).toBe(true)
        expect(slots).toHaveLength(14)
    })

    it('does not offer the first-week notice to returning seekers', () => {
        const { shouldOfferWeek1JourneyNotice } = require('../src/utils/week1JourneyReminders')
        expect(
            shouldOfferWeek1JourneyNotice({
                hasSeen: false,
                initialOpenDate: null,
            }),
        ).toBe(true)
        expect(
            shouldOfferWeek1JourneyNotice({
                hasSeen: true,
                initialOpenDate: null,
            }),
        ).toBe(false)
        expect(
            shouldOfferWeek1JourneyNotice({
                hasSeen: false,
                initialOpenDate: '2025-01-01',
                now: new Date('2026-09-08T12:00:00'),
            }),
        ).toBe(false)
    })

    it('wires skip-if-opened scheduling and the Chakras 101 notice', () => {
        const scheduler = fs.readFileSync(
            path.join(__dirname, '..', 'src/services/journeyNotifications.ts'),
            'utf8',
        )
        expect(scheduler).toContain('buildWeek1ReminderSlots')
        expect(scheduler).toContain('WEEK1_ID_PREFIX')
        expect(scheduler).toContain('COURSE_DAILY_PREFIX')
        expect(scheduler).toContain('copyForDailySlot')
        expect(scheduler).toContain('SchedulableTriggerInputTypes.DATE')
        expect(scheduler).not.toContain('hour: 9')
        expect(scheduler).toContain('isDailyAlignmentEnabled()')

        const goodbye = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/GoodbyeModal.tsx',
            ),
            'utf8',
        )
        expect(goodbye).not.toContain('Activate Daily Reminders to Align')
        expect(goodbye).not.toContain('DailyAlignmentReminderModal')
        expect(goodbye).toContain('DailyAlignmentToggleRow')
        expect(goodbye).toContain('chakraDay === 0')

        const chakras101 = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/Chakras101.tsx'),
            'utf8',
        )
        expect(chakras101).toContain('setPendingWeek1JourneyNotice')

        expect(WEEK1_JOURNEY_NOTICE_COPY.body.toLowerCase()).toContain(
            'heart and soul',
        )
        expect(WEEK1_JOURNEY_NOTICE_COPY.profileNote.toLowerCase()).toContain(
            'profile',
        )
        const layout = fs.readFileSync(
            path.join(__dirname, '..', 'app/_layout.tsx'),
            'utf8',
        )
        expect(layout).toContain('Week1JourneyNoticeHost')
        expect(layout).toContain('NotificationPermissionHost')
        expect(layout).toContain('getStoreRehydrationReady')
        const prompt = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/store/NotificationPermissionHost.tsx',
            ),
            'utf8',
        )
        expect(prompt).toContain('CommunicationReminderModal')
        expect(prompt).toContain('activateDailyAlignmentReminders')
        expect(prompt).not.toContain('syncWeeklyHeartReminders')
        const reminder = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/CommunicationReminderModal.tsx',
            ),
            'utf8',
        )
        expect(reminder).toContain('Sunday evenings')
        const root = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/ChakraTemplate.tsx'),
            'utf8',
        )
        expect(root).not.toContain('DailyAlignmentToggleRow')
        expect(root).toContain('setPendingCrownReminderNotice')
        expect(layout).toContain('CrownReminderNoticeHost')
    })
})
