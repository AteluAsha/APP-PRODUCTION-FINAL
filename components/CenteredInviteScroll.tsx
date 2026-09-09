/**
 * Centers invitation / explainer content when it fits the screen.
 *
 * Android ScrollView with flexGrow + justifyContent: 'center' shoves the
 * block to the bottom (empty space above). Measure the real body and only
 * center when it is shorter than the viewport; otherwise start at the top
 * so the card can scroll.
 */

import React, { useState, type ReactNode } from 'react'
import {
    ScrollView,
    View,
    type ScrollViewProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native'

type Props = Omit<ScrollViewProps, 'contentContainerStyle'> & {
    children: ReactNode
    contentContainerStyle?: StyleProp<ViewStyle>
}

export function CenteredInviteScroll({
    children,
    contentContainerStyle,
    onLayout,
    style,
    ...rest
}: Props) {
    const [viewportH, setViewportH] = useState(0)
    const [bodyH, setBodyH] = useState(0)
    const measured = viewportH > 0 && bodyH > 0
    const fits = !measured || bodyH <= viewportH

    return (
        <ScrollView
            {...rest}
            style={[{ flex: 1 }, style]}
            onLayout={(e) => {
                setViewportH(e.nativeEvent.layout.height)
                onLayout?.(e)
            }}
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: fits ? 'center' : 'flex-start',
            }}
            showsVerticalScrollIndicator={
                rest.showsVerticalScrollIndicator ?? false
            }
            alwaysBounceVertical={rest.alwaysBounceVertical ?? false}
            keyboardShouldPersistTaps={
                rest.keyboardShouldPersistTaps ?? 'handled'
            }
        >
            <View
                onLayout={(e) => setBodyH(e.nativeEvent.layout.height)}
                style={[{ width: '100%', alignItems: 'center' }, contentContainerStyle]}
            >
                {children}
            </View>
        </ScrollView>
    )
}
