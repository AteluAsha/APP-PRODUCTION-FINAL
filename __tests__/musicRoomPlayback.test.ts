/* eslint-env jest */
import fs from 'fs'
import path from 'path'

describe('music-room playback (Audio Library only)', () => {
    it('serializes track switches and blocks manager during open', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'utils/musicRoomPlayback.ts'),
            'utf8',
        )
        expect(src).toContain('enqueueMusicRoomSwitch')
        expect(src).toContain('setFullScreenPlayerMounted(true)')
        expect(src).toContain('notifyRushedTrackPlaying(audioId)')
        expect(src).toContain('setMusicRoomPlaylist(items, startIndex, source)')
        const openFn = src.slice(
            src.indexOf('export async function openMusicRoomAtIndex'),
            src.indexOf('export async function switchMusicRoomTrack'),
        )
        expect(openFn).not.toContain('if (!source) return false')
    })

    it('Audio Library counts vault-ready tracks for offline header', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/AudioLibrary.tsx'),
            'utf8',
        )
        expect(src).toContain('vaultReadySet')
        expect(src).toContain('startSanctuaryVaultSync')
        expect(src).not.toContain('downloadAndCacheAudio')
    })

    it('VaultDownloadLine hides when track is vault-ready', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/VaultDownloadLine.tsx'),
            'utf8',
        )
        expect(src).toContain('useVaultTrackDownloadUi')
        expect(src).toContain('if (!showProgressLine')
    })

    it('AudioPlayer library mode has no swipe queue and resets on leave', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'app/AudioPlayer.tsx'),
            'utf8',
        )
        expect(src).toContain('initGenerationRef')
        expect(src).toContain('getMusicRoomActiveAudioId')
        expect(src).toContain('trackContentOpacity')
        expect(src).toContain('trackBarTranslateY')
        expect(src).not.toContain('Swipe to journey')
        expect(src).not.toContain('handleMusicRoomSwipeNext')
        expect(src).not.toContain('musicRoomSwipeGesture')
        expect(src).not.toContain('closeMusicRoomPlayer({ navigate: false })')
        const close = fs.readFileSync(
            path.join(__dirname, '..', 'utils/musicRoomPlayback.ts'),
            'utf8',
        )
        expect(close).toContain('allowsTrackQueue')
        expect(src).toContain('isMusicRoom')
        expect(src).toContain('applyMusicRoomTrack')
    })

    it('MusicRoomTrackButton never shows downloading when vault-ready', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/MusicRoomTrackButton.tsx'),
            'utf8',
        )
        expect(src).toContain('useVaultTrackDownloadUi')
        expect(src).toContain('isDownloading')
    })
})
