# Android release position — 1.1.29 (39)

**Saved:** 2026-09-02  
**Status:** LOCAL AAB — audio ship cut for Play + tomorrow's iOS mirror

---

## Why 39

versionCode **36** is live on Play. **38** exists locally but is missing the shared inline-fork hook, vault-only ready rim, and headset reminder. This cut is **1.1.29 / 39**.

iOS IPA remains **1.1.27 (36)** at commit `7345912` — parked on ASC. Tomorrow rebuild iOS from **this same commit** (buildNumber 39) for a true mirror.

---

## What this binary includes beyond 38

- Drop In + Sound Bath fork share `useInlineTuningFork` (chime, restart from 0)
- Crystal bowl / Master / Asha / library stay on the full player
- Ready rim and downloaded check are vault-only
- Headset reminder on the full player (fade after ~60s; no headphone detection)
- Remaster duration cache + library close-save + iOS seek-wait (from 38)

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.1.29-39.aab`

```bash
eas submit -p android --profile production --path build-artifacts/SoulSchool-1.1.29-39.aab
```
