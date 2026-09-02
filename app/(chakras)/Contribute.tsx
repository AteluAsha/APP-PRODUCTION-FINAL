/**
 * Standalone contribute screen retired. Energy Exchange remains on Paywall.
 */
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'

export default function Contribute() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/(chakras)/ChakraHub')
    }, [router])

    return <View style={{ flex: 1, backgroundColor: '#000000' }} />
}
