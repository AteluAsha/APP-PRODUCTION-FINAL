import React, { useState } from 'react'
import { View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/AppText'
import { useRouter } from 'expo-router'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { useRevenueCat } from '@/hooks/useRevenueCat'
import { PRODUCT_IDS } from '@/src/services/revenuecat'
import { RevenueCatPaywall } from '@/components/chakras/RevenueCatPaywall'

interface PaymentGateProps {
    onPurchase: () => void
    onScholarship: () => void
}

/**
 * Payment Gate Component
 * 
 * Displays on Day 14 (final Sunday of second trial) offering two paths:
 * 1. Lifetime Access Purchase ($7)
 * 2. Scholarship Option (Energy Exchange)
 */
export const PaymentGate = ({ onPurchase, onScholarship }: PaymentGateProps) => {
    const router = useRouter()
    const { purchase, isLoading } = useRevenueCat()
    const [showPaywall, setShowPaywall] = useState(false)
    const [purchasing, setPurchasing] = useState(false)

    const handlePurchase = async () => {
        try {
            setPurchasing(true)
            addHapticFeedback(HapticStrength.Medium)
            // Purchase lifetime product through RevenueCat
            await purchase(PRODUCT_IDS.LIFETIME)
            // If successful, grantLifetimeAccess is called automatically by useRevenueCat hook
            onPurchase()
        } catch (error) {
            console.error('Purchase failed:', error)
            // Show paywall as fallback or let user try again
            setShowPaywall(true)
        } finally {
            setPurchasing(false)
        }
    }

    const handleScholarship = () => {
        addHapticFeedback(HapticStrength.Light)
        onScholarship()
    }

    const handleShowPaywall = () => {
        addHapticFeedback(HapticStrength.Light)
        setShowPaywall(true)
    }

    const handlePaywallDismiss = () => {
        setShowPaywall(false)
    }

    const handlePaywallPurchaseComplete = () => {
        setShowPaywall(false)
        onPurchase()
    }

    // Show full paywall if requested
    if (showPaywall) {
        return (
            <RevenueCatPaywall
                showLifetimeOnly={false}
                onDismiss={handlePaywallDismiss}
                onPurchaseComplete={handlePaywallPurchaseComplete}
            />
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
            <View className="flex-1 justify-center items-center p-8 bg-black">
                {/* Top gradient section */}
                <View className="w-full h-1/3 absolute top-0 bg-gradient-to-b from-purple-900/20 to-transparent" />

                {/* Main content */}
                <View className="items-center max-w-sm">
                    {/* Chakra symbol */}
                    <View className="mb-8">
                        <AppText
                            font="koh-santepheap"
                            size="4xl"
                            className="text-center mb-4"
                        >
                            Your Journey Continues
                        </AppText>
                    </View>

                    <View className="mb-8 items-center">
                        <AppText
                            font="koh-santepheap"
                            size="xl"
                            className="text-center mb-6"
                        >
                            You've completed your two free trials
                        </AppText>

                        <AppText
                            font="instrument-regular"
                            size="lg"
                            className="text-center mb-8 text-white/80"
                        >
                            Choose your path to continue your chakra journey
                        </AppText>
                    </View>

                    {/* Purchase Option */}
                    <Pressable
                        onPress={handlePurchase}
                        disabled={purchasing || isLoading}
                        className="w-full bg-white py-6 px-8 rounded-2xl mb-4 active:opacity-80 active:scale-95 disabled:opacity-50"
                    >
                        <View className="items-center">
                            {purchasing ? (
                                <AppText
                                    font="instrument-regular"
                                    size="lg"
                                    className="text-black"
                                >
                                    Processing...
                                </AppText>
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
                                        $7
                                    </AppText>
                            <AppText
                                font="instrument-regular"
                                size="sm"
                                className="mt-2 text-black/70"
                            >
                                Annual subscription
                            </AppText>
                                </>
                            )}
                        </View>
                    </Pressable>

                    {/* View All Options Button */}
                    <Pressable
                        onPress={handleShowPaywall}
                        className="w-full border border-white/30 py-4 px-8 rounded-xl mb-4 active:opacity-80"
                    >
                        <AppText
                            font="instrument-regular"
                            size="sm"
                            className="text-center text-white/80"
                        >
                            View all subscription options
                        </AppText>
                    </Pressable>

                    {/* Scholarship Option */}
                    <Pressable
                        onPress={handleScholarship}
                        className="w-full border-2 border-white/50 py-6 px-8 rounded-2xl active:opacity-80 active:scale-95"
                    >
                        <View className="items-center">
                            <AppText
                                font="instrument-bold"
                                size="xl"
                                className="mb-2 text-white"
                            >
                                Energy Exchange
                            </AppText>
                            <AppText
                                font="instrument-regular"
                                size="sm"
                                className="text-white/80 text-center"
                            >
                                Scholarship option
                            </AppText>
                        </View>
                    </Pressable>
                </View>

                {/* Bottom info text */}
                <View className="absolute bottom-12 px-8">
                    <AppText
                        font="instrument-regular"
                        size="sm"
                        className="text-center text-white/60 mb-2"
                    >
                        Both paths lead to full lifetime access
                    </AppText>
                    <AppText
                        font="instrument-regular"
                        size="xs"
                        className="text-center text-white/50"
                    >
                        Soul School is a Public Benefit Non Profit
                    </AppText>
                </View>
            </View>
        </SafeAreaView>
    )
}

