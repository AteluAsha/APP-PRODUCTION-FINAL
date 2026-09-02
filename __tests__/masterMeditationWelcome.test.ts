/* eslint-env jest */
import fs from "fs"
import path from "path"
import {
    MASTER_MEDITATION_WELCOME,
    ROOT_MASTER_MEDITATION_AUDIO_ID,
    shouldShowMasterMeditationWelcome,
} from "../constants/masterMeditationWelcome"

describe("Master Meditation first-play welcome", () => {
    it("is only offered for Root Master Meditation, and only once", () => {
        expect(ROOT_MASTER_MEDITATION_AUDIO_ID).toBe("embodiment_root")
        expect(
            shouldShowMasterMeditationWelcome("embodiment_root", false),
        ).toBe(true)
        expect(
            shouldShowMasterMeditationWelcome("embodiment_root", true),
        ).toBe(false)
        expect(
            shouldShowMasterMeditationWelcome("embodiment_sacral", false),
        ).toBe(false)
        expect(
            shouldShowMasterMeditationWelcome("embodiment_thirdeye", false),
        ).toBe(false)
        const audioIdSrc = fs.readFileSync(
            path.join(__dirname, "..", "hooks/useEmbodimentAudio.ts"),
            "utf8",
        )
        expect(audioIdSrc).toContain("embodiment_${chakra}")
    })

    it("keeps the healing copy", () => {
        const body = MASTER_MEDITATION_WELCOME.paragraphs.join(" ")
        expect(body).toContain("master tools of this course")
        expect(body).toContain("Plan to listen to one chakra each day")
        expect(body).toContain("beginning on a Monday")
        expect(body).toContain("Sit in meditation, close your eyes, and let it flow.")
        expect(MASTER_MEDITATION_WELCOME.paragraphs).toHaveLength(3)
        expect(MASTER_MEDITATION_WELCOME.cta).toBe("I am ready")
    })

    it("persists the seen flag with first-launch storage", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "hooks/useFirstLaunchStore.ts"),
            "utf8",
        )
        expect(src).toContain("hasSeenMasterMeditationWelcome")
        expect(src).toContain("markMasterMeditationWelcomeSeen")
        expect(src).toContain("hasSeenMasterMeditationWelcome: state.hasSeenMasterMeditationWelcome")
        expect(src).toMatch(
            /resetForTesting:[\s\S]*hasSeenMasterMeditationWelcome: false/,
        )
    })

    it("AudioRow uses course-only playback, not Audio Library or generic vault", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/AudioRow.tsx"),
            "utf8",
        )
        expect(src).toContain("playSanctuaryTrack")
        expect(src).toContain("prepareSanctuaryTrack")
        expect(src).not.toContain("openMusicRoomAtIndex")
        expect(src).toContain("VaultDownloadLine")
    })

    it("gates Root AudioRow until the seeker confirms, then plays", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/AudioRow.tsx"),
            "utf8",
        )
        expect(src).toContain("shouldShowMasterMeditationWelcome")
        expect(src).toContain("MasterMeditationWelcomeModal")
        expect(src).toContain("setWelcomeVisible(true)")
        expect(src).toContain("markMasterMeditationWelcomeSeen")
        expect(src).toContain("prepareSanctuaryTrack")
        expect(src).toMatch(
            /if \(offerWelcome\)[\s\S]*return[\s\S]*startPlayback\(\)/,
        )
        expect(src).toContain("finishWelcome")
        expect(src).not.toMatch(/if \(!isReady[\s\S]*finishWelcome/)
        expect(src).toContain("minHeight: 108")
        expect(src).toContain('width: "92%"')
    })
})
