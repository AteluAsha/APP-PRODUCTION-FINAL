# Build checkpoint — Soul School 1.1.19 / versionCode 28

**Saved:** 2026-08-30 ~2:55 AM (local)  
**Status:** PAUSED — user restarting Mac before build completes.

---

## Goal

Local Play AAB: **1.1.19** / **versionCode 28**  
Target artifact: `build-artifacts/SoulSchool-1.1.19-28.aab`

---

## Version config (already set — do not change)

| File | Value |
|------|-------|
| `app.config.js` | `version: "1.1.19"`, `versionCode: 28`, iOS `buildNumber: "28"` |
| `package.json` | `"version": "1.1.19"` |

Keystore: remote EAS credentials **gZ9Lce_wS5** (same as prior Play uploads).  
EAS user: `theprofessor1111`

---

## Fixes applied this session (before restart)

1. **`app/_layout.tsx`** — removed duplicate `HealingToastHost` import (was breaking JS bundle).
2. **`.easignore`** — added `build-artifacts/` so EAS shallow clone does not copy ~404MB of old AABs.
3. **Disk cleanup** — removed EAS temp dirs under `/var/folders/.../T/eas-build-local-nodejs` and `eas-cli-nodejs` (~4.6GB freed). Disk was ~99% full (ENOSPC); after cleanup ~6–7GB free.

---

## Build attempts

| # | Result | Notes |
|---|--------|-------|
| 1–2 | Failed | Duplicate `HealingToastHost` in `app/_layout.tsx` |
| 3 | Failed | ENOSPC — disk full during compress |
| 4 | Failed | `git clone ... exited 128` (likely disk; clone works after cleanup) |
| 5 | **IN PROGRESS** when paused | See below |

---

## Exact place when paused (attempt 5)

**Command running:**
```bash
cd /Users/erindinsmore/Desktop/7chakras7days_app
eas build -p android --profile production-local --local --non-interactive
```

**Profile:** `production-local` in `eas.json` (extends `production`, local JAVA_HOME / ANDROID_HOME).

**Completed steps:**
- Remote Android credentials + keystore gZ9Lce_wS5
- Project compress + fingerprint
- `npm ci`
- Prebuild (android cleared and regenerated)
- Credentials injected into build.gradle

**Stopped at:** `[EAGER_BUNDLE]` — Metro bundling Android JS bundle  
Last log line: ~**23.4%** `(169/375)` modules on `node_modules/expo-router/entry.js`

**Still to go after bundle:**
- Gradle `:app:bundleRelease` (longest step)
- Sign AAB
- EAS copies output — copy to `build-artifacts/SoulSchool-1.1.19-28.aab`
- Verify version: `bundletool` or `aapt dump badging` → `versionCode='28'`, `versionName='1.1.19'`

**EAS working dir (will be gone after reboot):**
`/var/folders/ww/dw21m2116dd1x3zdhryghs080000gn/T/eas-build-local-nodejs/2fa6c67a-8da7-45c0-91d7-90e5814225c6`

---

## After restart — resume steps

1. **Do not assume the in-flight build survived.** Reboot kills PID ~46576.
2. Check disk: `df -h /` — want **≥5GB** free before building.
3. Optional clean (if space tight):
   ```bash
   rm -rf /var/folders/*/*/T/eas-build-local-nodejs /var/folders/*/*/T/eas-cli-nodejs
   rm -rf /Users/erindinsmore/Desktop/7chakras7days_app/android/app/build
   ```
4. **Re-run the full build** (no resume API for local EAS):
   ```bash
   cd /Users/erindinsmore/Desktop/7chakras7days_app
   eas build -p android --profile production-local --local --non-interactive
   ```
5. When finished, locate `.aab` in EAS output path (usually printed at end) and:
   ```bash
   cp <path-to-output.aab> build-artifacts/SoulSchool-1.1.19-28.aab
   ```
6. Verify version in the AAB before Play upload.

**Optional speed-up:** `EAS_SKIP_AUTO_FINGERPRINT=1` if fingerprint step is slow (not required).

---

## Uncommitted changes relevant to build

- `.easignore` — `build-artifacts/` added
- `app/_layout.tsx` — duplicate import fix (if not already saved by user)

User did **not** request a git commit.

---

## Tell the agent after reopening Cursor

> Continue local AAB build for Play 1.1.19 v28. Read `BUILD-CHECKPOINT-1.1.19-28.md` and re-run the build from scratch after restart.
