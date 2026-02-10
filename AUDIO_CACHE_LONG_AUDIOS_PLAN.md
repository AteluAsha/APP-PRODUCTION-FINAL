# Audio cache plan for long audios

## Current behavior

| Content            | Length   | Caching / playback |
|--------------------|----------|--------------------|
| **Crystal Bowl**   | ~1 hour  | Download to `FileSystem.cacheDirectory/audio/` first via `prepareCrystalBowlForPlay()`, then play from local file. No streaming. |
| **Embodiment**     | Long     | If already downloaded → use `localUri`. Otherwise **stream from Firebase URL** → can be choppy/glitchy. |
| **Tuning Fork**    | Short    | URL cached in AsyncStorage; stream from URL. Fine for short clips. |

So: **long embodiment (and any other long) tracks are streamed when not pre-downloaded**, which can cause the same playback issues Crystal Bowl had.

---

## Goal

Use the same pattern as Crystal Bowl for **all long audios**:  
**Download to local cache first when we only have a URL, then play from local file.**  
Optional: allow background pre-download so the first play is already from cache.

---

## Plan (implementation steps)

### 1. Reuse “prepare for play” for embodiment (and other long tracks)

- Add a small helper (or extend the Crystal Bowl idea) that:
  - **Input:** `{ url, localUri, audioId, fallback }` (same shape as `CrystalBowlSourceInput`).
  - **Logic:** If `localUri` exists → return `{ uri: localUri }`. If only `url` exists → call `downloadAndCacheAudio(url, audioId)`, then return `{ uri: localPath }`. On download error → optionally fall back to `{ uri: url }` (stream) or surface error.
- Use this in **AudioLibrary** (and anywhere else embodiment is played) **right before** building the playlist:
  - For single-file embodiment: call the helper with `url: embodiment.single`, `localUri: embodiment.localUri`, `audioId: getEmbodimentAudioId(chakra)`.
  - For Third Eye (two parts): call the helper once for part one and once for part two, with the corresponding URLs and `getEmbodimentAudioId(chakra, 'part1')` / `'part2'`.
- Pass the **returned** source (local URI) into the playlist instead of `embodimentPlaybackSource` / part URLs directly. That way long embodiment is always “download then play” when only a URL was available.

### 2. Optional: same pattern for any other long tracks

- If you have other long assets (e.g. more master meditations), use the same helper with their `audioId` and URL/localUri so they’re also download-then-play.

### 3. Keep existing cache utilities

- **audioCache.ts** – keep for **URL** caching (AsyncStorage). Reduces repeated Firebase URL fetches.
- **audioDownload.ts** – keep for **file** caching (`FileSystem.cacheDirectory/audio/`). This is what makes long-audio playback stable.
- **crystalBowlPlayback.ts** – keep; it’s the reference implementation. The new helper can live next to it (e.g. `prepareLongAudioForPlay`) and share `getLocalAudioUri` + `downloadAndCacheAudio`.

### 4. Optional: pre-download / cache management

- **Pre-download:** In Music Room (or a settings screen), “Download” can continue to call `downloadAndCacheAudio` so the file is ready before first play.
- **Cache policy:** If you need a cap (e.g. max size or LRU), add it in `audioDownload.ts` (e.g. list `FileSystem.cacheDirectory/audio/`, sort by date/size, delete oldest until under limit). Not required for correctness, only for storage control.

---

## Summary

- **Problem:** Long audios (embodiment, etc.) are streamed when not pre-downloaded → glitches.
- **Fix:** Use the same “prepare for play” pattern as Crystal Bowl: **download to local cache when only URL is available, then play from local file.**
- **Concrete steps:** Add a `prepareLongAudioForPlay`-style helper (same I/O as Crystal Bowl), call it in AudioLibrary for embodiment (single + Third Eye parts), and pass the returned source into the player. Keep URL cache and file cache as-is; optionally add pre-download and cache size policy later.
