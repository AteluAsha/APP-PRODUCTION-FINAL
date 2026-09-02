/**
 * Error Boundary Component
 *
 * Local fallback for modals and dev tools. Screen-level crashes use
 * ScreenCrashBoundary + AppCrashRecoveryOverlay so the navigator stays mounted.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View } from 'react-native'
import { AppText } from './AppText'
import { captureException } from '@/src/services/sentry'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        captureException(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        })

        this.setState({
            error,
            errorInfo,
        })

        if (__DEV__) {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#000000',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <AppText
                        font="cormorant-italic"
                        style={{
                            color: 'rgba(212, 165, 116, 0.8)',
                            fontSize: 18,
                        }}
                    >
                        Something went wrong
                    </AppText>
                </View>
            )
        }

        return this.props.children
    }
}
