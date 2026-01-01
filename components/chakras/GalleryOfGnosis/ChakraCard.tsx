import React from 'react'
import { View, Image, ImageSourcePropType } from 'react-native'
import { AppText } from '@/components/AppText'
import { Chakra } from '@/types/chakras/Chakra'
import { Content } from '@/types/chakras/Content'

interface ChakraCardProps {
    chakra: Chakra
    content: Content
    isActive: boolean
}

const CHAKRA_NAMES: Record<Chakra, string> = {
    [Chakra.ROOT]: 'Root',
    [Chakra.SACRAL]: 'Sacral',
    [Chakra.SOLAR_PLEXUS]: 'Solar Plexus',
    [Chakra.HEART]: 'Heart',
    [Chakra.THROAT]: 'Throat',
    [Chakra.THIRD_EYE]: 'Ajna',
    [Chakra.CROWN]: 'Crown',
}

export const ChakraCard: React.FC<ChakraCardProps> = ({ chakra, content }) => {
    const elements = content.elements

    return (
        <View className="w-full items-center justify-center" style={{ flex: 1 }}>
            {/* Title above the card */}
            <AppText font="instrument-bold" size="2xl" className="text-white mb-4 text-center">
                {CHAKRA_NAMES[chakra]}
            </AppText>
            
            {/* Card Image - Just the image, no overlays */}
            <View
                className="rounded-3xl overflow-hidden"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    width: '100%',
                    aspectRatio: 3 / 4, // Maintain card aspect ratio
                    maxWidth: 400,
                }}
            >
                <Image
                    source={elements.background as ImageSourcePropType}
                    className="w-full h-full"
                    resizeMode="contain"
                    style={{ borderRadius: 24 }}
                />
            </View>
        </View>
    )
}
