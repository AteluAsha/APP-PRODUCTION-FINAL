/**
 * expo-av on Android and iOS needs file:/// (three slashes). Native File.toURI()
 * can emit file:/ (one slash). Normalize so createAsync always gets an absolute
 * file:/// URI for on-device playback.
 *
 * Lives in its own module so vault auto-playback does not import
 * crystalBowlPlayback (that cycle left auto-playback undefined on course-day mount).
 */
export function toAbsoluteFileUri(uri: string): string {
  const trimmed = uri.trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith("file:///")) return trimmed
  if (trimmed.startsWith("content:")) return trimmed
  if (trimmed.startsWith("file:/")) {
    const afterScheme = trimmed.slice("file:".length)
    const path = afterScheme.replace(/^\/+/, "/")
    return `file://${path}`
  }
  if (trimmed.startsWith("/")) return `file://${trimmed}`
  return trimmed
}
