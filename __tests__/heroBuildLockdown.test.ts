/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { purchaseErrorForPaywallBanner } from '../utils/purchaseUserFacingError'

const root = path.join(__dirname, '..')

function readSrc(rel: string): string {
    return fs.readFileSync(path.join(root, rel), 'utf8')
}

describe('hero build lock-down', () => {
    it('does not crash the app when ElevenLabs keys are missing', () => {
        const src = readSrc('src/services/elevenlabs.ts')
        expect(src).not.toContain('ElevenLabs API key is not configured')
        expect(src).not.toContain('Anua Voice ID is not configured')
        expect(src).toContain('apiKey || ""')
        expect(src).toContain('if (!ELEVENLABS_API_KEY || !ANUA_VOICE_ID)')
    })

    it('recovers crashes to ChakraHub or Audio Library, never retired trial home', () => {
        const src = readSrc('utils/appErrorRecovery.ts')
        expect(src).not.toContain("const CHAKRA_HOME")
        expect(src).toContain("path.includes('ChakraHome')")
        expect(src).toContain("return CHAKRA_HUB")
        expect(src).toContain("return AUDIO_LIBRARY")

        const layout = readSrc('app/(chakras)/_layout.tsx')
        expect(layout).not.toContain('pathname.includes("AudioLibrary")')
    })

    it('closes Anua and Profile to the hub when the stack is empty', () => {
        expect(readSrc('utils/navigationHelpers.ts')).toContain(
            'export function closeStackToHub',
        )
        expect(readSrc('app/(chakras)/AnuaChat.tsx')).toContain('closeStackToHub')
        expect(readSrc('app/(chakras)/Profile.tsx')).toContain('closeStackToHub')
        expect(readSrc('app/(chakras)/ProfileMenu.tsx')).toContain(
            'closeStackToHub',
        )
    })

    it('keeps overlay close buttons below the punch-hole', () => {
        expect(readSrc('components/social/AnuaChatModal.tsx')).toContain(
            'safeOverlayTop(insets.top)',
        )
        expect(readSrc('components/social/AnuaChatModal.tsx')).not.toContain(
            'Platform.OS === "android" ? 18',
        )
        expect(readSrc('components/chakras/RevenueCatPaywall.tsx')).toContain(
            'safeOverlayTop(insets.top)',
        )
    })

    it('maps store billing-unavailable to a clear paywall message', () => {
        expect(
            purchaseErrorForPaywallBanner('Purchase was cancelled'),
        ).toBeNull()
        expect(
            purchaseErrorForPaywallBanner('BILLING_UNAVAILABLE'),
        ).toMatch(/aren't available/i)
        expect(readSrc('src/services/revenuecat.ts')).toContain(
            'BILLING_UNAVAILABLE',
        )
    })

    it('persists the full-player bookmark before an inline chime reset', () => {
        const hook = readSrc('hooks/useInlineTuningFork.ts')
        expect(hook).toContain('saveAudioBookmark')
        expect(hook).toContain('audioStore.reset()')
    })

    it('falls back when Anua voice-in cannot reach Gemini', () => {
        expect(readSrc('src/services/gemini.ts')).toContain(
            'operation: "askAnuaWithAudio"',
        )
        expect(readSrc('src/services/gemini.ts')).toContain(
            'getDefaultChakraResponse',
        )
    })
})
