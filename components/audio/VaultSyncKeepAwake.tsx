import { useEffect } from 'react'
import { AppState } from 'react-native'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useSanctuaryVaultStore } from '@/src/services/sanctuaryVaultDownloader'

const KEEP_AWAKE_TAG = 'sanctuary-vault-sync'

/**
 * Keeps the screen on while sanctuary tracks remain. React lifecycle hook is
 * more reliable on Pixel than imperative calls from the downloader alone.
 */
export function VaultSyncKeepAwake() {
    const missingCount = useSanctuaryVaultStore((s) => s.missingCount)
    const status = useSanctuaryVaultStore((s) => s.status)
    const downloadingAudioId = useSanctuaryVaultStore((s) => s.downloadingAudioId)

    useEffect(() => {
        let active = AppState.currentState === 'active'

        const apply = () => {
            const vaultSyncActive =
                missingCount > 0 ||
                status === 'downloading' ||
                downloadingAudioId != null
            const shouldStayAwake = active && vaultSyncActive
            if (shouldStayAwake) {
                void activateKeepAwakeAsync(KEEP_AWAKE_TAG)
            } else {
                deactivateKeepAwake(KEEP_AWAKE_TAG)
            }
        }

        apply()
        const sub = AppState.addEventListener('change', (next) => {
            active = next === 'active'
            apply()
        })
        return () => {
            sub.remove()
            deactivateKeepAwake(KEEP_AWAKE_TAG)
        }
    }, [missingCount, status, downloadingAudioId])

    return null
}
