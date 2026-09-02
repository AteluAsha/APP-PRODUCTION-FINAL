import React, { useEffect } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { useHealingToastStore } from '@/hooks/useHealingToastStore'

/** Root-level gentle toast — sage glass pill, auto-dismiss. */
export function HealingToastHost() {
    const insets = useSafeAreaInsets()
    const message = useHealingToastStore((s) => s.message)
    const visible = useHealingToastStore((s) => s.visible)
    const opacity = useSharedValue(0)
    const translateY = useSharedValue(12)

    useEffect(() => {
        if (visible && message) {
            opacity.value = withTiming(1, {
                duration: 220,
                easing: Easing.out(Easing.ease),
            })
            translateY.value = withTiming(0, {
                duration: 260,
                easing: Easing.out(Easing.cubic),
            })
        } else {
            opacity.value = withTiming(0, { duration: 180 })
            translateY.value = withTiming(8, { duration: 180 })
        }
    }, [visible, message, opacity, translateY])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    if (!message) return null

    return (
        <View
            pointerEvents="none"
            style={[
                StyleSheet.absoluteFill,
                { zIndex: 9999, elevation: 9999 },
            ]}
        >
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: 20,
                        right: 20,
                        bottom: Math.max(insets.bottom, 16) + 72,
                        alignItems: 'center',
                    },
                    animatedStyle,
                ]}
            >
                <LinearGradient
                    colors={[
                        'rgba(122, 154, 114, 0.92)',
                        'rgba(88, 118, 82, 0.94)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: 22,
                        paddingVertical: Platform.OS === 'android' ? 14 : 13,
                        paddingHorizontal: 20,
                        maxWidth: 420,
                        borderWidth: 1,
                        borderTopColor: 'rgba(255,255,255,0.22)',
                        borderBottomColor: 'rgba(0,0,0,0.28)',
                        borderLeftColor: 'rgba(255,255,255,0.12)',
                        borderRightColor: 'rgba(0,0,0,0.18)',
                        ...Platform.select({
                            ios: {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 12,
                            },
                            android: { elevation: 8 },
                        }),
                    }}
                >
                    <AppText
                        font="cormorant-italic"
                        style={{
                            color: 'rgba(255, 248, 236, 0.96)',
                            textAlign: 'center',
                            fontSize: 16,
                            lineHeight: 22,
                        }}
                    >
                        {message}
                    </AppText>
                </LinearGradient>
            </Animated.View>
        </View>
    )
}
