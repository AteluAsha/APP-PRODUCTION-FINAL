/* eslint-env jest */

jest.mock('@/hooks/useEmbodimentAudio', () => ({
    getEmbodimentAudioId: (chakra: string) => `embodiment_${chakra}_single`,
}))

jest.mock('@/hooks/useAncestralWisdomAudio', () => ({
    getHeadToHeartAudioId: (chakra: string) => `headtoheart_${chakra}`,
}))

jest.mock('@/hooks/useTuningForkAudio', () => ({
    getTuningForkHertz: () => 396,
}))

import {
    MUSIC_ROOM_TRACK_DEFS,
    buildMusicRoomTrackDefs,
} from '@/constants/musicRoomLibrary'
import { SANCTUARY_TRACK_COUNT } from '@/constants/sanctuaryAudioManifest'
import { Chakra } from '@/types/chakras/Chakra'

describe('musicRoomLibrary', () => {
    it('defines exactly 28 tracks', () => {
        expect(MUSIC_ROOM_TRACK_DEFS.length).toBe(SANCTUARY_TRACK_COUNT)
        expect(MUSIC_ROOM_TRACK_DEFS.length).toBe(28)
    })

    it('orders each day Master → Tuning Fork → Asha → Crystal Bowl', () => {
        const defs = buildMusicRoomTrackDefs()
        const chakras = [
            Chakra.ROOT,
            Chakra.SACRAL,
            Chakra.SOLAR_PLEXUS,
            Chakra.HEART,
            Chakra.THROAT,
            Chakra.THIRD_EYE,
            Chakra.CROWN,
        ]
        for (const chakra of chakras) {
            const day = defs.filter((d) => d.chakra === chakra)
            expect(day.map((d) => d.trackKind)).toEqual([
                'embodiment',
                'tuning_fork',
                'head_to_heart',
                'crystal_bowl',
            ])
        }
    })

    it('assigns sequential global indices', () => {
        MUSIC_ROOM_TRACK_DEFS.forEach((def, index) => {
            expect(def.globalIndex).toBe(index)
            expect(def.trackKey).toBe(`library_${index}`)
        })
    })
})
