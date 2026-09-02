/* eslint-env jest */
/**
 * APP2 open course — no waiting room, no Monday lock, no week reset.
 */

import { isLifetimeMode, isTrialMode, getAppMode } from "@/constants/appMode"
import {
  isChakraDayAccessible,
  shouldShowWaitingScreen,
  shouldBypassTimegate,
} from "@/src/services/timegate"

describe("APP2 is the only mode", () => {
  it("never reports trial mode", () => {
    expect(isTrialMode(false)).toBe(false)
    expect(isTrialMode(true)).toBe(false)
    expect(isLifetimeMode(false)).toBe(true)
    expect(getAppMode(false)).toBe("lifetime")
  })
})

describe("course days are always open", () => {
  it("does not lock future or missed days", () => {
    const neverParticipated = () => false
    expect(
      isChakraDayAccessible(6, false, neverParticipated, 0, false, true),
    ).toBe(true)
    expect(
      isChakraDayAccessible(0, false, neverParticipated, 3, false),
    ).toBe(true)
  })

  it("never shows a waiting room", () => {
    expect(shouldShowWaitingScreen(false, false, false, false, true, null, true)).toBe(
      false,
    )
  })

  it("always bypasses timegates", () => {
    expect(shouldBypassTimegate(false)).toBe(true)
  })
})
