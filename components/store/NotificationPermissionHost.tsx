/**
 * Once after entering Sanctuary: pre-prompt, then the system notification dialog.
 * Hub-first never showed this, so Android never got POST_NOTIFICATIONS and
 * weekly heart reminders no-op'd. Fresh install / reinstall prompts again.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'expo-router'
import { CommunicationReminderModal } from '@/components/chakras/CommunicationReminderModal'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { useSplashOverlayStore } from '@/hooks/useSplashOverlayStore'
import {
    activateDailyAlignmentReminders,
    hasNotificationPermission,
} from '@/src/services/journeyNotifications'

const SETTLE_MS = 900

function isSanctuaryHub(pathname: string): boolean {
    if (!pathname) return false
    if (pathname.includes('WellnessGate')) return false
    if (pathname.includes('AudioPlayer')) return false
    return pathname.includes('ChakraHub')
}

export function NotificationPermissionHost() {
    const pathname = usePathname() ?? ''
    const splashOverlayActive = useSplashOverlayStore(
        (s) => s.splashOverlayActive,
    )
    const hasStartedMasterTeachings = useFirstLaunchStore(
        (s) => s.hasStartedMasterTeachings,
    )
    const hasSeenPrompt = useFirstLaunchStore(
        (s) => s.hasSeenNotificationPermissionPrompt,
    )
    const markSeen = useFirstLaunchStore(
        (s) => s.markNotificationPermissionPromptSeen,
    )
    const [visible, setVisible] = useState(false)

    const onHub =
        !splashOverlayActive &&
        hasStartedMasterTeachings &&
        isSanctuaryHub(pathname)

    useEffect(() => {
        if (!onHub || hasSeenPrompt) {
            setVisible(false)
            return
        }
        let cancelled = false
        const t = setTimeout(() => {
            void (async () => {
                if (cancelled) return
                if (await hasNotificationPermission()) {
                    markSeen()
                    await activateDailyAlignmentReminders()
                    return
                }
                if (!cancelled) setVisible(true)
            })()
        }, SETTLE_MS)
        return () => {
            cancelled = true
            clearTimeout(t)
        }
    }, [onHub, hasSeenPrompt, markSeen])

    const finish = useCallback(
        async (allow: boolean) => {
            setVisible(false)
            markSeen()
            if (!allow) return
            await activateDailyAlignmentReminders()
        },
        [markSeen],
    )

    return (
        <CommunicationReminderModal
            visible={visible}
            onAllow={() => {
                void finish(true)
            }}
            onNotNow={() => {
                void finish(false)
            }}
        />
    )
}
