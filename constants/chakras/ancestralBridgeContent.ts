import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import { getGoodbyeField } from '@/constants/sanctuaryFields'
import { getDayFromChakra } from '@/utils/chakraMapping'

export function getAncestralChamberField(chakra: Chakra) {
    return getGoodbyeField(getDayFromChakra(chakra))
}

export const BRIDGE_EXPLAINER =
    'Learning to embody the soul is all about integration — bringing that knowing into your reality. Here we bridge the gap between your self and your soul, and come back into the now moment.'

export const ASHA_SPEAKS_KICKER = 'Ancestral Gnosis'
export const ASHA_SPEAKS_TITLE = 'Divine Laws of The Universe'
export const ASHA_SPEAKS_SUBLINE = 'with Asha'
export const BRIDGE_CUE_TEACHING_DAY_INDEXES = [0, 1, 2] as const
export const BRIDGE_CUE_MIN_COMPLETION = 0.8
export const BRIDGE_CUE_COPY = {
    title: 'The Bridge is waiting',
    body: 'These two belong together. Master Meditation to begin — Divine Laws of The Universe with Asha to return with the keys.',
    continue: 'Continue with Asha',
    notNow: 'Not now',
} as const
export const MASTER_KEY_LABEL = 'The Master Key'
export const RECEIVE_MASTER_KEY_LABEL = 'I receive this'
export const LISTEN_WITH_ASHA_LABEL = 'Listen with Asha'

/** Part II — frequency healing copy. Ancestral gnosis no longer lives here. */
export const FREQUENCY_HEALING_COPY: Record<
    Chakra,
    { heading: string; description: string }
> = {
    [Chakra.ROOT]: {
        heading: 'Sound Healing',
        description:
            '396 Hz is the vibration of safety. Let this tone settle the nervous system, root you in the body, and turn survival noise into presence.',
    },
    [Chakra.SACRAL]: {
        heading: 'Sound Healing',
        description:
            '417 Hz is the frequency of change. Let it loosen stuck emotion, restore creative flow, and bring your feeling-body back into alignment.',
    },
    [Chakra.SOLAR_PLEXUS]: {
        heading: 'Sound Healing',
        description:
            '528 Hz is the miracle tone of transformation. Let it warm the gut, restore will, and tune personal power into coherent fire.',
    },
    [Chakra.HEART]: {
        heading: 'Sound Healing',
        description:
            '639 Hz is harmonic connection. Let this frequency open the chest, soften grief, and align the heart with compassion in the room you are in.',
    },
    [Chakra.THROAT]: {
        heading: 'Sound Healing',
        description:
            '741 Hz is the vibration of truth. Let it clear the voice, unknot the jaw, and bring your inner signal into honest sound.',
    },
    [Chakra.THIRD_EYE]: {
        heading: 'Sound Healing',
        description:
            '852 Hz is inner vision. Let it quiet mental static, awaken intuition, and bring the mind into a single, listening frequency.',
    },
    [Chakra.CROWN]: {
        heading: 'Sound Healing',
        description:
            '963 Hz is the frequency of oneness. Let it dissolve the sense of separate self and rest you in the wide, healing field of Spirit.',
    },
}

export function getBridgeLawLabel(chakra: Chakra): string {
    const { title, subtitle } = chakraContent[chakra].headtoheart
    return `${title}  ·  ${subtitle.replace(/"/g, '')}`
}

export function getAncestralNowLanding(chakra: Chakra): {
    title: string
    subline: string
    intention?: string
    action?: string
    reality?: string
} {
    const heart = chakraContent[chakra].headtoheart
    const pick = (prefix: string) =>
        heart.dailyActivity.find((segment) =>
            segment.title?.toLowerCase().startsWith(prefix),
        )?.text

    return {
        title: heart.dailyActivityTitle,
        subline: heart.dailyActivitySubline,
        intention: pick('the intention'),
        action: pick('the action'),
        reality: pick('the reality check'),
    }
}
