import React, { useMemo, useState } from 'react'
import { View, Dimensions, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ActionBar } from '@/components/ActionBar'
import { AppText } from '@/components/AppText'
import { ChakraCard } from '@/components/chakras/GalleryOfGnosis/ChakraCard'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import { CHAKRA_TO_DAY } from '@/utils/chakraMapping'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const CHAKRA_ORDER: Chakra[] = [
    Chakra.ROOT,
    Chakra.SACRAL,
    Chakra.SOLAR_PLEXUS,
    Chakra.HEART,
    Chakra.THROAT,
    Chakra.THIRD_EYE,
    Chakra.CROWN,
]

export default function GalleryOfGnosis() {
    const router = useRouter()
    const { completedChakras, hasEverCompletedChakra } = useChakraJourneyStore()
    const [currentIndex, setCurrentIndex] = useState(0)

    // Get all unlocked chakras (chakras that have been completed across all trials)
    // Use hasEverCompletedChakra to ensure cards persist even after trials end
    const unlockedChakras = useMemo(() => {
        const unlocked = CHAKRA_ORDER.filter((chakra) => {
            const dayIndex = CHAKRA_TO_DAY[chakra]
            return hasEverCompletedChakra(dayIndex)
        })
        if (__DEV__) {
            console.log('[GalleryOfGnosis] Unlocked chakras:', unlocked.length, 'Completed chakras:', completedChakras)
        }
        return unlocked
    }, [completedChakras, hasEverCompletedChakra])

    // If no chakras unlocked, show empty state
    if (unlockedChakras.length === 0) {
        return (
            <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
                <ActionBar />
                <View className="flex-1 items-center justify-center px-8">
                    <AppText font="instrument-regular" size="2xl" className="text-center mb-4">
                        Gallery of Gnosis
                    </AppText>
                    <AppText font="instrument-regular" size="lg" className="text-center text-gray-400">
                        As you complete each day's journey, beautiful chakra cards will appear here as gifts from your practice.
                    </AppText>
                    <AppText font="instrument-regular" size="base" className="text-center text-gray-500 mt-4">
                        Each day you complete, a new card will appear here as a spiritual reward.
                    </AppText>
                </View>
            </SafeAreaView>
        )
    }

    const renderCard = ({ item, index }: { item: Chakra; index: number }) => {
        const content = chakraContent[item]
        const isActive = index === currentIndex

        return (
            <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center px-4">
                <ChakraCard chakra={item} content={content} isActive={isActive} />
            </View>
        )
    }

    const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0)
        }
    }).current

    const viewabilityConfig = React.useRef({
        itemVisiblePercentThreshold: 50,
    }).current

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
            <ActionBar />
            <View className="flex-1 bg-black">
                {/* Header */}
                <View className="items-center py-6">
                    <AppText font="instrument-regular" size="2xl" className="mb-2">
                        Gallery of Gnosis
                    </AppText>
                    <AppText font="instrument-regular" size="sm" className="text-gray-400">
                        {currentIndex + 1} of {unlockedChakras.length}
                    </AppText>
                </View>

                {/* Cards Carousel */}
                <FlatList
                    data={unlockedChakras}
                    renderItem={renderCard}
                    keyExtractor={(item) => item}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(data, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                    initialScrollIndex={unlockedChakras.length > 0 ? Math.max(0, unlockedChakras.length - 1) : 0}
                    onScrollToIndexFailed={(info) => {
                        // Fallback if initial scroll fails
                        setTimeout(() => {
                            if (info.index !== undefined && info.index < unlockedChakras.length) {
                                // Try scrolling again after a short delay
                            }
                        }, 100)
                    }}
                />
            </View>
        </SafeAreaView>
    )
}

