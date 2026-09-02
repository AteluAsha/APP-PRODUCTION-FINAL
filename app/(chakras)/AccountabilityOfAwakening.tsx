/**
 * Progress meters retired. The course lives on ChakraHub.
 */
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'

export default function AccountabilityOfAwakening() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/(chakras)/ChakraHub')
    }, [router])

    return <View style={{ flex: 1, backgroundColor: '#000000' }} />
}
