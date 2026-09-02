/**
 * Sanctuary audio – permanent documentDirectory vault.
 *
 * Play Asset Delivery / ODR are gone. Files live in
 * FileSystem.documentDirectory/sanctuary-audio/ and are never deleted.
 * Missing files are filled by the silent Day 1 → Day 7 downloader.
 */

import {
    ensureSanctuaryTrack,
    peekSanctuaryTrack,
} from '@/src/services/sanctuaryVaultDownloader'
import { getSanctuaryVaultTrackByFilename } from '@/constants/sanctuaryVaultTracks'

export function usesBundledSanctuaryAudio(): boolean {
    return true
}

/** @deprecated use usesBundledSanctuaryAudio */
export const usesBundledEmbodimentAudio = usesBundledSanctuaryAudio

export function sanctuaryPackUnavailableMessage(detail?: string): string {
    return detail ?? 'Preparing audio…'
}

/** No error dialog. Playback waits on the vault spinner instead. */
export function alertSanctuaryLocalUnavailable(detail?: string): void {
    console.warn('[sanctuaryVault] still downloading', detail ?? '')
}

export async function loadBundledAssetUri(
    filename: string,
    _dropDir?: string,
): Promise<string> {
    const track = getSanctuaryVaultTrackByFilename(filename)
    return ensureSanctuaryTrack(track?.audioId ?? filename)
}

export async function loadBundledAssetUriOrNull(
    filename: string,
    _dropDir?: string,
): Promise<string | null> {
    const track = getSanctuaryVaultTrackByFilename(filename)
    return peekSanctuaryTrack(track?.audioId ?? filename)
}

export function loadEmbodimentDropUri(filename: string): Promise<string> {
    return loadBundledAssetUri(filename)
}

export function loadCrystalBowlDropUri(filename: string): Promise<string> {
    return loadBundledAssetUri(filename)
}

export function loadHeadToHeartDropUri(filename: string): Promise<string> {
    return loadBundledAssetUri(filename)
}

export function loadTuningForkDropUri(filename: string): Promise<string> {
    return loadBundledAssetUri(filename)
}

export function loadEmbodimentDropUriOrNull(
    filename: string,
): Promise<string | null> {
    return loadBundledAssetUriOrNull(filename)
}

export function loadCrystalBowlDropUriOrNull(
    filename: string,
): Promise<string | null> {
    return loadBundledAssetUriOrNull(filename)
}

export function loadHeadToHeartDropUriOrNull(
    filename: string,
): Promise<string | null> {
    return loadBundledAssetUriOrNull(filename)
}

export function loadTuningForkDropUriOrNull(
    filename: string,
): Promise<string | null> {
    return loadBundledAssetUriOrNull(filename)
}
