/**
 * Chakra orb on a field / photo. The PNGs are square with opaque black
 * corners; clip to a circle so the box never shows. Optional circular
 * glow sits behind so the edge dissolves into the background.
 */

import { Image, type ImageSourcePropType, View, type ViewStyle } from 'react-native'

export function SoftChakraBall({
    source,
    size,
    style,
    opacity = 1,
    glowColor,
    onLoad,
}: {
    source: ImageSourcePropType
    size: number
    style?: ViewStyle
    opacity?: number
    glowColor?: string
    onLoad?: () => void
}) {
    const radius = size / 2
    const glowSize = size * 1.2

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                style,
            ]}
            pointerEvents="none"
        >
            {glowColor ? (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        width: glowSize,
                        height: glowSize,
                        borderRadius: glowSize / 2,
                        backgroundColor: glowColor,
                    }}
                />
            ) : null}
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    overflow: 'hidden',
                }}
            >
                <Image
                    source={source}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: radius,
                        opacity,
                    }}
                    resizeMode="contain"
                    onLoad={onLoad}
                />
            </View>
        </View>
    )
}
