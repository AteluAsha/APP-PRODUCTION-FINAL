/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import {
  COURSE_CHAKRA_NUDGES,
  SUNDAY_EARTH_CYCLE_COPY,
  WEDNESDAY_ENERGY_BODY_COPY,
  copyForDailySlot,
} from '@/constants/journeyNotificationCopy'

describe('weekly heart reminders', () => {
  it('uses Sunday night copy as the course / Monday Root preview', () => {
    expect(SUNDAY_EARTH_CYCLE_COPY.title).toMatch(/Root/i)
    expect(SUNDAY_EARTH_CYCLE_COPY.body).toMatch(/Monday/i)
    expect(SUNDAY_EARTH_CYCLE_COPY.body).toMatch(/seven days/i)
    expect(SUNDAY_EARTH_CYCLE_COPY).toEqual({
      title: COURSE_CHAKRA_NUDGES[1].nightBeforeTitle,
      body: COURSE_CHAKRA_NUDGES[1].nightBeforeBody,
    })
  })

  it('uses Wednesday solar-plexus copy when daily alignment is off', () => {
    expect(WEDNESDAY_ENERGY_BODY_COPY.title).toMatch(/fire/i)
    expect(WEDNESDAY_ENERGY_BODY_COPY.body).toMatch(/Solar plexus/i)
    expect(WEDNESDAY_ENERGY_BODY_COPY.body.length).toBeGreaterThan(20)
  })

  it('aligns noon to today and evening to tomorrow, with Sunday night as the course', () => {
    const sundayEve = copyForDailySlot(
      'evening',
      new Date('2026-09-13T20:00:00'),
    )
    expect(sundayEve.title).toBe(COURSE_CHAKRA_NUDGES[1].nightBeforeTitle)
    expect(sundayEve.body).toMatch(/seven days/i)

    const mondayNoon = copyForDailySlot(
      'noon',
      new Date('2026-09-14T12:00:00'),
    )
    expect(mondayNoon.title).toBe(COURSE_CHAKRA_NUDGES[1].todayTitle)
    expect(mondayNoon.body).toMatch(/Root/i)

    const mondayEve = copyForDailySlot(
      'evening',
      new Date('2026-09-14T20:00:00'),
    )
    expect(mondayEve.title).toBe(COURSE_CHAKRA_NUDGES[2].nightBeforeTitle)
    expect(mondayEve.body).toMatch(/Sacral/i)

    const wednesdayNoon = copyForDailySlot(
      'noon',
      new Date('2026-09-16T12:00:00'),
    )
    expect(wednesdayNoon.title).toBe(COURSE_CHAKRA_NUDGES[3].todayTitle)
    expect(wednesdayNoon.body).toMatch(/Solar plexus/i)

    const saturdayEve = copyForDailySlot(
      'evening',
      new Date('2026-09-12T20:00:00'),
    )
    expect(saturdayEve.title).toBe(COURSE_CHAKRA_NUDGES[7].nightBeforeTitle)
    expect(saturdayEve.body).toMatch(/Sunday/i)
  })

  it('schedules DATE dailies and always keeps Sunday night weekly', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'src/services/journeyNotifications.ts'),
      'utf8',
    )
    expect(src).toContain('syncWeeklyHeartReminders')
    expect(src).toContain('SUNDAY_HEART_REMINDER_ID')
    expect(src).toContain('WEDNESDAY_HEART_REMINDER_ID')
    expect(src).toContain('DAILY_ALIGN_PREFIX')
    expect(src).toContain('COURSE_DAILY_PREFIX')
    expect(src).toContain('scheduleDailyAlignmentReminders')
    expect(src).toContain('activateDailyAlignmentReminders')
    expect(src).toContain('dailyAlignmentRemindersEnabled')
    expect(src).toContain('journeyStarted')
    expect(src).toContain('WEEK1_ID_PREFIX')
    expect(src).toContain('buildWeek1ReminderSlots')
    expect(src).toContain('copyForDailySlot')
    expect(src).toContain('scheduleWeeklySundayReminder()')
    expect(src).toContain("shouldShowList: true")
    expect(src).toContain('AndroidImportance.HIGH')
    expect(src).not.toMatch(
      /if \(isDailyAlignmentEnabled\(\)\) \{[\s\S]*scheduleDailyAlignmentReminders\(\)[\s\S]*return\n  \}/,
    )
  })

  it('modal tells users they can turn daily reminders off in Profile', () => {
    const { DAILY_ALIGNMENT_MODAL_COPY } = require('@/constants/journeyNotificationCopy')
    expect(DAILY_ALIGNMENT_MODAL_COPY.profileNote).toMatch(/Profile/i)

    const profile = fs.readFileSync(
      path.join(__dirname, '..', 'app/(chakras)/Profile.tsx'),
      'utf8',
    )
    expect(profile).toContain('profileOnly')
    const sheet = fs.readFileSync(
      path.join(__dirname, '..', 'components/profile/ProfileSheet.tsx'),
      'utf8',
    )
    expect(sheet).toContain('Daily alignment reminders')
    expect(sheet).toContain('profileOnlyReminders')
    expect(sheet).toContain('profileOnlyScroll')
    expect(sheet).toContain('Energy Exchange')
  })
})
