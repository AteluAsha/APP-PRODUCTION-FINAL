# Audio cache & download strategy – App Store best practices

## Does “download ALL audio on first open” solve everything?

**Short answer:** It would fix playback glitches and give full offline, but **doing it on first open is a bad default** for the App Store and UX.

- **Storage:** 7 chakras × (Crystal Bowl ~1hr + Tuning Fork short + Embodiment long) ≈ 20+ files, likely **hundreds of MB**. Forcing that on first launch can fill storage and surprise users.
- **Data:** Large automatic download on first open may run on cellular; Apple expects apps to be careful with user data and to offer controls (e.g. Wi‑Fi only).
- **First launch:** Blocking or long “Preparing…” on first open hurts first impression and can increase uninstalls.
- **Guidelines:** Apple expects user consent for large downloads and clear value (e.g. “Download for offline”) rather than mandatory bulk download as soon as the app opens.

**Better approach:** Cache **everything we download**, and use a mix of **download-on-first-play** + optional **“Download all for offline”** so that over time (or in one explicit step) all content lives on the device without a heavy, mandatory first-open download.

---

## Goals

1. **App Store friendly:** No mandatory huge download on first open; user control over large downloads; Wi‑Fi-only option; clear storage/cache management.
2. **Auto-cache all content after download:** Every download (on first play or via “Download” button) writes to device; playback always uses cache when available.
3. **Smooth playback:** All long audio (Crystal Bowl, Embodiment) plays from local file after download—no streaming glitches.
4. **Optional “all on device”:** Provide an explicit “Download all for offline” flow with progress and Wi‑Fi-only, so users can get everything on the phone when they choose.

---

## Content inventory (what we cache)

| Type         | Count | Approx size        | Notes                                        |
| ------------ | ----- | ------------------ | -------------------------------------------- |
| Crystal Bowl | 7     | Large (~1 hr each) | Already download-then-play.                  |
| Tuning Fork  | 7     | Small              | Short clips; cache when played or preloaded. |
| Embodiment   | 8     | Large              | 7 single + 2 for Third Eye.                  |

All use the same cache: `FileSystem.cacheDirectory/audio/` with stable `audioId`s. URL cache (AsyncStorage) stays for Firebase URLs to avoid repeated metadata calls.

---

## Plan (implementation)

### Phase 1: Auto-cache and play from cache everywhere

1. **Ensure every download writes to the same cache**
   - All playback and “Download” flows use `downloadAndCacheAudio(audioUrl, audioId)` and `getLocalAudioUri(audioId)` from `src/utils/audioDownload.ts`. No separate or duplicate cache paths.

2. **Long audio: always “prepare then play” (no streaming when we can avoid it)**
   - Add a shared helper (e.g. `prepareLongAudioForPlay`) with same contract as Crystal Bowl: `{ url, localUri, audioId, fallback }` → if local use it, else download then return local URI (fallback to stream only on error).
   - Use it for **Embodiment** in AudioLibrary (and anywhere else long embodiment is played): single-file chakras and Third Eye part one + part two. So every long track is “download once, then always play from cache.”
   - Crystal Bowl already uses this pattern via `prepareCrystalBowlForPlay`; keep as-is.

3. **Short audio (Tuning Fork)**
   - Option A: Keep current behavior (stream from URL; URL cached in AsyncStorage). Fine for short clips.
   - Option B: Also run through a “prepare then play” helper so Tuning Fork files are written to the same `audio/` cache when first played. Then “Download all” can include them and playback is consistent.

4. **Result**
   - After any track is played (or explicitly downloaded), it is **auto-cached**. Next time we use the cached file. No special “auto-cache after download” logic beyond “we always write to cache when we download and always prefer localUri when present.”

### Phase 2: Optional “Download all for offline” (App Store best practice)

1. **Where**
   - Music Room (Audio Library) and/or a Settings/Storage screen. Only show for users with access to full library (e.g. lifetime).

2. **Behavior**
   - One clear action: “Download all audio for offline” (or “Save all for offline”).
   - On tap:
     - If “Wi‑Fi only” is on and network is cellular, show message: “Download only on Wi‑Fi is on. Connect to Wi‑Fi or allow in Settings.”
     - Otherwise start a background job that downloads all known tracks (Crystal Bowl ×7, Tuning Fork ×7, Embodiment ×8) using existing `downloadAndCacheAudio` and stable `audioId`s.
   - **Progress:** Show a modal or inline progress (e.g. “Downloading 3 of 22…”) and allow cancel. Persist “last download run” so we can show “Already downloaded” or “Update” if you later add versioning.

3. **Wi‑Fi only**
   - Store a preference (e.g. in MMKV or AsyncStorage): `downloadAllWifiOnly: boolean`. Honor it before starting “Download all.” Expose in Settings or in the same screen as the button (“Download over Wi‑Fi only” toggle).

4. **Result**
   - User can get **all** content on the phone in one explicit, controlled step. No surprise data or storage use on first open.

### Phase 3: Optional “preload today’s chakra” (light first-open improvement)

1. **When**
   - After first paint (e.g. after splash/reveal), and only when the user has access to sound content (e.g. not before onboarding). Optionally only for “current day” in the 7-day journey.

2. **What**
   - Pre-download only the **current day’s** tracks: one Tuning Fork, one Crystal Bowl, one Embodiment (or two for Third Eye). That’s 3–4 files instead of 22.

3. **How**
   - Use same `downloadAndCacheAudio` and known `audioId`s. Run in background (don’t block UI). Optionally respect “Wi‑Fi only” for this as well.
   - If a URL isn’t available yet (e.g. Firebase not ready), skip that file; next time user opens that chakra we’ll still download on first play.

4. **Result**
   - First day’s playback is often already cached without a full “download all on first open.”

### Phase 4: Storage and cache management (App Store friendly)

1. **Show cache size**
   - In Settings or Music Room: “Audio cache: 245 MB” (compute by listing `FileSystem.cacheDirectory/audio/` and summing file sizes). Helps users understand storage.

2. **Clear cache**
   - “Clear audio cache” button that calls existing `clearAllCachedAudio()` (or a variant that only clears audio under `audio/`). Confirm dialog: “This will remove downloaded audio. You can re-download from the Music Room.” After clear, next play will re-download and auto-cache again.

3. **Result**
   - Transparent storage use and user control, which aligns with App Store expectations.

---

## What we do **not** do

- **Do not** start a full “download all 22 files” automatically on first app open. That conflicts with data/storage best practices and can hurt first-launch experience.
- **Do not** stream long audio when we could play from cache. After Phase 1, we always prefer local file when present and download once then play from cache.

---

## Summary

| Question                    | Answer                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Auto-cache after download?  | Yes. Every download goes to `FileSystem.cacheDirectory/audio/`; playback always uses cache when available. |
| Download ALL on first open? | No. Use download-on-first-play + optional “Download all for offline” with progress and Wi‑Fi-only instead. |
| Solves playback glitches?   | Yes. Long audio (Crystal Bowl, Embodiment) uses “prepare then play” and plays from local file.             |
| App Store safe?             | Yes. User-initiated or on-first-play downloads; optional Wi‑Fi-only; storage visibility and clear cache.   |

**Implementation order:** Phase 1 (auto-cache + prepare-then-play for all long audio) → Phase 4 (storage/clear cache) → Phase 2 (Download all) → Phase 3 (optional preload today) if you want the extra polish.

---

## First 3 minutes auto-download (implemented)

To ensure **no playback issues ever** and smooth somatic experience from the very first second:

- **Head cache:** For each track we can store a “head” file (first ~3 min, ~2.5 MB via HTTP Range). `audioDownload.ts` exposes `downloadAudioHead(url, audioId)`, `getLocalAudioHeadUri(audioId)`, and `getLocalAudioUriOrHead(audioId)`.
- **Playback:** `prepareLongAudioForPlay` (and Crystal Bowl) prefer: full file → head file → download head and play → fallback stream. So the start of every track is always local when possible.
- **Auto preload:** After first paint (`assetsReady`), root layout runs `preloadAllAudioHeads(storage)` once (deferred ~3.5 s). This downloads the first ~3 min of **all** app audio (Crystal Bowl ×7, Tuning Fork ×7, Embodiment ×8) in the background. Entries that already have a head are skipped. Uses existing rate limiting.
- **Result:** By the time the user taps play, the beginning of the track is usually already on device; playback starts instantly with no streaming glitches. If they tap before preload finishes, the first play still runs through `prepareLongAudioForPlay` and downloads the head then plays it (smooth start).
