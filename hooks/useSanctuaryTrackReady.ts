import { useEffect, useState } from 'react'
import {
    peekSanctuaryTrack,
    useSanctuaryVaultStore,
} from '@/src/services/sanctuaryVaultDownloader'

/**
 * True when this sanctuary track is fully stored in documents.
 * Used for the earth-green ready rim and the tap-again-to-play rule.
 */
export function useSanctuaryTrackReady(audioId?: string | null): boolean {
    const storeReady = useSanctuaryVaultStore((s) =>
        audioId ? s.readyIds[audioId] === true : false,
    )
    const missingCount = useSanctuaryVaultStore((s) => s.missingCount)
    const downloadingAudioId = useSanctuaryVaultStore((s) => s.downloadingAudioId)
    const generation = useSanctuaryVaultStore((s) => s.generation)
    const [fileReady, setFileReady] = useState(storeReady)

    useEffect(() => {
        if (!audioId) {
            setFileReady(false)
            return
        }
        if (storeReady) {
            setFileReady(true)
            return
        }
        let cancelled = false
        peekSanctuaryTrack(audioId)
            .then((uri) => {
                if (!cancelled) setFileReady(!!uri)
            })
            .catch(() => {
                if (!cancelled) setFileReady(false)
            })
        return () => {
            cancelled = true
        }
    }, [audioId, storeReady, missingCount, downloadingAudioId, generation])

    return storeReady || fileReady
}
