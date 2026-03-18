/**
 * Error Boundary Component
 *
 * Catches React component errors and reports them to Sentry.
 * Provides a user-friendly error screen instead of a white screen of death.
 */

import React, { Component, ErrorInfo, ReactNode } from "react"
import { View } from "react-native"
import { AppText } from "./AppText"
import { captureException } from "@/src/services/sentry"

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
      console.error("ErrorBoundary caught an error:", error, errorInfo)
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

      // Default error UI: black screen with small gold α and Ω only (ChakraHub style)
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#000000",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <AppText
              font="cormorant-italic"
              style={{
                color: "rgba(212, 165, 116, 0.8)",
                fontSize: 24,
              }}
            >
              α
            </AppText>
            <AppText
              font="cormorant-italic"
              style={{
                color: "rgba(212, 165, 116, 0.5)",
                fontSize: 16,
              }}
            >
              ✧
            </AppText>
            <AppText
              font="cormorant-italic"
              style={{
                color: "rgba(212, 165, 116, 0.8)",
                fontSize: 24,
              }}
            >
              Ω
            </AppText>
          </View>
        </View>
      )
    }

    return this.props.children
  }
}
