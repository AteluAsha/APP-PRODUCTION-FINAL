/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { Chakra } from '../types/chakras/Chakra'
import {
    requiredDayAudioKinds,
    dayAudioSlotKey,
    dayCeremonySlotKey,
    dayAudioCreditFromAudioId,
    labelForDayAudioKind,
} from '../src/utils/dayAudioEmbodiment'
import { DAY_EMBODIMENT_GATE_COPY } from '../constants/dayEmbodimentCopy'

describe('day embodiment accountability', () => {
    it('asks for Master Meditation and Asha Speaks, not Sound Bath', () => {
        expect(requiredDayAudioKinds(Chakra.ROOT)).toEqual([
            'meditation',
            'bridge',
        ])
        expect(requiredDayAudioKinds(Chakra.CROWN)).not.toContain('sound-bath')
        expect(labelForDayAudioKind('meditation')).toMatch(/Meditation/i)
        expect(dayAudioSlotKey(Chakra.ROOT, 'bridge', '2026-09-07')).toBe(
            '2026-09-07:root:bridge',
        )
        expect(dayCeremonySlotKey(Chakra.ROOT, '2026-09-07')).toBe(
            '2026-09-07:root:ceremony',
        )
        expect(dayAudioCreditFromAudioId('embodiment_heart')).toEqual({
            chakra: Chakra.HEART,
            kind: 'meditation',
        })
        expect(
            dayAudioCreditFromAudioId(
                'head_to_heart_root_Day1_7thDivineLaw_AshaSpeaks.mp3',
            ),
        ).toEqual({ chakra: Chakra.ROOT, kind: 'bridge' })
        expect(
            dayAudioCreditFromAudioId('crystal_bowl_sacral_bowl.mp3')?.kind,
        ).toBe('sound-bath')
        expect(dayAudioCreditFromAudioId('tuning_fork_root_x.mp3')).toBeNull()
    })

    it('gates the close with loving copy and a path back into the remaining sound', () => {
        expect(DAY_EMBODIMENT_GATE_COPY.why).toBe('We do not rush. We embody.')
        expect(DAY_EMBODIMENT_GATE_COPY.override).toMatch(/embodied this day/i)
        expect(DAY_EMBODIMENT_GATE_COPY.overrideHint).toMatch(/sovereignty/i)
        expect(DAY_EMBODIMENT_GATE_COPY.remainingHeading).toMatch(/remaining/i)
        expect(labelForDayAudioKind('bridge')).toMatch(/Divine Laws/i)
        const template = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/ChakraTemplate.tsx',
            ),
            'utf8',
        )
        expect(template).toContain('onCloseInMyTiming')
        expect(template).toContain('DayEmbodimentGateModal')
        expect(template).toContain('DAY_EMBODIED_CHECKBOX_LABEL')
        expect(template).not.toContain("I have completed today's journey")
        expect(template).toContain('handleEmbodimentCompletePress')
        expect(template).toContain('handleOpenRemainingPath')
        expect(template).toContain('handleCloseDayInMyTiming')
        expect(template).toContain('hasCeremonyClosed')
        expect(template).toContain('hasEmbodiedToday')
        expect(template).toContain('waitForDayAudioOpenedHydration')
        expect(template).toContain('scrollTo')
        expect(template).toContain('markOpened')
        expect(template).toContain('heart-outline')
        expect(template).not.toContain('completedChakras')
        const playback = fs.readFileSync(
            path.join(__dirname, '..', 'utils/sanctuaryPlayback.ts'),
            'utf8',
        )
        expect(playback).toContain('markOpenedFromAudioId')
        const library = fs.readFileSync(
            path.join(__dirname, '..', 'utils/musicRoomPlayback.ts'),
            'utf8',
        )
        expect(library).toContain('markOpenedFromAudioId')
        const bridge = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/HeadToHeart.tsx'),
            'utf8',
        )
        expect(bridge).toContain('markOpened(chakra, "bridge")')
        const store = fs.readFileSync(
            path.join(__dirname, '..', 'hooks/useDayAudioOpenedStore.ts'),
            'utf8',
        )
        expect(store).toContain('...(current.opened ?? {})')
        expect(store).toContain('waitForDayAudioOpenedHydration')
    })
})
