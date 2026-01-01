/**
 * Error Boundary Component
 *
 * Catches React component errors and reports them to Sentry.
 * Provides a user-friendly error screen instead of a white screen of death.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { AppText } from './AppText'
import { Ionicons } from '@expo/vector-icons'
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
        // Log error to Sentry
        captureException(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        })

        this.setState({
            error,
            errorInfo,
        })

        // Log to console in development
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
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="alert-circle" size={64} color="#ef4444" style={{ marginBottom: 20 }} />
                        <AppText font="instrument-bold" size="xl" className="text-white text-center mb-4">
                            Something went wrong
                        </AppText>
                        <AppText font="instrument-regular" size="base" className="text-gray-400 text-center mb-6">
                            We're sorry for the inconvenience. The error has been reported and we'll look into it.
                        </AppText>
                        
                        {__DEV__ && this.state.error && (
                            <View style={{ backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 20, width: '100%' }}>
                                <AppText font="fira-code" size="sm" className="text-red-400 mb-2">
                                    {this.state.error.toString()}
                                </AppText>
                                {this.state.errorInfo?.componentStack && (
                                    <AppText font="fira-code" size="xs" className="text-gray-500">
                                        {this.state.errorInfo.componentStack}
                                    </AppText>
                                )}
                            </View>
                        )}

                        <Pressable
                            onPress={this.handleReset}
                            style={{
                                backgroundColor: '#9333ea',
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 8,
                            }}
                        >
                            <AppText font="instrument-medium" size="base" className="text-white">
                                Try Again
                            </AppText>
                        </Pressable>
                    </ScrollView>
                </View>
            )
        }

        return this.props.children
    }
}

