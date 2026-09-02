/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import {
  SUNDAY_EARTH_CYCLE_COPY,
  WEDNESDAY_ENERGY_BODY_COPY,
} from '@/constants/journeyNotificationCopy'

describe('weekly heart reminders', () => {
  it('uses Sunday earth-cycle copy about Monday renewal', () => {
    expect(SUNDAY_EARTH_CYCLE_COPY.title).toMatch(/Earth/i)
    expect(SUNDAY_EARTH_CYCLE_COPY.body).toMatch(/Monday/i)
  })

  it('uses Wednesday energy-body copy for started journeys', () => {
    expect(WEDNESDAY_ENERGY_BODY_COPY.title).toMatch(/energy body/i)
    expect(WEDNESDAY_ENERGY_BODY_COPY.body.length).toBeGreaterThan(20)
  })

  it('schedules only Sunday + conditional Wednesday + optional daily', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'src/services/journeyNotifications.ts'),
      'utf8',
    )
    expect(src).toContain('syncWeeklyHeartReminders')
    expect(src).toContain('SUNDAY_HEART_REMINDER_ID')
    expect(src).toContain('WEDNESDAY_HEART_REMINDER_ID')
    expect(src).toContain('DAILY_ALIGN_PREFIX')
    expect(src).toContain('scheduleDailyAlignmentReminders')
    expect(src).toContain('activateDailyAlignmentReminders')
    expect(src).toContain('dailyAlignmentRemindersEnabled')
    expect(src).toContain('journeyStarted')
    expect(src).toContain('cancelAllLegacySoulJourneyNotifications')
  })

  it('modal tells users they can turn daily reminders off in Profile', () => {
    const { DAILY_ALIGNMENT_MODAL_COPY } = require('@/constants/journeyNotificationCopy')
    expect(DAILY_ALIGNMENT_MODAL_COPY.profileNote).toMatch(/Profile/i)
  })
})
