/**
 * Body Healing — day's yoga studio.
 * Dark sanctuary page: cream pose oval keeps the line art readable,
 * gold type matches the rest of the app.
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
            <StatusBar style="light" />
            <LinearGradient
                colors={['#14110E', '#0C0A08', '#080605']}
                locations={[0, 0.45, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={[
                    'rgba(232, 201, 140, 0.08)',
                    'rgba(0,0,0,0)',
                    'rgba(0,0,0,0.35)',
                ]}
                locations={[0, 0.28, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
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
                    iconColor="rgba(255, 248, 236, 0.92)"
                />
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#0C0A08',
    },
})

export default IntegrationPractice
