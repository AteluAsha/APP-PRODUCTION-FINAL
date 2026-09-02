import { isValidChakra } from "@/utils/validation"

/**
 * Course-day focus screens: the day page and its inner practices.
 * These must not show the hub toggle menu — only the notes leaf.
 */
export function isCourseFocusScreen(
    pathname: string | undefined,
    segments: readonly string[] = [],
): boolean {
    if (!pathname) return false
    if (
        pathname.includes("SoundBath") ||
        pathname.includes("HeadToHeart") ||
        pathname.includes("IntegrationPractice") ||
        pathname.includes("QuizScreen")
    ) {
        return true
    }
    const lastPart = pathname.split("/").filter(Boolean).pop()
    if (lastPart != null && isValidChakra(lastPart)) return true
    return segments.includes("[chakra]")
}

export function isChakraHubPath(pathname: string | undefined): boolean {
    return Boolean(pathname?.includes("ChakraHub"))
}
