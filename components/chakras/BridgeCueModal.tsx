/**
 * Tiny teaching cue after Master Meditation on days 1–3.
 * Android: keep Modal mounted; gate children on visible.
 */
import React from 'react'
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { MODAL_CARD_MAX_WIDTH } from '@/constants/layout'
import { BRIDGE_CUE_COPY } from '@/constants/chakras/ancestralBridgeContent'

export function BridgeCueModal({
    visible,
    onContinue,
    onDismiss,
}: {
    visible: boolean
    onContinue: () => void
    onDismiss: () => void
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
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
                        onPress={onDismiss}
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
                                'rgba(22, 18, 12, 0.99)',
                                'rgba(10, 8, 6, 0.99)',
                            ]}
                            style={styles.gradient}
                        >
                            <AppText font="cormorant-regular" style={styles.kicker}>
                                The Bridge
                            </AppText>
                            <AppText font="cormorant-italic" style={styles.title}>
                                {BRIDGE_CUE_COPY.title}
                            </AppText>
                            <View style={styles.goldLine} />
                            <AppText font="cormorant-italic" style={styles.body}>
                                {BRIDGE_CUE_COPY.body}
                            </AppText>
                            <Pressable
                                onPress={() => {
                                    addHapticFeedback(HapticStrength.Medium)
                                    onContinue()
                                }}
                                style={({ pressed }) => [
                                    styles.cta,
                                    { opacity: pressed ? 0.86 : 1 },
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={BRIDGE_CUE_COPY.continue}
                            >
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.ctaText}
                                >
                                    {BRIDGE_CUE_COPY.continue}
                                </AppText>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    addHapticFeedback(HapticStrength.Light)
                                    onDismiss()
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={BRIDGE_CUE_COPY.notNow}
                            >
                                <AppText
                                    font="cormorant-regular"
                                    style={styles.dismiss}
                                >
                                    {BRIDGE_CUE_COPY.notNow}
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
        backgroundColor: 'rgba(0,0,0,0.62)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    card: {
        width: '100%',
        maxWidth: MODAL_CARD_MAX_WIDTH,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.35)',
    },
    gradient: {
        paddingVertical: 28,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    kicker: {
        fontSize: 12,
        letterSpacing: 3.2,
        textTransform: 'uppercase',
        color: 'rgba(232, 201, 140, 0.8)',
        marginBottom: 10,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        lineHeight: 30,
        color: '#F3D59A',
    },
    goldLine: {
        width: 48,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(232, 201, 140, 0.6)',
        marginVertical: 16,
    },
    body: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(255, 248, 236, 0.88)',
        marginBottom: 22,
    },
    cta: {
        minWidth: 200,
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.55)',
        backgroundColor: 'rgba(232, 201, 140, 0.12)',
        marginBottom: 12,
    },
    ctaText: {
        textAlign: 'center',
        fontSize: 18,
        color: 'rgba(255, 248, 236, 0.96)',
    },
    dismiss: {
        textAlign: 'center',
        fontSize: 13,
        letterSpacing: 1.4,
        color: 'rgba(255, 248, 236, 0.55)',
        paddingVertical: 6,
    },
})
