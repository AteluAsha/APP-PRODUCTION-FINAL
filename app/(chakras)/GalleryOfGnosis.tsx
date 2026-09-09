/**
 * Gallery of Alignment — seven chambers.
 * `?chakra=` from goodbye opens that day's chamber. Home when arriving from goodbye.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    View,
    ScrollView,
    Pressable,
    StyleSheet,
    Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ActionBar } from '@/components/ActionBar'
import { ScreenCrashBoundary } from '@/components/ScreenCrashBoundary'
import { AppText } from '@/components/AppText'
import { GalleryChamber } from '@/components/gallery/GalleryChamber'
import { GallerySpine } from '@/components/gallery/GallerySpine'
import { GalleryChambersNoticeModal } from '@/components/gallery/GalleryChambersNoticeModal'
import { GALLERY_TITLE } from '@/constants/galleryChambersCopy'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import {
    CHAKRA_ORDER,
    CHAKRA_TO_DAY,
    galleryChamberIndex,
    parseChakraSlug,
} from '@/utils/chakraMapping'
import { goToChakraHubRoot } from '@/utils/navigationHelpers'
import { ICON, safeOverlayTop, TOUCH } from '@/constants/layout'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'

const { width: WINDOW_WIDTH } = Dimensions.get('window')
const SETTLE_NOTICE_MS = 720

function GalleryOfGnosis() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const overlayTop = safeOverlayTop(insets.top)
    const { chakra: chakraParam } = useLocalSearchParams<{
        chakra?: string | string[]
    }>()
    const focusChakra = parseChakraSlug(chakraParam)
    const openedFromGoodbye = focusChakra != null
    const hasEverCompletedChakra = useChakraJourneyStore(
        (s) => s.hasEverCompletedChakra,
    )
    const everCompletedChakras = useChakraJourneyStore(
        (s) => s.everCompletedChakras,
    )
    const hasSeenNotice = useFirstLaunchStore(
        (s) => s.hasSeenGalleryChambersNotice,
    )
    const markNoticeSeen = useFirstLaunchStore(
        (s) => s.markGalleryChambersNoticeSeen,
    )

    const [currentIndex, setCurrentIndex] = useState(0)
    const [viewportWidth, setViewportWidth] = useState(WINDOW_WIDTH)
    const [noticeVisible, setNoticeVisible] = useState(false)
    const scrollRef = useRef<ScrollView>(null)

    const lastUnlockedDay = useMemo(() => {
        let last = 0
        for (let day = 0; day <= 6; day++) {
            if (hasEverCompletedChakra(day)) last = day
        }
        return last
    }, [hasEverCompletedChakra, everCompletedChakras])

    const startIndex = useMemo(
        () => galleryChamberIndex(focusChakra, lastUnlockedDay),
        [focusChakra, lastUnlockedDay],
    )

    const onLayout = useCallback(
        (e: { nativeEvent: { layout: { width: number } } }) => {
            const w = e.nativeEvent.layout.width
            if (w > 0) setViewportWidth(w)
        },
        [],
    )

    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollRef.current && viewportWidth > 0) {
                scrollRef.current.scrollTo({
                    x: viewportWidth * startIndex,
                    animated: false,
                })
                setCurrentIndex(startIndex)
            }
        }, 50)
        return () => clearTimeout(timer)
    }, [viewportWidth, startIndex])

    useEffect(() => {
        if (hasSeenNotice) return
        const t = setTimeout(() => setNoticeVisible(true), SETTLE_NOTICE_MS)
        return () => clearTimeout(t)
    }, [hasSeenNotice])

    const handleScroll = useCallback(
        (e: { nativeEvent: { contentOffset: { x: number } } }) => {
            const offset = e.nativeEvent.contentOffset.x
            const index = Math.round(offset / viewportWidth)
            setCurrentIndex(Math.max(0, Math.min(index, 6)))
        },
        [viewportWidth],
    )

    const scrollToChamber = useCallback(
        (index: number) => {
            const clamped = Math.max(0, Math.min(6, index))
            scrollRef.current?.scrollTo({
                x: viewportWidth * clamped,
                animated: true,
            })
            setCurrentIndex(clamped)
        },
        [viewportWidth],
    )

    const handleBack = () => {
        if (openedFromGoodbye) {
            goToChakraHubRoot()
            return
        }
        if (router.canGoBack()) {
            router.back()
            return
        }
        goToChakraHubRoot()
    }

    const closeNotice = useCallback(() => {
        setNoticeVisible(false)
        markNoticeSeen()
    }, [markNoticeSeen])

    const reopenNotice = useCallback(() => {
        addHapticFeedback(HapticStrength.Light)
        setNoticeVisible(true)
    }, [])

    const topPad = overlayTop + ICON.homeButton + 8
    const bottomPad = Math.max(insets.bottom, 16) + 88

    return (
        <View style={styles.root}>
            <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={styles.pager}
                >
                    {CHAKRA_ORDER.map((chakra) => {
                        const day = CHAKRA_TO_DAY[chakra]
                        return (
                            <GalleryChamber
                                key={chakra}
                                chakra={chakra}
                                width={viewportWidth}
                                unlocked={hasEverCompletedChakra(day)}
                                topPad={topPad}
                                bottomPad={bottomPad}
                                onReturnToDay={() => {
                                    router.push(
                                        `/(chakras)/${chakra}` as const,
                                    )
                                }}
                            />
                        )
                    })}
                </ScrollView>
            </View>

            <ActionBar
                onBackPress={handleBack}
                useHomeButton={openedFromGoodbye}
            />
            <Pressable
                onPress={reopenNotice}
                style={[styles.infoBtn, { top: overlayTop }]}
                hitSlop={TOUCH.hitSlop}
                accessibilityRole="button"
                    accessibilityLabel="About the Gallery of Alignment"
            >
                <Ionicons
                    name="information-circle-outline"
                    size={26}
                    color="rgba(255, 248, 236, 0.88)"
                />
            </Pressable>
            <View
                style={[styles.titleWrap, { top: overlayTop }]}
                pointerEvents="none"
            >
                <AppText font="cormorant-italic" style={styles.title}>
                    {GALLERY_TITLE}
                </AppText>
            </View>

            <View
                style={[
                    styles.spineWrap,
                    { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
                pointerEvents="box-none"
            >
                <GallerySpine
                    currentIndex={currentIndex}
                    isUnlocked={(day) => hasEverCompletedChakra(day)}
                    onSelect={scrollToChamber}
                />
            </View>

            <GalleryChambersNoticeModal
                visible={noticeVisible}
                onUnderstand={closeNotice}
            />
        </View>
    )
}

export default function GalleryOfGnosisScreen() {
    return (
        <ScreenCrashBoundary>
            <GalleryOfGnosis />
        </ScreenCrashBoundary>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },
    pager: {
        flex: 1,
    },
    titleWrap: {
        position: 'absolute',
        left: 64,
        right: 64,
        height: ICON.homeButton,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    title: {
        textAlign: 'center',
        color: 'rgba(255, 248, 236, 0.9)',
        fontSize: 20,
        letterSpacing: 1.4,
        textShadowColor: 'rgba(0,0,0,0.65)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    infoBtn: {
        position: 'absolute',
        right: 16,
        width: ICON.homeButton,
        height: ICON.homeButton,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    spineWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingTop: 8,
        backgroundColor: 'transparent',
    },
})
