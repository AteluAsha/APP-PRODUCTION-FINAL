import { useLocalSearchParams, useRouter } from 'expo-router'
import { DayPresenceScreen } from '@/components/chakras/DayPresenceScreen'
import { enterChakraDayAfterPresence } from '@/utils/openChakraDay'

export default function DayPresenceRoute() {
    const router = useRouter()
    const params = useLocalSearchParams<{ day?: string | string[] }>()
    const raw = Array.isArray(params.day) ? params.day[0] : params.day
    const parsed = raw != null ? parseInt(raw, 10) : 0
    const dayIndex = Number.isFinite(parsed) ? Math.min(6, Math.max(0, parsed)) : 0

    return (
        <DayPresenceScreen
            dayIndex={dayIndex}
            onPresent={() => enterChakraDayAfterPresence(dayIndex, router)}
        />
    )
}
