/**
 * Host for the store-update offering.
 *
 * Silent unless: splash is gone, user is on a home screen, Play/App Store
 * still has a newer binary, and the 24h auto-update grace has passed.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { AppState, Linking, Platform, type AppStateStatus } from 'react-native'
import { usePathname } from 'expo-router'
import { FreshOfferingModal } from '@/components/store/FreshOfferingModal'
import { APP_STORE_URLS } from '@/constants/sharing'
import { useSplashOverlayStore } from '@/hooks/useSplashOverlayStore'
import { useStoreUpdateNoticeStore } from '@/hooks/useStoreUpdateNoticeStore'
import { checkStoreUpdateAvailability } from '@/src/services/storeUpdateAvailability'
import { shouldOfferStoreUpdate } from '@/src/utils/shouldOfferStoreUpdate'

const HOME_SETTLE_MS = 2800

export function isQuietHomePath(pathname: string): boolean {
    return (
        pathname.includes('ChakraHub') || pathname.includes('ChakraHome')
    )
}

export function StoreUpdateNoticeHost() {
    const pathname = usePathname() ?? ''
    const splashOverlayActive = useSplashOverlayStore(
        (s) => s.splashOverlayActive,
    )
    const dismissedVersion = useStoreUpdateNoticeStore((s) => s.dismissedVersion)
    const firstSeenVersion = useStoreUpdateNoticeStore((s) => s.firstSeenVersion)
    const firstSeenAt = useStoreUpdateNoticeStore((s) => s.firstSeenAt)
    const lastOfferedAt = useStoreUpdateNoticeStore((s) => s.lastOfferedAt)
    const noteFirstSeen = useStoreUpdateNoticeStore((s) => s.noteFirstSeen)
    const markDismissed = useStoreUpdateNoticeStore((s) => s.markDismissed)
    const markOffered = useStoreUpdateNoticeStore((s) => s.markOffered)

    const [storeVersion, setStoreVersion] = useState('')
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [visible, setVisible] = useState(false)

    const onHome =
        !splashOverlayActive && isQuietHomePath(pathname)

    const refreshAvailability = useCallback(async () => {
        if (!onHome) return
        const result = await checkStoreUpdateAvailability()
        if (!result.available) {
            setUpdateAvailable(false)
            setStoreVersion('')
            setVisible(false)
            return
        }
        setUpdateAvailable(true)
        setStoreVersion(result.storeVersion)
        noteFirstSeen(result.storeVersion)
    }, [onHome, noteFirstSeen])

    useEffect(() => {
        if (!onHome) {
            setVisible(false)
            return
        }
        const t = setTimeout(() => {
            void refreshAvailability()
        }, HOME_SETTLE_MS)
        return () => clearTimeout(t)
    }, [onHome, refreshAvailability])

    useEffect(() => {
        const onChange = (next: AppStateStatus) => {
            if (next === 'active') void refreshAvailability()
        }
        const sub = AppState.addEventListener('change', onChange)
        return () => sub.remove()
    }, [refreshAvailability])

    useEffect(() => {
        if (!onHome || !updateAvailable || !storeVersion) {
            setVisible(false)
            return
        }
        const offer = shouldOfferStoreUpdate({
            updateAvailable,
            storeVersion,
            dismissedVersion,
            firstSeenVersion,
            firstSeenAt,
            lastOfferedAt,
            now: Date.now(),
        })
        setVisible(offer)
    }, [
        onHome,
        updateAvailable,
        storeVersion,
        dismissedVersion,
        firstSeenVersion,
        firstSeenAt,
        lastOfferedAt,
    ])

    const handleReceive = () => {
        markOffered()
        setVisible(false)
        const url =
            Platform.OS === 'ios' ? APP_STORE_URLS.ios : APP_STORE_URLS.android
        Linking.openURL(url).catch(() => {
            if (__DEV__) {
                console.warn('[StoreUpdateNotice] store URL failed')
            }
        })
    }

    const handleNotNow = () => {
        if (storeVersion) markDismissed(storeVersion)
        setVisible(false)
    }

    return (
        <FreshOfferingModal
            visible={visible}
            onReceive={handleReceive}
            onNotNow={handleNotNow}
        />
    )
}
