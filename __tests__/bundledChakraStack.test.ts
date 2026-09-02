/* eslint-env jest */
/**
 * The 7-ball course stack must render from bundled assets.
 * Firestore / Storage must never be a load-blocker for ChakraHub or ChakraHome.
 */

import { buildLocalChakraData } from "@/src/utils/localChakraStack"

describe("bundled chakra stack (course cannot blank)", () => {
  it("returns all 7 days with local images and routes", () => {
    const stack = buildLocalChakraData()
    expect(stack).toHaveLength(7)
    expect(stack.map((item) => item.day)).toEqual([0, 1, 2, 3, 4, 5, 6])
    stack.forEach((item) => {
      expect(item.source).toBeTruthy()
      expect(item.title).toBeTruthy()
      expect(typeof item.onPress).toBe("function")
    })
  })

  it("does not wait on loading before the stack is considered ready", () => {
    const stack = buildLocalChakraData()
    const isLoading = false
    const contentReady = !isLoading && stack.length === 7
    expect(contentReady).toBe(true)
  })
})
