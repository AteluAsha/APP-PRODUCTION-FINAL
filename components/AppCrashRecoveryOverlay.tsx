/**
 * Global crash recovery overlay — sibling to Stack, never unmounts the navigator.
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { BackHandler, Platform, Pressable, View } from 'react-native'
import { AppText } from '@/components/AppText'
import { useAppCrashStore } from '@/hooks/useAppCrashStore'
import {
    getRecoveryDestinationLabel,
    recoverFromAppError,
} from '@/utils/appErrorRecovery'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'

const AUTO_RECOVER_MS = 2800

export function AppCrashRecoveryOverlay() {
    const visible = useAppCrashStore((s) => s.visible)
    const recoveryRoute = useAppCrashStore((s) => s.recoveryRoute)
    const hide = useAppCrashStore((s) => s.hide)
    const bumpBoundaryResetKey = useAppCrashStore((s) => s.bumpBoundaryResetKey)
    const recoveringRef = useRef(false)
    const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [isRecovering, setIsRecovering] = React.useState(false)

    const runRecovery = useCallback(async () => {
        if (recoveringRef.current) return
        recoveringRef.current = true
        setIsRecovering(true)
        if (autoTimerRef.current) {
            clearTimeout(autoTimerRef.current)
            autoTimerRef.current = null
        }

        try {
            await recoverFromAppError()
        } catch {
            // still dismiss overlay
        }

        hide()
        bumpBoundaryResetKey()
        recoveringRef.current = false
        setIsRecovering(false)
    }, [hide, bumpBoundaryResetKey])

    useEffect(() => {
        if (!visible) {
            if (autoTimerRef.current) {
                clearTimeout(autoTimerRef.current)
                autoTimerRef.current = null
            }
            return
        }

        autoTimerRef.current = setTimeout(() => {
            void runRecovery()
        }, AUTO_RECOVER_MS)

        return () => {
            if (autoTimerRef.current) {
                clearTimeout(autoTimerRef.current)
                autoTimerRef.current = null
            }
        }
    }, [visible, runRecovery])

    useEffect(() => {
        if (!visible || Platform.OS !== 'android') return
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            void runRecovery()
            return true
        })
        return () => sub.remove()
    }, [visible, runRecovery])

    if (!visible) return null

    const buttonLabel = getRecoveryDestinationLabel(recoveryRoute)

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                elevation: 99999,
                backgroundColor: '#000000',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 32,
            }}
            pointerEvents="auto"
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    marginBottom: 28,
                }}
            >
                <AppText
                    font="cormorant-italic"
                    style={{
                        color: 'rgba(212, 165, 116, 0.8)',
                        fontSize: 24,
                    }}
                >
                    α
                </AppText>
                <AppText
                    font="cormorant-italic"
                    style={{
                        color: 'rgba(212, 165, 116, 0.5)',
                        fontSize: 16,
                    }}
                >
                    ✧
                </AppText>
                <AppText
                    font="cormorant-italic"
                    style={{
                        color: 'rgba(212, 165, 116, 0.8)',
                        fontSize: 24,
                    }}
                >
                    Ω
                </AppText>
            </View>

            <AppText
                font="cormorant-italic"
                style={{
                    color: 'rgba(255, 255, 255, 0.72)',
                    fontSize: 18,
                    textAlign: 'center',
                    marginBottom: 32,
                    lineHeight: 26,
                }}
            >
                {isRecovering
                    ? 'Returning you to a safe place…'
                    : 'Something interrupted your practice. You can return home without restarting.'}
            </AppText>

            <Pressable
                onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    void runRecovery()
                }}
                disabled={isRecovering}
                style={{
                    paddingVertical: 14,
                    paddingHorizontal: 28,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(212, 165, 116, 0.45)',
                    backgroundColor: 'rgba(212, 165, 116, 0.12)',
                    opacity: isRecovering ? 0.6 : 1,
                }}
                accessibilityRole="button"
                accessibilityLabel={buttonLabel}
            >
                <AppText
                    font="instrument-regular"
                    style={{
                        color: 'rgba(212, 165, 116, 0.95)',
                        fontSize: 16,
                    }}
                >
                    {isRecovering ? 'Returning…' : buttonLabel}
                </AppText>
            </Pressable>
        </View>
    )
}
