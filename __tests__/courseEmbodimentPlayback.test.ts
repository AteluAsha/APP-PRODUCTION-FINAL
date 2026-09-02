/* eslint-env jest */
import fs from 'fs'
import path from 'path'

describe('sanctuary playback (unified)', () => {
    it('single playSanctuaryTrack always opens AudioPlayer', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'utils/sanctuaryPlayback.ts'),
            'utf8',
        )
        expect(src).toContain('playSanctuaryTrack')
        expect(src).toContain("router.push('/AudioPlayer')")
        expect(src).toContain('applySanctuaryMetadata')
        expect(src).toContain('rushSanctuaryTrack')
        expect(src).toContain('setFullScreenPlayerMounted(true)')
    })

    it('course module clears music-room before opening full-player', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'utils/sanctuaryPlayback.ts'),
            'utf8',
        )
        expect(src).toContain('clearMusicRoomSession')
        expect(src).not.toContain('openMusicRoomAtIndex')
        expect(src).not.toContain('setMusicRoomPlaylist')
    })

    it('Audio Library never imports sanctuary playback', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/AudioLibrary.tsx'),
            'utf8',
        )
        expect(src).toContain('openMusicRoomAtIndex')
        expect(src).not.toContain('playSanctuaryTrack')
    })

    it('global first-load popup is removed from root layout', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'app/_layout.tsx'),
            'utf8',
        )
        expect(src).not.toContain('SanctuaryFirstLoadNotice')
    })
})
