/* eslint-env jest */
import fs from 'fs'
import path from 'path'

describe('soft chakra ball on field backgrounds', () => {
    const helper = fs.readFileSync(
        path.join(__dirname, '..', 'components/chakras/SoftChakraBall.tsx'),
        'utf8',
    )

    it('keeps the pulse in-flow so title and author sit below the ball', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/PulsingChakraBall.tsx'),
            'utf8',
        )
        expect(src).toContain('PULSE_WELL')
        expect(src).toContain('EMBODIMENT_PULSE_HALF_DURATION_MS')
        expect(src).toContain('GENTLE_PULSE_DURATION')
        expect(src).toContain('cancelAnimation')
        expect(src).not.toContain('position: "absolute"')
        const player = fs.readFileSync(
            path.join(__dirname, '..', 'app/AudioPlayer.tsx'),
            'utf8',
        )
        expect(player).toContain('PlayerTrackFace')
        expect(player).toContain('paddingBottom: 168')
        expect(player).toContain('crystal_bowl')
        expect(player).toContain('embodimentPulse')
    })

    it('clips the square PNG to a circle so black corners cannot show', () => {
        expect(helper).toContain('borderRadius: radius')
        expect(helper).toContain("overflow: 'hidden'")
    })

    it('is used on the field-backed player, goodbye, and course header', () => {
        const files = [
            'components/chakras/PulsingChakraBall.tsx',
            'components/chakras/GoodbyeModal.tsx',
            'components/chakras/HeaderBackground.tsx',
            'components/chakras/BreathIntegrationScreen.tsx',
            'components/chakras/ChakraTemplate.tsx',
            'app/AudioPlayer.tsx',
            'app/(chakras)/QuizScreen.tsx',
        ]
        for (const file of files) {
            const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
            expect(src).toContain('SoftChakraBall')
        }
    })
})
