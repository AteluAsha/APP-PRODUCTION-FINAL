/* eslint-env jest */
import * as fs from 'fs'
import * as path from 'path'
import { FIRST_LOAD_NOTICE_COPY } from '@/src/utils/vaultDownloadProgress'

describe('vault overnight bulk sync', () => {
    const downloader = fs.readFileSync(
        path.join(__dirname, '..', 'src/services/sanctuaryVaultDownloader.ts'),
        'utf8',
    )

    it('does not claim silent OS background download', () => {
        expect(FIRST_LOAD_NOTICE_COPY).not.toMatch(/background so you can use them offline/i)
        expect(FIRST_LOAD_NOTICE_COPY).toContain('foreground')
    })

    it('keeps the device awake while tracks remain and the app is active', () => {
        expect(downloader).toContain('activateKeepAwakeAsync')
        const layout = require('fs').readFileSync(
            require('path').join(__dirname, '..', 'app/_layout.tsx'),
            'utf8',
        )
        expect(layout).toContain('VaultSyncKeepAwake')
    })

    it('watchdog restarts a stalled queue while the app is active', () => {
        expect(downloader).toContain('startVaultWatchdog')
        expect(downloader).toContain('VAULT_WATCHDOG_MS')
        expect(downloader).toMatch(/missingCount > 0 && !queueRunning/)
    })

    it('releases a stale tap-to-rush lock so the Day 1 queue can continue', () => {
        expect(downloader).toContain('recoverStaleRushLock')
        expect(downloader).toContain('STALE_RUSH_LOCK_MS')
        expect(downloader).toContain('rushedAtMs')
    })

    it('refreshes missing count and resumes sync when returning to active', () => {
        expect(downloader).toMatch(/next === 'active'[\s\S]*refreshMissingCount/)
        expect(downloader).toMatch(/next === 'active'[\s\S]*startSanctuaryVaultSync/)
    })
})
