import React, { useEffect, useState } from "react"
import {
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { SOMATIC_SPINNER_FADE_OUT_MS, safeOverlayTop } from "@/constants/layout"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { useRevenueCat } from "@/hooks/useRevenueCat"
import { PACKAGE_IDENTIFIERS } from "@/src/services/revenuecat"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { Ionicons } from "@expo/vector-icons"
import * as Linking from "expo-linking"
import { purchaseErrorForPaywallBanner } from "@/utils/purchaseUserFacingError"

interface RevenueCatPaywallProps {
  onDismiss?: () => void
  onPurchaseComplete?: () => void
  showLifetimeOnly?: boolean // If true, only show lifetime option
}

/**
 * RevenueCat Paywall Component
 *
 * Displays available subscription and purchase options using RevenueCat packages.
 * Supports New Awakenings ($7/month), The Master Path ($55/year), and Lifetime.
 */
export const RevenueCatPaywall = ({
  onDismiss,
  onPurchaseComplete,
  showLifetimeOnly = false,
}: RevenueCatPaywallProps) => {
  const insets = useSafeAreaInsets()
  const {
    isLoading,
    packages,
    purchase,
    restore,
    openCustomerCenter,
    getProductPackage,
    error,
  } = useRevenueCat()

  const [purchasing, setPurchasing] = useState<string | null>(null)

  const [paywallLoaderDismissed, setPaywallLoaderDismissed] = useState(false)
  const paywallLoaderOpacity = useSharedValue(1)

  useEffect(() => {
    if (isLoading) {
      paywallLoaderOpacity.value = 1
      setPaywallLoaderDismissed(false)
      return
    }
    paywallLoaderOpacity.value = withTiming(
      0,
      { duration: SOMATIC_SPINNER_FADE_OUT_MS },
      (finished) => {
        if (finished) runOnJS(setPaywallLoaderDismissed)(true)
      },
    )
  }, [isLoading, paywallLoaderOpacity])

  useEffect(() => {
    if (error && !__DEV__) {
      console.error("[RevenueCatPaywall]", error.message)
    }
  }, [error])

  const purchaseErrorBannerText = error
    ? purchaseErrorForPaywallBanner(error.message)
    : null

  const paywallLoaderStyle = useAnimatedStyle(() => ({
    opacity: paywallLoaderOpacity.value,
  }))

  const handlePurchase = async (productId: string) => {
    try {
      setPurchasing(productId)
      addHapticFeedback(HapticStrength.Medium)
      await purchase(productId as any)
      addHapticFeedback(HapticStrength.Medium)
      onPurchaseComplete?.()
    } catch (err: any) {
      if (__DEV__) {
        console.error("Purchase error:", err)
      }
      // Error is already handled by the hook
    } finally {
      setPurchasing(null)
    }
  }

  const handleRestore = async () => {
    try {
      addHapticFeedback(HapticStrength.Light)
      await restore()
      onPurchaseComplete?.()
    } catch (err) {
      if (__DEV__) {
        console.error("Restore error:", err)
      }
    }
  }

  const handleCustomerCenter = async () => {
    try {
      addHapticFeedback(HapticStrength.Light)
      await openCustomerCenter()
    } catch (err) {
      if (__DEV__) {
        console.error("Customer center error:", err)
      }
    }
  }

  // Get packages from Current offering ($rc_monthly, $rc_annual, $rc_lifetime)
  const monthlyPackage = getProductPackage(PACKAGE_IDENTIFIERS.MONTHLY)
  const yearlyPackage = getProductPackage(PACKAGE_IDENTIFIERS.ANNUAL)
  const lifetimePackage = getProductPackage(PACKAGE_IDENTIFIERS.LIFETIME)

  // Format price
  const formatPrice = (price: string, period?: string) => {
    if (period) {
      return `${price}/${period}`
    }
    return price
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <View style={{ flex: 1 }}>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          style={{
            position: "absolute",
            top: safeOverlayTop(insets.top),
            right: 16,
            padding: 8,
            zIndex: 1000,
          }}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>
      ) : null}
      {!isLoading && (
      <ScrollView
        className="flex-1 bg-black"
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Awakening Soul logo */}
        <View className="items-center mb-6">
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Image
              source={require("@/assets/images/SoulSchool_HERO_Logo.png")}
              style={{ width: 160, height: 80 }}
              resizeMode="contain"
            />
          </View>
          <AppText
            font="koh-santepheap"
            size="3xl"
            className="text-center mb-4"
          >
            Unlock Awakening Soul Pro
          </AppText>
          <AppText
            font="instrument-regular"
            size="lg"
            className="text-center text-white/80"
          >
            Choose your path to lifetime access
          </AppText>
        </View>

        {/* Error Message — release builds never show raw RevenueCat / store strings */}
        {purchaseErrorBannerText ? (
          <View className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-red-400 text-center"
            >
              {purchaseErrorBannerText}
            </AppText>
          </View>
        ) : null}

        {/* Product Options: 1. Monthly, 2. Full Sanctuary, 3. Lifetime */}
        <View className="gap-3 mb-6">
          {/* 1. New Awakenings ($7/month) */}
          {!showLifetimeOnly && monthlyPackage && (
            <Pressable
              onPress={() => handlePurchase(PACKAGE_IDENTIFIERS.MONTHLY)}
              disabled={purchasing !== null}
              className="w-full border-2 border-white/50 py-5 px-6 rounded-2xl active:opacity-80 active:scale-95 disabled:opacity-50"
              accessibilityLabel="New Awakenings subscription"
              accessibilityHint="Full access for $7 per month"
            >
              <View className="items-center">
                {purchasing === PACKAGE_IDENTIFIERS.MONTHLY ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      className="mb-2 text-white"
                    >
                      New Awakenings
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      className="mb-1 text-[#A8C99A]"
                    >
                      Unlimited access to all teachings
                    </AppText>
                    <View className="flex-row flex-wrap items-baseline justify-center gap-1">
                      <AppText
                        font="instrument-bold"
                        size="lg"
                        className="text-white"
                      >
                        {monthlyPackage.product.priceString}
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        className="text-gray-400"
                      >
                        /month
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        className="text-[rgba(168,201,154,0.82)]"
                      >
                        (donation)
                      </AppText>
                    </View>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      className="mt-2 text-white/70"
                    >
                      Full Access, cancel anytime.
                    </AppText>
                  </>
                )}
              </View>
            </Pressable>
          )}

          {/* 2. The Master Path ($55/year) - always shown, hard-baked */}
          {!showLifetimeOnly && (
            <Pressable
              onPress={() => handlePurchase(PACKAGE_IDENTIFIERS.ANNUAL)}
              disabled={purchasing !== null}
              className="w-full border-2 border-white/50 py-5 px-6 rounded-2xl active:opacity-80 active:scale-95 disabled:opacity-50"
              accessibilityLabel="The Master Path annual subscription"
              accessibilityHint="Full access for $55 per year"
            >
              <View className="items-center">
                {purchasing === PACKAGE_IDENTIFIERS.ANNUAL ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      className="mb-2 text-white"
                    >
                      The Master Path
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      className="mb-1 text-[#A8C99A]"
                    >
                      Annual Pass + new healing features
                    </AppText>
                    <View className="flex-row flex-wrap items-baseline justify-center gap-1">
                      <AppText
                        font="instrument-bold"
                        size="lg"
                        className="text-white"
                      >
                        $55
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="sm"
                        className="text-gray-400"
                      >
                        / Year
                      </AppText>
                      <AppText
                        font="instrument-regular"
                        size="xs"
                        className="text-[rgba(168,201,154,0.82)]"
                      >
                        (donation)
                      </AppText>
                    </View>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      className="mt-2 text-white/70"
                    >
                      Master Path Embodiment
                    </AppText>
                  </>
                )}
              </View>
            </Pressable>
          )}

          {/* 3. Lifetime Option */}
          {lifetimePackage && (
            <Pressable
              onPress={() => handlePurchase(PACKAGE_IDENTIFIERS.LIFETIME)}
              disabled={purchasing !== null}
              className="w-full bg-white py-5 px-6 rounded-2xl active:opacity-80 active:scale-95 disabled:opacity-50"
              accessibilityLabel="Lifetime Access"
              accessibilityHint="One-time purchase for full access"
            >
              <View className="items-center">
                {purchasing === PACKAGE_IDENTIFIERS.LIFETIME ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <>
                    <AppText
                      font="instrument-bold"
                      size="2xl"
                      className="mb-2 text-black"
                    >
                      Lifetime Access
                    </AppText>
                    <AppText
                      font="instrument-medium"
                      size="xl"
                      className="text-black"
                    >
                      {lifetimePackage.product.priceString}
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      className="mt-2 text-black/70"
                    >
                      One-time purchase
                    </AppText>
                  </>
                )}
              </View>
            </Pressable>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          {/* Restore Purchases */}
          <Pressable
            onPress={handleRestore}
            disabled={purchasing !== null}
            className="py-4"
          >
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-center text-white/60 underline"
            >
              Restore Purchases
            </AppText>
          </Pressable>

          {/* Customer Center */}
          <Pressable
            onPress={handleCustomerCenter}
            disabled={purchasing !== null}
            className="py-4"
          >
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-center text-white/60 underline"
            >
              Manage Subscriptions
            </AppText>
          </Pressable>
        </View>

        {/* Info Text */}
        <View className="mt-8 px-4">
          <AppText
            font="instrument-regular"
            size="xs"
            className="text-center text-white/40 mb-4"
          >
            All purchases are managed through your App Store account.
            Subscriptions auto-renew unless cancelled.
          </AppText>
          <AppText
            font="instrument-regular"
            size="xs"
            className="text-center text-white/50 mb-4"
          >
            Awakening Soul is operated by Project Starseed, an IRS-recognized
            501(c)(3) tax-exempt organization. All donations are tax-deductible.
          </AppText>

          {/* Privacy Policy & Terms Links - App Store Compliance */}
          <View className="flex-row justify-center items-center gap-4 mb-2">
            <Pressable
              onPress={() => {
                Linking.openURL("https://soulschool.app/privacy").catch(
                  (error) => {
                    if (__DEV__) {
                      console.error("Error opening privacy policy:", error)
                    }
                  },
                )
              }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-center text-white/60"
                style={{ textDecorationLine: "underline" }}
              >
                Privacy Policy
              </AppText>
            </Pressable>
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-white/40"
            >
              •
            </AppText>
            <Pressable
              onPress={() => {
                Linking.openURL("https://soulschool.app/terms").catch(
                  (error) => {
                    if (__DEV__) {
                      console.error("Error opening terms of service:", error)
                    }
                  },
                )
              }}
            >
              <AppText
                font="instrument-regular"
                size="xs"
                className="text-center text-white/60"
                style={{ textDecorationLine: "underline" }}
              >
                Terms of Service
              </AppText>
            </Pressable>
          </View>
          {/* Support Contact - App Store Compliance */}
          <Pressable
            onPress={() => {
              Linking.openURL(
                "mailto:support@soulschool.app?subject=Support Request",
              ).catch((error) => {
                if (__DEV__) {
                  console.error("Error opening support email:", error)
                }
              })
            }}
          >
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-center text-white/50 mt-2"
              style={{ textDecorationLine: "underline" }}
            >
              Contact Support
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
      )}
      {(isLoading || !paywallLoaderDismissed) && (
        <Animated.View
          pointerEvents={isLoading ? "auto" : "none"}
          style={[
            StyleSheet.absoluteFillObject,
            { justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
            paywallLoaderStyle,
          ]}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="#ffffff" />
              <AppText font="instrument-regular" size="lg" className="mt-4">
                Preparing your path...
              </AppText>
            </>
          ) : null}
        </Animated.View>
      )}
      </View>
    </SafeAreaView>
  )
}
