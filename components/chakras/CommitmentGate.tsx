/**
 * Commitment Gate Screen
 *
 * A native React Native screen that appears after the 14-day trial period.
 * Offers two paths: Annual Access (via RevenueCat) or Scholarship (energy exchange).
 * Matches the exact visual design from the provided screenshots.
 */

import React, { useState } from 'react'
import {
    View,
    ScrollView,
    Pressable,
    Image,
    ActivityIndicator,
    StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { useRevenueCat } from '@/hooks/useRevenueCat'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { PRODUCT_IDS } from '@/src/services/revenuecat'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { Ionicons } from '@expo/vector-icons'
import { ScholarshipModal } from './ScholarshipModal'
import { useRouter } from 'expo-router'
import { AccessGrantedModal } from './AccessGrantedModal'

interface CommitmentGateProps {
    onComplete: () => void
}

type AccessOption = 'annual' | 'scholarship'

export const CommitmentGate: React.FC<CommitmentGateProps> = ({ onComplete }) => {
    const [selectedOption, setSelectedOption] = useState<AccessOption>('annual')
    const [isProcessing, setIsProcessing] = useState(false)
    const [showScholarshipModal, setShowScholarshipModal] = useState(false)
    const [showAccessGranted, setShowAccessGranted] = useState(false)
    const { purchase, getProductPackage, isLoading: revenueCatLoading } = useRevenueCat()
    const grantLifetimeAccess = useChakraJourneyStore((state) => state.grantLifetimeAccess)
    const hasEverCompletedChakra = useChakraJourneyStore((state) => state.hasEverCompletedChakra)
    const router = useRouter()

    const yearlyPackage = getProductPackage(PRODUCT_IDS.YEARLY)

    // Check if user has any unlocked chakra cards
    const hasUnlockedCards = React.useMemo(() => {
        for (let i = 0; i < 7; i++) {
            if (hasEverCompletedChakra(i)) {
                return true
            }
        }
        return false
    }, [hasEverCompletedChakra])

    const handleGalleryPress = () => {
        router.push("/(chakras)/GalleryOfGnosis")
    }

    const handleBeginJourney = async () => {
        if (isProcessing) return

        addHapticFeedback(HapticStrength.Medium)

        if (selectedOption === 'annual') {
            // Purchase annual subscription via RevenueCat
            setIsProcessing(true)
            try {
                await purchase(PRODUCT_IDS.YEARLY)
                // grantLifetimeAccess is automatically called by useRevenueCat hook
                // Show celebration modal
                setShowAccessGranted(true)
                onComplete()
            } catch (error) {
                if (__DEV__) {
                    console.error('Error processing purchase:', error)
                }
                // Error handling - user can try again
            } finally {
                setIsProcessing(false)
            }
        } else {
            // Scholarship path - show modal to get reason, then proceed to Energy Exchange
            setShowScholarshipModal(true)
        }
    }

    const handleScholarshipContinue = (reason: string) => {
        // Grant lifetime access immediately (it's free, not a barter)
        // The scholarship is granted based on their stated reason - no barter required
        grantLifetimeAccess('scholarship')
        // Close scholarship modal
        setShowScholarshipModal(false)
        // Complete the commitment gate first
        onComplete()
        // Show celebration modal
        setShowAccessGranted(true)
    }

    const formatPrice = (priceString: string): string => {
        // Extract numeric price from RevenueCat price string
        // Format: "$7.00" -> "$7"
        const match = priceString.match(/\$?([\d.]+)/)
        if (match) {
            const num = parseFloat(match[1])
            return `$${Math.round(num)}`
        }
        return priceString
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('@/assets/images/SoulSchool_HERO_Logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Title Section */}
                <View style={styles.titleContainer}>
                    <LinearGradient
                        colors={['#60a5fa', '#a855f7', '#fb923c']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.titleGradient}
                    >
                        <AppText font="instrument-bold" size="3xl" style={styles.titleText}>
                            Your Path Awaits
                        </AppText>
                    </LinearGradient>
                    <AppText font="instrument-regular" size="lg" style={styles.subtitle}>
                        All Paths Open to You
                    </AppText>
                </View>

                {/* Features List */}
                <View style={styles.featuresCard}>
                    <View style={styles.featureItem}>
                        <View style={styles.checkmarkContainer}>
                            <Ionicons name="checkmark" size={16} color="#a855f7" />
                        </View>
                        <AppText font="instrument-regular" size="base" style={styles.featureText}>
                            Access to all sacred teachings
                        </AppText>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.checkmarkContainer}>
                            <Ionicons name="checkmark" size={16} color="#a855f7" />
                        </View>
                        <AppText font="instrument-regular" size="base" style={styles.featureText}>
                            Guided meditation library
                        </AppText>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.checkmarkContainer}>
                            <Ionicons name="checkmark" size={16} color="#a855f7" />
                        </View>
                        <AppText font="instrument-regular" size="base" style={styles.featureText}>
                            Social Sanctuary Access
                        </AppText>
                    </View>
                </View>

                {/* Access Options */}
                <View style={styles.optionsContainer}>
                    {/* Annual Access Card */}
                    <Pressable
                        onPress={() => {
                            setSelectedOption('annual')
                            addHapticFeedback(HapticStrength.Light)
                        }}
                        style={[
                            styles.optionCard,
                            selectedOption === 'annual' && styles.optionCardSelected,
                        ]}
                    >
                        <View style={styles.optionContent}>
                            <View style={styles.optionLeft}>
                                <View style={[styles.optionIcon, styles.crownIcon]}>
                                    <Ionicons name="diamond" size={20} color="#ffffff" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <AppText font="instrument-bold" size="lg" style={styles.optionTitle}>
                                        Complete Sacred Path
                                    </AppText>
                                    <AppText font="instrument-regular" size="sm" style={styles.optionSubtitle}>
                                        Unlimited access to all teachings
                                    </AppText>
                                    <View style={styles.priceContainer}>
                                        <AppText font="instrument-bold" size="2xl" style={styles.priceText}>
                                            {yearlyPackage
                                                ? formatPrice(yearlyPackage.product.priceString)
                                                : '$7'}
                                        </AppText>
                                        <AppText font="instrument-regular" size="sm" style={styles.pricePeriod}>
                                            /year
                                        </AppText>
                                    </View>
                                    <AppText font="instrument-regular" size="xs" style={styles.priceDescription}>
                                        Open the full course with universal access
                                    </AppText>
                                </View>
                            </View>
                            <View style={styles.radioButton}>
                                {selectedOption === 'annual' && (
                                    <View style={styles.radioButtonSelected} />
                                )}
                            </View>
                        </View>
                    </Pressable>

                    {/* Scholarship Card */}
                    <Pressable
                        onPress={() => {
                            setSelectedOption('scholarship')
                            addHapticFeedback(HapticStrength.Light)
                        }}
                        style={[
                            styles.optionCard,
                            selectedOption === 'scholarship' && styles.optionCardSelected,
                        ]}
                    >
                        <View style={styles.optionContent}>
                            <View style={styles.optionLeft}>
                                <View style={[styles.optionIcon, styles.starIcon]}>
                                    <Ionicons name="star" size={20} color="#ffffff" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <AppText font="instrument-bold" size="lg" style={styles.optionTitle}>
                                        Scholarship
                                    </AppText>
                                    <AppText font="instrument-regular" size="sm" style={styles.scholarshipSubtitle}>
                                        Energy exchange
                                    </AppText>
                                    <View style={styles.priceContainer}>
                                        <AppText font="instrument-bold" size="2xl" style={styles.priceText}>
                                            Free
                                        </AppText>
                                    </View>
                                    <AppText font="instrument-regular" size="xs" style={styles.priceDescription}>
                                        Realizing that WE are the value.
                                    </AppText>
                                </View>
                            </View>
                            <View style={styles.radioButton}>
                                {selectedOption === 'scholarship' && (
                                    <View style={styles.radioButtonSelected} />
                                )}
                            </View>
                        </View>
                    </Pressable>
                </View>

                {/* Begin Your Journey Button */}
                <Pressable
                    onPress={handleBeginJourney}
                    disabled={isProcessing || revenueCatLoading}
                    style={styles.beginButton}
                >
                    <LinearGradient
                        colors={['#60a5fa', '#a855f7', '#fb923c']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.beginButtonGradient}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <AppText font="instrument-bold" size="lg" style={styles.beginButtonText}>
                                Enter Your Sacred Space
                            </AppText>
                        )}
                    </LinearGradient>
                </Pressable>

                {/* Footer Guarantee Text */}
                <View style={styles.footerContainer}>
                    <AppText font="instrument-regular" size="xs" style={styles.footerText}>
                        ✨ Your journey, your pace • Sacred space always available ✨
                    </AppText>
                    <AppText font="instrument-regular" size="xs" style={[styles.footerText, { marginTop: 8 }]}>
                        Soul School is a Public Benefit Company (501c3)
                    </AppText>
                </View>
            </ScrollView>

            {/* Scholarship Modal */}
            <ScholarshipModal
                visible={showScholarshipModal}
                onClose={() => setShowScholarshipModal(false)}
                onContinue={handleScholarshipContinue}
            />
            
            {/* Access Granted Celebration Modal */}
            <AccessGrantedModal
                visible={showAccessGranted}
                onClose={() => setShowAccessGranted(false)}
                onGoToHub={() => {
                    router.push('/(chakras)/ChakraHub')
                }}
                onContinueJourney={() => {
                    router.push('/(chakras)')
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    logo: {
        width: 200,
        height: 200,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    titleGradient: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: 8,
    },
    titleText: {
        color: '#ffffff',
    },
    subtitle: {
        color: '#d1d5db',
        marginTop: 4,
    },
    featuresCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkmarkContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#60a5fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureText: {
        color: '#d1d5db',
        flex: 1,
    },
    optionsContainer: {
        gap: 16,
        marginBottom: 32,
    },
    optionCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    optionCardSelected: {
        borderColor: '#60a5fa',
        borderWidth: 2,
        backgroundColor: '#1a1a2a',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    crownIcon: {
        backgroundColor: '#a855f7',
    },
    starIcon: {
        backgroundColor: '#fb923c',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        color: '#ffffff',
        marginBottom: 4,
    },
    optionSubtitle: {
        color: '#60a5fa',
        marginBottom: 8,
    },
    scholarshipSubtitle: {
        color: '#a855f7',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    priceText: {
        color: '#ffffff',
    },
    pricePeriod: {
        color: '#9ca3af',
        marginLeft: 4,
    },
    priceDescription: {
        color: '#9ca3af',
        marginTop: 4,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#60a5fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    radioButtonSelected: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#60a5fa',
    },
    galleryButton: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    galleryButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    galleryButtonText: {
        color: '#a855f7',
        marginLeft: 8,
    },
    beginButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#60a5fa',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    beginButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    beginButtonText: {
        color: '#ffffff',
    },
    footerContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    footerText: {
        color: '#9ca3af',
        textAlign: 'center',
    },
})

