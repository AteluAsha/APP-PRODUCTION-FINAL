/**
 * Loving accountability: remaining course-day audio before the close.
 * Android transparent Modal: keep mounted; gate children on `visible`.
 */

import React from 'react'
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { MODAL_CARD_MAX_WIDTH, TOUCH } from '@/constants/layout'
import { DAY_EMBODIMENT_GATE_COPY } from '@/constants/dayEmbodimentCopy'
import {
    type DayAudioKind,
    labelForDayAudioKind,
} from '@/src/utils/dayAudioEmbodiment'

interface DayEmbodimentGateModalProps {
    visible: boolean
    remaining: DayAudioKind[]
    onTakeMeThere: () => void
    onCloseInMyTiming: () => void
    onStay: () => void
}

export function DayEmbodimentGateModal({
    visible,
    remaining,
    onTakeMeThere,
    onCloseInMyTiming,
    onStay,
}: DayEmbodimentGateModalProps) {
    const handleThere = () => {
        addHapticFeedback(HapticStrength.Medium)
        onTakeMeThere()
    }
    const handleOverride = () => {
        addHapticFeedback(HapticStrength.Medium)
        onCloseInMyTiming()
    }
    const handleStay = () => {
        addHapticFeedback(HapticStrength.Light)
        onStay()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleStay}
            statusBarTranslucent={Platform.OS === 'android'}
        >
            {visible ? (
                <View
                    style={[
                        styles.overlay,
                        Platform.OS === 'android' && {
                            elevation: 9999,
                            zIndex: 9999,
                        },
                    ]}
                    pointerEvents="box-none"
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={handleStay}
                        accessibilityLabel="Dismiss"
                    />
                    <View
                        style={[
                            styles.card,
                            Platform.OS === 'android' && {
                                elevation: 24,
                                zIndex: 1,
                            },
                        ]}
                        pointerEvents="box-none"
                        collapsable={false}
                    >
                        <LinearGradient
                            colors={[
                                'rgba(24, 20, 22, 0.99)',
                                'rgba(14, 10, 12, 0.99)',
                                'rgba(12, 14, 12, 0.99)',
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradient}
                        >
                            <View style={styles.header}>
                                <View style={styles.iconWrap}>
                                    <Ionicons
                                        name="heart"
                                        size={22}
                                        color="rgba(232, 201, 140, 0.95)"
                                    />
                                </View>
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.title}
                                >
                                    {DAY_EMBODIMENT_GATE_COPY.title}
                                </AppText>
                            </View>

                            {remaining.map((kind) => (
                                <AppText
                                    key={kind}
                                    font="cormorant-italic"
                                    style={styles.remaining}
                                >
                                    {labelForDayAudioKind(kind)}
                                </AppText>
                            ))}

                            <AppText
                                font="cormorant-italic"
                                style={styles.why}
                            >
                                {DAY_EMBODIMENT_GATE_COPY.why}
                            </AppText>

                            <Pressable
                                onPress={handleThere}
                                style={({ pressed }) => [
                                    pressed && { opacity: 0.9 },
                                ]}
                                hitSlop={TOUCH.hitSlop}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    DAY_EMBODIMENT_GATE_COPY.cta
                                }
                            >
                                <LinearGradient
                                    colors={[
                                        'rgba(168, 201, 154, 0.38)',
                                        'rgba(232, 201, 140, 0.2)',
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaButton}
                                >
                                    <AppText
                                        font="cormorant-italic"
                                        style={styles.ctaText}
                                    >
                                        {DAY_EMBODIMENT_GATE_COPY.cta}
                                    </AppText>
                                </LinearGradient>
                            </Pressable>

                            <Pressable
                                onPress={handleOverride}
                                style={styles.overrideWrap}
                                hitSlop={TOUCH.hitSlop}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    DAY_EMBODIMENT_GATE_COPY.override
                                }
                                accessibilityHint={
                                    DAY_EMBODIMENT_GATE_COPY.overrideHint
                                }
                            >
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.overrideText}
                                >
                                    {DAY_EMBODIMENT_GATE_COPY.override}
                                </AppText>
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.overrideHint}
                                >
                                    {DAY_EMBODIMENT_GATE_COPY.overrideHint}
                                </AppText>
                            </Pressable>

                            <Pressable
                                onPress={handleStay}
                                style={styles.stayWrap}
                                hitSlop={TOUCH.hitSlop}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    DAY_EMBODIMENT_GATE_COPY.stay
                                }
                            >
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.stayText}
                                >
                                    {DAY_EMBODIMENT_GATE_COPY.stay}
                                </AppText>
                            </Pressable>
                        </LinearGradient>
                    </View>
                </View>
            ) : null}
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: MODAL_CARD_MAX_WIDTH,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.3)',
        shadowColor: 'rgba(232, 201, 140, 0.22)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 12,
    },
    gradient: {
        padding: 22,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(232, 201, 140, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    title: {
        color: 'rgba(255, 248, 236, 0.96)',
        fontSize: 22,
        letterSpacing: 0.3,
        flex: 1,
    },
    remaining: {
        color: 'rgba(255, 248, 236, 0.9)',
        fontSize: 18,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 6,
    },
    why: {
        color: 'rgba(232, 201, 140, 0.82)',
        fontSize: 17,
        lineHeight: 26,
        textAlign: 'center',
        marginTop: 14,
        marginBottom: 20,
    },
    ctaButton: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(168, 201, 154, 0.4)',
        alignItems: 'center',
        minWidth: 200,
    },
    ctaText: {
        color: 'rgba(230, 245, 220, 0.96)',
        fontSize: 17,
        letterSpacing: 0.2,
    },
    stayWrap: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 2,
    },
    stayText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16,
    },
    overrideWrap: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 10,
    },
    overrideText: {
        color: 'rgba(232, 201, 140, 0.88)',
        fontSize: 17,
        textAlign: 'center',
    },
    overrideHint: {
        color: 'rgba(232, 201, 140, 0.52)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    },
})
