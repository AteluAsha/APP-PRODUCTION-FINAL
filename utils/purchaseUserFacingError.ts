/**
 * Paywall purchase errors: in release, never show raw RevenueCat / StoreKit strings.
 */

export const PAYWALL_PURCHASE_ERROR_GENERIC =
  "We couldn't complete your purchase. Please try again in a moment, or tap Restore Purchases if you already subscribe."

export const PAYWALL_PURCHASE_ERROR_BILLING_UNAVAILABLE =
  "Purchases aren't available on this device. Restore Purchases if you already subscribe, or try on a device with the store enabled."

/**
 * Text for the red paywall banner. Returns null when the user cancelled (hide banner).
 */
export function purchaseErrorForPaywallBanner(
  message: string | undefined,
): string | null {
  const m = (message ?? "").trim()
  const lower = m.toLowerCase()
  if (lower.includes("cancel")) {
    return null
  }
  if (
    lower.includes("billing_unavailable") ||
    lower.includes("billing unavailable") ||
    lower.includes("billing is not available") ||
    (lower.includes("billing") && lower.includes("unavailable"))
  ) {
    return PAYWALL_PURCHASE_ERROR_BILLING_UNAVAILABLE
  }
  if (__DEV__) {
    return m || "Something went wrong. Please try again."
  }
  return PAYWALL_PURCHASE_ERROR_GENERIC
}
