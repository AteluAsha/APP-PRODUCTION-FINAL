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
        expect(root[1].hero).toBe(true)
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
        expect(src).toContain("setTimeout(() => present(), 1100)")
        expect(src).not.toContain("bottom: Platform.OS === 'ios' ? 72")
    })

    it("hub intercepts first taps through openChakraDay", () => {
        const hub = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/ChakraHub.tsx"),
            "utf8",
        )
        expect(hub).toContain("openChakraDay(item.day")
    })
})
