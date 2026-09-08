/* eslint-env jest */
import * as fs from 'fs'
import * as path from 'path'
import { Chakra } from '../types/chakras/Chakra'
import {
    FREQUENCY_HEALING_COPY,
    getAncestralNowLanding,
    getBridgeLawLabel,
    BRIDGE_EXPLAINER,
} from '../constants/chakras/ancestralBridgeContent'
import { useAncestralBridgeStore } from '../hooks/useAncestralBridgeStore'
import { chakraContent } from '../constants/chakras/content'

const ALL_CHAKRAS = Object.values(Chakra)
const read = (rel: string) =>
    fs.readFileSync(path.join(__dirname, '..', rel), 'utf8')

describe('ancestral bridge course move', () => {
    beforeEach(() => {
        useAncestralBridgeStore.getState().resetForTesting()
    })

    it('skips the law chamber only after the Master Key is received', () => {
        const api = useAncestralBridgeStore
        expect(api.getState().hasOpenedAshaPlayer(Chakra.ROOT)).toBe(false)
        api.getState().markAshaPlayerOpened(Chakra.ROOT)
        api.getState().markAwaitingMasterKey(Chakra.ROOT)
        expect(api.getState().awaitingMasterKey).toBe(Chakra.ROOT)
        api.getState().markMasterKeyReceived(Chakra.ROOT)
        expect(api.getState().hasReceivedMasterKey(Chakra.ROOT)).toBe(true)
        expect(api.getState().awaitingMasterKey).toBeNull()
        expect(api.getState().hasOpenedAshaPlayer(Chakra.ROOT)).toBe(true)
        expect(api.getState().hasOpenedAshaPlayer(Chakra.HEART)).toBe(false)
    })

    it('keeps every ancestral law on its own chamber path', () => {
        expect(`/(chakras)/HeadToHeart?chakra=${Chakra.THROAT}`).toBe(
            '/(chakras)/HeadToHeart?chakra=throat',
        )
        expect(getBridgeLawLabel(Chakra.ROOT)).toContain('SEVENTH')
        expect(getBridgeLawLabel(Chakra.ROOT)).toContain('GENERATION')
        for (const chakra of ALL_CHAKRAS) {
            const now = getAncestralNowLanding(chakra)
            expect(now.title.length).toBeGreaterThan(3)
            expect(now.subline.length).toBeGreaterThan(8)
            expect(now.intention).toBeTruthy()
            expect(now.action).toBeTruthy()
            expect(now.reality).toBeTruthy()
            expect(FREQUENCY_HEALING_COPY[chakra].description).toMatch(/\d{3} Hz/)
        }
        expect(BRIDGE_EXPLAINER.toLowerCase()).toContain('integration')
        expect(BRIDGE_EXPLAINER.toLowerCase()).toContain('bridge')
    })

    it('moves ancestral gnosis out of Part II and onto The Bridge', () => {
        const part2 = read('components/chakras/Part2Section.tsx')
        expect(part2).toContain('Frequency Healing')
        expect(part2).toContain('FREQUENCY_HEALING_COPY')
        expect(part2).toContain('SoundBath')
        expect(part2).not.toContain('Ancestral Gnosis')
        expect(part2).not.toContain('HeadToHeart')
        expect(part2).not.toContain('Path 2')

        const template = read('components/chakras/ChakraTemplate.tsx')
        expect(template).toContain('Part4BridgeSection')
        expect(template).toContain('Part3Section')
        expect(template).toContain('isIntroAudio={true}')
        expect(template.indexOf('isIntroAudio={true}')).toBeLessThan(
            template.indexOf('<Part3Section'),
        )
        expect(template).not.toContain('title="Reflection of Remembrance"')

        const part3 = read('components/chakras/Part3Section.tsx')
        expect(part3).toContain('ChakraIdentityCard')
        expect(part3).toContain('YogaPoseButton')
        expect(part3).not.toContain('meditation')
        expect(part3).not.toContain('AudioRow')

        const part4 = read('components/chakras/Part4BridgeSection.tsx')
        expect(part4).toContain('The Bridge')
        expect(part4).toContain('AshaSpeaksButton')
        expect(part4).toContain('openAshaSpeaks')
        expect(part4).toContain('RemembranceButton')
        expect(part4).toContain('BRIDGE_EXPLAINER')
    })

    it('does not reuse course page imagery in the ancestral chamber', () => {
        const chamber = read('app/(chakras)/HeadToHeart.tsx')
        expect(chamber).toContain('AncestralFieldLayer')
        expect(chamber).toContain('LISTEN_WITH_ASHA_LABEL')
        expect(chamber).toContain('MASTER_KEY_LABEL')
        expect(chamber).toContain('playAshaTrack')
        expect(chamber).toContain('markAwaitingMasterKey')
        expect(chamber).not.toContain('HeaderBackground')
        expect(chamber).not.toContain('ParallaxScrollView')
        expect(chamber).not.toContain('headerBackground')
        expect(chamber).not.toContain('part2bg')
        expect(chamber).not.toContain('AudioRow')
        expect(chamber).not.toContain('SanctuaryFieldLayer')

        const field = read('components/chakras/AncestralFieldLayer.tsx')
        expect(field).not.toContain('require(')
        expect(field).toContain('rgba(232, 201, 140')
    })

    it('opens Audio Player with router.push and never a transparent modal', () => {
        const open = read('utils/openAshaSpeaks.ts')
        expect(open).toContain("router.push")
        expect(open).toContain('playSanctuaryTrack')
        expect(open).toContain('hasReceivedMasterKey')
        expect(open).not.toContain(
            'if (store.hasOpenedAshaPlayer(chakra))',
        )
        const asha = read('components/chakras/AshaSpeaksButton.tsx')
        expect(asha).not.toContain('Modal')
        expect(asha).toContain('ASHA_SPEAKS_TITLE')
        expect(asha).toContain('#F3D59A')
        expect(asha).not.toContain('colorbar.png')
        const player = read('utils/sanctuaryPlayback.ts')
        expect(player).toContain("router.push('/AudioPlayer')")
        for (const chakra of ALL_CHAKRAS) {
            expect(chakraContent[chakra].headtoheart.masterKey.text.length).toBeGreaterThan(
                40,
            )
        }
    })
})
