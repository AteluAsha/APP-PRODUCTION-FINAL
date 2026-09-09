/**
 * HARD RULE: only one healing player may exist at a time, app-wide.
 *
 * Playback uses expo-audio (createAudioPlayer). expo-av cannot start an
 * Android 14 mediaPlayback foreground service, so lock-screen meditation
 * died after ~1–3 minutes. expo-audio 0.4 on SDK 53 still lacks
 * setActiveForLockScreen; MeditationPlaybackService fills that gap.
 *
 * Play Asset Delivery is not used. Compact bake-in is not used.
 */

import type { AudioPlayer, AudioSource, AudioStatus } from 'expo-audio'
import {
    Audio,
    AVPlaybackSource,
    AVPlaybackStatus,
    AVPlaybackStatusToSet,
    InterruptionModeAndroid,
    InterruptionModeIOS,
} from 'expo-av'
import {
    startMeditationPlaybackService,
    stopMeditationPlaybackService,
} from '@/modules/meditation-playback'

type ExpoAudioApi = {
    createAudioPlayer: (
        source?: AudioSource | string | number | null,
        updateInterval?: number,
    ) => AudioPlayer
    setAudioModeAsync: (mode: {
        playsInSilentMode?: boolean
        shouldPlayInBackground?: boolean
        interruptionMode?: 'mixWithOthers' | 'doNotMix' | 'duckOthers'
        interruptionModeAndroid?: 'doNotMix' | 'duckOthers'
        shouldRouteThroughEarpiece?: boolean
        allowsRecording?: boolean
    }) => Promise<void>
    setIsAudioActiveAsync: (active: boolean) => Promise<void>
}

function getExpoAudio(): ExpoAudioApi | null {
    try {
        return require('expo-audio') as ExpoAudioApi
    } catch {
        return null
    }
}

export type HealingLockScreen = {
    title: string
    artist?: string
}

export type HealingSound = {
    playAsync: () => Promise<void>
    pauseAsync: () => Promise<void>
    stopAsync: () => Promise<void>
    unloadAsync: () => Promise<void>
    setPositionAsync: (positionMs: number) => Promise<void>
    getStatusAsync: () => Promise<AVPlaybackStatus>
    setOnPlaybackStatusUpdate: (
        cb?: (status: AVPlaybackStatus) => void,
    ) => void
    setVolumeAsync: (volume: number) => Promise<void>
    setIsLoopingAsync: (loop: boolean) => Promise<void>
    setProgressUpdateIntervalAsync: (ms: number) => Promise<void>
}

let generation = 0
let activeSound: HealingSound | null = null
let activePlayer: AudioPlayer | null = null

export function getPlaybackGeneration(): number {
    return generation
}

export function invalidatePlayback(): number {
    generation += 1
    return generation
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function toAudioSource(source: AVPlaybackSource): AudioSource {
    if (typeof source === 'number') return source
    if (typeof source === 'object' && source !== null && 'uri' in source) {
        const uri = (source as { uri?: unknown }).uri
        if (typeof uri === 'string' && uri.trim()) {
            return { uri }
        }
    }
    return null
}

function toAvStatus(
    status: AudioStatus,
    uri: string,
    updateIntervalMs: number,
): AVPlaybackStatus {
    if (!status.isLoaded) {
        return { isLoaded: false }
    }
    return {
        isLoaded: true,
        uri,
        progressUpdateIntervalMillis: updateIntervalMs,
        durationMillis: Math.max(0, Math.round((status.duration || 0) * 1000)),
        positionMillis: Math.max(0, Math.round((status.currentTime || 0) * 1000)),
        shouldPlay: status.playing,
        isPlaying: status.playing,
        isBuffering: status.isBuffering,
        rate: status.playbackRate || 1,
        shouldCorrectPitch: status.shouldCorrectPitch,
        volume: 1,
        isMuted: status.mute,
        audioPan: 0,
        isLooping: status.loop,
        didJustFinish: status.didJustFinish,
    }
}

export async function configureHealingAudioMode(opts?: {
    background?: boolean
}): Promise<void> {
    const background = opts?.background !== false
    const expoAudio = getExpoAudio()
    if (expoAudio) {
        try {
            await expoAudio.setAudioModeAsync({
                playsInSilentMode: true,
                shouldPlayInBackground: background,
                interruptionMode: background ? 'doNotMix' : 'mixWithOthers',
                interruptionModeAndroid: background ? 'doNotMix' : 'duckOthers',
                shouldRouteThroughEarpiece: false,
                allowsRecording: false,
            })
        } catch {
            // Native module missing until a rebuild
        }
    }
    try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: background,
            interruptionModeIOS: background
                ? InterruptionModeIOS.DoNotMix
                : InterruptionModeIOS.MixWithOthers,
            interruptionModeAndroid: background
                ? InterruptionModeAndroid.DoNotMix
                : InterruptionModeAndroid.DuckOthers,
            shouldDuckAndroid: !background,
            playThroughEarpieceAndroid: false,
        })
    } catch {
        // expo-av still used for Anua TTS / recording
    }
}

async function unloadQuietly(sound: HealingSound | null): Promise<void> {
    if (!sound) return
    try {
        await sound.stopAsync()
    } catch {
        // already stopped
    }
    try {
        await sound.unloadAsync()
    } catch {
        // already unloaded
    }
}

/**
 * Stop every healing player we know about. Close of AudioPlayer must
 * always reach here: persist the bookmark first, then this, then reset.
 * Never time out and leave ExoPlayer / the Android FGS running.
 */
export async function silenceAllAudio(): Promise<void> {
    invalidatePlayback()
    const sound = activeSound
    const player = activePlayer
    activeSound = null
    activePlayer = null
    try {
        const { otherOriginTrackRef } = require('@/src/services/otherOriginTrackRef') as {
            otherOriginTrackRef: { current: { sound: HealingSound } | null }
        }
        otherOriginTrackRef.current = null
    } catch {
        // ignore
    }
    stopMeditationPlaybackService()
    try {
        player?.pause()
    } catch {
        // already paused / released
    }
    try {
        player?.remove()
    } catch {
        // already released
    }
    try {
        const expoAudio = getExpoAudio()
        await expoAudio?.setIsAudioActiveAsync(false)
    } catch {
        // ignore
    }
    await unloadQuietly(sound)
    try {
        await Audio.setIsEnabledAsync(false)
    } catch {
        // ignore
    }
    try {
        await Audio.setIsEnabledAsync(true)
    } catch {
        // ignore
    }
    try {
        const expoAudio = getExpoAudio()
        await expoAudio?.setIsAudioActiveAsync(true)
    } catch {
        // ignore
    }
}

export async function createExclusiveSound(
    source: AVPlaybackSource,
    initialStatus: AVPlaybackStatusToSet,
    onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void,
    options?: {
        keepPlayingInBackground?: boolean
        lockScreen?: HealingLockScreen
    },
): Promise<HealingSound | null> {
    const myGen = invalidatePlayback()
    const previous = activeSound
    activeSound = null
    activePlayer = null
    await unloadQuietly(previous)
    if (myGen !== generation) return null

    const keepPlayingInBackground = options?.keepPlayingInBackground !== false
    await configureHealingAudioMode({ background: keepPlayingInBackground })

    const expoAudio = getExpoAudio()
    if (!expoAudio) {
        return createExclusiveSoundViaAv(
            source,
            initialStatus,
            onPlaybackStatusUpdate,
            options,
            myGen,
            keepPlayingInBackground,
        )
    }

    const audioSource = toAudioSource(source)
    const uri =
        typeof source === 'object' && source !== null && 'uri' in source
            ? String((source as { uri?: string }).uri ?? '')
            : ''
    const updateIntervalMs = 250
    let player: AudioPlayer
    try {
        player = expoAudio.createAudioPlayer(audioSource, updateIntervalMs)
    } catch {
        return createExclusiveSoundViaAv(
            source,
            initialStatus,
            onPlaybackStatusUpdate,
            options,
            myGen,
            keepPlayingInBackground,
        )
    }
    if (myGen !== generation) {
        try {
            player.remove()
        } catch {
            // ignore
        }
        return null
    }

    activePlayer = player
    player.loop = !!initialStatus.isLooping
    if (typeof initialStatus.volume === 'number') {
        player.volume = initialStatus.volume
    }

    let statusCallback = onPlaybackStatusUpdate
    const subscription = player.addListener(
        'playbackStatusUpdate',
        (status: AudioStatus) => {
            statusCallback?.(toAvStatus(status, uri, updateIntervalMs))
        },
    )

    const lockScreen = options?.lockScreen
    let released = false

    const sound: HealingSound = {
        playAsync: async () => {
            if (keepPlayingInBackground) {
                await startMeditationPlaybackService(
                    lockScreen?.title ?? 'Awakening Soul',
                    lockScreen?.artist,
                )
            }
            player.play()
        },
        pauseAsync: async () => {
            player.pause()
            if (keepPlayingInBackground) {
                stopMeditationPlaybackService()
            }
        },
        stopAsync: async () => {
            player.pause()
        },
        unloadAsync: async () => {
            if (released) return
            released = true
            try {
                subscription.remove()
            } catch {
                // ignore
            }
            try {
                player.pause()
            } catch {
                // ignore
            }
            try {
                player.remove()
            } catch {
                // ignore
            }
            if (activePlayer === player) {
                activePlayer = null
            }
            if (activeSound === sound) {
                activeSound = null
            }
            if (keepPlayingInBackground) {
                stopMeditationPlaybackService()
            }
        },
        setPositionAsync: async (positionMs: number) => {
            const seconds = Math.max(0, positionMs) / 1000
            const verifyLanded = async (): Promise<boolean> => {
                const deadline = Date.now() + 2200
                while (Date.now() < deadline) {
                    const now = player.currentTime || 0
                    if (Math.abs(now - seconds) <= 2.5) return true
                    await sleep(50)
                }
                return Math.abs((player.currentTime || 0) - seconds) <= 2.5
            }

            await player.seekTo(seconds)
            if (await verifyLanded()) return

            const wasPlaying = player.playing
            if (wasPlaying) {
                player.pause()
                await sleep(80)
            }
            await player.seekTo(seconds)
            if (!(await verifyLanded())) {
                await player.seekTo(seconds)
                await sleep(120)
            }
            if (wasPlaying) {
                player.play()
            }
        },
        getStatusAsync: async () => {
            const current = player.currentStatus
            if (!current) return { isLoaded: false }
            return toAvStatus(current, uri, updateIntervalMs)
        },
        setOnPlaybackStatusUpdate: (cb) => {
            statusCallback = cb
        },
        setVolumeAsync: async (volume: number) => {
            player.volume = volume
        },
        setIsLoopingAsync: async (loop: boolean) => {
            player.loop = loop
        },
        setProgressUpdateIntervalAsync: async () => {
            // Interval is fixed at createAudioPlayer construction.
        },
    }

    if (myGen !== generation) {
        await sound.unloadAsync()
        return null
    }

    activeSound = sound

    if (initialStatus.shouldPlay) {
        await sound.playAsync()
    }

    return sound
}

async function wrapAvSound(
    av: Audio.Sound,
    options?: {
        keepPlayingInBackground?: boolean
        lockScreen?: HealingLockScreen
    },
): Promise<HealingSound> {
    const keepPlayingInBackground = options?.keepPlayingInBackground !== false
    const lockScreen = options?.lockScreen
    const sound: HealingSound = {
        playAsync: async () => {
            if (keepPlayingInBackground) {
                await startMeditationPlaybackService(
                    lockScreen?.title ?? 'Awakening Soul',
                    lockScreen?.artist,
                )
            }
            await av.playAsync()
        },
        pauseAsync: async () => {
            await av.pauseAsync()
            if (keepPlayingInBackground) {
                stopMeditationPlaybackService()
            }
        },
        stopAsync: async () => {
            await av.stopAsync()
        },
        unloadAsync: async () => {
            try {
                await av.unloadAsync()
            } catch {
                // ignore
            }
            if (keepPlayingInBackground) {
                stopMeditationPlaybackService()
            }
        },
        setPositionAsync: async (positionMs: number) => {
            await av.setPositionAsync(positionMs)
        },
        getStatusAsync: () => av.getStatusAsync(),
        setOnPlaybackStatusUpdate: (cb) => {
            av.setOnPlaybackStatusUpdate(cb)
        },
        setVolumeAsync: async (volume: number) => {
            await av.setVolumeAsync(volume)
        },
        setIsLoopingAsync: async (loop: boolean) => {
            await av.setIsLoopingAsync(loop)
        },
        setProgressUpdateIntervalAsync: async (ms: number) => {
            await av.setProgressUpdateIntervalAsync(ms)
        },
    }
    return sound
}

async function createExclusiveSoundViaAv(
    source: AVPlaybackSource,
    initialStatus: AVPlaybackStatusToSet,
    onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | undefined,
    options:
        | {
              keepPlayingInBackground?: boolean
              lockScreen?: HealingLockScreen
          }
        | undefined,
    myGen: number,
    _keepPlayingInBackground: boolean,
): Promise<HealingSound | null> {
    const { sound: av } = await Audio.Sound.createAsync(
        source,
        initialStatus,
        onPlaybackStatusUpdate,
    )
    if (myGen !== generation) {
        try {
            await av.unloadAsync()
        } catch {
            // ignore
        }
        return null
    }
    const sound = await wrapAvSound(av, options)
    if (myGen !== generation) {
        await sound.unloadAsync()
        return null
    }
    activeSound = sound
    if (initialStatus.shouldPlay) {
        await sound.playAsync()
    }
    return sound
}

export function isActiveSound(sound: HealingSound | null | undefined): boolean {
    return !!sound && sound === activeSound
}

export async function releaseActiveSound(
    sound: HealingSound | null | undefined,
): Promise<void> {
    if (!sound) return
    if (activeSound === sound) {
        activeSound = null
    }
    await unloadQuietly(sound)
}
