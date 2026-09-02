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
