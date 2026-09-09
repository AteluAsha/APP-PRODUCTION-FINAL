/* eslint-env jest */
import * as fs from 'fs'
import * as path from 'path'
import {
    allowsTrackQueue,
    isLibrarySingleTrack,
    shouldTreatAsTrackEnd,
} from '../utils/audioPlayMode'

const read = (rel: string) =>
    fs.readFileSync(path.join(__dirname, '..', rel), 'utf8')

describe('Audio Library single-track mode', () => {
    it('treats library as single unless playMode is queue', () => {
        expect(allowsTrackQueue('single')).toBe(false)
        expect(allowsTrackQueue(undefined)).toBe(false)
        expect(allowsTrackQueue('queue')).toBe(true)
        expect(isLibrarySingleTrack('music-room', 'single')).toBe(true)
        expect(isLibrarySingleTrack('music-room', 'queue')).toBe(false)
        expect(isLibrarySingleTrack('full-player', 'single')).toBe(false)
    })

    it('does not treat an incomplete vault file as a real ending', () => {
        expect(
            shouldTreatAsTrackEnd({ didJustFinish: true, vaultReady: false }),
        ).toBe(false)
        expect(
            shouldTreatAsTrackEnd({ didJustFinish: true, vaultReady: true }),
        ).toBe(true)
        expect(
            shouldTreatAsTrackEnd({ didJustFinish: false, vaultReady: true }),
        ).toBe(false)
    })

    it('resets the library session on leave and never clears course bookmarks', () => {
        const player = read('app/AudioPlayer.tsx')
        const teardown = player.slice(
            player.indexOf('const teardownPlayerForLeave'),
            player.indexOf('const requestLeavePlayer'),
        )
        expect(teardown).toContain('closeFullPlayerAndLeave')
        expect(teardown).not.toContain('clearAudioBookmark')
        const close = read('utils/openFullPlayer.ts')
        expect(close).toContain('.reset()')
        expect(close).toContain('setFullScreenPlayerMounted(false)')
        expect(close).toContain('await silenceAllAudio()')
        expect(close).toContain('saveAudioBookmark')
        expect(close).not.toContain('if (fullPlayerClosing) return')
        const finish = player.slice(
            player.indexOf('if (!prefs.shouldLoop && justFinished)'),
            player.indexOf('// Re-initialize only when the source URI changes'),
        )
        expect(finish).toContain('isLibrarySingleTrack')
        expect(finish).not.toContain('musicRoomAdvanceNext')
        expect(player).not.toContain('musicRoomSwipeGesture')
        expect(player).not.toContain(' / {musicRoomPlaylist.length}')
        expect(player).toContain('shouldTreatAsTrackEnd')
        const open = read('utils/musicRoomPlayback.ts')
        expect(open).toContain('if (!allowsTrackQueue(store.playMode)) return false')
        expect(open).not.toContain('clearAudioBookmark')
    })
})
