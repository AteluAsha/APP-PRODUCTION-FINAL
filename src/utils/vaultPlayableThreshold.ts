/**
 * Progressive vault playback buffer gate.
 *
 * Same principle as HLS/DASH/ExoPlayer adaptive streaming:
 *   1. Startup buffer — enough seconds of media on disk before play
 *   2. Bandwidth > consumption — measured download rate must exceed playback
 *      bitrate with headroom, or playback will eventually catch the write head
 *
 * We download to a growing local `.part` file (offline-first), not HTTP range
 * streaming, but the rebuffer math is identical: never open unless the link
 * can stay ahead for the rest of the file.
 */

import type { SanctuaryVaultKind } from '@/constants/sanctuaryVaultTracks'

/** Day 1 master ~117 MB / ~39 min ≈ 52 KB/s — use when size/duration unknown */
export const FALLBACK_PLAYBACK_BYTES_PER_SEC = 52 * 1024

/** Minimum download:playback ratio (35% headroom — common adaptive-streaming margin) */
export const MIN_DOWNLOAD_TO_PLAYBACK_RATIO = 1.35

/** Seconds of audio that must exist locally before play (startup buffer) */
export const MIN_LEAD_SECONDS: Record<
    SanctuaryVaultKind | 'default',
    number
> = {
    embodiment: 240,
    crystal_bowl: 300,
    head_to_heart: 180,
    tuning_fork: 90,
    default: 120,
}

/** When throughput is not measured yet, require a longer startup buffer */
export const UNKNOWN_SPEED_MIN_LEAD_SECONDS = 300

/** Extra slice of the full file before play when speed is still unknown (long tracks) */
export const UNKNOWN_SPEED_MIN_FRACTION = 0.12

/** Conservative duration if we only know file size (shorter assumed duration → higher implied bitrate) */
const EMBODIMENT_MIN_DURATION_SEC = 35 * 60
const LONG_TRACK_MIN_DURATION_SEC = 45 * 60

const LONG_KINDS: SanctuaryVaultKind[] = [
    'embodiment',
    'crystal_bowl',
    'head_to_heart',
]

/** @deprecated use estimatePlaybackBytesPerSec — kept for tests */
export const VAULT_PLAYBACK_BYTES_PER_SEC = FALLBACK_PLAYBACK_BYTES_PER_SEC

export function estimatePlaybackBytesPerSec(
    totalBytes: number,
    durationMs?: number,
    kind?: SanctuaryVaultKind,
): number {
    if (durationMs != null && durationMs > 0 && totalBytes > 0) {
        return totalBytes / (durationMs / 1000)
    }
    if (totalBytes > 0 && kind === 'embodiment') {
        return totalBytes / EMBODIMENT_MIN_DURATION_SEC
    }
    if (totalBytes > 0 && kind != null && LONG_KINDS.includes(kind)) {
        return totalBytes / LONG_TRACK_MIN_DURATION_SEC
    }
    if (totalBytes > 0) {
        return totalBytes / LONG_TRACK_MIN_DURATION_SEC
    }
    return FALLBACK_PLAYBACK_BYTES_PER_SEC
}

export function leadSecondsForKind(kind?: SanctuaryVaultKind): number {
    if (kind && kind in MIN_LEAD_SECONDS) {
        return MIN_LEAD_SECONDS[kind]
    }
    return MIN_LEAD_SECONDS.default
}

export function playableThresholdBytes(
    totalBytes: number,
    kind?: SanctuaryVaultKind,
    durationMs?: number,
): number {
    const playbackBps = estimatePlaybackBytesPerSec(totalBytes, durationMs, kind)
    const leadSec = leadSecondsForKind(kind)
    const byTime = Math.ceil(playbackBps * leadSec)
    if (!(totalBytes > 0)) return byTime
    return Math.min(totalBytes, byTime)
}

export function unknownSpeedThresholdBytes(
    totalBytes: number,
    kind?: SanctuaryVaultKind,
    durationMs?: number,
): number {
    const playbackBps = estimatePlaybackBytesPerSec(totalBytes, durationMs, kind)
    const byTime = Math.ceil(playbackBps * UNKNOWN_SPEED_MIN_LEAD_SECONDS)
    const byFraction =
        totalBytes > 0 && kind === 'embodiment'
            ? Math.floor(totalBytes * UNKNOWN_SPEED_MIN_FRACTION)
            : 0
    const threshold = Math.max(byTime, byFraction)
    if (!(totalBytes > 0)) return threshold
    return Math.min(totalBytes, threshold)
}

export function requiredDownloadBytesPerSec(
    totalBytes: number,
    durationMs?: number,
    kind?: SanctuaryVaultKind,
): number {
    const playbackBps = estimatePlaybackBytesPerSec(totalBytes, durationMs, kind)
    return playbackBps * MIN_DOWNLOAD_TO_PLAYBACK_RATIO
}

/**
 * True when a partial `.part` file is safe to play through without mid-track stalls.
 * If measured download speed cannot stay ahead of playback, returns false until complete.
 */
export function isPartFilePlayable(
    bytesWritten: number,
    bytesTotal: number,
    kind?: SanctuaryVaultKind,
    downloadSpeedBps?: number,
    durationMs?: number,
    opts?: { userRushed?: boolean },
): boolean {
    if (!(bytesWritten > 0)) return false

    if (bytesTotal > 0 && bytesWritten >= Math.floor(bytesTotal * 0.97)) {
        return true
    }

    const playbackBps = estimatePlaybackBytesPerSec(
        bytesTotal,
        durationMs,
        kind,
    )
    const minBuffer = playableThresholdBytes(bytesTotal, kind, durationMs)
    if (bytesWritten < minBuffer) return false

    // Seeker tapped this track — open once startup buffer is met; do not block on
    // early noisy speed samples while the rush download is still ramping up.
    if (opts?.userRushed) {
        return true
    }

    const hasSpeed =
        downloadSpeedBps != null &&
        Number.isFinite(downloadSpeedBps) &&
        downloadSpeedBps > 0

    if (!hasSpeed) {
        return bytesWritten >= unknownSpeedThresholdBytes(
            bytesTotal,
            kind,
            durationMs,
        )
    }

    const requiredDownload = playbackBps * MIN_DOWNLOAD_TO_PLAYBACK_RATIO
    if (downloadSpeedBps < requiredDownload) {
        return false
    }

    return true
}

/** Seconds until the startup buffer is filled at the current download rate */
export function estimateSecondsUntilPlayable(
    bytesWritten: number,
    bytesTotal: number,
    kind?: SanctuaryVaultKind,
    downloadSpeedBps?: number,
    durationMs?: number,
): number | null {
    if (!(downloadSpeedBps != null && downloadSpeedBps > 0)) return null

    const playbackBps = estimatePlaybackBytesPerSec(
        bytesTotal,
        durationMs,
        kind,
    )
    if (downloadSpeedBps < playbackBps * MIN_DOWNLOAD_TO_PLAYBACK_RATIO) {
        return null
    }

    const target = playableThresholdBytes(bytesTotal, kind, durationMs)
    if (bytesWritten >= target) return 0
    return Math.ceil((target - bytesWritten) / downloadSpeedBps)
}

/** How many seconds of uninterrupted playback the current on-disk slice represents */
export function bufferedPlaybackSeconds(
    bytesWritten: number,
    bytesTotal: number,
    durationMs?: number,
    kind?: SanctuaryVaultKind,
): number {
    const playbackBps = estimatePlaybackBytesPerSec(
        bytesTotal,
        durationMs,
        kind,
    )
    if (!(playbackBps > 0)) return 0
    return bytesWritten / playbackBps
}
