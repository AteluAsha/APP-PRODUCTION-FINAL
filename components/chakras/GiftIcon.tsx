import React, { useEffect } from 'react'
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated'
import { View } from 'react-native'

const AnimatedView = Animated.createAnimatedComponent(View)

interface GiftIconProps {
    size?: number
    animated?: boolean
}

/**
 * Gift Icon - A luminous symbol for spiritual rewards
 * 
 * Features:
 * - Gift box with bow representing the reward
 * - Circular design with light and energy
 * - Gentle animation for magical presence
 */
export const GiftIcon: React.FC<GiftIconProps> = ({ 
    size = 40, 
    animated = true 
}) => {
    const glowOpacity = useSharedValue(0.4)
    const sparkleOpacity = useSharedValue(0.6)

    useEffect(() => {
        if (animated) {
            // Gentle pulsing glow
            glowOpacity.value = withRepeat(
                withTiming(0.8, { duration: 2000 }),
                -1,
                true
            )
            
            // Sparkle animation
            sparkleOpacity.value = withRepeat(
                withTiming(1, { duration: 1500 }),
                -1,
                true
            )
        }
    }, [animated, glowOpacity, sparkleOpacity])

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }))

    const animatedSparkleStyle = useAnimatedStyle(() => ({
        opacity: sparkleOpacity.value,
    }))

    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.4
    const strokeWidth = size * 0.06

    return (
        <View style={{ width: size, height: size }}>
            {/* Animated outer glow */}
            <AnimatedView 
                style={[
                    {
                        position: 'absolute',
                        width: size * 1.3,
                        height: size * 1.3,
                        left: -(size * 0.15),
                        top: -(size * 0.15),
                    },
                    animatedGlowStyle
                ]}
            >
                <Svg width={size * 1.3} height={size * 1.3} viewBox={`0 0 ${size} ${size}`}>
                    <Defs>
                        <RadialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
                            <Stop offset="50%" stopColor="#FFA500" stopOpacity="0.3" />
                            <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={radius * 1.3}
                        fill="url(#giftGlow)"
                    />
                </Svg>
            </AnimatedView>

            {/* Main gift icon */}
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    {/* Gold gradient for gift box */}
                    <SvgLinearGradient id="giftGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#FFA500" stopOpacity="0.9" />
                        <Stop offset="100%" stopColor="#FF8C00" stopOpacity="0.8" />
                    </SvgLinearGradient>

                    {/* Purple gradient for bow */}
                    <SvgLinearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#9D4EDD" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#E0B0FF" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="1" />
                    </SvgLinearGradient>
                </Defs>

                {/* Gift box - main rectangle */}
                <Path
                    d={`M ${centerX - radius * 0.4} ${centerY - radius * 0.2}
                        L ${centerX + radius * 0.4} ${centerY - radius * 0.2}
                        L ${centerX + radius * 0.4} ${centerY + radius * 0.3}
                        L ${centerX - radius * 0.4} ${centerY + radius * 0.3}
                        Z`}
                    fill="url(#giftGradient)"
                    stroke="#FFFFFF"
                    strokeWidth={strokeWidth * 0.5}
                    opacity={0.9}
                />

                {/* Bow on top */}
                <G>
                    {/* Bow center */}
                    <Circle
                        cx={centerX}
                        cy={centerY - radius * 0.2}
                        r={radius * 0.15}
                        fill="url(#bowGradient)"
                    />
                    {/* Left bow loop */}
                    <Path
                        d={`M ${centerX - radius * 0.15} ${centerY - radius * 0.2}
                            Q ${centerX - radius * 0.3} ${centerY - radius * 0.35}
                            ${centerX - radius * 0.2} ${centerY - radius * 0.3}
                            Q ${centerX - radius * 0.1} ${centerY - radius * 0.25}
                            ${centerX - radius * 0.15} ${centerY - radius * 0.2}
                            Z`}
                        fill="url(#bowGradient)"
                    />
                    {/* Right bow loop */}
                    <Path
                        d={`M ${centerX + radius * 0.15} ${centerY - radius * 0.2}
                            Q ${centerX + radius * 0.3} ${centerY - radius * 0.35}
                            ${centerX + radius * 0.2} ${centerY - radius * 0.3}
                            Q ${centerX + radius * 0.1} ${centerY - radius * 0.25}
                            ${centerX + radius * 0.15} ${centerY - radius * 0.2}
                            Z`}
                        fill="url(#bowGradient)"
                    />
                </G>

                {/* Sparkles */}
                {[
                    { x: centerX - radius * 0.5, y: centerY - radius * 0.5 },
                    { x: centerX + radius * 0.5, y: centerY - radius * 0.4 },
                    { x: centerX - radius * 0.3, y: centerY + radius * 0.4 },
                    { x: centerX + radius * 0.4, y: centerY + radius * 0.3 },
                ].map((point, index) => (
                    <G key={index} opacity={animated ? 0.6 : 0.8}>
                        <Path
                            d={`M ${point.x} ${point.y}
                                L ${point.x + strokeWidth * 2} ${point.y}
                                M ${point.x + strokeWidth} ${point.y - strokeWidth}
                                L ${point.x + strokeWidth} ${point.y + strokeWidth}`}
                            stroke="#FFD700"
                            strokeWidth={strokeWidth * 0.8}
                            strokeLinecap="round"
                        />
                    </G>
                ))}
            </Svg>
        </View>
    )
}

