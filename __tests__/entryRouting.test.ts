/* eslint-env jest */
/**
 * Entry routing (splash → first screen) – critical path tests.
 * Opening sequence: Wellness gate once, then App 2 (ChakraHub).
 */

import fs from "fs"
import path from "path"

function getInitialRoute(hasStartedMasterTeachings: boolean): string {
  return hasStartedMasterTeachings
    ? "/(chakras)/ChakraHub"
    : "/(chakras)/WellnessGate"
}

const retiredRoutes = [
  "app/(chakras)/ChakraHome.tsx",
  "app/(chakras)/TribeChat.tsx",
  "app/(chakras)/DateSelection.tsx",
  "app/(chakras)/WelcomeScreen.tsx",
  "app/(chakras)/CoursePreview.tsx",
  "app/(chakras)/Contribute.tsx",
  "app/(chakras)/AccountabilityOfAwakening.tsx",
  "app/(chakras)/SimpleGraceTransition.tsx",
  "app/(chakras)/Preview.tsx",
  "app/CommunityHalls.tsx",
]

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

  it("keeps retired routes as hub redirects so stale links never strand anyone", () => {
    const hub = fs.readFileSync(
      path.join(__dirname, "..", "components/navigation/RetiredToHub.tsx"),
      "utf8",
    )
    expect(hub).toContain('router.replace("/(chakras)/ChakraHub")')

    for (const rel of retiredRoutes) {
      const src = fs.readFileSync(path.join(__dirname, "..", rel), "utf8")
      expect(src).toContain("RetiredToHub")
      expect(src).not.toContain("WaitingScreen")
      expect(src).not.toContain("CommunityHallsScreen")
    }
  })
})
