import fs from 'fs'
import path from 'path'

describe('appErrorRecovery', () => {
    it('defines safe recovery routes for course, library, and hub', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'utils/appErrorRecovery.ts'),
            'utf8',
        )
        expect(src).toContain('getSafeRecoveryRoute')
        expect(src).toContain('recoverFromAppError')
        expect(src).toContain('playerReturnPath')
        expect(src).toContain('ChakraHub')
        expect(src).not.toContain("const CHAKRA_HOME")
        expect(src).toContain('AudioLibrary')
        expect(src).toContain('silenceAllAudio')
        expect(src).toContain('pinRecoveryRoute')
        expect(src).not.toContain('goToChakraHubRoot')
    })

    it('keeps navigator mounted via overlay + screen boundary', () => {
        const layout = fs.readFileSync(
            path.join(__dirname, '..', 'app/_layout.tsx'),
            'utf8',
        )
        expect(layout).toContain('AppCrashRecoveryOverlay')
        expect(layout).not.toContain('<ErrorBoundary>')

        const overlay = fs.readFileSync(
            path.join(__dirname, '..', 'components/AppCrashRecoveryOverlay.tsx'),
            'utf8',
        )
        expect(overlay).toContain('recoverFromAppError')
        expect(overlay).toContain('hardwareBackPress')

        const boundary = fs.readFileSync(
            path.join(__dirname, '..', 'components/ScreenCrashBoundary.tsx'),
            'utf8',
        )
        expect(boundary).toContain('useAppCrashStore')
    })
})
