import React, { useState } from 'react'
import { View, Pressable, ScrollView, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/AppText'
import { ActionBar } from '@/components/ActionBar'
import { useRouter } from 'expo-router'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { VideoRecorderModal } from '@/components/chakras/VideoRecorderModal'

/**
 * Energy Exchange Screen
 * 
 * Connection path for scholarship recipients.
 * Offers ways to stay connected with the community - NOT a barter or exchange.
 * Lifetime access is already granted - these are optional connection opportunities.
 */
export default function EnergyExchange() {
    const router = useRouter()
    const [showVideoRecorder, setShowVideoRecorder] = useState(false)
    // Note: Lifetime access is already granted before reaching this screen
    // This screen is for connection, not barter

    const handleShare = async () => {
        addHapticFeedback(HapticStrength.Light)
        // Open video recorder modal
        setShowVideoRecorder(true)
    }

    const handleReview = async () => {
        addHapticFeedback(HapticStrength.Light)
        // TODO: Open app store review page
        // Navigate back after review
        router.replace('/(chakras)')
    }

    const handleWriteToUs = async () => {
        addHapticFeedback(HapticStrength.Light)
        // TODO: Open email or contact form
        // Navigate back after writing
        router.replace('/(chakras)')
    }

    const handleSkip = () => {
        addHapticFeedback(HapticStrength.Light)
        router.replace('/(chakras)')
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
            <ActionBar />
            <ScrollView
                className="flex-1 bg-black"
                contentContainerClassName="p-8"
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center max-w-lg mx-auto">
                    {/* Header */}
                    <AppText
                        font="koh-santepheap"
                        size="3xl"
                        className="text-center mb-4"
                    >
                        Energy Exchange
                    </AppText>

                    <AppText
                        font="instrument-regular"
                        size="lg"
                        className="text-center mb-4 text-white/80"
                    >
                        You already have lifetime access—this is a gift, not a barter.
                    </AppText>
                    <AppText
                        font="instrument-regular"
                        size="base"
                        className="text-center mb-8 text-white/60"
                    >
                        Choose how you'd like to stay connected with our community.
                    </AppText>

                    {/* Exchange Options */}
                    <View className="w-full gap-4 mb-8">
                        {/* Share Video Option */}
                        <Pressable
                            onPress={handleShare}
                            className="w-full border-2 border-white/50 py-6 px-8 rounded-2xl active:opacity-80 active:scale-95"
                        >
                            <View>
                                <AppText
                                    font="instrument-bold"
                                    size="xl"
                                    className="mb-2 text-white"
                                >
                                    Record & Share Your Journey
                                </AppText>
                                <AppText
                                    font="instrument-regular"
                                    size="sm"
                                    className="text-white/70"
                                >
                                    Record a video and share it on social media with a link to the app
                                </AppText>
                            </View>
                        </Pressable>

                        {/* Review Option */}
                        <Pressable
                            onPress={handleReview}
                            className="w-full border-2 border-white/50 py-6 px-8 rounded-2xl active:opacity-80 active:scale-95"
                        >
                            <View>
                                <AppText
                                    font="instrument-bold"
                                    size="xl"
                                    className="mb-2 text-white"
                                >
                                    Leave a Review
                                </AppText>
                                <AppText
                                    font="instrument-regular"
                                    size="sm"
                                    className="text-white/70"
                                >
                                    Share your experience and help others find
                                    their path
                                </AppText>
                            </View>
                        </Pressable>

                        {/* Write to Us Option */}
                        <Pressable
                            onPress={handleWriteToUs}
                            className="w-full border-2 border-white/50 py-6 px-8 rounded-2xl active:opacity-80 active:scale-95"
                        >
                            <View>
                                <AppText
                                    font="instrument-bold"
                                    size="xl"
                                    className="mb-2 text-white"
                                >
                                    Write to Us
                                </AppText>
                                <AppText
                                    font="instrument-regular"
                                    size="sm"
                                    className="text-white/70"
                                >
                                    Share your story, feedback, or connect with
                                    our community
                                </AppText>
                            </View>
                        </Pressable>
                    </View>

                    {/* Info Text */}
                    <AppText
                        font="instrument-regular"
                        size="sm"
                        className="text-center text-white/60 mb-6"
                    >
                        These are optional ways to connect—your lifetime access is already active.
                    </AppText>

                    {/* Public Benefit Non Profit Disclosure */}
                    <View className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 mb-6">
                        <AppText
                            font="instrument-regular"
                            size="xs"
                            className="text-center text-gray-400"
                        >
                            Soul School is a Public Benefit Non Profit committed to making spiritual growth accessible to all.
                        </AppText>
                    </View>

                    {/* Skip Option */}
                    <Pressable
                        onPress={handleSkip}
                        className="mt-4"
                    >
                        <AppText
                            font="instrument-regular"
                            size="sm"
                            className="text-white/40 underline"
                        >
                            Continue to App
                        </AppText>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Video Recorder Modal */}
            <VideoRecorderModal
                visible={showVideoRecorder}
                onClose={() => setShowVideoRecorder(false)}
                onVideoRecorded={(videoUri) => {
                    // Video recorded - user can now share it
                    if (__DEV__) {
                        console.log('Video recorded:', videoUri)
                    }
                }}
            />
        </SafeAreaView>
    )
}

