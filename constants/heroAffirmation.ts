/**
 * Hero affirmation typography — Day 1 is the master (36 / 44, up to two lines).
 */

export const HERO_AFFIRMATION_FONT_SIZE = 36
export const HERO_AFFIRMATION_LINE_HEIGHT = 44
export const HERO_AFFIRMATION_MAX_LINES = 2

/** Normalize spaces but keep intentional line breaks from content. */
export function formatHeroAffirmationText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n')
}
