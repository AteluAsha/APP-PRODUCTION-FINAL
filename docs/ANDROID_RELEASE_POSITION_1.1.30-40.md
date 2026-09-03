# Android release position — 1.1.30 (40)

**Saved:** 2026-09-03  
**Status:** LOCAL AAB — Play rejected versionCode 39; this cut is 40

Same JS as `45ca358` (Heart bowl v2, orphan sweep, player/yoga/orb). Only the store codes changed.

---

## Why 40

Play already has versionCode **39** (or rejected a second 39). This cut is **1.1.30 / 40**.

iOS IPA remains **1.1.27 (36)** at commit `7345912` — parked on ASC. Rebuild iOS from **this same commit** (buildNumber 40) for a true mirror.

---

## What this binary includes

Same product as the 1.1.29 (39) local AAB:

- Heart Day crystal bowl `Day4_CrystalBowl_AwakeningSoul_v2.mp3`
- Vault sync sweeps replaced remasters from `sanctuary-audio/` on iOS and Android
- Drop In + Sound Bath fork share `useInlineTuningFork`
- Ready rim vault-only, headset reminder, remaster duration cache
- Circle-clip chakra orbs, in-flow player face, yoga studio dark surface

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.1.30-40.aab`

```bash
eas submit -p android --profile production --path build-artifacts/SoulSchool-1.1.30-40.aab
```
