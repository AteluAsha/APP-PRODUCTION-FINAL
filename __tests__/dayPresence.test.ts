/* eslint-env jest */
import * as fs from "fs"
import * as path from "path"
import { getDayPresenceBeats, I_AM_PRESENT_LABEL } from "../constants/dayPresenceCopy"
import { nextChakraOpenPath, chakraDayRoute, resolveCourseDayChakra } from "../utils/chakraDayRoute"
import { Chakra } from "../types/chakras/Chakra"

const ALL_DAYS = [
    { day: 0, slug: "root" },
    { day: 1, slug: "sacral" },
    { day: 2, slug: "solar" },
    { day: 3, slug: "heart" },
    { day: 4, slug: "throat" },
    { day: 5, slug: "thirdeye" },
    { day: 6, slug: "crown" },
] as const

describe("first-click day presence", () => {
    it("sends every ungrounded hub ball to DayPresence", () => {
        for (const { day } of ALL_DAYS) {
            expect(nextChakraOpenPath(day, false)).toBe(
                `/(chakras)/DayPresence?day=${day}`,
            )
        }
    })

    it("opens the matching course day after presence for all 7", () => {
        for (const { day, slug } of ALL_DAYS) {
            expect(chakraDayRoute(day)).toBe(`/(chakras)/${slug}`)
            expect(nextChakraOpenPath(day, true)).toBe(`/(chakras)/${slug}`)
        }
    })

    it("resolves leftover presence day query for whichever ball was first", () => {
        expect(resolveCourseDayChakra(undefined, ["(chakras)", "DayPresence"])).toBeNull()
        for (const { day, slug } of ALL_DAYS) {
            expect(
                resolveCourseDayChakra(undefined, ["(chakras)", "[chakra]"], String(day)),
            ).toBe(slug)
            expect(
                resolveCourseDayChakra(slug, ["(chakras)", "DayPresence"]),
            ).toBe(slug)
        }
        expect(resolveCourseDayChakra("0", ["(chakras)", "[chakra]"])).toBeNull()
        expect(Object.values(Chakra)).toHaveLength(7)
    })

    it("gives every day the same four-beat hold as Root", () => {
        const root = getDayPresenceBeats(0)
        expect(root).toHaveLength(4)
        expect(root[0].text).toContain("be with nature")
        expect(root[1].hero).toBeUndefined()
        expect(root[3].text).toContain("earphones")
        expect(getDayPresenceBeats(1)).toHaveLength(4)
        expect(getDayPresenceBeats(6)).toHaveLength(4)
        expect(getDayPresenceBeats(6)[0].text).toContain("vastness")
        expect(I_AM_PRESENT_LABEL).toBe("I Am Present")
    })

    it("keeps I Am Present above the iPhone home indicator", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/DayPresenceScreen.tsx"),
            "utf8",
        )
        expect(src).toContain("useSafeAreaInsets")
        expect(src).toContain("insets.bottom")
        expect(src).toContain("setTimeout(() => present(), 920)")
        expect(src).not.toContain("if (finished) runOnJS(present)()")
        expect(src).not.toContain("bottom: Platform.OS === 'ios' ? 72")
    })

    it("hub intercepts first taps through openChakraDay", () => {
        const hub = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/ChakraHub.tsx"),
            "utf8",
        )
        expect(hub).toContain("openChakraDay(item.day")
    })

    it("pushes the same string route for every day, and never Hub-bounces a missing slug", () => {
        const open = fs.readFileSync(
            path.join(__dirname, "..", "utils/openChakraDay.ts"),
            "utf8",
        )
        const screen = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/[chakra].tsx"),
            "utf8",
        )
        const template = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/ChakraTemplate.tsx"),
            "utf8",
        )
        expect(open).toContain("router.replace(chakraDayRoute(day)")
        expect(open).not.toContain("courseDayHref")
        expect(open).not.toContain("runAfterInteractions")
        expect(screen).toContain("resolveCourseDayChakra")
        expect(screen).toContain("params.day")
        expect(screen).not.toContain('router.replace("/(chakras)/ChakraHub")')
        expect(template).not.toContain("entering=")
        expect(template).not.toContain("ActionBarAnimated")
    })
})
