import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { AppText } from '@/components/AppText'
import { SoftChakraBall } from '@/components/chakras/SoftChakraBall'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import { getChakraColor } from '@/constants/chakras/chakraConstants'
import { getChakraIndex } from '@/utils/chakraMapping'

export function ChakraIdentityCard({ chakra }: { chakra: Chakra }) {
    const content = chakraContent[chakra]
    const accent = getChakraColor(getChakraIndex(chakra))

    return (
        <View
            style={[
                styles.card,
                Platform.OS === 'android'
                    ? { elevation: 6 }
                    : {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: 0.4,
                          shadowRadius: 14,
                      },
            ]}
            accessibilityRole="image"
            accessibilityLabel={`${content.header.textLine2}, ${content.pills.identityStatement.title}`}
        >
            <SoftChakraBall
                source={content.chakraHeaderImage}
                size={88}
                glowColor={`${accent}33`}
            />
            <AppText font="cormorant-regular" style={styles.day}>
                {content.header.textLine1}
            </AppText>
            <AppText font="cormorant-italic" style={styles.name}>
                {content.header.textLine2}
            </AppText>
            <View style={styles.goldLine} />
            <AppText font="cormorant-italic" style={styles.identity}>
                {content.pills.identityStatement.title}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        alignItems: 'center',
        alignSelf: 'stretch',
        marginBottom: 28,
        paddingVertical: 26,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.22)',
        backgroundColor: 'rgba(10, 8, 6, 0.72)',
    },
    day: {
        marginTop: 14,
        fontSize: 12,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: 'rgba(232, 201, 140, 0.78)',
    },
    name: {
        marginTop: 6,
        fontSize: 24,
        lineHeight: 30,
        color: 'rgba(255, 248, 236, 0.96)',
    },
    goldLine: {
        width: 48,
        height: StyleSheet.hairlineWidth,
        marginVertical: 12,
        backgroundColor: 'rgba(232, 201, 140, 0.55)',
    },
    identity: {
        fontSize: 20,
        lineHeight: 26,
        color: 'rgba(255, 248, 236, 0.9)',
    },
})
