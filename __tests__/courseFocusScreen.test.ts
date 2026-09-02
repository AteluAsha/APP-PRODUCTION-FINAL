/* eslint-env jest */
import { isCourseFocusScreen, isChakraHubPath } from "../utils/courseFocusScreen"

describe("course focus screens", () => {
    it("treats chakra day pages as focus screens", () => {
        expect(isCourseFocusScreen("/(chakras)/root")).toBe(true)
        expect(isCourseFocusScreen("/root", ["(chakras)", "root"])).toBe(true)
        expect(isCourseFocusScreen("/(chakras)/SoundBath")).toBe(true)
        expect(isCourseFocusScreen("/(chakras)/HeadToHeart")).toBe(true)
        expect(isCourseFocusScreen("/(chakras)/IntegrationPractice")).toBe(true)
    })

    it("does not treat the hub as a course focus screen", () => {
        expect(isCourseFocusScreen("/(chakras)/ChakraHub")).toBe(false)
        expect(isChakraHubPath("/(chakras)/ChakraHub")).toBe(true)
    })
})
