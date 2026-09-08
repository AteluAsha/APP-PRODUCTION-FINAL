import React from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import SectionHeader from './SectionHeader'
import { YogaPoseButton } from './YogaPoseButton'
import { ChakraIdentityCard } from './ChakraIdentityCard'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'

const HEALING_SECTION_FRAME = {
    marginTop: 40,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(232, 201, 140, 0.14)',
    backgroundColor: 'rgba(8, 6, 5, 0.42)',
} as const

const Part3Section = ({ chakra }: { chakra: Chakra }) => {
    const router = useRouter()

    return (
        <View style={HEALING_SECTION_FRAME}>
            <SectionHeader
                variant="healing"
                subtitle="— PART III —"
                title="Integration"
                description={chakraContent[chakra].integration}
            />
            <View
                style={{
                    height: 1,
                    width: 64,
                    backgroundColor: 'rgba(142, 142, 142, 0.65)',
                    alignSelf: 'center',
                    marginBottom: 24,
                }}
            />
            <ChakraIdentityCard chakra={chakra} />
            <View style={{ width: '100%', alignItems: 'center' }}>
                <YogaPoseButton
                    chakra={chakra}
                    onPress={() => {
                        addHapticFeedback(HapticStrength.Light)
                        router.push(
                            `/(chakras)/IntegrationPractice?chakra=${chakra}`,
                        )
                    }}
                />
            </View>
        </View>
    )
}

export default Part3Section
