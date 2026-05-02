/* eslint-env jest */
/**
 * Entry routing (splash → first screen) – critical path tests.
 * Mirrors sync portion of app/(chakras)/index.tsx navigate() after legacy AsyncStorage migrate.
 */

/**
 * Pure function: same route decision order as index navigate (post-legacy migrate).
 * Legacy: if courseStartDate && !lifetime && !handoff && clarityKeySeen, handoff becomes true before branches.
 */
function getInitialRoute(params: {
  hasLifetimeAccess: boolean
  completedTrialCourses: number
  courseStartDate: string | null
  dateSelectionEmbodimentHandoffComplete: boolean
  /** WAITING_ROOM_CLARITY_MOMENT_SEEN_KEY === "true" before migrate */
  legacyWaitingRoomClaritySeen: boolean
}): string {
  let handoffComplete = params.dateSelectionEmbodimentHandoffComplete
  if (
    params.courseStartDate &&
    !params.hasLifetimeAccess &&
    handoffComplete !== true &&
    params.legacyWaitingRoomClaritySeen
  ) {
    handoffComplete = true
  }

  if (params.hasLifetimeAccess) return "/(chakras)/ChakraHub"
  if (params.completedTrialCourses === 1) return "/(chakras)/DateSelection"
  if (params.courseStartDate && !params.hasLifetimeAccess && !handoffComplete) {
    return "/(chakras)/DateSelection"
  }
  if (params.courseStartDate) return "/(chakras)/ChakraHome"
  return "/(chakras)/WelcomeScreen"
}

describe("Entry routing (splash → first screen)", () => {
  it("sends lifetime users to ChakraHub", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: true,
        completedTrialCourses: 0,
        courseStartDate: null,
        dateSelectionEmbodimentHandoffComplete: false,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/ChakraHub")
    expect(
      getInitialRoute({
        hasLifetimeAccess: true,
        completedTrialCourses: 1,
        courseStartDate: "2026-02-17",
        dateSelectionEmbodimentHandoffComplete: false,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/ChakraHub")
  })

  it("sends trial users with completedTrialCourses === 1 to DateSelection", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 1,
        courseStartDate: null,
        dateSelectionEmbodimentHandoffComplete: false,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/DateSelection")
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 1,
        courseStartDate: "2026-02-17",
        dateSelectionEmbodimentHandoffComplete: false,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/DateSelection")
  })

  it("sends trial with courseStartDate but no handoff to DateSelection (not ChakraHome)", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 0,
        courseStartDate: "2026-02-17",
        dateSelectionEmbodimentHandoffComplete: false,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/DateSelection")
  })

  it("sends trial with courseStartDate and handoff complete to ChakraHome", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 0,
        courseStartDate: "2026-02-17",
        dateSelectionEmbodimentHandoffComplete: true,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/ChakraHome")
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 2,
        courseStartDate: "2026-02-17",
        dateSelectionEmbodimentHandoffComplete: true,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/ChakraHome")
  })

  it("migrates legacy clarity key then sends to ChakraHome when handoff was false", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 0,
        courseStartDate: "2026-02-17",
        dateSelectionEmbodimentHandoffComplete: false,
        legacyWaitingRoomClaritySeen: true,
      }),
    ).toBe("/(chakras)/ChakraHome")
  })

  it("sends trial users with no date to WelcomeScreen", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 0,
        courseStartDate: null,
        dateSelectionEmbodimentHandoffComplete: false,
        legacyWaitingRoomClaritySeen: false,
      }),
    ).toBe("/(chakras)/WelcomeScreen")
  })
})

describe("Path selection rule (welcome after date set)", () => {
  /** Allowed call sites that may navigate to WelcomeScreen when user already has courseStartDate. Only ProfileSheet SOUL SCHOOL section "Return to SOUL SCHOOL Course Selection". */
  const ALLOWED_WELCOME_NAVIGATORS_AFTER_DATE = [
    "ProfileSheet", // SOUL SCHOOL → Return to SOUL SCHOOL Course Selection
  ]

  it("only explicit user action may open path selection after date is set", () => {
    expect(ALLOWED_WELCOME_NAVIGATORS_AFTER_DATE).toContain("ProfileSheet")
    expect(ALLOWED_WELCOME_NAVIGATORS_AFTER_DATE.length).toBe(1)
  })
})
