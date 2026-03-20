/**
 * RevenueCat Service Configuration
 *
 * Manages in-app purchases and subscriptions for the SOUL SCHOOL app.
 * Handles product purchases, entitlement checking, and customer info management.
 *
 * Key implementation details:
 * - Uses RevenueCat React Native SDK for cross-platform purchases
 * - Manages "premium" entitlement for full sanctuary access
 * - Fetches the Current offering from the dashboard (no fixed offering id)
 * - Purchase logic uses Package identifiers ($rc_monthly, $rc_annual); RevenueCat maps to store products per platform
 * - Scholarship path does not use RevenueCat (energy exchange bypass)
 *
 * Package identifiers (RevenueCat dashboard – same on Apple and Google):
 * - $rc_monthly: New Awakenings ($7/mo)
 * - $rc_annual: Full Sanctuary ($55/yr)
 *
 * Entitlement:
 * - "premium": Grants full access to all sanctuary content
 */

import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct,
} from "react-native-purchases"
import { Platform } from "react-native"
import Constants from "expo-constants"
import {
  REVENUECAT_PUBLIC_SDK_KEY_ANDROID,
  REVENUECAT_PUBLIC_SDK_KEY_IOS,
  REVENUECAT_APP_NAME,
} from "@/src/core/config/revenueCatConfig"

// Get RevenueCat API Key: env first, then SOUL SCHOOL config (by platform)
const getRevenueCatApiKey = (): string | null => {
  try {
    const fromEnv = Constants.expoConfig?.extra?.revenuecat?.apiKey
    if (fromEnv && fromEnv !== "") {
      return fromEnv
    }
    if (Platform.OS === "android") {
      return REVENUECAT_PUBLIC_SDK_KEY_ANDROID || null
    }
    if (Platform.OS === "ios" && REVENUECAT_PUBLIC_SDK_KEY_IOS) {
      return REVENUECAT_PUBLIC_SDK_KEY_IOS
    }
    return null
  } catch {
    return null
  }
}

// RevenueCat API Key - may be null if not configured
const REVENUECAT_API_KEY = getRevenueCatApiKey()

// Entitlement identifier (RevenueCat dashboard)
export const ENTITLEMENT_ID = "premium"

/**
 * Check if RevenueCat is configured
 */
export const isRevenueCatAvailable = (): boolean => {
  return !!REVENUECAT_API_KEY && REVENUECAT_API_KEY !== ""
}

/**
 * Package identifiers from the Current offering.
 * Use these for paywall: RevenueCat resolves to the correct store product per platform.
 */
export const PACKAGE_IDENTIFIERS = {
  /** New Awakenings – $7/month */
  MONTHLY: "$rc_monthly",
  /** Full Sanctuary – $55/year */
  ANNUAL: "$rc_annual",
  /** Optional; only shown if present in Current offering */
  LIFETIME: "$rc_lifetime",
} as const

export type PackageIdentifier =
  (typeof PACKAGE_IDENTIFIERS)[keyof typeof PACKAGE_IDENTIFIERS]

/**
 * Known store product identifiers for status display only (entitlement.productIdentifier).
 * Used to show "New Awakenings" / "Full Sanctuary" in Account; not used for purchase.
 */
export const KNOWN_PRODUCT_IDS_FOR_LABEL = {
  MONTHLY: ["ss_monthly_7", "prod46ac7140ca"],
  ANNUAL: ["ss_yearly_55", "prod817dd44ada"],
} as const

/** Legacy: product ids for Contribute / other flows that look up by product id. Prefer PACKAGE_IDENTIFIERS for paywall. */
export const PRODUCT_IDS = {
  MONTHLY: PACKAGE_IDENTIFIERS.MONTHLY,
  YEARLY: PACKAGE_IDENTIFIERS.ANNUAL,
  LIFETIME: PACKAGE_IDENTIFIERS.LIFETIME,
  CONTRIBUTION_7: "contribution_7",
  CONTRIBUTION_11: "contribution_11",
  CONTRIBUTION_22: "contribution_22",
  CONTRIBUTION_55: "contribution_55",
} as const

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]

// Initialize RevenueCat SDK
let isInitialized = false

/**
 * Initialize RevenueCat SDK with API key
 * Should be called once when app starts
 * Automatically links purchases to user ID
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  try {
    if (!REVENUECAT_API_KEY) {
      if (__DEV__) {
        console.warn(
          "RevenueCat API key is not configured. Purchases will not be available.",
        )
      }
      return // Gracefully exit if API key is missing
    }

    if (isInitialized) {
      if (__DEV__) {
        console.log("RevenueCat already initialized")
      }
      // If already initialized but new userId provided, link it
      if (userId) {
        // TypeScript: userId is string | undefined, but we check it above
        await Purchases.logIn(userId as string)
        if (__DEV__) {
          console.log("[RevenueCat] User ID linked:", userId)
        }
      }
      return
    }

    // Configure RevenueCat with API key
    // TypeScript type guard - ensure API key is string (not null)
    const apiKey: string | null = REVENUECAT_API_KEY
    if (!apiKey || typeof apiKey !== "string") {
      if (__DEV__) {
        console.warn("[RevenueCat] API key not configured")
      }
      return
    }

    // At this point, apiKey is guaranteed to be string (after type guard check)
    const validApiKey: string = apiKey as string

    // Custom log handler: downgrade expected/transient errors to warn so they don't
    // show the red console error overlay. Network errors are expected when device is offline
    // or api.revenuecat.com is unreachable (DNS/connectivity).
    Purchases.setLogHandler((level, message) => {
      const isOfferingsConfigError =
        level === LOG_LEVEL.ERROR &&
        (message.includes("no products") ||
          message.includes("offerings") ||
          message.includes("safely ignore") ||
          message.includes("configuration"))
      const isNetworkError =
        level === LOG_LEVEL.ERROR &&
        (message.includes("NetworkError") ||
          message.includes("Unable to resolve host") ||
          message.includes("No address associated with hostname") ||
          message.includes("Error performing request"))
      // Downgrade to warn always (not just __DEV__) so device/emulator doesn't show red Console Error when offline or DNS unreachable
      if (isOfferingsConfigError || isNetworkError) {
        console.warn("[RevenueCat]", message)
        return
      }
      switch (level) {
        case LOG_LEVEL.DEBUG:
          console.debug("[RevenueCat]", message)
          break
        case LOG_LEVEL.INFO:
          console.info("[RevenueCat]", message)
          break
        case LOG_LEVEL.WARN:
          console.warn("[RevenueCat]", message)
          break
        case LOG_LEVEL.ERROR:
          console.error("[RevenueCat]", message)
          break
        default:
          console.log("[RevenueCat]", message)
      }
    })

    if (Platform.OS === "ios") {
      await Purchases.configure({ apiKey: validApiKey })
    } else if (Platform.OS === "android") {
      await Purchases.configure({ apiKey: validApiKey })
    } else {
      if (__DEV__) {
        console.warn("RevenueCat not supported on this platform")
      }
      return
    }

    // Get user ID if not provided (for linking purchases)
    let finalUserId: string | undefined = userId
    if (!finalUserId) {
      const { getUserId } = await import("./userId")
      finalUserId = await getUserId()
    }

    // Link purchases to user ID (important for restore purchases)
    // getUserId() always returns a string, so finalUserId is string here after the if block
    if (finalUserId) {
      // TypeScript: finalUserId is string here (either from userId or getUserId())
      await Purchases.logIn(finalUserId as string)
      if (__DEV__) {
        console.log(
          "[RevenueCat] Initialized and linked to user ID:",
          finalUserId,
        )
      }
    }

    // Set log level - suppress verbose logs for configuration errors
    // Use WARN level to reduce noise from expected configuration issues
    if (__DEV__) {
      // Use WARN level to reduce configuration error spam
      // Configuration errors are expected during development setup
      Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN)
    } else {
      // Production uses ERROR level only
      Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR)
    }

    // Set user attributes for a more personalized, heart-minded experience
    // These attributes may appear in payment flows and customer communications
    try {
      await Purchases.setAttributes({
        app_name: REVENUECAT_APP_NAME,
        app_theme: "healing",
        app_vibe: "heart_minded",
      })

      if (__DEV__) {
        console.log(
          "[RevenueCat] User attributes set for heart-minded experience",
        )
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("[RevenueCat] Could not set user attributes:", error)
      }
    }

    isInitialized = true
    if (__DEV__) {
      console.log("RevenueCat initialized successfully")
    }

    // Sync purchase status to journey store – ensures hasLifetimeAccess matches RevenueCat
    // (handles reinstall, device change, or store corruption)
    try {
      const hasEntitlement = await hasActiveEntitlement()
      if (hasEntitlement) {
        const { useChakraJourneyStore } =
          await import("@/hooks/useChakraJourneyStore")
        useChakraJourneyStore.getState().grantLifetimeAccess("paid")
      }
    } catch (syncErr) {
      if (__DEV__) {
        console.warn("[RevenueCat] Sync to store failed:", syncErr)
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to initialize RevenueCat:", error)
    }
    // Don't throw - allow app to continue without RevenueCat
  }
}

/**
 * Log out the current RevenueCat user. Resets to a new anonymous user on the device.
 * Use when user deletes account / starts over so next launch has no entitlement.
 */
export async function logOut(): Promise<void> {
  if (!isInitialized) return
  try {
    await Purchases.logOut()
    if (__DEV__) {
      console.log("[RevenueCat] Logged out; device will get new anonymous user on next identify.")
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("[RevenueCat] logOut failed:", error)
    }
  }
}

/**
 * Link a new user ID to RevenueCat (e.g. after "Request new SOUL SCHOOL ID").
 * No-op if RevenueCat is not configured or not initialized.
 */
export async function linkUserId(userId: string): Promise<void> {
  try {
    if (!REVENUECAT_API_KEY || !isInitialized) return
    await Purchases.logIn(userId)
    if (__DEV__) {
      console.log("[RevenueCat] User ID linked:", userId)
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("[RevenueCat] linkUserId failed:", error)
    }
  }
}

/**
 * Check if user has active entitlement (premium)
 */
export const hasActiveEntitlement = async (): Promise<boolean> => {
  if (!isInitialized) {
    return false
  }
  try {
    const customerInfo = await Purchases.getCustomerInfo()
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
  } catch (error) {
    if (__DEV__) {
      console.error("Error checking entitlement:", error)
    }
    return false
  }
}

/**
 * Get current customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isInitialized) {
    return null
  }
  try {
    return await Purchases.getCustomerInfo()
  } catch (error) {
    if (__DEV__) {
      console.error("Error getting customer info:", error)
    }
    return null
  }
}

/**
 * Check if error is a configuration error (expected during development)
 */
const isConfigurationError = (error: any): boolean => {
  const errorMessage = error?.message || String(error) || ""
  const lowerMessage = errorMessage.toLowerCase()

  return (
    lowerMessage.includes("api key") ||
    lowerMessage.includes("not recognized") ||
    lowerMessage.includes("configuration") ||
    lowerMessage.includes("app store connect") ||
    lowerMessage.includes("storekit configuration") ||
    lowerMessage.includes("products registered") ||
    lowerMessage.includes("could not be fetched") ||
    lowerMessage.includes("singleton instance") ||
    lowerMessage.includes("configure purchases")
  )
}

/**
 * Get the Current offering (dashboard "Current" offering).
 * No fixed offering id – whatever is set as Current in RevenueCat is used.
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  if (!isInitialized) {
    return null
  }
  try {
    const offerings = await Purchases.getOfferings()
    return offerings.current
  } catch (error) {
    // Suppress configuration errors during development (expected)
    if (__DEV__ && isConfigurationError(error)) {
      // Silently return null - this is expected during development
      return null
    }
    // Only log actual errors, not configuration issues
    if (__DEV__ && !isConfigurationError(error)) {
      console.error("Error getting offerings:", error)
    }
    return null
  }
}

/**
 * Get available packages from current offering
 */
export const getPackages = async (): Promise<PurchasesPackage[]> => {
  try {
    const offering = await getOfferings()
    return offering?.availablePackages || []
  } catch (error) {
    // Suppress configuration errors during development (expected)
    if (__DEV__ && isConfigurationError(error)) {
      // Silently return empty array - this is expected during development
      return []
    }
    // Only log actual errors, not configuration issues
    if (__DEV__ && !isConfigurationError(error)) {
      console.error("Error getting packages:", error)
    }
    return []
  }
}

/**
 * Purchase a package
 *
 * This will show the native payment sheet (iOS/Android) automatically.
 * The native UI handles the entire purchase flow.
 *
 * Pattern matches RevenueCat documentation:
 * - Shows native payment sheet
 * - Returns customerInfo with entitlements
 * - Handles user cancellation gracefully
 */
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage,
): Promise<CustomerInfo> => {
  if (!isInitialized) {
    throw new Error(
      "RevenueCat is not configured. Purchases are not available.",
    )
  }
  try {
    if (__DEV__) {
      console.log(
        "[RevenueCat] Purchasing package:",
        packageToPurchase.identifier,
      )
      console.log("[RevenueCat] Product:", packageToPurchase.product.identifier)
      console.log("[RevenueCat] Price:", packageToPurchase.product.priceString)
    }

    // This will show the native payment sheet automatically
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase)

    if (__DEV__) {
      console.log("[RevenueCat] Purchase completed")
      console.log(
        "[RevenueCat] CustomerInfo entitlements:",
        Object.keys(customerInfo.entitlements.active),
      )
    }

    return customerInfo
  } catch (error: any) {
    // Handle user cancellation - this is not an error, user chose to cancel
    if (error.userCancelled) {
      if (__DEV__) {
        console.log("[RevenueCat] User cancelled purchase")
      }
      throw new Error("Purchase was cancelled")
    }
    // Handle other errors
    if (__DEV__) {
      console.error("[RevenueCat] Purchase error:", error)
    }
    throw error
  }
}

/**
 * Alternate identifiers to try when resolving a package.
 * RevenueCat dashboard may use $rc_* or custom names; App Store product IDs also work.
 */
const PACKAGE_ID_FALLBACKS: Record<string, string[]> = {
  [PACKAGE_IDENTIFIERS.MONTHLY]: [
    PACKAGE_IDENTIFIERS.MONTHLY,
    "monthly",
    ...KNOWN_PRODUCT_IDS_FOR_LABEL.MONTHLY,
  ],
  [PACKAGE_IDENTIFIERS.ANNUAL]: [
    PACKAGE_IDENTIFIERS.ANNUAL,
    "annual",
    "yearly",
    ...KNOWN_PRODUCT_IDS_FOR_LABEL.ANNUAL,
  ],
}

function findPackageByIdentifierOrProduct(
  packages: PurchasesPackage[],
  id: string,
): PurchasesPackage | undefined {
  return (
    packages.find((pkg) => pkg.identifier === id) ??
    packages.find((pkg) => pkg.product.identifier === id)
  )
}

/**
 * Resolve a package by primary id or fallback identifiers (for paywall display and purchase).
 * Use this so RevenueCat dashboard package names don't have to match $rc_monthly / $rc_annual exactly.
 */
export function getPackageWithFallback(
  packages: PurchasesPackage[],
  packageOrProductId: string,
): PurchasesPackage | undefined {
  const idsToTry =
    PACKAGE_ID_FALLBACKS[packageOrProductId] ?? [packageOrProductId]
  for (const id of idsToTry) {
    const pkg = findPackageByIdentifierOrProduct(packages, id)
    if (pkg) return pkg
  }
  return undefined
}

/**
 * Purchase by package identifier ($rc_monthly, $rc_annual) or product identifier (fallback).
 * Tries primary id then common alternates so RevenueCat dashboard naming doesn't have to match exactly.
 */
export const purchaseProduct = async (
  packageOrProductId: string,
): Promise<CustomerInfo> => {
  try {
    const packages = await getPackages()
    const packageToPurchase = getPackageWithFallback(
      packages,
      packageOrProductId,
    )

    if (!packageToPurchase) {
      throw new Error(
        `Package or product ${packageOrProductId} not found. In RevenueCat, set Current offering package identifiers to $rc_monthly and $rc_annual, or link products with those App Store product IDs.`,
      )
    }

    return await purchasePackage(packageToPurchase)
  } catch (error) {
    if (__DEV__) {
      console.error(`Error purchasing ${packageOrProductId}:`, error)
    }
    throw error
  }
}

/**
 * Restore purchases (for users who have purchased on another device)
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  if (!isInitialized) {
    throw new Error("RevenueCat is not configured. Restore is not available.")
  }
  try {
    return await Purchases.restorePurchases()
  } catch (error) {
    if (__DEV__) {
      console.error("Error restoring purchases:", error)
    }
    throw error
  }
}

/**
 * Check if user is eligible for promotional offer
 * NOTE: This method is not available in the current RevenueCat SDK version.
 * Promotional offers are handled automatically by RevenueCat.
 * @deprecated - Not available in current SDK, kept for future compatibility
 */
export const checkPromotionalOfferEligibility = async (
  product: PurchasesStoreProduct,
): Promise<boolean> => {
  // Promotional offers are handled automatically by RevenueCat
  // This function is kept for future compatibility but always returns false
  if (__DEV__) {
    console.warn(
      "checkPromotionalOfferEligibility is not available in current SDK version. Promotional offers are handled automatically by RevenueCat.",
    )
  }
  return false
}

/**
 * Present Customer Center (manage subscriptions)
 * Opens the native subscription management screen
 */
export const presentCustomerCenter = async (): Promise<void> => {
  if (!isInitialized) {
    return
  }
  try {
    if (Platform.OS === "ios") {
      await Purchases.showManageSubscriptions()
    } else if (Platform.OS === "android") {
      await Purchases.showManageSubscriptions()
    } else {
      if (__DEV__) {
        console.warn("Customer Center not supported on this platform")
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error("Error presenting customer center:", error)
    }
    throw error
  }
}

/**
 * Get product by package identifier ($rc_monthly, $rc_annual) or product identifier (fallback).
 */
export const getProduct = async (
  packageOrProductId: string,
): Promise<PurchasesStoreProduct | null> => {
  try {
    const packages = await getPackages()
    const pkg =
      packages.find((p) => p.identifier === packageOrProductId) ??
      packages.find((p) => p.product.identifier === packageOrProductId)
    return pkg?.product ?? null
  } catch (error) {
    if (__DEV__) {
      console.error(`Error getting product ${packageOrProductId}:`, error)
    }
    return null
  }
}

/**
 * Sync purchase status with app state
 * Call this after purchase to update local state
 */
export const syncPurchaseStatus = async (): Promise<{
  hasEntitlement: boolean
  customerInfo: CustomerInfo | null
}> => {
  try {
    const hasEntitlement = await hasActiveEntitlement()
    const customerInfo = await getCustomerInfo()
    return { hasEntitlement, customerInfo }
  } catch (error) {
    if (__DEV__) {
      console.error("Error syncing purchase status:", error)
    }
    return { hasEntitlement: false, customerInfo: null }
  }
}

// Export types for use in components
export type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct,
}
