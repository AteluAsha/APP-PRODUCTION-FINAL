/**
 * Download icon cell – Audio Library + course-aligned vault progress ring.
 * Shows live % while downloading; green check when vaulted.
 */

import React from 'react'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '@/components/AppText'
import { AUDIO_READY_RIM } from '@/constants/audioUi'

export type DownloadIconVariant = 'cloud' | 'downloading' | 'queued' | 'downloaded'

const CELL_WIDTH = 60
const CELL_HEIGHT = 44
const ICON_SIZE = 20
const CHECKMARK_SIZE = 21
const COMPACT = 0.8

export interface DownloadIconCellProps {
    variant: DownloadIconVariant
    onPress?: () => void
    disabled?: boolean
    compact?: boolean
    /** Live vault percent — same tracker as course day rows. */
    downloadPercent?: number | null
}

function VaultProgressRing({
    percent,
    compact,
}: {
    percent: number | null | undefined
    compact: boolean
}) {
    const size = compact ? 26 : 32
    const clamped =
        percent != null ? Math.min(100, Math.max(0, Math.round(percent))) : null

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 2,
                borderColor:
                    clamped != null && clamped >= 97
                        ? AUDIO_READY_RIM
                        : 'rgba(255,255,255,0.35)',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.25)',
            }}
        >
            {clamped != null ? (
                <AppText
                    font="instrument-regular"
                    style={{
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: compact ? 9 : 10,
                    }}
                >
                    {clamped}%
                </AppText>
            ) : (
                <ActivityIndicator size="small" color="#ffffff" />
            )}
        </View>
    )
}

export function DownloadIconCell({
    variant,
    onPress,
    disabled = false,
    compact = false,
    downloadPercent = null,
}: DownloadIconCellProps) {
    const w = compact ? Math.round(CELL_WIDTH * COMPACT) : CELL_WIDTH
    const h = compact ? Math.round(CELL_HEIGHT * COMPACT) : CELL_HEIGHT
    const iconSize = compact ? Math.round(ICON_SIZE * COMPACT) : ICON_SIZE
    const checkSize = compact ? Math.round(CHECKMARK_SIZE * COMPACT) : CHECKMARK_SIZE

    const content = (
        <View
            style={{
                width: w,
                height: h,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {variant === 'downloading' ? (
                <>
                    <VaultProgressRing percent={downloadPercent} compact={compact} />
                    <AppText
                        font="instrument-regular"
                        size="xs"
                        style={[
                            {
                                color: 'rgba(255,255,255,0.95)',
                                marginTop: compact ? 1 : 2,
                            },
                            compact && { fontSize: 10 },
                        ]}
                    >
                        {downloadPercent != null
                            ? `${Math.round(downloadPercent)}%`
                            : 'Saving…'}
                    </AppText>
                </>
            ) : variant === 'queued' ? (
                <>
                    <Ionicons name="time-outline" size={iconSize} color="#ffffff" />
                    <AppText
                        font="instrument-regular"
                        size="xs"
                        style={[
                            {
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: compact ? 1 : 2,
                            },
                            compact && { fontSize: 10 },
                        ]}
                    >
                        Queued
                    </AppText>
                </>
            ) : variant === 'downloaded' ? (
                <Ionicons name="checkmark-circle" size={checkSize} color="#87AE73" />
            ) : (
                <Ionicons
                    name="cloud-download-outline"
                    size={iconSize}
                    color="#ffffff"
                />
            )}
        </View>
    )

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={{
                    opacity: disabled && variant !== 'downloaded' ? 0.6 : 1,
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
                {content}
            </Pressable>
        )
    }
    return content
}
