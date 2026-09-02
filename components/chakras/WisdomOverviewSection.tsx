/**
 * Combined Overview + Sanskrit — one framed wisdom panel for course days 1–7.
 */
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { CollapsibleText } from '@/components/CollapsibleText'

export function WisdomOverviewSection({
    overview,
    sanskrit,
}: {
    overview: string
    sanskrit: string
}) {
    return (
        <View style={styles.outer}>
            <LinearGradient
                colors={[
                    'rgba(232, 201, 140, 0.12)',
                    'rgba(168, 201, 154, 0.06)',
                    'rgba(0, 0, 0, 0)',
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.ambientGlow}
            />
            <LinearGradient
                colors={[
                    'rgba(28, 24, 22, 0.96)',
                    'rgba(18, 16, 14, 0.98)',
                    'rgba(12, 10, 9, 0.99)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientShell}
            >
                <View style={styles.rimHighlight} />
                <View style={styles.innerBorder}>
                    <AppText
                        font="cormorant-regular"
                        size="xs"
                        style={styles.sectionLabel}
                    >
                        Overview
                    </AppText>
                    <CollapsibleText
                        text={overview}
                        linesToTruncate={4}
                        containerStyle={{ marginHorizontal: 0 }}
                        textStyle={styles.overviewText}
                        font="cormorant-regular"
                    />

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <AppText
                            font="instrument-regular"
                            style={styles.dividerGlyph}
                        >
                            ॐ
                        </AppText>
                        <View style={styles.dividerLine} />
                    </View>

                    <AppText
                        font="cormorant-regular"
                        size="xs"
                        style={styles.sectionLabel}
                    >
                        Sanskrit
                    </AppText>
                    <LinearGradient
                        colors={[
                            'rgba(232, 201, 140, 0.18)',
                            'rgba(168, 201, 154, 0.1)',
                            'rgba(12, 10, 9, 0.35)',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sanskritFrame}
                    >
                        <View style={styles.sanskritInnerRim} />
                        <AppText
                            font="cormorant-italic"
                            style={styles.sanskritText}
                        >
                            {sanskrit}
                        </AppText>
                    </LinearGradient>
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    outer: {
        marginHorizontal: 20,
        marginVertical: 12,
        borderRadius: 22,
        shadowColor: '#000000',
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    ambientGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 22,
        transform: [{ scaleY: 1.08 }],
        opacity: 0.9,
    },
    gradientShell: {
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.22)',
    },
    rimHighlight: {
        position: 'absolute',
        top: 0,
        left: 24,
        right: 24,
        height: 1,
        backgroundColor: 'rgba(255, 248, 236, 0.12)',
    },
    innerBorder: {
        paddingHorizontal: 22,
        paddingVertical: 26,
    },
    sectionLabel: {
        letterSpacing: 2.2,
        textTransform: 'uppercase',
        color: 'rgba(232, 201, 140, 0.88)',
        marginBottom: 10,
        fontSize: 11,
    },
    overviewText: {
        color: 'rgba(255, 248, 236, 0.92)',
        lineHeight: 28,
        fontSize: 17,
        marginHorizontal: 0,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 22,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(232, 201, 140, 0.28)',
    },
    dividerGlyph: {
        color: 'rgba(232, 201, 140, 0.55)',
        fontSize: 16,
    },
    sanskritFrame: {
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.24)',
        overflow: 'hidden',
    },
    sanskritInnerRim: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        height: 1,
        backgroundColor: 'rgba(255, 248, 236, 0.14)',
    },
    sanskritText: {
        color: 'rgba(255, 248, 236, 0.94)',
        fontSize: 20,
        lineHeight: 32,
        textAlign: 'center',
    },
})
