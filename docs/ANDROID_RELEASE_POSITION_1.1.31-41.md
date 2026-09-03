# Android release position — 1.1.31 (41)

**Saved:** 2026-09-03  
**Status:** LOCAL AAB — Play consumed versionCode 40 even after the review was deleted

---

## Why 41

Play never reuses a versionCode. Deleting the 40 review still left **40 used**. This cut is **1.1.31 / 41**. Same product as the Anua 40 AAB.

iOS tomorrow: rebuild from **this same commit** (buildNumber 41).

---

## What this binary includes

- Anua on `gemini-3.6-flash`; hub toggle / notes / quiz on
- Quiet store-update offering if auto-update did not land
- Heart Day bowl v2 + vault orphan sweep

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.1.31-41.aab`

Upload **this** file, not `SoulSchool-1.1.30-40.aab`.
