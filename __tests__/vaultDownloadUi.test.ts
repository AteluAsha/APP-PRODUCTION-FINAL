/* eslint-env jest */
import fs from 'fs'
import path from 'path'

describe('unified vault download UI', () => {
    it('single hook powers course rows, library, and Drop In', () => {
        const hook = fs.readFileSync(
            path.join(__dirname, '..', 'hooks/useVaultTrackDownloadUi.ts'),
            'utf8',
        )
        expect(hook).toContain('formatDownloadingHeadline')
        expect(hook).toContain('formatVaultCueLabel')
        expect(hook).toContain('stableVaultDownloadPercent')

        const line = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/VaultDownloadLine.tsx'),
            'utf8',
        )
        expect(line).toContain('useVaultTrackDownloadUi')

        const cell = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/DownloadIconCell.tsx'),
            'utf8',
        )
        expect(cell).toContain('downloadPercent')
    })

    it('Drop In sits above master meditation on course days', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/ChakraTemplate.tsx'),
            'utf8',
        )
        const dropIdx = src.indexOf('<DropInButton')
        const audioIdx = src.indexOf('<AudioRow')
        expect(dropIdx).toBeGreaterThan(-1)
        expect(audioIdx).toBeGreaterThan(dropIdx)
    })

    it('full player shows a fading headset reminder, not headphone detection', () => {
        const reminder = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/audio/HeadsetListenReminder.tsx',
            ),
            'utf8',
        )
        expect(reminder).toContain('name="headset"')
        expect(reminder).toContain('60_000')
        expect(reminder).not.toContain('AudioDevice')

        const player = fs.readFileSync(
            path.join(__dirname, '..', 'app/AudioPlayer.tsx'),
            'utf8',
        )
        expect(player).toContain('HeadsetListenReminder')
    })

    it('ready rim is vault-only, not leftover localUri', () => {
        const library = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/MusicRoomTrackButton.tsx'),
            'utf8',
        )
        expect(library).toContain('const showReadyRim = vaultReady')
        expect(library).not.toContain('vaultReady || !!localUri')
        expect(library).not.toContain('vaultReady || !!isDownloaded')

        const row = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/AudioTrackRow.tsx'),
            'utf8',
        )
        expect(row).toContain('const showReadyRim = vaultReady')
        expect(row).not.toContain('vaultReady || !!isDownloaded')
    })

    it('Sound Bath uses wrapped closing quote section', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/SoundBath.tsx'),
            'utf8',
        )
        expect(src).toContain('SoundBathClosingSection')
        expect(src).toContain('SOUND_BATH_CLOSING_QUOTE')
        expect(src).toContain('MusicRoomTrackButton')
        expect(src).toContain('getSoundHealingTrackDefs')
        expect(src).toContain('rushSanctuaryTrack')
    })
})
