/**
 * ChakraHub - Central Landing Page for Lifetime Access Users
 * 
 * A beautiful, healing central hub that appears when users have lifetime access.
 * Provides easy access to all features: chakras, gallery, community, Anua, and more.
 * All chakras are accessible (no timegate) with option to return to weekly journey mode.
 */

import React, { useMemo } from 'react'
import { View, ScrollView, Pressable, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { Chakra } from '@/types/chakras/Chakra'
import { CHAKRA_TO_DAY, getChakraIndex } from '@/utils/chakraMapping'
import { getCurrentDayOfWeek } from '@/utils/date'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { PulsingButton } from '@/components/chakras/PulsingButton'
import { useChakrasData } from '@/hooks/useChakrasData'
import { ActionBar } from '@/components/ActionBar'

const CHAKRA_ORDER: Chakra[] = [
    Chakra.ROOT,
    Chakra.SACRAL,
    Chakra.SOLAR_PLEXUS,
    Chakra.HEART,
    Chakra.THROAT,
    Chakra.THIRD_EYE,
    Chakra.CROWN,
]

const CHAKRA_NAMES = [
    'Root',
    'Sacral',
    'Solar Plexus',
    'Heart',
    'Throat',
    'Third Eye',
    'Crown',
]

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ChakraHub() {
    const router = useRouter()
    const currentDay = getCurrentDayOfWeek()
    const { hasEverCompletedChakra, completedChakras } = useChakraJourneyStore()
    const { chakrasData } = useChakrasData()
    
    // Get unlocked cards count
    const unlockedCardsCount = useMemo(() => {
        let count = 0
        for (let i = 0; i < 7; i++) {
            if (hasEverCompletedChakra(i)) {
                count++
            }
        }
        return count
    }, [hasEverCompletedChakra, completedChakras])
    
    // Get chakra data for display
    const hubChakraData = useMemo(() => {
        return CHAKRA_ORDER.map((chakra) => {
            const dayIndex = CHAKRA_TO_DAY[chakra]
            const chakraData = chakrasData.find((c) => c.day === dayIndex)
            return {
                chakra,
                dayIndex,
                name: CHAKRA_NAMES[dayIndex],
                dayName: DAY_NAMES[dayIndex],
                source: chakraData?.source || require('@/assets/images/root.png'),
                onPress: (router: any) => {
                    router.push(`/(chakras)/${chakra}`)
                    addHapticFeedback(HapticStrength.Light)
                },
            }
        })
    }, [chakrasData])
    
    const handleNavigateToChakra = (chakra: Chakra) => {
        router.push(`/(chakras)/${chakra}`)
        addHapticFeedback(HapticStrength.Light)
    }
    
    const handleNavigateToGallery = () => {
        router.push('/(chakras)/GalleryOfGnosis')
        addHapticFeedback(HapticStrength.Light)
    }
    
    const handleNavigateToCommunity = () => {
        router.push('/CommunityHalls')
        addHapticFeedback(HapticStrength.Light)
    }
    
    const handleNavigateToAnua = () => {
        // Navigate to current day's chakra and open Anua chat
        const currentChakra = CHAKRA_ORDER[currentDay]
        router.push(`/(chakras)/${currentChakra}`)
        // Note: Anua chat would need to be opened from ChakraTemplate
        addHapticFeedback(HapticStrength.Light)
    }
    
    const handleNavigateToAccountability = () => {
        router.push('/(chakras)/AccountabilityOfAwakening')
        addHapticFeedback(HapticStrength.Light)
    }
    
    const handleNavigateToWeeklyJourney = () => {
        router.push('/(chakras)')
        addHapticFeedback(HapticStrength.Light)
    }
    
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
            <ActionBar />
            <ScrollView
                className="flex-1 bg-black"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="items-center mb-8">
                    <Image
                        source={require('@/assets/images/SoulSchool_HERO_Logo.png')}
                        className="w-40 h-20 mb-4"
                        resizeMode="contain"
                    />
                    <AppText font="instrument-bold" size="2xl" className="text-center mb-2 text-white">
                        Your Sacred Space
                    </AppText>
                    <AppText font="instrument-regular" size="sm" className="text-center text-white/70 italic">
                        All paths are open to you
                    </AppText>
                </View>
                
                {/* Chakras Grid - All Accessible */}
                <View className="mb-8">
                    <AppText font="instrument-bold" size="lg" className="text-white mb-4 text-center">
                        All Chakras
                    </AppText>
                    <View className="flex-row flex-wrap justify-center gap-4">
                        {hubChakraData.map(({ chakra, dayIndex, name, dayName, source, onPress }) => {
                            const isCurrentDay = dayIndex === currentDay
                            const isCompleted = hasEverCompletedChakra(dayIndex)
                            
                            return (
                                <View key={chakra} className="items-center mb-4" style={{ width: '30%' }}>
                                    <Pressable
                                        onPress={() => handleNavigateToChakra(chakra)}
                                        className="active:opacity-80"
                                    >
                                        <View className="items-center">
                                            <PulsingButton
                                                source={source}
                                                isAnimating={isCurrentDay}
                                                onPress={() => handleNavigateToChakra(chakra)}
                                                small={true}
                                            />
                                            <AppText font="instrument-medium" size="xs" className="text-white mt-2 text-center">
                                                {name}
                                            </AppText>
                                            <AppText font="instrument-regular" size="xs" className="text-white/60 mt-0.5 text-center">
                                                {dayName}
                                            </AppText>
                                            {isCompleted && (
                                                <View className="mt-1">
                                                    <Ionicons name="checkmark-circle" size={16} color="#FFD700" />
                                                </View>
                                            )}
                                        </View>
                                    </Pressable>
                                </View>
                            )
                        })}
                    </View>
                </View>
                
                {/* Menu Options */}
                <View className="mb-6">
                    <AppText font="instrument-bold" size="lg" className="text-white mb-4 text-center">
                        Sacred Spaces
                    </AppText>
                    
                    <View className="gap-3">
                        {/* Gallery of Gnosis */}
                        <Pressable
                            onPress={handleNavigateToGallery}
                            className="active:opacity-80"
                        >
                            <LinearGradient
                                colors={['rgba(157, 78, 221, 0.3)', 'rgba(123, 44, 191, 0.2)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#FFD700',
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="images" size={24} color="#FFD700" />
                                    <View className="flex-1 ml-4">
                                        <AppText font="instrument-bold" size="base" className="text-white">
                                            Gallery of Gnosis
                                        </AppText>
                                        <AppText font="instrument-regular" size="sm" className="text-white/70 mt-1">
                                            Your collected chakra cards
                                        </AppText>
                                    </View>
                                    {unlockedCardsCount > 0 && (
                                        <View className="bg-[#FFD700] rounded-full px-3 py-1">
                                            <AppText font="instrument-bold" size="xs" className="text-black">
                                                {unlockedCardsCount}
                                            </AppText>
                                        </View>
                                    )}
                                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                </View>
                            </LinearGradient>
                        </Pressable>
                        
                        {/* Community Halls */}
                        <Pressable
                            onPress={handleNavigateToCommunity}
                            className="active:opacity-80"
                        >
                            <LinearGradient
                                colors={['rgba(135, 174, 115, 0.3)', 'rgba(107, 142, 90, 0.2)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#87AE73',
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Image
                                        source={require('@/assets/images/Hero_tulip_LOGO_MASTER.png')}
                                        style={{ width: 24, height: 24 }}
                                        resizeMode="contain"
                                    />
                                    <View className="flex-1 ml-4">
                                        <AppText font="instrument-bold" size="base" className="text-white">
                                            Community Halls
                                        </AppText>
                                        <AppText font="instrument-regular" size="sm" className="text-white/70 mt-1">
                                            Connect with others on the path
                                        </AppText>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                </View>
                            </LinearGradient>
                        </Pressable>
                        
                        {/* Talk to Anua */}
                        <Pressable
                            onPress={handleNavigateToAnua}
                            className="active:opacity-80"
                        >
                            <LinearGradient
                                colors={['rgba(157, 78, 221, 0.4)', 'rgba(123, 44, 191, 0.3)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#9D4EDD',
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Image
                                        source={require('@/assets/images/Anua_Hero_Icon_Image.png')}
                                        style={{ width: 24, height: 24, borderRadius: 12 }}
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1 ml-4">
                                        <AppText font="instrument-bold" size="base" className="text-white">
                                            Talk to Anua
                                        </AppText>
                                        <AppText font="instrument-regular" size="sm" className="text-white/70 mt-1">
                                            Your guide and companion
                                        </AppText>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                </View>
                            </LinearGradient>
                        </Pressable>
                        
                        {/* Accountability of Awakening */}
                        <Pressable
                            onPress={handleNavigateToAccountability}
                            className="active:opacity-80"
                        >
                            <LinearGradient
                                colors={['rgba(106, 27, 154, 0.3)', 'rgba(75, 0, 130, 0.2)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#6A1B9A',
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="stats-chart" size={24} color="#9D4EDD" />
                                    <View className="flex-1 ml-4">
                                        <AppText font="instrument-bold" size="base" className="text-white">
                                            Accountability of Awakening
                                        </AppText>
                                        <AppText font="instrument-regular" size="sm" className="text-white/70 mt-1">
                                            Track your journey progress
                                        </AppText>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                </View>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
                
                {/* Option to Return to Weekly Journey */}
                <Pressable
                    onPress={handleNavigateToWeeklyJourney}
                    className="active:opacity-80 mt-4"
                >
                    <View className="items-center py-4 px-6 border border-white/20 rounded-lg">
                        <AppText font="instrument-regular" size="sm" className="text-white/80 text-center">
                            Continue Weekly Journey
                        </AppText>
                        <AppText font="instrument-regular" size="xs" className="text-white/60 text-center mt-1">
                            Follow the weekly progression
                        </AppText>
                    </View>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    )
}

