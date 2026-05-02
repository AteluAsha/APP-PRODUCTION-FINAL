/**
 * Detect corrupt trial scheduling (e.g. backup restore) so we can recover to DateSelection.
 */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

export function isWellFormedCourseStartIso(iso: string): boolean {
  if (!ISO_DAY.test(iso)) return false
  const d = new Date(`${iso}T00:00:00`)
  return !Number.isNaN(d.getTime())
}
