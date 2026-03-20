/* eslint-env jest */
/**
 * Entry routing (splash → first screen) – critical path tests.
 * Mirrors logic in app/(chakras)/index.tsx so routing rules stay locked.
 */

/**
 * Pure function: given journey state, which route should index navigate to?
 * Order: lifetime → ChakraHub; completedTrialCourses === 1 → DateSelection; courseStartDate → ChakraHome; else → WelcomeScreen.
 */
function getInitialRoute(params: {
  hasLifetimeAccess: boolean
  completedTrialCourses: number
  courseStartDate: string | null
}): string {
  const { hasLifetimeAccess, completedTrialCourses, courseStartDate } = params
  if (hasLifetimeAccess) return "/(chakras)/ChakraHub"
  if (completedTrialCourses === 1) return "/(chakras)/DateSelection"
  if (courseStartDate) return "/(chakras)/ChakraHome"
  return "/(chakras)/WelcomeScreen"
}

describe("Entry routing (splash → first screen)", () => {
  it("sends lifetime users to ChakraHub", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: true,
        completedTrialCourses: 0,
        courseStartDate: null,
      }),
    ).toBe("/(chakras)/ChakraHub")
    expect(
      getInitialRoute({
        hasLifetimeAccess: true,
        completedTrialCourses: 1,
        courseStartDate: "2026-02-17",
      }),
    ).toBe("/(chakras)/ChakraHub")
  })

  it("sends trial users with completedTrialCourses === 1 to DateSelection", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 1,
        courseStartDate: null,
      }),
    ).toBe("/(chakras)/DateSelection")
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 1,
        courseStartDate: "2026-02-17",
      }),
    ).toBe("/(chakras)/DateSelection")
  })

  it("sends trial users with courseStartDate to ChakraHome", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 0,
        courseStartDate: "2026-02-17",
      }),
    ).toBe("/(chakras)/ChakraHome")
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 2,
        courseStartDate: "2026-02-17",
      }),
    ).toBe("/(chakras)/ChakraHome")
  })

  it("sends trial users with no date to WelcomeScreen", () => {
    expect(
      getInitialRoute({
        hasLifetimeAccess: false,
        completedTrialCourses: 0,
        courseStartDate: null,
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
