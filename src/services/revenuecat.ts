/**
 * RevenueCat Service Configuration
 *
 * Manages in-app purchases and subscriptions for the Soul School app.
 * Handles product purchases, entitlement checking, and customer info management.
 *
 * Key implementation details:
 * - Uses RevenueCat React Native SDK for cross-platform purchases
 * - Manages "Soul School Pro" entitlement for lifetime access
 * - Supports two product types: annual and lifetime (no monthly subscription)
 * - Integrates with payment gate for annual subscription or scholarship
 *
 * Products:
 * - yearly: Annual subscription
 * - lifetime: Lifetime access (via annual payment or scholarship)
 *
 * Entitlement:
 * - "Soul School Pro": Grants full lifetime access to all chakra content
 */

import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
    PurchasesStoreProduct,
} from 'react-native-purchases'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

// Get RevenueCat API Key from environment variables via expo-constants
const getRevenueCatApiKey = (): string | null => {
    try {
        const apiKey = Constants.expoConfig?.extra?.revenuecat?.apiKey
        if (!apiKey || apiKey === '') {
            return null
        }
        return apiKey
    } catch {
        return null
    }
}

// RevenueCat API Key (from environment variables) - may be null if not configured
const REVENUECAT_API_KEY = getRevenueCatApiKey()

// Entitlement identifier
export const ENTITLEMENT_ID = 'Soul School Pro'

// Product identifiers
// Note: Only annual subscription and lifetime (via scholarship) are available

/**
 * Check if RevenueCat is configured
 */
export const isRevenueCatAvailable = (): boolean => {
    return !!REVENUECAT_API_KEY && REVENUECAT_API_KEY !== ''
}
// No monthly subscription option
export const PRODUCT_IDS = {
    YEARLY: 'yearly',
    LIFETIME: 'lifetime',
} as const

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]

// Initialize RevenueCat SDK
let isInitialized = false

/**
 * Initialize RevenueCat SDK with API key
 * Should be called once when app starts
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
    try {
        if (!REVENUECAT_API_KEY) {
            if (__DEV__) {
                console.warn('RevenueCat API key is not configured. Purchases will not be available.')
            }
            return // Gracefully exit if API key is missing
        }

        if (isInitialized) {
            if (__DEV__) {
                console.log('RevenueCat already initialized')
            }
            return
        }

        // Configure RevenueCat with API key
        if (Platform.OS === 'ios') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY })
        } else if (Platform.OS === 'android') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY })
        } else {
            if (__DEV__) {
                console.warn('RevenueCat not supported on this platform')
            }
            return
        }

        // Set user ID if provided (for user identification)
        if (userId) {
            await Purchases.logIn(userId)
        }

        // Enable debug logs in development
        if (__DEV__) {
            Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)
        }

        isInitialized = true
        if (__DEV__) {
            console.log('RevenueCat initialized successfully')
        }
    } catch (error) {
        if (__DEV__) {
            console.error('Failed to initialize RevenueCat:', error)
        }
        // Don't throw - allow app to continue without RevenueCat
    }
}

/**
 * Check if user has active entitlement (Soul School Pro)
 */
export const hasActiveEntitlement = async (): Promise<boolean> => {
    try {
        const customerInfo = await Purchases.getCustomerInfo()
        return (
            customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
        )
    } catch (error) {
        if (__DEV__) {
            console.error('Error checking entitlement:', error)
        }
        return false
    }
}

/**
 * Get current customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
    try {
        return await Purchases.getCustomerInfo()
    } catch (error) {
        if (__DEV__) {
            console.error('Error getting customer info:', error)
        }
        return null
    }
}

/**
 * Get available offerings (products available for purchase)
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
        const offerings = await Purchases.getOfferings()
        return offerings.current
    } catch (error) {
        if (__DEV__) {
            console.error('Error getting offerings:', error)
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
        if (__DEV__) {
            console.error('Error getting packages:', error)
        }
        return []
    }
}

/**
 * Purchase a package
 */
export const purchasePackage = async (
    packageToPurchase: PurchasesPackage,
): Promise<CustomerInfo> => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(
            packageToPurchase,
        )
        return customerInfo
    } catch (error: any) {
        // Handle user cancellation
        if (error.userCancelled) {
            throw new Error('Purchase was cancelled')
        }
        // Handle other errors
        if (__DEV__) {
            console.error('Purchase error:', error)
        }
        throw error
    }
}

/**
 * Purchase a product by identifier
 * Finds the package with matching identifier and purchases it
 */
export const purchaseProduct = async (
    productId: ProductId,
): Promise<CustomerInfo> => {
    try {
        const packages = await getPackages()
        const packageToPurchase = packages.find(
            (pkg) => pkg.product.identifier === productId,
        )

        if (!packageToPurchase) {
            throw new Error(`Product ${productId} not found`)
        }

        return await purchasePackage(packageToPurchase)
    } catch (error) {
        if (__DEV__) {
            console.error(`Error purchasing product ${productId}:`, error)
        }
        throw error
    }
}

/**
 * Restore purchases (for users who have purchased on another device)
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
    try {
        return await Purchases.restorePurchases()
    } catch (error) {
        if (__DEV__) {
            console.error('Error restoring purchases:', error)
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
        console.warn('checkPromotionalOfferEligibility is not available in current SDK version. Promotional offers are handled automatically by RevenueCat.')
    }
    return false
}

/**
 * Present Customer Center (manage subscriptions)
 * Opens the native subscription management screen
 */
export const presentCustomerCenter = async (): Promise<void> => {
    try {
        if (Platform.OS === 'ios') {
            await Purchases.showManageSubscriptions()
        } else if (Platform.OS === 'android') {
            await Purchases.showManageSubscriptions()
        } else {
            if (__DEV__) {
                console.warn('Customer Center not supported on this platform')
            }
        }
    } catch (error) {
        if (__DEV__) {
            console.error('Error presenting customer center:', error)
        }
        throw error
    }
}

/**
 * Get product information by identifier
 */
export const getProduct = async (
    productId: ProductId,
): Promise<PurchasesStoreProduct | null> => {
    try {
        const packages = await getPackages()
        const productPackage = packages.find(
            (pkg) => pkg.product.identifier === productId,
        )
        return productPackage?.product || null
    } catch (error) {
        if (__DEV__) {
            console.error(`Error getting product ${productId}:`, error)
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
            console.error('Error syncing purchase status:', error)
        }
        return { hasEntitlement: false, customerInfo: null }
    }
}

// Export types for use in components
export type { CustomerInfo, PurchasesOffering, PurchasesPackage, PurchasesStoreProduct }

