/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { chakraContent } from '@/constants/chakras/content'
import { Chakra } from '@/types/chakras/Chakra'
import {
    formatHeroAffirmationText,
    HERO_AFFIRMATION_FONT_SIZE,
    HERO_AFFIRMATION_MAX_LINES,
} from '@/constants/heroAffirmation'
import { mantraForDay } from '@/constants/endOfDayPresenceCopy'

describe('hero affirmations', () => {
    it('uses Day 1 typography constants everywhere', () => {
        expect(HERO_AFFIRMATION_FONT_SIZE).toBe(36)
        expect(HERO_AFFIRMATION_MAX_LINES).toBe(2)

        const affirmation = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/AffirmationSection.tsx'),
            'utf8',
        )
        expect(affirmation).toContain('HERO_AFFIRMATION_FONT_SIZE')
        expect(affirmation).not.toContain('adjustsFontSizeToFit')
        expect(affirmation).not.toMatch(/numberOfLines=\{1\}/)

        const goodbye = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/GoodbyeModal.tsx'),
            'utf8',
        )
        expect(goodbye).toContain('HERO_AFFIRMATION_FONT_SIZE')
    })

    it('shows the full Day 4 heart affirmation on two lines', () => {
        const raw = chakraContent[Chakra.HEART].affirmationText
        expect(raw).toContain('\n')
        const formatted = formatHeroAffirmationText(raw)
        expect(formatted).toBe(
            'My heart is open;\nmy love is unconditional.',
        )
        expect(mantraForDay(3)).toBe(formatted)
    })

    it('preserves all seven hero affirmations without collapsing away text', () => {
        const days = [
            Chakra.ROOT,
            Chakra.SACRAL,
            Chakra.SOLAR_PLEXUS,
            Chakra.HEART,
            Chakra.THROAT,
            Chakra.THIRD_EYE,
            Chakra.CROWN,
        ]
        for (const chakra of days) {
            const text = formatHeroAffirmationText(
                chakraContent[chakra].affirmationText,
            )
            expect(text.length).toBeGreaterThan(12)
            expect(text).not.toMatch(/\.\.\.$/)
        }
    })
})

describe('vault keep-awake at root', () => {
    it('mounts VaultSyncKeepAwake in the root layout', () => {
        const layout = fs.readFileSync(
            path.join(__dirname, '..', 'app/_layout.tsx'),
            'utf8',
        )
        expect(layout).toContain('VaultSyncKeepAwake')
        expect(layout).toContain('subscribeSanctuaryVaultSync')
    })
})
