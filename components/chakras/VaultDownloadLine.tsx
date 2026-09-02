import { AppText } from '@/components/AppText'
import { useVaultTrackDownloadUi } from '@/hooks/useVaultTrackDownloadUi'

/** Live vault download % — same source as course master meditation rows. */
export function VaultDownloadLine({
    audioId,
    labelMode = 'row',
    idleLabel,
}: {
    audioId?: string | null
    labelMode?: 'row' | 'cue'
    idleLabel?: string
}) {
    const { showProgressLine, progressLabel } = useVaultTrackDownloadUi(audioId, {
        labelMode,
        idleLabel,
    })

    if (!showProgressLine || !progressLabel) return null

    return (
        <AppText
            font="instrument-regular"
            size="xs"
            style={{ marginTop: 4, color: 'rgba(255,255,255,0.88)' }}
        >
            {progressLabel}
        </AppText>
    )
}
