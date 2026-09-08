import { View, Pressable, StyleSheet, BackHandler } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppText } from '../../components/AppText'
import { ActionBarAnimated } from '@/components/ActionBarAnimated'
import Animated, { useAnimatedRef } from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { chakraContent } from '@/constants/chakras/content'
import { Chakra } from '@/types/chakras/Chakra'
import FormattedText from '@/components/FormattedText'
import {
    FLOATING_NAV_SCROLL_BOTTOM_PADDING,
    SCROLL_BREATHING_BOTTOM_PADDING,
} from '@/constants/layout'
import { useAncestralWisdomAudio } from '@/hooks/useAncestralWisdomAudio'
import { useAncestralBridgeStore } from '@/hooks/useAncestralBridgeStore'
import { isValidChakra } from '@/utils/validation'
import { AncestralFieldLayer } from '@/components/chakras/AncestralFieldLayer'
import {
    getAncestralNowLanding,
    LISTEN_WITH_ASHA_LABEL,
    MASTER_KEY_LABEL,
    RECEIVE_MASTER_KEY_LABEL,
} from '@/constants/chakras/ancestralBridgeContent'
import {
    ancestralChamberPath,
    playAshaTrack,
} from '@/utils/openAshaSpeaks'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'

const HeadToHeart = () => {
    const scrollRef = useAnimatedRef<Animated.ScrollView>()
    const router = useRouter()
    const insets = useSafeAreaInsets()

    const searchParams = useLocalSearchParams()
    const rawChakra = searchParams.chakra
    const chakraParam = Array.isArray(rawChakra) ? rawChakra[0] : rawChakra
    const hasChakraQuery =
        typeof chakraParam === 'string' && chakraParam.trim().length > 0

    useEffect(() => {
        if (hasChakraQuery && !isValidChakra(chakraParam)) {
            router.replace('/(chakras)/ChakraHub')
        }
    }, [chakraParam, hasChakraQuery, router])

    const chakra = isValidChakra(chakraParam) ? chakraParam : Chakra.ROOT
    const content = chakraContent[chakra].headtoheart
    const nowLanding = getAncestralNowLanding(chakra)
    useAncestralWisdomAudio(chakra)

    const [phase, setPhase] = useState<'law' | 'key'>('law')

    useFocusEffect(
        useCallback(() => {
            const waiting =
                useAncestralBridgeStore.getState().awaitingMasterKey === chakra
            setPhase(waiting ? 'key' : 'law')
        }, [chakra]),
    )

    const handleBack = useCallback(() => {
        if (phase === 'key') {
            useAncestralBridgeStore.getState().markMasterKeyReceived(chakra)
        } else {
            useAncestralBridgeStore.getState().clearAwaitingMasterKey()
        }
        if (router.canGoBack()) router.back()
        else router.replace('/(chakras)/ChakraHub')
    }, [phase, chakra, router])

    useFocusEffect(
        useCallback(() => {
            const sub = BackHandler.addEventListener('hardwareBackPress', () => {
                handleBack()
                return true
            })
            return () => sub.remove()
        }, [handleBack]),
    )

    const handleListen = () => {
        addHapticFeedback(HapticStrength.Medium)
        const store = useAncestralBridgeStore.getState()
        store.markAshaPlayerOpened(chakra)
        store.markAwaitingMasterKey(chakra)
        void playAshaTrack(chakra, ancestralChamberPath(chakra))
    }

    const handleReceive = () => {
        addHapticFeedback(HapticStrength.Medium)
        useAncestralBridgeStore.getState().markMasterKeyReceived(chakra)
        if (router.canGoBack()) router.back()
        else router.replace('/(chakras)/ChakraHub')
    }

    if (hasChakraQuery && !isValidChakra(chakraParam)) return null

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#050403' }} edges={['top', 'left', 'right']}>
            <AncestralFieldLayer />
            <ActionBarAnimated
                scrollViewRef={scrollRef}
                onBackPress={handleBack}
            />
            <Animated.ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 28,
                    paddingTop: 72,
                    paddingBottom:
                        FLOATING_NAV_SCROLL_BOTTOM_PADDING +
                        SCROLL_BREATHING_BOTTOM_PADDING +
                        insets.bottom,
                }}
            >
                {phase === 'law' ? (
                    <View>
                        <AppText font="cormorant-regular" style={styles.kicker}>
                            The Bridge
                        </AppText>
                        <AppText font="cormorant-italic" style={styles.title}>
                            {content.title}
                        </AppText>
                        <AppText font="cormorant-italic" style={styles.subtitle}>
                            {content.subtitle}
                        </AppText>
                        <View style={styles.goldLine} />
                        <FormattedText
                            font="cormorant-regular"
                            size="base"
                            segments={content.description}
                            textStyle={styles.body}
                        />
                        <Pressable
                            onPress={handleListen}
                            style={({ pressed }) => [
                                styles.cta,
                                { opacity: pressed ? 0.86 : 1 },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={LISTEN_WITH_ASHA_LABEL}
                        >
                            <AppText font="cormorant-italic" style={styles.ctaText}>
                                {LISTEN_WITH_ASHA_LABEL}
                            </AppText>
                            <AppText font="cormorant-regular" style={styles.ctaSub}>
                                {content.audio.title}
                            </AppText>
                        </Pressable>
                    </View>
                ) : (
                    <View>
                        <AppText font="cormorant-regular" style={styles.kicker}>
                            {MASTER_KEY_LABEL}
                        </AppText>
                        <AppText font="cormorant-italic" style={styles.keyHero}>
                            {content.masterKey.text}
                        </AppText>
                        <View style={styles.goldLine} />
                        <AppText font="cormorant-italic" style={styles.nowTitle}>
                            {nowLanding.title}
                        </AppText>
                        <AppText font="cormorant-regular" style={styles.nowSub}>
                            {nowLanding.subline}
                        </AppText>
                        {nowLanding.intention ? (
                            <AppText font="cormorant-italic" style={styles.nowLine}>
                                {nowLanding.intention}
                            </AppText>
                        ) : null}
                        {nowLanding.action ? (
                            <AppText font="cormorant-regular" style={styles.nowLine}>
                                {nowLanding.action}
                            </AppText>
                        ) : null}
                        {nowLanding.reality ? (
                            <AppText font="cormorant-italic" style={styles.nowLine}>
                                {nowLanding.reality}
                            </AppText>
                        ) : null}
                        <Pressable
                            onPress={handleReceive}
                            style={({ pressed }) => [
                                styles.cta,
                                { opacity: pressed ? 0.86 : 1 },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={RECEIVE_MASTER_KEY_LABEL}
                        >
                            <AppText font="cormorant-italic" style={styles.ctaText}>
                                {RECEIVE_MASTER_KEY_LABEL}
                            </AppText>
                        </Pressable>
                    </View>
                )}
            </Animated.ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    kicker: {
        textAlign: 'center',
        fontSize: 13,
        letterSpacing: 3.2,
        textTransform: 'uppercase',
        color: 'rgba(232, 201, 140, 0.82)',
        marginBottom: 18,
    },
    title: {
        textAlign: 'center',
        fontSize: 28,
        lineHeight: 34,
        color: 'rgba(255, 248, 236, 0.96)',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 22,
        lineHeight: 28,
        color: 'rgba(232, 201, 140, 0.9)',
    },
    goldLine: {
        width: 56,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(232, 201, 140, 0.55)',
        alignSelf: 'center',
        marginVertical: 24,
    },
    body: {
        textAlign: 'center',
        lineHeight: 28,
        fontSize: 17,
        color: 'rgba(255, 248, 236, 0.88)',
    },
    keyHero: {
        textAlign: 'center',
        fontSize: 22,
        lineHeight: 32,
        color: 'rgba(255, 248, 236, 0.96)',
        paddingHorizontal: 4,
    },
    nowTitle: {
        textAlign: 'center',
        fontSize: 20,
        lineHeight: 26,
        color: 'rgba(232, 201, 140, 0.92)',
        marginBottom: 8,
    },
    nowSub: {
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
        color: 'rgba(255, 248, 236, 0.78)',
        marginBottom: 18,
    },
    nowLine: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(255, 248, 236, 0.86)',
        marginBottom: 12,
    },
    cta: {
        marginTop: 36,
        alignSelf: 'center',
        minWidth: 220,
        paddingVertical: 16,
        paddingHorizontal: 28,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.55)',
        backgroundColor: 'rgba(232, 201, 140, 0.1)',
    },
    ctaText: {
        textAlign: 'center',
        fontSize: 22,
        lineHeight: 28,
        color: 'rgba(255, 248, 236, 0.96)',
    },
    ctaSub: {
        marginTop: 6,
        textAlign: 'center',
        fontSize: 12,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        color: 'rgba(232, 201, 140, 0.78)',
    },
})

export default HeadToHeart
