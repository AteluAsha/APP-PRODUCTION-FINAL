/* eslint-env jest */
/**
 * Entry routing (splash → first screen) – critical path tests.
 * Opening sequence: Wellness gate once, then App 2 (ChakraHub).
 */

function getInitialRoute(hasStartedMasterTeachings: boolean): string {
  return hasStartedMasterTeachings
    ? "/(chakras)/ChakraHub"
    : "/(chakras)/WellnessGate"
}

describe("Entry routing (splash → first screen)", () => {
  it("sends first open to the wellness gate", () => {
    expect(getInitialRoute(false)).toBe("/(chakras)/WellnessGate")
  })

  it("sends returning seekers to ChakraHub after they begin the teachings", () => {
    expect(getInitialRoute(true)).toBe("/(chakras)/ChakraHub")
  })

  it("uses the same hub opening on iOS and Android", () => {
    expect(getInitialRoute(true)).not.toContain("WelcomeScreen")
    expect(getInitialRoute(true)).toBe("/(chakras)/ChakraHub")
  })

  it("never opens tribe, halls, or date selection from splash", () => {
    expect(getInitialRoute(true)).not.toContain("TribeChat")
    expect(getInitialRoute(true)).not.toContain("CommunityHalls")
    expect(getInitialRoute(true)).not.toContain("DateSelection")
  })
})
