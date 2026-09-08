/* eslint-env jest */
import { Chakra } from '../types/chakras/Chakra'
import {
    shouldQueueBridgeCue,
    chakraFromEmbodimentAudioId,
} from '../utils/bridgeCueLogic'
import {
    ASHA_SPEAKS_TITLE,
    ASHA_SPEAKS_SUBLINE,
    BRIDGE_CUE_TEACHING_DAY_INDEXES,
    BRIDGE_CUE_COPY,
} from '../constants/chakras/ancestralBridgeContent'
import * as fs from 'fs'
import * as path from 'path'

const read = (rel: string) =>
    fs.readFileSync(path.join(__dirname, '..', rel), 'utf8')

describe('bridge cue after master meditation', () => {
    const base = {
        isIntroAudio: true,
        audioId: 'embodiment_root',
        positionMs: 2_200_000,
        durationMs: 2_684_000,
        alreadyOpenedAsha: false,
        alreadyOffered: false,
        returnPath: '/(chakras)/root',
    }

    it('maps embodiment ids to chakras', () => {
        expect(chakraFromEmbodimentAudioId('embodiment_root')).toBe(Chakra.ROOT)
        expect(chakraFromEmbodimentAudioId('embodiment_solar')).toBe(
            Chakra.SOLAR_PLEXUS,
        )
        expect(chakraFromEmbodimentAudioId('head_to_heart_root_x')).toBeNull()
    })

    it('offers only after most of Master Meditation on days 1–3', () => {
        expect(BRIDGE_CUE_TEACHING_DAY_INDEXES).toEqual([0, 1, 2])
        expect(shouldQueueBridgeCue(base)).toBe(true)
        expect(
            shouldQueueBridgeCue({ ...base, positionMs: 100_000 }),
        ).toBe(false)
        expect(
            shouldQueueBridgeCue({
                ...base,
                audioId: 'embodiment_heart',
                returnPath: '/(chakras)/heart',
            }),
        ).toBe(false)
        expect(shouldQueueBridgeCue({ ...base, alreadyOpenedAsha: true })).toBe(
            false,
        )
        expect(shouldQueueBridgeCue({ ...base, alreadyOffered: true })).toBe(
            false,
        )
        expect(
            shouldQueueBridgeCue({
                ...base,
                returnPath: '/(chakras)/AudioLibrary',
            }),
        ).toBe(false)
        expect(shouldQueueBridgeCue({ ...base, isIntroAudio: false })).toBe(
            false,
        )
    })

    it('keeps the golden Divine Laws hero and a tiny mounted cue', () => {
        expect(ASHA_SPEAKS_TITLE).toBe('Divine Laws of The Universe')
        expect(ASHA_SPEAKS_SUBLINE).toBe('with Asha')
        expect(BRIDGE_CUE_COPY.continue).toContain('Asha')
        const button = read('components/chakras/AshaSpeaksButton.tsx')
        expect(button).toContain('ASHA_SPEAKS_TITLE')
        expect(button).toContain('#F3D59A')
        expect(button).not.toContain('Modal')
        expect(button).not.toContain('colorbar.png')
        const cue = read('components/chakras/BridgeCueModal.tsx')
        expect(cue).toContain('visible={visible}')
        expect(cue).toContain('{visible ? (')
        const close = read('utils/openFullPlayer.ts')
        expect(close).toContain('queueBridgeCueIfNeeded')
        expect(close).not.toContain('playSanctuaryTrack')
        const template = read('components/chakras/ChakraTemplate.tsx')
        expect(template).toContain('BridgeCueModal')
        expect(template).toContain('Platform.OS === "android" ? 360 : 80')
        expect(template.indexOf('isIntroAudio={true}')).toBeLessThan(
            template.indexOf('<Part3Section'),
        )
    })
})
