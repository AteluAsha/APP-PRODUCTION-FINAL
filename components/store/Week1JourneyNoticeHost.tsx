/**
 * Shows the first-journey reminder notice after Chakras 101 closes.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking } from 'react-native'
import { usePathname } from 'expo-router'
import { Week1JourneyNoticeModal } from '@/components/chakras/Week1JourneyNoticeModal'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { useSplashOverlayStore } from '@/hooks/useSplashOverlayStore'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import {
    activateDailyAlignmentReminders,
    hasNotificationPermission,
    syncWeeklyHeartReminders,
} from '@/src/services/journeyNotifications'
import {
    localDateKey,
    shouldOfferWeek1JourneyNotice,
} from '@/src/utils/week1JourneyReminders'

const SETTLE_MS = 640

function isNoticeScreen(pathname: string): boolean {
    if (!pathname) return false
    if (pathname.includes('Chakras101')) return false
    if (pathname.includes('AudioPlayer')) return false
    return true
}

export function Week1JourneyNoticeHost() {
    const pathname = usePathname() ?? ''
    const splashOverlayActive = useSplashOverlayStore(
        (s) => s.splashOverlayActive,
    )
    const pending = useFirstLaunchStore((s) => s.pendingWeek1JourneyNotice)
    const hasSeen = useFirstLaunchStore((s) => s.hasSeenWeek1JourneyNotice)
    const markSeen = useFirstLaunchStore((s) => s.markWeek1JourneyNoticeSeen)
    const initialOpenDate = useChakraJourneyStore((s) => s.initialOpenDate)
    const [visible, setVisible] = useState(false)

    const onSettledScreen =
        !splashOverlayActive && isNoticeScreen(pathname)

    const offer = shouldOfferWeek1JourneyNotice({
        hasSeen,
        initialOpenDate,
    })

    useEffect(() => {
        if (!onSettledScreen || !pending || !offer) {
            setVisible(false)
            return
        }
        const t = setTimeout(() => setVisible(true), SETTLE_MS)
        return () => clearTimeout(t)
    }, [onSettledScreen, pending, offer])

    const finish = useCallback(async () => {
        setVisible(false)
        markSeen()
        const store = useChakraJourneyStore.getState()
        if (!store.initialOpenDate) {
            store.setInitialOpenDate(localDateKey(new Date()))
        }
        store.setDailyAlignmentRemindersEnabled(true)
        const alreadyGranted = await hasNotificationPermission()
        const granted = alreadyGranted
            ? true
            : await activateDailyAlignmentReminders()
        if (!granted) {
            Alert.alert(
                'Allow notifications',
                'To walk with you this first week, turn on notifications for Awakening Soul in Settings. You can change this anytime in Profile.',
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
            return
        }
        await syncWeeklyHeartReminders()
    }, [markSeen])

    return (
        <Week1JourneyNoticeModal
            visible={visible}
            onUnderstand={() => {
                void finish()
            }}
        />
    )
}
