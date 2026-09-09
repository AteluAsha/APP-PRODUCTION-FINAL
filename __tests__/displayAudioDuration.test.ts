/* eslint-env jest */
import * as fs from 'fs'
import * as path from 'path'
import {
    getAudioButtonDurationLabel,
    preferPlayerDurationMs,
} from '@/utils/displayAudioDuration'
import { getMinutesString } from '@/utils/format'

const read = (rel: string) =>
    fs.readFileSync(path.join(__dirname, '..', rel), 'utf8')

describe('audio button duration labels', () => {
    it('uses the player-measured length, not catalog, once known', () => {
        expect(preferPlayerDurationMs(3_304_000, 2_684_000)).toBe(3_304_000)
        expect(preferPlayerDurationMs(undefined, 2_684_000)).toBe(2_684_000)
        expect(preferPlayerDurationMs(0, 2_684_000)).toBe(2_684_000)
        expect(preferPlayerDurationMs(1_440_000, 2_684_000)).toBe(2_684_000)
    })

    it('shows whole minutes only, never seconds', () => {
        expect(getAudioButtonDurationLabel(2_684_000)).toBe('44 min')
        expect(getAudioButtonDurationLabel(3_304_000)).toBe('55 min')
        expect(getMinutesString(3_304_000)).not.toMatch(/:/)
        expect(getAudioButtonDurationLabel(3_304_000)).not.toMatch(/sec/)
    })

    it('lets AudioPlayer log the length; buttons only read it', () => {
        const row = read('components/chakras/AudioRow.tsx')
        const library = read('components/chakras/MusicRoomTrackButton.tsx')
        const asha = read('components/chakras/AshaSpeaksButton.tsx')
        const player = read('app/AudioPlayer.tsx')
        const sanctuary = read('utils/sanctuaryPlayback.ts')
        const musicRoom = read('utils/musicRoomPlayback.ts')
        expect(row).toContain('useResolvedTrackDurationMs')
        expect(row).toContain('getAudioButtonDurationLabel')
        expect(row).not.toContain('formatTime(')
        expect(library).toContain('useResolvedTrackDurationMs')
        expect(asha).toContain('useResolvedTrackDurationMs')
        expect(player).toContain('setDuration(trackId, fileMs)')
        expect(sanctuary).not.toContain('resolveCachedDurationMs')
        expect(musicRoom).not.toContain('resolveCachedDurationMs')
        expect(musicRoom).not.toContain('displayAudioDuration')
    })
})
