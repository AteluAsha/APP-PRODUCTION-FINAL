/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { Chakra } from '../types/chakras/Chakra'
import {
    galleryChamberIndex,
    galleryFocusIndex,
    parseChakraSlug,
} from '../utils/chakraMapping'
import { GALLERY_CHAMBERS_NOTICE_COPY } from '../constants/galleryChambersCopy'

describe('gallery focus from View in Gallery', () => {
    const unlocked = [Chakra.ROOT, Chakra.SACRAL, Chakra.HEART]

    it('opens the exact gifted card', () => {
        expect(galleryFocusIndex(unlocked, Chakra.SACRAL)).toBe(1)
        expect(galleryFocusIndex(unlocked, Chakra.HEART)).toBe(2)
        expect(galleryFocusIndex(unlocked, Chakra.ROOT)).toBe(0)
    })

    it('falls back to the latest card when the slug is missing', () => {
        expect(galleryFocusIndex(unlocked, null)).toBe(2)
    })

    it('opens the matching chamber among all seven', () => {
        expect(galleryChamberIndex(Chakra.SACRAL, 0)).toBe(1)
        expect(galleryChamberIndex(Chakra.CROWN, 0)).toBe(6)
        expect(galleryChamberIndex(null, 3)).toBe(3)
        expect(galleryChamberIndex(null, 99)).toBe(6)
    })

    it('parses route slugs used by goodbye', () => {
        expect(parseChakraSlug('thirdeye')).toBe(Chakra.THIRD_EYE)
        expect(parseChakraSlug('solar')).toBe(Chakra.SOLAR_PLEXUS)
        expect(parseChakraSlug('not-a-chakra')).toBeNull()
    })

    it('pops gallery history when it can, else lands on ChakraHub', () => {
        const src = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/GalleryOfGnosis.tsx'),
            'utf8',
        )
        expect(src).toContain('router.canGoBack()')
        expect(src).toContain('router.back()')
        expect(src).toContain('goToChakraHubRoot()')
        expect(src).toContain('GalleryChamber')
        expect(src).toContain('GallerySpine')
        expect(src).toContain('GalleryChambersNoticeModal')
        expect(src).not.toContain('ChakraCard')
        expect(src).not.toContain('openedFromGift')
    })

    it('teaches the chambers once and keeps foods and stones in the room', () => {
        expect(GALLERY_CHAMBERS_NOTICE_COPY.title).toBe(
            'Gallery of Alignment',
        )
        expect(GALLERY_CHAMBERS_NOTICE_COPY.menuNote.toLowerCase()).toContain(
            'gallery',
        )
        expect(GALLERY_CHAMBERS_NOTICE_COPY.body).toContain(
            'The Bridge to your reality here',
        )
        expect(GALLERY_CHAMBERS_NOTICE_COPY.body).not.toMatch(/the I Am/i)
        expect(GALLERY_CHAMBERS_NOTICE_COPY.bodyAfter.toLowerCase()).toContain(
            'plate',
        )
        expect(GALLERY_CHAMBERS_NOTICE_COPY.cta).toBe('I am open to Receive')
        const chamber = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/gallery/GalleryChamber.tsx',
            ),
            'utf8',
        )
        expect(chamber).toContain('getGoodbyeField')
        expect(chamber).toContain('elements?.stones')
        expect(chamber).toContain('elements?.foods')
        expect(chamber).toContain('GALLERY_RETURN_TO_DAY')
        expect(chamber).toContain('GALLERY_OPEN_READING')
        expect(chamber).toContain('isFlipped')
        expect(chamber).toContain('rotateY')
        expect(chamber).not.toContain('isReading')
        const gallery = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/GalleryOfGnosis.tsx'),
            'utf8',
        )
        expect(gallery).toContain('flippedIndex')
        expect(gallery).toContain('registerAndroidHardwareBackOverride')
        expect(gallery).toContain('markDayCompleteDeparture')
        expect(gallery).not.toContain('SETTLE_NOTICE_MS')
        const layout = fs.readFileSync(
            path.join(__dirname, '..', 'app/(chakras)/_layout.tsx'),
            'utf8',
        )
        expect(layout).not.toContain('GiftChakra')
        const goodbye = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/chakras/GoodbyeModal.tsx',
            ),
            'utf8',
        )
        expect(goodbye).not.toContain('Claim Your Chakra Card')
        expect(goodbye).toContain('GALLERY_GOODBYE_DOOR')
    })
})
