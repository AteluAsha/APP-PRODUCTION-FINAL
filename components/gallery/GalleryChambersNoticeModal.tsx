/**
 * One-time orientation for the seven chambers.
 * Android transparent Modal: keep mounted; gate children on `visible`.
 */

import React from 'react'
import {
    Modal,
    View,
    Pressable,
    Image,
    StyleSheet,
    Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { MODAL_CARD_MAX_WIDTH } from '@/constants/layout'
import { GALLERY_CHAMBERS_NOTICE_COPY } from '@/constants/galleryChambersCopy'
import { WELLNESS_GATE_FIELD } from '@/constants/sanctuaryFields'

interface GalleryChambersNoticeModalProps {
    visible: boolean
    onUnderstand: () => void
}

export function GalleryChambersNoticeModal({
    visible,
    onUnderstand,
}: GalleryChambersNoticeModalProps) {
    const handleUnderstand = () => {
        addHapticFeedback(HapticStrength.Medium)
        onUnderstand()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleUnderstand}
            statusBarTranslucent={Platform.OS === 'android'}
        >
            {visible ? (
                <View
                    style={[
                        styles.overlay,
                        Platform.OS === 'android' && {
                            elevation: 9999,
                            zIndex: 9999,
                        },
                    ]}
                    pointerEvents="box-none"
                >
                    <View
                        style={[
                            styles.card,
                            Platform.OS === 'android' && {
                                elevation: 24,
                                zIndex: 1,
                            },
                        ]}
                        pointerEvents="box-none"
                        collapsable={false}
                    >
                        <Image
                            source={WELLNESS_GATE_FIELD}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={[
                                'rgba(8, 8, 8, 0.62)',
                                'rgba(10, 10, 10, 0.78)',
                                'rgba(8, 8, 8, 0.88)',
                            ]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.gradient}
                        >
                            <AppText
                                font="cormorant-italic"
                                style={styles.title}
                            >
                                {GALLERY_CHAMBERS_NOTICE_COPY.title}
                            </AppText>

                            <AppText
                                font="cormorant-italic"
                                style={styles.body}
                            >
                                {GALLERY_CHAMBERS_NOTICE_COPY.body}
                            </AppText>

                            <AppText
                                font="cormorant-italic"
                                style={styles.bodyAfter}
                            >
                                {GALLERY_CHAMBERS_NOTICE_COPY.bodyAfter}
                            </AppText>

                            <AppText
                                font="cormorant-italic"
                                style={styles.note}
                            >
                                {GALLERY_CHAMBERS_NOTICE_COPY.menuNote}
                            </AppText>

                            <Pressable
                                onPress={handleUnderstand}
                                style={({ pressed }) => [
                                    pressed && { opacity: 0.9 },
                                ]}
                                hitSlop={{
                                    top: 12,
                                    bottom: 12,
                                    left: 12,
                                    right: 12,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    GALLERY_CHAMBERS_NOTICE_COPY.cta
                                }
                            >
                                <LinearGradient
                                    colors={[
                                        'rgba(168, 201, 154, 0.55)',
                                        'rgba(232, 201, 140, 0.38)',
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaButton}
                                >
                                    <AppText
                                        font="cormorant-italic"
                                        style={styles.ctaText}
                                    >
                                        {GALLERY_CHAMBERS_NOTICE_COPY.cta}
                                    </AppText>
                                </LinearGradient>
                            </Pressable>
                        </LinearGradient>
                    </View>
                </View>
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
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: MODAL_CARD_MAX_WIDTH,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.38)',
        backgroundColor: '#0c0a08',
        shadowColor: 'rgba(232, 201, 140, 0.28)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 12,
    },
    gradient: {
        paddingVertical: 28,
        paddingHorizontal: 24,
    },
    title: {
        color: 'rgba(255, 248, 236, 0.98)',
        fontSize: 26,
        lineHeight: 32,
        letterSpacing: 0.3,
        textAlign: 'center',
        marginBottom: 18,
        textShadowColor: 'rgba(0,0,0,0.55)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    body: {
        color: 'rgba(255, 248, 236, 0.92)',
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        marginBottom: 18,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    bodyAfter: {
        color: 'rgba(255, 248, 236, 0.88)',
        fontSize: 17,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 16,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    note: {
        color: 'rgba(232, 201, 140, 0.88)',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    ctaButton: {
        paddingVertical: 16,
        paddingHorizontal: 22,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.55)',
        alignItems: 'center',
    },
    ctaText: {
        color: 'rgba(255, 248, 236, 0.98)',
        fontSize: 19,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
})
