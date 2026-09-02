/* eslint-env jest */
import fs from "fs"
import path from "path"
import { Chakra } from "../types/chakras/Chakra"
import { galleryFocusIndex, parseChakraSlug } from "../utils/chakraMapping"

describe("gallery focus from View in Gallery", () => {
  const unlocked = [Chakra.ROOT, Chakra.SACRAL, Chakra.HEART]

  it("opens the exact gifted card", () => {
    expect(galleryFocusIndex(unlocked, Chakra.SACRAL)).toBe(1)
    expect(galleryFocusIndex(unlocked, Chakra.HEART)).toBe(2)
    expect(galleryFocusIndex(unlocked, Chakra.ROOT)).toBe(0)
  })

  it("falls back to the latest card when the slug is missing", () => {
    expect(galleryFocusIndex(unlocked, null)).toBe(2)
  })

  it("parses route slugs used by GiftChakra", () => {
    expect(parseChakraSlug("thirdeye")).toBe(Chakra.THIRD_EYE)
    expect(parseChakraSlug("solar")).toBe(Chakra.SOLAR_PLEXUS)
    expect(parseChakraSlug("not-a-chakra")).toBeNull()
  })

  it("pops gallery history when it can, else lands on ChakraHub", () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "app/(chakras)/GalleryOfGnosis.tsx"),
      "utf8",
    )
    expect(src).toContain("router.canGoBack()")
    expect(src).toContain("router.back()")
    expect(src).toContain("goToChakraHubRoot()")
  })
})
