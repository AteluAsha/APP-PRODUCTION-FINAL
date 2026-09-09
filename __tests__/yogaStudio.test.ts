/* eslint-env jest */
import * as fs from 'fs'
import * as path from 'path'
import { Chakra } from '../types/chakras/Chakra'
import { YOGA_STUDIO, YOGA_STUDIO_KICKER, BODY_HEALING_HEADING } from '../constants/yogaStudio'
import { chakraContent } from '../constants/chakras/content'
import { getIntegrationMomentContent } from '../constants/chakras/integrationMomentContent'
import { getChakraIndex } from '../utils/chakraMapping'

describe('yoga studio body healing pages', () => {
    it('gives every chakra a pose figure and original course copy', () => {
        const chakras = Object.values(Chakra)
        expect(chakras).toHaveLength(7)
        for (const chakra of chakras) {
            const page = YOGA_STUDIO[chakra]
            const yoga = chakraContent[chakra].yoga
            const integration = getIntegrationMomentContent(getChakraIndex(chakra))
            expect(page.poseName.length).toBeGreaterThan(3)
            expect(page.figure).toBeTruthy()
            expect(yoga.essence.length).toBeGreaterThan(3)
            expect(yoga.body.length).toBeGreaterThan(20)
            expect(yoga.somaticCue.length).toBeGreaterThan(10)
            expect(integration?.title.length).toBeGreaterThan(3)
            expect(integration?.body.length).toBeGreaterThan(80)
        }
        expect(YOGA_STUDIO[Chakra.ROOT].poseName).toBe('Mountain Pose')
        expect(YOGA_STUDIO[Chakra.SACRAL].poseName).toBe('Seated Circles')
        expect(YOGA_STUDIO[Chakra.SOLAR_PLEXUS].poseName).toBe(
            'Seated Spinal Twist',
        )
        expect(YOGA_STUDIO[Chakra.HEART].poseName).toBe('Supported Fish')
        expect(YOGA_STUDIO[Chakra.THROAT].poseName).toBe('Seated Neck Release')
        expect(YOGA_STUDIO[Chakra.THIRD_EYE].poseName).toBe("Child's Pose")
        expect(YOGA_STUDIO[Chakra.CROWN].poseName).toBe('Corpse Pose')
        expect(YOGA_STUDIO_KICKER).toBe('Body Healing')
        expect(BODY_HEALING_HEADING[Chakra.ROOT]).toBe(
            'Grounding Into the Earth Body',
        )
        expect(BODY_HEALING_HEADING[Chakra.SACRAL]).toBe(
            'Flowing Into Expression',
        )
        expect(BODY_HEALING_HEADING[Chakra.SOLAR_PLEXUS]).toBe(
            'Channeling The Sun Fire',
        )
        expect(BODY_HEALING_HEADING[Chakra.HEART]).toBe(
            'Opening The Heart Body',
        )
        expect(BODY_HEALING_HEADING[Chakra.THROAT]).toBe('Releasing Control')
        expect(BODY_HEALING_HEADING[Chakra.THIRD_EYE]).toBe(
            'Witness Our Duality',
        )
        expect(BODY_HEALING_HEADING[Chakra.CROWN]).toBe(
            'Opening to All That Is',
        )
        expect(new Set(Object.values(BODY_HEALING_HEADING)).size).toBe(7)
    })

    it('opens as one dark studio scroll with original yoga and integration wisdom', () => {
        const page = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/IntegrationPractice.tsx'),
            'utf8',
        )
        expect(page).toContain('StatusBar')
        expect(page).toContain('#0C0A08')
        expect(page).not.toContain('#FBF7F2')
        expect(page).not.toContain('IntegrationMomentButton')
        expect(page).not.toContain('IntegrationMomentModal')
        const studio = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/YogaSection.tsx'),
            'utf8',
        )
        expect(studio).toContain('chakraContent')
        expect(studio).toContain('getIntegrationMomentContent')
        expect(studio).toContain('The Essence')
        expect(studio).toContain('Somatic Cue')
        expect(studio).toContain('Wisdom for the day')
        expect(studio).toContain('wisdomBox')
        expect(studio).toContain('yoga.essence')
        expect(studio).toContain('integration.title')
        const button = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/YogaPoseButton.tsx',
            ),
            'utf8',
        )
        expect(button).toContain('BODY HEALING')
        expect(button).toContain('Open the studio')
        expect(button).toContain('ctaPill')
        const identity = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/ChakraIdentityCard.tsx',
            ),
            'utf8',
        )
        expect(identity).toContain('BODY_HEALING_HEADING')
        expect(identity).toContain('HERO_AFFIRMATION_FONT_SIZE')
        expect(identity).not.toContain('AffirmationSection')
        expect(identity).not.toMatch(/>\s*Affirmation\s*</)
        expect(identity).not.toContain('chakraContent')
        expect(identity).not.toContain('.affirmationText')
        expect(identity).not.toContain('SoftChakraBall')
        expect(identity).not.toContain('textLine1')
        const part3 = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/Part3Section.tsx'),
            'utf8',
        )
        expect(part3).not.toContain('width: 64')
    })
})
