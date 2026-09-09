/* eslint-env jest */
import * as fs from "fs"
import * as path from "path"
import {
    SAFE_HEADER_GAP,
    SAFE_INSET_TOP_FALLBACK,
    safeChromePadTop,
    safeOverlayTop,
} from "../constants/layout"

const root = path.join(__dirname, "..")

function readSrc(rel: string): string {
    return fs.readFileSync(path.join(root, rel), "utf8")
}

describe("safeOverlayTop", () => {
    it("clears the status bar when insets are missing", () => {
        expect(safeOverlayTop(0)).toBe(SAFE_INSET_TOP_FALLBACK + SAFE_HEADER_GAP)
        expect(safeOverlayTop(0)).toBe(52)
    })

    it("trusts a real inset and adds the shared gap", () => {
        expect(safeOverlayTop(20)).toBe(28)
        expect(safeOverlayTop(47)).toBe(55)
        expect(safeChromePadTop(20)).toBe(8)
        expect(safeChromePadTop(0)).toBe(52)
    })

    it("keeps overlay arrows on the shared helper", () => {
        const overlayFiles = [
            "components/ActionBar.tsx",
            "components/ActionBarAnimated.tsx",
            "components/BackArrow.tsx",
            "components/navigation/GlobalHomeButton.tsx",
            "components/navigation/ChakraHubHeader.tsx",
            "app/(chakras)/QuizScreen.tsx",
            "components/profile/ProfileSheet.tsx",
            "components/chakras/GoodbyeModal.tsx",
            "components/chakras/GraceOfThePresence.tsx",
            "components/chakras/RestingBlessing.tsx",
            "components/chakras/JourneySummaryGift.tsx",
            "components/chakras/SealOfTheInitiate.tsx",
            "components/chakras/CommitmentGate.tsx",
            "app/AudioPlayer.tsx",
            "components/audio/HeadsetListenReminder.tsx",
            "components/social/AnuaChatModal.tsx",
            "components/chakras/RevenueCatPaywall.tsx",
        ]
        for (const rel of overlayFiles) {
            expect(readSrc(rel)).toContain("safeOverlayTop")
        }
        expect(readSrc("app/(chakras)/AudioLibrary.tsx")).toContain("ActionBar")
        expect(readSrc("app/(chakras)/AudioLibrary.tsx")).not.toContain("top: 12")
        expect(readSrc("components/chakras/MusicRoomLibraryHeader.tsx")).toContain(
            "safeOverlayTop",
        )
        expect(readSrc("components/profile/ProfileSheet.tsx")).not.toContain(
            "paddingTop: Platform.OS === \"android\" ? 8 : 4",
        )
        expect(readSrc("components/ActionBar.tsx")).not.toContain(
            "Math.max(insets.top, 8) + 8",
        )
        expect(readSrc("components/social/AnuaChatModal.tsx")).not.toContain(
            'Platform.OS === "android" ? 18',
        )
    })
})
