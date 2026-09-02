/**
 * After a completed chakra, a small blessing on the hub for tomorrow's day.
 * Android: keep Modal mounted and pass visible={false} so touches release.
 */
import React from 'react'
import {
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import {
    getTomorrowAwakeningCopy,
    tomorrowAwakeningImage,
} from '@/constants/tomorrowAwakeningCopy'

export function TomorrowAwakeningModal({
    visible,
    completedDayIndex,
    onClose,
}: {
    visible: boolean
    completedDayIndex: number | null
    onClose: () => void
}) {
    const copy =
        completedDayIndex != null
            ? getTomorrowAwakeningCopy(completedDayIndex)
            : null
    const image =
        completedDayIndex != null
            ? tomorrowAwakeningImage(completedDayIndex)
            : null

    const dismiss = () => {
        addHapticFeedback(HapticStrength.Light)
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={dismiss}
            statusBarTranslucent={Platform.OS === 'android'}
        >
            {visible && copy ? (
                <Pressable
                    style={styles.overlay}
                    onPress={dismiss}
                    accessibilityLabel="Dismiss tomorrow's awakening"
                >
                    <Pressable
                        style={styles.card}
                        onPress={() => {}}
                        accessibilityRole="summary"
                    >
                        {image ? (
                            <Image
                                source={image}
                                resizeMode="contain"
                                style={styles.ball}
                            />
                        ) : null}
                        <AppText font="cormorant-italic" style={styles.heading}>
                            {copy.heading}
                        </AppText>
                        <View style={styles.goldLine} />
                        <AppText font="cormorant-italic" style={styles.message}>
                            {copy.message}
                        </AppText>
                        <Pressable
                            onPress={dismiss}
                            style={({ pressed }) => [
                                pressed && { opacity: 0.9 },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel="Continue"
                        >
                            <LinearGradient
                                colors={[
                                    'rgba(168, 201, 154, 0.9)',
                                    'rgba(107, 142, 90, 0.94)',
                                    'rgba(212, 165, 116, 0.55)',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.button}
                            >
                                <AppText
                                    font="instrument-semibold"
                                    size="sm"
                                    style={styles.buttonLabel}
                                >
                                    I am ready
                                </AppText>
                            </LinearGradient>
                        </Pressable>
                    </Pressable>
                </Pressable>
            ) : null}
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.35)',
        backgroundColor: 'rgba(8, 10, 8, 0.94)',
        paddingVertical: 36,
        paddingHorizontal: 28,
        alignItems: 'center',
    },
    ball: {
        width: 96,
        height: 96,
        marginBottom: 20,
    },
    heading: {
        color: 'rgba(255, 248, 236, 0.98)',
        fontSize: 26,
        lineHeight: 34,
        textAlign: 'center',
        textShadowColor: 'rgba(232, 201, 140, 0.35)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    goldLine: {
        width: 48,
        height: 1,
        backgroundColor: 'rgba(232, 201, 140, 0.45)',
        marginVertical: 18,
    },
    message: {
        color: 'rgba(255, 255, 255, 0.88)',
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        marginBottom: 28,
    },
    button: {
        paddingVertical: Platform.OS === 'ios' ? 14 : 13,
        paddingHorizontal: 32,
        borderRadius: 16,
        minHeight: 48,
        minWidth: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLabel: {
        color: '#ffffff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
})
