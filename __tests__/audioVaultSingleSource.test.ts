/* eslint-env jest */
import fs from 'fs'
import path from 'path'

describe('single sanctuary vault (documentDirectory only)', () => {
    it('vault utils forbid cacheDirectory', () => {
        const vault = fs.readFileSync(
            path.join(__dirname, '..', 'src/utils/sanctuaryAudioVault.ts'),
            'utf8',
        )
        expect(vault).toContain('documentDirectory')
        expect(vault).toContain('Never cacheDirectory')
        expect(vault).toContain('sanctuary-audio')
    })

    it('vault downloader writes only to documentDirectory', () => {
        const downloader = fs.readFileSync(
            path.join(__dirname, '..', 'src/services/sanctuaryVaultDownloader.ts'),
            'utf8',
        )
        expect(downloader).toContain('documentDirectory only')
        expect(downloader).toContain('cacheDirectory is forbidden')
    })

    it('Audio Library does not download to cacheDirectory', () => {
        const library = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/AudioLibrary.tsx'),
            'utf8',
        )
        expect(library).toContain('startSanctuaryVaultSync')
        expect(library).toContain('rushSanctuaryTrack')
        expect(library).not.toContain('downloadAndCacheAudio')
        expect(library).not.toContain('getLocalAudioUri')
        expect(library).not.toContain('cacheDirectory')
    })

    it('course sanctuary playback uses vault not cache', () => {
        const playback = fs.readFileSync(
            path.join(__dirname, '..', 'utils/sanctuaryPlayback.ts'),
            'utf8',
        )
        expect(playback).toContain('peekSanctuaryTrack')
        expect(playback).toContain('rushSanctuaryTrack')
        expect(playback).not.toContain('downloadAndCacheAudio')
    })

    it('music-room playback resolves from vault', () => {
        const musicRoom = fs.readFileSync(
            path.join(__dirname, '..', 'utils/musicRoomPlayback.ts'),
            'utf8',
        )
        expect(musicRoom).toContain('peekSanctuaryTrack')
        expect(musicRoom).not.toContain('getLocalAudioUri')
        expect(musicRoom).not.toContain('cacheDirectory')
    })

    it('sweeps replaced remasters out of the document vault', () => {
        const vault = fs.readFileSync(
            path.join(__dirname, '..', 'src/utils/sanctuaryAudioVault.ts'),
            'utf8',
        )
        expect(vault).toContain('sweepOrphanVaultFiles')
        const downloader = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'src/services/sanctuaryVaultDownloader.ts',
            ),
            'utf8',
        )
        expect(downloader).toContain('sweepOrphanVaultFiles')
    })

    it('embodiment hook loads from document vault', () => {
        const hook = fs.readFileSync(
            path.join(__dirname, '..', 'hooks/useEmbodimentAudio.ts'),
            'utf8',
        )
        expect(hook).toContain('documentDirectory vault')
        expect(hook).toContain('loadBundledEmbodimentAudio')
    })
})
