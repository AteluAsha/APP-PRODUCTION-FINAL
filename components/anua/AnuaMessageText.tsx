import React from 'react'
import { StyleProp, StyleSheet, Text as RNText, TextStyle } from 'react-native'
import {
    parseAnuaMarkup,
    stabilizeStreamingMarkup,
    type AnuaMarkupSegment,
} from '@/utils/anuaMessageMarkup'

type AnuaTextTone = 'anua' | 'user'

const FONT = {
    anua: 'CormorantGaramond',
    anuaItalic: 'CormorantGaramondItalic',
    user: 'InstrumentSansRegular',
    userItalic: 'InstrumentSansItalic',
    userBold: 'InstrumentSansSemiBold',
    userBoldItalic: 'InstrumentSansSemiBoldItalic',
} as const

function fontFamilyForSegment(
    segment: AnuaMarkupSegment,
    tone: AnuaTextTone,
): string {
    if (tone === 'anua') {
        return segment.italic || segment.bold ? FONT.anuaItalic : FONT.anua
    }
    if (segment.bold && segment.italic) return FONT.userBoldItalic
    if (segment.bold) return FONT.userBold
    if (segment.italic) return FONT.userItalic
    return FONT.user
}

interface AnuaMessageTextProps {
    text: string
    style?: StyleProp<TextStyle>
    isStreaming?: boolean
    tone?: AnuaTextTone
}

export const AnuaMessageText = ({
    text,
    style,
    isStreaming = false,
    tone = 'anua',
}: AnuaMessageTextProps) => {
    const display = isStreaming ? stabilizeStreamingMarkup(text) : text
    const segments = parseAnuaMarkup(display)
    const flat = StyleSheet.flatten(style) ?? {}
    const { lineHeight, ...spanStyle } = flat as TextStyle
    const fontSize = tone === 'anua' ? 20 : 15

    return (
        <RNText
            style={[
                {
                    fontFamily: fontFamilyForSegment({ text: '' }, tone),
                    fontSize,
                    lineHeight: lineHeight ?? (tone === 'anua' ? 30 : 22),
                },
                flat,
            ]}
        >
            {segments.map((segment, index) => (
                <RNText
                    key={index}
                    style={[
                        spanStyle,
                        {
                            fontFamily: fontFamilyForSegment(segment, tone),
                            fontSize,
                        },
                    ]}
                >
                    {segment.text}
                </RNText>
            ))}
            {isStreaming ? (
                <RNText
                    style={[
                        spanStyle,
                        {
                            fontFamily: FONT.anuaItalic,
                            fontSize,
                            color: 'rgba(232, 213, 183, 0.4)',
                        },
                    ]}
                >
                    {' |'}
                </RNText>
            ) : null}
        </RNText>
    )
}
