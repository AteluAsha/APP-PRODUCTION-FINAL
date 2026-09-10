/**
 * After the Crown goodbye, remind seekers that daily alignment lives in Profile.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'expo-router'
import { Week1JourneyNoticeModal } from '@/components/chakras/Week1JourneyNoticeModal'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { useSplashOverlayStore } from '@/hooks/useSplashOverlayStore'
import { useTomorrowAwakeningStore } from '@/hooks/useTomorrowAwakeningStore'
import { CROWN_GOODBYE_PROFILE_REMINDER_COPY } from '@/constants/journeyNotificationCopy'

const SETTLE_MS = 640

export function CrownReminderNoticeHost() {
    const pathname = usePathname() ?? ''
    const splashOverlayActive = useSplashOverlayStore(
        (s) => s.splashOverlayActive,
    )
    const pending = useFirstLaunchStore((s) => s.pendingCrownReminderNotice)
    const hasSeen = useFirstLaunchStore((s) => s.hasSeenCrownReminderNotice)
    const markSeen = useFirstLaunchStore((s) => s.markCrownReminderNoticeSeen)
    const tomorrowDayIndex = useTomorrowAwakeningStore(
        (s) => s.completedDayIndex,
    )
    const [visible, setVisible] = useState(false)

    const onHub =
        !splashOverlayActive && pathname.includes('ChakraHub')

    useEffect(() => {
        if (!onHub || !pending || hasSeen || tomorrowDayIndex != null) {
            setVisible(false)
            return
        }
        const t = setTimeout(() => setVisible(true), SETTLE_MS)
        return () => clearTimeout(t)
    }, [onHub, pending, hasSeen, tomorrowDayIndex])

    const finish = useCallback(() => {
        setVisible(false)
        markSeen()
    }, [markSeen])

    return (
        <Week1JourneyNoticeModal
            visible={visible}
            copy={CROWN_GOODBYE_PROFILE_REMINDER_COPY}
            onUnderstand={finish}
        />
    )
}
