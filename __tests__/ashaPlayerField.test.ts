/* eslint-env jest */
import { Chakra } from '../types/chakras/Chakra'
import {
    SANCTUARY_VAULT_TRACKS,
    getSanctuaryVaultTrack,
} from '../constants/sanctuaryVaultTracks'
import { getDayFromChakra } from '../utils/chakraMapping'
import {
    getAshaPlayerField,
    getSanctuarySoundField,
} from '../utils/ashaPlayerField'
import * as fs from 'fs'
import * as path from 'path'

describe('asha player field (visual only)', () => {
    it('maps every Asha audioId to the Music Room Asha field for that day', () => {
        const ashaTracks = SANCTUARY_VAULT_TRACKS.filter(
            (track) => track.kind === 'head_to_heart',
        )
        expect(ashaTracks).toHaveLength(Object.values(Chakra).length)
        for (const track of ashaTracks) {
            expect(getSanctuaryVaultTrack(track.audioId)?.kind).toBe(
                'head_to_heart',
            )
            expect(getAshaPlayerField(track.audioId)).toEqual({
                dayIndex: getDayFromChakra(track.chakra),
                trackKind: 'head_to_heart',
            })
        }
    })

    it('does not attach Asha imagery to other sanctuary tracks', () => {
        expect(getAshaPlayerField('embodiment_root')).toBeNull()
        expect(getAshaPlayerField('tuning_fork_root_x')).toBeNull()
        expect(getAshaPlayerField('crystal_bowl_heart_x')).toBeNull()
        expect(getAshaPlayerField(null)).toBeNull()
    })

    it('gives Sound Bath crystal bowls the sanctuary field', () => {
        const bowls = SANCTUARY_VAULT_TRACKS.filter(
            (track) => track.kind === 'crystal_bowl',
        )
        expect(bowls.length).toBeGreaterThan(0)
        for (const track of bowls) {
            expect(getSanctuarySoundField(track.audioId)).toEqual({
                dayIndex: getDayFromChakra(track.chakra),
                trackKind: 'crystal_bowl',
            })
        }
    })

    it('keeps course Asha on sanctuary playback, not the Music Room playlist', () => {
        const open = fs.readFileSync(
            path.join(__dirname, '..', 'utils/openAshaSpeaks.ts'),
            'utf8',
        )
        expect(open).toContain('ancestralChamberPath')
        expect(open).toContain('router.push')
        expect(open).not.toContain('openMusicRoomAtIndex')
        expect(open).not.toContain('setMusicRoomPlaylist')
        const chamber = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/HeadToHeart.tsx'),
            'utf8',
        )
        expect(chamber).toContain('AudioRow')
        const playback = fs.readFileSync(
            path.join(__dirname, '..', 'utils/sanctuaryPlayback.ts'),
            'utf8',
        )
        expect(playback).toContain("router.push('/AudioPlayer')")
        expect(playback).toContain('clearMusicRoomSession')
        const player = fs.readFileSync(
            path.join(__dirname, '..', 'app/AudioPlayer.tsx'),
            'utf8',
        )
        expect(player).toContain('getSanctuarySoundField')
        expect(player).toContain('MusicRoomPlayerFieldLayer')
    })
})
