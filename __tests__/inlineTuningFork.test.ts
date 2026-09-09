/* eslint-env jest */
import fs from 'fs'
import path from 'path'

describe('shared inline tuning fork chime', () => {
    const hook = fs.readFileSync(
        path.join(__dirname, '..', 'hooks/useInlineTuningFork.ts'),
        'utf8',
    )
    const dropIn = fs.readFileSync(
        path.join(__dirname, '..', 'components/chakras/DropInButton.tsx'),
        'utf8',
    )
    const soundBath = fs.readFileSync(
        path.join(__dirname, '..', 'app/(chakras)/SoundBath.tsx'),
        'utf8',
    )

    it('keeps Drop In and Sound Bath on the same chime path', () => {
        expect(dropIn).toContain('useInlineTuningFork')
        expect(soundBath).toContain('useInlineTuningFork')
        expect(soundBath).toContain('stopOnBlur: true')
        expect(soundBath).toContain('flexDirection: "row"')
        expect(soundBath).toContain('{tuningForkHertz}')
        expect(soundBath).toContain('Hz')
    })

    it('restarts from 0, rushes the vault, and keeps lock-screen play', () => {
        expect(hook).toContain(
            'pause/play must restart the chime from 0, not resume mid-tone',
        )
        expect(hook).toContain('peekSanctuaryTrack')
        expect(hook).toContain('rushSanctuaryTrack')
        expect(hook).toContain('keepPlayingInBackground: true')
        expect(hook).not.toContain('keepPlayingInBackground: false')
        expect(hook).toContain('registerAndroidBackCleanup')
        expect(hook).toContain('saveAudioBookmark')
        expect(hook).toContain('AppState.currentState')
        expect(hook).toContain('void stop()')
        expect(hook).not.toContain('ensureSanctuaryTrack')
    })
})
