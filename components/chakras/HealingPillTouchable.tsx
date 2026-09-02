/**
 * Part II / Sound Bath pill buttons.
 *
 * Pressable wrapping LinearGradient drops taps on Android (same class of bug as
 * DateConfirmationModal). TouchableOpacity owns the press; gradient is decorative.
 */
import React from 'react'
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    type ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { TOUCH } from '@/constants/layout'

export type HealingPillAccent = {
    pillTop: string
    pillBottom: string
    pillLeft: string
    pillColors: readonly [string, string, string]
}

export function HealingPillTouchable({
    accent,
    onPress,
    disabled = false,
    accessibilityLabel,
    children,
    contentStyle,
}: {
    accent: HealingPillAccent
    onPress: () => void
    disabled?: boolean
    accessibilityLabel: string
    children: React.ReactNode
    contentStyle?: ViewStyle
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={TOUCH.activeOpacity}
            hitSlop={TOUCH.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <View
                style={[
                    styles.shell,
                    {
                        borderTopColor: accent.pillTop,
                        borderBottomColor: accent.pillBottom,
                        borderLeftColor: accent.pillLeft,
                    },
                    contentStyle,
                ]}
            >
                <LinearGradient
                    colors={[...accent.pillColors]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                />
                {children}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    shell: {
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.22)',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.28,
                shadowRadius: 8,
            },
            android: { elevation: 4 },
        }),
    },
})
