/* eslint-env jest */
import {
    bufferedPlaybackSeconds,
    estimatePlaybackBytesPerSec,
    isPartFilePlayable,
    MIN_DOWNLOAD_TO_PLAYBACK_RATIO,
    playableThresholdBytes,
    requiredDownloadBytesPerSec,
    unknownSpeedThresholdBytes,
} from '@/src/utils/vaultPlayableThreshold'

describe('vault playable threshold', () => {
    const day1Total = 122_235_907
    const day1DurationMs = 39 * 60 * 1000

    it('derives playback bitrate from file size and catalog duration', () => {
        const bps = estimatePlaybackBytesPerSec(day1Total, day1DurationMs, 'embodiment')
        expect(bps).toBeGreaterThan(50 * 1024)
        expect(bps).toBeLessThan(55 * 1024)
    })

    it('requires at least four minutes of audio on disk for embodiment', () => {
        const threshold = playableThresholdBytes(
            day1Total,
            'embodiment',
            day1DurationMs,
        )
        const seconds = bufferedPlaybackSeconds(
            threshold,
            day1Total,
            day1DurationMs,
            'embodiment',
        )
        expect(seconds).toBeGreaterThanOrEqual(240)
    })

    it('opens when download speed stays ahead of playback with enough startup buffer', () => {
        const playbackBps = estimatePlaybackBytesPerSec(
            day1Total,
            day1DurationMs,
            'embodiment',
        )
        const threshold = playableThresholdBytes(
            day1Total,
            'embodiment',
            day1DurationMs,
        )
        const fastDownload = playbackBps * MIN_DOWNLOAD_TO_PLAYBACK_RATIO * 1.5
        expect(
            isPartFilePlayable(
                threshold,
                day1Total,
                'embodiment',
                fastDownload,
                day1DurationMs,
            ),
        ).toBe(true)
        expect(
            isPartFilePlayable(
                threshold - 1,
                day1Total,
                'embodiment',
                fastDownload,
                day1DurationMs,
            ),
        ).toBe(false)
    })

    it('never opens on a link slower than playback even with a large partial file', () => {
        const playbackBps = estimatePlaybackBytesPerSec(
            day1Total,
            day1DurationMs,
            'embodiment',
        )
        const slowDownload = playbackBps * 0.5
        expect(
            isPartFilePlayable(
                Math.floor(day1Total * 0.2),
                day1Total,
                'embodiment',
                slowDownload,
                day1DurationMs,
            ),
        ).toBe(false)
    })

    it('waits for a measured fast link or a much larger buffer when speed is unknown', () => {
        const threshold = playableThresholdBytes(
            day1Total,
            'embodiment',
            day1DurationMs,
        )
        const unknownThreshold = unknownSpeedThresholdBytes(
            day1Total,
            'embodiment',
            day1DurationMs,
        )
        expect(unknownThreshold).toBeGreaterThan(threshold)
        expect(
            isPartFilePlayable(
                threshold,
                day1Total,
                'embodiment',
                undefined,
                day1DurationMs,
            ),
        ).toBe(false)
        expect(
            isPartFilePlayable(
                unknownThreshold,
                day1Total,
                'embodiment',
                undefined,
                day1DurationMs,
            ),
        ).toBe(true)
    })

    it('reports required download speed as 35% above playback', () => {
        const playbackBps = estimatePlaybackBytesPerSec(
            day1Total,
            day1DurationMs,
            'embodiment',
        )
        const required = requiredDownloadBytesPerSec(
            day1Total,
            day1DurationMs,
            'embodiment',
        )
        expect(required / playbackBps).toBeCloseTo(MIN_DOWNLOAD_TO_PLAYBACK_RATIO, 5)
    })

    it('opens a user-rushed track at startup buffer without blocking on speed samples', () => {
        const threshold = playableThresholdBytes(
            day1Total,
            'embodiment',
            day1DurationMs,
        )
        const slowDownload = estimatePlaybackBytesPerSec(
            day1Total,
            day1DurationMs,
            'embodiment',
        ) * 0.2
        expect(
            isPartFilePlayable(
                threshold,
                day1Total,
                'embodiment',
                slowDownload,
                day1DurationMs,
                { userRushed: true },
            ),
        ).toBe(true)
        expect(
            isPartFilePlayable(
                threshold - 1,
                day1Total,
                'embodiment',
                slowDownload,
                day1DurationMs,
                { userRushed: true },
            ),
        ).toBe(false)
    })
})

describe('progressive vault playback wiring', () => {
    it('registers auto-playback and opens from a playable part file', () => {
        const playback = require('fs').readFileSync(
            require('path').join(__dirname, '..', 'utils/sanctuaryPlayback.ts'),
            'utf8',
        )
        expect(playback).toContain('registerVaultAutoPlayback')
        expect(playback).toContain('peekPlayableVaultUri')
        expect(playback).toContain('playSanctuaryTrack')

        const downloader = require('fs').readFileSync(
            require('path').join(
                __dirname,
                '..',
                'src/services/sanctuaryVaultDownloader.ts',
            ),
            'utf8',
        )
        expect(downloader).toContain('maybeAutoOpenPartialPlayback')
        expect(downloader).toContain('getPendingVaultAutoPlayback')
        expect(downloader).toContain('progressByAudioId')
        expect(downloader).not.toContain('notifyRushedTrackPlaying(audioId)')
        expect(downloader).not.toContain('SNAPSHOT_THROTTLE_MS')
    })

    it('AudioRow auto-starts playback after the welcome without waiting for 100%', () => {
        const src = require('fs').readFileSync(
            require('path').join(__dirname, '..', 'components/chakras/AudioRow.tsx'),
            'utf8',
        )
        expect(src).toContain('playSanctuaryTrack')
        expect(src).not.toMatch(/if \(!isReady[\s\S]*finishWelcome/)
    })
})
