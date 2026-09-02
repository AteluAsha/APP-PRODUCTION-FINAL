import {
    Image,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '../AppText'
import React, { useMemo } from 'react'
import { Chakra } from '@/types/chakras/Chakra'
import { YOGA_STUDIO, YOGA_STUDIO_KICKER } from '@/constants/yogaStudio'
import { chakraContent } from '@/constants/chakras/content'
import { getIntegrationMomentContent } from '@/constants/chakras/integrationMomentContent'
import { getChakraIndex } from '@/utils/chakraMapping'

interface YogaSectionProps {
    chakra: Chakra
}

const YogaSection: React.FC<YogaSectionProps> = ({ chakra }) => {
    const { width } = useWindowDimensions()
    const page = YOGA_STUDIO[chakra]
    const yoga = chakraContent[chakra].yoga
    const integration = getIntegrationMomentContent(getChakraIndex(chakra))
    const figureWidth = Math.min(width * 0.78, 320)
    const figureHeight = figureWidth * (4 / 3)

    const wisdomParagraphs = useMemo(() => {
        if (!integration?.body) return []
        return integration.body.split('\n\n').filter(Boolean)
    }, [integration?.body])

    const openPoseGuide = () => {
        if (!page.poseUrl) return
        Linking.openURL(page.poseUrl).catch(() => {})
    }

    return (
        <View style={styles.root}>
            <AppText font="instrument-regular" style={styles.kicker}>
                {YOGA_STUDIO_KICKER}
            </AppText>
            <AppText font="cormorant-regular" style={styles.day}>
                {yoga.chakraDay}
            </AppText>
            <AppText font="cormorant-italic" style={styles.poseName}>
                {page.poseName}
            </AppText>
            <AppText font="instrument-regular" style={styles.sanskrit}>
                {page.sanskrit}
            </AppText>

            <View
                style={[
                    styles.studioPodOuter,
                    {
                        width: figureWidth + 48,
                        height: figureHeight + 44,
                    },
                ]}
            >
                <LinearGradient
                    colors={[
                        'rgba(255, 255, 255, 0.55)',
                        'rgba(232, 214, 198, 0.35)',
                        'rgba(196, 168, 140, 0.22)',
                    ]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.studioPodShadow}
                />
                <View
                    style={[
                        styles.studioFloor,
                        { width: figureWidth + 36, height: figureHeight + 28 },
                    ]}
                >
                    <LinearGradient
                        colors={[
                            'rgba(255,255,255,0.98)',
                            'rgba(248, 240, 232, 0.88)',
                            'rgba(228, 210, 192, 0.72)',
                        ]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <LinearGradient
                        colors={[
                            'rgba(255,255,255,0.35)',
                            'rgba(255,255,255,0)',
                        ]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 0.35 }}
                        style={styles.studioHighlight}
                    />
                    <Image
                        source={page.figure}
                        resizeMode="contain"
                        style={{ width: figureWidth, height: figureHeight }}
                        accessibilityLabel={`${page.poseName} outline`}
                    />
                </View>
            </View>

            <AppText font="cormorant-italic" style={styles.essenceLabel}>
                The Essence
            </AppText>
            <AppText font="cormorant-italic" style={styles.essence}>
                &ldquo;{yoga.essence}&rdquo;
            </AppText>
            <View style={styles.goldLine} />

            <AppText font="instrument-regular" style={styles.body}>
                {yoga.body}
            </AppText>

            <LinearGradient
                colors={[
                    'rgba(255, 252, 248, 0.94)',
                    'rgba(245, 236, 226, 0.88)',
                    'rgba(232, 214, 198, 0.78)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.somaticBox}
            >
                <AppText font="instrument-semibold" style={styles.somaticLabel}>
                    Somatic Cue
                </AppText>
                <AppText font="cormorant-italic" style={styles.somaticCue}>
                    {yoga.somaticCue}
                </AppText>
            </LinearGradient>

            {page.poseUrl ? (
                <Pressable
                    onPress={openPoseGuide}
                    accessibilityRole="link"
                    accessibilityLabel={`See how to practice ${page.poseName}`}
                    style={styles.guideLink}
                >
                    <AppText font="instrument-regular" style={styles.guideLabel}>
                        See the shape
                    </AppText>
                </Pressable>
            ) : null}

            {integration ? (
                <LinearGradient
                    colors={[
                        'rgba(42, 32, 26, 0.96)',
                        'rgba(28, 22, 18, 0.98)',
                        'rgba(18, 14, 12, 0.99)',
                    ]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.wisdomBox}
                >
                    <LinearGradient
                        colors={[
                            'rgba(232, 201, 140, 0.22)',
                            'rgba(212, 165, 116, 0.08)',
                            'transparent',
                        ]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 0.45 }}
                        style={styles.wisdomSheen}
                    />
                    <View style={styles.wisdomGoldCap} />
                    <AppText font="instrument-semibold" style={styles.wisdomKicker}>
                        Wisdom for the day
                    </AppText>
                    <AppText font="cormorant-italic" style={styles.wisdomTitle}>
                        {integration.title}
                    </AppText>
                    <View style={styles.wisdomRule} />
                    {wisdomParagraphs.map((paragraph) => (
                        <AppText
                            key={paragraph.slice(0, 48)}
                            font="cormorant-regular"
                            style={styles.wisdomBody}
                        >
                            {paragraph}
                        </AppText>
                    ))}
                </LinearGradient>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    kicker: {
        color: 'rgba(88, 68, 54, 0.88)',
        letterSpacing: 3.4,
        fontSize: 12,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 10,
    },
    day: {
        color: 'rgba(72, 56, 46, 0.88)',
        fontSize: 16,
        letterSpacing: 1.6,
        textAlign: 'center',
        marginBottom: 8,
    },
    poseName: {
        color: 'rgba(38, 28, 22, 0.96)',
        fontSize: 36,
        lineHeight: 44,
        textAlign: 'center',
        textShadowColor: 'rgba(255,255,255,0.65)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    sanskrit: {
        color: 'rgba(98, 76, 62, 0.92)',
        fontSize: 14,
        letterSpacing: 1.8,
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 18,
        textTransform: 'uppercase',
    },
    studioPodOuter: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    studioPodShadow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 200,
        transform: [{ translateY: 10 }, { scaleX: 0.92 }],
        opacity: 0.55,
    },
    studioFloor: {
        borderRadius: 180,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.75)',
        ...Platform.select({
            ios: {
                shadowColor: '#5c483a',
                shadowOpacity: 0.28,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
            },
            android: { elevation: 8 },
        }),
    },
    studioHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '38%',
    },
    essenceLabel: {
        color: 'rgba(118, 88, 62, 0.95)',
        fontSize: 15,
        letterSpacing: 2.2,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    essence: {
        color: 'rgba(38, 28, 22, 0.98)',
        fontSize: 32,
        lineHeight: 42,
        textAlign: 'center',
        paddingHorizontal: 8,
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    goldLine: {
        width: 42,
        height: 1,
        backgroundColor: 'rgba(186, 150, 118, 0.55)',
        marginVertical: 22,
    },
    body: {
        color: 'rgba(42, 32, 26, 0.96)',
        fontSize: 18,
        lineHeight: 30,
        textAlign: 'center',
        marginBottom: 20,
    },
    somaticBox: {
        width: '100%',
        paddingVertical: 24,
        paddingHorizontal: 22,
        borderRadius: 20,
        borderWidth: 1.5,
        borderTopColor: 'rgba(255,255,255,0.65)',
        borderBottomColor: 'rgba(160, 132, 108, 0.45)',
        borderLeftColor: 'rgba(196, 168, 140, 0.4)',
        borderRightColor: 'rgba(140, 112, 92, 0.35)',
        marginBottom: 12,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#5c483a',
                shadowOpacity: 0.16,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
            },
            android: { elevation: 4 },
        }),
    },
    somaticLabel: {
        color: 'rgba(98, 76, 62, 0.95)',
        letterSpacing: 2,
        fontSize: 12,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 10,
    },
    somaticCue: {
        color: 'rgba(38, 28, 22, 0.98)',
        fontSize: 21,
        lineHeight: 32,
        textAlign: 'center',
    },
    guideLink: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 28,
    },
    guideLabel: {
        color: 'rgba(98, 76, 62, 0.95)',
        fontSize: 13,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    wisdomBox: {
        width: '100%',
        marginTop: 4,
        paddingTop: 28,
        paddingBottom: 34,
        paddingHorizontal: 24,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(232, 201, 140, 0.42)',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOpacity: 0.35,
                shadowRadius: 22,
                shadowOffset: { width: 0, height: 14 },
            },
            android: { elevation: 12 },
        }),
    },
    wisdomSheen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '38%',
    },
    wisdomGoldCap: {
        position: 'absolute',
        top: 0,
        left: 28,
        right: 28,
        height: 2,
        backgroundColor: 'rgba(232, 201, 140, 0.55)',
    },
    wisdomKicker: {
        color: 'rgba(232, 201, 140, 0.92)',
        letterSpacing: 2.6,
        fontSize: 11,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 14,
    },
    wisdomTitle: {
        color: 'rgba(255, 248, 236, 0.99)',
        fontSize: 30,
        lineHeight: 38,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    wisdomRule: {
        width: 52,
        height: 1,
        backgroundColor: 'rgba(232, 201, 140, 0.45)',
        alignSelf: 'center',
        marginVertical: 20,
    },
    wisdomBody: {
        color: 'rgba(255, 248, 236, 0.96)',
        fontSize: 19,
        lineHeight: 34,
        textAlign: 'center',
        marginBottom: 18,
    },
})

export default YogaSection
