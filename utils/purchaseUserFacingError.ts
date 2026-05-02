/**
 * Paywall purchase errors: in release, never show raw RevenueCat / StoreKit strings.
 */

export const PAYWALL_PURCHASE_ERROR_GENERIC =
  "We couldn't complete your purchase. Please try again in a moment, or tap Restore Purchases if you already subscribe."

/**
 * Text for the red paywall banner. Returns null when the user cancelled (hide banner).
 */
export function purchaseErrorForPaywallBanner(
  message: string | undefined,
): string | null {
  const m = (message ?? "").trim()
  if (m.toLowerCase().includes("cancel")) {
    return null
  }
  if (__DEV__) {
    return m || "Something went wrong. Please try again."
  }
  return PAYWALL_PURCHASE_ERROR_GENERIC
}
