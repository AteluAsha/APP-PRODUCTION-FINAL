/**
 * Per-screen error boundary — wrap the screen that can throw, never the Stack.
 * Unmounting the navigator on catch bricks Sanctuary until a process kill.
 * Triggers the global recovery overlay; renders a black placeholder locally.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View } from 'react-native'
import { captureException } from '@/src/services/sentry'
import { useAppCrashStore } from '@/hooks/useAppCrashStore'
import { getScreenCrashRecoveryRoute } from '@/utils/appErrorRecovery'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

class ScreenCrashBoundaryInner extends Component<Props, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(): Partial<State> {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        captureException(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            screenCrashBoundary: true,
        })
        useAppCrashStore.getState().show(getScreenCrashRecoveryRoute())
        if (__DEV__) {
            console.error('ScreenCrashBoundary caught an error:', error, errorInfo)
        }
    }

    render() {
        if (this.state.hasError) {
            return <View style={{ flex: 1, backgroundColor: '#000000' }} />
        }
        return this.props.children
    }
}

export function ScreenCrashBoundary({ children }: Props) {
    const resetKey = useAppCrashStore((s) => s.boundaryResetKey)
    return (
        <ScreenCrashBoundaryInner key={resetKey}>
            {children}
        </ScreenCrashBoundaryInner>
    )
}
