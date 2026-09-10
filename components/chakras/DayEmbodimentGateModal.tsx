/**
 * Loving accountability: remaining course-day audio before the close.
 * Android transparent Modal: keep mounted; gate children on `visible`.
 */

import React from 'react'
import {
    Modal,
    View,
    Pressable,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { TOUCH } from '@/constants/layout'
import { DAY_EMBODIMENT_GATE_COPY } from '@/constants/dayEmbodimentCopy'
import {
    type DayAudioKind,
    labelForDayAudioKind,
} from '@/src/utils/dayAudioEmbodiment'

interface DayEmbodimentGateModalProps {
    visible: boolean
    remaining: DayAudioKind[]
    onOpenPath: (kind: DayAudioKind) => void
    onCloseInMyTiming: () => void
    onStay: () => void
}

export function DayEmbodimentGateModal({
    visible,
    remaining,
    onOpenPath,
    onCloseInMyTiming,
    onStay,
}: DayEmbodimentGateModalProps) {
    const handlePath = (kind: DayAudioKind) => {
        addHapticFeedback(HapticStrength.Medium)
        onOpenPath(kind)
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
                                'rgba(18, 16, 14, 0.98)',
                                'rgba(12, 14, 16, 0.99)',
                                'rgba(10, 12, 12, 0.99)',
                            ]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.gradient}
                        >
                            <ScrollView
                                contentContainerStyle={styles.scroll}
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                            >
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.title}
                                >
                                    {DAY_EMBODIMENT_GATE_COPY.title}
                                </AppText>
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.why}
                                >
                                    {DAY_EMBODIMENT_GATE_COPY.why}
                                </AppText>
                                <View style={styles.goldLine} />

                                <AppText
                                    font="cormorant-italic"
                                    style={styles.remainingHeading}
                                >
                                    {DAY_EMBODIMENT_GATE_COPY.remainingHeading}
                                </AppText>

                                <View style={styles.pathList}>
                                    {remaining.map((kind) => (
                                        <Pressable
                                            key={kind}
                                            onPress={() => handlePath(kind)}
                                            style={({ pressed }) => [
                                                pressed && { opacity: 0.9 },
                                            ]}
                                            hitSlop={TOUCH.hitSlop}
                                            accessibilityRole="button"
                                            accessibilityLabel={labelForDayAudioKind(
                                                kind,
                                            )}
                                        >
                                            <LinearGradient
                                                colors={[
                                                    'rgba(168, 201, 154, 0.88)',
                                                    'rgba(107, 142, 90, 0.92)',
                                                    'rgba(212, 165, 116, 0.55)',
                                                ]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.pathButton}
                                            >
                                                <AppText
                                                    font="instrument-semibold"
                                                    size="sm"
                                                    style={styles.pathLabel}
                                                >
                                                    {labelForDayAudioKind(kind)}
                                                </AppText>
                                            </LinearGradient>
                                        </Pressable>
                                    ))}
                                </View>

                                <Pressable
                                    onPress={handleOverride}
                                    style={({ pressed }) => [
                                        styles.overrideWrap,
                                        pressed && { opacity: 0.9 },
                                    ]}
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
                            </ScrollView>
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
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        maxHeight: '92%',
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: '#0c0a08',
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.32)',
    },
    gradient: {
        width: '100%',
    },
    scroll: {
        paddingVertical: 32,
        paddingHorizontal: 26,
        alignItems: 'center',
    },
    title: {
        color: 'rgba(255, 248, 236, 0.98)',
        fontSize: 26,
        lineHeight: 34,
        textAlign: 'center',
        marginBottom: 12,
        width: '100%',
    },
    why: {
        color: 'rgba(232, 201, 140, 0.9)',
        fontSize: 18,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 18,
        width: '100%',
    },
    goldLine: {
        width: 48,
        height: 1,
        backgroundColor: 'rgba(232, 201, 140, 0.55)',
        marginBottom: 22,
    },
    remainingHeading: {
        color: 'rgba(232, 201, 140, 0.92)',
        fontSize: 14,
        letterSpacing: 1.8,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 14,
        width: '100%',
    },
    pathList: {
        width: '100%',
        gap: 12,
    },
    pathButton: {
        paddingVertical: Platform.OS === 'ios' ? 16 : 15,
        paddingHorizontal: 22,
        borderRadius: 16,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    pathLabel: {
        color: '#ffffff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    overrideWrap: {
        alignItems: 'center',
        width: '100%',
        marginTop: 28,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.42)',
        backgroundColor: 'rgba(232, 201, 140, 0.08)',
    },
    overrideText: {
        color: 'rgba(255, 248, 236, 0.94)',
        fontSize: 18,
        textAlign: 'center',
    },
    overrideHint: {
        color: 'rgba(232, 201, 140, 0.72)',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 4,
    },
    stayWrap: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 18,
    },
    stayText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16,
        textAlign: 'center',
    },
})
