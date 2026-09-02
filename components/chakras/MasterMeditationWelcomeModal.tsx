/**
 * Healing welcome for the first Master Meditation tap.
 *
 * Android: keep this Modal mounted and pass visible={false} so the native
 * overlay can release touches. Children unmount when hidden.
 */
import React from 'react'
import {
    Modal,
    View,
    Pressable,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { MASTER_MEDITATION_WELCOME } from '@/constants/masterMeditationWelcome'

export function MasterMeditationWelcomeModal({
    visible,
    onBegin,
    onDismiss,
}: {
    visible: boolean
    onBegin: () => void
    onDismiss: () => void
}) {
    const handleBegin = () => {
        addHapticFeedback(HapticStrength.Medium)
        onBegin()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
            statusBarTranslucent={Platform.OS === 'android'}
        >
            {visible ? (
                <Pressable
                    style={styles.overlay}
                    onPress={onDismiss}
                    accessibilityLabel="Dismiss master meditation welcome"
                >
                    <Pressable
                        style={styles.card}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <LinearGradient
                            colors={[
                                'rgba(18, 16, 14, 0.98)',
                                'rgba(12, 14, 16, 0.99)',
                                'rgba(10, 12, 12, 0.99)',
                            ]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.gradient}
                        >
                            <ScrollView
                                contentContainerStyle={styles.scroll}
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                            >
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.kicker}
                                >
                                    {MASTER_MEDITATION_WELCOME.kicker}
                                </AppText>
                                <AppText
                                    font="cormorant-italic"
                                    style={styles.title}
                                >
                                    {MASTER_MEDITATION_WELCOME.title}
                                </AppText>
                                <View style={styles.goldLine} />
                                {MASTER_MEDITATION_WELCOME.paragraphs.map(
                                    (paragraph) => (
                                        <AppText
                                            key={paragraph}
                                            font="cormorant-italic"
                                            style={styles.body}
                                        >
                                            {paragraph}
                                        </AppText>
                                    ),
                                )}
                                <Pressable
                                    onPress={handleBegin}
                                    style={({ pressed }) => [
                                        pressed && { opacity: 0.9 },
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        MASTER_MEDITATION_WELCOME.cta
                                    }
                                    accessibilityHint="Begin the master meditation"
                                >
                                    <LinearGradient
                                        colors={[
                                            'rgba(168, 201, 154, 0.88)',
                                            'rgba(107, 142, 90, 0.92)',
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
                                            {MASTER_MEDITATION_WELCOME.cta}
                                        </AppText>
                                    </LinearGradient>
                                </Pressable>
                            </ScrollView>
                        </LinearGradient>
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
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        maxHeight: '92%',
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: '#0c0a08',
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.32)',
    },
    gradient: {
        width: '100%',
    },
    scroll: {
        paddingVertical: 32,
        paddingHorizontal: 26,
        alignItems: 'center',
    },
    kicker: {
        color: 'rgba(232, 201, 140, 0.92)',
        fontSize: 14,
        letterSpacing: 1.8,
        textAlign: 'center',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    title: {
        color: 'rgba(255, 248, 236, 0.98)',
        fontSize: 26,
        lineHeight: 34,
        textAlign: 'center',
        marginBottom: 18,
    },
    goldLine: {
        width: 48,
        height: 1,
        backgroundColor: 'rgba(232, 201, 140, 0.55)',
        marginBottom: 20,
    },
    body: {
        color: 'rgba(255, 248, 236, 0.9)',
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        marginTop: 12,
        paddingVertical: Platform.OS === 'ios' ? 16 : 15,
        paddingHorizontal: 28,
        borderRadius: 16,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
    },
    buttonLabel: {
        color: '#ffffff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
})
