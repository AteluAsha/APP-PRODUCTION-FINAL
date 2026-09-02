/* eslint-env jest */
import {
    collectEverCompletedIds,
    msUntilNextMondayMidnight,
    planWeeklyVisualReset,
    uniqueDayIds,
} from "../utils/weeklyVisualReset"
import * as fs from "fs"
import * as path from "path"

describe("weekly visual reset keeps gallery cards", () => {
    it("merges this week's checks into the ever-collected set", () => {
        expect(uniqueDayIds([0, 2], [2, 6])).toEqual([0, 2, 6])
        expect(
            collectEverCompletedIds({
                completedChakras: [0],
                everCompletedChakras: [3],
                trialHistory: [{ daysParticipated: [1] }],
            }),
        ).toEqual([0, 1, 3])
    })

    it("stamps the first week without clearing checks", () => {
        const plan = planWeeklyVisualReset({
            lastResetWeekStart: null,
            thisMonday: "2026-08-24",
            completedChakras: [0, 1],
            everCompletedChakras: [],
        })
        expect(plan.didClearWeekMarks).toBe(false)
        expect(plan.completedChakras).toEqual([0, 1])
        expect(plan.everCompletedChakras).toEqual([0, 1])
        expect(plan.weeklyVisualResetWeekStart).toBe("2026-08-24")
    })

    it("clears checkboxes on a new Monday and keeps collected cards", () => {
        const plan = planWeeklyVisualReset({
            lastResetWeekStart: "2026-08-17",
            thisMonday: "2026-08-24",
            completedChakras: [0, 4],
            everCompletedChakras: [0, 2],
        })
        expect(plan.didClearWeekMarks).toBe(true)
        expect(plan.completedChakras).toEqual([])
        expect(plan.everCompletedChakras).toEqual([0, 2, 4])
    })

    it("does not clear again later in the same week", () => {
        const plan = planWeeklyVisualReset({
            lastResetWeekStart: "2026-08-24",
            thisMonday: "2026-08-24",
            completedChakras: [1],
            everCompletedChakras: [0, 1],
        })
        expect(plan.didClearWeekMarks).toBe(false)
        expect(plan.completedChakras).toEqual([1])
    })

    it("waits until the next Monday midnight", () => {
        const wednesday = new Date("2026-08-26T15:00:00")
        const ms = msUntilNextMondayMidnight(wednesday)
        expect(ms).toBeGreaterThan(24 * 60 * 60 * 1000)
        expect(ms).toBeLessThan(7 * 24 * 60 * 60 * 1000)
    })

    it("hooks Monday reset without using the old trial resetJourney wipe", () => {
        const hook = fs.readFileSync(
            path.join(__dirname, "..", "hooks/useChakraWeekTransition.ts"),
            "utf8",
        )
        expect(hook).toContain("applyWeeklyVisualReset")
        expect(hook).not.toContain("resetJourney")
        const store = fs.readFileSync(
            path.join(__dirname, "..", "hooks/useChakraJourneyStore.ts"),
            "utf8",
        )
        expect(store).toContain("everCompletedChakras")
        expect(store).toContain("didClearWeekMarks")
    })
})
