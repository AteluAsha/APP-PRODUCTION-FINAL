import React from 'react'
import { View } from 'react-native'
import { AppText } from '@/components/AppText'
import { Chakra } from '@/types/chakras/Chakra'
import { BODY_HEALING_HEADING } from '@/constants/yogaStudio'
import {
    formatHeroAffirmationText,
    HERO_AFFIRMATION_FONT_SIZE,
    HERO_AFFIRMATION_LINE_HEIGHT,
    HERO_AFFIRMATION_MAX_LINES,
} from '@/constants/heroAffirmation'

export function ChakraIdentityCard({ chakra }: { chakra: Chakra }) {
    const heading = formatHeroAffirmationText(BODY_HEALING_HEADING[chakra])

    return (
        <View
            style={{
                alignSelf: 'stretch',
                alignItems: 'center',
                marginBottom: 20,
                paddingHorizontal: 20,
            }}
            accessibilityRole="header"
            accessibilityLabel={heading}
        >
            <AppText
                font="cormorant-italic"
                numberOfLines={HERO_AFFIRMATION_MAX_LINES}
                style={{
                    fontFamily: 'CormorantGaramondItalic',
                    fontWeight: '400',
                    fontSize: HERO_AFFIRMATION_FONT_SIZE,
                    lineHeight: HERO_AFFIRMATION_LINE_HEIGHT,
                    color: 'rgba(255,255,255,0.92)',
                    textAlign: 'center',
                    width: '100%',
                    paddingHorizontal: 4,
                    marginBottom: 16,
                }}
            >
                {heading}
            </AppText>
            <View
                style={{
                    height: 1,
                    width: 48,
                    backgroundColor: 'rgba(255,255,255,0.35)',
                }}
            />
        </View>
    )
}
