import type { ImageSourcePropType } from 'react-native'

export const WELLNESS_GATE_FIELD: ImageSourcePropType = require(
    '@/assets/images/sanctuary/wellness-gate-sanctuary.jpg',
)

/** ChakraHub: earth-to-stars field. Keep veiled so the stack stays the light. */
export const HUB_COSMIC_FIELD: ImageSourcePropType = require(
    '@/assets/images/sanctuary/hub-cosmic-field.png',
)

const GOODBYE_FIELDS: ImageSourcePropType[] = [
    require('@/assets/images/sanctuary/goodbye-earth-root.jpg'),
    require('@/assets/images/sanctuary/goodbye-water-sacral.jpg'),
    require('@/assets/images/sanctuary/goodbye-fire-solar.jpg'),
    require('@/assets/images/sanctuary/goodbye-air-heart.jpg'),
    require('@/assets/images/sanctuary/goodbye-ether-throat.jpg'),
    require('@/assets/images/sanctuary/goodbye-light-thirdeye.jpg'),
    require('@/assets/images/sanctuary/goodbye-oneness-crown.jpg'),
]

/** Day 0–6: Earth, Water, Fire, Air, Ether, Light being, Full expansion. */
export function getGoodbyeField(dayIndex?: number): ImageSourcePropType {
    if (dayIndex == null || dayIndex < 0 || dayIndex > 6) {
        return GOODBYE_FIELDS[0]
    }
    return GOODBYE_FIELDS[dayIndex]
}
