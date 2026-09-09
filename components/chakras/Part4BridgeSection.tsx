import React from 'react'
import { View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import SectionHeader from './SectionHeader'
import { AshaSpeaksButton } from './AshaSpeaksButton'
import { RemembranceButton } from './RemembranceButton'
import { AppText } from '@/components/AppText'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import {
    BRIDGE_EXPLAINER,
    getBridgeLawLabel,
} from '@/constants/chakras/ancestralBridgeContent'
import { openAshaSpeaks } from '@/utils/openAshaSpeaks'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { getHeadToHeartAudioId } from '@/hooks/useAncestralWisdomAudio'
import { getChakraIndex } from '@/utils/chakraMapping'

const FRAME = {
    marginTop: 48,
    marginHorizontal: 12,
    marginBottom: 32,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(232, 201, 140, 0.22)',
    backgroundColor: 'rgba(8, 6, 5, 0.55)',
    alignItems: 'center' as const,
    alignSelf: 'stretch' as const,
}

export function Part4BridgeSection({ chakra }: { chakra: Chakra }) {
    const pathname = usePathname()
    const router = useRouter()
    const chakraDay = getChakraIndex(chakra)
    const durationMs = chakraContent[chakra].headtoheart.audio.duration

    return (
        <View style={FRAME}>
            <SectionHeader
                variant="healing"
                subtitle="— PART IV —"
                title="The Bridge"
                description={BRIDGE_EXPLAINER}
            />
            <View
                style={{
                    height: 1,
                    width: 64,
                    backgroundColor: 'rgba(232, 201, 140, 0.35)',
                    alignSelf: 'center',
                    marginBottom: 16,
                }}
            />
            <AppText
                font="cormorant-regular"
                style={{
                    textAlign: 'center',
                    fontSize: 13,
                    letterSpacing: 2.2,
                    textTransform: 'uppercase',
                    color: 'rgba(232, 201, 140, 0.82)',
                    marginBottom: 20,
                    paddingHorizontal: 8,
                }}
            >
                {getBridgeLawLabel(chakra)}
            </AppText>
            <AshaSpeaksButton
                audioId={getHeadToHeartAudioId(chakra)}
                durationMs={durationMs}
                onPress={() => {
                    addHapticFeedback(HapticStrength.Medium)
                    openAshaSpeaks(chakra, pathname)
                }}
            />
            <View
                style={{
                    height: 1,
                    width: 40,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignSelf: 'center',
                    marginBottom: 20,
                    marginTop: 4,
                }}
            />
            <RemembranceButton
                chakra={chakra}
                onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    router.push(`/(chakras)/QuizScreen?day=${chakraDay + 1}`)
                }}
            />
        </View>
    )
}
