/* eslint-env jest */
import * as fs from 'fs'
import * as path from 'path'
import {
    allowsTrackQueue,
    growingPartHandoffMinDurationMs,
    growingPartHasEnoughNewBytes,
    isGrowingVaultPartUri,
    isLibrarySingleTrack,
    shouldReloadGrowingVaultPart,
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

    it('reloads a growing vault .part before the native snapshot ends', () => {
        expect(isGrowingVaultPartUri('file:///vault/bowl.mp3.part')).toBe(true)
        expect(isGrowingVaultPartUri('file:///vault/bowl.mp3')).toBe(false)
        expect(
            shouldReloadGrowingVaultPart({
                vaultReady: false,
                sourceUri: 'file:///x.part',
                didJustFinish: true,
            }),
        ).toBe(true)
        expect(
            shouldReloadGrowingVaultPart({
                vaultReady: false,
                sourceUri: 'file:///x.part',
                isPlaying: true,
                positionMs: 276_000,
                nativeDurationMs: 280_000,
            }),
        ).toBe(true)
        expect(
            shouldReloadGrowingVaultPart({
                vaultReady: true,
                sourceUri: 'file:///x.part',
                didJustFinish: true,
            }),
        ).toBe(false)
        expect(
            shouldReloadGrowingVaultPart({
                vaultReady: true,
                sourceUri: 'file:///vault/bowl.mp3',
                isPlaying: true,
                positionMs: 276_000,
                nativeDurationMs: 280_000,
            }),
        ).toBe(false)
        expect(growingPartHasEnoughNewBytes(1_200_000, 600_000)).toBe(true)
        expect(growingPartHasEnoughNewBytes(650_000, 600_000)).toBe(false)
        expect(growingPartHandoffMinDurationMs(276_000)).toBe(284_000)
        const player = read('app/AudioPlayer.tsx')
        const handoff = player.slice(
            player.indexOf('const tryReloadGrowingVaultPart = useCallback'),
            player.indexOf('tryReloadGrowingVaultPartRef.current = tryReloadGrowingVaultPart'),
        )
        expect(handoff).toContain('handoffExclusiveSound')
        expect(handoff).not.toContain('stopAsync()')
        expect(handoff).not.toContain('await initializeTrack()')
        const sound = read('src/utils/singleActiveSound.ts')
        expect(sound).toContain('export async function handoffExclusiveSound')
        expect(player).toContain('Download finished while still on a `.part`')
        expect(player).toContain('if (vaultTrackComplete) return')
        expect(player).toContain(
            'status.didJustFinish &&',
        )
        expect(player).toContain('!vaultReady &&')
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
        expect(close).toContain('persistResumeBookmark')
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
        expect(player).toContain('shouldReloadGrowingVaultPart')
        expect(player).toContain('tryReloadGrowingVaultPart')
        expect(player).toContain('PlayerVaultSaveCue')
        expect(player).toContain('usePlayerDownloadGlitch')
        expect(player).toContain('visible={showGlitch}')
        expect(player).toContain('crystal_bowl')
        const open = read('utils/musicRoomPlayback.ts')
        expect(open).toContain('if (!allowsTrackQueue(store.playMode)) return false')
        expect(open).not.toContain('clearAudioBookmark')
    })
})
