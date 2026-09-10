/**
 * Full-player download chrome is for a stall or error only.
 * Healthy saves stay in the background so the room stays quiet.
 */

import { useEffect, useState } from 'react'
import { useSanctuaryVaultStore } from '@/src/services/sanctuaryVaultDownloader'
import { useSanctuaryTrackReady } from '@/hooks/useSanctuaryTrackReady'

export const PLAYER_LOAD_GLITCH_MS = 10000

export function usePlayerDownloadGlitch(
    audioId?: string | null,
    opts?: { isLoading?: boolean },
) {
    const isLoading = opts?.isLoading === true
    const vaultReady = useSanctuaryTrackReady(audioId)
    const vaultStatus = useSanctuaryVaultStore((s) => s.status)
    const downloadingAudioId = useSanctuaryVaultStore((s) => s.downloadingAudioId)
    const rushedAudioId = useSanctuaryVaultStore((s) => s.rushedAudioId)
    const bytesWritten = useSanctuaryVaultStore((s) =>
        audioId ? (s.progressByAudioId[audioId]?.bytesWritten ?? 0) : 0,
    )

    const isThisTrack =
        !!audioId &&
        (downloadingAudioId === audioId || rushedAudioId === audioId)
    const healthyDownload =
        isThisTrack && vaultStatus !== 'error' && vaultStatus !== 'paused'
    const immediateGlitch =
        vaultStatus === 'error' || vaultStatus === 'paused'

    const [stalled, setStalled] = useState(false)

    useEffect(() => {
        if (immediateGlitch) {
            setStalled(false)
            return
        }
        if (vaultReady && !isLoading) {
            setStalled(false)
            return
        }
        if (healthyDownload) {
            setStalled(false)
            return
        }
        if (!isLoading && (vaultReady || !audioId)) {
            setStalled(false)
            return
        }
        const timer = setTimeout(() => setStalled(true), PLAYER_LOAD_GLITCH_MS)
        return () => clearTimeout(timer)
    }, [
        audioId,
        bytesWritten,
        healthyDownload,
        immediateGlitch,
        isLoading,
        vaultReady,
    ])

    return {
        showGlitch: immediateGlitch || stalled,
        vaultStatus,
        isThisTrack,
        vaultReady,
        healthyDownload,
    }
}
