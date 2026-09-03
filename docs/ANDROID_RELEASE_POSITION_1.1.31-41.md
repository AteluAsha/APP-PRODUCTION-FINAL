# Android release position — 1.1.31 (41)

**Saved:** 2026-09-03  
**Status:** LOCAL AAB — Anua restored + store-update notice

---

## Why 41

Play already has / will have versionCode **40** (1.1.30). This cut is **1.1.31 / 41**.

iOS IPA remains **1.1.27 (36)** at commit `7345912` — parked on ASC. Rebuild iOS from **this same commit** (buildNumber 41) for a true mirror.

---

## What this binary includes beyond 40

- Anua chat restored: Gemini `gemini-3.6-flash`, backup keys skip the iOS-locked primary
- Hub toggle, notes, and quiz Anua entry points on (`ANUA_CHAT_ENABLED`)
- Quiet store-update offering if auto-update did not land (24h grace)
- Heart Day bowl v2 + vault orphan sweep (from 1.1.29 / 45ca358)

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.1.31-41.aab`

```bash
eas submit -p android --profile production --path build-artifacts/SoulSchool-1.1.31-41.aab
```
