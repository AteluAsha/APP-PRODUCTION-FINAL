/* eslint-env jest */
import * as fs from "fs"
import * as path from "path"
import {
    getEndOfDayBeats,
    mantraForDay,
} from "../constants/endOfDayPresenceCopy"
import { getTomorrowAwakeningCopy } from "../constants/tomorrowAwakeningCopy"

describe("end of day presence and goodbye", () => {
    it("gives every day the same five-beat breath flow", () => {
        for (let day = 0; day <= 6; day++) {
            const beats = getEndOfDayBeats(day)
            expect(beats).toHaveLength(5)
            expect(beats[0].text).toBe("Take a breath")
            expect(beats[1].text).toBe("And exhale")
            expect(beats[2].text.toLowerCase()).toContain("awaken")
            expect(beats[3].text).toBe(
                "Allow this space to resonate within you",
            )
            expect(beats[2].hero).toBeUndefined()
            expect(beats[4].hero).toBe(true)
            expect(beats[4].showChakra).toBe(true)
            expect(beats[4].text).toBe(mantraForDay(day))
        }
        expect(getEndOfDayBeats(0)[2].text).toBe("Feel your root awaken")
        expect(getEndOfDayBeats(1)[2].text).toBe("Feel your sacral awaken")
        expect(getEndOfDayBeats(6)[2].text).toBe("Feel your crown awaken")
        expect(mantraForDay(0)).toBe("I Am. I Exist. I Belong.")
        expect(mantraForDay(1)).toBe("I Feel. I Flow. I Create.")
        expect(mantraForDay(0)).not.toMatch(/,/)
        expect(mantraForDay(1)).not.toMatch(/,/)
        expect(mantraForDay(3).toLowerCase()).toContain("unconditional")
        expect(mantraForDay(3)).toContain("\n")
    })

    it("fades to goodbye instead of overlapping opacity layers", () => {
        const src = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "components/chakras/BreathIntegrationScreen.tsx",
            ),
            "utf8",
        )
        expect(src).toContain("SanctuaryFieldLayer")
        expect(src).toContain("fadeOutAndComplete")
        expect(src).toContain("schedule(finish, 1100)")
        expect(src).toContain("timeoutsRef.current.forEach(clearTimeout)")
        const goodbye = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/GoodbyeModal.tsx"),
            "utf8",
        )
        expect(goodbye).toContain("Claim Your Chakra Card")
        expect(goodbye).toContain("GalleryOfGnosis?chakra=")
        expect(goodbye).not.toContain("GiftChakra")
        expect(goodbye).not.toContain("Open Your Gift")
        expect(goodbye).not.toContain("breathLayerOpacity")
        expect(goodbye).toContain("isVisible && stage === \"presence\"")
        expect(goodbye).not.toContain(": isVisible ?")
        expect(goodbye).toContain("if (!isVisibleRef.current) return")
        expect(goodbye).toContain("GIFT_REVEAL_DELAY_MS")
        expect(goodbye).toContain("giftOpacity")
    })

    it("teases tomorrow's chakra on the hub after each day", () => {
        expect(getTomorrowAwakeningCopy(0).heading).toContain("Sacral")
        expect(getTomorrowAwakeningCopy(0).message).toContain(
            "authentic expression",
        )
        expect(getTomorrowAwakeningCopy(1).heading).toContain("Solar Plexus")
        expect(getTomorrowAwakeningCopy(5).heading).toContain("Crown")
        expect(getTomorrowAwakeningCopy(6).heading).toContain("seven are awake")
        expect(getTomorrowAwakeningCopy(6).nextDayIndex).toBeNull()
        const hub = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/ChakraHub.tsx"),
            "utf8",
        )
        expect(hub).toContain("TomorrowAwakeningModal")
        expect(hub).toContain("useIsFocused")
        expect(hub).toContain("isHubFocused && completedChakra")
        expect(hub).toContain("tomorrowDayIndex == null")
    })

    it("removes the extra chakra from the Part IV button", () => {
        const src = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "components/chakras/RemembranceButton.tsx",
            ),
            "utf8",
        )
        expect(src).toContain("Reflection of Remembrance")
        expect(src).not.toContain("PART IV")
        expect(src).not.toContain("content.goodbye.chakraImage")
        expect(src).not.toContain('width: 72, height: 72')
        expect(src).toContain("CARD_HEIGHT = 88")
        expect(src).toContain("rgba(255,255,255,0.22)")
    })

    it("gives morning master meditation the Asha Speaks colorbar button", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/AudioRow.tsx"),
            "utf8",
        )
        expect(src).toContain("colorbar.png")
        expect(src).toContain("BackgroundOpacity")
        expect(src).toContain("FontAwesome")
        expect(src).toContain("shouldShowMasterMeditationWelcome")
    })

    it("sits the remembrance quiz on the day's sanctuary field", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/QuizScreen.tsx"),
            "utf8",
        )
        expect(src).toContain("SanctuaryFieldLayer")
        expect(src).toContain("Sit. Breathe. Choose what feels true.")
        expect(src).toContain("You remembered")
        expect(src).not.toContain("Journey Complete")
        expect(src).toContain("scoreRef.current")
        expect(src).toContain("recordQuizCompletion")
        expect(src).toContain("router.back()")
        expect(src).toContain("Return to this day")
        expect(src).toContain("goToChakraHubRoot")
        expect(src).toContain("ActionBar")
        expect(src).toContain("QuizNavChrome")
        expect(src).toContain("zIndex: 1000")
        expect(src).not.toContain("top: 8")
    })

    it("wires Home to ChakraHub with the next-day blessing", () => {
        const goodbye = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/GoodbyeModal.tsx"),
            "utf8",
        )
        expect(goodbye).toContain("queueTomorrowAwakening")
        expect(goodbye).toContain("goToChakraHubRoot")
        expect(goodbye).toContain("clearCompletedChakra")
        const template = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/ChakraTemplate.tsx"),
            "utf8",
        )
        expect(template).toContain("handleGoodbyeNavigateHome")
        expect(template).toContain("clearCompletedChakra")
        expect(template).toContain("<AudioRow")
        expect(template).toContain("goToChakraHubRoot")
    })
})
