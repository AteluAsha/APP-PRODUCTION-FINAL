/**
 * One of seven Gallery chambers: the day's plate first, reading on a
 * second screen. The card is the room; the words wait behind it.
 */

import React, { useState } from 'react'
import {
    View,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { chakraContent } from '@/constants/chakras/content'
import { getChakraColor } from '@/constants/chakras/chakraConstants'
import {
    GALLERY_RETURN_TO_DAY,
    GALLERY_VEILED_LINE,
    GALLERY_CORRESPONDENCE_LABELS,
    GALLERY_OPEN_READING,
    GALLERY_BACK_TO_CARD,
} from '@/constants/galleryChambersCopy'
import {
    formatHeroAffirmationText,
    HERO_AFFIRMATION_MAX_LINES,
} from '@/constants/heroAffirmation'
import { getGoodbyeField } from '@/constants/sanctuaryFields'
import { Chakra } from '@/types/chakras/Chakra'
import { CHAKRA_TO_DAY } from '@/utils/chakraMapping'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { TOUCH } from '@/constants/layout'

function hexToRgba(hex: string, alpha: number): string {
    const raw = hex.replace('#', '')
    const n = parseInt(raw, 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function GalleryChamber({
    chakra,
    width,
    unlocked,
    topPad,
    bottomPad,
    onReturnToDay,
}: {
    chakra: Chakra
    width: number
    unlocked: boolean
    topPad: number
    bottomPad: number
    onReturnToDay: () => void
}) {
    const [isReading, setIsReading] = useState(false)
    const day = CHAKRA_TO_DAY[chakra]
    const content = chakraContent[chakra]
    const elements = content?.elements
    const mantra = formatHeroAffirmationText(content?.affirmationText ?? '')
    const chakraColor = getChakraColor(day)
    const plateWidth = Math.min(width * 0.88, 400)
    const plateHeight = plateWidth * (4 / 3)

    const openReading = () => {
        addHapticFeedback(HapticStrength.Light)
        setIsReading(true)
    }

    return (
        <View style={{ width, flex: 1 }}>
            <Image
                source={getGoodbyeField(day)}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />
            <LinearGradient
                colors={
                    unlocked
                        ? [
                              'rgba(0,0,0,0.28)',
                              'rgba(0,0,0,0.38)',
                              'rgba(0,0,0,0.62)',
                          ]
                        : [
                              'rgba(0,0,0,0.62)',
                              'rgba(0,0,0,0.72)',
                              'rgba(0,0,0,0.88)',
                          ]
                }
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{
                    paddingTop: topPad,
                    paddingBottom: bottomPad,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                    flexGrow: 1,
                    justifyContent: unlocked && !isReading ? 'center' : 'flex-start',
                }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
            >
                {!unlocked ? (
                    <AppText font="cormorant-italic" style={styles.veiled}>
                        {GALLERY_VEILED_LINE}
                    </AppText>
                ) : isReading ? (
                    <>
                        <Pressable
                            onPress={() => {
                                addHapticFeedback(HapticStrength.Light)
                                setIsReading(false)
                            }}
                            style={({ pressed }) => [
                                styles.backToCard,
                                { opacity: pressed ? 0.88 : 1 },
                            ]}
                            hitSlop={TOUCH.hitSlop}
                            accessibilityRole="button"
                            accessibilityLabel={GALLERY_BACK_TO_CARD}
                        >
                            <AppText
                                font="cormorant-italic"
                                style={styles.backToCardLabel}
                            >
                                {GALLERY_BACK_TO_CARD}
                            </AppText>
                        </Pressable>

                        <AppText
                            font="cormorant-italic"
                            numberOfLines={HERO_AFFIRMATION_MAX_LINES}
                            style={styles.mantra}
                        >
                            {mantra}
                        </AppText>

                        <View style={styles.correspondences}>
                            {(
                                [
                                    [
                                        GALLERY_CORRESPONDENCE_LABELS.stones,
                                        elements?.stones,
                                    ],
                                    [
                                        GALLERY_CORRESPONDENCE_LABELS.foods,
                                        elements?.foods,
                                    ],
                                    [
                                        GALLERY_CORRESPONDENCE_LABELS.colors,
                                        elements?.colors,
                                    ],
                                    [
                                        GALLERY_CORRESPONDENCE_LABELS.smells,
                                        elements?.smells,
                                    ],
                                ] as const
                            ).map(([label, value]) =>
                                value ? (
                                    <View key={label} style={styles.corrRow}>
                                        <AppText
                                            font="instrument-regular"
                                            style={styles.corrLabel}
                                        >
                                            {label}
                                        </AppText>
                                        <AppText
                                            font="cormorant-italic"
                                            style={styles.corrValue}
                                        >
                                            {value}
                                        </AppText>
                                    </View>
                                ) : null,
                            )}
                        </View>

                        <Pressable
                            onPress={() => {
                                addHapticFeedback(HapticStrength.Light)
                                onReturnToDay()
                            }}
                            style={({ pressed }) => [
                                styles.returnBtn,
                                { opacity: pressed ? 0.88 : 1 },
                            ]}
                            hitSlop={TOUCH.hitSlop}
                            accessibilityRole="button"
                            accessibilityLabel={GALLERY_RETURN_TO_DAY}
                        >
                            <AppText
                                font="cormorant-italic"
                                style={styles.returnLabel}
                            >
                                {GALLERY_RETURN_TO_DAY}
                            </AppText>
                        </Pressable>
                    </>
                ) : elements?.background ? (
                    <Pressable
                        onPress={openReading}
                        style={({ pressed }) => [
                            styles.haloWrap,
                            {
                                width: plateWidth + 36,
                                height: plateHeight + 36,
                                shadowColor: hexToRgba(chakraColor, 0.85),
                                opacity: pressed ? 0.94 : 1,
                            },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={GALLERY_OPEN_READING}
                    >
                        <View
                            pointerEvents="none"
                            style={[
                                styles.halo,
                                {
                                    backgroundColor: hexToRgba(chakraColor, 0.28),
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.plateWrap,
                                {
                                    width: plateWidth,
                                    height: plateHeight,
                                    shadowColor: hexToRgba(chakraColor, 0.7),
                                },
                            ]}
                        >
                            <Image
                                source={elements.background}
                                style={styles.plate}
                                resizeMode="contain"
                            />
                        </View>
                    </Pressable>
                ) : null}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    haloWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 36,
        elevation: 16,
    },
    halo: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 999,
        transform: [{ scaleX: 0.86 }, { scaleY: 0.92 }],
    },
    plateWrap: {
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 22,
        elevation: 12,
    },
    plate: {
        width: '100%',
        height: '100%',
    },
    mantra: {
        fontSize: 28,
        lineHeight: 36,
        color: 'rgba(255, 248, 236, 0.98)',
        textAlign: 'center',
        marginBottom: 22,
        textShadowColor: 'rgba(232, 201, 140, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    correspondences: {
        width: '100%',
        maxWidth: 360,
        gap: 14,
        marginBottom: 28,
    },
    corrRow: {
        alignItems: 'center',
    },
    corrLabel: {
        color: 'rgba(232, 201, 140, 0.7)',
        fontSize: 11,
        letterSpacing: 2.2,
        textTransform: 'uppercase',
        marginBottom: 4,
        textAlign: 'center',
    },
    corrValue: {
        color: 'rgba(255, 248, 236, 0.88)',
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'center',
    },
    returnBtn: {
        paddingVertical: Platform.OS === 'ios' ? 14 : 13,
        paddingHorizontal: 28,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.42)',
        backgroundColor: 'rgba(0, 0, 0, 0.28)',
    },
    returnLabel: {
        color: 'rgba(255, 248, 236, 0.92)',
        fontSize: 17,
        letterSpacing: 0.3,
    },
    backToCard: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 18,
    },
    backToCardLabel: {
        color: 'rgba(232, 201, 140, 0.88)',
        fontSize: 17,
        letterSpacing: 0.4,
    },
    veiled: {
        color: 'rgba(255, 248, 236, 0.55)',
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        marginTop: 36,
        maxWidth: 280,
    },
})
