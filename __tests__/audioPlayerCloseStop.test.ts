/* eslint-env jest */
import fs from 'fs'
import path from 'path'

const read = (rel: string) =>
    fs.readFileSync(path.join(__dirname, '..', rel), 'utf8')

describe('close AudioPlayer stops all healing audio', () => {
    it('never abandons native unload on a timeout', () => {
        const src = read('src/utils/singleActiveSound.ts')
        expect(src).toContain('player?.remove()')
        expect(src).toContain('stopMeditationPlaybackService()')
        expect(src).not.toContain('Promise.race')
        expect(src).not.toContain('sleep(400)')
        expect(src).toContain('otherOriginTrackRef')
    })

    it('close waits for an in-flight stop instead of skipping it', () => {
        const src = read('utils/openFullPlayer.ts')
        expect(src).toContain('if (closeInFlight)')
        expect(src).toContain('await closeInFlight')
        expect(src).toContain('await silenceAllAudio()')
        expect(src).toContain('saveAudioBookmark')
        expect(src).not.toContain('if (fullPlayerClosing) return')
    })

    it('X, back, and unmount all stop through the same close path', () => {
        const player = read('app/AudioPlayer.tsx')
        expect(player).toContain('teardownPlayerForLeave')
        expect(player).toContain('closeFullPlayerAndLeave')
        expect(player).toContain('beforeRemove')
        expect(player).not.toContain(
            'if (state.audioOrigin === "music-room")',
        )
        const native = read(
            'modules/meditation-playback/android/src/main/java/expo/modules/meditationplayback/MeditationPlaybackService.kt',
        )
        expect(native).toContain('START_NOT_STICKY')
        expect(native).not.toContain('START_STICKY')
    })

    it('lifts gathering presence off the Audio Player scrubber', () => {
        const toast = read('components/HealingToastHost.tsx')
        expect(toast).toContain("pathname.includes('AudioPlayer')")
        expect(toast).toContain('+ 196')
        expect(toast).not.toContain('+ 72')
    })
})
