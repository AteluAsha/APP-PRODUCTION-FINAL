/**
 * Loading Spinner Component
 *
 * A beautiful spinning logo that displays during loading states.
 * Uses the 7 chakras logo and rotates slowly for a meditative effect.
 */

import React from 'react'
import { View, Image } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated'

interface LoadingSpinnerProps {
    size?: number
    className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 100,
    className = '',
}) => {
    const rotation = useSharedValue(0)

    React.useEffect(() => {
        // Very slow, meditative rotation (one full rotation every 8 seconds)
        // This creates a gentle, spiritual feeling perfect for a meditation app
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 8000, // 8 seconds for one full rotation
                easing: Easing.linear,
            }),
            -1, // Infinite repeat
            false, // Don't reverse
        )
    }, [rotation])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        }
    })

    return (
        <View className={`items-center justify-center ${className}`}>
            <Animated.View style={animatedStyle}>
                <Image
                    source={require('@/assets/images/7chakras.png')}
                    style={{ width: size, height: size }}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    )
}

