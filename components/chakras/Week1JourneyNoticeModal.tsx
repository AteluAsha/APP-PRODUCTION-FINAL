/**
 * Heart-minded notice after the first close of Chakras 101.
 *
 * Android transparent Modal: keep mounted and gate children on `visible`
 * so the native layer can release touches.
 */
import React from 'react'
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { MODAL_CARD_MAX_WIDTH } from '@/constants/layout'
import { WEEK1_JOURNEY_NOTICE_COPY } from '@/constants/journeyNotificationCopy'

interface Week1JourneyNoticeModalProps {
    visible: boolean
    onUnderstand: () => void
}

export function Week1JourneyNoticeModal({
    visible,
    onUnderstand,
}: Week1JourneyNoticeModalProps) {
    const handleUnderstand = () => {
        addHapticFeedback(HapticStrength.Medium)
        onUnderstand()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleUnderstand}
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
                        onPress={handleUnderstand}
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
                                'rgba(24, 22, 20, 0.99)',
                                'rgba(14, 12, 10, 0.99)',
                                'rgba(10, 14, 12, 0.99)',
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradient}
                        >
                            <View style={styles.header}>
                                <View style={styles.iconWrap}>
                                    <Ionicons
                                        name="heart-outline"
                                        size={22}
                                        color="rgba(232, 201, 140, 0.92)"
                                    />
                                </View>
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.title}
                                >
                                    {WEEK1_JOURNEY_NOTICE_COPY.title}
                                </AppText>
                            </View>

                            <AppText
                                font="cormorant-italic"
                                style={styles.body}
                            >
                                {WEEK1_JOURNEY_NOTICE_COPY.body}
                            </AppText>

                            <AppText
                                font="cormorant-italic"
                                style={styles.profileNote}
                            >
                                {WEEK1_JOURNEY_NOTICE_COPY.profileNote}
                            </AppText>

                            <Pressable
                                onPress={handleUnderstand}
                                style={({ pressed }) => [
                                    pressed && { opacity: 0.9 },
                                ]}
                                hitSlop={{
                                    top: 12,
                                    bottom: 12,
                                    left: 12,
                                    right: 12,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    WEEK1_JOURNEY_NOTICE_COPY.cta
                                }
                            >
                                <LinearGradient
                                    colors={[
                                        'rgba(168, 201, 154, 0.35)',
                                        'rgba(232, 201, 140, 0.18)',
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaButton}
                                >
                                    <AppText
                                        font="cormorant-italic"
                                        style={styles.ctaText}
                                    >
                                        {WEEK1_JOURNEY_NOTICE_COPY.cta}
                                    </AppText>
                                </LinearGradient>
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
        borderColor: 'rgba(232, 201, 140, 0.28)',
        shadowColor: 'rgba(232, 201, 140, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 12,
    },
    gradient: {
        padding: 22,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
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
    body: {
        color: 'rgba(255, 248, 236, 0.88)',
        fontSize: 17,
        lineHeight: 26,
        marginBottom: 12,
    },
    profileNote: {
        color: 'rgba(232, 201, 140, 0.78)',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    ctaButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(168, 201, 154, 0.4)',
        alignItems: 'center',
    },
    ctaText: {
        color: 'rgba(230, 245, 220, 0.96)',
        fontSize: 17,
        letterSpacing: 0.2,
    },
})
