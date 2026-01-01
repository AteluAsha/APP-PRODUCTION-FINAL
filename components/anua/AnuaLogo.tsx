import React, { useEffect } from 'react'
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated'
import { View } from 'react-native'

const AnimatedView = Animated.createAnimatedComponent(View)

interface AnuaLogoProps {
    size?: number
    color?: string
    animated?: boolean
}

/**
 * Anua Logo - A luminous symbol of safety, peace, and light
 * 
 * Features:
 * - Central "A" shape representing Anua's wisdom and guidance
 * - Circular design symbolizing wholeness and protection
 * - Soft glows and gradients for light and energy
 * - Gentle animation for peaceful presence
 */
export const AnuaLogo: React.FC<AnuaLogoProps> = ({ 
    size = 24, 
    color = '#FFFFFF',
    animated = true 
}) => {
    const glowOpacity = useSharedValue(0.3)

    useEffect(() => {
        if (animated) {
            // Gentle pulsing glow - creates a peaceful breathing effect
            glowOpacity.value = withRepeat(
                withTiming(0.6, { duration: 2000 }),
                -1,
                true
            )
        }
    }, [animated, glowOpacity])

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }))

    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.4
    const strokeWidth = size * 0.08

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
                        <RadialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                            <Stop offset="50%" stopColor="#E0B0FF" stopOpacity="0.2" />
                            <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={radius * 1.3}
                        fill="url(#outerGlow)"
                    />
                </Svg>
            </AnimatedView>

            {/* Main logo */}
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    {/* Radial gradient for the inner light */}
                    <RadialGradient id="innerLight" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                        <Stop offset="50%" stopColor="#FFA500" stopOpacity="0.4" />
                        <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.2" />
                    </RadialGradient>

                    {/* Linear gradient for the "A" shape */}
                    <SvgLinearGradient id="aGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#E0B0FF" stopOpacity="0.9" />
                        <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.8" />
                    </SvgLinearGradient>

                    {/* Gold gradient for energy lines */}
                    <SvgLinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
                        <Stop offset="50%" stopColor="#FFA500" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#FFD700" stopOpacity="0.9" />
                    </SvgLinearGradient>
                </Defs>

                {/* Main circle with soft border */}
                <Circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke="url(#innerLight)"
                    strokeWidth={strokeWidth * 0.5}
                    opacity={0.6}
                />

                {/* Inner protective circle */}
                <Circle
                    cx={centerX}
                    cy={centerY}
                    r={radius * 0.95}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={strokeWidth * 0.3}
                    opacity={0.3}
                />

                {/* Energy arcs (upper half) - representing protection and guidance */}
                <Path
                    d={`M ${centerX - radius * 0.7} ${centerY - radius * 0.2} 
                        A ${radius * 0.7} ${radius * 0.7} 0 0 1 ${centerX + radius * 0.7} ${centerY - radius * 0.2}`}
                    fill="none"
                    stroke="#E0B0FF"
                    strokeWidth={strokeWidth * 0.4}
                    opacity={0.5}
                />
                <Path
                    d={`M ${centerX - radius * 0.5} ${centerY - radius * 0.35} 
                        A ${radius * 0.5} ${radius * 0.5} 0 0 1 ${centerX + radius * 0.5} ${centerY - radius * 0.35}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={strokeWidth * 0.3}
                    opacity={0.4}
                />

                {/* Central "A" shape - Anua's symbol of wisdom */}
                <G>
                    {/* Left side of A */}
                    <Path
                        d={`M ${centerX - radius * 0.25} ${centerY + radius * 0.4} 
                            L ${centerX} ${centerY - radius * 0.35}
                            L ${centerX} ${centerY - radius * 0.2}`}
                        fill="none"
                        stroke="url(#aGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Right side of A */}
                    <Path
                        d={`M ${centerX + radius * 0.25} ${centerY + radius * 0.4} 
                            L ${centerX} ${centerY - radius * 0.35}
                            L ${centerX} ${centerY - radius * 0.2}`}
                        fill="none"
                        stroke="url(#aGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Crossbar of A */}
                    <Path
                        d={`M ${centerX - radius * 0.15} ${centerY + radius * 0.05} 
                            L ${centerX + radius * 0.15} ${centerY + radius * 0.05}`}
                        fill="none"
                        stroke="url(#aGradient)"
                        strokeWidth={strokeWidth * 0.8}
                        strokeLinecap="round"
                    />
                </G>

                {/* Energy lines (lower half) - representing light and peace */}
                {[0, 1, 2].map((index) => {
                    const yOffset = centerY + radius * 0.2 + (index * radius * 0.15)
                    const lineLength = radius * 0.6
                    return (
                        <Path
                            key={index}
                            d={`M ${centerX - lineLength} ${yOffset} 
                                L ${centerX + lineLength} ${yOffset}`}
                            fill="none"
                            stroke="url(#goldGradient)"
                            strokeWidth={strokeWidth * 0.5}
                            strokeLinecap="round"
                            opacity={0.7 - index * 0.1}
                        />
                    )
                })}

                {/* Inner light point - the heart of Anua */}
                <Circle
                    cx={centerX}
                    cy={centerY - radius * 0.1}
                    r={strokeWidth * 0.5}
                    fill="#FFD700"
                    opacity={0.9}
                />
            </Svg>
        </View>
    )
}
