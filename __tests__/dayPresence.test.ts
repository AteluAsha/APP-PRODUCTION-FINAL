/* eslint-env jest */
import * as fs from "fs"
import * as path from "path"
import { getDayPresenceBeats, I_AM_PRESENT_LABEL } from "../constants/dayPresenceCopy"
import { nextChakraOpenPath, chakraDayRoute } from "../utils/chakraDayRoute"

describe("first-click day presence", () => {
    it("sends an ungrounded root tap to DayPresence", () => {
        expect(nextChakraOpenPath(0, false)).toBe("/(chakras)/DayPresence?day=0")
        expect(nextChakraOpenPath(3, false)).toBe("/(chakras)/DayPresence?day=3")
    })

    it("opens the course day after presence", () => {
        expect(nextChakraOpenPath(0, true)).toBe("/(chakras)/root")
        expect(chakraDayRoute(5)).toBe("/(chakras)/thirdeye")
        expect(nextChakraOpenPath(6, true)).toBe("/(chakras)/crown")
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

    it("enters the course day after interactions, not from a UI-thread worklet", () => {
        const open = fs.readFileSync(
            path.join(__dirname, "..", "utils/openChakraDay.ts"),
            "utf8",
        )
        expect(open).toContain("InteractionManager.runAfterInteractions")
        expect(open).toContain("nav.replace(path as never)")
    })
})
