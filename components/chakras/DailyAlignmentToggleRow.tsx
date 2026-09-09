/**
 * Daily alignment switch for Root day — same preference as Profile.
 */
import React, { useCallback } from 'react'
import { View, Switch, Platform, Alert, Linking, StyleSheet } from 'react-native'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import {
    activateDailyAlignmentReminders,
    syncWeeklyHeartReminders,
} from '@/src/services/journeyNotifications'

export function DailyAlignmentToggleRow({
    note,
}: {
    note?: string
} = {}) {
    const soulJourneyNudgesEnabled = useChakraJourneyStore(
        (s) => s.soulJourneyNudgesEnabled,
    )
    const dailyAlignmentRemindersEnabled = useChakraJourneyStore(
        (s) => s.dailyAlignmentRemindersEnabled,
    )
    const setSoulJourneyNudgesEnabled = useChakraJourneyStore(
        (s) => s.setSoulJourneyNudgesEnabled,
    )
    const setDailyAlignmentRemindersEnabled = useChakraJourneyStore(
        (s) => s.setDailyAlignmentRemindersEnabled,
    )
    const journeyOn = soulJourneyNudgesEnabled !== false
    const dailyOn = dailyAlignmentRemindersEnabled === true

    const onToggle = useCallback(
        async (next: boolean) => {
            addHapticFeedback(HapticStrength.Light)
            if (!next) {
                setDailyAlignmentRemindersEnabled(false)
                await syncWeeklyHeartReminders()
                return
            }
            if (!journeyOn) {
                setSoulJourneyNudgesEnabled(true)
            }
            const granted = await activateDailyAlignmentReminders()
            if (!granted) {
                Alert.alert(
                    'Allow notifications',
                    'To receive daily alignment reminders, turn on notifications for Awakening Soul in Settings. You can also change this in Profile.',
                    [
                        { text: 'Not now', style: 'cancel' },
                        {
                            text: 'Open Settings',
                            onPress: () => {
                                void Linking.openSettings()
                            },
                        },
                    ],
                )
            }
        },
        [
            journeyOn,
            setDailyAlignmentRemindersEnabled,
            setSoulJourneyNudgesEnabled,
        ],
    )

    return (
        <View style={styles.row}>
            <View style={styles.textCol}>
                <AppText font="instrument-medium" size="sm" style={styles.title}>
                    Daily alignment reminders
                </AppText>
                <AppText
                    font="instrument-regular"
                    size="xs"
                    style={styles.sub}
                >
                    {note ??
                        'On for this week. Change anytime in Profile.'}
                </AppText>
            </View>
            <Switch
                value={dailyOn}
                onValueChange={(v) => {
                    void onToggle(v)
                }}
                trackColor={{
                    false: 'rgba(255,255,255,0.2)',
                    true: 'rgba(232, 201, 140, 0.42)',
                }}
                thumbColor={
                    Platform.OS === 'android'
                        ? dailyOn
                            ? 'rgba(255, 248, 236, 0.95)'
                            : 'rgba(200, 200, 200, 0.95)'
                        : undefined
                }
                ios_backgroundColor="rgba(255,255,255,0.2)"
                accessibilityLabel="Daily alignment reminders"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        width: '92%',
        alignSelf: 'center',
        marginTop: 18,
        marginBottom: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.22)',
        backgroundColor: 'rgba(8, 6, 5, 0.42)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textCol: {
        flex: 1,
    },
    title: {
        color: 'rgba(255, 248, 236, 0.94)',
        marginBottom: 4,
    },
    sub: {
        color: 'rgba(255, 255, 255, 0.58)',
        lineHeight: 16,
    },
})
