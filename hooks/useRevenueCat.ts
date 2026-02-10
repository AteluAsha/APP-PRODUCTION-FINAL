import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  hasActiveEntitlement,
  getCustomerInfo,
  getPackages,
  purchaseProduct,
  restorePurchases,
  presentCustomerCenter,
  syncPurchaseStatus,
  type CustomerInfo,
  type PurchasesPackage,
  PRODUCT_IDS,
  ENTITLEMENT_ID,
} from "@/src/services/revenuecat"
import { useChakraJourneyStore } from "./useChakraJourneyStore"

/**
 * Hook to manage RevenueCat purchases and entitlements
 *
 * Provides:
 * - Entitlement status checking
 * - Product packages for purchase
 * - Purchase functionality
 * - Customer info management
 * - Integration with journey store for lifetime access
 */
export const useRevenueCat = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasPro, setHasPro] = useState(false)
  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  const isCheckingRef = useRef(false)

  const grantLifetimeAccess = useChakraJourneyStore(
    (state) => state.grantLifetimeAccess,
  )

  // Check entitlement status and load packages
  const checkStatus = useCallback(async () => {
    // Prevent concurrent calls
    if (isCheckingRef.current) {
      if (__DEV__) {
        console.log(
          "[RevenueCat] Status check already in progress, skipping...",
        )
      }
      return
    }

    isCheckingRef.current = true
    try {
      setIsLoading(true)
      setError(null)

      // Check if user has active entitlement
      const hasEntitlement = await hasActiveEntitlement()
      setHasPro(hasEntitlement)

      // If user has entitlement, grant lifetime access in journey store
      if (hasEntitlement) {
        grantLifetimeAccess("paid")
      }

      // Get customer info
      const info = await getCustomerInfo()
      setCustomerInfo(info)

      // Get available packages
      const availablePackages = await getPackages()
      setPackages(availablePackages)

      setHasChecked(true)
    } catch (err) {
      // Suppress configuration errors during development (expected)
      const errorMessage =
        err instanceof Error ? err.message : String(err) || ""
      const isConfigError =
        errorMessage.toLowerCase().includes("api key") ||
        errorMessage.toLowerCase().includes("not recognized") ||
        errorMessage.toLowerCase().includes("configuration") ||
        errorMessage.toLowerCase().includes("app store connect") ||
        errorMessage.toLowerCase().includes("storekit configuration") ||
        errorMessage.toLowerCase().includes("products registered") ||
        errorMessage.toLowerCase().includes("could not be fetched")

      // Only log errors that aren't configuration-related
      if (__DEV__ && !isConfigError) {
        console.error("Error checking RevenueCat status:", err)
      }

      // Only set error state for non-configuration errors
      if (!isConfigError) {
        setError(
          err instanceof Error ? err : new Error("Failed to check status"),
        )
      }
    } finally {
      setIsLoading(false)
      isCheckingRef.current = false
    }
  }, [grantLifetimeAccess])

  // Initial status check - only run once on mount
  useEffect(() => {
    if (!hasChecked && !isCheckingRef.current) {
      checkStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once on mount

  // Purchase a product
  const purchase = useCallback(
    async (productId: (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]) => {
      try {
        setIsLoading(true)
        setError(null)

        const info = await purchaseProduct(productId)

        // Check if purchase granted entitlement
        const hasEntitlement =
          info.entitlements.active[ENTITLEMENT_ID] !== undefined

        if (hasEntitlement) {
          setHasPro(true)
          // Grant lifetime access in journey store
          grantLifetimeAccess("paid")
        }

        setCustomerInfo(info)
        return info
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err : new Error("Purchase failed")
        setError(errorMessage)
        throw errorMessage
      } finally {
        setIsLoading(false)
      }
    },
    [grantLifetimeAccess],
  )

  // Restore purchases
  const restore = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const info = await restorePurchases()

      // Check if restored purchases include entitlement
      const hasEntitlement =
        info.entitlements.active[ENTITLEMENT_ID] !== undefined

      if (hasEntitlement) {
        setHasPro(true)
        grantLifetimeAccess("paid")
      }

      setCustomerInfo(info)
      return info
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error("Restore failed")
      setError(errorMessage)
      throw errorMessage
    } finally {
      setIsLoading(false)
    }
  }, [grantLifetimeAccess])

  // Open customer center
  const openCustomerCenter = useCallback(async () => {
    try {
      await presentCustomerCenter()
      // Refresh status after customer center closes
      await checkStatus()
    } catch (err) {
      console.error("Error opening customer center:", err)
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to open customer center"),
      )
    }
  }, [checkStatus])

  // Get specific product package
  const getProductPackage = useCallback(
    (productId: (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]) => {
      return packages.find((pkg) => pkg.product.identifier === productId)
    },
    [packages],
  )

  return {
    isLoading,
    hasPro,
    packages,
    customerInfo,
    error,
    purchase,
    restore,
    openCustomerCenter,
    getProductPackage,
    refresh: checkStatus,
  }
}
