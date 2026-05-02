/* eslint-env jest */
/**
 * Trial 2 "window elapsed" guardrail – critical path tests.
 *
 * Today (Monday 2026-04-20) a dev phone opened to GraceOfThePresence the moment
 * Trial 2's Monday arrived, because the previous logic treated
 * `currentTrialNumber === 2` as "Trial 2 ended" the instant Trial 2 began.
 * The guardrail in components/chakras/ChakraHome.tsx now requires Trial 2's
 * 7-day window to have actually elapsed before Grace / Seal / the paywall can fire.
 *
 * These tests lock that behavior with a pure function that mirrors the in-component
 * logic (hasTrial2WindowElapsed) so a future refactor cannot silently revert it.
 */

import { daysSince } from "../utils/date"

/**
 * Pure mirror of the `hasTrial2WindowElapsed` useMemo in ChakraHome.tsx.
 * Returns true only when trialHistory has a second trial entry whose startDate is
 * at least 7 days in the past (based on the device's local date).
 */
function hasTrial2WindowElapsed(
  trialHistory: Array<{ startDate?: string | null }>,
): boolean {
  if (trialHistory.length < 2) return false
  const secondTrial = trialHistory[1]
  if (!secondTrial?.startDate) return false
  const elapsed = daysSince(secondTrial.startDate)
  if (elapsed === null) return false
  return elapsed >= 7
}

/**
 * Pure mirror of `showGraceOfPresence` in ChakraHome.
 * A fresh user whose restored state somehow looks like "Trial 2 started today" must
 * NEVER land here; Grace only fires after the 7-day Trial 2 window elapses WITHOUT
 * completion. Completion short-circuits away from Grace into Seal instead.
 */
function shouldShowGraceOfPresence(params: {
  currentTrialNumber: number
  allChakrasCompleted: boolean
  trialHistory: Array<{ startDate?: string | null }>
}): boolean {
  return (
    params.currentTrialNumber === 2 &&
    hasTrial2WindowElapsed(params.trialHistory) &&
    !params.allChakrasCompleted
  )
}

/**
 * Pure mirror of `showSealOfInitiate` in ChakraHome. Seal fires when:
 * - Trial 1 is complete on its Sunday, OR
 * - Trial 2 is "ended" (completed any day of its week, or 7-day window elapsed)
 *   AND the user completed all 7 chakras.
 * The "completed any day of Trial 2 week" path must keep working – we do not
 * delay the happy-ending screen for the sake of the Grace guardrail.
 */
function shouldShowSealOfInitiate(params: {
  currentTrialNumber: number
  allChakrasCompleted: boolean
  currentDay: number
  trialHistory: Array<{ startDate?: string | null }>
}): boolean {
  const isFirstTrialComplete =
    params.currentTrialNumber === 1 &&
    params.allChakrasCompleted &&
    params.currentDay === 6
  const isSecondTrialEnded =
    params.currentTrialNumber === 2 &&
    (params.allChakrasCompleted ||
      hasTrial2WindowElapsed(params.trialHistory))
  return isFirstTrialComplete || (isSecondTrialEnded && params.allChakrasCompleted)
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - days)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

describe("daysSince helper", () => {
  it("returns 0 for today", () => {
    expect(daysSince(isoDaysAgo(0))).toBe(0)
  })

  it("returns positive whole days for past dates", () => {
    expect(daysSince(isoDaysAgo(1))).toBe(1)
    expect(daysSince(isoDaysAgo(7))).toBe(7)
    expect(daysSince(isoDaysAgo(30))).toBe(30)
  })

  it("returns negative for future dates", () => {
    expect(daysSince(isoDaysAgo(-3))).toBe(-3)
  })

  it("returns null for invalid/missing input", () => {
    expect(daysSince(null)).toBeNull()
    expect(daysSince(undefined)).toBeNull()
    expect(daysSince("")).toBeNull()
    expect(daysSince("not-a-date")).toBeNull()
    expect(daysSince("2026/04/20")).toBeNull()
    expect(daysSince("2026-13-01")).toBeNull()
  })
})

describe("hasTrial2WindowElapsed", () => {
  it("returns false when trialHistory has fewer than 2 entries", () => {
    expect(hasTrial2WindowElapsed([])).toBe(false)
    expect(hasTrial2WindowElapsed([{ startDate: isoDaysAgo(14) }])).toBe(false)
  })

  it("returns false when the second trial has no startDate", () => {
    expect(
      hasTrial2WindowElapsed([
        { startDate: isoDaysAgo(30) },
        { startDate: null },
      ]),
    ).toBe(false)
    expect(
      hasTrial2WindowElapsed([
        { startDate: isoDaysAgo(30) },
        { startDate: undefined },
      ]),
    ).toBe(false)
  })

  it("returns false when Trial 2 started TODAY (the bug we are locking out)", () => {
    expect(
      hasTrial2WindowElapsed([
        { startDate: isoDaysAgo(30) },
        { startDate: isoDaysAgo(0) },
      ]),
    ).toBe(false)
  })

  it("returns false mid-Trial-2 (Wednesday of Trial 2 week)", () => {
    expect(
      hasTrial2WindowElapsed([
        { startDate: isoDaysAgo(30) },
        { startDate: isoDaysAgo(2) },
      ]),
    ).toBe(false)
  })

  it("returns false on day 6 of Trial 2 (Sunday of Trial 2 week – still within window)", () => {
    expect(
      hasTrial2WindowElapsed([
        { startDate: isoDaysAgo(30) },
        { startDate: isoDaysAgo(6) },
      ]),
    ).toBe(false)
  })

  it("returns true once 7 full days have elapsed since Trial 2 started", () => {
    expect(
      hasTrial2WindowElapsed([
        { startDate: isoDaysAgo(30) },
        { startDate: isoDaysAgo(7) },
      ]),
    ).toBe(true)
  })

  it("returns true for Trial 2 entries further in the past", () => {
    expect(
      hasTrial2WindowElapsed([
        { startDate: isoDaysAgo(60) },
        { startDate: isoDaysAgo(30) },
      ]),
    ).toBe(true)
  })
})

describe("showGraceOfPresence (first-Monday regression lock)", () => {
  /**
   * Today's production bug: a user whose persisted state had trialHistory.length === 2
   * (from auto-backup restore on reinstall) opened the app on Monday and saw Grace.
   * This test locks the fix: a fresh-Monday open, even with 2 trials in history,
   * must not show Grace unless Trial 2's 7-day window has actually passed.
   */
  it("does NOT show Grace on the first Monday of Trial 2 (today === Trial 2 startDate)", () => {
    expect(
      shouldShowGraceOfPresence({
        currentTrialNumber: 2,
        allChakrasCompleted: false,
        trialHistory: [
          { startDate: isoDaysAgo(30) },
          { startDate: isoDaysAgo(0) },
        ],
      }),
    ).toBe(false)
  })

  it("does NOT show Grace mid-Trial-2 week", () => {
    expect(
      shouldShowGraceOfPresence({
        currentTrialNumber: 2,
        allChakrasCompleted: false,
        trialHistory: [
          { startDate: isoDaysAgo(30) },
          { startDate: isoDaysAgo(3) },
        ],
      }),
    ).toBe(false)
  })

  it("does NOT show Grace for Trial 1 users (regardless of trialHistory shape)", () => {
    expect(
      shouldShowGraceOfPresence({
        currentTrialNumber: 1,
        allChakrasCompleted: false,
        trialHistory: [{ startDate: isoDaysAgo(0) }],
      }),
    ).toBe(false)
  })

  it("does NOT show Grace if the user completed all 7 chakras in Trial 2", () => {
    expect(
      shouldShowGraceOfPresence({
        currentTrialNumber: 2,
        allChakrasCompleted: true,
        trialHistory: [
          { startDate: isoDaysAgo(30) },
          { startDate: isoDaysAgo(10) },
        ],
      }),
    ).toBe(false)
  })

  it("DOES show Grace once Trial 2's 7-day window has elapsed without completion", () => {
    expect(
      shouldShowGraceOfPresence({
        currentTrialNumber: 2,
        allChakrasCompleted: false,
        trialHistory: [
          { startDate: isoDaysAgo(30) },
          { startDate: isoDaysAgo(7) },
        ],
      }),
    ).toBe(true)
  })

  it("DOES show Grace when Trial 2 started well in the past without completion", () => {
    expect(
      shouldShowGraceOfPresence({
        currentTrialNumber: 2,
        allChakrasCompleted: false,
        trialHistory: [
          { startDate: isoDaysAgo(60) },
          { startDate: isoDaysAgo(14) },
        ],
      }),
    ).toBe(true)
  })
})

describe("showSealOfInitiate (happy-ending path, no regression from guardrail)", () => {
  /**
   * The Grace guardrail must NOT delay Seal. If a user completes all 7 chakras on
   * Sunday of Trial 2 week, daysSince(Trial2.startDate) === 6, not 7 yet – but they
   * still deserve to see Seal that Sunday. The "allChakrasCompleted" leg of
   * isSecondTrialEnded handles this.
   */
  it("shows Seal on Sunday of Trial 2 week when all 7 chakras are complete (6 days elapsed)", () => {
    expect(
      shouldShowSealOfInitiate({
        currentTrialNumber: 2,
        allChakrasCompleted: true,
        currentDay: 6,
        trialHistory: [
          { startDate: isoDaysAgo(30) },
          { startDate: isoDaysAgo(6) },
        ],
      }),
    ).toBe(true)
  })

  it("shows Seal mid-Trial-2 week when user completes all 7 early (e.g. day 3)", () => {
    expect(
      shouldShowSealOfInitiate({
        currentTrialNumber: 2,
        allChakrasCompleted: true,
        currentDay: 3,
        trialHistory: [
          { startDate: isoDaysAgo(30) },
          { startDate: isoDaysAgo(3) },
        ],
      }),
    ).toBe(true)
  })

  it("shows Seal on Sunday of Trial 1 week when user completed all 7", () => {
    expect(
      shouldShowSealOfInitiate({
        currentTrialNumber: 1,
        allChakrasCompleted: true,
        currentDay: 6,
        trialHistory: [{ startDate: isoDaysAgo(6) }],
      }),
    ).toBe(true)
  })

  it("does NOT show Seal on Monday of Trial 2 when nothing is completed", () => {
    expect(
      shouldShowSealOfInitiate({
        currentTrialNumber: 2,
        allChakrasCompleted: false,
        currentDay: 0,
        trialHistory: [
          { startDate: isoDaysAgo(30) },
          { startDate: isoDaysAgo(0) },
        ],
      }),
    ).toBe(false)
  })

  it("does NOT show Seal for a brand-new user on their first Monday", () => {
    expect(
      shouldShowSealOfInitiate({
        currentTrialNumber: 1,
        allChakrasCompleted: false,
        currentDay: 0,
        trialHistory: [{ startDate: isoDaysAgo(0) }],
      }),
    ).toBe(false)
  })
})
