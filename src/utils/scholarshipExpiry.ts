export function scholarshipExpiryStillValid(
    expiryIso: string,
    now: Date = new Date(),
): boolean {
    const expiry = new Date(expiryIso)
    if (Number.isNaN(expiry.getTime())) return false
    return expiry > now
}
