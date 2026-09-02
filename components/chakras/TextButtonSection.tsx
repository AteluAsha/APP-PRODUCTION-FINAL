import React from 'react'
import { View } from 'react-native'
import { AppText } from '../AppText'
import { HealingPillTouchable } from './HealingPillTouchable'

interface TextButtonSectionProps {
    heading: string
    description: string
    buttonText: string
    buttonSubText: string
    onPress: () => void
    /** Soft accent for Frequency vs Ancestral paths */
    tone?: 'frequency' | 'ancestral'
}

const TONE = {
    frequency: {
        frameBorder: 'rgba(168, 201, 154, 0.28)',
        frameBg: 'rgba(168, 201, 154, 0.06)',
        pillTop: 'rgba(255,255,255,0.14)',
        pillBottom: 'rgba(0,0,0,0.32)',
        pillLeft: 'rgba(168, 201, 154, 0.35)',
        pillColors: [
            'rgba(168, 201, 154, 0.16)',
            'rgba(255,255,255,0.06)',
            'rgba(0,0,0,0.22)',
        ] as const,
        pathColor: 'rgba(197, 224, 180, 0.92)',
    },
    ancestral: {
        frameBorder: 'rgba(232, 201, 140, 0.28)',
        frameBg: 'rgba(232, 201, 140, 0.06)',
        pillTop: 'rgba(255,255,255,0.14)',
        pillBottom: 'rgba(0,0,0,0.32)',
        pillLeft: 'rgba(232, 201, 140, 0.38)',
        pillColors: [
            'rgba(232, 201, 140, 0.14)',
            'rgba(255,255,255,0.05)',
            'rgba(0,0,0,0.24)',
        ] as const,
        pathColor: 'rgba(232, 201, 140, 0.92)',
    },
}

const TextButtonSection: React.FC<TextButtonSectionProps> = ({
    heading,
    description,
    buttonText,
    buttonSubText,
    onPress,
    tone = 'ancestral',
}) => {
    const accent = TONE[tone]

    return (
        <View
            style={{
                marginBottom: 28,
                paddingVertical: 22,
                paddingHorizontal: 18,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: accent.frameBorder,
                backgroundColor: accent.frameBg,
            }}
        >
            <AppText
                font="cormorant-regular"
                style={{
                    marginBottom: 10,
                    fontSize: 13,
                    letterSpacing: 2.4,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    color: 'rgba(232, 201, 140, 0.88)',
                }}
            >
                {heading}
            </AppText>
            <AppText
                font="cormorant-italic"
                style={{
                    marginBottom: 22,
                    fontSize: 17,
                    lineHeight: 27,
                    textAlign: 'center',
                    color: 'rgba(255, 248, 236, 0.9)',
                    paddingHorizontal: 4,
                }}
            >
                {description}
            </AppText>
            <HealingPillTouchable
                accent={accent}
                onPress={onPress}
                accessibilityLabel={`${buttonText}, ${buttonSubText}`}
            >
                <AppText
                    font="cormorant-regular"
                    style={{
                        textAlign: 'center',
                        fontSize: 13,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        color: accent.pathColor,
                        marginBottom: 4,
                    }}
                >
                    {buttonText}
                </AppText>
                <AppText
                    font="cormorant-italic"
                    style={{
                        textAlign: 'center',
                        fontSize: 22,
                        lineHeight: 28,
                        color: 'rgba(255, 248, 236, 0.96)',
                    }}
                >
                    {buttonSubText}
                </AppText>
            </HealingPillTouchable>
        </View>
    )
}

export default TextButtonSection
