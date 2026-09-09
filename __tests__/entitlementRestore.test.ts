/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { scholarshipExpiryStillValid } from '../src/utils/scholarshipExpiry'

describe('entitlement restore after uninstall', () => {
    it('keeps unexpired scholarship and rejects expired or invalid dates', () => {
        const now = new Date('2026-09-08T12:00:00.000Z')
        expect(
            scholarshipExpiryStillValid('2026-10-01T00:00:00.000Z', now),
        ).toBe(true)
        expect(
            scholarshipExpiryStillValid('2026-09-01T00:00:00.000Z', now),
        ).toBe(false)
        expect(scholarshipExpiryStillValid('not-a-date', now)).toBe(false)
    })

    it('auto-restores paid receipts when local access is missing', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'src/services/revenuecat.ts'),
            'utf8',
        )
        expect(src).toContain('syncAccessFromStoreReceipts')
        expect(src).toContain('restorePurchases()')
        expect(src).toContain('readUnexpiredScholarshipFromDevice')
        expect(src).toContain('clearPaidAccessIfSubscriptionInactive')
        expect(src).toContain('PRODUCT_ALREADY_PURCHASED')
        expect(src).toContain('BILLING_UNAVAILABLE')
        expect(src).toContain('addCustomerInfoUpdateListener')
        expect(src).toContain('await syncAccessFromStoreReceipts()')
    })

    it('does not reset the scholarship clock on restore', () => {
        const store = fs.readFileSync(
            path.join(__dirname, '..', 'hooks/useChakraJourneyStore.ts'),
            'utf8',
        )
        expect(store).toContain('restoreScholarshipAccess')
        expect(store).toContain('Does not reset the 30-day clock')
        expect(store).toContain('clearPaidAccessIfSubscriptionInactive')
        expect(store).toContain('checkScholarshipExpiry')
        const paywall = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/Paywall.tsx'),
            'utf8',
        )
        expect(paywall).toContain('onBack')
    })

    it('exposes Restore Purchases in Profile and on the paywall', () => {
        const profile = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/profile/ProfileSheet.tsx',
            ),
            'utf8',
        )
        expect(profile).toContain('Restore Purchases')
        expect(profile).toContain('syncAccessFromStoreReceipts')

        const gate = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/CommitmentGate.tsx',
            ),
            'utf8',
        )
        expect(gate).toContain('handleRestore')
        expect(gate).toMatch(/Restore Purchases/i)
        expect(gate).toContain('Already walked this path')
    })

    it('allows same-device scholarship reads in Firestore rules', () => {
        const rules = fs.readFileSync(
            path.join(__dirname, '..', 'firestore.rules'),
            'utf8',
        )
        expect(rules).toContain('scholarship_devices')
        expect(rules).toContain('allow read: if true')
    })

    it('drops the review bypass and revokes cancelled paid access', () => {
        const hub = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/ChakraHub.tsx'),
            'utf8',
        )
        const gate = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/CommitmentGate.tsx',
            ),
            'utf8',
        )
        expect(hub).not.toContain('handleAppStoreReviewLifetimeAccess')
        expect(gate).not.toContain('handleAppStoreReviewLifetimeAccess')
        expect(gate).not.toContain('logo-apple')
    })
})
