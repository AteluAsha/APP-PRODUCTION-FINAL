/**
 * Compare dotted app versions (1.1.27 vs 1.1.30) or numeric versionCodes.
 * Returns negative if a < b, zero if equal, positive if a > b.
 */
export function compareDottedVersion(a: string, b: string): number {
    const left = parseVersionParts(a)
    const right = parseVersionParts(b)
    const len = Math.max(left.length, right.length)
    for (let i = 0; i < len; i += 1) {
        const delta = (left[i] ?? 0) - (right[i] ?? 0)
        if (delta !== 0) return delta
    }
    return 0
}

export function isStoreVersionAhead(
    storeVersion: string,
    installedVersion: string,
): boolean {
    if (!storeVersion.trim() || !installedVersion.trim()) return false
    return compareDottedVersion(storeVersion, installedVersion) > 0
}

function parseVersionParts(value: string): number[] {
    return value
        .trim()
        .split(/[.+_-]/)
        .map((part) => {
            const n = Number.parseInt(part, 10)
            return Number.isFinite(n) ? n : 0
        })
}
