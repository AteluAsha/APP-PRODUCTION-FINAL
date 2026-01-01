import React, { useState } from 'react'
import { View, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/AppText'
import { useRevenueCat } from '@/hooks/useRevenueCat'
import { PRODUCT_IDS } from '@/src/services/revenuecat'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { Ionicons } from '@expo/vector-icons'

interface RevenueCatPaywallProps {
    onDismiss?: () => void
    onPurchaseComplete?: () => void
    showLifetimeOnly?: boolean // If true, only show lifetime option
}

/**
 * RevenueCat Paywall Component
 * 
 * Displays available subscription and purchase options using RevenueCat packages.
 * Supports annual and lifetime products (no monthly subscription).
 */
export const RevenueCatPaywall = ({
    onDismiss,
    onPurchaseComplete,
    showLifetimeOnly = false,
}: RevenueCatPaywallProps) => {
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

    const handlePurchase = async (productId: string) => {
        try {
            setPurchasing(productId)
            addHapticFeedback(HapticStrength.Medium)
            await purchase(productId as any)
            addHapticFeedback(HapticStrength.Medium)
            onPurchaseComplete?.()
        } catch (err: any) {
            if (__DEV__) {
                console.error('Purchase error:', err)
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
                console.error('Restore error:', err)
            }
        }
    }

    const handleCustomerCenter = async () => {
        try {
            addHapticFeedback(HapticStrength.Light)
            await openCustomerCenter()
        } catch (err) {
            if (__DEV__) {
                console.error('Customer center error:', err)
            }
        }
    }

    // Get product packages
    // Note: Only annual and lifetime are available (no monthly)
    const yearlyPackage = getProductPackage(PRODUCT_IDS.YEARLY)
    const lifetimePackage = getProductPackage(PRODUCT_IDS.LIFETIME)

    // Format price
    const formatPrice = (price: string, period?: string) => {
        if (period) {
            return `${price}/${period}`
        }
        return price
    }

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
                <View className="flex-1 justify-center items-center bg-black">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <AppText font="instrument-regular" size="lg" className="mt-4">
                        Loading offers...
                    </AppText>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
            <ScrollView
                className="flex-1 bg-black"
                contentContainerClassName="p-8"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="items-center mb-8">
                    {onDismiss && (
                        <Pressable
                            onPress={onDismiss}
                            className="absolute top-0 right-0 p-2"
                        >
                            <Ionicons name="close" size={24} color="#ffffff" />
                        </Pressable>
                    )}
                    <AppText
                        font="koh-santepheap"
                        size="3xl"
                        className="text-center mb-4"
                    >
                        Unlock Soul School Pro
                    </AppText>
                    <AppText
                        font="instrument-regular"
                        size="lg"
                        className="text-center text-white/80"
                    >
                        Choose your path to lifetime access
                    </AppText>
                </View>

                {/* Error Message */}
                {error && (
                    <View className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                        <AppText
                            font="instrument-regular"
                            size="sm"
                            className="text-red-400 text-center"
                        >
                            {error.message}
                        </AppText>
                    </View>
                )}

                {/* Product Options */}
                <View className="gap-4 mb-6">
                    {/* Lifetime Option (always shown) */}
                    {lifetimePackage && (
                        <Pressable
                            onPress={() =>
                                handlePurchase(PRODUCT_IDS.LIFETIME)
                            }
                            disabled={purchasing !== null}
                            className="w-full bg-white py-6 px-8 rounded-2xl active:opacity-80 active:scale-95 disabled:opacity-50"
                        >
                            <View className="items-center">
                                {purchasing === PRODUCT_IDS.LIFETIME ? (
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

                    {/* Annual Option (only if not lifetime-only) */}
                    {!showLifetimeOnly && yearlyPackage && (
                        <Pressable
                            onPress={() =>
                                handlePurchase(PRODUCT_IDS.YEARLY)
                            }
                            disabled={purchasing !== null}
                            className="w-full border-2 border-white/50 py-6 px-8 rounded-2xl active:opacity-80 active:scale-95 disabled:opacity-50"
                        >
                            <View className="items-center">
                                {purchasing === PRODUCT_IDS.YEARLY ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <>
                                        <AppText
                                            font="instrument-bold"
                                            size="xl"
                                            className="mb-2 text-white"
                                        >
                                            Annual
                                        </AppText>
                                        <AppText
                                            font="instrument-medium"
                                            size="lg"
                                            className="text-white"
                                        >
                                            {formatPrice(
                                                yearlyPackage.product.priceString,
                                                'year',
                                            )}
                                        </AppText>
                                        <AppText
                                            font="instrument-regular"
                                            size="sm"
                                            className="mt-2 text-white/70"
                                        >
                                            Lifetime access
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
                        className="text-center text-white/50"
                    >
                        Soul School is a Public Benefit Non Profit
                    </AppText>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

