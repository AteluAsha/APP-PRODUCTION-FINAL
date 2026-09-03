/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { Chakra } from '../types/chakras/Chakra'
import { SANCTUARY_TUNING_FORK_FILE } from '../constants/sanctuaryAudioManifest'

const getTuningForkFileName = (chakra: keyof typeof SANCTUARY_TUNING_FORK_FILE) =>
    SANCTUARY_TUNING_FORK_FILE[chakra]

describe('Drop In secret tuning fork wiring', () => {
    it('maps every course day to its own vault tuning fork id', () => {
        const chakras = Object.values(Chakra)
        expect(chakras).toHaveLength(7)
        for (const chakra of chakras) {
            const filename = getTuningForkFileName(chakra)
            expect(filename).toBe(SANCTUARY_TUNING_FORK_FILE[chakra])
            expect(
                `tuning_fork_${chakra}_${filename}`,
            ).toMatch(/^tuning_fork_[a-z_]+_Day\d/)
        }
    })

    it('ChakraTemplate passes the chakra-scoped tuning fork id into DropInButton', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/ChakraTemplate.tsx'),
            'utf8',
        )
        expect(src).toContain('DropInButton')
        expect(src).toContain(
            'audioId={`tuning_fork_${chakra}_${getTuningForkFileName(chakra)}`}',
        )
        expect(src).toContain('tuningForkAudio.localUri')
    })

    it('DropInButton plays through the shared inline fork hook', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'components/chakras/DropInButton.tsx'),
            'utf8',
        )
        expect(src).toContain('useInlineTuningFork')
        expect(src).toContain('audioId')
    })
})
