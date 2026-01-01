/**
 * Tree of Life Icon Component
 * A geometric tree of life symbol in gold or white
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

interface TreeOfLifeIconProps {
    size?: number
    color?: string
}

export const TreeOfLifeIcon: React.FC<TreeOfLifeIconProps> = ({
    size = 40,
    color = '#FFD700', // Gold
}) => {
    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox="0 0 40 40">
                {/* Tree trunk */}
                <Path
                    d="M 20 35 L 20 25"
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                />
                {/* Lower branches */}
                <Path
                    d="M 20 28 L 12 30 M 20 28 L 28 30"
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                />
                {/* Middle branches */}
                <Path
                    d="M 20 22 L 10 20 M 20 22 L 30 20"
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                />
                {/* Upper branches */}
                <Path
                    d="M 20 18 L 14 12 M 20 18 L 26 12"
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                />
                {/* Top circle (crown chakra) */}
                <Circle
                    cx="20"
                    cy="10"
                    r="3"
                    fill={color}
                />
                {/* Side circles (energy nodes) */}
                <Circle
                    cx="12"
                    cy="20"
                    r="2"
                    fill={color}
                />
                <Circle
                    cx="28"
                    cy="20"
                    r="2"
                    fill={color}
                />
                <Circle
                    cx="10"
                    cy="30"
                    r="2"
                    fill={color}
                />
                <Circle
                    cx="30"
                    cy="30"
                    r="2"
                    fill={color}
                />
            </Svg>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})

