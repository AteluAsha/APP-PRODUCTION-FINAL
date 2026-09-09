import { router } from 'expo-router'
import type { AVPlaybackSource } from 'expo-av'
import {
    MUSIC_ROOM_TRACK_DEFS,
    type MusicRoomTrackDef,
} from '@/constants/musicRoomLibrary'
import {
    useCurrentAudioStore,
    type PlaylistItem,
    AUDIO_READY_DELAY_MS,
} from '@/hooks/useCurrentAudioStore'
import {
    getVaultDownloadSpeedBps,
    notifyRushedTrackPlaying,
    peekSanctuaryTrack,
    rushSanctuaryTrack,
} from '@/src/services/sanctuaryVaultDownloader'
import { peekPlayableVaultUri } from '@/src/utils/sanctuaryAudioVault'
import { toAbsoluteFileUri } from '@/src/utils/crystalBowlPlayback'
import { silenceAllAudio } from '@/src/utils/singleActiveSound'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { persistResumeBookmark } from '@/utils/audioBookmark'
import { allowsTrackQueue } from '@/utils/audioPlayMode'
import { sliderDurationMs } from '@/src/utils/playerControls'
import { useEmbodimentDurationCacheStore } from '@/hooks/useEmbodimentDurationCacheStore'
import { useDayAudioOpenedStore } from '@/hooks/useDayAudioOpenedStore'

export function musicRoomDefsToPlaylistItems(
    defs: MusicRoomTrackDef[] = MUSIC_ROOM_TRACK_DEFS,
): PlaylistItem[] {
    return defs.map((d) => ({
        source: { uri: '' },
        metadata: {
            title: d.title,
            author: d.author,
            durationMs: d.durationMs,
        },
        prefs: {
            shouldLoop: false,
            isIntroAudio: d.isIntroAudio,
        },
        trackKey: d.trackKey,
        audioId: d.audioId,
        dayIndex: d.dayIndex,
        trackKind: d.trackKind,
        chakraColor: d.chakraColor,
    }))
}

export async function resolveMusicRoomSource(
    audioId: string,
    durationMs: number,
): Promise<AVPlaybackSource | null> {
    const complete = await peekSanctuaryTrack(audioId)
    if (complete) {
        notifyRushedTrackPlaying(audioId)
        return { uri: toAbsoluteFileUri(complete) }
    }
    const speed = getVaultDownloadSpeedBps()
    const partial = await peekPlayableVaultUri(audioId, {
        downloadSpeedBps: speed,
        durationMs,
        userRushed: true,
    })
    if (partial) {
        rushSanctuaryTrack(audioId)
        return { uri: toAbsoluteFileUri(partial) }
    }
    rushSanctuaryTrack(audioId)
    return null
}

let musicRoomSwitchQueue: Promise<boolean> = Promise.resolve(true)
let musicRoomSwitchSeq = 0

function enqueueMusicRoomSwitch(work: () => Promise<boolean>): Promise<boolean> {
    const seq = ++musicRoomSwitchSeq
    const next = musicRoomSwitchQueue.then(async () => {
        if (seq !== musicRoomSwitchSeq) return false
        return work()
    })
    musicRoomSwitchQueue = next.catch(() => false)
    return next
}

/** Open Frequency of Gnosis player at a track in the 28-track library. */
export async function openMusicRoomAtIndex(startIndex: number): Promise<boolean> {
    const defs = MUSIC_ROOM_TRACK_DEFS
    if (startIndex < 0 || startIndex >= defs.length) return false
    const def = defs[startIndex]
    addHapticFeedback(HapticStrength.Light)
    useDayAudioOpenedStore.getState().markOpenedFromAudioId(def.audioId)
    const source = await resolveMusicRoomSource(def.audioId, def.durationMs)

    const items = musicRoomDefsToPlaylistItems(defs)
    await silenceAllAudio()
    const store = useCurrentAudioStore.getState()
    store.setPlayerReturnPath('/(chakras)/AudioLibrary')
    // Prevent MusicRoomAudioManager from starting during the push delay.
    store.setFullScreenPlayerMounted(true)
    store.setMusicRoomPlaylist(items, startIndex, source)

    setTimeout(() => {
        router.push('/AudioPlayer')
    }, AUDIO_READY_DELAY_MS)
    return true
}

/** Switch catalog index. Used only if playMode is ever set to 'queue'. */
export async function switchMusicRoomTrack(nextIndex: number): Promise<boolean> {
    return enqueueMusicRoomSwitch(async () => {
        const store = useCurrentAudioStore.getState()
        if (!allowsTrackQueue(store.playMode)) return false
        const playlist = store.musicRoomPlaylist
        if (!playlist || nextIndex < 0 || nextIndex >= playlist.length) {
            return false
        }
        const item = playlist[nextIndex]
        const audioId = item.audioId
        if (!audioId) return false
        useDayAudioOpenedStore.getState().markOpenedFromAudioId(audioId)

        const source = await resolveMusicRoomSource(
            audioId,
            item.metadata.durationMs,
        )
        if (!source) return false

        const onFullPlayer =
            store.isFullScreenPlayerMounted ||
            store.audioOrigin === 'music-room'

        if (onFullPlayer) {
            store.setFullScreenPlayerMounted(true)
        }

        await silenceAllAudio()
        store.applyMusicRoomTrack(nextIndex, source)
        addHapticFeedback(HapticStrength.Light)
        return true
    })
}

export async function musicRoomAdvanceNext(): Promise<boolean> {
    const store = useCurrentAudioStore.getState()
    if (!allowsTrackQueue(store.playMode)) return false
    const next = store.musicRoomIndex + 1
    if (!store.musicRoomPlaylist || next >= store.musicRoomPlaylist.length) {
        return false
    }
    return switchMusicRoomTrack(next)
}

export async function musicRoomAdvancePrevious(): Promise<boolean> {
    const store = useCurrentAudioStore.getState()
    if (!allowsTrackQueue(store.playMode)) return false
    const prev = store.musicRoomIndex - 1
    if (!store.musicRoomPlaylist || prev < 0) {
        return false
    }
    return switchMusicRoomTrack(prev)
}

let musicRoomClosing = false

export async function closeMusicRoomPlayer(options?: {
    navigate?: boolean
}): Promise<void> {
    if (musicRoomClosing) return
    musicRoomClosing = true
    musicRoomSwitchSeq += 1
    try {
        const store = useCurrentAudioStore.getState()
        const returnPath = store.playerReturnPath ?? '/(chakras)/AudioLibrary'
        const id =
            store.fullPlayerTrackId ??
            store.musicRoomPlaylist?.[store.musicRoomIndex]?.audioId
        if (allowsTrackQueue(store.playMode)) {
            const cached =
                id != null
                    ? (useEmbodimentDurationCacheStore
                          .getState()
                          .getDuration(id) ?? 0)
                    : 0
            await persistResumeBookmark(
                id,
                store.positionMs,
                sliderDurationMs(cached, store.metadata?.durationMs ?? 0),
            )
        }
        await silenceAllAudio()
        useCurrentAudioStore.getState().reset()
        useCurrentAudioStore.getState().setFullScreenPlayerMounted(false)
        if (options?.navigate === false) return
        if (router.canGoBack()) {
            router.back()
        } else {
            router.replace(returnPath as never)
        }
    } finally {
        musicRoomClosing = false
    }
}

export function getActiveMusicRoomTrack():
    | (PlaylistItem & { globalIndex: number })
    | null {
    const store = useCurrentAudioStore.getState()
    if (
        store.audioOrigin !== 'music-room' ||
        !store.musicRoomPlaylist ||
        store.musicRoomPlaylist.length === 0
    ) {
        return null
    }
    const item = store.musicRoomPlaylist[store.musicRoomIndex]
    if (!item) return null
    return { ...item, globalIndex: store.musicRoomIndex }
}

export function getMusicRoomActiveAudioId(): string | null {
    return getActiveMusicRoomTrack()?.audioId ?? null
}
