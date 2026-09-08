import React from 'react'
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import {
    ASHA_SPEAKS_KICKER,
    ASHA_SPEAKS_SUBLINE,
    ASHA_SPEAKS_TITLE,
} from '@/constants/chakras/ancestralBridgeContent'
import { getMinutesString } from '@/utils/format'
import { TOUCH } from '@/constants/layout'

export function AshaSpeaksButton({
    durationMs,
    onPress,
}: {
    durationMs: number
    onPress: () => void
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={TOUCH.activeOpacity}
            hitSlop={TOUCH.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={`${ASHA_SPEAKS_TITLE}, ${ASHA_SPEAKS_SUBLINE}`}
            style={[
                styles.frame,
                Platform.OS === 'android' ? { elevation: 8 } : styles.iosShadow,
            ]}
        >
            <LinearGradient
                colors={[
                    'rgba(28, 22, 12, 0.98)',
                    'rgba(10, 8, 6, 0.99)',
                    'rgba(16, 12, 8, 0.98)',
                ]}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={[
                    'transparent',
                    'rgba(232, 201, 140, 0.18)',
                    'transparent',
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.goldSheen}
                pointerEvents="none"
            />
            <View style={styles.diamond} pointerEvents="none" />
            <AppText font="cormorant-regular" style={styles.kicker}>
                {ASHA_SPEAKS_KICKER}
            </AppText>
            <AppText font="cormorant-italic" style={styles.title}>
                {ASHA_SPEAKS_TITLE}
            </AppText>
            <View style={styles.goldLine} />
            <AppText font="cormorant-italic" style={styles.sub}>
                {ASHA_SPEAKS_SUBLINE}
            </AppText>
            <AppText font="cormorant-regular" style={styles.duration}>
                {getMinutesString(durationMs)}
            </AppText>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    frame: {
        width: '100%',
        overflow: 'hidden',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.55)',
        paddingVertical: 26,
        paddingHorizontal: 18,
        alignItems: 'center',
        marginBottom: 28,
    },
    iosShadow: {
        shadowColor: '#E8C98C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
    },
    goldSheen: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '38%',
        height: 56,
    },
    diamond: {
        width: 10,
        height: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.85)',
        transform: [{ rotate: '45deg' }],
    },
    kicker: {
        marginBottom: 10,
        fontSize: 11,
        letterSpacing: 3.4,
        textTransform: 'uppercase',
        color: 'rgba(232, 201, 140, 0.78)',
    },
    title: {
        textAlign: 'center',
        fontSize: 26,
        lineHeight: 32,
        color: '#F3D59A',
        textShadowColor: 'rgba(232, 201, 140, 0.45)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
        paddingHorizontal: 4,
    },
    goldLine: {
        width: 72,
        height: StyleSheet.hairlineWidth,
        marginVertical: 12,
        backgroundColor: 'rgba(232, 201, 140, 0.7)',
    },
    sub: {
        textAlign: 'center',
        fontSize: 18,
        lineHeight: 24,
        color: 'rgba(255, 248, 236, 0.92)',
    },
    duration: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 12,
        letterSpacing: 1.6,
        color: 'rgba(232, 201, 140, 0.8)',
    },
})
