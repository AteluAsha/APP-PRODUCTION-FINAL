/**
 * Inline tuning-fork chime. No slider: tap plays from the start, tap again
 * unloads (does not resume mid-tone). Shared by Drop In and Sound Bath so
 * the two course chimes cannot drift.
 *
 * One-audio rule: persists the full-player bookmark, then resets the store
 * before play so other managers unload; stops when the full player / library
 * takes the store.
 * Sleep/lock keeps playing. Real navigation unloads.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import {
    createSoundAsyncOffUiThread,
    waitForSoundLoaded,
} from '@/src/utils/audioStreamInit'
import { toAbsoluteFileUri } from '@/src/utils/crystalBowlPlayback'
import type { HealingSound } from '@/src/utils/singleActiveSound'
import {
    peekSanctuaryTrack,
    rushSanctuaryTrack,
} from '@/src/services/sanctuaryVaultDownloader'
import { showHealingToast } from '@/utils/healingToast'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { saveAudioBookmark } from '@/utils/audioBookmark'
import { registerAndroidBackCleanup } from '@/utils/androidBackCleanup'

const DEFAULT_UNLOAD_WAIT_MS = 200
const LEAVE_UNLOAD_DELAY_MS = 150

export function useInlineTuningFork(opts: {
    audioId?: string
    audioUri?: string | null
    lockScreenTitle?: string
    disabled?: boolean
    /** Wait after store reset so other managers unload. */
    unloadWaitMs?: number
    /** Unload when this screen blurs. Lock/sleep stays playing. */
    stopOnBlur?: boolean
}) {
    const {
        audioId,
        audioUri,
        lockScreenTitle = 'Tuning Fork',
        disabled,
        unloadWaitMs = DEFAULT_UNLOAD_WAIT_MS,
        stopOnBlur = false,
    } = opts

    const [isPlaying, setIsPlaying] = useState(false)
    const [isPreparing, setIsPreparing] = useState(false)
    const soundRef = useRef<HealingSound | null>(null)
    const mountedRef = useRef(true)
    const source = useCurrentAudioStore((s) => s.source)
    const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)

    const stop = useCallback(async () => {
        const s = soundRef.current
        if (s) {
            try {
                await s.stopAsync()
                await s.unloadAsync()
            } catch {
                // already stopped
            }
            soundRef.current = null
        }
        if (mountedRef.current) {
            setIsPlaying(false)
        }
    }, [])

    const unloadIfForegroundLeave = useCallback(() => {
        const snapshot = AppState.currentState
        const s = soundRef.current
        if (!s) return
        setTimeout(() => {
            if (snapshot !== 'active' || AppState.currentState !== 'active') {
                return
            }
            if (soundRef.current !== s) return
            void s
                .stopAsync()
                .then(() => s.unloadAsync().catch(() => {}))
                .catch(() => {})
            soundRef.current = null
            // Never setState here — Android back may have already unmounted.
        }, LEAVE_UNLOAD_DELAY_MS)
    }, [])

    const toggle = useCallback(async () => {
        if (disabled || isPreparing) return
        addHapticFeedback(HapticStrength.Light)

        if (useCurrentAudioStore.getState().isPlaying) {
            useCurrentAudioStore.getState().setPlaying(false)
        }

        // No slider: pause/play must restart the chime from 0, not resume mid-tone.
        if (soundRef.current || isPlaying) {
            await stop()
            return
        }

        setIsPreparing(true)
        try {
            const audioStore = useCurrentAudioStore.getState()
            if (audioStore.fullPlayerTrackId) {
                await saveAudioBookmark(
                    audioStore.fullPlayerTrackId,
                    audioStore.positionMs,
                )
            }
            audioStore.reset()
            if (unloadWaitMs > 0) {
                await new Promise((r) => setTimeout(r, unloadWaitMs))
            }
            let playUri = audioUri ?? null
            if (audioId) {
                playUri = await peekSanctuaryTrack(audioId)
                if (!playUri) {
                    showHealingToast('gatheringPresence')
                    rushSanctuaryTrack(audioId)
                    return
                }
            }
            if (!playUri) return

            const sound = await createSoundAsyncOffUiThread(
                { uri: toAbsoluteFileUri(playUri) },
                {
                    initialStatus: {
                        shouldPlay: false,
                    },
                    keepPlayingInBackground: true,
                    lockScreen: {
                        title: lockScreenTitle,
                        artist: 'Sound Healing',
                    },
                },
            )
            await waitForSoundLoaded(sound)
            await sound.setVolumeAsync(1)
            sound.setOnPlaybackStatusUpdate((status) => {
                if (!status.isLoaded || !mountedRef.current) return
                if (status.didJustFinish && !status.isLooping) {
                    void stop()
                }
            })
            soundRef.current = sound
            await sound.playAsync()
            if (mountedRef.current) setIsPlaying(true)
        } catch (error) {
            console.warn('[InlineTuningFork] play failed', error)
            if (mountedRef.current) setIsPlaying(false)
        } finally {
            if (mountedRef.current) setIsPreparing(false)
        }
    }, [
        audioId,
        audioUri,
        disabled,
        isPlaying,
        isPreparing,
        lockScreenTitle,
        stop,
        unloadWaitMs,
    ])

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
            unloadIfForegroundLeave()
        }
    }, [unloadIfForegroundLeave])

    useEffect(() => {
        return registerAndroidBackCleanup(() => {
            void stop()
        })
    }, [stop])

    useEffect(() => {
        if (source != null || audioOrigin != null) {
            void stop()
        }
    }, [source, audioOrigin, stop])

    const audioIdRef = useRef(audioId)
    useEffect(() => {
        if (audioIdRef.current === audioId) return
        audioIdRef.current = audioId
        void stop()
    }, [audioId, stop])

    useFocusEffect(
        useCallback(() => {
            if (!stopOnBlur) return undefined
            return () => {
                // stop() clears isPlaying if still mounted; skips setState if unmounting
                void stop()
            }
        }, [stopOnBlur, stop]),
    )

    return {
        isPlaying,
        isPreparing,
        toggle,
        stop,
    }
}
