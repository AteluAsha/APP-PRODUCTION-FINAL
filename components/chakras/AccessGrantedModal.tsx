/**
 * Access Granted Modal
 * 
 * Celebration modal shown after successful payment or scholarship grant.
 * Welcomes user to their full sacred space and offers navigation to ChakraHub.
 */

import React from 'react'
import { View, Modal, Pressable, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from 'react-native-reanimated'

interface AccessGrantedModalProps {
    visible: boolean
    onClose: () => void
    onGoToHub: () => void
    onContinueJourney: () => void
}

export const AccessGrantedModal: React.FC<AccessGrantedModalProps> = ({
    visible,
    onClose,
    onGoToHub,
    onContinueJourney,
}) => {
    const scale = useSharedValue(1)
    const opacity = useSharedValue(0)
    
    React.useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 500 })
            scale.value = withRepeat(
                withTiming(1.05, {
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        } else {
            opacity.value = withTiming(0, { duration: 300 })
            scale.value = 1
        }
    }, [visible, opacity, scale])
    
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }))
    
    if (!visible) return null
    
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/90">
                <Animated.View
                    style={animatedStyle}
                    className="w-[90%] max-w-md"
                >
                    <LinearGradient
                        colors={['rgba(157, 78, 221, 0.95)', 'rgba(123, 44, 191, 0.9)', 'rgba(106, 27, 154, 0.85)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 24,
                            padding: 32,
                            borderWidth: 2,
                            borderColor: '#FFD700',
                            alignItems: 'center',
                        }}
                    >
                        {/* Close Button */}
                        <Pressable
                            onPress={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                        >
                            <Ionicons name="close" size={20} color="#FFFFFF" />
                        </Pressable>
                        
                        {/* Celebration Icon */}
                        <View className="mb-6">
                            <Image
                                source={require('@/assets/images/7chakras.png')}
                                className="w-24 h-24"
                                resizeMode="contain"
                            />
                        </View>
                        
                        {/* Title */}
                        <AppText font="instrument-bold" size="2xl" className="text-center mb-3 text-white">
                            Your Sacred Space is Open
                        </AppText>
                        
                        {/* Message */}
                        <AppText font="instrument-regular" size="base" className="text-center mb-6 text-white/90 leading-6">
                            All paths are now open to you. Your journey continues with unlimited access to all teachings, meditations, and sacred spaces.
                        </AppText>
                        
                        {/* Buttons */}
                        <View className="w-full gap-3">
                            {/* Go to Hub Button */}
                            <Pressable
                                onPress={() => {
                                    onGoToHub()
                                    onClose()
                                }}
                                className="active:opacity-80"
                            >
                                <LinearGradient
                                    colors={['#FFD700', '#FFA500']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        borderRadius: 16,
                                        padding: 16,
                                        alignItems: 'center',
                                    }}
                                >
                                    <AppText font="instrument-bold" size="lg" className="text-black">
                                        Enter Your Sacred Space
                                    </AppText>
                                </LinearGradient>
                            </Pressable>
                            
                            {/* Continue Journey Button */}
                            <Pressable
                                onPress={() => {
                                    onContinueJourney()
                                    onClose()
                                }}
                                className="active:opacity-80"
                            >
                                <View
                                    style={{
                                        borderRadius: 16,
                                        padding: 16,
                                        borderWidth: 2,
                                        borderColor: '#FFFFFF',
                                        alignItems: 'center',
                                    }}
                                >
                                    <AppText font="instrument-medium" size="base" className="text-white">
                                        Continue Weekly Journey
                                    </AppText>
                                </View>
                            </Pressable>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    )
}

