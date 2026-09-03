/* eslint-env jest */
import {
    compareDottedVersion,
    isStoreVersionAhead,
} from '../src/utils/compareDottedVersion'
import { shouldOfferStoreUpdate } from '../src/utils/shouldOfferStoreUpdate'
import { STORE_UPDATE_NOTICE_COPY } from '../constants/storeUpdateNotice'
import fs from 'fs'
import path from 'path'

describe('store update notice', () => {
    it('treats 1.1.30 as ahead of 1.1.27 and equal versions as not ahead', () => {
        expect(compareDottedVersion('1.1.30', '1.1.27')).toBeGreaterThan(0)
        expect(isStoreVersionAhead('1.1.30', '1.1.27')).toBe(true)
        expect(isStoreVersionAhead('1.1.30', '1.1.30')).toBe(false)
        expect(isStoreVersionAhead('40', '39')).toBe(true)
        expect(isStoreVersionAhead('', '1.1.30')).toBe(false)
    })

    it('does not offer when the store is not ahead or the version was dismissed', () => {
        const base = {
            storeVersion: '1.1.31',
            dismissedVersion: null as string | null,
            firstSeenVersion: '1.1.31',
            firstSeenAt: 0,
            lastOfferedAt: null as number | null,
            now: 2 * 24 * 60 * 60 * 1000,
        }
        expect(
            shouldOfferStoreUpdate({ ...base, updateAvailable: false }),
        ).toBe(false)
        expect(
            shouldOfferStoreUpdate({
                ...base,
                updateAvailable: true,
                dismissedVersion: '1.1.31',
            }),
        ).toBe(false)
    })

    it('waits a day after first seeing an update so auto-update can land', () => {
        const firstSeenAt = 1_000
        expect(
            shouldOfferStoreUpdate({
                updateAvailable: true,
                storeVersion: '40',
                dismissedVersion: null,
                firstSeenVersion: '40',
                firstSeenAt,
                lastOfferedAt: null,
                now: firstSeenAt + 2 * 60 * 60 * 1000,
            }),
        ).toBe(false)
        expect(
            shouldOfferStoreUpdate({
                updateAvailable: true,
                storeVersion: '40',
                dismissedVersion: null,
                firstSeenVersion: '40',
                firstSeenAt,
                lastOfferedAt: null,
                now: firstSeenAt + 25 * 60 * 60 * 1000,
            }),
        ).toBe(true)
    })

    it('does not offer until first seen is recorded for this store version', () => {
        expect(
            shouldOfferStoreUpdate({
                updateAvailable: true,
                storeVersion: '40',
                dismissedVersion: null,
                firstSeenVersion: null,
                firstSeenAt: null,
                lastOfferedAt: null,
                now: Date.now(),
            }),
        ).toBe(false)
    })

    it('uses heart-minded copy and only mounts on home after splash', () => {
        expect(STORE_UPDATE_NOTICE_COPY.title).toBe(
            'Fresh things are happening.',
        )
        expect(STORE_UPDATE_NOTICE_COPY.body.toLowerCase()).toContain(
            'shared',
        )
        const host = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/store/StoreUpdateNoticeHost.tsx',
            ),
            'utf8',
        )
        expect(host).toContain('checkStoreUpdateAvailability')
        expect(host).toContain('shouldOfferStoreUpdate')
        expect(host).toContain('ChakraHub')
        expect(host).toContain('ChakraHome')
        expect(host).toContain('splashOverlayActive')
        const layout = fs.readFileSync(
            path.join(__dirname, '..', 'app/_layout.tsx'),
            'utf8',
        )
        expect(layout).toContain('StoreUpdateNoticeHost')
        const availability = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'src/services/storeUpdateAvailability.ts',
            ),
            'utf8',
        )
        expect(availability).toContain('if (__DEV__) return EMPTY')
        expect(availability).toContain('checkForUpdate')
        expect(availability).toContain('itunes.apple.com/lookup')
        expect(availability).toContain('ANDROID_PACKAGE_ID')
        expect(availability).toContain('bundleId')
        const config = fs.readFileSync(
            path.join(__dirname, '..', 'app.config.js'),
            'utf8',
        )
        expect(config).toContain('AppStoreID: "6760920862"')
        expect(config).toContain('ITSAppUsesNonExemptEncryption: false')
        expect(config).toContain('buildNumber: "41"')
        expect(config).toContain('version: "1.1.31"')
    })
})
