/* eslint-env jest */
import {
    delayUntilPeriodicPaywallMs,
    PERIODIC_PAYWALL_FIRST_SHOW_MS,
    canShowAutomatedPaywall,
} from "../src/utils/periodicPaywallTiming"

describe("periodic paywall first-open delay", () => {
    it("waits a full hour after first open before the first show", () => {
        const firstOpen = 1_000_000
        expect(delayUntilPeriodicPaywallMs(firstOpen, firstOpen, 0)).toBe(
            PERIODIC_PAYWALL_FIRST_SHOW_MS,
        )
        expect(PERIODIC_PAYWALL_FIRST_SHOW_MS).toBe(60 * 60 * 1000)
    })

    it("does not pop immediately if the seeker leaves and returns before an hour", () => {
        const firstOpen = 1_000_000
        const twentyMinutesLater = firstOpen + 20 * 60 * 1000
        expect(
            delayUntilPeriodicPaywallMs(twentyMinutesLater, firstOpen, 0),
        ).toBe(40 * 60 * 1000)
    })

    it("is due once the hour has elapsed and it has never shown", () => {
        const firstOpen = 1_000_000
        const afterHour = firstOpen + PERIODIC_PAYWALL_FIRST_SHOW_MS + 500
        expect(delayUntilPeriodicPaywallMs(afterHour, firstOpen, 0)).toBe(0)
    })
})

describe("automated paywall location gate", () => {
    it("allows Chakra Hub when focused and not in a meditation player", () => {
        expect(
            canShowAutomatedPaywall({
                pathname: "/(chakras)/ChakraHub",
                audioOrigin: null,
                isHubFocused: true,
            }),
        ).toBe(true)
    })

    it("never allows Audio Player, Sound Bath, or a full-player meditation", () => {
        expect(
            canShowAutomatedPaywall({
                pathname: "/AudioPlayer",
                isHubFocused: true,
            }),
        ).toBe(false)
        expect(
            canShowAutomatedPaywall({
                pathname: "/(chakras)/SoundBath",
                isHubFocused: true,
            }),
        ).toBe(false)
        expect(
            canShowAutomatedPaywall({
                pathname: "/(chakras)/ChakraHub",
                audioOrigin: "full-player",
                isHubFocused: true,
            }),
        ).toBe(false)
        expect(
            canShowAutomatedPaywall({
                pathname: "/(chakras)/ChakraHub",
                isHubFocused: false,
            }),
        ).toBe(false)
        expect(
            canShowAutomatedPaywall({
                pathname: "/(chakras)/ChakraHub",
                audioOrigin: "music-room",
                isHubFocused: true,
            }),
        ).toBe(false)
        expect(
            canShowAutomatedPaywall({
                pathname: "/(chakras)/ChakraHub",
                audioOrigin: "other",
                isHubFocused: true,
            }),
        ).toBe(false)
    })
})
