# iOS release position — 1.1.30 (40)

**Saved:** 2026-09-03  
**Status:** BUILDING — same commit as Play 1.1.30 / 40

---

## Why this cut

Play is uploading **1.1.30 / versionCode 40**. iOS must match: marketing **1.1.30**, buildNumber **40**, commit `67ba953`.

The parked IPA **1.1.27 (36)** at `7345912` is stale (no Heart bowl v2, no Anua Gemini 3.6, no store-update notice).

---

## Target binary

| Field | Value |
|-------|-------|
| Version | **1.1.30** |
| Build number | **40** |
| Commit | `67ba953` — `chore(release): keep store codes at 1.1.30 / 40` |
| Profile | `production` |
| Image | `sdk-53` |
| Bundle ID | `com.sevenchakras.SevenChakras` |
| ASC App ID | `6760920862` |

## What this binary includes (same as Play 40)

- Anua on `gemini-3.6-flash` (backup keys skip the iOS-locked primary)
- Quiet store-update offering if auto-update did not land
- Heart Day bowl v2 + vault orphan sweep
- Player / yoga / orb work from the 1.1.29 cut

## Submit

Last iOS submit was blocked on an App Store Connect agreement. After this IPA is ready:

```bash
eas submit -p ios --profile production --latest
```

or Transporter if ASC still rejects EAS submit.
