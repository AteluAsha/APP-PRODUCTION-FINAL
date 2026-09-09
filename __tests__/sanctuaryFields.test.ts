/* eslint-env jest */
import * as fs from "fs"
import * as path from "path"

describe("sanctuary opening and goodbye fields", () => {
    it("softens the first-open gate into a sanctuary invitation", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/WellnessGate.tsx"),
            "utf8",
        )
        expect(src).toContain("Welcome to")
        expect(src).toContain("the Sanctuary of Soul")
        expect(src).toContain("Course:")
        expect(src).toContain("7 Divine Chakras.")
        expect(src).toContain("A Sacred map from Self to Soul.")
        expect(src).toContain("Reiki Level: Master Teacher Embodiment")
        expect(src).toContain("5,000+ years of Ancestral Wisdom and Cosmic Truths")
        expect(src).toContain("Divine Gnosis and Higher Awareness")
        expect(src).toContain("All held in gentleness.")
        expect(src).toContain("We love you all.")
        expect(src).not.toMatch(/>\s*Awakening\s*</)
        expect(src).toContain("Enter the Sanctuary")
        expect(src).toContain("WELLNESS_GATE_FIELD")
        expect(src).toContain("CenteredInviteScroll")
        expect(src).toContain("styles.cta")
        expect(src).not.toContain("styles.footer")
        expect(src).toContain("useWindowDimensions")
        expect(src).not.toContain("SoulSchool_HERO_Logo")
        expect(src).not.toContain("scrollEnabled={false}")
        expect(src).not.toContain("SCROLL_BREATHING_BOTTOM_PADDING")
        expect(src).not.toContain("SafeAreaView")
        expect(src).not.toContain("This is not an app")
        expect(src).not.toMatch(/play with/)
        expect(src).not.toContain("Start the Master Level Teachings")
    })

    it("centers invite cards when they fit, instead of pinning them low", () => {
        const center = fs.readFileSync(
            path.join(__dirname, "..", "components/CenteredInviteScroll.tsx"),
            "utf8",
        )
        expect(center).toContain("fits ? 'center' : 'flex-start'")
        expect(center).toContain("setBodyH")
        const grace = [
            "components/chakras/GraceOfThePresence.tsx",
            "components/chakras/RestingBlessing.tsx",
            "components/chakras/SealOfTheInitiate.tsx",
            "components/chakras/JourneySummaryGift.tsx",
        ]
        for (const rel of grace) {
            const src = fs.readFileSync(path.join(__dirname, "..", rel), "utf8")
            expect(src).toContain("CenteredInviteScroll")
            expect(src).not.toContain("<ScrollView")
        }
    })

    it("maps goodbye days 1–7 from earth through cosmos", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "constants/sanctuaryFields.ts"),
            "utf8",
        )
        expect(src).toContain("goodbye-earth-root.jpg")
        expect(src).toContain("goodbye-water-sacral.jpg")
        expect(src).toContain("goodbye-fire-solar.jpg")
        expect(src).toContain("goodbye-air-heart.jpg")
        expect(src).toContain("goodbye-ether-throat.jpg")
        expect(src).toContain("goodbye-light-thirdeye.jpg")
        expect(src).toContain("goodbye-oneness-crown.jpg")
        expect(src).toContain("getGoodbyeField")
        expect(src).toContain("HUB_COSMIC_FIELD")
        expect(src).toContain("hub-cosmic-field.png")
    })

    it("sits a quiet looping cosmic field behind ChakraHub", () => {
        const hub = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/ChakraHub.tsx"),
            "utf8",
        )
        expect(hub).toContain("HubCosmicField")
        expect(hub).toContain("HubCosmicLights")
        const field = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "components/chakras/HubCosmicField.tsx",
            ),
            "utf8",
        )
        expect(field).toContain("backgroundColor: '#000000'")
        expect(field).toContain("withRepeat")
        expect(field).toContain("Easing.linear")
        expect(field).toContain("SlowStar")
        expect(field).toContain("SideSwirl")
        expect(field).toContain("HubCosmicLights")
        expect(field).toContain("MASTER_LOOP_MS")
        expect(field).toContain("shimmerPeak")
        expect(field).toContain("StyleSheet.absoluteFillObject")
        expect(field).not.toContain("HUB_COSMIC_FIELD")
        expect(field).not.toContain("SoulSwirl")
        expect(hub).toContain("backgroundColor: 'transparent'")
    })

    it("first chakra tap opens DayPresence until they say I Am Present", () => {
        const hub = fs.readFileSync(
            path.join(__dirname, "..", "app/(chakras)/ChakraHub.tsx"),
            "utf8",
        )
        expect(hub).toContain("openChakraDay")
        const open = fs.readFileSync(
            path.join(__dirname, "..", "utils/openChakraDay.ts"),
            "utf8",
        )
        expect(open).toContain("nextChakraOpenPath")
        expect(open).toContain("markChakraGrounded")
        const routes = fs.readFileSync(
            path.join(__dirname, "..", "utils/chakraDayRoute.ts"),
            "utf8",
        )
        expect(routes).toContain("DayPresence")
        const copy = fs.readFileSync(
            path.join(__dirname, "..", "constants/dayPresenceCopy.ts"),
            "utf8",
        )
        expect(copy).toContain("Take this moment to be with nature")
        expect(copy).toContain("Today is about letting your body listen.")
        expect(copy).toContain("Breathe in and exhale.")
        expect(copy).toContain("Get your earphones and just be.")
        expect(copy).toContain("I Am Present")
        expect(copy).toContain("Take this moment with the water.")
        expect(copy).toContain("Take this moment in the vastness.")
    })

    it("goodbye screens sit on the day's field", () => {
        const src = fs.readFileSync(
            path.join(__dirname, "..", "components/chakras/GoodbyeModal.tsx"),
            "utf8",
        )
        expect(src).toContain("getGoodbyeField")
        expect(src).toContain("StyleSheet.absoluteFill")
        expect(src).toContain("Claim Your Chakra Card")
    })
})
