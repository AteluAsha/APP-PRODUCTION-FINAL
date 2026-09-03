/**
 * Quiet store-update card. Only shown when Play/App Store still has a newer
 * binary than this install (auto-update did not land).
 *
 * Android transparent Modal: keep mounted and gate children on `visible`
 * so the native layer can release touches.
 */
import React from 'react'
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { MODAL_CARD_MAX_WIDTH } from '@/constants/layout'
import { STORE_UPDATE_NOTICE_COPY } from '@/constants/storeUpdateNotice'

interface FreshOfferingModalProps {
    visible: boolean
    onReceive: () => void
    onNotNow: () => void
}

export function FreshOfferingModal({
    visible,
    onReceive,
    onNotNow,
}: FreshOfferingModalProps) {
    const handleReceive = () => {
        addHapticFeedback(HapticStrength.Medium)
        onReceive()
    }

    const handleNotNow = () => {
        addHapticFeedback(HapticStrength.Light)
        onNotNow()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleNotNow}
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
                        onPress={handleNotNow}
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
                                'rgba(24, 28, 32, 0.99)',
                                'rgba(18, 24, 28, 0.99)',
                                'rgba(16, 26, 30, 0.99)',
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
                                        color="rgba(201, 169, 98, 0.92)"
                                    />
                                </View>
                                <AppText
                                    font="cormorant-italic"
                                    size="xl"
                                    style={styles.title}
                                >
                                    {STORE_UPDATE_NOTICE_COPY.title}
                                </AppText>
                            </View>

                            <AppText
                                font="cormorant-italic"
                                size="sm"
                                style={styles.body}
                            >
                                {STORE_UPDATE_NOTICE_COPY.body}
                            </AppText>

                            <Pressable
                                onPress={handleReceive}
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
                                    STORE_UPDATE_NOTICE_COPY.receive
                                }
                            >
                                <LinearGradient
                                    colors={[
                                        'rgba(201, 169, 98, 0.32)',
                                        'rgba(135, 174, 115, 0.22)',
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.receiveButton}
                                >
                                    <AppText
                                        font="instrument-semibold"
                                        size="sm"
                                        style={styles.receiveButtonText}
                                    >
                                        {STORE_UPDATE_NOTICE_COPY.receive}
                                    </AppText>
                                </LinearGradient>
                            </Pressable>

                            <Pressable
                                onPress={handleNotNow}
                                style={styles.notNowWrap}
                                hitSlop={{
                                    top: 12,
                                    bottom: 12,
                                    left: 12,
                                    right: 12,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    STORE_UPDATE_NOTICE_COPY.notNow
                                }
                            >
                                <AppText
                                    font="instrument-regular"
                                    size="sm"
                                    style={styles.notNowText}
                                >
                                    {STORE_UPDATE_NOTICE_COPY.notNow}
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
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(201, 169, 98, 0.32)',
        shadowColor: 'rgba(201, 169, 98, 0.22)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    gradient: {
        padding: 20,
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
        backgroundColor: 'rgba(201, 169, 98, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    title: {
        color: '#ffffff',
        flex: 1,
    },
    body: {
        color: 'rgba(255, 255, 255, 0.82)',
        lineHeight: 22,
        marginBottom: 20,
    },
    receiveButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(201, 169, 98, 0.4)',
        alignItems: 'center',
        marginBottom: 10,
    },
    receiveButtonText: {
        color: 'rgba(232, 213, 163, 0.95)',
    },
    notNowWrap: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    notNowText: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
})
