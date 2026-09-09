import { ImageSourcePropType } from 'react-native'
import { Chakra } from '@/types/chakras/Chakra'

export type YogaStudioPage = {
    poseName: string
    sanskrit: string
    figure: ImageSourcePropType
    poseUrl?: string
}

export const YOGA_STUDIO_KICKER = 'Body Healing'

export const BODY_HEALING_HEADING: Record<Chakra, string> = {
    [Chakra.ROOT]: 'Grounding Into the Earth Body',
    [Chakra.SACRAL]: 'Flowing Into Expression',
    [Chakra.SOLAR_PLEXUS]: 'Channeling The Sun Fire',
    [Chakra.HEART]: 'Opening The Heart Body',
    [Chakra.THROAT]: 'Releasing Control',
    [Chakra.THIRD_EYE]: 'Witness Our Duality',
    [Chakra.CROWN]: 'Opening to All That Is',
}

export const YOGA_STUDIO: Record<Chakra, YogaStudioPage> = {
    [Chakra.ROOT]: {
        poseName: 'Mountain Pose',
        sanskrit: 'Tadasana',
        figure: require('@/assets/images/yoga-poses/mountain.png'),
        poseUrl: 'https://pocketyoga.com/pose/MountainArmsSide',
    },
    [Chakra.SACRAL]: {
        poseName: 'Seated Circles',
        sanskrit: 'Sufi Grind',
        figure: require('@/assets/images/yoga-poses/sufi-grind.png'),
    },
    [Chakra.SOLAR_PLEXUS]: {
        poseName: 'Seated Spinal Twist',
        sanskrit: 'Marichyasana',
        figure: require('@/assets/images/yoga-poses/spinal-twist.png'),
        poseUrl: 'https://pocketyoga.com/pose/MarichiIII',
    },
    [Chakra.HEART]: {
        poseName: 'Supported Fish',
        sanskrit: 'Matsyasana',
        figure: require('@/assets/images/yoga-poses/supported-fish.png'),
        poseUrl: 'https://pocketyoga.com/pose/FishPreparation',
    },
    [Chakra.THROAT]: {
        poseName: 'Seated Neck Release',
        sanskrit: 'Sukhasana',
        figure: require('@/assets/images/yoga-poses/neck-release.png'),
        poseUrl: 'https://www.youtube.com/watch?v=zLvJD7iKVhw',
    },
    [Chakra.THIRD_EYE]: {
        poseName: "Child's Pose",
        sanskrit: 'Balasana',
        figure: require('@/assets/images/yoga-poses/childs-pose.png'),
        poseUrl: 'https://pocketyoga.com/pose/ChildTraditional',
    },
    [Chakra.CROWN]: {
        poseName: 'Corpse Pose',
        sanskrit: 'Savasana',
        figure: require('@/assets/images/yoga-poses/savasana.png'),
        poseUrl: 'https://www.youtube.com/watch?v=TcO40hEcVl4',
    },
}
