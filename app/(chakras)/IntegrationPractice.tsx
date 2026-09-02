/**
 * Body Healing — day's yoga studio.
 * Light linen page: pose, outline, and the blessing to carry into the day.
 */
import React, { useEffect } from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActionBar } from '@/components/ActionBar'
import YogaSection from '@/components/chakras/YogaSection'
import { Chakra } from '@/types/chakras/Chakra'
import { isValidChakra } from '@/utils/validation'
import {
    FLOATING_NAV_SCROLL_BOTTOM_PADDING,
    SCROLL_BREATHING_BOTTOM_PADDING,
    SCROLL_ANDROID_SMOOTH_PROPS,
} from '@/constants/layout'

const IntegrationPractice = () => {
    const searchParams = useLocalSearchParams()
    const chakraParam = searchParams.chakra as string | undefined
    const router = useRouter()

    const chakra = isValidChakra(chakraParam) ? chakraParam : Chakra.ROOT

    useEffect(() => {
        if (!isValidChakra(chakraParam)) {
            router.replace('/(chakras)/ChakraHub')
        }
    }, [chakraParam, router])

    if (!isValidChakra(chakraParam)) return null

    return (
        <View style={styles.safe}>
            <StatusBar style="dark" />
            <LinearGradient
                colors={['#FBF7F2', '#F3E8DC', '#E8D9C8', '#DFD0BE']}
                locations={[0, 0.35, 0.72, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={[
                    'rgba(255,255,255,0.55)',
                    'rgba(255,255,255,0)',
                    'rgba(0,0,0,0)',
                    'rgba(92, 72, 58, 0.08)',
                ]}
                locations={[0, 0.22, 0.65, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            <View style={styles.warmGlow} pointerEvents="none" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    {...(Platform.OS === 'android' && SCROLL_ANDROID_SMOOTH_PROPS)}
                    contentContainerStyle={{
                        paddingTop: 36,
                        paddingBottom:
                            FLOATING_NAV_SCROLL_BOTTOM_PADDING +
                            SCROLL_BREATHING_BOTTOM_PADDING +
                            24,
                    }}
                >
                    <YogaSection chakra={chakra} />
                </ScrollView>
                <ActionBar
                    useXButton={true}
                    xButtonPosition="left"
                    iconColor="rgba(58, 44, 36, 0.92)"
                />
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F4EDE4',
    },
    warmGlow: {
        position: 'absolute',
        top: '18%',
        left: '10%',
        right: '10%',
        height: '42%',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 248, 240, 0.45)',
        opacity: 0.9,
    },
})

export default IntegrationPractice
