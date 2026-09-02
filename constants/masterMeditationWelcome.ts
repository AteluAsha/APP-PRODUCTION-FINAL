/**
 * One-time welcome shown on the first tap of Day 1 Master Meditation (Root).
 * Copy stays close to the source voice; "listing" is corrected to "listening".
 */
export const ROOT_MASTER_MEDITATION_AUDIO_ID = 'embodiment_root'

export const MASTER_MEDITATION_WELCOME = {
    kicker: 'Master Meditation',
    title: '7 Days, 7 Powerful Meditations',
    paragraphs: [
        'These are the master tools of this course — seven powerful meditations over seven days, aligned with the cycles of the earth. Plan to listen to one chakra each day, beginning on a Monday.',
        'They run deep and may awaken what lies within you. Just breathe, and let them wash over you.',
        'Sit in meditation, close your eyes, and let it flow.',
    ],
    cta: 'I am ready',
} as const

export function shouldShowMasterMeditationWelcome(
    embodimentCacheKey: string | undefined,
    hasSeen: boolean,
): boolean {
    return embodimentCacheKey === ROOT_MASTER_MEDITATION_AUDIO_ID && !hasSeen
}
