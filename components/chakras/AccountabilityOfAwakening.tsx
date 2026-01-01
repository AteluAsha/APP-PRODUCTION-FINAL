import React from 'react'
import { View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/AppText'
import { ActionBar } from '@/components/ActionBar'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'

/**
 * Accountability of Awakening - Progress Tracking Screen
 * 
 * Displays user's progress across all trials, tracking their journey
 * and participation in the chakra awakening process.
 */
export const AccountabilityOfAwakening = () => {
    const getAccountabilityStats = useChakraJourneyStore(
        (state) => state.getAccountabilityStats,
    )

    const stats = getAccountabilityStats()

    const DAY_NAMES = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
            <ActionBar />
            <ScrollView
                className="flex-1 bg-black"
                contentContainerClassName="p-8"
                showsVerticalScrollIndicator={false}
            >
                <View className="max-w-lg mx-auto">
                    {/* Header */}
                    <AppText
                        font="koh-santepheap"
                        size="3xl"
                        className="text-center mb-4"
                    >
                        Accountability of Awakening
                    </AppText>

                    <AppText
                        font="instrument-regular"
                        size="lg"
                        className="text-center mb-8 text-white/80"
                    >
                        Your journey through the chakras
                    </AppText>

                    {/* Overall Stats */}
                    <View className="bg-white/10 rounded-2xl p-6 mb-8">
                        <AppText
                            font="instrument-bold"
                            size="xl"
                            className="mb-6 text-center"
                        >
                            Overall Progress
                        </AppText>

                        <View className="gap-4">
                            <View className="flex-row justify-between items-center">
                                <AppText font="instrument-regular" size="lg">
                                    Total Days Participated
                                </AppText>
                                <AppText
                                    font="instrument-bold"
                                    size="2xl"
                                    className="text-white"
                                >
                                    {stats.totalDaysParticipated}
                                </AppText>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <AppText font="instrument-regular" size="lg">
                                    Total Chakras Completed
                                </AppText>
                                <AppText
                                    font="instrument-bold"
                                    size="2xl"
                                    className="text-white"
                                >
                                    {stats.totalChakrasCompleted}
                                </AppText>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <AppText font="instrument-regular" size="lg">
                                    Completed Trials
                                </AppText>
                                <AppText
                                    font="instrument-bold"
                                    size="2xl"
                                    className="text-white"
                                >
                                    {stats.completedTrials} / 2
                                </AppText>
                            </View>

                            {stats.currentTrialProgress > 0 && (
                                <View className="flex-row justify-between items-center">
                                    <AppText font="instrument-regular" size="lg">
                                        Current Trial Progress
                                    </AppText>
                                    <AppText
                                        font="instrument-bold"
                                        size="2xl"
                                        className="text-white"
                                    >
                                        {stats.currentTrialProgress} / 7
                                    </AppText>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Trial History */}
                    {stats.trialHistory.length > 0 && (
                        <View className="mb-8">
                            <AppText
                                font="instrument-bold"
                                size="xl"
                                className="mb-4"
                            >
                                Trial History
                            </AppText>

                            <View className="gap-4">
                                {stats.trialHistory.map((trial, index) => (
                                    <View
                                        key={index}
                                        className="bg-white/10 rounded-xl p-4"
                                    >
                                        <View className="flex-row justify-between items-center mb-2">
                                            <AppText
                                                font="instrument-bold"
                                                size="lg"
                                            >
                                                Trial {trial.trialNumber}
                                            </AppText>
                                            {trial.completed && (
                                                <View className="bg-green-500/20 px-3 py-1 rounded-full">
                                                    <AppText
                                                        font="instrument-regular"
                                                        size="sm"
                                                        className="text-green-400"
                                                    >
                                                        Completed
                                                    </AppText>
                                                </View>
                                            )}
                                        </View>

                                        <AppText
                                            font="instrument-regular"
                                            size="sm"
                                            className="text-white/60 mb-3"
                                        >
                                            Started: {formatDate(trial.startDate)}
                                            {trial.endDate &&
                                                ` • Ended: ${formatDate(trial.endDate)}`}
                                        </AppText>

                                        <AppText
                                            font="instrument-regular"
                                            size="sm"
                                            className="text-white/80 mb-2"
                                        >
                                            Days Participated:{' '}
                                            {trial.daysParticipated.length} / 7
                                        </AppText>

                                        {/* Days participated list */}
                                        {trial.daysParticipated.length > 0 && (
                                            <View className="flex-row flex-wrap gap-2 mt-2">
                                                {trial.daysParticipated
                                                    .sort((a, b) => a - b)
                                                    .map((dayIndex) => (
                                                        <View
                                                            key={dayIndex}
                                                            className="bg-white/20 px-3 py-1 rounded-full"
                                                        >
                                                            <AppText
                                                                font="instrument-regular"
                                                                size="xs"
                                                            >
                                                                {DAY_NAMES[dayIndex]} -{' '}
                                                                {CHAKRA_NAMES[dayIndex]}
                                                            </AppText>
                                                        </View>
                                                    ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Empty State */}
                    {stats.trialHistory.length === 0 && (
                        <View className="items-center py-12">
                            <AppText
                                font="instrument-regular"
                                size="lg"
                                className="text-center text-white/60"
                            >
                                Your journey begins when you start your first
                                trial
                            </AppText>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

