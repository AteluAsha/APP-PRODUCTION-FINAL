# Android release position — 1.1.27 (37)

**Saved:** 2026-09-02  
**Status:** LOCAL AAB — playback + library auto-open pass

---

## Why 37

versionCode **36** was already produced locally (`SoulSchool-1.1.27-36.aab`). Play rejects a second 36. This cut is **37**.

iOS IPA remains **1.1.27 (36)** at commit `7345912` — parked on ASC agreement. Do not rebuild iOS until App Store Connect access is restored.

---

## What this binary includes beyond 36

- Lock/unlock: re-seek bookmark; `play()` only if native is not already playing
- Resume prefers max(store, bookmark, last known) so a 80ms blip cannot wipe a real place
- `.part` → final swap uses duration-aware resume; music-room keeps the 28-track playlist
- Audio Library opens the player immediately and attaches when the vault is playable
- Sound Bath tuning fork shows Gathering presence while rushing

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.1.27-37.aab`

```bash
eas submit -p android --profile production --path build-artifacts/SoulSchool-1.1.27-37.aab
```
