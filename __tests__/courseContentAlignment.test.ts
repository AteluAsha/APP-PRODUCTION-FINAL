/* eslint-env jest */
import { chakraContent } from '@/constants/chakras/content'
import { Chakra } from '@/types/chakras/Chakra'
import { getDayFromChakra, getChakraFromDay } from '@/utils/chakraMapping'
import { getIntegrationMomentContent } from '@/constants/chakras/integrationMomentContent'
import { getTomorrowAwakeningCopy } from '@/constants/tomorrowAwakeningCopy'
import { mantraForDay } from '@/constants/endOfDayPresenceCopy'
import { formatHeroAffirmationText } from '@/constants/heroAffirmation'
import { CHAKRA_NAMES } from '@/constants/chakras/chakraConstants'

const ALL_CHAKRAS: Chakra[] = [
    Chakra.ROOT,
    Chakra.SACRAL,
    Chakra.SOLAR_PLEXUS,
    Chakra.HEART,
    Chakra.THROAT,
    Chakra.THIRD_EYE,
    Chakra.CROWN,
]

const EXPECTED_HZ: Record<Chakra, string> = {
    [Chakra.ROOT]: '396',
    [Chakra.SACRAL]: '417',
    [Chakra.SOLAR_PLEXUS]: '528',
    [Chakra.HEART]: '639',
    [Chakra.THROAT]: '741',
    [Chakra.THIRD_EYE]: '852',
    [Chakra.CROWN]: '963',
}

const EXPECTED_DAY_LABEL: Record<Chakra, string> = {
    [Chakra.ROOT]: 'Day 1',
    [Chakra.SACRAL]: 'Day 2',
    [Chakra.SOLAR_PLEXUS]: 'Day 3',
    [Chakra.HEART]: 'Day 4',
    [Chakra.THROAT]: 'Day 5',
    [Chakra.THIRD_EYE]: 'Day 6',
    [Chakra.CROWN]: 'Day 7',
}

const EXPECTED_OUTRO_ELEMENT: Record<Chakra, string> = {
    [Chakra.ROOT]: 'Connected To The Earth',
    [Chakra.SACRAL]: 'Connected To The Water',
    [Chakra.SOLAR_PLEXUS]: 'Connected To The Fire',
    [Chakra.HEART]: 'Connected To The Air',
    [Chakra.THROAT]: 'Connected To The Ether',
    [Chakra.THIRD_EYE]: 'Connected To The Light',
    [Chakra.CROWN]: 'Connected To Consciousness',
}
const EXPECTED_LAW_NUMBER: Record<Chakra, string> = {
    [Chakra.ROOT]: 'SEVENTH',
    [Chakra.SACRAL]: 'SIXTH',
    [Chakra.SOLAR_PLEXUS]: 'FIFTH',
    [Chakra.HEART]: 'FOURTH',
    [Chakra.THROAT]: 'THIRD',
    [Chakra.THIRD_EYE]: 'SECOND',
    [Chakra.CROWN]: 'FIRST',
}

describe('course content alignment (chakra, day, frequency, gnosis)', () => {
    it.each(ALL_CHAKRAS)('%s header day label matches day index', (chakra) => {
        const dayIndex = getDayFromChakra(chakra)
        expect(chakraContent[chakra].header.textLine1).toBe(
            EXPECTED_DAY_LABEL[chakra],
        )
        expect(getChakraFromDay(dayIndex)).toBe(chakra)
    })

    it.each(ALL_CHAKRAS)(
        '%s integration outro title matches its elemental theme',
        (chakra) => {
            expect(chakraContent[chakra].audioOutro.title).toBe(
                EXPECTED_OUTRO_ELEMENT[chakra],
            )
        },
    )

    it.each(ALL_CHAKRAS)(
        '%s sound healing body uses its own Hz (SoundBath closing section)',
        (chakra) => {
            const hz = EXPECTED_HZ[chakra]
            const body = chakraContent[chakra].soundBath.body
            const pillDesc = chakraContent[chakra].pills.frequency.description

            expect(body).toContain(`${hz} Hz`)
            if (chakra === Chakra.ROOT) {
                expect(body).toContain('Liberation Frequency')
            } else {
                expect(body).toContain(pillDesc.split('. ')[0])
            }

            for (const [otherChakra, otherHz] of Object.entries(EXPECTED_HZ)) {
                if (otherChakra === chakra) continue
                expect(body).not.toContain(`${otherHz} Hz`)
            }
        },
    )

    it.each(ALL_CHAKRAS)(
        '%s frequency pill, sound bath title, and tuning fork Hz match',
        (chakra) => {
            const hz = EXPECTED_HZ[chakra]
            const { soundBath, pills } = chakraContent[chakra]

            expect(soundBath.title).toContain(`${hz} Hz`)
            expect(pills.frequency.hertz).toBe(`${hz} Hz`)
            expect(pills.frequency.modalTitle.toLowerCase()).toContain(
                hz,
            )
        },
    )

    it.each(ALL_CHAKRAS)(
        '%s head-to-heart law number counts down from seven',
        (chakra) => {
            const law = EXPECTED_LAW_NUMBER[chakra]
            expect(chakraContent[chakra].headtoheart.title).toContain(law)
        },
    )

    it('no two chakras share the same soundBath body (no copy-paste)',
        () => {
            const bodies = ALL_CHAKRAS.map((c) => chakraContent[c].soundBath.body)
            const unique = new Set(bodies)
            expect(unique.size).toBe(ALL_CHAKRAS.length)
        },
    )

    it('only Root soundBath body mentions Liberation Frequency', () => {
        for (const chakra of ALL_CHAKRAS) {
            const body = chakraContent[chakra].soundBath.body
            if (chakra === Chakra.ROOT) {
                expect(body).toContain('Liberation Frequency')
            } else {
                expect(body).not.toContain('Liberation Frequency')
                expect(body).not.toContain('396 Hz')
            }
        }
    })

    it('Throat Day 5 sound healing copy is expression / 741 Hz', () => {
        const throat = chakraContent[Chakra.THROAT].soundBath
        expect(getDayFromChakra(Chakra.THROAT)).toBe(4)
        expect(throat.title).toContain('Throat Chakra - 741 Hz')
        expect(throat.body).toMatch(/741 Hz/)
        expect(throat.body).toMatch(/expression|voice|communication/i)
        expect(throat.subtitle).toBe('vishuddha')
    })

    it('uses one integration invitation for every day', () => {
        const copy =
            'Today, we bring our divine energy out into the world by releasing it through the body.'
        for (const chakra of ALL_CHAKRAS) {
            expect(chakraContent[chakra].integration).toBe(copy)
        }
    })

    it('each day has unique integration moment gnosis', () => {
        const titles = ALL_CHAKRAS.map(
            (c) => getIntegrationMomentContent(getDayFromChakra(c))?.title,
        )
        expect(titles.every(Boolean)).toBe(true)
        expect(new Set(titles).size).toBe(7)
    })

    it('end-of-day mantras pull from the matching chakra affirmation', () => {
        for (let day = 0; day < 7; day++) {
            const chakra = getChakraFromDay(day)
            expect(mantraForDay(day)).toBe(
                formatHeroAffirmationText(
                    chakraContent[chakra].affirmationText,
                ),
            )
        }
    })

    it('tomorrow awakening previews the next chakra by name', () => {
        for (let completed = 0; completed < 6; completed++) {
            const nextDay = completed + 1
            const copy = getTomorrowAwakeningCopy(completed)
            const nextName = CHAKRA_NAMES[nextDay]
            expect(copy.nextDayIndex).toBe(nextDay)
            expect(copy.heading.toLowerCase()).toContain(nextName.toLowerCase())
        }
    })
})
