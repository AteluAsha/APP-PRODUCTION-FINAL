import React, { useEffect, useCallback } from 'react'
import { View, Modal, Pressable, Dimensions, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    Easing,
} from 'react-native-reanimated'
import { AppText } from '@/components/AppText'
import { ChakraCard } from '@/components/chakras/GalleryOfGnosis/ChakraCard'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import { ActionBar } from '@/components/ActionBar'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ChakraCardRevealModalProps {
    visible: boolean
    chakra: Chakra
    onClose: () => void
}

/**
 * Chakra Card Reveal Modal
 * 
 * Reveals the chakra card reward when user opens their gift
 * Shows a beautiful animation and then displays the card
 */
export const ChakraCardRevealModal: React.FC<ChakraCardRevealModalProps> = ({
    visible,
    chakra,
    onClose,
}) => {
    const router = useRouter()
    const content = chakraContent[chakra]
    
    const scale = useSharedValue(0)
    const opacity = useSharedValue(0)
    const cardOpacity = useSharedValue(0)
    const cardScale = useSharedValue(0.8)

    useEffect(() => {
        if (visible) {
            // Reset animations
            scale.value = 0
            opacity.value = 0
            cardOpacity.value = 0
            cardScale.value = 0.8

            // Animate gift opening
            scale.value = withSequence(
                withTiming(1.2, { duration: 300, easing: Easing.out(Easing.exp) }),
                withSpring(1, { damping: 10, stiffness: 100 })
            )
            opacity.value = withTiming(1, { duration: 300 })

            // Reveal card after a delay - cleanup timeout on unmount
            const timeoutId = setTimeout(() => {
                cardOpacity.value = withTiming(1, { duration: 500 })
                cardScale.value = withSpring(1, { damping: 8, stiffness: 100 })
            }, 600)

            return () => {
                clearTimeout(timeoutId)
            }
        } else {
            scale.value = 0
            opacity.value = 0
            cardOpacity.value = 0
            cardScale.value = 0.8
        }
    }, [visible, scale, opacity, cardOpacity, cardScale])

    const giftStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ scale: cardScale.value }],
    }))

    const handleViewInGallery = useCallback(() => {
        onClose()
        // Small delay for smooth modal transition
        setTimeout(() => {
            router.push('/(chakras)/GalleryOfGnosis')
        }, 300)
    }, [onClose, router])

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <View className="flex-1 bg-black/95">
                    <ActionBar useXButton={true} onXPress={onClose} />
                    
                    <View className="flex-1 items-center justify-center px-4 py-8">
                        {/* Gift opening animation - positioned at top */}
                        <Animated.View style={[giftStyle, { position: 'absolute', top: 60, zIndex: 1 }]}>
                            <View className="items-center">
                                <AppText font="instrument-bold" size="2xl" className="text-white mb-2 text-center">
                                    Your Gift Awaits
                                </AppText>
                                <AppText font="instrument-regular" size="lg" className="text-white/80 text-center">
                                    You've unlocked a Chakra Card!
                                </AppText>
                            </View>
                        </Animated.View>

                        {/* Card reveal - positioned below title */}
                        <Animated.View style={[cardStyle, { width: '100%', maxWidth: 400, marginTop: 80 }]}>
                            <View className="w-full items-center justify-center">
                                <ChakraCard chakra={chakra} content={content} isActive={true} />
                            </View>
                        </Animated.View>
                        
                        {/* Action buttons - positioned at bottom */}
                        <View className="flex-row gap-4 mt-6 w-full justify-center" style={{ position: 'absolute', bottom: 40 }}>
                            <Pressable
                                onPress={onClose}
                                className="px-6 py-3 border border-white/30 rounded-full"
                            >
                                <AppText font="instrument-regular" size="base" className="text-white">
                                    Close
                                </AppText>
                            </Pressable>
                            <Pressable
                                onPress={handleViewInGallery}
                                className="px-6 py-3 bg-[#9D4EDD] rounded-full"
                            >
                                <AppText font="instrument-medium" size="base" className="text-white">
                                    View in Gallery
                                </AppText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

