import {
    bestResumeCandidateMs,
    bookmarkPositionToPersist,
    clampSeekMs,
    commitPlaybackDurationMs,
    isPlaybackPositionRegression,
    isPlaybackComplete,
    preferLongerDurationMs,
    resolvePlaybackDurationMs,
    resumePositionMs,
    shouldHoldSeekTarget,
    sliderDurationMs,
} from "@/src/utils/playerControls"

describe("player seek / duration", () => {
    it("uses the loaded file length for the slider, not a longer catalog duration", () => {
        expect(sliderDurationMs(1_800_000, 1_800_000)).toBe(1_800_000)
        expect(sliderDurationMs(0, 1_800_000)).toBe(1_800_000)
        expect(sliderDurationMs(1_800_000, 1_800_000)).toBe(1_800_000)
    })

    it("treats a stub few-second native duration as catalog so the soldier can jump", () => {
        expect(sliderDurationMs(3_000, 1_800_000)).toBe(1_800_000)
    })

    it("uses the remaster file length when it is longer than catalog", () => {
        expect(sliderDurationMs(960_000, 720_000)).toBe(960_000)
        expect(
            resolvePlaybackDurationMs({
                fileDurationMs: 960_000,
                catalogDurationMs: 720_000,
            }),
        ).toBe(960_000)
    })

    it("does not shrink a known remaster length back to a short catalog or stub", () => {
        expect(preferLongerDurationMs(960_000, 720_000)).toBe(960_000)
        expect(
            commitPlaybackDurationMs({
                currentMs: 960_000,
                nextMs: 720_000,
                fileDurationMs: 3_000,
                catalogDurationMs: 720_000,
            }),
        ).toBe(960_000)
        expect(
            commitPlaybackDurationMs({
                currentMs: 720_000,
                nextMs: 960_000,
                fileDurationMs: 960_000,
                catalogDurationMs: 720_000,
            }),
        ).toBe(960_000)
    })

    it("lets a credible shorter file replace a stale longer bar", () => {
        expect(
            commitPlaybackDurationMs({
                currentMs: 3_900_000,
                nextMs: 20_400,
                fileDurationMs: 20_400,
                catalogDurationMs: 20_400,
            }),
        ).toBe(20_400)
    })

    it("clamps seeks to the real file so the thumb cannot jump past the end", () => {
        expect(clampSeekMs(900_000, 3_000)).toBe(2_750)
        expect(clampSeekMs(1_200, 1_800_000)).toBe(1_200)
        expect(clampSeekMs(-10, 1_800_000)).toBe(0)
        expect(clampSeekMs(960_000, 0)).toBe(960_000)
    })

    it("extends duration when bookmark is past catalog metadata", () => {
        expect(
            resolvePlaybackDurationMs({
                catalogDurationMs: 720_000,
                bookmarkMs: 960_000,
            }),
        ).toBe(965_000)
        expect(resumePositionMs(960_000, 720_000)).toBe(960_000)
        expect(resumePositionMs(660_000, 720_000)).toBe(660_000)
    })

    it("starts a finished leftover bookmark at 0, and keeps a real mid-track place", () => {
        expect(resumePositionMs(549_000, 549_000)).toBe(0)
        expect(resumePositionMs(547_000, 549_000)).toBe(0)
        expect(resumePositionMs(120_000, 549_000)).toBe(120_000)
        expect(resumePositionMs(500_000, 549_000)).toBe(500_000)
        expect(resumePositionMs(undefined, 549_000)).toBe(0)
        expect(isPlaybackComplete(549_000, 549_000)).toBe(true)
        expect(isPlaybackComplete(500_000, 549_000)).toBe(false)
    })

    it("restarts a finished remaster and keeps a mid-remaster place", () => {
        expect(resumePositionMs(960_000, 720_000, 960_000)).toBe(0)
        expect(resumePositionMs(800_000, 720_000, 960_000)).toBe(800_000)
        expect(isPlaybackComplete(960_000, 960_000)).toBe(true)
        expect(isPlaybackComplete(800_000, 960_000)).toBe(false)
        expect(isPlaybackComplete(960_000, 720_000)).toBe(false)
    })

    it("holds the slider on the jump if native reports 0 after the seek window", () => {
        expect(
            shouldHoldSeekTarget({
                seekingUntil: 2_000,
                now: 1_000,
                statusPositionMs: 80,
                seekTargetMs: 915_000,
            }),
        ).toBe(true)
        expect(
            shouldHoldSeekTarget({
                seekingUntil: 500,
                now: 3_000,
                statusPositionMs: 80,
                seekTargetMs: 915_000,
            }),
        ).toBe(true)
        expect(
            shouldHoldSeekTarget({
                seekingUntil: 500,
                now: 3_000,
                statusPositionMs: 915_000,
                seekTargetMs: 915_000,
            }),
        ).toBe(false)
    })

    it("does not treat a native 0–200ms reopen blip as the real place", () => {
        expect(isPlaybackPositionRegression(80, 120_000, false)).toBe(true)
        expect(isPlaybackPositionRegression(120_000, 120_000, false)).toBe(false)
        expect(isPlaybackPositionRegression(0, 120_000, true)).toBe(false)
        expect(isPlaybackPositionRegression(0, 800, false)).toBe(false)
    })

    it("prefers a saved bookmark over a native store blip", () => {
        expect(
            bestResumeCandidateMs({
                storeMs: 80,
                bookmarkMs: 960_000,
                lastPlaybackMs: 0,
            }),
        ).toBe(960_000)
        expect(
            bestResumeCandidateMs({
                storeMs: 2_000,
                bookmarkMs: 120_000,
                lastPlaybackMs: 118_000,
            }),
        ).toBe(120_000)
    })

    it("persists the last real place, not a native 0 blip, on close", () => {
        expect(
            bookmarkPositionToPersist({
                lastPlaybackMs: 120_000,
                storeMs: 0,
                seekTargetMs: 0,
            }),
        ).toBe(120_000)
        expect(
            bookmarkPositionToPersist({
                lastPlaybackMs: 80_000,
                storeMs: 82_000,
                seekTargetMs: 240_000,
            }),
        ).toBe(240_000)
    })
})
