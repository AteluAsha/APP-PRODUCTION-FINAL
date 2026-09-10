/**
 * One of seven Gallery chambers: full-size plate that flips to the reading.
 * Tap turns the plate. Tap again turns it back. Back never leaves the room.
 */

import React, { useEffect } from 'react'
import {
    View,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Platform,
    useWindowDimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { AppText } from '@/components/AppText'
import { chakraContent } from '@/constants/chakras/content'
import { getChakraColor } from '@/constants/chakras/chakraConstants'
import {
    GALLERY_RETURN_TO_DAY,
    GALLERY_VEILED_LINE,
    GALLERY_CORRESPONDENCE_LABELS,
    GALLERY_OPEN_READING,
    GALLERY_FLIP_HINT,
    GALLERY_FLIP_BACK_HINT,
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

const FLIP_MS = 780
const CARD_ASPECT = 4 / 3

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
    isFlipped,
    onToggleFlip,
    onReturnToDay,
}: {
    chakra: Chakra
    width: number
    unlocked: boolean
    topPad: number
    bottomPad: number
    isFlipped: boolean
    onToggleFlip: () => void
    onReturnToDay: () => void
}) {
    const { height: windowHeight } = useWindowDimensions()
    const day = CHAKRA_TO_DAY[chakra]
    const content = chakraContent[chakra]
    const elements = content?.elements
    const mantra = formatHeroAffirmationText(content?.affirmationText ?? '')
    const chakraColor = getChakraColor(day)
    const flip = useSharedValue(isFlipped ? 1 : 0)

    const maxWidth = Math.max(width - 20, 280)
    const maxHeight = Math.max(
        windowHeight - topPad - bottomPad - 56,
        320,
    )
    let plateWidth = maxWidth
    let plateHeight = plateWidth * CARD_ASPECT
    if (plateHeight > maxHeight) {
        plateHeight = maxHeight
        plateWidth = plateHeight / CARD_ASPECT
    }

    useEffect(() => {
        flip.value = withTiming(isFlipped ? 1 : 0, {
            duration: FLIP_MS,
            easing: Easing.inOut(Easing.cubic),
        })
    }, [isFlipped, flip])

    const frontStyle = useAnimatedStyle(() => ({
        opacity: interpolate(flip.value, [0, 0.46, 0.54, 1], [1, 1, 0, 0]),
        transform: [
            { perspective: 1400 },
            { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
        ],
    }))

    const backStyle = useAnimatedStyle(() => ({
        opacity: interpolate(flip.value, [0, 0.46, 0.54, 1], [0, 0, 1, 1]),
        transform: [
            { perspective: 1400 },
            { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
        ],
    }))

    const toggle = () => {
        addHapticFeedback(HapticStrength.Light)
        onToggleFlip()
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

            <View
                style={[
                    styles.stage,
                    {
                        paddingTop: topPad,
                        paddingBottom: bottomPad,
                    },
                ]}
            >
                {!unlocked ? (
                    <AppText font="cormorant-italic" style={styles.veiled}>
                        {GALLERY_VEILED_LINE}
                    </AppText>
                ) : elements?.background ? (
                    <>
                        <View
                            style={[
                                styles.haloWrap,
                                {
                                    width: plateWidth,
                                    height: plateHeight,
                                    shadowColor: hexToRgba(chakraColor, 0.85),
                                },
                            ]}
                        >
                            <View
                                pointerEvents="none"
                                style={[
                                    styles.halo,
                                    {
                                        backgroundColor: hexToRgba(
                                            chakraColor,
                                            0.28,
                                        ),
                                    },
                                ]}
                            />
                            <Animated.View
                                pointerEvents={isFlipped ? 'none' : 'auto'}
                                style={[
                                    styles.face,
                                    {
                                        width: plateWidth,
                                        height: plateHeight,
                                        shadowColor: hexToRgba(
                                            chakraColor,
                                            0.7,
                                        ),
                                    },
                                    frontStyle,
                                ]}
                            >
                                <Pressable
                                    onPress={toggle}
                                    style={styles.platePress}
                                    accessibilityRole="button"
                                    accessibilityLabel={GALLERY_OPEN_READING}
                                >
                                    <Image
                                        source={elements.background}
                                        style={styles.plate}
                                        resizeMode="contain"
                                    />
                                </Pressable>
                            </Animated.View>
                            <Animated.View
                                pointerEvents={isFlipped ? 'auto' : 'none'}
                                style={[
                                    styles.face,
                                    styles.backFace,
                                    {
                                        width: plateWidth,
                                        height: plateHeight,
                                        borderColor: hexToRgba(
                                            chakraColor,
                                            0.42,
                                        ),
                                    },
                                    backStyle,
                                ]}
                            >
                                <Pressable
                                    onPress={toggle}
                                    style={styles.platePress}
                                    accessibilityRole="button"
                                    accessibilityLabel={GALLERY_FLIP_BACK_HINT}
                                >
                                    <LinearGradient
                                        colors={[
                                            'rgba(12, 10, 8, 0.94)',
                                            'rgba(8, 10, 12, 0.96)',
                                        ]}
                                        start={{ x: 0.5, y: 0 }}
                                        end={{ x: 0.5, y: 1 }}
                                        style={styles.backFill}
                                    >
                                        <ScrollView
                                            style={styles.backScroll}
                                            contentContainerStyle={
                                                styles.backScrollInner
                                            }
                                            showsVerticalScrollIndicator={false}
                                            bounces={false}
                                        >
                                            <AppText
                                                font="cormorant-italic"
                                                numberOfLines={
                                                    HERO_AFFIRMATION_MAX_LINES
                                                }
                                                style={styles.mantra}
                                            >
                                                {mantra}
                                            </AppText>

                                            <View
                                                style={styles.correspondences}
                                            >
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
                                                        <View
                                                            key={label}
                                                            style={
                                                                styles.corrRow
                                                            }
                                                        >
                                                            <AppText
                                                                font="instrument-regular"
                                                                style={
                                                                    styles.corrLabel
                                                                }
                                                            >
                                                                {label}
                                                            </AppText>
                                                            <AppText
                                                                font="cormorant-italic"
                                                                style={
                                                                    styles.corrValue
                                                                }
                                                            >
                                                                {value}
                                                            </AppText>
                                                        </View>
                                                    ) : null,
                                                )}
                                            </View>

                                            <Pressable
                                                onPress={() => {
                                                    addHapticFeedback(
                                                        HapticStrength.Light,
                                                    )
                                                    onReturnToDay()
                                                }}
                                                style={({ pressed }) => [
                                                    styles.returnBtn,
                                                    {
                                                        opacity: pressed
                                                            ? 0.88
                                                            : 1,
                                                    },
                                                ]}
                                                hitSlop={TOUCH.hitSlop}
                                                accessibilityRole="button"
                                                accessibilityLabel={
                                                    GALLERY_RETURN_TO_DAY
                                                }
                                            >
                                                <AppText
                                                    font="cormorant-italic"
                                                    style={styles.returnLabel}
                                                >
                                                    {GALLERY_RETURN_TO_DAY}
                                                </AppText>
                                            </Pressable>
                                        </ScrollView>
                                    </LinearGradient>
                                </Pressable>
                            </Animated.View>
                        </View>
                        <AppText
                            font="cormorant-italic"
                            style={styles.hint}
                        >
                            {isFlipped
                                ? GALLERY_FLIP_BACK_HINT
                                : GALLERY_FLIP_HINT}
                        </AppText>
                    </>
                ) : null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    stage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
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
        transform: [{ scaleX: 0.9 }, { scaleY: 0.94 }],
    },
    face: {
        position: 'absolute',
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 22,
        elevation: 12,
    },
    backFace: {
        borderWidth: 1,
        backgroundColor: '#0c0a08',
    },
    plate: {
        width: '100%',
        height: '100%',
    },
    platePress: {
        width: '100%',
        height: '100%',
    },
    backFill: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    backScroll: {
        flex: 1,
    },
    backScrollInner: {
        paddingVertical: 22,
        paddingHorizontal: 20,
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
    },
    mantra: {
        fontSize: 26,
        lineHeight: 34,
        color: 'rgba(255, 248, 236, 0.98)',
        textAlign: 'center',
        marginBottom: 18,
        textShadowColor: 'rgba(232, 201, 140, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    correspondences: {
        width: '100%',
        maxWidth: 360,
        gap: 12,
        marginBottom: 22,
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
    hint: {
        marginTop: 16,
        color: 'rgba(232, 201, 140, 0.82)',
        fontSize: 16,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    veiled: {
        color: 'rgba(255, 248, 236, 0.55)',
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        maxWidth: 280,
    },
})
