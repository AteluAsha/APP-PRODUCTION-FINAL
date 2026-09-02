import React from 'react'
import { View, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'

/** Wrapped reflection below crystal bowl — body copy + elevated closing quote. */
export function SoundBathClosingSection({
    body,
    closingQuote,
}: {
    body: string
    closingQuote: string
}) {
    return (
        <View
            style={{
                marginHorizontal: 16,
                marginTop: 8,
                marginBottom: 32,
                borderRadius: 22,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(232, 201, 140, 0.22)',
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.28,
                        shadowRadius: 12,
                    },
                    android: { elevation: 4 },
                }),
            }}
        >
            <LinearGradient
                colors={[
                    'rgba(18, 16, 14, 0.92)',
                    'rgba(8, 6, 5, 0.96)',
                ]}
                style={{ paddingHorizontal: 22, paddingVertical: 24 }}
            >
                <AppText
                    font="instrument-italic"
                    size="sm"
                    style={{
                        lineHeight: 24,
                        textAlign: 'justify',
                        color: 'rgba(255, 248, 236, 0.88)',
                        marginBottom: 22,
                    }}
                >
                    {body}
                </AppText>

                <View
                    style={{
                        borderRadius: 16,
                        paddingVertical: 18,
                        paddingHorizontal: 18,
                        borderWidth: 1,
                        borderColor: 'rgba(212, 165, 116, 0.35)',
                        backgroundColor: 'rgba(212, 165, 116, 0.08)',
                    }}
                >
                    <AppText
                        font="cormorant-italic"
                        style={{
                            fontSize: 19,
                            lineHeight: 30,
                            textAlign: 'center',
                            color: 'rgba(255, 248, 236, 0.94)',
                        }}
                    >
                        “{closingQuote}”
                    </AppText>
                </View>
            </LinearGradient>
        </View>
    )
}
