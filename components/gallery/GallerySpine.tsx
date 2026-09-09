/**
 * Seven-chamber spine at the base of the Gallery. Lit orbs are walked days.
 */

import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { SoftChakraBall } from '@/components/chakras/SoftChakraBall'
import { getChakraColor, getChakraImage } from '@/constants/chakras/chakraConstants'
import { CHAKRA_ORDER, CHAKRA_TO_DAY } from '@/utils/chakraMapping'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { TOUCH } from '@/constants/layout'

export function GallerySpine({
    currentIndex,
    isUnlocked,
    onSelect,
}: {
    currentIndex: number
    isUnlocked: (day: number) => boolean
    onSelect: (index: number) => void
}) {
    return (
        <View style={styles.row} pointerEvents="box-none">
            {CHAKRA_ORDER.map((chakra, index) => {
                const day = CHAKRA_TO_DAY[chakra]
                const unlocked = isUnlocked(day)
                const active = index === currentIndex
                const size = active ? 30 : 24
                return (
                    <Pressable
                        key={chakra}
                        onPress={() => {
                            addHapticFeedback(HapticStrength.Light)
                            onSelect(index)
                        }}
                        hitSlop={TOUCH.hitSlop}
                        accessibilityRole="button"
                        accessibilityLabel={`${chakra} chamber`}
                        style={[
                            styles.orb,
                            active && {
                                borderColor: 'rgba(232, 201, 140, 0.7)',
                            },
                        ]}
                    >
                        <SoftChakraBall
                            source={getChakraImage(day)}
                            size={size}
                            opacity={unlocked ? 1 : 0.28}
                            glowColor={
                                unlocked
                                    ? `${getChakraColor(day)}44`
                                    : undefined
                            }
                        />
                    </Pressable>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
    },
    orb: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
})
