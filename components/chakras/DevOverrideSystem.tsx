/**
 * Developer Override System
 *
 * A comprehensive developer tool that allows testing the full customer flow
 * while bypassing any walls, gates, or restrictions. Works even when testing
 * via QR code where __DEV__ might not be set.
 *
 * Features:
 * - Bypass all timegates
 * - Grant lifetime access
 * - Reset journey state
 * - Simulate trial completion
 * - Skip payment gates
 * - Force journey start
 */

import React, { useState } from 'react'
import { View, Modal, Pressable, ScrollView, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { getCurrentWeekStartDateISO } from '@/utils/date'
import { setGlobalDevMode, getGlobalDevMode } from '@/src/services/timegate'

interface DevOverrideSystemProps {
    visible: boolean
    onClose: () => void
}

export const DevOverrideSystem: React.FC<DevOverrideSystemProps> = ({ visible, onClose }) => {
    const [devModeEnabled, setDevModeEnabled] = useState(() => {
        // Check if global dev mode is already enabled
        return getGlobalDevMode()
    })
    
    // Sync global dev mode when toggle changes
    const handleToggleDevMode = (enabled: boolean) => {
        setDevModeEnabled(enabled)
        setGlobalDevMode(enabled)
    }
    
    const {
        journeyStarted,
        hasLifetimeAccess,
        completedTrialCourses,
        journeyWeekStartDate,
        initialOpenDate,
        courseStartDate,
        allChakrasCompleted,
        startJourney,
        grantLifetimeAccess,
        resetJourney,
        completeTrialCourse,
        clearAllCompleted,
        _setAllCompleted,
        setInitialOpenDate,
    } = useChakraJourneyStore()

    const currentWeekStartDate = getCurrentWeekStartDateISO()

    const handleGrantLifetimeAccess = () => {
        addHapticFeedback(HapticStrength.Medium)
        grantLifetimeAccess('paid')
    }

    const handleRevokeLifetimeAccess = () => {
        addHapticFeedback(HapticStrength.Medium)
        // Reset to pending state
        useChakraJourneyStore.setState({
            hasLifetimeAccess: false,
            paymentStatus: 'pending',
        })
    }

    const handleStartJourney = () => {
        addHapticFeedback(HapticStrength.Medium)
        startJourney(currentWeekStartDate)
    }

    const handleResetJourney = () => {
        addHapticFeedback(HapticStrength.Medium)
        resetJourney()
    }

    const handleCompleteTrial = () => {
        addHapticFeedback(HapticStrength.Medium)
        completeTrialCourse()
    }

    const handleCompleteAllChakras = () => {
        addHapticFeedback(HapticStrength.Medium)
        _setAllCompleted(true)
        // Mark all days as participated
        for (let i = 0; i < 7; i++) {
            useChakraJourneyStore.getState().markDayParticipated(i)
            useChakraJourneyStore.getState().markChakraCompleted(i)
        }
    }

    const handleClearAllProgress = () => {
        addHapticFeedback(HapticStrength.Medium)
        clearAllCompleted()
        resetJourney()
        useChakraJourneyStore.setState({
            completedTrialCourses: 0,
            hasLifetimeAccess: false,
            paymentStatus: 'pending',
            initialOpenDate: null,
            courseStartDate: null,
        })
    }

    const handleSetInitialOpenDate = () => {
        addHapticFeedback(HapticStrength.Light)
        const today = new Date().toISOString().split('T')[0]
        setInitialOpenDate(today)
    }

    if (!visible) return null

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-black">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
                    <View className="flex-1">
                        <AppText font="instrument-bold" size="xl" className="text-white">
                            Developer Override System
                        </AppText>
                        <AppText font="instrument-regular" size="sm" className="text-gray-400 mt-1">
                            Test full customer flow with bypass controls
                        </AppText>
                    </View>
                    <Pressable onPress={onClose} className="p-2">
                        <Ionicons name="close" size={28} color="white" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
                    {/* Master Toggle */}
                    <View className="bg-purple-900/30 rounded-lg p-4 mb-6 border border-purple-700/50">
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-1">
                                <AppText font="instrument-bold" size="lg" className="text-white mb-1">
                                    Master Developer Mode
                                </AppText>
                                <AppText font="instrument-regular" size="sm" className="text-gray-300">
                                    Bypass all timegates, payment gates, and restrictions
                                </AppText>
                            </View>
                            <Switch
                                value={devModeEnabled}
                                onValueChange={handleToggleDevMode}
                                trackColor={{ false: '#4b5563', true: '#9333ea' }}
                                thumbColor={devModeEnabled ? '#ffffff' : '#9ca3af'}
                            />
                        </View>
                        {devModeEnabled && (
                            <View className="mt-3 bg-green-500/20 rounded p-2 border border-green-500/50">
                                <AppText font="instrument-regular" size="xs" className="text-green-400">
                                    ✓ All walls bypassed - Full access enabled
                                </AppText>
                            </View>
                        )}
                    </View>

                    {/* Current State */}
                    <View className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-800">
                        <AppText font="instrument-bold" size="base" className="text-white mb-3">
                            Current State
                        </AppText>
                        <View className="gap-2">
                            <View className="flex-row justify-between">
                                <AppText font="instrument-regular" size="sm" className="text-gray-400">
                                    Journey Started:
                                </AppText>
                                <AppText font="instrument-medium" size="sm" className={journeyStarted ? 'text-green-400' : 'text-red-400'}>
                                    {journeyStarted ? 'Yes' : 'No'}
                                </AppText>
                            </View>
                            <View className="flex-row justify-between">
                                <AppText font="instrument-regular" size="sm" className="text-gray-400">
                                    Lifetime Access:
                                </AppText>
                                <AppText font="instrument-medium" size="sm" className={hasLifetimeAccess ? 'text-green-400' : 'text-red-400'}>
                                    {hasLifetimeAccess ? 'Yes' : 'No'}
                                </AppText>
                            </View>
                            <View className="flex-row justify-between">
                                <AppText font="instrument-regular" size="sm" className="text-gray-400">
                                    Completed Trials:
                                </AppText>
                                <AppText font="instrument-medium" size="sm" className="text-white">
                                    {completedTrialCourses}/2
                                </AppText>
                            </View>
                            <View className="flex-row justify-between">
                                <AppText font="instrument-regular" size="sm" className="text-gray-400">
                                    All Chakras Completed:
                                </AppText>
                                <AppText font="instrument-medium" size="sm" className={allChakrasCompleted ? 'text-green-400' : 'text-red-400'}>
                                    {allChakrasCompleted ? 'Yes' : 'No'}
                                </AppText>
                            </View>
                            <View className="flex-row justify-between">
                                <AppText font="instrument-regular" size="sm" className="text-gray-400">
                                    Initial Open Date:
                                </AppText>
                                <AppText font="instrument-medium" size="sm" className="text-white">
                                    {initialOpenDate || 'Not set'}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View className="mb-6">
                        <AppText font="instrument-bold" size="base" className="text-white mb-3">
                            Quick Actions
                        </AppText>
                        <View className="gap-3">
                            <Pressable
                                onPress={handleGrantLifetimeAccess}
                                className="bg-green-700/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Grant Lifetime Access
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Bypass all payment gates
                                    </AppText>
                                </View>
                                <Ionicons name="checkmark-circle" size={24} color="white" />
                            </Pressable>

                            <Pressable
                                onPress={handleRevokeLifetimeAccess}
                                className="bg-red-700/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Revoke Lifetime Access
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Return to trial state
                                    </AppText>
                                </View>
                                <Ionicons name="close-circle" size={24} color="white" />
                            </Pressable>

                            <Pressable
                                onPress={handleStartJourney}
                                className="bg-blue-700/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Start Journey
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Begin the chakra journey
                                    </AppText>
                                </View>
                                <Ionicons name="play-circle" size={24} color="white" />
                            </Pressable>

                            <Pressable
                                onPress={handleCompleteAllChakras}
                                className="bg-purple-700/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Complete All Chakras
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Mark all 7 chakras as completed
                                    </AppText>
                                </View>
                                <Ionicons name="checkmark-done-circle" size={24} color="white" />
                            </Pressable>

                            <Pressable
                                onPress={handleCompleteTrial}
                                className="bg-orange-700/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Complete Trial Course
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Increment trial counter ({completedTrialCourses}/2)
                                    </AppText>
                                </View>
                                <Ionicons name="arrow-forward-circle" size={24} color="white" />
                            </Pressable>

                            <Pressable
                                onPress={handleSetInitialOpenDate}
                                className="bg-indigo-700/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Set Initial Open Date
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Set today as first launch date
                                    </AppText>
                                </View>
                                <Ionicons name="calendar" size={24} color="white" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Reset Actions */}
                    <View className="mb-6">
                        <AppText font="instrument-bold" size="base" className="text-white mb-3">
                            Reset Actions
                        </AppText>
                        <View className="gap-3">
                            <Pressable
                                onPress={handleResetJourney}
                                className="bg-gray-700/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Reset Journey
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Reset weekly progress (keeps trial count)
                                    </AppText>
                                </View>
                                <Ionicons name="refresh-circle" size={24} color="white" />
                            </Pressable>

                            <Pressable
                                onPress={handleClearAllProgress}
                                className="bg-red-900/80 rounded-lg p-4 flex-row items-center justify-between active:opacity-80 border border-red-700/50"
                            >
                                <View className="flex-1">
                                    <AppText font="instrument-bold" size="base" className="text-white">
                                        Clear All Progress
                                    </AppText>
                                    <AppText font="instrument-regular" size="xs" className="text-gray-300 mt-1">
                                        Reset everything to initial state
                                    </AppText>
                                </View>
                                <Ionicons name="trash" size={24} color="white" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Info */}
                    <View className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50 mb-6">
                        <AppText font="instrument-regular" size="xs" className="text-blue-300 leading-5">
                            💡 <AppText font="instrument-bold">Tip:</AppText> Use "Grant Lifetime Access" to bypass payment gates, then "Revoke" to test the payment flow. Use "Complete Trial Course" to simulate reaching the commitment gate.
                        </AppText>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

