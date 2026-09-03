# Android release position — 1.1.30 (40)

**Saved:** 2026-09-03  
**Status:** LOCAL AAB — Anua restored + store-update notice

Play review for the earlier 40 was deleted, so this cut reuses **1.1.30 / versionCode 40**.

---

## Why 40

versionCode **36** is live on Play. **39** was rejected as already used. **40** was pulled from review, so this ship keeps **1.1.30 / 40** with the Anua + notice work.

iOS IPA remains **1.1.27 (36)** at commit `7345912` — parked on ASC. Rebuild iOS from **this same commit** (buildNumber 40) for a true mirror.

---

## What this binary includes

- Anua chat restored: Gemini `gemini-3.6-flash`, backup keys skip the iOS-locked primary
- Hub toggle, notes, and quiz Anua entry points on
- Quiet store-update offering if auto-update did not land (24h grace)
- Heart Day bowl v2 + vault orphan sweep

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.1.30-40.aab`

```bash
eas submit -p android --profile production --path build-artifacts/SoulSchool-1.1.30-40.aab
```
