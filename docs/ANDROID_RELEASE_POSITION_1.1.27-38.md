# Android release position — 1.1.27 (38)

**Saved:** 2026-09-02  
**Status:** LOCAL AAB — audio ship cut for Play + tomorrow's iOS mirror

---

## Why 38

versionCode **36** is live on Play. **37** exists locally (`SoulSchool-1.1.27-37.aab`) but is missing library close-save, iOS seek-wait, inline-fork restart, and remaster duration cache. This cut is **38** from current `main`.

iOS IPA remains **1.1.27 (36)** at commit `7345912` — parked on ASC. Tomorrow rebuild iOS from **this same commit** (buildNumber 38) for a true mirror. Do not submit the old 36 IPA.

---

## What this binary includes beyond 37

- Library close saves bookmark (mini-player place)
- iOS seek waits for native ready (same helper as Android)
- Drop In / Sound Bath tuning fork restart from 0 (chime, no slider)
- Persist remaster file duration so the slider cannot shrink back to a short catalog
- Dead-path cleanup (unused course playback helper, first-load notice, unused download aliases)

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.1.27-38.aab`

```bash
eas submit -p android --profile production --path build-artifacts/SoulSchool-1.1.27-38.aab
```
